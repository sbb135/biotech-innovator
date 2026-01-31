import React from 'react';
import { GameState } from '@/types/Game.types';
import { DIFFICULTY_SETTINGS, INDUSTRY_STATS } from '@/game/data/balance';
import { getSpaceById } from '@/game/data/spaces';

interface VictoryScreenProps {
    state: GameState;
    onPlayAgain: () => void;
    onViewAnalysis: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
    state,
    onPlayAgain,
    onViewAnalysis,
}) => {
    const startingCapital = DIFFICULTY_SETTINGS[state.difficulty].startingCapital;
    const totalRaised = state.history.financingEvents.reduce((sum, event) => sum + event.amount, 0);
    const totalSpent = startingCapital + totalRaised - state.capital;

    // Calculate investor metrics
    const dilutionEvents = state.history.financingEvents.filter(e => e.type === 'dilution');
    const totalDilution = dilutionEvents.reduce((sum, e) => sum + (e.dilutionPercent || 0), 0);
    const investorOwnership = Math.min(100, totalDilution);
    const founderOwnership = Math.max(0, 100 - investorOwnership);

    // Calculate ROI metrics with ACCURATE operating profit (not gross profit!)
    // Revenue ≠ Profit. After COGS, SG&A, rebates, and taxes, operating margins are 15-30%
    const patentYears = INDUSTRY_STATS.patentLife.min; // Conservative estimate for calculations
    const patentYearsMax = INDUSTRY_STATS.patentLife.max; // For display range
    const annualRevenue = state.revenueProjection / 10;
    const totalPatentRevenue = annualRevenue * patentYears;

    // ACCURATE PROFIT CALCULATION: 50-70% goes to COGS, SG&A, rebates, taxes
    // Only 15-30% operating margin remains
    const operatingMarginLow = INDUSTRY_STATS.operatingMargin.min; // 15%
    const operatingMarginHigh = INDUSTRY_STATS.operatingMargin.max; // 30%
    const operatingProfitLow = totalPatentRevenue * operatingMarginLow;
    const operatingProfitHigh = totalPatentRevenue * operatingMarginHigh;

    // Investor returns based on their ownership share
    const investorReturnLow = operatingProfitLow * (investorOwnership / 100);
    const investorReturnHigh = operatingProfitHigh * (investorOwnership / 100);

    // R&D reinvestment: 18-25% of REVENUE (not profit)
    const rdReinvestmentLow = totalPatentRevenue * INDUSTRY_STATS.rdReinvestmentRate.min;
    const rdReinvestmentHigh = totalPatentRevenue * INDUSTRY_STATS.rdReinvestmentRate.max;

    // Difficulty-specific messaging
    const difficultyInfo = {
        orphan: {
            title: 'Orphan Drug Approved',
            subtitle: 'Hope for Rare Disease Patients',
            tagline: 'Your rare disease drug can now help the small patient population who had no other options.',
            insight: 'Orphan drugs succeed because of the Orphan Drug Act incentives: tax credits, fee waivers, and 7 years of market exclusivity.',
        },
        blockbuster: {
            title: 'Blockbuster Drug Approved',
            subtitle: 'Reaching Millions of Patients',
            tagline: 'Your drug can now treat a massive patient population—but faces intense pricing pressure from PBMs and the IRA.',
            insight: 'Blockbuster drugs generate the revenues that fund the entire R&D ecosystem, but face the most policy headwinds.',
        },
        firstInClass: {
            title: 'First-in-Class Drug Approved',
            subtitle: 'A New Mechanism Validated',
            tagline: 'Your novel mechanism is now proven. You\'ve opened a new therapeutic pathway for future innovation.',
            insight: 'First-in-class drugs carry the highest scientific risk but often become the foundation for entire drug classes.',
        },
    };

    const modeInfo = difficultyInfo[state.difficulty];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="relative z-10 max-w-4xl w-full py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-sm text-primary-light uppercase tracking-wider mb-2">{state.difficulty} Mode</div>
                    <div className="text-5xl mb-4 font-bold text-success">FDA APPROVED</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {modeInfo.subtitle}
                    </h1>
                    <p className="text-lg text-gray-400">
                        {modeInfo.tagline}
                    </p>
                </div>

                {/* THE BIG PICTURE - Investment Summary */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">
                        The Investment Required to Save Lives
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-danger/10 rounded-xl border border-danger/30">
                            <span className="text-4xl font-mono text-danger">${totalSpent}M</span>
                            <p className="text-sm text-gray-400 mt-2">Total Capital Spent</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Wouters (JAMA 2020) Risk-Adjusted: ${INDUSTRY_STATS.averageCostToApproval}M (includes failures)
                            </p>
                        </div>
                        <div className="text-center p-4 bg-warning/10 rounded-xl border border-warning/30">
                            <span className="text-4xl font-mono text-warning">{state.turnNumber} turns</span>
                            <p className="text-sm text-gray-400 mt-2">Development Time</p>
                            <p className="text-xs text-gray-500 mt-1">
                                ~{Math.round(state.turnNumber / 4)} years (avg: 10-15 years)
                            </p>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/30">
                            <span className="text-4xl font-mono text-primary-light">${totalRaised}M</span>
                            <p className="text-sm text-gray-400 mt-2">Capital Raised from Investors</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Beyond your starting ${startingCapital}M
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                        <p className="text-gray-300">
                            <span className="text-white font-semibold">Key Insight:</span> Without investors willing to risk ${totalRaised}M,
                            this drug would never have been developed.
                            <span className="text-primary-light"> 90% of drug candidates fail</span>, making this one of the riskiest investments in any industry.
                        </p>
                    </div>
                </div>

                {/* THE 9 THAT FAILED - Shadow Programs */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                        The Real Cost: 9 Failures for Every 1 Success
                    </h3>

                    <p className="text-gray-400 text-center mb-6">
                        While you developed your drug, 9 parallel programs failed. Their costs are why the industry average is ${INDUSTRY_STATS.averageCostToApproval}M per approval.
                    </p>

                    {/* Failed programs grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {state.shadowPrograms.filter(sp => sp.status === 'failed').map((sp) => {
                            const failureSpace = getSpaceById(sp.program.failureSpace);
                            return (
                                <div key={sp.program.id} className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-red-400 text-xs font-medium">FAILED</span>
                                    </div>
                                    <p className="text-white text-sm font-medium truncate">{sp.program.name}</p>
                                    <p className="text-gray-500 text-xs truncate">{sp.program.targetDisease}</p>
                                    {failureSpace && (
                                        <p className="text-amber-400 text-xs mt-1">Failed at: {failureSpace.name}</p>
                                    )}
                                    <p className="text-red-400 text-sm font-mono mt-1">-${sp.program.costAtFailure}M</p>
                                </div>
                            );
                        })}
                        {/* Your successful program */}
                        <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-400 text-xs font-medium">SUCCESS</span>
                            </div>
                            <p className="text-white text-sm font-medium">Your Drug</p>
                            <p className="text-gray-500 text-xs">Approved!</p>
                            <p className="text-green-400 text-sm font-mono mt-1">${totalSpent}M</p>
                        </div>
                    </div>

                    {/* The Portfolio Math */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4 text-center">The Portfolio Math</h4>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
                            <div className="bg-red-900/30 px-4 py-3 rounded-lg border border-red-500/30">
                                <span className="text-2xl font-mono text-red-400">${state.totalFailureCost}M</span>
                                <p className="text-xs text-gray-500">9 failed programs</p>
                                <p className="text-xs text-gray-600">(avg ~${INDUSTRY_STATS.averageFailedProgramCost}M each)</p>
                            </div>
                            <span className="text-2xl text-gray-500">+</span>
                            <div className="bg-green-900/30 px-4 py-3 rounded-lg border border-green-500/30">
                                <span className="text-2xl font-mono text-green-400">${totalSpent}M</span>
                                <p className="text-xs text-gray-500">Your success</p>
                            </div>
                            <span className="text-2xl text-gray-500">=</span>
                            <div className="bg-purple-900/30 px-4 py-3 rounded-lg border border-purple-500/30">
                                <span className="text-2xl font-mono text-purple-400">${state.totalFailureCost + totalSpent}M</span>
                                <p className="text-xs text-gray-500">Total portfolio cost</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm text-center mt-4">
                            Industry benchmark: <span className="text-white font-semibold">${INDUSTRY_STATS.averageCostToApproval / 1000}B</span> per approved drug
                            {' '}(includes failures + cost of capital over 10–15 years)
                        </p>
                    </div>
                </div>
                {/* WHO FUNDED THE RISK */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6">Who Funded the Risk?</h3>

                    {/* Capital & Ownership Table */}
                    <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Capital & Ownership</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left text-gray-400 pb-2"></th>
                                        <th className="text-center text-gray-400 pb-2">At Founding</th>
                                        <th className="text-center text-gray-400 pb-2">At Approval</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-700">
                                        <td className="text-white py-2">Founders + Employees</td>
                                        <td className="text-center text-success py-2">~30% (IP, expertise, time)</td>
                                        <td className="text-center text-success py-2">~{founderOwnership}%</td>
                                    </tr>
                                    <tr>
                                        <td className="text-white py-2">Investors (VC/Public)</td>
                                        <td className="text-center text-gray-400 py-2">~70% (100% of cash)</td>
                                        <td className="text-center text-gray-400 py-2">~{investorOwnership}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            In biotech, investors fund nearly all the capital from Day 1. Founders contribute IP and expertise—not cash. Each financing round dilutes earlier holders over the ~10-year journey.
                        </p>
                    </div>

                    {/* Investor Returns - ACCURATE */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Why Investors Take This Risk</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Projected Net Revenue ({patentYears} yrs)</span>
                                <span className="text-white font-mono">${totalPatentRevenue}M</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Less: COGS, SG&A, rebates, taxes</span>
                                <span className="text-danger font-mono">(~50–70% of revenue)</span>
                            </div>
                            <div className="border-t border-gray-600 pt-2 flex justify-between">
                                <span className="text-white font-medium">Operating Profit (estimate)</span>
                                <span className="text-success font-mono">~${Math.round(operatingProfitLow)}–{Math.round(operatingProfitHigh)}M</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Investor Share (~{investorOwnership}%)</span>
                                <span className="text-primary-light font-mono">~${Math.round(investorReturnLow)}–{Math.round(investorReturnHigh)}M</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Investors need sufficient returns from the ~1 in 10 successes to offset the losses from 9 failed programs in every portfolio.
                        </p>
                    </div>
                </div>

                {/* THE VIRTUOUS CYCLE OF R&D */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6">The Virtuous Cycle of R&D</h3>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                            <p className="text-sm text-gray-400">Revenue</p>
                            <p className="text-2xl font-mono text-white">${totalPatentRevenue}M</p>
                        </div>
                        <div className="text-2xl text-gray-500">→</div>
                        <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/30">
                            <p className="text-sm text-primary-light">Reinvested in R&D (~{Math.round(INDUSTRY_STATS.rdReinvestmentRate.min * 100)}–{Math.round(INDUSTRY_STATS.rdReinvestmentRate.max * 100)}%)</p>
                            <p className="text-2xl font-mono text-white">~${Math.round(rdReinvestmentLow)}–{Math.round(rdReinvestmentHigh)}M</p>
                        </div>
                        <div className="text-2xl text-gray-500">→</div>
                        <div className="text-center p-4 bg-success/10 rounded-xl border border-success/30">
                            <p className="text-sm text-success">Future Drug Candidates</p>
                            <p className="text-2xl font-mono text-white">{Math.max(1, Math.floor(rdReinvestmentLow / 500))}+ more</p>
                        </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-4">
                        <p className="text-gray-300 text-center">
                            <span className="text-white font-semibold">This is why profits matter:</span> Pharma companies reinvest
                            <span className="text-primary-light"> {Math.round(INDUSTRY_STATS.rdReinvestmentRate.min * 100)}–{Math.round(INDUSTRY_STATS.rdReinvestmentRate.max * 100)}% of revenue</span> into R&D.
                            Without profitable drugs, there is no funding for tomorrow's cures.
                        </p>
                    </div>
                </div>

                {/* THE PATENT BARGAIN */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">The Patent Bargain: Temporary Exclusivity → Permanent Public Good</h3>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-green-500" style={{ width: '100%' }} />
                        </div>
                        <span className="text-sm text-gray-400">~{patentYears}–{patentYearsMax} years of exclusivity</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                            <span className="text-sm text-primary-light font-medium">During Exclusivity (~{patentYears}–{patentYearsMax} years)</span>
                            <p className="text-2xl font-mono text-white mt-2">${annualRevenue}M/year</p>
                            <p className="text-xs text-gray-400 mt-1">Generates ROI + funds future R&D</p>
                        </div>
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                            <span className="text-sm text-green-400 font-medium">After Generic Entry (Ongoing)</span>
                            <p className="text-2xl font-mono text-white mt-2">{Math.round(INDUSTRY_STATS.genericPriceDrop.min * 100)}–{Math.round(INDUSTRY_STATS.genericPriceDrop.max * 100)}% Price Drop</p>
                            <p className="text-xs text-gray-400 mt-1">Affordable access for patients, permanently</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Society "pays off a mortgage" on this breakthrough. Unlike hospitals (which never go generic), medicines become cheap forever.
                    </p>
                </div>

                {/* FINAL LESSON */}
                <div className="bg-gradient-to-r from-primary/20 to-success/20 rounded-2xl p-8 border border-primary/30 mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">What You Just Learned</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-light mt-2 flex-shrink-0"></div>
                            <p className="text-gray-300">
                                <span className="text-white font-medium">High prices during patent period</span> are necessary to
                                generate ROI on $2.6B+ development costs and fund future R&D.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-light mt-2 flex-shrink-0"></div>
                            <p className="text-gray-300">
                                <span className="text-white font-medium">Investors take enormous risk</span> because 90% of drugs
                                fail. They need returns from successes to offset losses.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></div>
                            <p className="text-gray-300">
                                <span className="text-white font-medium">Patents are temporary</span> (12-20 years), but the
                                medicines they create become permanent public goods as generics.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></div>
                            <p className="text-gray-300">
                                <span className="text-white font-medium">Without economic incentives</span>, investors wouldn't
                                fund drug development, and new medicines would never reach patients.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Difficulty-Specific Insight */}
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-primary-light mb-3">
                        💡 {state.difficulty === 'orphan' ? 'Orphan Drug' : state.difficulty === 'blockbuster' ? 'Blockbuster' : 'First-in-Class'} Insight
                    </h3>
                    <p className="text-gray-300">{modeInfo.insight}</p>
                    {state.difficulty === 'orphan' && (
                        <p className="text-sm text-gray-400 mt-3">
                            Before the 1983 Orphan Drug Act, only 38 orphan drugs existed. Since then, over 600 have been approved.
                        </p>
                    )}
                    {state.difficulty === 'blockbuster' && (
                        <p className="text-sm text-gray-400 mt-3">
                            The top 10 blockbuster drugs generate ~$100B/year in revenue, funding future R&D across the industry.
                        </p>
                    )}
                    {state.difficulty === 'firstInClass' && (
                        <p className="text-sm text-gray-400 mt-3">
                            First-in-class drugs have lower Phase II success rates (~25%) due to novel mechanism uncertainty, but higher rewards.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={onViewAnalysis}
                        className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all"
                    >
                        View Full Analysis
                    </button>
                    <button
                        onClick={onPlayAgain}
                        className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VictoryScreen;
