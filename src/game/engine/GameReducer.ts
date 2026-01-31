import { GameState, GameAction, DataTokens, Difficulty, ShadowProgramState } from '@/types/Game.types';
import { DIFFICULTY_SETTINGS } from '@/game/data/balance';
import { SHADOW_PROGRAMS } from '@/game/data/shadowPrograms';
import { getScenarioForSpace } from '@/game/data/policyScenarios';

// Initial empty data tokens
const INITIAL_TOKENS: DataTokens = {
    efficacy: 0,
    safety: 0,
    pkpd: 0,
    cmc: 0,
};

// Initialize shadow programs as all active
const initializeShadowPrograms = (): ShadowProgramState[] => {
    return SHADOW_PROGRAMS.map(program => ({
        program,
        status: 'active' as const,
    }));
};

// Create menu state (before game starts)
export const createMenuState = (): GameState => {
    return {
        capital: 100,
        dataTokens: { ...INITIAL_TOKENS },
        currentSpace: 0,
        turnNumber: 0,
        phase: 'discovery',
        difficulty: 'blockbuster',
        status: 'menu', // Start in menu mode
        revenueProjection: 5000,
        waitTurns: 0,
        cards: {
            riskDeck: [],
            policyDeck: [],
            activeRiskCards: [],
            activePolicyCards: [],
        },
        history: {
            decisions: [],
            financingEvents: [],
            failedPrograms: [],
            spaceVisits: [],
            cardsDrawn: [],
        },
        score: {
            base: 1000,
            bonuses: [],
            penalties: [],
            total: 1000,
        },
        pendingDecision: null,
        unlockedInsights: [],
        // Shadow programs
        shadowPrograms: initializeShadowPrograms(),
        totalFailureCost: 0,
        investorConfidence: 100, // Start at 100%
        pendingShadowFailure: null,
        // Policy scenarios
        pendingPolicyScenario: null,
        completedPolicyScenarios: [],
        // Total spent on THIS program
        totalSpent: 0,
        // Year tracking (BIO 2021 framework)
        currentYear: 0,
        yearHistory: [],
        // Funding tracking (RA Capital framework)
        founderOwnership: 1.0, // 100% at start
        fundingRoundsCompleted: [],
        fundingHistory: [],
        pendingFundingRound: null,
    };
};

// Create initial game state based on difficulty
export const createInitialState = (difficulty: Difficulty): GameState => {
    const settings = DIFFICULTY_SETTINGS[difficulty];

    return {
        capital: settings.startingCapital,
        dataTokens: { ...INITIAL_TOKENS },
        currentSpace: 0, // Start before space 1
        turnNumber: 0,
        phase: 'discovery',
        difficulty,
        status: 'playing', // Game is now playing
        revenueProjection: settings.revenueProjection,
        waitTurns: 0,
        cards: {
            riskDeck: [],
            policyDeck: [],
            activeRiskCards: [],
            activePolicyCards: [],
        },
        history: {
            decisions: [],
            financingEvents: [],
            failedPrograms: [],
            spaceVisits: [],
            cardsDrawn: [],
        },
        score: {
            base: 1000,
            bonuses: [],
            penalties: [],
            total: 1000,
        },
        pendingDecision: null,
        unlockedInsights: [],
        // Shadow programs - the 9 that fail for every 1 that succeeds
        shadowPrograms: initializeShadowPrograms(),
        totalFailureCost: 0,
        investorConfidence: 100, // Start at 100%
        pendingShadowFailure: null,
        // Policy scenarios
        pendingPolicyScenario: null,
        completedPolicyScenarios: [],
        // Total spent on THIS program
        totalSpent: 0,
        // Year tracking (BIO 2021 framework)
        currentYear: 0,
        yearHistory: [],
        // Funding tracking (RA Capital framework)
        founderOwnership: 1.0, // 100% at start
        fundingRoundsCompleted: [],
        fundingHistory: [],
        pendingFundingRound: null,
    };
};

// Helper to determine phase from space number
const getPhaseFromSpace = (spaceId: number): 'discovery' | 'preclinical' | 'clinical' | 'regulatory' => {
    if (spaceId <= 6) return 'discovery';
    if (spaceId <= 11) return 'preclinical';
    if (spaceId <= 18) return 'clinical';
    return 'regulatory';
};

// Main game reducer
export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME': {
            return createInitialState(action.difficulty);
        }

        case 'ADVANCE_SPACE': {
            const nextSpace = state.currentSpace + 1;
            const newPhase = getPhaseFromSpace(nextSpace);

            return {
                ...state,
                currentSpace: nextSpace,
                phase: newPhase,
                turnNumber: state.turnNumber + 1,
                history: {
                    ...state.history,
                    spaceVisits: [...state.history.spaceVisits, nextSpace],
                },
            };
        }

        case 'PAY_COST': {
            const newCapital = state.capital - action.amount;

            // Check for bankruptcy
            if (newCapital <= 0) {
                return {
                    ...state,
                    capital: newCapital,
                    status: 'lost',
                    pendingDecision: {
                        type: 'financing',
                        title: 'BANKRUPTCY',
                        context: `Your capital has fallen to $${newCapital}M. You cannot continue operations.`,
                        options: [
                            {
                                label: 'Emergency Financing (massive dilution)',
                                capitalChange: 100,
                                consequence: 'Gain $100M but reduce final score by 50%',
                            },
                            {
                                label: 'Sell program to Big Pharma',
                                capitalChange: 50,
                                consequence: 'Recover $50M, game ends but you see the analysis',
                            },
                            {
                                label: 'Shut down operations',
                                consequence: 'Game over',
                            },
                        ],
                        isForced: true,
                        educationalNote: 'This is the reality for ~90% of biotech companies. Running out of capital kills more drugs than bad science.',
                    },
                };
            }

            return {
                ...state,
                capital: newCapital,
                totalSpent: state.totalSpent + action.amount, // Track cumulative spending
            };
        }

        case 'GAIN_DATA': {
            const newTokens = { ...state.dataTokens };

            for (const [key, value] of Object.entries(action.tokens)) {
                if (value !== undefined) {
                    newTokens[key as keyof DataTokens] += value;
                }
            }

            return {
                ...state,
                dataTokens: newTokens,
            };
        }

        case 'LOSE_DATA': {
            const newTokens = { ...state.dataTokens };

            for (const [key, value] of Object.entries(action.tokens)) {
                if (value !== undefined) {
                    newTokens[key as keyof DataTokens] = Math.max(0, newTokens[key as keyof DataTokens] - value);
                }
            }

            return {
                ...state,
                dataTokens: newTokens,
            };
        }

        case 'DRAW_RISK_CARD': {
            return {
                ...state,
                cards: {
                    ...state.cards,
                    activeRiskCards: [...state.cards.activeRiskCards, action.card],
                },
                history: {
                    ...state.history,
                    cardsDrawn: [...state.history.cardsDrawn, action.card.id],
                },
            };
        }

        case 'DRAW_POLICY_CARD': {
            return {
                ...state,
                cards: {
                    ...state.cards,
                    activePolicyCards: [...state.cards.activePolicyCards, action.card],
                },
                history: {
                    ...state.history,
                    cardsDrawn: [...state.history.cardsDrawn, action.card.id],
                },
            };
        }

        case 'SET_PENDING_DECISION': {
            return {
                ...state,
                pendingDecision: action.decision,
            };
        }

        case 'CLEAR_PENDING_DECISION': {
            return {
                ...state,
                pendingDecision: null,
            };
        }

        case 'RESOLVE_DECISION': {
            // The decision resolution is handled by the game hook
            // This just clears the pending decision
            return {
                ...state,
                pendingDecision: null,
            };
        }

        case 'DILUTE': {
            const newCapital = state.capital + action.amount;

            return {
                ...state,
                capital: newCapital,
                history: {
                    ...state.history,
                    financingEvents: [
                        ...state.history.financingEvents,
                        {
                            turn: state.turnNumber,
                            type: 'dilution',
                            amount: action.amount,
                            dilutionPercent: action.dilutionPercent,
                        },
                    ],
                },
                score: {
                    ...state.score,
                    penalties: [
                        ...state.score.penalties,
                        {
                            category: 'Dilution',
                            description: `Diluted ${action.dilutionPercent}% for $${action.amount}M`,
                            value: 100,
                        },
                    ],
                },
            };
        }

        case 'EMERGENCY_FINANCING': {
            return {
                ...state,
                capital: state.capital + 100,
                status: 'playing',
                history: {
                    ...state.history,
                    financingEvents: [
                        ...state.history.financingEvents,
                        {
                            turn: state.turnNumber,
                            type: 'emergency',
                            amount: 100,
                            dilutionPercent: 50,
                        },
                    ],
                },
                score: {
                    ...state.score,
                    penalties: [
                        ...state.score.penalties,
                        {
                            category: 'Emergency Financing',
                            description: 'Desperate measures to survive',
                            value: 200,
                        },
                    ],
                },
            };
        }

        case 'PARTNERSHIP': {
            return {
                ...state,
                capital: state.capital + action.recoveryAmount,
                history: {
                    ...state.history,
                    financingEvents: [
                        ...state.history.financingEvents,
                        {
                            turn: state.turnNumber,
                            type: 'partnership',
                            amount: action.recoveryAmount,
                        },
                    ],
                },
            };
        }

        case 'APPLY_REVENUE_MULTIPLIER': {
            const newProjection = Math.round(state.revenueProjection * action.multiplier);

            return {
                ...state,
                revenueProjection: newProjection,
                unlockedInsights: [
                    ...state.unlockedInsights,
                    `Revenue projection changed from $${state.revenueProjection}M to $${newProjection}M (${Math.round((1 - action.multiplier) * 100)}% reduction)`,
                ],
            };
        }

        case 'SET_WAIT_TURNS': {
            return {
                ...state,
                waitTurns: action.turns,
            };
        }

        case 'DECREMENT_WAIT': {
            return {
                ...state,
                waitTurns: Math.max(0, state.waitTurns - 1),
            };
        }

        case 'SET_STATUS': {
            return {
                ...state,
                status: action.status,
            };
        }

        case 'UNLOCK_INSIGHT': {
            if (state.unlockedInsights.includes(action.insight)) {
                return state;
            }

            return {
                ...state,
                unlockedInsights: [...state.unlockedInsights, action.insight],
            };
        }

        case 'RETURN_TO_SPACE': {
            const newPhase = getPhaseFromSpace(action.spaceId);

            return {
                ...state,
                currentSpace: action.spaceId,
                phase: newPhase,
                history: {
                    ...state.history,
                    failedPrograms: [
                        ...state.history.failedPrograms,
                        {
                            turn: state.turnNumber,
                            phase: state.phase,
                            space: state.currentSpace,
                            reason: 'Returned to earlier phase',
                            capitalLost: 0,
                        },
                    ],
                },
            };
        }

        case 'GAME_OVER': {
            return {
                ...state,
                status: 'lost',
                unlockedInsights: [
                    ...state.unlockedInsights,
                    `Game ended: ${action.reason}`,
                ],
            };
        }

        case 'VICTORY': {
            return {
                ...state,
                status: 'won',
                score: calculateFinalScore(state),
            };
        }

        case 'LOAD_GAME': {
            return action.state;
        }

        // ============================================
        // SHADOW PROGRAM ACTIONS
        // ============================================

        case 'SHADOW_PROGRAM_FAILED': {
            return {
                ...state,
                shadowPrograms: state.shadowPrograms.map(sp =>
                    sp.program.id === action.programId
                        ? { ...sp, status: 'failed' as const, failedAtTurn: state.turnNumber }
                        : sp
                ),
                totalFailureCost: state.totalFailureCost + action.cost,
            };
        }

        case 'SET_PENDING_SHADOW_FAILURE': {
            return {
                ...state,
                pendingShadowFailure: action.program,
            };
        }

        case 'CLEAR_PENDING_SHADOW_FAILURE': {
            return {
                ...state,
                pendingShadowFailure: null,
            };
        }

        case 'UPDATE_INVESTOR_CONFIDENCE': {
            const newConfidence = Math.max(0, Math.min(100, state.investorConfidence + action.delta));
            return {
                ...state,
                investorConfidence: newConfidence,
            };
        }

        // ============================================
        // POLICY SCENARIO ACTIONS
        // ============================================

        case 'SET_PENDING_POLICY_SCENARIO': {
            const scenario = getScenarioForSpace(state.currentSpace, state.difficulty);
            if (!scenario || state.completedPolicyScenarios.includes(action.scenarioId)) {
                return state;
            }
            return {
                ...state,
                pendingPolicyScenario: {
                    scenarioId: action.scenarioId,
                    triggeredAtSpace: state.currentSpace,
                },
            };
        }

        case 'CLEAR_PENDING_POLICY_SCENARIO': {
            return {
                ...state,
                pendingPolicyScenario: null,
            };
        }

        case 'COMPLETE_POLICY_SCENARIO': {
            return {
                ...state,
                completedPolicyScenarios: [...state.completedPolicyScenarios, action.scenarioId],
                pendingPolicyScenario: null,
            };
        }

        // ============================================
        // YEAR/TIME TRACKING ACTIONS
        // ============================================

        case 'ADVANCE_TIME': {
            return {
                ...state,
                currentYear: state.currentYear + action.years,
            };
        }

        case 'ADD_YEAR_MILESTONE': {
            return {
                ...state,
                yearHistory: [...state.yearHistory, action.milestone],
            };
        }

        // ============================================
        // FUNDING ROUND ACTIONS
        // ============================================

        case 'SET_PENDING_FUNDING_ROUND': {
            // Don't show funding round if already completed
            if (state.fundingRoundsCompleted.includes(action.round)) {
                return state;
            }
            return {
                ...state,
                pendingFundingRound: action.round,
            };
        }

        case 'CLEAR_PENDING_FUNDING_ROUND': {
            return {
                ...state,
                pendingFundingRound: null,
            };
        }

        case 'COMPLETE_FUNDING_ROUND': {
            const newOwnership = state.founderOwnership * (1 - action.event.dilution);
            return {
                ...state,
                capital: state.capital + action.event.amountRaised,
                founderOwnership: newOwnership,
                fundingRoundsCompleted: [...state.fundingRoundsCompleted, action.event.round],
                fundingHistory: [...state.fundingHistory, action.event],
                pendingFundingRound: null,
                history: {
                    ...state.history,
                    financingEvents: [
                        ...state.history.financingEvents,
                        {
                            turn: state.turnNumber,
                            type: 'series',
                            amount: action.event.amountRaised,
                            note: `${action.event.round} round: $${action.event.amountRaised}M at ${(action.event.dilution * 100).toFixed(0)}% dilution`,
                        },
                    ],
                },
            };
        }

        case 'UPDATE_FOUNDER_OWNERSHIP': {
            return {
                ...state,
                founderOwnership: action.ownership,
            };
        }

        default:
            return state;
    }
};

// Calculate final score
const calculateFinalScore = (state: GameState): typeof state.score => {
    const base = 1000;

    // Time efficiency bonus (faster = better, max 15 years = ~180 turns conceptually)
    const timeBonus = Math.max(0, (50 - state.turnNumber) * 10);

    // Cost efficiency bonus (cheaper = better)
    const totalSpent = state.history.financingEvents.reduce((sum, event) => {
        if (event.type === 'series' || event.type === 'dilution' || event.type === 'emergency') {
            return sum + event.amount;
        }
        return sum;
    }, DIFFICULTY_SETTINGS[state.difficulty].startingCapital) - state.capital;

    const costBonus = Math.max(0, (1000 - totalSpent) * 2);

    // Quality bonus (excess data tokens)
    const excessData =
        Math.max(0, state.dataTokens.efficacy - 8) +
        Math.max(0, state.dataTokens.safety - 6) +
        Math.max(0, state.dataTokens.pkpd - 4) +
        Math.max(0, state.dataTokens.cmc - 4);
    const qualityBonus = excessData * 5;

    // Calculate existing penalties from state
    const existingPenalties = state.score.penalties.reduce((sum, p) => sum + p.value, 0);

    // Add failure penalties
    const failurePenalty = state.history.failedPrograms.length * 80;

    const bonuses: typeof state.score.bonuses = [
        { category: 'Time Efficiency', description: `Completed in ${state.turnNumber} turns`, value: timeBonus },
        { category: 'Cost Efficiency', description: `Total spend: $${totalSpent}M`, value: costBonus },
        { category: 'Data Quality', description: `${excessData} tokens above minimum`, value: qualityBonus },
    ];

    const penalties = [
        ...state.score.penalties,
        ...(failurePenalty > 0 ? [{
            category: 'Failed Programs',
            description: `${state.history.failedPrograms.length} program setbacks`,
            value: failurePenalty,
        }] : []),
    ];

    const total = base + timeBonus + costBonus + qualityBonus - existingPenalties - failurePenalty;

    return {
        base,
        bonuses,
        penalties,
        total: Math.max(0, total),
    };
};
