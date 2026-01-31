/**
 * FUNDING MODAL
 * 
 * Shows when the company needs to raise capital.
 * Player negotiates terms.
 */

import React, { useState } from 'react';
import { FUNDING_ROUND_DEFS } from '@/game/data/paths';
import { calculateFundingTerms } from '@/game/engine/PathGameReducer';
import {
    Wallet,
    DollarSign,
    Percent,
    TrendingUp,
    Check,
    Handshake,
    SkipForward,
    Lightbulb,
    Target,
} from 'lucide-react';

interface FundingModalProps {
    roundId: string;
    confidence: number;
    onComplete: (raised: number, dilution: number) => void;
    onSkip: () => void;
}

export const FundingModal: React.FC<FundingModalProps> = ({
    roundId,
    confidence,
    onComplete,
    onSkip,
}) => {
    const [selectedOption, setSelectedOption] = useState<'accept' | 'negotiate' | 'skip' | null>(null);

    const roundDef = FUNDING_ROUND_DEFS[roundId];
    const terms = calculateFundingTerms(roundId, confidence);

    if (!roundDef) return null;

    // Negotiated terms (less money, less dilution)
    const negotiatedRaise = Math.round(terms.raise * 0.7);
    const negotiatedDilution = terms.dilution * 0.85;

    const handleAccept = () => {
        onComplete(terms.raise, terms.dilution);
    };

    const handleNegotiate = () => {
        onComplete(negotiatedRaise, negotiatedDilution);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{roundDef.name}</h2>
                            <p className="text-emerald-100">{roundDef.description}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* What Investors Want */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            What Investors Want to See
                        </h3>
                        <p className="text-white">{roundDef.investorExpectation}</p>
                    </div>

                    {/* Term Sheet */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-emerald-500/20">
                        <h3 className="text-lg font-semibold text-emerald-400 mb-4">Proposed Terms</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Raise Amount
                                </span>
                                <div className="text-2xl font-mono font-bold text-white">${terms.raise}M</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                    <Percent className="w-3 h-3" />
                                    Dilution
                                </span>
                                <div className="text-2xl font-mono font-bold text-yellow-400">{(terms.dilution * 100).toFixed(1)}%</div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Investor Target Return
                                </span>
                                <div className="text-lg font-mono text-gray-300">{roundDef.targetMultiple}</div>
                            </div>
                        </div>
                    </div>

                    {/* Confidence Impact Note */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Your investor confidence ({confidence}%) affects terms:</span>
                        {confidence >= 80 ? (
                            <span className="text-emerald-400 font-medium">Favorable</span>
                        ) : confidence >= 50 ? (
                            <span className="text-yellow-400 font-medium">Standard</span>
                        ) : (
                            <span className="text-red-400 font-medium">Unfavorable</span>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <button
                            onClick={handleAccept}
                            onMouseEnter={() => setSelectedOption('accept')}
                            onMouseLeave={() => setSelectedOption(null)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 'accept'
                                ? 'border-emerald-400 bg-emerald-400/10'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-white">Accept Terms</span>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Raise ${terms.raise}M for {(terms.dilution * 100).toFixed(1)}% dilution
                                    </p>
                                </div>
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Check className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleNegotiate}
                            onMouseEnter={() => setSelectedOption('negotiate')}
                            onMouseLeave={() => setSelectedOption(null)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 'negotiate'
                                ? 'border-yellow-400 bg-yellow-400/10'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-white">Negotiate Harder</span>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Less dilution ({(negotiatedDilution * 100).toFixed(1)}%) but smaller raise (${negotiatedRaise}M)
                                    </p>
                                </div>
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Handshake className="w-6 h-6 text-yellow-400" />
                                </div>
                            </div>
                        </button>

                        {roundId !== 'seed' && (
                            <button
                                onClick={onSkip}
                                onMouseEnter={() => setSelectedOption('skip')}
                                onMouseLeave={() => setSelectedOption(null)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 'skip'
                                    ? 'border-red-400 bg-red-400/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-white">Skip This Round</span>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Preserve ownership but risk running out of capital
                                        </p>
                                    </div>
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <SkipForward className="w-6 h-6 text-red-400" />
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Educational Note - MA Paradox Insight */}
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-200">
                                <strong>Insight:</strong> Early investors need higher returns (10×+) because most startups fail.
                                Late-stage investors accept lower returns (2-3×) because the risk is lower.
                                <span className="text-blue-300 block mt-2">
                                    This is why threatening price controls scares investors away —
                                    if returns are capped, the math doesn't work for the risky bets that lead to cures.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundingModal;
