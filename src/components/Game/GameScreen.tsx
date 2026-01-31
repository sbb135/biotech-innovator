import React, { useState, useEffect, useRef } from 'react';
import { Board } from '@/components/Board/Board';
import { ResourcePanel } from '@/components/Resources/ResourcePanel';
import { DecisionModal } from '@/components/Modals/DecisionModal';
import { QuestionModal } from '@/components/Modals/QuestionModal';
import { ShadowProgramsSidebar } from '@/components/Game/ShadowProgramsSidebar';
import { ShadowFailureModal } from '@/components/Game/ShadowFailureModal';
import { PolicyScenarioModal } from '@/components/Game/PolicyScenarioModal';
import { getSpaceById } from '@/game/data/spaces';
import { getQuestionForSpace } from '@/game/data/questions';
import { getProgramsFailingAtSpace } from '@/game/data/shadowPrograms';
import { getScenarioForSpace, PolicyChoice } from '@/game/data/policyScenarios';
import { useGame } from '@/context/GameContext';

export const GameScreen: React.FC = () => {
    const { state, dispatch, advanceTurn, canAfford } = useGame();
    const [showQuestion, setShowQuestion] = useState(false);

    // Track when we need to auto-advance after financing
    const [shouldAutoAdvance, setShouldAutoAdvance] = useState(false);
    const prevCapitalRef = useRef(state.capital);

    // Effect to auto-advance after financing decision when capital increases
    useEffect(() => {
        if (shouldAutoAdvance && state.capital > prevCapitalRef.current && !state.pendingDecision) {
            // Capital has increased and decision is cleared - now advance
            setShouldAutoAdvance(false);
            advanceTurn();
        }
        prevCapitalRef.current = state.capital;
    }, [state.capital, state.pendingDecision, shouldAutoAdvance, advanceTurn]);

    // Effect to check for shadow program failures when space changes
    useEffect(() => {
        if (state.currentSpace > 0 && !state.pendingShadowFailure) {
            // Check ALL shadow programs that fail at this space (may be multiple!)
            const failingPrograms = getProgramsFailingAtSpace(state.currentSpace);
            for (const failingProgram of failingPrograms) {
                // Check if this program hasn't already failed
                const programState = state.shadowPrograms.find(sp => sp.program.id === failingProgram.id);
                if (programState && programState.status === 'active') {
                    // Trigger the failure modal for the first active one we find
                    // The next one will be triggered after this modal is dismissed
                    dispatch({ type: 'SET_PENDING_SHADOW_FAILURE', program: failingProgram });
                    break; // Only show one at a time
                }
            }
        }
    }, [state.currentSpace, state.pendingShadowFailure, state.shadowPrograms, dispatch]);

    // Effect to check for policy scenarios when space changes
    useEffect(() => {
        if (state.currentSpace > 0 && !state.pendingPolicyScenario && !state.pendingShadowFailure && !state.pendingDecision) {
            const scenario = getScenarioForSpace(state.currentSpace, state.difficulty);
            if (scenario && !state.completedPolicyScenarios.includes(scenario.id)) {
                // Trigger the policy scenario modal
                dispatch({ type: 'SET_PENDING_POLICY_SCENARIO', scenarioId: scenario.id });
            }
        }
    }, [state.currentSpace, state.pendingPolicyScenario, state.pendingShadowFailure, state.pendingDecision, state.completedPolicyScenarios, state.difficulty, dispatch]);

    const currentSpaceData = getSpaceById(state.currentSpace);
    const nextSpaceData = getSpaceById(state.currentSpace + 1);
    const currentQuestion = nextSpaceData ? getQuestionForSpace(nextSpaceData.id) : undefined;

    const handleQuestionCorrect = () => {
        setShowQuestion(false);
        advanceTurn();
    };

    const handleQuestionClose = () => {
        setShowQuestion(false);
    };

    const handleDecisionChoice = (choiceIndex: number) => {
        const decision = state.pendingDecision;
        if (!decision) return;

        const option = decision.options[choiceIndex];
        const isFinancingDecision = decision.type === 'financing';
        const isGateDecision = decision.type === 'gate';
        const isStayOption = option.label.toLowerCase().includes('skip') ||
            option.label.toLowerCase().includes('wait') ||
            option.label.toLowerCase().includes('stay');

        // Apply effects based on the option chosen
        if (option.capitalChange && option.capitalChange > 0) {
            // Determine financing type from label
            const label = option.label.toLowerCase();

            // Parse dilution percentage from label if present (e.g., "25% dilution")
            let dilutionPercent = 0;
            const dilutionMatch = option.label.match(/(\d+)%\s*dilution/i);
            if (dilutionMatch) {
                dilutionPercent = parseInt(dilutionMatch[1], 10);
            }

            if (label.includes('equity') || dilutionPercent > 0) {
                // Equity financing - affects score and ownership
                dispatch({ type: 'DILUTE', amount: option.capitalChange, dilutionPercent: dilutionPercent || 20 });
            } else if (label.includes('emergency')) {
                dispatch({ type: 'EMERGENCY_FINANCING' });
            } else if (label.includes('debt')) {
                // Venture debt - no dilution, but has cost (interest)
                // The cost is already applied separately, so just add the capital
                dispatch({ type: 'PARTNERSHIP', recoveryAmount: option.capitalChange });
            } else if (label.includes('grant') || label.includes('nih') || label.includes('barda')) {
                // Grants - non-dilutive, no cost
                dispatch({ type: 'PARTNERSHIP', recoveryAmount: option.capitalChange });
            } else if (label.includes('license') || label.includes('partner')) {
                // Licensing/partnership deals
                dispatch({ type: 'PARTNERSHIP', recoveryAmount: option.capitalChange });
            } else {
                // Default to partnership (non-dilutive capital)
                dispatch({ type: 'PARTNERSHIP', recoveryAmount: option.capitalChange });
            }
        }

        // Apply costs (e.g., venture debt interest, study costs)
        if (option.cost && option.cost > 0) {
            dispatch({ type: 'PAY_COST', amount: option.cost });
        }

        if (option.dataChange) {
            const hasPositive = Object.values(option.dataChange).some(v => v && v > 0);
            const hasNegative = Object.values(option.dataChange).some(v => v && v < 0);

            if (hasPositive) {
                const gainTokens: Record<string, number> = {};
                for (const [key, val] of Object.entries(option.dataChange)) {
                    if (val && val > 0) gainTokens[key] = val;
                }
                dispatch({ type: 'GAIN_DATA', tokens: gainTokens });
            }

            if (hasNegative) {
                const loseTokens: Record<string, number> = {};
                for (const [key, val] of Object.entries(option.dataChange)) {
                    if (val && val < 0) loseTokens[key] = Math.abs(val);
                }
                dispatch({ type: 'LOSE_DATA', tokens: loseTokens });
            }
        }

        // Clear the decision
        dispatch({ type: 'CLEAR_PENDING_DECISION' });

        // Handle game-ending choices
        if (option.consequence.toLowerCase().includes('game over') ||
            option.consequence.toLowerCase().includes('game ends') ||
            option.consequence.toLowerCase().includes('shut down')) {
            dispatch({ type: 'GAME_OVER', reason: option.consequence });
            return;
        }

        // Handle gate decisions - player is blocked but hasn't moved yet
        if (isGateDecision) {
            // If they paid for additional studies (has cost and dataChange), auto-advance after data is gained
            if (option.cost && option.dataChange) {
                // Data was already gained above, now try to advance
                setShouldAutoAdvance(true);
            }
            // Otherwise (wait option), just stay at current position - decision is already cleared
            return;
        }

        // After financing decision (not skip), set flag to auto-advance
        // The useEffect will trigger advanceTurn after capital state updates
        if (isFinancingDecision && !isStayOption) {
            setShouldAutoAdvance(true);
        }

        // For skip financing, allow player to try advancing again (stay at current space)
    };

    const handleSpaceClick = (spaceId: number) => {
        // Only allow clicking on the next space to advance
        if (spaceId !== state.currentSpace + 1) {
            console.log('Space clicked:', spaceId, getSpaceById(spaceId));
            return;
        }

        // Don't allow advancing if there's a pending decision
        if (state.pendingDecision) return;
        if (state.status !== 'playing') return;

        // Get the question for this space
        const question = getQuestionForSpace(spaceId);

        if (question) {
            // Show the question modal - must answer correctly to advance
            setShowQuestion(true);
        } else {
            // No question, advance directly
            advanceTurn();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">
                            Pharma<span className="text-primary-light">Pipeline</span>
                        </h1>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                            {state.difficulty} mode
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-sm">
                            <span className="text-gray-400">Turn:</span>
                            <span className="ml-2 font-mono text-white">{state.turnNumber}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-400">Phase:</span>
                            <span className="ml-2 font-medium text-primary-light capitalize">{state.phase}</span>
                        </div>
                        {state.waitTurns > 0 && (
                            <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm">
                                Waiting: {state.waitTurns} turns
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-[1fr_350px] gap-6">
                    {/* Left side - Board */}
                    <div className="space-y-6">
                        {/* Current space info - at top for visibility */}
                        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    {currentSpaceData ? (
                                        <>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Current Position</span>
                                            <h3 className="text-xl font-bold text-white mt-1">{currentSpaceData.name}</h3>
                                            <p className="text-gray-400 mt-2">{currentSpaceData.tooltip.quick}</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Starting Point</span>
                                            <h3 className="text-xl font-bold text-white mt-1">Ready to Begin</h3>
                                            <p className="text-gray-400 mt-2">Click on the first space on the board below to start your drug development journey.</p>
                                        </>
                                    )}
                                </div>

                                {nextSpaceData && (
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500">Next: {nextSpaceData.name}</span>
                                        <span className="block text-lg font-mono text-danger">-${nextSpaceData.cost}M</span>
                                        <p className="text-xs text-primary-light mt-2">Click on board to advance →</p>
                                    </div>
                                )}
                            </div>

                            {/* Affordability warning */}
                            {nextSpaceData && !canAfford(nextSpaceData.cost) && (
                                <div className="mt-4 p-3 bg-danger/20 rounded-lg border border-danger/50">
                                    <p className="text-danger text-sm">
                                        Warning: You cannot afford the next space (${nextSpaceData.cost}M). You'll need to raise capital.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Board
                            currentSpace={state.currentSpace}
                            onSpaceClick={handleSpaceClick}
                        />

                        {/* Educational insights unlocked */}
                        {state.unlockedInsights.length > 0 && (
                            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/30">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>Insights Unlocked</span>
                                </h3>
                                <ul className="space-y-2">
                                    {state.unlockedInsights.slice(-3).map((insight, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                            <span className="text-primary-light">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right side - Resources & Shadow Programs */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
                        <ResourcePanel
                            capital={state.capital}
                            tokens={state.dataTokens}
                            turnNumber={state.turnNumber}
                            phase={state.phase}
                            revenueProjection={state.revenueProjection}
                            totalSpent={state.totalSpent}
                            currentYear={state.currentYear}
                            founderOwnership={state.founderOwnership}
                        />

                        {/* Shadow Programs Sidebar - Only show once in clinical (when 1-in-10 stat applies) */}
                        {(state.phase === 'clinical' || state.phase === 'regulatory') && (
                            <ShadowProgramsSidebar
                                shadowPrograms={state.shadowPrograms}
                                totalFailureCost={state.totalFailureCost}
                                investorConfidence={state.investorConfidence}
                                currentSpace={state.currentSpace}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Decision Modal */}
            {state.pendingDecision && (
                <DecisionModal
                    decision={state.pendingDecision}
                    onChoice={handleDecisionChoice}
                    capital={state.capital}
                />
            )}

            {/* Question Modal */}
            {showQuestion && currentQuestion && nextSpaceData && (
                <QuestionModal
                    question={currentQuestion}
                    spaceName={nextSpaceData.name}
                    onCorrect={handleQuestionCorrect}
                    onClose={handleQuestionClose}
                />
            )}

            {/* Shadow Failure Modal */}
            {state.pendingShadowFailure && (
                <ShadowFailureModal
                    program={state.pendingShadowFailure}
                    onClose={() => {
                        dispatch({ type: 'SHADOW_PROGRAM_FAILED', programId: state.pendingShadowFailure!.id, cost: state.pendingShadowFailure!.costAtFailure });
                        dispatch({ type: 'UPDATE_INVESTOR_CONFIDENCE', delta: -8 });
                        dispatch({ type: 'CLEAR_PENDING_SHADOW_FAILURE' });
                    }}
                />
            )}

            {/* Policy Scenario Modal */}
            {state.pendingPolicyScenario && (() => {
                const scenario = getScenarioForSpace(state.pendingPolicyScenario.triggeredAtSpace, state.difficulty);
                if (!scenario) return null;

                const handlePolicyChoice = (choice: PolicyChoice, _choiceIndex: number) => {
                    // Apply the policy choice effects
                    if (choice.capitalChange) {
                        if (choice.capitalChange > 0) {
                            dispatch({ type: 'PARTNERSHIP', recoveryAmount: choice.capitalChange });
                        } else {
                            dispatch({ type: 'PAY_COST', amount: Math.abs(choice.capitalChange) });
                        }
                    }
                    if (choice.investorConfidenceChange) {
                        dispatch({ type: 'UPDATE_INVESTOR_CONFIDENCE', delta: choice.investorConfidenceChange });
                    }
                    if (choice.revenueMultiplier) {
                        dispatch({ type: 'APPLY_REVENUE_MULTIPLIER', multiplier: choice.revenueMultiplier });
                    }
                    // Record the lesson as an insight
                    if (choice.lessonIfChosen) {
                        dispatch({ type: 'UNLOCK_INSIGHT', insight: choice.lessonIfChosen });
                    }
                    // Mark scenario as completed
                    dispatch({ type: 'COMPLETE_POLICY_SCENARIO', scenarioId: scenario.id });
                };

                return (
                    <PolicyScenarioModal
                        scenario={scenario}
                        onChoice={handlePolicyChoice}
                        capital={state.capital}
                        investorConfidence={state.investorConfidence}
                    />
                );
            })()}
        </div>
    );
};

export default GameScreen;
