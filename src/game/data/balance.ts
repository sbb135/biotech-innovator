import { DifficultySettings } from '@/types/Game.types';

/**
 * THEMATIC GAME MODES - Reflect real-world drug development differences
 * 
 * ORPHAN (Rare Disease):
 * - Smaller patient populations → smaller, cheaper trials
 * - Orphan Drug Designation → expedited FDA review
 * - BUT: smaller market potential (fewer patients)
 * - Higher success rates (often clearer biology)
 * 
 * BLOCKBUSTER (Mass Market):
 * - Huge patient populations → massive, expensive Phase III
 * - Large revenue potential → $5-10B+ over 10 years
 * - Intense PBM/insurance pressure
 * - Standard success rates
 * 
 * FIRST-IN-CLASS (Novel Mechanism):
 * - Unprecedented mechanism → no clinical precedent
 * - Higher Phase II failure (uncertainty about target)
 * - BUT: premium pricing if successful
 * - Higher clinical costs (more monitoring needed)
 */

export const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
    orphan: {
        startingCapital: 80,              // Smaller company, focused
        phaseIISuccessRate: 0.40,          // Better success (clearer biology in rare diseases)
        phaseIIISuccessRate: 0.70,         // Smaller trials are lower risk
        phaseIIICostMultiplier: 0.4,       // Much smaller trials (100s vs 1000s of patients)
        revenueProjection: 2000,           // Smaller market: $2B lifetime (orphan drug pricing helps)
    },
    blockbuster: {
        startingCapital: 150,              // Well-funded, big ambitions
        phaseIISuccessRate: 0.35,          // Standard rate
        phaseIIISuccessRate: 0.58,         // Large trials = more expensive failures
        phaseIIICostMultiplier: 1.5,       // Huge trials (3000+ patients each)
        revenueProjection: 8000,           // Massive market: $8B+ lifetime
    },
    firstInClass: {
        startingCapital: 100,              // Moderate funding
        phaseIISuccessRate: 0.25,          // Higher uncertainty (novel mechanism, no precedent)
        phaseIIISuccessRate: 0.65,         // Once PoC is proven, better odds
        phaseIIICostMultiplier: 1.2,       // Extra monitoring for novel mechanism
        revenueProjection: 6000,           // Premium pricing: $6B+ (first mover advantage)
    },
};

// Gate requirements for advancing phases
export const GATE_REQUIREMENTS = {
    indFiling: { efficacy: 2, safety: 2, pkpd: 1, cmc: 1 },
    phaseII: { efficacy: 3, safety: 3, pkpd: 2, cmc: 2 },
    phaseIII: { efficacy: 5, safety: 4, pkpd: 3, cmc: 3 },
    ndaApproval: { efficacy: 8, safety: 6, pkpd: 4, cmc: 4 },
};

// Success rates by space (base rates, modified by difficulty)
export const BASE_SUCCESS_RATES: Record<number, number> = {
    1: 0.6,   // Target Identification
    3: 0.7,   // HTS
    4: 0.75,  // Hit Validation
    7: 0.8,   // Exploratory Tox
    8: 0.7,   // PK/ADME
    9: 0.85,  // GLP Tox
    10: 0.8,  // CMC Scale-up
    12: 0.8,  // Phase I SAD
    13: 0.85, // Phase I MAD
    14: 0.4,  // Phase IIa - KEY ATTRITION
    15: 0.6,  // Phase IIb
    16: 0.7,  // Phase III Study 1
    17: 0.7,  // Phase III Study 2
    18: 0.9,  // Long-term Safety
    21: 0.75, // Advisory Committee
};

// Costs by phase (in $M) - Based on Wouters (JAMA 2020) and industry data
export const PHASE_COSTS = {
    discovery: {
        total: { min: 15, max: 25 },
        description: 'Target identification through candidate selection',
    },
    preclinical: {
        total: { min: 12, max: 20 },
        description: 'Toxicology studies and IND preparation',
    },
    clinical: {
        total: { min: 150, max: 250 },
        description: 'Phase I through Phase III trials',
    },
    regulatory: {
        total: { min: 5, max: 10 },
        description: 'NDA filing and FDA review',
    },
};

// Industry statistics for comparison (CBO-sourced data)
export const INDUSTRY_STATS = {
    // $2.6B per approved drug includes failures + cost of capital over 10-15 years
    // 9 failures × ~$180M avg (most fail before costly Phase III) + 1 success × ~$247M = ~$1.87B direct cost
    // Add cost of capital over 10-15 years → $2.6B industry benchmark
    averageCostToApproval: 2600, // $2.6B per approved drug (industry benchmark)
    averageFailedProgramCost: 180, // Most fail before costly Phase III
    averageTimeToApproval: 10.5, // years (BIO 2021 data)
    overallSuccessRate: 0.079, // 7.9% LOA from Phase I to approval (BIO 2021)
    phaseIIAttrition: 0.711, // 71.1% fail in Phase II (only 28.9% succeed - BIO 2021)
    genericPriceDrop: { min: 0.80, max: 0.95 }, // 80-95% price drop with competition
    patentLife: { min: 10, max: 15 }, // 10-15 years of branded exclusivity
    attemptsPerSuccess: 12.66, // 1/0.079 = ~12.66 attempts per success
    // Operating margins after COGS, SG&A, rebates, taxes
    operatingMargin: { min: 0.15, max: 0.30 }, // 15-30% operating margin (NOT gross profit)
    rdReinvestmentRate: { min: 0.18, max: 0.25 }, // 18-25% of revenue reinvested in R&D
};

// ============================================
// BIO 2021 SUCCESS RATES BY PHASE TRANSITION
// Source: BIO/Informa/QLS 2011-2020 Report
// ============================================
export const PHASE_SUCCESS_RATES = {
    phaseI_to_II: 0.52,      // 52% - Safety usually okay
    phaseII_to_III: 0.289,   // 28.9% - THE VALLEY OF DEATH (lowest!)
    phaseIII_to_NDA: 0.578,  // 57.8% - Expensive failures here
    NDA_to_approval: 0.906,  // 90.6% - Usually make it if you get here
    overall_LOA: 0.079,      // 7.9% - ~1 in 12.66 drugs succeed
};

// Disease-specific LOA (BIO 2021 data)
export const DISEASE_LOA = {
    hematology: 0.239,     // 23.9% - Best odds
    rareDisease: 0.170,    // 17.0% - Orphan drugs do better
    infectious: 0.168,     // 16.8%
    metabolic: 0.143,      // 14.3%
    neurology: 0.076,      // 7.6% - CNS is hard
    oncology: 0.053,       // 5.3% - Hardest indication
};

// ============================================
// PHASE DURATIONS (BIO 2021 DATA)
// Source: BIO/Informa/QLS 2011-2020 Report
// ============================================
export const PHASE_DURATIONS = {
    discovery: { min: 2.0, max: 4.0, avg: 3.0 },      // Pre-Phase I
    phaseI: { min: 1.5, max: 2.7, avg: 2.3 },         // BIO data: 2.3 years
    phaseII: { min: 2.9, max: 5.0, avg: 3.6 },        // BIO data: 3.6 years (highest variance!)
    phaseIII: { min: 2.8, max: 4.2, avg: 3.3 },       // BIO data: 3.3 years
    regulatory: { min: 0.8, max: 1.8, avg: 1.3 },     // BIO data: 1.3 years
};

// Time delays that can occur (random events)
export const TIME_DELAYS = {
    clinicalHold: { min: 0.5, max: 1.0 },             // FDA clinical hold: 6-12 months
    enrollmentDelay: { min: 0.5, max: 1.5 },          // Slow enrollment: 6-18 months
    manufacturingIssue: { min: 0.25, max: 0.5 },      // CMC problems: 3-6 months
    CRL: { min: 0.5, max: 1.0 },                      // Complete Response Letter: 6-12 months
};

// ============================================
// FUNDING ROUNDS - RA Capital Framework
// Source: Carta, SVB, PitchBook, RA Capital research
// ============================================
export const FUNDING_ROUNDS = {
    seed: {
        name: 'Seed',
        triggerSpace: 1,              // At game start (Discovery)
        typicalRaise: { min: 2, max: 10 },
        dilution: { min: 0.15, max: 0.25 },
        investorExpectation: 'Strong science, IP protection, experienced team',
        targetMultiple: '10-100×',
        targetIRR: '~29%',
    },
    seriesA: {
        name: 'Series A',
        triggerSpace: 7,              // IND-enabling (Preclinical entry)
        typicalRaise: { min: 20, max: 50 },
        dilution: { min: 0.25, max: 0.35 },
        investorExpectation: 'Target validation, preclinical data, clear clinical path',
        targetMultiple: '10-15×',
        targetIRR: '~25%',
    },
    seriesB: {
        name: 'Series B',
        triggerSpace: 12,             // Phase I entry (Clinical entry round)
        typicalRaise: { min: 50, max: 100 },
        dilution: { min: 0.15, max: 0.25 },
        investorExpectation: 'IND accepted, Phase I safety data, early PK',
        targetMultiple: '3-5×',
        targetIRR: '~20%',
    },
    seriesC: {
        name: 'Series C',
        triggerSpace: 15,             // Phase II/III (Pivotal round)
        typicalRaise: { min: 100, max: 200 },
        dilution: { min: 0.10, max: 0.20 },
        investorExpectation: 'Phase II PoC data, biomarker strategy, regulatory alignment',
        targetMultiple: '2-3×',
        targetIRR: '~11%',
    },
    ipoOrCrossover: {
        name: 'IPO/Crossover',
        triggerSpace: 19,             // Pre-Approval (NDA submitted)
        typicalRaise: { min: 150, max: 300 },
        dilution: { min: 0.10, max: 0.15 },
        investorExpectation: 'Phase III data, clear regulatory path to approval',
        targetMultiple: '1.5-2×',
        targetIRR: '~8%',
    },
};

// What spaces trigger each funding round
export const FUNDING_TRIGGER_SPACES = [1, 7, 12, 15, 19];

// ============================================
// KOLCHINSKY / RA CAPITAL FRAMEWORK
// Source: "The Great American Drug Deal" by Peter Kolchinsky
// ============================================
export const KOLCHINSKY_FRAMEWORK = {
    // Investor discount rate
    discountRate: { min: 0.08, max: 0.12 },  // 8-12% - revenues >15 years away are "essentially irrelevant"

    // Branded drug period before generic entry
    brandedPeriod: { min: 10, max: 15 },     // 10-15 years of exclusivity

    // Generic entry dynamics
    genericPriceDrop: 0.90,                   // >90% price drop for small molecules
    biosimilarPriceDrop: 0.30,                // ~30% price drop for biologics (less)

    // US market stats
    genericPrescriptionShare: 0.89,           // 89% of US prescriptions are generic
    brandedPrescriptionShare: 0.11,           // Only 11% are branded
    rxShareOfHealthcare: 0.09,                // Rx drugs = ~9% of healthcare spending

    // Cost breakdown (Tufts CSDD)
    capitalizedCost: 2600,                    // $2.6B per approved drug
    outOfPocketCost: 1400,                    // $1.4B direct costs
    capitalCost: 1200,                        // $1.2B time/capital costs (cost of money over 10+ years)
};

// Helper to calculate founder ownership after rounds
export const calculateFounderOwnership = (roundsCompleted: string[]): number => {
    let ownership = 1.0; // 100%

    const roundDilutions: Record<string, number> = {
        'seed': 0.20,        // 20% dilution
        'seriesA': 0.30,     // 30% dilution
        'seriesB': 0.20,     // 20% dilution
        'seriesC': 0.15,     // 15% dilution
        'ipoOrCrossover': 0.12, // 12% dilution
    };

    for (const round of roundsCompleted) {
        const dilution = roundDilutions[round] || 0;
        ownership = ownership * (1 - dilution);
    }

    return ownership;
};
