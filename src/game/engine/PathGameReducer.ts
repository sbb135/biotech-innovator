/**
 * PATH GAME REDUCER
 * 
 * New reducer for the 6-path success story system.
 * Replaces the old GameReducer with a decision-focused game loop.
 */

import { PathGameState, PathPhase, PathEvent, CompletedEvent } from '@/types/Game.types';
import { GAME_PATHS, FUNDING_ROUND_DEFS } from '@/game/data/paths';
import { getEventsForPhase } from '@/game/data/pathEvents';

// ============================================
// ACTION TYPES
// ============================================

export type PathGameAction =
    | { type: 'SELECT_PATH'; pathId: string }
    | { type: 'ADVANCE_TIME'; quarters: number }
    | { type: 'SPEND_CAPITAL'; amount: number }
    | { type: 'GAIN_CAPITAL'; amount: number }
    | { type: 'SET_PENDING_EVENT'; event: PathEvent }
    | { type: 'RESOLVE_EVENT'; choiceId: string; event: PathEvent }
    | { type: 'COMPLETE_FUNDING_ROUND'; roundId: string; raised: number; dilution: number }
    | { type: 'ADVANCE_PHASE' }
    | { type: 'UPDATE_CONFIDENCE'; delta: number }
    | { type: 'UPDATE_MARKET_POTENTIAL'; multiplier: number }
    | { type: 'GAME_OVER'; reason: string }
    | { type: 'VICTORY' }
    | { type: 'RESET_GAME' };

// ============================================
// INITIAL STATE
// ============================================

export const createInitialPathState = (): PathGameState => ({
    selectedPath: null,
    pathData: null,
    capital: 0,
    burnRate: 5, // Default $5M/quarter
    currentYear: 0,
    currentQuarter: 1,
    currentPhase: 'discovery',
    phaseProgress: 0,
    founderOwnership: 1.0, // 100%
    fundingRoundsCompleted: [],
    investorConfidence: 80, // Start at 80%
    marketPotential: 0,
    pendingEvent: null,
    completedEvents: [],
    eventHistory: [],
    status: 'path-selection',
});

// ============================================
// PHASE PROGRESSION
// ============================================

const PHASE_ORDER: PathPhase[] = ['discovery', 'preclinical', 'phase1', 'phase2', 'phase3', 'approval'];

const getNextPhase = (current: PathPhase): PathPhase | null => {
    const index = PHASE_ORDER.indexOf(current);
    if (index < PHASE_ORDER.length - 1) {
        return PHASE_ORDER[index + 1];
    }
    return null;
};

// Phase duration in years (approximate)
const PHASE_DURATIONS: Record<PathPhase, number> = {
    discovery: 2.5,
    preclinical: 2,
    phase1: 2,
    phase2: 3,
    phase3: 3.5,
    approval: 1,
};

// ============================================
// REDUCER
// ============================================

export const pathGameReducer = (state: PathGameState, action: PathGameAction): PathGameState => {
    switch (action.type) {
        case 'SELECT_PATH': {
            const pathData = GAME_PATHS[action.pathId];
            if (!pathData) return state;

            return {
                ...state,
                selectedPath: action.pathId,
                pathData,
                capital: pathData.parameters.startingCapital,
                marketPotential: pathData.parameters.marketPotential,
                currentYear: 0,
                currentQuarter: 1,
                currentPhase: 'discovery',
                phaseProgress: 0,
                status: 'playing',
            };
        }

        case 'ADVANCE_TIME': {
            let newQuarter = state.currentQuarter + action.quarters;
            let newYear = state.currentYear;

            while (newQuarter > 4) {
                newQuarter -= 4;
                newYear += 1;
            }

            // Burn rate
            const capitalAfterBurn = state.capital - (state.burnRate * action.quarters);

            // Check bankruptcy
            if (capitalAfterBurn <= 0) {
                return {
                    ...state,
                    capital: 0,
                    currentYear: newYear,
                    currentQuarter: newQuarter as 1 | 2 | 3 | 4,
                    status: 'defeat',
                    defeatReason: 'Ran out of capital. The program has been terminated.',
                };
            }

            // Advance phase progress
            const quartersPerPhase = PHASE_DURATIONS[state.currentPhase] * 4;
            const progressPerQuarter = 100 / quartersPerPhase;
            const newProgress = Math.min(100, state.phaseProgress + (progressPerQuarter * action.quarters));

            return {
                ...state,
                capital: capitalAfterBurn,
                currentYear: newYear,
                currentQuarter: newQuarter as 1 | 2 | 3 | 4,
                phaseProgress: newProgress,
            };
        }

        case 'SPEND_CAPITAL': {
            const newCapital = state.capital - action.amount;
            if (newCapital < 0) {
                return {
                    ...state,
                    capital: 0,
                    status: 'defeat',
                    defeatReason: 'Insufficient capital to continue development.',
                };
            }
            return {
                ...state,
                capital: newCapital,
            };
        }

        case 'GAIN_CAPITAL': {
            return {
                ...state,
                capital: state.capital + action.amount,
            };
        }

        case 'SET_PENDING_EVENT': {
            return {
                ...state,
                pendingEvent: action.event,
            };
        }

        case 'RESOLVE_EVENT': {
            const choice = action.event.choices.find(c => c.id === action.choiceId);
            if (!choice) return state;

            // Apply choice effects
            let newCapital = state.capital - choice.cost;
            let newConfidence = state.investorConfidence + (choice.confidence || 0);
            let newMarket = state.marketPotential * (1 + (choice.marketImpact || 0));

            // Time impact (in years, convert to quarters)
            const timeQuarters = Math.round(choice.timeImpact * 4);
            let newYear = state.currentYear;
            let newQuarter = state.currentQuarter + timeQuarters;

            while (newQuarter > 4) {
                newQuarter -= 4;
                newYear += 1;
            }
            while (newQuarter < 1) {
                newQuarter += 4;
                newYear -= 1;
            }

            // Clamp values
            newConfidence = Math.max(0, Math.min(100, newConfidence));

            // Record in history
            const completedEvent: CompletedEvent = {
                eventId: action.event.id,
                choiceId: action.choiceId,
                year: state.currentYear,
                outcome: choice.outcome,
            };

            return {
                ...state,
                capital: newCapital,
                investorConfidence: newConfidence,
                marketPotential: newMarket,
                currentYear: Math.max(0, newYear),
                currentQuarter: newQuarter as 1 | 2 | 3 | 4,
                pendingEvent: null,
                completedEvents: [...state.completedEvents, action.event.id],
                eventHistory: [...state.eventHistory, completedEvent],
            };
        }

        case 'COMPLETE_FUNDING_ROUND': {
            const newOwnership = state.founderOwnership * (1 - action.dilution);

            return {
                ...state,
                capital: state.capital + action.raised,
                founderOwnership: newOwnership,
                fundingRoundsCompleted: [...state.fundingRoundsCompleted, action.roundId],
            };
        }

        case 'ADVANCE_PHASE': {
            const nextPhase = getNextPhase(state.currentPhase);

            if (!nextPhase) {
                // We've completed approval - VICTORY!
                return {
                    ...state,
                    status: 'victory',
                };
            }

            return {
                ...state,
                currentPhase: nextPhase,
                phaseProgress: 0,
            };
        }

        case 'UPDATE_CONFIDENCE': {
            const newConfidence = Math.max(0, Math.min(100, state.investorConfidence + action.delta));
            return {
                ...state,
                investorConfidence: newConfidence,
            };
        }

        case 'UPDATE_MARKET_POTENTIAL': {
            return {
                ...state,
                marketPotential: Math.round(state.marketPotential * action.multiplier),
            };
        }

        case 'GAME_OVER': {
            return {
                ...state,
                status: 'defeat',
                defeatReason: action.reason,
            };
        }

        case 'VICTORY': {
            return {
                ...state,
                status: 'victory',
            };
        }

        case 'RESET_GAME': {
            return createInitialPathState();
        }

        default:
            return state;
    }
};

// ============================================
// GAME LOGIC HELPERS
// ============================================

/**
 * Get a random event for the current phase
 */
export const getRandomEvent = (state: PathGameState): PathEvent | null => {
    if (!state.selectedPath) return null;

    const phaseEvents = getEventsForPhase(state.selectedPath, state.currentPhase);

    // First try unused events
    const availableEvents = phaseEvents.filter(e => !state.completedEvents.includes(e.id));

    if (availableEvents.length > 0) {
        // Random selection from unused events
        const randomIndex = Math.floor(Math.random() * availableEvents.length);
        return availableEvents[randomIndex];
    }

    // If all events used, recycle from the full pool (events repeat but that's better than empty turns)
    if (phaseEvents.length > 0) {
        const randomIndex = Math.floor(Math.random() * phaseEvents.length);
        // Return a copy with modified ID so it can be tracked as a separate instance
        const event = phaseEvents[randomIndex];
        return {
            ...event,
            id: `${event.id}-repeat-${Date.now()}`,
        };
    }

    return null;
};

/**
 * Check if a funding round should trigger
 */
export const shouldTriggerFunding = (state: PathGameState): string | null => {
    if (!state.pathData) return null;

    // Check capital threshold
    const runwayQuarters = state.capital / state.burnRate;

    // If less than 4 quarters runway, need funding
    if (runwayQuarters < 4) {
        // Find next available funding round
        const availableRounds = state.pathData.fundingRounds.filter(
            r => !state.fundingRoundsCompleted.includes(r)
        );

        if (availableRounds.length > 0) {
            return availableRounds[0];
        }
    }

    return null;
};

/**
 * Calculate funding terms based on confidence
 */
export const calculateFundingTerms = (
    roundId: string,
    confidence: number
): { raise: number; dilution: number } => {
    const roundDef = FUNDING_ROUND_DEFS[roundId];
    if (!roundDef) return { raise: 0, dilution: 0 };

    // Confidence affects terms
    const confidenceMultiplier = 0.7 + (confidence / 100) * 0.6; // 0.7 to 1.3

    const avgRaise = (roundDef.typicalRaise.min + roundDef.typicalRaise.max) / 2;
    const avgDilution = (roundDef.dilution.min + roundDef.dilution.max) / 2;

    return {
        raise: Math.round(avgRaise * confidenceMultiplier),
        dilution: avgDilution * (2 - confidenceMultiplier), // Inverse for dilution
    };
};
