import { Space } from '@/types/Game.types';

export const SPACES: Space[] = [
    // ============================================
    // DISCOVERY PHASE (Spaces 1-6)
    // Real-world total: ~$20M | Game: ~$20M
    // ============================================
    {
        id: 1,
        name: 'Target Identification & Validation',
        phase: 'discovery',
        cost: 3,
        successRate: 0.6,
        dataYield: { efficacy: 1 },
        riskCardChance: 0.3,
        tooltip: {
            quick: 'Identify and validate a disease target',
            detailed: 'Use genetics, biochemistry, and cell models to confirm this protein/pathway is druggable and disease-relevant. ~40% of targets fail validation.',
            costBreakdown: '$3M covers target selection, assay development, and genetic validation',
        },
    },
    {
        id: 2,
        name: 'Assay Development',
        phase: 'discovery',
        cost: 2,
        successRate: 0.75,
        dataYield: { efficacy: 1 },
        tooltip: {
            quick: 'Build screening tools to find drug candidates',
            detailed: 'Develop biochemical and cellular assays to measure compound activity. Often bundled with screening; costs vary by assay complexity.',
            costBreakdown: '$2M for assay design, validation, and automation',
        },
    },
    {
        id: 3,
        name: 'High-Throughput Screen',
        phase: 'discovery',
        cost: 3,
        successRate: 0.70,
        dataYield: { efficacy: 2 },
        specialEffect: { type: 'CHOICE_REQUIRED' },
        tooltip: {
            quick: 'Screen millions of compounds for activity',
            detailed: 'You screen 1,000,000+ compounds and find ~500 initial hits. Costs depend on library size; may hit millions of compounds.',
            costBreakdown: '$3M for compound libraries, screening operations, and hit analysis',
        },
    },
    {
        id: 4,
        name: 'Hit Validation',
        phase: 'discovery',
        cost: 2,
        successRate: 0.75,
        dataYield: { efficacy: 1, pkpd: 1 },
        riskCardChance: 0.4,
        tooltip: {
            quick: 'Confirm hits are real and not artifacts',
            detailed: 'Of ~500 hits, only ~50 confirm as real activity. Confirmation of hits eliminates false positives (PAINS compounds, assay interference).',
            costBreakdown: '$2M for confirmatory studies and early ADME profiling',
        },
    },
    {
        id: 5,
        name: 'Lead Optimization',
        phase: 'discovery',
        cost: 8,
        successRate: 0.70,
        dataYield: { pkpd: 1 },
        specialEffect: { type: 'CAN_UPGRADE', cost: 5, bonus: { pkpd: 1 } },
        tooltip: {
            quick: 'Improve drug properties through chemistry',
            detailed: 'From ~50 validated hits, medicinal chemists synthesize 500-2000 analogs over 12-18 months to identify 1-3 clinical candidates.',
            costBreakdown: '$8M for iterative synthesis and testing cycles (typical range: $5-15M)',
        },
    },
    {
        id: 6,
        name: 'Candidate Selection',
        phase: 'discovery',
        cost: 2,
        isGate: true,
        successRate: 0.85,
        gateRequirement: { efficacy: 3, safety: 0, pkpd: 1, cmc: 0 },  // Reduced pkpd from 2 to 1; efficacy is the key metric in Discovery
        dataYield: { safety: 1, pkpd: 1 },  // Safety from exploratory tox; no NEW efficacy here (that was discovery screens)
        tooltip: {
            quick: 'From 1-3 candidates, choose your lead for preclinical',
            detailed: 'After developing hundreds of variants in lead optimization (synthesizing analogs for small molecules, or engineering antibody variants for biologics), you narrowed to 1-3 candidates. Now select your primary candidate (with backups) for IND-enabling studies.',
            costBreakdown: '$2M for final profiling, head-to-head comparisons, and candidate documentation',
        },
    },

    // ============================================
    // PRECLINICAL PHASE (Spaces 7-11)
    // Real-world total: ~$15M | Game: ~$16M
    // ============================================
    {
        id: 7,
        name: 'Exploratory Toxicology',
        phase: 'preclinical',
        cost: 2,
        successRate: 0.80,
        dataYield: { safety: 1 },
        riskCardChance: 0.3,
        tooltip: {
            quick: 'Early safety studies in animals (non-GLP)',
            detailed: 'Dose-range finding toxicology to identify potential safety issues. Non-GLP studies to guide GLP design.',
            costBreakdown: '$2M for rodent and non-rodent exploratory studies',
        },
    },
    {
        id: 8,
        name: 'PK/ADME Studies',
        phase: 'preclinical',
        cost: 3,
        successRate: 0.70,
        dataYield: { pkpd: 2 },
        specialEffect: { type: 'RETURN_TO_SPACE', spaceId: 5 },
        tooltip: {
            quick: 'Characterize how the drug behaves in the body',
            detailed: 'Study Absorption, Distribution, Metabolism, and Excretion. Poor PK is a major cause of clinical failure (~85% success rate).',
            costBreakdown: '$3M for in vivo PK, metabolite ID, and DDI studies',
        },
    },
    {
        id: 9,
        name: 'GLP Toxicology Package',
        phase: 'preclinical',
        cost: 5,
        successRate: 0.85,
        dataYield: { safety: 2 },
        tooltip: {
            quick: 'IND-enabling safety studies (28-day, 2 species)',
            detailed: 'Good Laboratory Practice toxicology required by FDA before human testing. Required for IND; 28-day studies in 2 species typical.',
            costBreakdown: '$5M for 28-day studies in two species, genotoxicity, safety pharmacology',
        },
    },
    {
        id: 10,
        name: 'CMC Scale-up & Formulation',
        phase: 'preclinical',
        cost: 4,
        successRate: 0.90,
        dataYield: { cmc: 3 },
        specialEffect: { type: 'CAN_UPGRADE', cost: 2, bonus: { cmc: 1 } },
        tooltip: {
            quick: 'Develop manufacturing process (cGMP)',
            detailed: 'Chemistry, Manufacturing, and Controls: develop a reproducible process. cGMP manufacturing ~50% of non-clinical budget.',
            costBreakdown: '$4M for process development, formulation, analytical methods',
        },
    },
    {
        id: 11,
        name: 'IND Filing',
        phase: 'preclinical',
        cost: 2,
        isGate: true,
        successRate: 0.95,
        gateRequirement: { efficacy: 2, safety: 2, pkpd: 1, cmc: 1 },
        dataYield: { safety: 1 },
        policyCardChance: 0.5,
        tooltip: {
            quick: 'Submit Investigational New Drug application',
            detailed: 'Document preparation; FDA PDUFA fees ~$2-3M additional. Package all preclinical data for FDA review.',
            costBreakdown: '$2M for regulatory preparation and filing fees',
        },
    },

    // ============================================
    // CLINICAL PHASE (Spaces 12-18)
    // Real-world total: ~$150-400M | Game: ~$185M
    // ============================================
    {
        id: 12,
        name: 'Phase I - Single Ascending Dose',
        phase: 'clinical',
        cost: 5,
        successRate: 0.65,
        dataYield: { safety: 2, pkpd: 1 },
        riskCardChance: 0.2,
        tooltip: {
            quick: 'First-in-human: 20-80 healthy volunteers',
            detailed: 'Single ascending dose study. Primary goal: safety and tolerability. Combined Phase I success ~47-54%.',
            costBreakdown: '$5M for site setup, volunteer recruitment, monitoring',
        },
    },
    {
        id: 13,
        name: 'Phase I - Multiple Ascending Dose',
        phase: 'clinical',
        cost: 5,
        successRate: 0.54,
        dataYield: { safety: 1, pkpd: 2 },
        riskCardChance: 0.15,
        tooltip: {
            quick: 'Repeat dosing to understand PK',
            detailed: 'Multiple ascending dose for steady-state PK and cumulative toxicity. Combined Phase I success ~47-54%.',
            costBreakdown: '$5M for extended monitoring and PK sampling',
        },
    },
    {
        id: 14,
        name: 'Phase IIa - Proof of Concept',
        phase: 'clinical',
        cost: 15,
        successRate: 0.35, // Major attrition point
        dataYield: { efficacy: 3 },
        policyCardChance: 0.3,
        tooltip: {
            quick: 'First efficacy signal in 100-300 patients',
            detailed: 'Does the drug work in patients? This is the "valley of death" — only ~35% of candidates show meaningful efficacy here.',
            costBreakdown: '$15M for patient sites, enrollment, and efficacy endpoints',
        },
    },
    {
        id: 15,
        name: 'Phase IIb - Dose Finding',
        phase: 'clinical',
        cost: 25,
        successRate: 0.28, // Phase II overall is ~28-35%
        dataYield: { efficacy: 2, safety: 1, pkpd: 1 },
        isGate: true,
        gateRequirement: { efficacy: 5, safety: 4, pkpd: 3, cmc: 2 },
        tooltip: {
            quick: 'Larger efficacy study; dose optimization',
            detailed: 'Larger study testing multiple doses (dose-response). Phase II overall is ~28-35% successful.',
            costBreakdown: '$25M for multi-arm dose-response study',
        },
    },
    {
        id: 16,
        name: 'Phase III - Pivotal Study 1',
        phase: 'clinical',
        cost: 50,
        successRate: 0.58, // ~55-70%
        dataYield: { efficacy: 3, safety: 2 },
        policyCardChance: 0.4,
        tooltip: {
            quick: 'Large confirmatory trial (300-3000+ patients)',
            detailed: 'First registration-enabling trial. Large, randomized, controlled. Highly variable costs; oncology can exceed $100M.',
            costBreakdown: '$50M for hundreds of patients across multiple sites globally',
        },
    },
    {
        id: 17,
        name: 'Phase III - Pivotal Study 2',
        phase: 'clinical',
        cost: 50,
        successRate: 0.58,
        dataYield: { efficacy: 3, safety: 2, cmc: 1 },
        tooltip: {
            quick: 'Second pivotal (often required)',
            detailed: 'FDA typically requires two adequate and well-controlled trials for approval. Second pivotal often required.',
            costBreakdown: '$50M for second confirmatory study',
        },
    },
    {
        id: 18,
        name: 'Long-term Safety Extension',
        phase: 'clinical',
        cost: 35,
        successRate: 0.90,
        dataYield: { safety: 2 },
        tooltip: {
            quick: 'Post-pivotal safety monitoring (Phase IV-like)',
            detailed: 'Monitor patients for longer-term safety signals. ~90% success rate; supports the drug label.',
            costBreakdown: '$35M for ongoing monitoring and data collection',
        },
    },

    // ============================================
    // REGULATORY PHASE (Spaces 19-24)
    // Real-world total: ~$5-10M | Game: ~$5.5M
    // ============================================
    {
        id: 19,
        name: 'NDA/BLA Submission',
        phase: 'regulatory',
        cost: 3,
        isGate: true,
        successRate: 0.92,
        gateRequirement: { efficacy: 8, safety: 6, pkpd: 4, cmc: 3 },
        dataYield: {},
        policyCardChance: 0.6,
        tooltip: {
            quick: 'Document preparation; PDUFA fees ~$4M',
            detailed: 'New Drug Application (NDA) or Biologics License Application (BLA) with complete data package.',
            costBreakdown: '$3M for submission preparation (PDUFA fees separate)',
        },
    },
    {
        id: 20,
        name: 'FDA Review Clock',
        phase: 'regulatory',
        cost: 0,
        dataYield: {},
        specialEffect: { type: 'WAIT_TURNS', turns: 2 },
        policyCardChance: 0.5,
        tooltip: {
            quick: '10-12 months standard; 6 mo priority review',
            detailed: 'Standard review takes 10-12 months. Priority Review can be 6 months. No direct cost, but opportunity cost.',
            costBreakdown: 'No direct cost, but opportunity cost of waiting',
        },
    },
    {
        id: 21,
        name: 'Advisory Committee',
        phase: 'regulatory',
        cost: 2,
        successRate: 0.75,
        dataYield: {},
        tooltip: {
            quick: 'Panel meeting preparation (not always required)',
            detailed: 'FDA may convene external experts (AdCom) to review data. Their vote influences approval. 75% success rate typical.',
            costBreakdown: '$2M for preparation and expert consultants',
        },
    },
    {
        id: 22,
        name: 'Label Negotiation',
        phase: 'regulatory',
        cost: 1,
        successRate: 0.95,
        dataYield: {},
        specialEffect: { type: 'CHOICE_REQUIRED' },
        tooltip: {
            quick: 'Minimal cost; part of review process',
            detailed: 'The label determines what claims you can make and which patients can be treated. Label scope affects market size.',
            costBreakdown: '$1M for label negotiations and final documentation',
        },
    },
    {
        id: 23,
        name: 'FDA Approval',
        phase: 'regulatory',
        cost: 0,
        successRate: 0.91, // ~90-92% success rate from NDA to approval
        isGate: true,
        gateRequirement: { efficacy: 8, safety: 6, pkpd: 4, cmc: 4 },
        dataYield: {},
        specialEffect: { type: 'VICTORY_CHECK' },
        tooltip: {
            quick: 'Success rate from NDA to approval: ~90-92%',
            detailed: 'If you meet all requirements, FDA approves your drug for marketing. Historical success rate: 90-92%.',
            costBreakdown: 'Victory! But remember: the real work of treating patients just begins',
        },
    },
    {
        id: 24,
        name: 'Generic Clock Starts',
        phase: 'regulatory',
        cost: 0,
        dataYield: {},
        specialEffect: { type: 'GENERIC_CLOCK' },
        tooltip: {
            quick: 'Marketing exclusivity begins',
            detailed: 'Medicare price negotiation begins after 9 years (small molecules) or 13 years (biologics) under the IRA. Your exclusivity period funds the next generation of drugs.',
            costBreakdown: 'When generics enter: drug price drops 80-90%, becomes permanent public good',
        },
    },
];

export const getSpaceById = (id: number): Space | undefined => {
    return SPACES.find(space => space.id === id);
};

export const getPhaseSpaces = (phase: string): Space[] => {
    return SPACES.filter(space => space.phase === phase);
};

export const getGateSpaces = (): Space[] => {
    return SPACES.filter(space => space.isGate);
};
