/**
 * PHASE STRIP COMPONENT
 *
 * Visual pipeline showing all drug development stages
 * Based on: Discovery → Preclinical → Clinical → Regulatory
 */

import React from 'react';
import {
    Target,
    Beaker,
    FlaskConical,
    FileText,
    MousePointer2,
    Syringe,
    Users,
    ClipboardList,
    FileCheck,
    BadgeCheck,
    ChevronRight,
} from 'lucide-react';

// Define the pipeline stages matching the user's reference
const PIPELINE_STAGES = [
    {
        id: 'discovery',
        name: 'Discovery',
        color: 'from-purple-600 to-purple-500',
        bgColor: 'bg-purple-900/30',
        borderColor: 'border-purple-500/50',
        textColor: 'text-purple-400',
        steps: [
            { id: 'target-id', name: 'Target ID & Validation', icon: Target },
            { id: 'assay-dev', name: 'Assay Development', icon: Beaker },
            { id: 'hts', name: 'High-Throughput Screen', icon: FlaskConical },
            { id: 'hit-validation', name: 'Hit-to-Lead', icon: Target },
            { id: 'lead-opt', name: 'Lead Optimization', icon: FlaskConical },
            { id: 'candidate', name: 'Candidate Selection', icon: BadgeCheck },
        ],
    },
    {
        id: 'preclinical',
        name: 'Preclinical',
        color: 'from-orange-600 to-orange-500',
        bgColor: 'bg-orange-900/30',
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-400',
        steps: [
            { id: 'dmpk', name: 'In Vivo PK/PD Studies', icon: MousePointer2 },
            { id: 'exp-tox', name: 'Exploratory Toxicology', icon: MousePointer2 },
            { id: 'glp-tox', name: 'GLP Tox (IND-enabling)', icon: ClipboardList },
            { id: 'cmc', name: 'CMC & Formulation', icon: FlaskConical },
            { id: 'ind-filing', name: 'IND Filing', icon: FileText },
        ],
    },
    {
        id: 'clinical',
        name: 'Clinical',
        color: 'from-cyan-600 to-cyan-500',
        bgColor: 'bg-cyan-900/30',
        borderColor: 'border-cyan-500/50',
        textColor: 'text-cyan-400',
        steps: [
            { id: 'phase1', name: 'Phase I (SAD/MAD)', icon: Users },
            { id: 'phase1b', name: 'Phase Ib (if needed)', icon: Users },
            { id: 'phase2a', name: 'Phase IIa Proof-of-Concept', icon: Syringe },
            { id: 'phase2b', name: 'Phase IIb Dose-Finding', icon: Syringe },
            { id: 'phase3', name: 'Phase III Pivotal Trials', icon: ClipboardList },
        ],
    },
    {
        id: 'regulatory',
        name: 'Regulatory & Launch',
        color: 'from-emerald-600 to-emerald-500',
        bgColor: 'bg-emerald-900/30',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-400',
        steps: [
            { id: 'nda', name: 'NDA/BLA Submission', icon: FileText },
            { id: 'review', name: 'FDA Review Clock Start', icon: ClipboardList },
            { id: 'adcom', name: 'Advisory Committee', icon: Users },
            { id: 'labeling', name: 'Labeling & REMS', icon: FileCheck },
            { id: 'approval', name: 'FDA Approval & Launch', icon: BadgeCheck },
        ],
    },
];

// Map game phases to pipeline stages
const PHASE_TO_STAGE: Record<string, { stageId: string; stepIndex: number }> = {
    discovery: { stageId: 'discovery', stepIndex: 3 },
    preclinical: { stageId: 'preclinical', stepIndex: 2 },
    phase1: { stageId: 'clinical', stepIndex: 1 },
    phase2: { stageId: 'clinical', stepIndex: 3 },
    phase3: { stageId: 'clinical', stepIndex: 4 },
    approval: { stageId: 'regulatory', stepIndex: 3 },
};

interface PhaseStripProps {
    currentPhase: string;
    phaseProgress: number;
}

export const PhaseStrip: React.FC<PhaseStripProps> = ({ currentPhase, phaseProgress }) => {
    const currentLocation = PHASE_TO_STAGE[currentPhase] || { stageId: 'discovery', stepIndex: 0 };

    const isStageComplete = (stageId: string) => {
        const stageOrder = ['discovery', 'preclinical', 'clinical', 'regulatory'];
        const currentStageIdx = stageOrder.indexOf(currentLocation.stageId);
        const checkStageIdx = stageOrder.indexOf(stageId);
        return checkStageIdx < currentStageIdx;
    };

    const isCurrentStage = (stageId: string) => stageId === currentLocation.stageId;

    const isStepComplete = (stageId: string, stepIndex: number) => {
        if (isStageComplete(stageId)) return true;
        if (!isCurrentStage(stageId)) return false;
        return stepIndex < currentLocation.stepIndex ||
            (stepIndex === currentLocation.stepIndex && phaseProgress >= 100);
    };

    const isCurrentStep = (stageId: string, stepIndex: number) => {
        return isCurrentStage(stageId) && stepIndex === currentLocation.stepIndex;
    };

    return (
        <div className="space-y-3">
            {/* Pipeline Overview */}
            <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                {PIPELINE_STAGES.map((stage, idx) => (
                    <React.Fragment key={stage.id}>
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isStageComplete(stage.id)
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isCurrentStage(stage.id)
                                    ? `${stage.bgColor} ${stage.textColor} border ${stage.borderColor}`
                                    : 'bg-gray-700/30 text-gray-500'
                                }`}
                        >
                            {isStageComplete(stage.id) && <BadgeCheck className="w-4 h-4" />}
                            <span>{stage.name}</span>
                        </div>
                        {idx < PIPELINE_STAGES.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Current Stage Detail Strip */}
            {PIPELINE_STAGES.filter(s => isCurrentStage(s.id)).map(stage => (
                <div
                    key={stage.id}
                    className={`${stage.bgColor} rounded-xl p-4 border ${stage.borderColor}`}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${stage.textColor}`}>
                            {stage.name} Phase
                        </h3>
                        <span className="text-xs text-gray-500">
                            — Step {currentLocation.stepIndex + 1} of {stage.steps.length}
                        </span>
                    </div>

                    {/* Steps Strip */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                        {stage.steps.map((step, stepIdx) => {
                            const Icon = step.icon;
                            const isComplete = isStepComplete(stage.id, stepIdx);
                            const isCurrent = isCurrentStep(stage.id, stepIdx);

                            return (
                                <React.Fragment key={step.id}>
                                    <div
                                        className={`flex flex-col items-center min-w-[100px] p-2 rounded-lg transition-all ${isCurrent
                                            ? `bg-gradient-to-b ${stage.color} text-white shadow-lg`
                                            : isComplete
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-gray-700/30 text-gray-500'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] text-center leading-tight">
                                            {step.name}
                                        </span>
                                        {isCurrent && (
                                            <div className="w-full mt-1.5 h-1 bg-black/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white/50 transition-all"
                                                    style={{ width: `${phaseProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {stepIdx < stage.steps.length - 1 && (
                                        <ChevronRight
                                            className={`w-3 h-3 flex-shrink-0 ${isComplete ? 'text-emerald-400' : 'text-gray-600'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhaseStrip;
