/**
 * DEFEAT SCREEN
 * 
 * Shows when the company fails (runs out of capital, program killed, etc.)
 * Incorporates key MA Paradox messaging about failure being normal.
 */

import React from 'react';
import { PathGameState } from '@/types/Game.types';
import {
    HeartCrack,
    Clock,
    DollarSign,
    FlaskConical,
    AlertTriangle,
    TrendingUp,
    RefreshCw,
    ArrowRight,
    Lightbulb,
} from 'lucide-react';

interface DefeatScreenProps {
    state: PathGameState;
    onRestart: () => void;
}

export const DefeatScreen: React.FC<DefeatScreenProps> = ({ state, onRestart }) => {
    const pathData = state.pathData;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="bg-gray-900/90 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/20 rounded-full">
                                <HeartCrack className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Program Terminated</h1>
                        <p className="text-red-100">{pathData?.name || 'Drug Development'}</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Reason */}
                        <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/20">
                            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                What Happened
                            </h3>
                            <p className="text-gray-300">{state.defeatReason}</p>
                        </div>

                        {/* Stats at Failure */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-gray-400">
                                    <Clock className="w-5 h-5" />
                                    Year {state.currentYear}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">When Failed</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-gray-400 capitalize">
                                    <FlaskConical className="w-5 h-5" />
                                    {state.currentPhase.replace(/(\d)/, ' $1')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Phase Reached</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-gray-400">
                                    <DollarSign className="w-5 h-5" />
                                    {state.capital}M
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Capital Left</div>
                            </div>
                        </div>

                        {/* The Reality - Key MA Paradox Concept */}
                        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                The Reality of Drug Development
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                <span className="text-white font-medium">~90% of drug programs fail.</span> For every drug that reaches patients,
                                8-12 programs are terminated along the way. This failure is built into the economics of the industry —
                                the few successes must generate enough return to cover all the failures.
                            </p>
                            <p className="text-gray-500 text-sm mt-4 italic">
                                "Failure isn't just common — it's the norm. The challenge is failing fast and learning
                                to invest in the programs most likely to succeed."
                            </p>
                        </div>

                        {/* Economics Insight */}
                        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-200">
                                    <strong>Why this matters:</strong> When voters demand price controls on new medicines,
                                    investors flee — and so do the jobs and the cures. The solution to affordability is
                                    insurance reform to lower out-of-pocket costs, not price controls that kill innovation.
                                </p>
                            </div>
                        </div>

                        {/* Try Again */}
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={onRestart}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                            <p className="text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                The best biotech leaders learn from failure and try again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DefeatScreen;
