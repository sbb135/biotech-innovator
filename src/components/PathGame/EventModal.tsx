/**
 * EVENT MODAL
 * 
 * Shows when a path event triggers.
 * Player must choose how to respond.
 */

import React, { useState } from 'react';
import { PathEvent, EventChoice } from '@/types/Game.types';
import {
    AlertTriangle,
    Sparkles,
    AlertCircle,
    Scale,
    Newspaper,
    DollarSign,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertOctagon,
    Check,
    ChevronRight,
} from 'lucide-react';

interface EventModalProps {
    event: PathEvent;
    capital: number;
    onChoice: (choiceId: string) => void;
}

const getEventTypeColor = (type: string): string => {
    switch (type) {
        case 'setback': return 'from-red-600 to-orange-600';
        case 'opportunity': return 'from-emerald-600 to-cyan-600';
        case 'crisis': return 'from-red-700 to-red-600';
        case 'decision': return 'from-blue-600 to-purple-600';
        case 'news': return 'from-gray-600 to-slate-600';
        default: return 'from-gray-600 to-gray-700';
    }
};

const getEventTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'setback': return <AlertTriangle className="w-6 h-6" />;
        case 'opportunity': return <Sparkles className="w-6 h-6" />;
        case 'crisis': return <AlertOctagon className="w-6 h-6" />;
        case 'decision': return <Scale className="w-6 h-6" />;
        case 'news': return <Newspaper className="w-6 h-6" />;
        default: return <AlertCircle className="w-6 h-6" />;
    }
};

export const EventModal: React.FC<EventModalProps> = ({ event, capital, onChoice }) => {
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);

    const canAfford = (choice: EventChoice): boolean => {
        return capital >= choice.cost;
    };

    const handleConfirm = () => {
        if (selectedChoice) {
            onChoice(selectedChoice);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getEventTypeColor(event.type)} p-6 rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-white/70 mb-1">{event.type}</div>
                            <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Event Description */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
                    </div>

                    {/* Choices */}
                    <div className="space-y-3">
                        <h3 className="text-sm text-gray-500 uppercase tracking-wider">Your Options</h3>

                        {event.choices.map(choice => {
                            const affordable = canAfford(choice);
                            const isSelected = selectedChoice === choice.id;
                            const isHovered = hoveredChoice === choice.id;

                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => affordable && setSelectedChoice(choice.id)}
                                    onMouseEnter={() => setHoveredChoice(choice.id)}
                                    onMouseLeave={() => setHoveredChoice(null)}
                                    disabled={!affordable}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${!affordable
                                        ? 'border-gray-800 bg-gray-800/30 cursor-not-allowed opacity-50'
                                        : isSelected
                                            ? 'border-cyan-400 bg-cyan-400/10'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{choice.text}</p>

                                            {/* Impact Summary */}
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {choice.cost !== 0 && (
                                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${choice.cost > 0 ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                                        <DollarSign className="w-3 h-3" />
                                                        {choice.cost > 0 ? `-${choice.cost}M` : `+${-choice.cost}M`}
                                                    </span>
                                                )}
                                                {choice.timeImpact !== 0 && (
                                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${choice.timeImpact > 0 ? 'bg-orange-900/30 text-orange-400' : 'bg-cyan-900/30 text-cyan-400'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {choice.timeImpact > 0 ? `+${choice.timeImpact} year` : `${choice.timeImpact} year`}
                                                    </span>
                                                )}
                                                {choice.confidence && (
                                                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${choice.confidence > 0 ? 'bg-purple-900/30 text-purple-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                                        {choice.confidence > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {choice.confidence > 0 ? `+${choice.confidence}` : choice.confidence} confidence
                                                    </span>
                                                )}
                                                {choice.riskIncrease && (
                                                    <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        +{Math.round(choice.riskIncrease * 100)}% risk
                                                    </span>
                                                )}
                                            </div>

                                            {/* Outcome Preview (on hover/select) */}
                                            {(isHovered || isSelected) && (
                                                <p className="mt-3 text-sm text-gray-400 italic flex items-start gap-1">
                                                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    {choice.outcome}
                                                </p>
                                            )}
                                        </div>

                                        {/* Selection Indicator */}
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-gray-600'
                                            }`}>
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>

                                    {!affordable && (
                                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Insufficient capital
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedChoice}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${selectedChoice
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {selectedChoice ? (
                            <>
                                <Check className="w-5 h-5" />
                                Confirm Decision
                            </>
                        ) : (
                            'Select an Option'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
