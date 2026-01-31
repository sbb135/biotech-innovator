/**
 * VICTORY SCREEN
 * 
 * Shows when player successfully gets FDA approval.
 * Displays path-specific victory metrics and social contract lessons.
 */

import React from 'react';
import { PathGameState } from '@/types/Game.types';
import {
    Trophy,
    Users,
    Clock,
    DollarSign,
    Percent,
    MessageSquare,
    Heart,
    ArrowRight,
    CheckCircle,
    Sparkles,
    TrendingUp,
    Award,
} from 'lucide-react';

interface VictoryScreenProps {
    state: PathGameState;
    onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ state, onRestart }) => {
    const pathData = state.pathData;
    if (!pathData) return null;

    const totalRaised = state.fundingRoundsCompleted.length * 50; // Simplified

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-emerald-900/20 to-gray-900 flex items-center justify-center p-8">
            <div className="max-w-3xl w-full">
                <div className="bg-gray-900/90 rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/20 rounded-full">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">FDA APPROVAL</h1>
                        <p className="text-emerald-100 text-xl">{pathData.name}</p>
                    </div>

                    {/* Journey Stats */}
                    <div className="p-8 space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                <Award className="w-6 h-6 text-emerald-400" />
                                Your Journey
                            </h2>
                            <p className="text-gray-400">You successfully brought a new treatment to patients</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-3xl font-mono font-bold text-cyan-400">
                                    <Clock className="w-6 h-6" />
                                    {state.currentYear}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Years</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-3xl font-mono font-bold text-emerald-400">
                                    <DollarSign className="w-6 h-6" />
                                    {totalRaised}M
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Total Raised</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-3xl font-mono font-bold text-yellow-400">
                                    <Percent className="w-6 h-6" />
                                    {(state.founderOwnership * 100).toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Final Ownership</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-3xl font-mono font-bold text-purple-400">
                                    <MessageSquare className="w-6 h-6" />
                                    {state.eventHistory.length}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Key Decisions</div>
                            </div>
                        </div>

                        {/* Patient Impact */}
                        <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-500/20">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                Patient Impact
                            </h3>
                            <p className="text-gray-300 leading-relaxed">{pathData.victoryMetrics.patientImpact}</p>
                            <p className="text-gray-400 text-sm mt-3 italic flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Approximately {pathData.parameters.patientPopulation.toLocaleString()} patients now have access to your treatment.
                            </p>
                        </div>

                        {/* The Social Contract - Key MA Paradox Concept */}
                        <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                The Biotech Social Contract
                            </h3>
                            <p className="text-gray-300 leading-relaxed">{pathData.victoryMetrics.socialContract}</p>
                            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                                <p className="text-sm text-gray-400 italic">
                                    "This is the deal: Temporary high prices fund innovation.
                                    Then the drug becomes a permanent, affordable resource for humanity.
                                    <span className="text-blue-400 font-medium"> Proper insurance makes medicines affordable NOW
                                        by capping out-of-pocket costs.</span>"
                                </p>
                            </div>
                        </div>

                        {/* Key Points Learned */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                What Made This Path Unique
                            </h3>
                            <ul className="space-y-2">
                                {pathData.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400">
                                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Play Again */}
                        <div className="pt-4">
                            <button
                                onClick={onRestart}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                            >
                                Try a Different Path <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VictoryScreen;
