import React from 'react';
import { ShadowProgram } from '@/types/Game.types';
import { getSpaceById } from '@/game/data/spaces';

interface ShadowFailureModalProps {
    program: ShadowProgram;
    onClose: () => void;
}

/**
 * ShadowFailureModal: Shows the emotional vignette when a parallel program fails.
 * This is the "Drive to Survive" moment - humanizing the cost of drug development.
 */
export const ShadowFailureModal: React.FC<ShadowFailureModalProps> = ({
    program,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-danger/30 animate-fadeIn flex flex-col max-h-[85vh]">
                {/* Header with failure indicator - FIXED */}
                <div className="flex-shrink-0 bg-danger/20 px-6 py-4 border-b border-danger/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-danger/30 flex items-center justify-center">
                            <span className="text-2xl">💔</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Program Failure</h2>
                            <p className="text-sm text-danger">{program.name}</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Scientist info */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                                👨‍🔬
                            </div>
                            <div>
                                <p className="font-medium text-white">{program.scientist}</p>
                                <p className="text-sm text-gray-400 italic">
                                    {program.scientistBackground}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Failure reason */}
                    <div className="bg-danger/10 rounded-xl p-4 border border-danger/20">
                        {(() => {
                            const failureSpace = getSpaceById(program.failureSpace);
                            return failureSpace && (
                                <p className="text-sm text-gray-300 mb-2">
                                    <span className="font-semibold text-amber-400">Failed at: </span>
                                    {failureSpace.name}
                                </p>
                            );
                        })()}
                        <p className="text-sm text-gray-300 mb-2">
                            <span className="font-semibold text-danger">Why it failed: </span>
                            {program.failureReason}
                        </p>
                        <p className="text-sm text-gray-400">
                            <span className="font-semibold">Target: </span>
                            {program.targetDisease}
                        </p>
                    </div>

                    {/* Emotional vignette */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border-l-4 border-primary">
                        <p className="text-gray-300 italic leading-relaxed">
                            "{program.vignette}"
                        </p>
                    </div>

                    {/* Cost callout */}
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
                        <div>
                            <p className="text-xs text-gray-400">Investment Lost</p>
                            <p className="text-2xl font-mono font-bold text-danger">
                                ${program.costAtFailure}M
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Cumulative Attrition</p>
                            <p className="text-sm text-gray-300">
                                ~{program.phaseFailureRate || 65}% of drugs have failed by this point
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer - FIXED */}
                <div className="flex-shrink-0 px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors"
                    >
                        Continue Development
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShadowFailureModal;
