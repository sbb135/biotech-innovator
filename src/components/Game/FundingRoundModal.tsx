import React, { useState } from 'react';
import { FUNDING_ROUNDS } from '@/game/data/balance';
import { FundingEvent } from '@/types/Game.types';

interface FundingRoundModalProps {
    roundKey: string;
    currentYear: number;
    investorConfidence: number;
    onComplete: (event: FundingEvent) => void;
    onSkip?: () => void;
}

export const FundingRoundModal: React.FC<FundingRoundModalProps> = ({
    roundKey,
    currentYear,
    investorConfidence,
    onComplete,
    onSkip,
}) => {
    const round = FUNDING_ROUNDS[roundKey as keyof typeof FUNDING_ROUNDS];

    if (!round) return null;

    // Calculate raise amount based on investor confidence
    const confidenceMultiplier = 0.7 + (investorConfidence / 100) * 0.6; // 0.7 to 1.3
    const avgRaise = (round.typicalRaise.min + round.typicalRaise.max) / 2;
    const adjustedRaise = Math.round(avgRaise * confidenceMultiplier);

    // Dilution is inverse - worse confidence = more dilution
    const avgDilution = (round.dilution.min + round.dilution.max) / 2;
    const adjustedDilution = avgDilution * (2 - confidenceMultiplier); // Higher dilution if confidence is low

    // Pre-money valuation implied
    const preMoney = Math.round(adjustedRaise / adjustedDilution - adjustedRaise);

    const [selectedOption, setSelectedOption] = useState<'accept' | 'negotiate' | 'skip' | null>(null);

    const handleAccept = () => {
        onComplete({
            round: round.name,
            year: currentYear,
            amountRaised: adjustedRaise,
            dilution: adjustedDilution,
            preMoneyValuation: preMoney,
            investorExpectation: round.investorExpectation,
        });
    };

    const handleNegotiate = () => {
        // Negotiate: less dilution but also less money
        const negotiatedRaise = Math.round(adjustedRaise * 0.7);
        const negotiatedDilution = adjustedDilution * 0.85;
        const negotiatedPreMoney = Math.round(negotiatedRaise / negotiatedDilution - negotiatedRaise);

        onComplete({
            round: round.name,
            year: currentYear,
            amountRaised: negotiatedRaise,
            dilution: negotiatedDilution,
            preMoneyValuation: negotiatedPreMoney,
            investorExpectation: round.investorExpectation,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{round.name} Round</h2>
                            <p className="text-cyan-100">Investors are ready to fund your next stage</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Investor Expectations */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Investors Want to See</h3>
                        <p className="text-white">{round.investorExpectation}</p>
                    </div>

                    {/* Term Sheet */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-cyan-500/20">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Term Sheet</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase">Amount</span>
                                <div className="text-2xl font-mono font-bold text-white">${adjustedRaise}M</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase">Dilution</span>
                                <div className="text-2xl font-mono font-bold text-yellow-400">{(adjustedDilution * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase">Pre-Money Valuation</span>
                                <div className="text-xl font-mono text-gray-300">${preMoney}M</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase">Investor Target</span>
                                <div className="text-xl font-mono text-gray-300">{round.targetMultiple} / {round.targetIRR}</div>
                            </div>
                        </div>
                    </div>

                    {/* Confidence Impact */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Your investor confidence ({investorConfidence}%) affects terms:</span>
                        {investorConfidence >= 80 ? (
                            <span className="text-emerald-400">Favorable terms</span>
                        ) : investorConfidence >= 50 ? (
                            <span className="text-yellow-400">Standard terms</span>
                        ) : (
                            <span className="text-red-400">Unfavorable terms</span>
                        )}
                    </div>

                    {/* Decision Options */}
                    <div className="space-y-3">
                        <button
                            onClick={handleAccept}
                            onMouseEnter={() => setSelectedOption('accept')}
                            onMouseLeave={() => setSelectedOption(null)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === 'accept'
                                    ? 'border-cyan-400 bg-cyan-400/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-white">Accept Terms</span>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Raise ${adjustedRaise}M for {(adjustedDilution * 100).toFixed(1)}% dilution
                                    </p>
                                </div>
                                <span className="text-2xl">✅</span>
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
                                        Less dilution ({(adjustedDilution * 0.85 * 100).toFixed(1)}%) but smaller raise (${Math.round(adjustedRaise * 0.7)}M)
                                    </p>
                                </div>
                                <span className="text-2xl">🤝</span>
                            </div>
                        </button>

                        {onSkip && roundKey !== 'seed' && (
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
                                    <span className="text-2xl">⏭️</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Educational Note */}
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                        <p className="text-sm text-blue-200">
                            <strong>RA Capital Insight:</strong> "Investors have different return expectations by stage. Seed investors need 10-100× returns because most startups fail. Late-stage investors accept 2-3× because the risk is lower."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundingRoundModal;
