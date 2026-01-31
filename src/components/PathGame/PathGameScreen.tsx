/**
 * PATH GAME SCREEN
 * 
 * Main game interface for the 6-path success story system.
 * Shows: Resources, Year, Phase, Events/Decisions
 */

import React, { useReducer, useState } from 'react';
import { pathGameReducer, createInitialPathState, getRandomEvent, shouldTriggerFunding } from '@/game/engine/PathGameReducer';
import { PathSelectionScreen } from '@/components/PathSelection/PathSelectionScreen';
import { EventModal } from '@/components/PathGame/EventModal';
import { FundingModal } from '@/components/PathGame/FundingModal';
import { VictoryScreen } from '@/components/PathGame/VictoryScreen';
import { DefeatScreen } from '@/components/PathGame/DefeatScreen';
import { PhaseStrip } from '@/components/PathGame/PhaseStrip';
import { Pill, Dna, Heart, Target, FlaskConical, Microscope } from 'lucide-react';

// Helper to render path icons from string names
const getPathIcon = (iconName: string | undefined) => {
    const iconClass = "w-8 h-8";
    switch (iconName) {
        case 'pill': return <Pill className={iconClass} />;
        case 'dna': return <Dna className={iconClass} />;
        case 'heart': return <Heart className={iconClass} />;
        case 'target': return <Target className={iconClass} />;
        case 'flask': return <FlaskConical className={iconClass} />;
        case 'microscope': return <Microscope className={iconClass} />;
        default: return <FlaskConical className={iconClass} />;
    }
};


export const PathGameScreen: React.FC = () => {
    const [state, dispatch] = useReducer(pathGameReducer, createInitialPathState());
    const [showFunding, setShowFunding] = useState<string | null>(null);

    // Handle path selection
    const handleSelectPath = (pathId: string) => {
        dispatch({ type: 'SELECT_PATH', pathId });
    };

    // Advance game turn
    const advanceTurn = () => {
        if (state.status !== 'playing') return;

        // Check for funding need first (priority)
        const fundingRound = shouldTriggerFunding(state);
        if (fundingRound && !showFunding) {
            setShowFunding(fundingRound);
            return;
        }

        // Check phase completion - triggers before advancing
        if (state.phaseProgress >= 100) {
            dispatch({ type: 'ADVANCE_PHASE' });
            // Get a phase transition event
            const event = getRandomEvent(state);
            if (event) {
                dispatch({ type: 'SET_PENDING_EVENT', event });
            }
            return;
        }

        // Advance time
        dispatch({ type: 'ADVANCE_TIME', quarters: 1 });

        // GUARANTEED event on every advancement for engagement
        if (!state.pendingEvent) {
            const event = getRandomEvent(state);
            if (event) {
                dispatch({ type: 'SET_PENDING_EVENT', event });
            }
        }
    };

    // Handle event resolution
    const handleEventChoice = (choiceId: string) => {
        if (state.pendingEvent) {
            dispatch({ type: 'RESOLVE_EVENT', choiceId, event: state.pendingEvent });
        }
    };

    // Handle funding completion
    const handleFundingComplete = (roundId: string, raised: number, dilution: number) => {
        dispatch({ type: 'COMPLETE_FUNDING_ROUND', roundId, raised, dilution });
        setShowFunding(null);
    };

    // Path selection
    if (state.status === 'path-selection') {
        return <PathSelectionScreen onSelectPath={handleSelectPath} />;
    }

    // Victory
    if (state.status === 'victory') {
        return <VictoryScreen state={state} onRestart={() => dispatch({ type: 'RESET_GAME' })} />;
    }

    // Defeat
    if (state.status === 'defeat') {
        return <DefeatScreen state={state} onRestart={() => dispatch({ type: 'RESET_GAME' })} />;
    }

    // Main game view
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-cyan-400">
                                {getPathIcon(state.pathData?.icon)}
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">{state.pathData?.name}</h1>
                                <p className="text-sm text-gray-400">{state.pathData?.subtitle}</p>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-cyan-400">Year {state.currentYear}</div>
                                <div className="text-xs text-gray-500">Q{state.currentQuarter}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-emerald-400">${state.capital}M</div>
                                <div className="text-xs text-gray-500">Capital</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-purple-400">{state.investorConfidence}%</div>
                                <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-8">
                    {/* Left: Phase Progress */}
                    <div className="col-span-2 space-y-6">
                        {/* Phase Strip Pipeline */}
                        <PhaseStrip
                            currentPhase={state.currentPhase}
                            phaseProgress={state.phaseProgress}
                        />

                        {/* Advance Button */}
                        <button
                            onClick={advanceTurn}
                            disabled={!!state.pendingEvent || !!showFunding}
                            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${state.pendingEvent || showFunding
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
                                }`}
                        >
                            {state.pendingEvent ? 'Resolve Event First' : showFunding ? 'Complete Funding Round' : 'Advance Development →'}
                        </button>

                        {/* Event History */}
                        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Recent Events</h3>
                            {state.eventHistory.length === 0 ? (
                                <p className="text-gray-600 text-sm">No events yet. Advance development to continue your journey.</p>
                            ) : (
                                <div className="space-y-2">
                                    {state.eventHistory.slice(-5).reverse().map((event, i) => (
                                        <div key={i} className="text-sm">
                                            <span className="text-gray-500">Year {event.year}:</span>
                                            <span className="text-gray-300 ml-2">{event.outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Resources & Info */}
                    <div className="space-y-6">
                        {/* Runway */}
                        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Cash Runway</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-bold text-white">
                                    {(state.capital / state.burnRate).toFixed(1)}
                                </span>
                                <span className="text-gray-400">quarters</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Burn rate: ${state.burnRate}M/quarter</p>

                            {/* Warning */}
                            {(state.capital / state.burnRate) < 4 && (
                                <div className="mt-3 p-2 bg-red-900/30 rounded-lg border border-red-500/30">
                                    <p className="text-red-400 text-xs">⚠️ Low runway! Consider raising funds.</p>
                                </div>
                            )}
                        </div>

                        {/* Funding Rounds */}
                        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Funding Journey</h3>
                            <div className="space-y-2">
                                {state.pathData?.fundingRounds.map(roundId => {
                                    const completed = state.fundingRoundsCompleted.includes(roundId);
                                    return (
                                        <div key={roundId} className={`flex items-center gap-2 text-sm ${completed ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            <span>{completed ? '✓' : '○'}</span>
                                            <span className="capitalize">{roundId.replace(/([A-Z])/g, ' $1')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Market Info */}
                        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Market Potential</h3>
                            <div className="text-2xl font-mono font-bold text-emerald-400">
                                ${(state.marketPotential / 1000).toFixed(1)}B
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                ~{state.pathData?.parameters.patientPopulation.toLocaleString()} patients
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Event Modal */}
            {state.pendingEvent && (
                <EventModal
                    event={state.pendingEvent}
                    capital={state.capital}
                    onChoice={handleEventChoice}
                />
            )}

            {/* Funding Modal */}
            {showFunding && (
                <FundingModal
                    roundId={showFunding}
                    confidence={state.investorConfidence}
                    onComplete={(raised, dilution) => handleFundingComplete(showFunding, raised, dilution)}
                    onSkip={() => setShowFunding(null)}
                />
            )}
        </div>
    );
};

export default PathGameScreen;
