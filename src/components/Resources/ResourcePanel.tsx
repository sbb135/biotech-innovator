import React from 'react';
import { CapitalMeter } from './CapitalMeter';
// DataTokens are still tracked in the background but hidden from UI
// import { DataTokensDisplay } from './DataTokens';
// import { DataTokens } from '@/types/Game.types';
// import { GATE_REQUIREMENTS } from '@/game/data/balance';

interface ResourcePanelProps {
    capital: number;
    // tokens still passed but not displayed
    tokens: unknown;
    turnNumber: number;
    phase: string;
    revenueProjection: number;
    totalSpent: number;
    // New: Year and ownership tracking
    currentYear: number;
    founderOwnership: number;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
    capital,
    // tokens, // Hidden from UI but still tracked
    turnNumber,
    phase,
    revenueProjection,
    totalSpent,
    currentYear,
    founderOwnership,
}) => {

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white">Company Status</h2>
                    <p className="text-sm text-gray-400">
                        Turn {turnNumber} • {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 block">Projected Revenue</span>
                    <span className="font-mono text-lg text-primary-light">${revenueProjection}M</span>
                </div>
            </div>

            {/* Year & Ownership Row (NEW) */}
            <div className="grid grid-cols-2 gap-3">
                {/* Year Counter */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <span className="text-xs text-gray-400 uppercase tracking-wider block">Development Year</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-bold text-cyan-400">Year {currentYear.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">Industry avg: 10.5 years</span>
                </div>

                {/* Founder Ownership */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <span className="text-xs text-gray-400 uppercase tracking-wider block">Founder Ownership</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-mono font-bold ${founderOwnership > 0.3 ? 'text-emerald-400' : founderOwnership > 0.15 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {(founderOwnership * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 mt-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${founderOwnership > 0.3 ? 'bg-emerald-500' : founderOwnership > 0.15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${founderOwnership * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* TOTAL SPENT - Prominent Display */}
            <div className="bg-gradient-to-r from-danger/20 to-warning/20 rounded-xl p-4 border border-danger/30">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Total Invested</span>
                        <div className="text-2xl font-mono font-bold text-white">${totalSpent}M</div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500">Industry Avg for Approval</span>
                        <div className="text-sm font-mono text-gray-400">$2,600M</div>
                        <div className="w-full h-1.5 mt-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-danger to-warning transition-all duration-500"
                                style={{ width: `${Math.min(100, (totalSpent / 2600) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Capital Meter */}
            <CapitalMeter current={capital} />

            {/* Phase Costs Warning */}
            {phase === 'clinical' && capital < 250 && (
                <div className="bg-warning/10 rounded-lg p-3 border border-warning/30">
                    <p className="text-warning text-sm">
                        Note: Phase III trials cost $250M+ each. Consider raising capital.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResourcePanel;
