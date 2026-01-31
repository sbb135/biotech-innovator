import React, { useState } from 'react';
import { GAME_PATHS } from '@/game/data/paths';
import { GamePath, PathTier } from '@/types/Game.types';
import {
    Pill,
    Dna,
    Heart,
    Brain,
    Microscope,
    FlaskConical,
    Target,
    Sparkles,
    TrendingUp,
    Users,
    Clock,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    Star,
    Zap,
    Shield,
    Activity,
} from 'lucide-react';

interface PathSelectionScreenProps {
    onSelectPath: (pathId: string) => void;
}

// Map path IDs to their icons
const PATH_ICONS: Record<string, React.ReactNode> = {
    'orphan-small-molecule': <Pill className="w-8 h-8 text-cyan-400" />,
    'orphan-biologic': <Dna className="w-8 h-8 text-purple-400" />,
    'blockbuster-small-molecule': <Heart className="w-8 h-8 text-red-400" />,
    'blockbuster-biologic': <Target className="w-8 h-8 text-orange-400" />,
    'firstinclass-small-molecule': <FlaskConical className="w-8 h-8 text-emerald-400" />,
    'firstinclass-biologic': <Microscope className="w-8 h-8 text-blue-400" />,
};

const TIER_ICONS: Record<PathTier, React.ReactNode> = {
    'orphan': <Shield className="w-6 h-6" />,
    'blockbuster': <TrendingUp className="w-6 h-6" />,
    'first-in-class': <Sparkles className="w-6 h-6" />,
};

const TIER_INFO: Record<PathTier, { name: string; description: string; recommended?: boolean }> = {
    'orphan': {
        name: 'ORPHAN DRUG — Rare Disease',
        description: 'Smaller trials, niche market. Good for learning the basics.',
    },
    'blockbuster': {
        name: 'BLOCKBUSTER — Mass Market',
        description: 'Large trials, huge costs, massive market. The classic biotech bet.',
        recommended: true,
    },
    'first-in-class': {
        name: 'FIRST-IN-CLASS — Novel Target',
        description: 'Unproven biology, high uncertainty. Premium pricing if it works.',
    },
};

const PathCard: React.FC<{
    path: GamePath;
    isSelected: boolean;
    onClick: () => void;
}> = ({ path, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
                ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg">
                    {PATH_ICONS[path.id]}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm uppercase tracking-wide">
                        {path.modality === 'small-molecule' ? 'SMALL MOLECULE' : 'BIOLOGIC'}
                    </h4>
                    <p className="text-cyan-300 font-medium">{path.name}</p>
                    <ul className="mt-2 space-y-1">
                        {path.keyPoints.slice(0, 3).map((point, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                                <ChevronRight className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </button>
    );
};

const TierSection: React.FC<{
    tier: PathTier;
    paths: GamePath[];
    onSelectPath: (pathId: string) => void;
}> = ({ tier, paths, onSelectPath }) => {
    const info = TIER_INFO[tier];
    const smallMolecule = paths.find(p => p.modality === 'small-molecule');
    const biologic = paths.find(p => p.modality === 'biologic');

    // Get first path params for tier display
    const params = paths[0]?.parameters;

    return (
        <div className={`rounded-2xl border ${info.recommended ? 'border-cyan-500/50' : 'border-gray-700'} overflow-hidden`}>
            {/* Tier Header */}
            <div className={`px-6 py-4 ${info.recommended ? 'bg-cyan-900/30' : 'bg-gray-800/50'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {TIER_ICONS[tier]}
                            {info.name}
                            {info.recommended && (
                                <span className="text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3" /> RECOMMENDED
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{info.description}</p>
                    </div>
                </div>

                {/* Tier Stats */}
                {params && (
                    <div className="flex gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">Starting:</span>
                            <span className="text-white ml-1 font-mono">${params.startingCapital}M</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">Phase II:</span>
                            <span className="text-white ml-1 font-mono">{Math.round(params.phaseIISuccessRate * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">Market:</span>
                            <span className="text-white ml-1 font-mono">${params.marketPotential / 1000}B</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Path Cards */}
            <div className="p-4 grid grid-cols-2 gap-4">
                {smallMolecule && (
                    <PathCard
                        path={smallMolecule}
                        isSelected={false}
                        onClick={() => onSelectPath(smallMolecule.id)}
                    />
                )}
                {biologic && (
                    <PathCard
                        path={biologic}
                        isSelected={false}
                        onClick={() => onSelectPath(biologic.id)}
                    />
                )}
            </div>
        </div>
    );
};

export const PathSelectionScreen: React.FC<PathSelectionScreenProps> = ({ onSelectPath }) => {
    const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
    const [showingStory, setShowingStory] = useState(false);

    const pathsByTier = {
        orphan: Object.values(GAME_PATHS).filter(p => p.tier === 'orphan'),
        blockbuster: Object.values(GAME_PATHS).filter(p => p.tier === 'blockbuster'),
        'first-in-class': Object.values(GAME_PATHS).filter(p => p.tier === 'first-in-class'),
    };

    const selectedPath = selectedPathId ? GAME_PATHS[selectedPathId] : null;

    // Click a path card -> go directly to story intro
    const handlePathClick = (pathId: string) => {
        setSelectedPathId(pathId);
        setShowingStory(true);
    };

    const handleConfirmStart = () => {
        if (selectedPathId) {
            onSelectPath(selectedPathId);
        }
    };

    // Story intro screen
    if (showingStory && selectedPath) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-gray-900/90 rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-800 rounded-xl">
                                {PATH_ICONS[selectedPath.id]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedPath.name}</h2>
                                <p className="text-cyan-400">{selectedPath.subtitle}</p>
                            </div>
                        </div>

                        {/* Story */}
                        <div className="mb-8 text-gray-300 leading-relaxed">
                            <p className="italic">{selectedPath.story}</p>
                        </div>

                        {/* Key Points */}
                        <div className="mb-8">
                            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                What Makes This Path Unique
                            </h3>
                            <ul className="space-y-2">
                                {selectedPath.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-400">
                                        <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-800/50 rounded-xl">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-cyan-400">
                                    <DollarSign className="w-5 h-5" />
                                    {selectedPath.parameters.startingCapital}M
                                </div>
                                <div className="text-xs text-gray-500">Starting Capital</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-yellow-400">
                                    <Clock className="w-5 h-5" />
                                    {selectedPath.parameters.timelineYears.min}-{selectedPath.parameters.timelineYears.max}y
                                </div>
                                <div className="text-xs text-gray-500">Expected Timeline</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-emerald-400">
                                    <TrendingUp className="w-5 h-5" />
                                    ${selectedPath.parameters.marketPotential / 1000}B
                                </div>
                                <div className="text-xs text-gray-500">Market Potential</div>
                            </div>
                        </div>

                        {/* Social Contract Note */}
                        <div className="mb-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                            <p className="text-sm text-blue-200">
                                <strong>The Deal:</strong> Temporary high prices fund innovation.
                                Then your drug becomes a permanent, affordable resource for humanity when the patent expires.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowingStory(false)}
                                className="flex-1 py-3 px-6 rounded-xl border border-gray-600 text-gray-400 hover:border-gray-500 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Choose Different Path
                            </button>
                            <button
                                onClick={handleConfirmStart}
                                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                            >
                                Begin Journey <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header with Educational Intro */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FlaskConical className="w-10 h-10 text-cyan-400" />
                        <h1 className="text-4xl font-bold text-white">Choose Your Journey</h1>
                    </div>
                    <p className="text-lg text-gray-400 mb-4">
                        Every approved drug tells a unique story of risk, perseverance, and scientific vision
                    </p>

                    {/* Educational Context */}
                    <div className="max-w-3xl mx-auto bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-left">
                        <div className="flex items-start gap-3">
                            <Brain className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                    You're about to experience what it takes to bring a new medicine from discovery to FDA approval.
                                    <span className="text-cyan-400 font-medium"> ~90% of drug programs fail.</span> The few that succeed
                                    must generate enough return to fund all the failures — and the next generation of cures.
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 10-15 years typical
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> $1-3 billion average cost
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> 1000s of scientists and patients
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tier Sections */}
                <div className="space-y-6">
                    <TierSection
                        tier="orphan"
                        paths={pathsByTier.orphan}
                        onSelectPath={handlePathClick}
                    />
                    <TierSection
                        tier="blockbuster"
                        paths={pathsByTier.blockbuster}
                        onSelectPath={handlePathClick}
                    />
                    <TierSection
                        tier="first-in-class"
                        paths={pathsByTier['first-in-class']}
                        onSelectPath={handlePathClick}
                    />
                </div>

            </div>
        </div>
    );
};

export default PathSelectionScreen;
