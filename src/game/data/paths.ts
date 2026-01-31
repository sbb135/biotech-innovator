/**
 * GAME PATHS - Complete Pharma Pipeline Simulation
 *
 * 6 paths based on real drug development stories:
 * - TIER 1 (Orphan): Rare Neurological Disease (SM), Spinal Muscular Atrophy (Bio)
 * - TIER 2 (Blockbuster): Cardiovascular/Statin (SM), Cancer Immunotherapy/PD-1 (Bio)
 * - TIER 3 (First-in-Class): CML/Imatinib (SM), First Checkpoint Inhibitor (Bio)
 */

import { GamePath, FundingRoundDef } from '@/types/Game.types';

// ============================================
// FUNDING ROUND DEFINITIONS
// ============================================

export const FUNDING_ROUND_DEFS: Record<string, FundingRoundDef> = {
    seed: {
        id: 'seed',
        name: 'Seed',
        description: 'Early validation funding',
        typicalRaise: { min: 5, max: 15 },
        dilution: { min: 0.15, max: 0.25 },
        investorExpectation: 'Prove target engaged',
        targetMultiple: '10x',
    },
    foundation: {
        id: 'foundation',
        name: 'Foundation Grant',
        description: 'Non-dilutive funding from patient foundation',
        typicalRaise: { min: 3, max: 10 },
        dilution: { min: 0, max: 0 },
        investorExpectation: 'Scientific promise',
        targetMultiple: 'N/A',
    },
    seriesA: {
        id: 'seriesA',
        name: 'Series A',
        description: 'IND-enabling studies',
        typicalRaise: { min: 30, max: 60 },
        dilution: { min: 0.25, max: 0.35 },
        investorExpectation: 'Clear IND path',
        targetMultiple: '5-7x',
    },
    seriesB: {
        id: 'seriesB',
        name: 'Series B',
        description: 'Clinical development',
        typicalRaise: { min: 60, max: 120 },
        dilution: { min: 0.20, max: 0.28 },
        investorExpectation: 'Clinical proof-of-concept',
        targetMultiple: '3-5x',
    },
    seriesC: {
        id: 'seriesC',
        name: 'Series C',
        description: 'Pivotal trials',
        typicalRaise: { min: 100, max: 250 },
        dilution: { min: 0.15, max: 0.22 },
        investorExpectation: 'Approval likely',
        targetMultiple: '2-3x',
    },
    crossover: {
        id: 'crossover',
        name: 'Crossover/Pre-IPO',
        description: 'Pre-approval capital',
        typicalRaise: { min: 150, max: 300 },
        dilution: { min: 0.10, max: 0.15 },
        investorExpectation: 'Near-term approval',
        targetMultiple: '1.5-2x',
    },
    partnership: {
        id: 'partnership',
        name: 'Partnership',
        description: 'Strategic partner funding',
        typicalRaise: { min: 50, max: 200 },
        dilution: { min: 0, max: 0.10 },
        investorExpectation: 'Strategic value',
        targetMultiple: 'Royalties',
    },
    ipo: {
        id: 'ipo',
        name: 'IPO',
        description: 'Public market financing',
        typicalRaise: { min: 150, max: 500 },
        dilution: { min: 0.12, max: 0.18 },
        investorExpectation: 'Clear path to profitability',
        targetMultiple: '1.5-2x',
    },
};

// ============================================
// GAME PATHS
// ============================================

export const GAME_PATHS: Record<string, GamePath> = {
    // ========================================
    // TIER 1: ORPHAN DRUG / RARE DISEASE
    // ========================================

    'orphan-small-molecule': {
        id: 'orphan-small-molecule',
        tier: 'orphan',
        modality: 'small-molecule',
        name: 'Rare Neurological Disease',
        subtitle: 'Oral treatment for genetic muscle wasting disease',
        icon: 'pill',
        story: `A genetic disease causes the body to lose the ability to make a critical protein for nerve cells. Babies with the most severe form rarely survive past age 2. A biologic injection already exists, but it requires painful spinal injections every 4 months for life. Your company has discovered a small molecule that patients could take as a daily liquid or pill. Can you bring an easier treatment option to these families?`,
        keyPoints: [
            'Competing against existing biologic (spinal injections)',
            'Oral delivery = major convenience advantage',
            'Orphan Drug Act: 7 years market exclusivity',
            'Tax credits cover 25% of clinical trial costs',
            'Priority Review pathway (6 months vs 12)',
            'IRA pill penalty: Only 9 years before Medicare negotiation',
        ],
        parameters: {
            startingCapital: 80,
            phaseIISuccessRate: 0.40,
            phaseIIICostMultiplier: 0.65,
            marketPotential: 2000,
            patientPopulation: 25000,
            timelineYears: { min: 12, max: 17 },
        },
        fundingRounds: ['seed', 'seriesA', 'seriesB', 'seriesC', 'crossover'],
        victoryMetrics: {
            developmentTime: 14.2,
            totalRaised: 343,
            founderOwnership: 0.33,
            patientImpact: 'Patients who can now take a daily liquid instead of spinal injections every 4 months: ~25,000 worldwide',
            socialContract: 'Year 1 price: $340,000/year. After exclusivity: Generic competition expected.',
        },
    },

    'orphan-biologic': {
        id: 'orphan-biologic',
        tier: 'orphan',
        modality: 'biologic',
        name: 'Spinal Muscular Atrophy',
        subtitle: 'First-ever treatment for fatal infant disease',
        icon: 'dna',
        story: `Spinal muscular atrophy is the leading genetic cause of infant death. Babies born with the most severe form rarely survive past age 2. There is NO treatment. A patient foundation has spent 30 years funding research, and scientists have finally discovered a way to teach the body to make the missing protein. Your company has licensed this technology from a university. Can you bring the first-ever treatment to these families?`,
        keyPoints: [
            'NO existing treatment - first-ever therapy',
            'Venture philanthropy model (foundation + biotech)',
            'Antisense oligonucleotide technology',
            'Intrathecal delivery (spinal injection)',
            'Complex manufacturing justifies high price',
            '12 years regulatory exclusivity for biologics',
        ],
        parameters: {
            startingCapital: 80,
            phaseIISuccessRate: 0.40,
            phaseIIICostMultiplier: 0.70,
            marketPotential: 2000,
            patientPopulation: 25000,
            timelineYears: { min: 15, max: 21 },
        },
        fundingRounds: ['foundation', 'seriesA', 'seriesB', 'partnership', 'ipo'],
        victoryMetrics: {
            developmentTime: 21,
            totalRaised: 400,
            founderOwnership: 0.44,
            patientImpact: '51% of treated infants achieved motor milestones vs. 0% untreated. Some children expected to die are now walking.',
            socialContract: 'Price: $750,000 first year, $375,000/year ongoing. The alternative was no treatment.',
        },
    },

    // ========================================
    // TIER 2: BLOCKBUSTER / MASS MARKET
    // ========================================

    'blockbuster-small-molecule': {
        id: 'blockbuster-small-molecule',
        tier: 'blockbuster',
        modality: 'small-molecule',
        name: 'Cardiovascular Disease',
        subtitle: 'Cholesterol-lowering pill for millions',
        icon: 'heart',
        story: `Heart disease is the #1 killer in the developed world. Scientists have proven that lowering "bad" cholesterol reduces heart attacks. Four competing drugs are already on the market. Your company has synthesized a new compound that appears more potent than anything available - but you would be the FIFTH drug to market. Management is debating: Kill the program, or bet the company that being best matters more than being first?`,
        keyPoints: [
            'Entering established market (#5 to market)',
            'Clinical differentiation is essential',
            'Massive outcomes trials ($200-350M)',
            '50+ million patients in US alone',
            'Direct-to-consumer advertising enabled',
            'IRA pill penalty: Only 9 years before Medicare negotiation',
        ],
        parameters: {
            startingCapital: 150,
            phaseIISuccessRate: 0.35,
            phaseIIICostMultiplier: 2.50,
            marketPotential: 8000,
            patientPopulation: 50000000,
            timelineYears: { min: 12, max: 18 },
        },
        fundingRounds: ['seriesA', 'seriesB', 'seriesC', 'partnership'],
        victoryMetrics: {
            developmentTime: 15,
            totalRaised: 850,
            founderOwnership: 0.042,
            patientImpact: 'Tens of millions of patients. Heart attack risk reduced by 36%. Average LDL dropped from 150 to 70.',
            socialContract: 'Branded: $5/day. After patent: Generic at $0.10/day - 94% reduction. Now on WHO Essential Medicines List.',
        },
    },

    'blockbuster-biologic': {
        id: 'blockbuster-biologic',
        tier: 'blockbuster',
        modality: 'biologic',
        name: 'Cancer Immunotherapy',
        subtitle: 'Immune checkpoint inhibitor - worlds top-selling drug',
        icon: 'target',
        story: `An academic scientist has discovered that cancer cells hide from the immune system by pressing a "brake pedal" on T-cells. Your company has created an antibody that releases this brake. But immunotherapy for cancer has failed for decades - investors are skeptical. A competitor just proved the concept works with a different target. Now it is a race. Can you reach patients before they do?`,
        keyPoints: [
            'Racing against competitor with validated concept',
            'Platform potential: one drug, 40+ cancer types',
            'Durable responses - some patients effectively cured',
            'Autoimmune toxicity management required',
            'Breakthrough Therapy designation likely',
            '12 years exclusivity before biosimilar competition',
        ],
        parameters: {
            startingCapital: 150,
            phaseIISuccessRate: 0.35,
            phaseIIICostMultiplier: 3.00,
            marketPotential: 8000,
            patientPopulation: 1000000,
            timelineYears: { min: 12, max: 18 },
        },
        fundingRounds: ['seriesA', 'seriesB', 'seriesC', 'ipo'],
        victoryMetrics: {
            developmentTime: 16,
            totalRaised: 880,
            founderOwnership: 0.12,
            patientImpact: '40+ indications. Peak sales: $29.5B/year. Some terminal patients now cancer-free for 10+ years.',
            socialContract: 'Price: $150,000+/year. Value: Lives extended by years, not months. Some effectively CURED.',
        },
    },

    // ========================================
    // TIER 3: FIRST-IN-CLASS / NOVEL TARGET
    // ========================================

    'firstinclass-small-molecule': {
        id: 'firstinclass-small-molecule',
        tier: 'first-in-class',
        modality: 'small-molecule',
        name: 'Blood Cancer - Targeted Therapy',
        subtitle: 'First "magic bullet" - proving cancer can be targeted',
        icon: 'flask',
        story: `For 30 years, scientists have known that a genetic accident - two chromosomes swapping pieces - causes a deadly blood cancer. This creates a mutant enzyme that tells cells to multiply uncontrollably. Your company has designed a small molecule to block ONLY this mutant enzyme, leaving normal cells alone. No one has ever successfully targeted cancer this precisely. If it works, it could change everything. If it fails, you will have wasted a decade.`,
        keyPoints: [
            'First-ever molecularly targeted cancer therapy',
            '100% response rate in Phase I (unprecedented)',
            'Resistance mutations emerge over time',
            'Paradigm shift: precision medicine born',
            'WHO Essential Medicines List after patent expires',
            'IRA pill penalty: Only 9 years before Medicare negotiation',
        ],
        parameters: {
            startingCapital: 100,
            phaseIISuccessRate: 0.25,
            phaseIIICostMultiplier: 1.50,
            marketPotential: 6000,
            patientPopulation: 30000,
            timelineYears: { min: 15, max: 20 },
        },
        fundingRounds: ['seed', 'seriesA', 'seriesB', 'seriesC', 'ipo'],
        victoryMetrics: {
            developmentTime: 32,
            totalRaised: 530,
            founderOwnership: 0.31,
            patientImpact: '5-year survival: 89% (was 30%). Most patients take a pill daily, live normal lives.',
            socialContract: 'Year 1: $26K/year. Year 20: Generic <$1K/year globally. Now WHO Essential Medicine.',
        },
    },

    'firstinclass-biologic': {
        id: 'firstinclass-biologic',
        tier: 'first-in-class',
        modality: 'biologic',
        name: 'First Checkpoint Inhibitor',
        subtitle: 'Proving immunotherapy can work in cancer',
        icon: 'microscope',
        story: `For a century, scientists have dreamed of harnessing the immune system to fight cancer. Every attempt has failed. An academic researcher has discovered that cancer cells press a "brake pedal" on immune cells to hide from attack. Your company has created an antibody to release this brake. The scientific establishment is skeptical - immunotherapy has a long history of failure. If you are wrong, you will waste years and hundreds of millions. If you are right, you could change everything.`,
        keyPoints: [
            'Proving a concept with 100 years of failure',
            'First checkpoint inhibitor ever',
            'Enables entire follow-on drug class',
            'Significant autoimmune toxicity (20%)',
            'Nobel Prize science',
            '12 years exclusivity before biosimilar competition',
        ],
        parameters: {
            startingCapital: 100,
            phaseIISuccessRate: 0.25,
            phaseIIICostMultiplier: 2.00,
            marketPotential: 6000,
            patientPopulation: 50000,
            timelineYears: { min: 18, max: 25 },
        },
        fundingRounds: ['seed', 'seriesA', 'seriesB', 'seriesC'],
        victoryMetrics: {
            developmentTime: 25,
            totalRaised: 365,
            founderOwnership: 0.18,
            patientImpact: 'First-ever survival improvement in metastatic melanoma. 20% long-term survival. Enabled 8+ checkpoint drugs.',
            socialContract: 'You proved the concept. Follow-on drugs may be better, but without yours, none would exist.',
        },
    },
};

export default GAME_PATHS;
