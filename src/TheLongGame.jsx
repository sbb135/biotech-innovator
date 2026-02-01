import React, { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// THE LONG GAME - Drug Development Simulation
// Language and concepts inspired by the Biotech Social Contract framework
// ═══════════════════════════════════════════════════════════════════════════════

// Modality-specific data: failure modes, biomarkers, and disease fit
// Based on: "Modalities fail in predictable, non-random ways. 
// Choosing a modality is choosing your risk profile before you ever choose a target."
// 5-Class Failure Framework:
// 1. Biology risk (does the intervention do what we think?)
// 2. Chemistry/Engineering risk (can we make and control it?)
// 3. Delivery risk (does it reach the site of action?)
// 4. Safety risk (what breaks when it works?)
// 5. Clinical/Translational risk (does human biology diverge?)
const MODALITY_DATA = {
  'small-molecule': {
    displayName: 'Small Molecule',
    description: 'Traditional chemistry-based drugs. Oral delivery possible. HTS and medicinal chemistry.',
    dominantFailure: 'Selectivity & toxicity',
    failureModes: [
      'Insufficient target engagement in humans (Biology)',
      'Off-target toxicity due to promiscuous binding (Safety)',
      'Metabolic liabilities - CYP induction/inhibition (Chemistry)',
      'Narrow therapeutic window (Safety)',
      'Resistance mutations in oncology (Biology)'
    ],
    biologyRisk: 'Moderate - well-understood pharmacology',
    chemistryRisk: 'High - lead optimization difficulty, ADME/Tox issues',
    deliveryRisk: 'Low - broad intracellular exposure, oral possible',
    safetyRisk: 'Moderate - off-target binding predictable from structure',
    translationalRisk: 'Moderate - species differences in metabolism',
    goNoGoBiomarker: 'Target occupancy + pathway PD',
    commonFailureSignal: 'Clean PK but no PD shift → target not causal',
    keyDrivers: ['Lead optimization difficulty', 'ADME/Tox issues', 'Large Phase 3 trials (chronic indications)'],
    biggestCapitalSinks: ['Clinical trials (Phase 2→3)', 'Preclinical toxicology', 'Medicinal chemistry & DMPK'],
    platformEffect: 'Limited - chemistry skills reusable but each target requires bespoke optimization',
    speedUps: ['Clear target with biomarker', 'Drug repurposing', 'Strong predictive animal models'],
    bestFitDiseases: ['CNS', 'Cardiovascular', 'Metabolic', 'Infectious'],
    poorFitDiseases: ['One-time curative intent', 'Extracellular protein replacement'],
    timeline: '8-12 years',
    capitalRange: '$200M-$800M'
  },
  'biologic': {
    displayName: 'Biologic',
    description: 'Antibodies, therapeutic proteins. Injection/infusion delivery. Protein engineering.',
    dominantFailure: 'Biology redundancy / pathway compensation',
    failureModes: [
      'Poor tissue penetration - solid tumors, CNS (Delivery)',
      'Target redundancy / pathway compensation (Biology)',
      'Anti-drug antibodies - ADA/immunogenicity (Safety)',
      'Lack of efficacy despite strong target binding (Biology)'
    ],
    biologyRisk: 'High - target biology may not translate from preclinical',
    chemistryRisk: 'Moderate - CMC scale-up, GMP bioreactors',
    deliveryRisk: 'Moderate - IV/SC administration, poor CNS penetration',
    safetyRisk: 'Low-Moderate - immunogenicity main concern',
    translationalRisk: 'High - solid tumor vs hematologic, patient recruitment complexity',
    goNoGoBiomarker: 'Sustained ligand suppression',
    commonFailureSignal: 'Complete target neutralization with no clinical benefit',
    keyDrivers: ['Target biology (solid tumor vs hematologic)', 'Combination studies needed', 'Immunogenicity', 'Patient recruitment complexity'],
    biggestCapitalSinks: ['Phase 2/3 trials', 'Biologics CMC scale-up', 'Cell line development', 'GMP bioreactors'],
    platformEffect: 'Significant - antibody discovery, Fc engineering, platform CMC cut lead time & cost',
    speedUps: ['Platform cell lines', 'Platform toxicology packages', 'Accelerated approval with biomarkers'],
    bestFitDiseases: ['Autoimmune', 'Oncology (extracellular)', 'Rare diseases'],
    poorFitDiseases: ['CNS (unless barrier disrupted)', 'Intracellular targets'],
    timeline: '9-14 years',
    capitalRange: '$400M-$1.5B'
  },
  'genetic-medicine': {
    displayName: 'Genetic Medicine',
    description: 'Gene therapy (AAV), siRNA/RNAi, CRISPR gene editing. Sequence-based therapeutics.',
    dominantFailure: 'Delivery & durability',
    failureModes: [
      'Delivery failure to target tissue (Delivery)',
      'Pre-existing immunity to viral vectors (Delivery)',
      'Loss of expression/knockdown over time (Biology)',
      'Off-target effects - genomic or transcriptomic (Safety)',
      'Immune activation (Safety)'
    ],
    biologyRisk: 'Moderate - sequence-specific mechanisms well-understood',
    chemistryRisk: 'High - viral vector or LNP manufacturing, specialized analytics',
    deliveryRisk: 'Very High - tissue targeting is the key challenge',
    safetyRisk: 'High - permanent changes (editing) or immune activation',
    translationalRisk: 'High - durability in humans often differs from animal models',
    goNoGoBiomarker: 'Target tissue expression/knockdown with acceptable safety',
    commonFailureSignal: 'Strong activity in easy tissues (liver) but disease elsewhere',
    keyDrivers: ['Delivery platform (AAV, LNP, GalNAc)', 'Tissue targeting', 'Durability of effect', 'Manufacturing capacity'],
    biggestCapitalSinks: ['Vector/LNP manufacturing', 'Long-term follow-up studies', 'Delivery optimization'],
    platformEffect: 'Strong for liver targets - other tissues require bespoke solutions',
    speedUps: ['Liver-targeted indications', 'Platform delivery systems', 'Biomarker endpoints'],
    bestFitDiseases: ['Rare monogenic (liver-expressed)', 'Genetic diseases with clear single-gene cause', 'Liver diseases'],
    poorFitDiseases: ['CNS without specialized delivery', 'Polygenic diseases', 'Non-life-threatening conditions (for editing)'],
    timeline: '7-14 years',
    capitalRange: '$300M-$1.5B+'
  },
  'cell-therapy': {
    displayName: 'Cell Therapy',
    description: 'CAR-T, stem cells, engineered cells. Living drugs with patient-specific manufacturing.',
    dominantFailure: 'Safety & manufacturing',
    failureModes: [
      'Cytokine release syndrome - CRS (Safety)',
      'Neurotoxicity - ICANS (Safety)',
      'Limited persistence or over-persistence (Biology)',
      'Antigen escape / tumor heterogeneity (Biology)',
      'Manufacturing failures / vein-to-vein time (Chemistry)'
    ],
    biologyRisk: 'Moderate - living, self-amplifying drugs',
    chemistryRisk: 'Very High - autologous COGS, GMP manufacturing complexity',
    deliveryRisk: 'Low-Moderate - direct infusion but logistics complex',
    safetyRisk: 'Very High - CRS/ICANS require intensive management',
    translationalRisk: 'High - complex clinical trial operations, long-term safety monitoring',
    goNoGoBiomarker: 'CAR-T expansion correlates with response',
    commonFailureSignal: 'Expansion without durability or safety control',
    keyDrivers: ['Autologous vs allogeneic (manufacturing complexity)', 'CRS/ICANS safety management', 'Persistence vs exhaustion balancing', 'Logistics (vein-to-vein time)'],
    biggestCapitalSinks: ['GMP manufacturing facilities', 'Release testing', 'Complex clinical trial operations', 'Long-term safety monitoring'],
    platformEffect: 'Very high for allogeneic - once off-the-shelf product validated, per-program costs fall dramatically',
    speedUps: ['Allogeneic approaches', 'Established manufacturing', 'Real-world evidence from prior CAR-T'],
    bestFitDiseases: ['Hematologic cancers', 'Certain solid tumors (emerging)'],
    poorFitDiseases: ['Chronic non-fatal diseases', 'Widespread systemic diseases'],
    timeline: '8-15 years',
    capitalRange: '$600M-$2B+'
  }
};

// Modality-specific phase context overlay
// Provides tailored descriptions and activities for early phases
const MODALITY_PHASE_CONTEXT = {
  'small-molecule': {
    basic_research: {
      context: 'Small molecule discovery begins with understanding disease biology and identifying druggable targets - typically enzymes, receptors, or ion channels with well-defined binding pockets. Target validation uses genetic knockdown/knockout studies, biochemical assays, and animal models to confirm that modulating the target affects disease.',
      activities: ['Target druggability assessment', 'Binding pocket analysis', 'Genetic validation studies', 'Biochemical assay development', 'Hit-finding strategy']
    },
    drug_discovery: {
      context: 'Hit identification uses high-throughput screening of compound libraries or computational design. Lead optimization balances potency, selectivity, metabolic stability, and oral bioavailability. Small molecules under 500 daltons can often achieve oral dosing - a major convenience advantage.',
      activities: ['High-throughput screening', 'Medicinal chemistry optimization', 'ADMET profiling', 'Oral bioavailability testing', 'Candidate selection']
    }
  },
  'biologic': {
    basic_research: {
      context: 'Biologic development begins with identifying extracellular or cell-surface targets accessible to large molecules. Target validation focuses on understanding pathway biology and potential redundancy - where blocking one pathway may be compensated by another. Antibody developability assessment is critical early.',
      activities: ['Target pathway mapping', 'Redundancy assessment', 'Epitope identification', 'Developability screening', 'Format selection']
    },
    drug_discovery: {
      context: 'Antibody discovery uses phage display, transgenic mice, or single B-cell cloning. Lead optimization focuses on binding affinity, specificity, stability, and manufacturability. Unlike small molecules, biologics require injection or infusion - they cannot survive oral administration.',
      activities: ['Antibody discovery campaign', 'Affinity maturation', 'Humanization', 'Stability engineering', 'Cell line development']
    }
  },
  'genetic-medicine': {
    basic_research: {
      context: 'Genetic medicine development requires strong genetic validation linking gene modulation to disease. Human genetic evidence - natural loss-of-function or gain-of-function variants - provides the strongest validation. Delivery strategy and tissue targeting are critical early considerations.',
      activities: ['Human genetic evidence review', 'Target gene validation', 'Delivery platform selection', 'Tissue targeting strategy', 'Sequence design']
    },
    drug_discovery: {
      context: 'Genetic medicine optimization involves payload design (gene, antisense, siRNA, or editing construct), delivery vehicle engineering, and tissue targeting. Durability of expression and potential for re-dosing are key considerations. Pre-existing immunity to viral vectors can limit patient eligibility.',
      activities: ['Payload optimization', 'Vector or delivery engineering', 'Tropism and targeting', 'Expression durability studies', 'Immunogenicity assessment']
    }
  },
  'cell-therapy': {
    basic_research: {
      context: 'Cell therapy development begins with understanding target biology and defining the therapeutic mechanism - cytotoxicity, immune modulation, or tissue repair. Cell source strategy (autologous vs allogeneic) and engineering approach are foundational decisions that affect manufacturing complexity.',
      activities: ['Target antigen validation', 'Cell source evaluation', 'Engineering strategy', 'Safety feature design', 'Persistence optimization']
    },
    drug_discovery: {
      context: 'Cell engineering optimizes receptor design, signaling domains, and additional modifications. Manufacturing process development is critical - cell therapies are living products requiring specialized Good Manufacturing Practice facilities. Autologous products face patient-specific variability.',
      activities: ['Receptor/construct design', 'Co-stimulatory optimization', 'Manufacturing process development', 'Potency assay development', 'Release testing strategy']
    }
  }
};


// Financing rounds - biotech capital progression
// Standard biotech financing ranges (source: industry data)
const FINANCING_ROUNDS = [
  {
    id: 'seed',
    name: 'Seed',
    amount: 5,
    dilution: 20,
    description: 'Angel/seed funding to validate target biology and generate early data',
    typicalPhase: 'basic_research',
    investorExpectation: 'Target validation, initial compound screening, team formation',
    nextMilestone: 'Data package compelling enough to raise Series A'
  },
  {
    id: 'series_a',
    name: 'Series A',
    amount: 40,
    dilution: 30,
    description: 'First institutional round to advance through lead optimization',
    typicalPhase: 'drug_discovery',
    investorExpectation: 'Candidate nomination, IND-enabling studies, clear development path',
    nextMilestone: 'IND filing and Phase I initiation'
  },
  {
    id: 'series_b',
    name: 'Series B',
    amount: 80,
    dilution: 25,
    description: 'Fund Phase I/II clinical trials and generate proof-of-concept',
    typicalPhase: 'phase1',
    investorExpectation: 'Clean Phase I safety, biomarker evidence of target engagement',
    nextMilestone: 'Phase II efficacy data'
  },
  {
    id: 'series_c',
    name: 'Series C / Crossover',
    amount: 150,
    dilution: 20,
    description: 'Late-stage private round or crossover investors ahead of pivotal trials',
    typicalPhase: 'phase2',
    investorExpectation: 'Positive Phase II data, clear regulatory path to approval',
    nextMilestone: 'Phase III initiation or IPO'
  },
  {
    id: 'ipo',
    name: 'IPO',
    amount: 250,
    dilution: 20,
    description: 'Public offering to fund pivotal Phase III trials and commercial prep',
    typicalPhase: 'phase3',
    investorExpectation: 'De-risked Phase III program, clear path to market',
    nextMilestone: 'FDA approval and commercial launch'
  }
];

// Alternative financing options - based on Fierce Biotech 2024 industry analysis
// These become available when traditional VC rounds are exhausted
const ALTERNATIVE_FINANCING = [
  {
    id: 'partnership',
    name: 'Strategic Partnership',
    description: 'Partner with large pharma for ex-US rights',
    amount: 75,
    tradeoff: 'Lose 50% of ex-US commercial rights',
    revenueImpact: 0.75, // Keep 75% of revenue
    minPhase: 'phase1', // Available after Phase I data
    lesson: 'Strategic partnerships are common in biotech. Partners provide capital and commercial infrastructure in exchange for territorial rights. This is how many small biotechs fund late-stage development.'
  },
  {
    id: 'royalty',
    name: 'Royalty Financing',
    description: 'Sell future revenue rights for upfront capital',
    amount: 50,
    tradeoff: '6% royalty on all future revenues',
    revenueImpact: 0.94, // Keep 94% of revenue
    minPhase: 'phase2', // Need Phase II data
    lesson: 'Royalty financing is non-dilutive - you keep your equity. But you permanently give up a portion of future revenues. ~90% of biotech executives consider this option.'
  },
  {
    id: 'licensing',
    name: 'Territory Licensing Deal',
    description: 'License rights to specific geography',
    amount: 40,
    tradeoff: 'Lose all rights to Asia-Pacific region',
    revenueImpact: 0.70, // Lose 30% of global market
    minPhase: 'phase1',
    lesson: 'Territory licensing deals are common for biotechs lacking global commercial presence. You trade market access for capital to continue development.'
  },
  {
    id: 'venture_debt',
    name: 'Venture Debt',
    description: 'Non-dilutive debt financing',
    amount: 30,
    tradeoff: '12% interest + warrants',
    revenueImpact: 1.0, // No revenue impact, but debt service
    minPhase: 'drug_discovery', // Available early
    lesson: 'Venture debt extends runway without dilution, but requires repayment. Works best when you expect near-term value inflection.'
  },
  {
    id: 'pipe',
    name: 'PIPE Financing',
    description: 'Private Investment in Public Equity',
    amount: 80,
    tradeoff: '15% additional dilution at discount',
    revenueImpact: 1.0,
    minPhase: 'phase3', // Post-IPO only
    requiresIPO: true,
    lesson: 'PIPE deals provide emergency capital for public companies at a discount to market price. Common when share prices have fallen.'
  }
];

// Phase-specific failure reasons - based on clinical trial failure analysis
// Sources: Citeline, FDA, Nature Reviews Drug Discovery
const FAILURE_REASONS = {
  basic_research: {
    primary: 'Target not validated',
    details: 'The biological hypothesis did not hold up under rigorous testing.',
    endpoint: 'Target engagement not demonstrated'
  },
  drug_discovery: {
    primary: 'No viable lead compound',
    details: 'Despite screening thousands of compounds, none showed suitable drug-like properties.',
    endpoint: 'Failed to identify compound with acceptable potency, selectivity, and ADMET profile'
  },
  lead_optimization: {
    primary: 'Insurmountable medicinal chemistry challenges',
    details: 'Could not optimize lead compound to meet required specifications.',
    endpoint: 'Unable to achieve therapeutic window with acceptable safety margin'
  },
  ind_enabling: {
    primary: 'Preclinical toxicity',
    details: 'GLP toxicology studies revealed safety signals incompatible with human dosing.',
    endpoint: 'No-observed-adverse-effect level (NOAEL) too low for therapeutic dose'
  },
  phase1: {
    primary: 'Dose-limiting toxicity or poor pharmacokinetics',
    details: 'Human PK/PD did not support therapeutic dosing, or maximum tolerated dose was below efficacious threshold.',
    endpoint: 'MTD not established or AUC insufficient for target engagement',
    successRate: '47%'
  },
  phase2: {
    primary: 'Failed to demonstrate efficacy (52% of Phase II failures)',
    details: 'The drug did not show meaningful clinical benefit compared to placebo in a controlled study. The biology that worked in preclinical models did not translate to human disease.',
    endpoint: 'Primary efficacy endpoint not met - effect size statistically insignificant or clinically meaningless',
    successRate: '28%'
  },
  phase3: {
    primary: 'Efficacy not replicated at scale (55% of Phase III failures)',
    details: 'Despite positive Phase II signals, the larger pivotal trial failed to confirm efficacy. This is often due to patient heterogeneity, site variability, or the Phase II effect being a statistical artifact.',
    endpoint: 'Primary endpoint p-value > 0.05 or hazard ratio confidence interval crossed 1.0',
    successRate: '55%'
  },
  fda_review: {
    primary: 'Regulatory concerns',
    details: 'FDA identified issues with trial design, data integrity, or benefit-risk profile.',
    endpoint: 'Complete Response Letter issued citing deficiencies'
  },
  post_market: {
    primary: 'Post-market safety signal',
    details: 'Real-world evidence revealed safety issues not detected in clinical trials.',
    endpoint: 'Black box warning or market withdrawal required'
  },
  patient_access: {
    primary: 'Failed to achieve sustainable market access',
    details: 'Despite FDA approval, payer coverage decisions, formulary exclusions, and prohibitive cost-sharing structures prevented patients from accessing your therapy.',
    endpoint: 'Commercial failure - unable to reach patients who need the treatment'
  }
};

// Modality-specific failure modes - why each type of drug fails
const MODALITY_FAILURE_MODES = {
  'small-molecule': {
    earlyPhase: 'Off-target toxicity or CYP450 interactions',
    latePhase: 'Insufficient therapeutic window - efficacious dose too close to toxic dose',
    commonIssue: 'Target engagement confirmed but no downstream clinical benefit - target may not be causal in humans'
  },
  'biologic': {
    earlyPhase: 'Immunogenicity - anti-drug antibodies reduce efficacy',
    latePhase: 'Complete target neutralization with no clinical improvement - biology is redundant',
    commonIssue: 'Poor tissue penetration limits efficacy in solid tumors or CNS indications'
  },
  'gene-therapy': {
    earlyPhase: 'Pre-existing immunity to viral vector limits eligible patient population',
    latePhase: 'Transgene expression wanes over time - durability is the key question',
    commonIssue: 'Dose-limiting hepatotoxicity at therapeutic doses'
  },
  'cell-therapy': {
    earlyPhase: 'Manufacturing complexity - vein-to-vein time exceeds clinical window',
    latePhase: 'Limited T-cell persistence and antigen escape lead to relapse',
    commonIssue: 'Cytokine release syndrome and neurotoxicity require intensive monitoring'
  }
};

// Accurate drug development phases based on scientific process
// Sources: PPD/Thermo Fisher, FDA.gov
// Preclinical: 4 phases per PPD. Clinical: FDA success rates
const PHASES = [
  {
    id: 'basic_research',
    name: 'Basic Research',
    color: '#22c55e',
    duration: '2-4 years',
    baseMonths: 36,
    cost: '$5-20M',
    baseCost: 3,
    realSuccessRate: null,  // Pre-IND - no FDA tracking
    description: 'Understanding disease biology and identifying drug targets',
    context: 'Basic research is conducted by academic institutions, pharmaceutical companies and biotech firms to understand the underlying biology of a disease. Scientists discover drug targets - biological processes or pathways that play a role in a condition. Target validation gathers evidence to confirm therapeutic effects of target modulation through genetic studies, biochemical assays and animal models.',
    activities: ['Disease biology research', 'Target identification', 'Target validation', 'Genetic studies', 'Biochemical assays']
  },
  {
    id: 'drug_discovery',
    name: 'Drug Discovery & Candidate Nomination',
    color: '#10b981',
    duration: '1-2 years',
    baseMonths: 18,
    cost: '$10-30M',
    baseCost: 5,
    realSuccessRate: null,  // Pre-IND - no FDA tracking
    description: 'Finding molecules that interact with the target, testing in cellular models',
    context: 'After target validation, focus shifts to finding or designing molecules that can interact with the target. Researchers test potential compounds in cellular models of disease (in vitro). Compounds showing promise are called "hits." Candidate nomination considers potency, selectivity, pharmacokinetics, safety profile and formulation potential.',
    activities: ['Molecule design', 'High-throughput screening', 'Cellular model testing', 'Hit identification', 'Candidate nomination']
  },
  {
    id: 'lead_optimization',
    name: 'Lead Optimization',
    color: '#3b82f6',
    duration: '1-3 years',
    baseMonths: 24,
    cost: '$15-50M',
    baseCost: 15,
    realSuccessRate: null,  // Pre-IND - no FDA tracking
    description: 'Chemical modification, ADME studies, dosing strategy, formulation',
    context: 'Promising compounds (leads) are chemically modified to improve performance. Scientists gather information on ADME (absorption, distribution, metabolism, excretion), dosing strategy, formulation, and safety. This includes preformulation, analytical method development, metabolism/pharmacokinetics, safety pharmacology and GMP manufacture.',
    activities: ['Chemical modification', 'ADME studies', 'Dosing strategy', 'Formulation development', 'Safety pharmacology', 'GMP manufacture']
  },
  {
    id: 'ind_enabling',
    name: 'IND-Enabling Studies',
    color: '#8b5cf6',
    duration: '1-2 years',
    baseMonths: 18,
    cost: '$10-30M',
    baseCost: 20,
    realSuccessRate: null,  // Pre-IND - no FDA tracking
    description: 'Final safety testing, GLP toxicology, manufacturing info, clinical trial plans',
    context: 'Leads with the most promising preclinical data advance to IND-enabling studies - final advanced safety testing. Sponsors submit manufacturing information and clinical trial plans. FDA reviews results and evaluates potential risks and benefits before determining if clinical trials can proceed.',
    activities: ['GLP toxicology', 'Safety assessments', 'Manufacturing documentation', 'Clinical trial protocol', 'IND submission', 'FDA review']
  },
  {
    id: 'phase1',
    name: 'Phase I Clinical Trial',
    color: '#f59e0b',
    duration: 'Several months',
    baseMonths: 12,
    cost: '$15-30M',
    baseCost: 20,
    realSuccessRate: 47,  // Citeline 2014-2023: 47% move to Phase II
    description: 'Safety and dosage in 20-100 healthy volunteers',
    context: 'Phase I is the first test in humans, focusing on safety, tolerability, and pharmacokinetics. Study participants: 20-100 healthy volunteers or people with the disease/condition. Purpose: Safety and dosage. According to Citeline analysis (2014-2023), approximately 47% of drugs move to the next phase.',
    activities: ['Safety assessment', 'Dosage determination', 'Side effect identification', 'Pharmacokinetics', 'Maximum tolerated dose']
  },
  {
    id: 'phase2',
    name: 'Phase II Clinical Trial',
    color: '#ef4444',
    duration: 'Several months to 2 years',
    baseMonths: 24,
    cost: '$20-100M',
    baseCost: 50,
    realSuccessRate: 28,  // Citeline 2014-2023: 28% move to Phase III - "Valley of Death"
    description: 'Efficacy and side effects in up to several hundred patients',
    context: 'Study participants: Up to several hundred people with the disease/condition. Purpose: Efficacy and side effects. This is the "Valley of Death" - according to Citeline analysis (2014-2023), only 28% of drugs move to Phase III. Most fail due to insufficient efficacy, safety concerns, or intolerable side effects.',
    activities: ['Efficacy testing', 'Dose optimization', 'Side effect monitoring', 'Randomized controlled trials', 'Biomarker development']
  },
  {
    id: 'phase3',
    name: 'Phase III Clinical Trial',
    color: '#dc2626',
    duration: '1-4 years',
    baseMonths: 36,
    cost: '$100-500M',
    baseCost: 200,
    realSuccessRate: 55,  // Citeline 2014-2023: 55% move to approval
    description: 'Efficacy and adverse reactions in 300-3,000 patients',
    context: 'Study participants: 300-3,000 volunteers with the disease/condition. Purpose: Efficacy and monitoring of adverse reactions. According to Citeline analysis (2014-2023), approximately 55% of drugs that reach Phase III move to approval. This is the largest investment in drug development.',
    activities: ['Large-scale efficacy trials', 'Adverse reaction monitoring', 'Multi-site studies', 'Comparative effectiveness', 'NDA/BLA preparation']
  },
  {
    id: 'fda_review',
    name: 'FDA Review',
    color: '#ec4899',
    duration: '6-10 months',
    baseMonths: 10,
    cost: '$5-10M',
    baseCost: 8,
    realSuccessRate: 90,  // Most complete NDAs approved
    description: 'NDA/BLA submission and FDA approval decision',
    context: 'The New Drug Application (NDA) or Biologics License Application (BLA) includes all data from preclinical through Phase III. FDA review team has 6-10 months to decide. If complete and safe/effective, FDA works with applicant on labeling.',
    activities: ['NDA/BLA submission', 'FDA review', 'Site inspections', 'Advisory Committee', 'Labeling development', 'Approval decision']
  },
  {
    id: 'post_market',
    name: 'Post-Market Safety Monitoring',
    color: '#6366f1',
    duration: 'Ongoing',
    baseMonths: 6,
    cost: '$2-5M',
    baseCost: 3,
    realSuccessRate: 95,  // Most approved drugs remain on market
    description: 'Phase IV studies and ongoing safety surveillance',
    context: 'Study participants: Several thousand people with the disease/condition. Purpose: Long-term safety and efficacy in real-world patients. FDA monitors through MedWatch, MedSun, manufacturer inspections, drug advertising review, and the Sentinel Initiative.',
    activities: ['Phase IV studies', 'MedWatch reporting', 'Manufacturer inspections', 'Drug advertising review', 'Generic drug pathway', 'Sentinel surveillance']
  },
  {
    id: 'patient_access',
    name: 'Patient Access',
    color: '#f59e0b',
    duration: '6-18 months',
    baseMonths: 12,
    cost: '$10-50M',
    baseCost: 20,
    realSuccessRate: null,  // Commercial phase, not clinical trial
    description: 'Formulary negotiations, payer coverage, and patient affordability',
    context: 'Regulatory approval establishes the right to market your therapy. However, patient access depends on coverage decisions by payers, formulary placement by pharmacy benefit managers (PBMs), and cost-sharing structures that determine out-of-pocket obligations. This phase determines whether patients who need your therapy can actually access it.',
    activities: ['PBM formulary negotiations', 'Payer coverage discussions', 'Copay assistance programs', 'Patient support services', 'Specialty pharmacy setup', 'Policy engagement']
  }
];

// Strategic decisions by phase
const QUESTIONS = {
  // MODALITY-SPECIFIC BASIC RESEARCH QUESTIONS
  // Questions focus on target validation strategies relevant to each modality
  // Without assuming specific indications (user has already selected their disease)
  basic_research: {
    'small-molecule': [
      {
        id: 'target_selection_sm',
        title: 'Target Selection Strategy',
        scenario: 'Your research team has identified two potential drug targets for your indication. Target A is a well-characterized enzyme with published genetic validation but several competitors in development. Target B is a novel protein with strong genome-wide association study data but limited understanding of its biology.',
        options: [
          {
            text: 'Pursue the validated target (Target A)',
            detail: 'Known biology, competitive landscape',
            cashEffect: -1,
            timeEffect: 0,
            riskBonus: 0.05,
            efficacyEffect: -15,
            result: 'The established biology accelerates your program. However, you learn that three other companies are pursuing the same target for similar indications.',
            lesson: 'Validated targets reduce biological risk - you know the target is relevant to disease. But validation attracts competition, requiring differentiation on efficacy, safety, or convenience. Small molecules can often achieve oral bioavailability, a major advantage for chronic dosing.'
          },
          {
            text: 'Pursue the novel protein (Target B)',
            detail: 'First-mover potential, biological uncertainty',
            cashEffect: -2,
            timeEffect: 6,
            riskBonus: -0.08,
            marketBonus: 1.5,
            efficacyEffect: 20,
            result: 'You must build understanding of the target from scratch. Initial validation takes longer than expected, but you establish a proprietary position.',
            lesson: 'Novel targets offer breakthrough potential but carry substantial risk that the underlying biology is wrong - the most common cause of drug failure. Small molecule advantages include well-understood manufacturing and distribution.'
          },
          {
            text: 'Validate both targets in parallel',
            detail: 'Diversified risk, divided resources',
            cashEffect: -3,
            timeEffect: 3,
            riskBonus: 0,
            efficacyEffect: 5,
            result: 'Neither program receives optimal focus. You generate data on both targets but lack the resources to deeply validate either.',
            lesson: 'Early diversification sounds prudent but often leads to underfunding critical experiments. Focus typically outperforms hedging in resource-constrained discovery.'
          }
        ]
      }
    ],
    'biologic': [
      {
        id: 'target_selection_bio',
        title: 'Antibody Target and Format Strategy',
        scenario: 'Your team is developing a therapeutic antibody for your indication. You must decide on format and target. Option A is a standard monoclonal antibody against a validated target. Option B is a bispecific format that could address mechanism redundancy but adds manufacturing complexity.',
        options: [
          {
            text: 'Standard monoclonal antibody format',
            detail: 'Well-understood manufacturing, proven regulatory path',
            cashEffect: -2,
            timeEffect: 0,
            riskBonus: 0.04,
            efficacyEffect: -10,
            result: 'Your antibody shows excellent binding and target engagement. Manufacturing proceeds smoothly with established cell line development.',
            lesson: 'Monoclonal antibodies have mature manufacturing and regulatory pathways. Biologics require injection or infusion since large proteins cannot survive oral administration. Immunogenicity (anti-drug antibodies) remains a key clinical risk even with fully human sequences.'
          },
          {
            text: 'Bispecific antibody targeting two pathways',
            detail: 'Innovation potential, manufacturing complexity',
            cashEffect: -5,
            timeEffect: 9,
            riskBonus: -0.03,
            marketBonus: 1.4,
            result: 'Your bispecific approach addresses potential mechanism redundancy but introduces significant manufacturing complexity. Protein folding and stability require extensive optimization.',
            lesson: 'Bispecific antibodies can address single-target limitations but add layers of development risk. Manufacturing complexity often exceeds expectations for multispecific formats. However, differentiation potential may justify the investment.'
          },
          {
            text: 'Antibody-drug conjugate (ADC) approach',
            detail: 'Combines targeting with cytotoxic payload',
            cashEffect: -4,
            timeEffect: 6,
            riskBonus: -0.02,
            efficacyEffect: 5,
            result: 'Your ADC combines antibody specificity with potent payload. Linker chemistry and payload selection prove critical for therapeutic window.',
            lesson: 'ADCs leverage antibody targeting to deliver payloads to specific cells. Success requires optimizing antibody, linker, and payload together. Therapeutic window depends on specific vs off-target delivery ratio.'
          }
        ]
      }
    ],
    'genetic-medicine': [
      {
        id: 'target_selection_gene',
        title: 'Genetic Target Validation Strategy',
        scenario: 'Your genetic medicine platform can modulate gene expression through different mechanisms. You must validate your therapeutic hypothesis for this indication. What level of genetic validation will you require before committing resources?',
        options: [
          {
            text: 'Require human genetic evidence (loss-of-function or gain-of-function)',
            detail: 'High bar, strongest validation',
            cashEffect: -3,
            timeEffect: 6,
            riskBonus: 0.08,
            efficacyEffect: -20,
            result: 'You wait for human genetic evidence linking your target to disease. When found, the validation is compelling - patients with natural variants have the phenotype you want to create or prevent.',
            lesson: 'Genetic medicines have highest success rates when human genetics validates the target. Natural loss-of-function or gain-of-function variants provide the strongest evidence that modulating the gene will affect disease. This is why genetic medicines excel in monogenic diseases.'
          },
          {
            text: 'Proceed with preclinical validation only',
            detail: 'Faster timeline, higher biological risk',
            cashEffect: -2,
            timeEffect: 0,
            riskBonus: -0.1,
            marketBonus: 1.3,
            efficacyEffect: 25,
            result: 'Animal models show compelling effects, but the translation gap to humans remains uncertain. You move faster but accept higher risk that the biology does not translate.',
            lesson: 'Preclinical validation in animal models can be misleading - biology often differs between species. Without human genetic evidence, the risk that target modulation will not produce clinical benefit increases substantially.'
          },
          {
            text: 'Invest in biomarker development alongside target validation',
            detail: 'Enable patient selection and proof of mechanism',
            cashEffect: -5,
            timeEffect: 3,
            riskBonus: 0.02,
            efficacyEffect: 0,
            result: 'You develop biomarkers that will enable target engagement measurement and potentially patient selection. This investment pays off in clinical trials where you can demonstrate mechanism.',
            lesson: 'Biomarkers that demonstrate target modulation and predict response are particularly valuable for genetic medicines. They enable patient selection and provide proof of mechanism even if clinical endpoints take years to mature.'
          }
        ]
      }
    ],
    'cell-therapy': [
      {
        id: 'target_selection_cell',
        title: 'Cellular Engineering Strategy',
        scenario: 'Your engineered cell platform must be designed for your target indication. The key strategic question is how extensively to engineer the cells - more engineering adds complexity but may improve efficacy and safety.',
        options: [
          {
            text: 'Minimal engineering - focus on core mechanism',
            detail: 'Simpler manufacturing, established biology',
            cashEffect: -5,
            timeEffect: 0,
            riskBonus: 0.06,
            efficacyEffect: -15,
            result: 'Your straightforward approach enables faster development and simpler manufacturing. Regulatory path is clearer with established precedents.',
            lesson: 'Simpler cell products have manufacturing advantages and clearer regulatory paths. First-generation Chimeric Antigen Receptor T-cell products validated the approach. Trade-off is potentially limited efficacy or persistence compared to more engineered products.'
          },
          {
            text: 'Extensive engineering with multiple modifications',
            detail: 'Innovation potential, manufacturing complexity',
            cashEffect: -10,
            timeEffect: 12,
            riskBonus: -0.05,
            marketBonus: 1.5,
            efficacyEffect: 10,
            result: 'Your heavily engineered cells incorporate multiple modifications for enhanced function. Manufacturing proves more complex and characterization requirements increase substantially.',
            lesson: 'Next-generation cell therapies incorporate safety switches, armoring against immunosuppression, and optimized signaling domains. Each modification adds regulatory complexity but may provide meaningful clinical advantages. The trade-off between sophistication and manufacturability is central to cell therapy development.'
          },
          {
            text: 'Allogeneic platform for off-the-shelf availability',
            detail: 'Scalable manufacturing, requires immune evasion',
            cashEffect: -8,
            timeEffect: 9,
            riskBonus: -0.03,
            marketBonus: 1.3,
            result: 'Your gene editing knocks out T-cell receptor and human leukocyte antigen to create universal donor cells. Manufacturing is scalable but rejection and persistence risks require monitoring.',
            lesson: 'Allogeneic approaches solve logistics but introduce new biology. T-cell receptor knockout prevents graft-versus-host disease; human leukocyte antigen knockout prevents rejection. Long-term persistence data is still accumulating for allogeneic approaches.'
          }
        ]
      }
    ]
  },
  // MODALITY-SPECIFIC DISCOVERY QUESTIONS
  drug_discovery: {
    'small-molecule': [
      {
        id: 'screening_strategy',
        title: 'How will you find lead compounds?',
        scenario: 'You need compounds that modulate your validated target. Traditional high-throughput screening tests large compound libraries. Computational methods design molecules in silico. Fragment-based approaches identify small building blocks.',
        options: [
          {
            text: 'High-Throughput Screening',
            detail: 'Screen compound library for hits',
            cashEffect: -5,
            timeEffect: 0,
            riskBonus: 0.03,
            result: 'High-Throughput Screening identifies several hit series with confirmed activity. The diversity of chemotypes gives you options for lead optimization.',
            lesson: 'High-Throughput Screening remains the workhorse of small molecule discovery. Small molecules (under 900 daltons) can be orally bioavailable: a massive advantage for chronic conditions. The quality of your compound library determines the quality of your hits.'
          },
          {
            text: 'In silico design and modeling',
            detail: 'Computational design, requires structural data',
            cashEffect: -2,
            timeEffect: -3,
            riskBonus: -0.04,
            result: 'Computational methods predict promising scaffolds. When synthesized and tested, some show activity but many do not match predictions.',
            lesson: 'In silico methods accelerate discovery when structural data exists, but predictions must be validated experimentally.'
          },
          {
            text: 'Fragment-based drug discovery',
            detail: 'Small fragments, biophysical methods',
            cashEffect: -3,
            timeEffect: 6,
            riskBonus: 0.05,
            result: 'Fragment screening identifies small, weak binders that provide excellent starting points for rational design.',
            lesson: 'Fragment approaches often yield higher-quality leads with better properties, but require significant chemistry effort.'
          }
        ]
      }
    ],
    'biologic': [
      {
        id: 'antibody_discovery',
        title: 'How will you discover your antibody?',
        scenario: 'You need to find antibodies that bind your target with high affinity and specificity. Phage display screens billions of variants rapidly. Transgenic mice generate fully human antibodies. Single B cell cloning captures natural immune responses.',
        options: [
          {
            text: 'Phage display library screening',
            detail: 'Fast, high diversity, may need humanization',
            cashEffect: -4,
            timeEffect: -3,
            riskBonus: 0.02,
            result: 'Phage display identifies multiple binders. Some require humanization to reduce immunogenicity risk.',
            lesson: 'Phage display offers speed and enormous diversity. Biologics (150+ kDa) must be injected or infused since they cannot survive the gut. Anti-drug antibodies (immunogenicity) are a key clinical risk: fully human sequences reduce but do not eliminate this risk.'
          },
          {
            text: 'Transgenic mouse immunization',
            detail: 'Fully human antibodies, longer timeline',
            cashEffect: -8,
            timeEffect: 6,
            riskBonus: 0.06,
            result: 'Transgenic mice generate fully human antibodies with natural affinity maturation. Less immunogenicity risk in clinic.',
            lesson: 'Fully human antibodies from transgenic mice reduce immunogenicity risk but take longer to generate.'
          },
          {
            text: 'Single B cell cloning',
            detail: 'Natural antibodies from patients/donors',
            cashEffect: -6,
            timeEffect: 3,
            riskBonus: 0.04,
            result: 'B cells from donors with relevant immune responses yield antibodies with proven human relevance.',
            lesson: 'Cloning from natural immunity captures antibodies already validated by the human immune system.'
          }
        ]
      }
    ],
    'genetic-medicine': [
      {
        id: 'delivery_platform',
        title: 'What delivery platform will you use?',
        scenario: 'Genetic medicines require delivery to target tissues. Adeno-Associated Virus (AAV) vectors offer broad tropism but face pre-existing immunity. Lipid nanoparticle delivery works well for liver. N-acetylgalactosamine conjugation is elegant for hepatocytes.',
        options: [
          {
            text: 'Adeno-Associated Virus vector platform',
            detail: 'Broad tissue access, immunity challenges',
            cashEffect: -10,
            timeEffect: 6,
            riskBonus: 0.04,
            result: 'Adeno-Associated Virus provides good tissue transduction but 30-60% of patients have pre-existing antibodies that exclude them from treatment.',
            lesson: 'Adeno-Associated Virus vectors can reach many tissues but pre-existing immunity from natural virus exposure excludes 30-60% of patients. Novel capsids and immunosuppression protocols are being developed to expand eligible populations.'
          },
          {
            text: 'Lipid nanoparticle delivery',
            detail: 'Excellent for liver, limited elsewhere',
            cashEffect: -6,
            timeEffect: 0,
            riskBonus: 0.05,
            result: 'Lipid nanoparticle delivery achieves excellent liver targeting. The platform is well-characterized with established manufacturing.',
            lesson: 'Lipid nanoparticle is the gold standard for liver delivery. The limitation is that non-liver tissues remain difficult to reach.'
          },
          {
            text: 'N-acetylgalactosamine conjugation',
            detail: 'Hepatocyte-specific, elegant chemistry',
            cashEffect: -4,
            timeEffect: -3,
            riskBonus: 0.06,
            result: 'N-acetylgalactosamine elegantly delivers payload directly to hepatocytes via asialoglycoprotein receptor. Manufacturing is straightforward.',
            lesson: 'N-acetylgalactosamine conjugation exemplifies platform power: once validated, new targets can advance rapidly with known delivery.'
          }
        ]
      }
    ],
    'cell-therapy': [
      {
        id: 'cell_source_strategy',
        title: 'What cell source strategy will you pursue?',
        scenario: 'Cell therapy manufacturing begins with sourcing cells. Autologous approaches use each patient\'s own cells collected via leukapheresis. Allogeneic approaches use universal donor cells that require gene editing to prevent rejection. Induced pluripotent stem cell (iPSC)-derived cells offer manufacturing scale but require longer development.',
        options: [
          {
            text: 'Autologous patient-derived T cells',
            detail: 'Personalized, leukapheresis required, 2-4 week vein-to-vein time',
            cashEffect: -10,
            timeEffect: 0,
            riskBonus: 0.05,
            safetyEffect: -10,
            result: 'Each patient\'s cells are collected, engineered, expanded, and reinfused. No rejection risk, but manufacturing is patient-specific and logistics are complex.',
            lesson: 'Autologous cell therapy eliminates rejection but creates logistical challenges. Vein-to-vein time (collection to infusion) can exceed the clinical window for rapidly progressing patients.'
          },
          {
            text: 'Allogeneic universal donor cells',
            detail: 'Off-the-shelf, requires gene editing to avoid graft-versus-host disease',
            cashEffect: -25,
            timeEffect: 12,
            riskBonus: 0.02,
            safetyEffect: 15,
            result: 'Gene editing knocks out T-cell receptor (TCR) and human leukocyte antigen (HLA) to create universal donor cells. Manufacturing is scalable but rejection and graft-versus-host disease risks require monitoring.',
            lesson: 'Allogeneic approaches solve logistics but introduce new biology. T-cell receptor knockout prevents graft-versus-host disease; human leukocyte antigen knockout prevents rejection. Both add development complexity.'
          },
          {
            text: 'Induced pluripotent stem cell-derived engineered cells',
            detail: 'Unlimited source, longer development timeline',
            cashEffect: -35,
            timeEffect: 18,
            riskBonus: -0.02,
            result: 'Induced pluripotent stem cell differentiation provides unlimited cell source. Development timeline is longer but manufacturing economics improve at scale.',
            lesson: 'Induced pluripotent stem cell-derived cells represent the future of cell therapy manufacturing. The challenge is achieving consistent differentiation and demonstrating safety of pluripotent-derived products.'
          }
        ]
      }
    ]
  },
  // MODALITY-SPECIFIC LEAD OPTIMIZATION QUESTIONS
  lead_optimization: {
    'small-molecule': [
      {
        id: 'adme_strategy',
        title: 'How will you optimize drug-like properties?',
        scenario: 'Your lead compound shows excellent target potency but concerning metabolic instability. Chemistry can prioritize metabolic stability (risking potency loss) or maintain potency while accepting higher doses.',
        options: [
          {
            text: 'Prioritize metabolic stability',
            detail: 'Better PK, potential potency trade-off',
            cashEffect: -5, timeEffect: 6, riskBonus: 0.06,
            result: 'Chemistry improves half-life significantly. Some potency is lost but can be compensated with dose adjustment.',
            lesson: 'Poor pharmacokinetics is a major cause of clinical failure. A drug that does not reach its target cannot work.'
          },
          {
            text: 'Maintain potency, accept higher dosing',
            detail: 'Preserve efficacy, larger pills needed',
            cashEffect: -3, timeEffect: 0, riskBonus: -0.04,
            result: 'Your drug requires high doses, increasing API cost and pill burden.',
            lesson: 'Drug-like properties matter beyond efficacy. Patient compliance and manufacturing cost affect real-world effectiveness.'
          },
          {
            text: 'Explore prodrug approach',
            detail: 'Innovative but adds complexity',
            cashEffect: -8, timeEffect: 12, riskBonus: 0.02,
            result: 'The prodrug works, but regulatory and CMC complexity increase.',
            lesson: 'Prodrug strategies can solve PK problems elegantly but add development complexity.'
          }
        ]
      }
    ],
    'biologic': [
      {
        id: 'fc_engineering',
        title: 'How will you engineer your antibody?',
        scenario: 'Your antibody binds target well but half-life is short and effector function needs optimization. Fc engineering can extend half-life, enhance or silence effector function, or create bispecific formats.',
        options: [
          {
            text: 'Extend half-life via Fc modifications',
            detail: 'Less frequent dosing, better compliance',
            cashEffect: -6, timeEffect: 6, riskBonus: 0.05,
            result: 'YTE or similar mutations extend half-life to monthly dosing. Patient convenience improves significantly.',
            lesson: 'Half-life extension reduces dosing frequency, improving patient compliance and potentially allowing outpatient administration.'
          },
          {
            text: 'Enhance effector function (ADCC/CDC)',
            detail: 'Improved cell killing, more safety monitoring',
            cashEffect: -8, timeEffect: 3, riskBonus: 0.03, safetyEffect: 15,
            result: 'Enhanced ADCC improves tumor cell killing but requires careful safety monitoring for cytokine release.',
            lesson: 'Effector function enhancement is a trade-off: more potent killing versus increased risk of immune-related adverse events.'
          },
          {
            text: 'Create bispecific format',
            detail: 'Novel mechanism, complex manufacturing',
            cashEffect: -15, timeEffect: 12, riskBonus: 0.00,
            result: 'Bispecific engages two targets simultaneously. Manufacturing complexity increases substantially.',
            lesson: 'Bispecifics offer novel mechanisms but multiply development challenges. Each arm must be optimized.'
          }
        ]
      }
    ],
    'genetic-medicine': [
      {
        id: 'sequence_optimization',
        title: 'How will you optimize your genetic construct?',
        scenario: 'Your payload shows activity but expression is variable and durability is uncertain. Codon optimization can enhance expression. Promoter choice affects tissue specificity. Modified nucleotides can reduce immunogenicity.',
        options: [
          {
            text: 'Codon optimize for expression',
            detail: 'Higher expression levels',
            cashEffect: -4, timeEffect: 3, riskBonus: 0.04,
            result: 'Codon optimization improves expression 3-5 fold. Manufacturing yields improve as well.',
            lesson: 'Codon optimization is standard practice. Higher expression can mean lower doses and better manufacturing economics. For gene therapy, durability of expression is the key question: will the therapeutic effect last years, decades, or require re-dosing?'
          },
          {
            text: 'Select tissue-specific promoter',
            detail: 'Precise targeting, may limit expression',
            cashEffect: -6, timeEffect: 6, riskBonus: 0.05, safetyEffect: -10,
            result: 'Tissue-specific promoter limits off-target expression, improving safety profile.',
            lesson: 'Promoter selection is critical for safety. Ubiquitous expression may cause toxicity in non-target tissues.'
          },
          {
            text: 'Use modified nucleotides',
            detail: 'Reduce immune activation',
            cashEffect: -8, timeEffect: 6, riskBonus: 0.03, safetyEffect: -15,
            result: 'Modified nucleotides reduce innate immune activation, allowing higher doses.',
            lesson: 'Immune activation limits dosing. Chemical modifications can expand the therapeutic window.'
          }
        ]
      }
    ],
    'cell-therapy': [
      {
        id: 'persistence_optimization',
        title: 'How will you optimize cell persistence?',
        scenario: 'Your engineered cells show initial activity but may exhaust or fail to persist. Incorporating memory phenotypes, adding costimulatory domains, or using cytokine support can improve durability.',
        options: [
          {
            text: 'Optimize costimulatory domains',
            detail: '4-1BB vs CD28, affects persistence vs speed',
            cashEffect: -5, timeEffect: 6, riskBonus: 0.04,
            result: '4-1BB domain provides better persistence while CD28 offers faster expansion. Your choice shapes the kinetics.',
            lesson: 'Costimulatory domain choice is a trade-off: CD28 = faster but shorter; 4-1BB = slower but more durable.'
          },
          {
            text: 'Select for memory phenotype',
            detail: 'Stem cell memory T cells persist longer',
            cashEffect: -8, timeEffect: 9, riskBonus: 0.06,
            result: 'Selecting for Tscm phenotype improves long-term persistence but manufacturing becomes more complex.',
            lesson: 'Cell phenotype at infusion predicts durability. Stem cell memory T cells persist longer than effector cells.'
          },
          {
            text: 'Add cytokine secretion capability',
            detail: 'Self-supporting cells, safety considerations',
            cashEffect: -12, timeEffect: 12, riskBonus: 0.01, safetyEffect: 20,
            result: 'Cytokine-armored cells support themselves but require careful safety monitoring.',
            lesson: 'Autocrine support can sustain cells but adds complexity and safety considerations.'
          }
        ]
      }
    ]
  },
  // MODALITY-SPECIFIC IND-ENABLING QUESTIONS
  ind_enabling: {
    'small-molecule': [
      {
        id: 'tox_species',
        title: 'What toxicology species will you use?',
        scenario: 'FDA requires toxicology in rodent and non-rodent species. Dogs are standard. Minipigs are cheaper but less common. NHP provide best human prediction but raise ethical and cost concerns.',
        options: [
          {
            text: 'Standard package: rat + dog',
            detail: 'Regulatory comfort, established protocols',
            cashEffect: -8, timeEffect: 0, riskBonus: 0.02, safetyEffect: -10,
            result: 'FDA accepts your standard package without questions.',
            lesson: 'Standard species choices reduce regulatory risk. FDA is familiar with rat and dog data interpretation.'
          },
          {
            text: 'Alternative: rat + minipig',
            detail: 'Cost savings, potential questions',
            cashEffect: -5, timeEffect: 0, riskBonus: -0.03, safetyEffect: 10,
            result: 'FDA asks for justification. After providing rationale, they accept.',
            lesson: 'Non-standard species require scientific justification. Cost savings versus regulatory risk.'
          },
          {
            text: 'Enhanced: rat + NHP',
            detail: 'Best prediction, ethical considerations',
            cashEffect: -15, timeEffect: 6, riskBonus: 0.08, safetyEffect: -20,
            result: 'NHP studies identify a signal not seen in dogs. You adjust Phase I protocol accordingly.',
            lesson: 'NHP are most predictive for human safety but require ethical justification.'
          }
        ]
      }
    ],
    'biologic': [
      {
        id: 'cell_line_development',
        title: 'How will you establish your production cell line?',
        scenario: 'Biologics require stable production cell lines. CHO is standard. HEK293 offers faster timelines and better glycosylation for some products. Novel hosts may offer advantages but increase risk.',
        options: [
          {
            text: 'Standard CHO cell line',
            detail: 'Industry standard, regulatory familiarity',
            cashEffect: -10, timeEffect: 6, riskBonus: 0.05, safetyEffect: -5,
            result: 'CHO-derived product has well-understood quality profile. Regulatory path is clear.',
            lesson: 'CHO is the workhorse of biologics manufacturing. Regulatory familiarity reduces risk.'
          },
          {
            text: 'HEK293 for complex glycoproteins',
            detail: 'Better glycosylation, less regulatory history',
            cashEffect: -8, timeEffect: 3, riskBonus: 0.02,
            result: 'HEK293 produces more human-like glycosylation patterns but CMC documentation needs more detail.',
            lesson: 'Cell host affects product quality attributes. Novel hosts may offer advantages but require more characterization.'
          },
          {
            text: 'Accelerated stable pool approach',
            detail: 'Faster to clinic, may need repeat for commercial',
            cashEffect: -5, timeEffect: -6, riskBonus: -0.02,
            result: 'You reach clinic faster but may need to repeat cell line development for commercial manufacturing.',
            lesson: 'Speed to clinic is valuable but rushing cell line work can create problems later.'
          }
        ]
      }
    ],
    'genetic-medicine': [
      {
        id: 'vector_manufacturing',
        title: 'How will you manufacture your vector/delivery system?',
        scenario: 'Manufacturing is often the bottleneck for genetic medicines. Scale, purity, and consistency are critical. In-house versus CMO, suspension versus adherent, and platform versus bespoke all impact timelines.',
        options: [
          {
            text: 'Partner with specialized CMO',
            detail: 'Expertise, but capacity constrained',
            cashEffect: -15, timeEffect: 6, riskBonus: 0.04,
            result: 'CMO provides expertise but slot availability delays your timeline.',
            lesson: 'Vector manufacturing capacity is limited industry-wide. Early CMO engagement is critical.'
          },
          {
            text: 'Build internal manufacturing capability',
            detail: 'Control and flexibility, high upfront cost',
            cashEffect: -40, timeEffect: 18, riskBonus: 0.06,
            result: 'Internal capability provides control over production but requires significant capital investment.',
            lesson: 'Internal manufacturing offers control but the capital commitment is substantial.'
          },
          {
            text: 'Use platform process from partner',
            detail: 'Faster, less customization',
            cashEffect: -10, timeEffect: 0, riskBonus: 0.02,
            result: 'Platform processes speed timeline but may not be optimal for your specific product.',
            lesson: 'Platform approaches trade optimization for speed. Good enough early may limit options later.'
          }
        ]
      }
    ],
    'cell-therapy': [
      {
        id: 'gmp_validation_strategy',
        title: 'How will you establish Good Manufacturing Practice (GMP) manufacturing and release testing?',
        scenario: 'Cell therapy Investigational New Drug applications require detailed Chemistry, Manufacturing, and Controls (CMC) documentation. You must establish Good Manufacturing Practice-compliant manufacturing with validated release testing, potency assays, and stability studies. The Food and Drug Administration\'s Center for Biologics Evaluation and Research Office of Tissues and Advanced Therapies reviews all cell therapy applications.',
        options: [
          {
            text: 'Build internal Good Manufacturing Practice facility with full validation',
            detail: 'High upfront cost, complete control, Foundation for Accreditation of Cellular Therapy accreditation path',
            cashEffect: -45, timeEffect: 18, riskBonus: 0.08, safetyEffect: -15,
            result: 'Your facility achieves Foundation for Accreditation of Cellular Therapy accreditation and Good Manufacturing Practice compliance. Release testing, potency assays, and stability protocols are fully validated. The Food and Drug Administration accepts your Chemistry, Manufacturing, and Controls package without questions.',
            lesson: 'Internal manufacturing provides control over quality systems, SOPs, and capacity. FACT accreditation (Foundation for Accreditation of Cellular Therapy) is the gold standard for cell therapy facilities.'
          },
          {
            text: 'Partner with Foundation for Accreditation of Cellular Therapy-accredited contract manufacturing organization',
            detail: 'External expertise, capacity constraints, cross-reference facility master file',
            cashEffect: -20, timeEffect: 6, riskBonus: 0.04,
            result: 'The contract manufacturing organization provides regulatory expertise and cross-references their Facility Master File in your Investigational New Drug application. Slot availability for commercial scale may become a bottleneck.',
            lesson: 'Contract manufacturing organizations with Food and Drug Administration Type V Facility Master Files on file simplify Investigational New Drug submission. Early engagement is critical: cell therapy manufacturing capacity is constrained industry-wide.'
          },
          {
            text: 'Accelerated platform approach with minimal validation',
            detail: 'Faster to clinic, may require repeat for commercial',
            cashEffect: -12, timeEffect: 0, riskBonus: -0.04, safetyEffect: 10,
            result: 'You reach clinic faster but the Food and Drug Administration requests additional Chemistry, Manufacturing, and Controls information. Validation studies must be repeated for commercial manufacturing.',
            lesson: 'Minimal Chemistry, Manufacturing, and Controls packages can delay approval. The Food and Drug Administration expects detailed release testing, potency assays, and stability data for cell therapy products. Pre-Investigational New Drug meetings are essential to align expectations.'
          }
        ]
      }
    ]
  },
  // MODALITY-SPECIFIC PHASE I QUESTIONS
  phase1_modality: {
    'cell-therapy': [
      {
        id: 'crs_management_strategy',
        title: 'How will you manage Cytokine Release Syndrome risk?',
        scenario: 'Cytokine Release Syndrome and Immune Effector Cell-Associated Neurotoxicity Syndrome are the most serious complications of Chimeric Antigen Receptor T-cell therapy. Your Phase I protocol must include a Risk Evaluation and Mitigation Strategy. Tocilizumab (Interleukin-6 receptor blocker) is Food and Drug Administration-approved for Cytokine Release Syndrome management. Your dose escalation and monitoring strategy will determine the safety profile.',
        options: [
          {
            text: 'Conservative dosing with prophylactic tocilizumab',
            detail: 'Pre-emptive Cytokine Release Syndrome management, may reduce efficacy signal',
            cashEffect: -8, timeEffect: 6, riskBonus: 0.08, safetyEffect: -25,
            result: 'No severe Cytokine Release Syndrome events occur. However, your efficacy signal is modest. Did prophylactic tocilizumab blunt the Chimeric Antigen Receptor T-cell expansion?',
            lesson: 'Prophylactic Cytokine Release Syndrome management prioritizes safety but may confound efficacy assessment. The Interleukin-6 pathway plays a role in Chimeric Antigen Receptor T-cell expansion, so blocking it pre-emptively creates uncertainty about optimal dosing.'
          },
          {
            text: 'Standard dosing with reactive CRS management',
            detail: 'Tocilizumab at Grade 2+ Cytokine Release Syndrome, clearer efficacy signal',
            cashEffect: -5, timeEffect: 0, riskBonus: 0.02, safetyEffect: 10,
            result: 'Two patients experience Grade 3 Cytokine Release Syndrome requiring intensive care unit admission and tocilizumab. Both recover fully. Your efficacy signal is strong.',
            lesson: 'Reactive Cytokine Release Syndrome management accepts higher acute toxicity for clearer efficacy signals. Chimeric Antigen Receptor T-cell infusion centers must have intensive care unit access, neurology consultation, and tocilizumab immediately available per Risk Evaluation and Mitigation Strategy requirements.'
          },
          {
            text: 'Split dosing schedule with fractionated infusion',
            detail: 'Lower peak expansion, reduced Cytokine Release Syndrome, complex protocol',
            cashEffect: -10, timeEffect: 9, riskBonus: 0.04, safetyEffect: -10,
            result: 'Fractionated dosing reduces peak cytokine levels. Cytokine Release Syndrome is manageable. The protocol complexity increases manufacturing and logistics burden.',
            lesson: 'Dose fractionation can reduce Cytokine Release Syndrome severity by slowing Chimeric Antigen Receptor T-cell expansion kinetics. The trade-off is increased protocol complexity and potentially reduced peak efficacy.'
          }
        ]
      }
    ]
  },
  phase1: [
    {
      id: 'dose_escalation',
      title: 'Dose Escalation Design',
      scenario: 'Phase I must establish safety and find the therapeutic dose range. Aggressive escalation reaches efficacy faster but increases adverse event risk. Conservative escalation is safer but slower.',
      options: [
        {
          text: 'Conservative modified Fibonacci escalation',
          detail: 'Slower but safer approach',
          cashEffect: -5,
          timeEffect: 6,
          riskBonus: 0.06,
          safetyEffect: -15, // Conservative = lower safety risk
          result: 'No serious adverse events occur. Your clean safety database builds regulatory confidence and supports aggressive dosing in Phase II.',
          lesson: 'Patient safety is paramount in first-in-human studies. A single serious adverse event can trigger clinical hold, destroying timelines and investor confidence.'
        },
        {
          text: 'Accelerated escalation with sentinel dosing',
          detail: 'Faster dose-finding, requires careful monitoring',
          cashEffect: -3,
          timeEffect: 0,
          riskBonus: -0.06,
          safetyEffect: 20, // Aggressive = higher safety risk
          result: 'At the fourth dose level, a subject experiences Grade 2 liver enzyme elevation. You pause enrollment pending safety review.',
          lesson: 'Accelerated designs can work but require robust safety monitoring. Time saved can evaporate quickly if a safety signal emerges.'
        },
        {
          text: 'Model-informed adaptive design',
          detail: 'Bayesian PK/PD-guided escalation',
          cashEffect: -8,
          timeEffect: 3,
          riskBonus: 0.04,
          result: 'Real-time PK modeling allows optimal dose selection while maintaining safety margins. You identify the therapeutic window efficiently.',
          lesson: 'Modern quantitative pharmacology methods can optimize dose escalation. Investment in PK/PD modeling expertise pays dividends throughout development.'
        }
      ]
    }
  ],
  phase2: [
    {
      id: 'trial_size',
      title: 'Phase II Trial Size',
      scenario: 'Phase II must demonstrate efficacy and identify side effects. According to FDA, only about 33% of drugs pass this phase - the "Valley of Death." Larger trials cost more but provide more confidence.',
      options: [
        {
          text: 'Smaller proof-of-concept study (n=80)',
          detail: 'Capital efficient, higher uncertainty',
          cashEffect: -15,
          timeEffect: 0,
          riskBonus: -0.10,
          designEffect: 20, // Small trial = higher design risk in Phase III
          result: 'You see a positive trend (p=0.08) but the confidence interval crosses zero. Is this a real effect or noise? Your Phase III decision is difficult.',
          lesson: 'Underpowered trials save money but create uncertainty. You might advance a drug that doesn\'t work or kill a drug that does.'
        },
        {
          text: 'Adequately powered study (n=200)',
          detail: 'Standard approach, balanced investment',
          cashEffect: -35,
          timeEffect: 6,
          riskBonus: 0,
          designEffect: -5, // Adequate = slightly lower risk
          result: 'Your trial demonstrates statistically significant efficacy (p=0.01). The effect size is clear enough to design efficient Phase III studies.',
          lesson: 'Adequate powering provides reliable go/no-go decisions and data to design efficient Phase III trials.'
        },
        {
          text: 'Large registrational-quality study (n=400)',
          detail: 'Higher investment, substantial de-risking',
          cashEffect: -60,
          timeEffect: 12,
          riskBonus: 0.12,
          designEffect: -15, // Large trial = much lower design risk
          efficacyEffect: -10, // Also reduces efficacy uncertainty
          result: 'Definitive efficacy data substantially de-risks Phase III. The FDA suggests your data might support accelerated approval.',
          lesson: 'Larger Phase II trials generate the most valuable data in drug development. Given Phase III costs, front-loading evidence can be capital-efficient.'
        }
      ]
    }
  ],
  phase3: [
    {
      id: 'pivotal_design',
      title: 'Pivotal Program Architecture',
      scenario: 'Phase III requires hundreds of millions in investment. FDA generally expects two adequate and well-controlled trials. Only 25-30% of drugs pass this phase.',
      options: [
        {
          text: 'Single large pivotal trial (n=1,500)',
          detail: 'Cost-efficient, concentration risk',
          cashEffect: -120,
          timeEffect: 0,
          riskBonus: -0.10,
          designEffect: 25, // Single trial = high design risk
          result: 'Enrollment issues at several sites compromise data quality. With no backup trial, your entire program depends on salvaging the analysis.',
          lesson: 'Single pivotal trials concentrate risk catastrophically. Site issues or bad luck in patient selection can sink years of work with no recovery.'
        },
        {
          text: 'Two replicate trials (n=750 each)',
          detail: 'FDA preferred, regulatory gold standard',
          cashEffect: -160,
          timeEffect: 6,
          riskBonus: 0.08,
          designEffect: -20, // Gold standard = much lower design risk
          result: 'Both trials demonstrate consistent efficacy. The replication provides bulletproof evidence. FDA reviewers note the robust data package.',
          lesson: 'Replication is the foundation of scientific confidence. Two positive trials provide robustness against random variation and site-specific effects.'
        },
        {
          text: 'Adaptive platform trial design',
          detail: 'Innovative, requires FDA alignment',
          cashEffect: -140,
          timeEffect: -6,
          riskBonus: 0.05,
          result: 'After extensive pre-submission meetings, FDA agrees to your adaptive design. The seamless approach saves time while maintaining rigor.',
          lesson: 'Innovative trial designs can provide efficiency advantages with regulatory alignment. Early FDA engagement is essential.'
        }
      ]
    }
  ],
  fda_review: {
    'small-molecule': [
      {
        id: 'pricing_sm',
        title: 'Pricing and Access Strategy',
        scenario: 'FDA approval is imminent. Health economic analyses support value-based pricing of $150,000/year for your oral therapy, reflecting the clinical benefit. But drug pricing scrutiny is intense.',
        options: [
          {
            text: 'Value-based pricing ($150,000/year)',
            detail: 'Reflects clinical benefit, public scrutiny risk',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 1.0,
            result: 'Your pricing is economically justified but generates media attention. Congressional staffers request a briefing on your pricing rationale.',
            lesson: 'Value-based pricing reflects genuine clinical benefit and R&D investment. But the industry has not yet earned the public trust for this approach to be politically sustainable.'
          },
          {
            text: 'Market-competitive pricing ($80,000/year)',
            detail: 'Below value, sustainable positioning',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 0.55,
            result: 'Lower pricing is well-received publicly, but investors question your ability to fund future R&D. Your stock drops 15%.',
            lesson: 'Pricing below value may feel responsible but creates tension: returns from successful drugs fund the ~90% that fail. Underpricing undermines future innovation.'
          },
          {
            text: 'Outcomes-based contracts',
            detail: 'Performance-linked pricing, implementation complexity',
            cashEffect: -10,
            timeEffect: 6,
            marketBonus: 0.8,
            result: 'You offer payers pricing that depends on real-world outcomes. Implementation is complex, but alignment between price and value builds trust.',
            lesson: 'Outcomes-based contracts align price with the value patients actually receive. This requires robust real-world evidence infrastructure.'
          }
        ]
      }
    ],
    'biologic': [
      {
        id: 'pricing_bio',
        title: 'Pricing and Access Strategy',
        scenario: 'FDA approval is imminent for your injectable biologic. Health economic analyses support value-based pricing of $50,000-80,000/year. But biosimilar competition is a future concern.',
        options: [
          {
            text: 'Premium pricing ($80,000/year)',
            detail: 'Reflects innovation, build reserves before biosimilars',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 1.0,
            result: 'Your premium pricing maximizes returns during exclusivity. You begin building reserves for future R&D before biosimilar entry.',
            lesson: 'Biologics command premium pricing during exclusivity, but biosimilar entry (typically 50-80% discount) is inevitable. Building R&D reserves during exclusivity funds future innovation.'
          },
          {
            text: 'Sustainable pricing ($50,000/year)',
            detail: 'Broader access, may delay biosimilar entry',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 0.65,
            result: 'Moderate pricing expands access. Some analysts suggest this may reduce biosimilar attractiveness, extending your market position.',
            lesson: 'Lower pricing can expand the treated patient population and may reduce biosimilar commercial incentives.'
          },
          {
            text: 'Outcomes-based contracts',
            detail: 'Performance-linked pricing, implementation complexity',
            cashEffect: -10,
            timeEffect: 6,
            marketBonus: 0.8,
            result: 'You offer payers pricing that depends on real-world outcomes. Implementation is complex, but alignment between price and value builds trust.',
            lesson: 'Outcomes-based contracts align price with the value patients actually receive. This requires robust real-world evidence infrastructure.'
          }
        ]
      }
    ],
    'genetic-medicine': [
      {
        id: 'pricing_gene',
        title: 'Genetic Medicine Pricing Strategy',
        scenario: 'FDA approval is imminent for your genetic therapy. Your pricing strategy depends on your product type: siRNA therapies typically price at $20,000-40,000/year for chronic dosing, while one-time gene therapies may command $500K-3M reflecting curative potential.',
        options: [
          {
            text: 'Annual subscription pricing (~$30,000/year)',
            detail: 'For siRNA/RNAi: chronic therapy model like specialty biologics',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 0.9,
            result: 'Your siRNA therapy is priced competitively with specialty biologics. Patients receive periodic subcutaneous injections at home or in clinic.',
            lesson: 'siRNA therapies (like GalNAc-conjugated) can be manufactured, shipped, and self-administered like subcutaneous biologics. Pricing reflects chronic treatment economics.'
          },
          {
            text: 'One-time curative pricing ($1-2 million)',
            detail: 'For AAV gene therapy: reflects lifetime value and specialized centers',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 1.0,
            result: 'Your gene therapy pricing reflects lifetime value, but requires specialized centers and outcomes-based contracts to manage payer concerns.',
            lesson: 'AAV gene therapies offer potential cures but require cold-chain logistics, specialized administration centers, and innovative payment models for multi-million dollar one-time costs.'
          },
          {
            text: 'Outcomes-based subscription model',
            detail: 'Pay only if therapy maintains effect, requires long-term monitoring',
            cashEffect: -15,
            timeEffect: 12,
            marketBonus: 0.85,
            result: 'Your payment-for-durability model requires extensive real-world evidence infrastructure. Payers appreciate the risk sharing.',
            lesson: 'Outcomes-based payment aligns incentives for both chronic siRNA and curative gene therapies. Demonstrating durability enables continued payments.'
          }
        ]
      }
    ],
    'cell-therapy': [
      {
        id: 'pricing_cell',
        title: 'One-Time Curative Pricing Strategy',
        scenario: 'FDA approval is imminent for your cell therapy. Manufacturing costs are $500K+ per patient. Health economic analyses support pricing of $400,000-500,000, reflecting clinical benefit in patients with limited options.',
        options: [
          {
            text: 'Cost-plus pricing ($450,000 one-time)',
            detail: 'Covers manufacturing plus modest margin',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 0.7,
            result: 'Your pricing barely covers manufacturing costs and development investment. Margins are thin, but access is maximized.',
            lesson: 'Cell therapy manufacturing is inherently expensive: patient-specific production, complex logistics, specialized facilities. Cost-plus pricing may be necessary to achieve any margin.'
          },
          {
            text: 'Value-based premium ($500,000 one-time)',
            detail: 'Reflects clinical value for refractory patients',
            cashEffect: 0,
            timeEffect: 0,
            marketBonus: 1.0,
            result: 'Premium pricing reflects the transformative benefit for patients who have failed all other options. Some payers balk at the cost.',
            lesson: 'Cell therapies often treat patients who have exhausted all alternatives. Value-based pricing reflects the absence of other options, not comparator pricing.'
          },
          {
            text: 'Outcomes-based warranty model',
            detail: 'Refund if response not durable, requires follow-up',
            cashEffect: -10,
            timeEffect: 6,
            marketBonus: 0.9,
            result: 'You offer partial refunds if patients do not achieve durable response. This requires robust tracking of outcomes post-infusion.',
            lesson: 'Outcomes-based warranties for cell therapy align payment with response. This requires defining durable response criteria and tracking patients long-term.'
          }
        ]
      }
    ]
  },
  post_market: [
    {
      phase: 'post_market',
      title: 'Real-World Evidence and Market Expansion',
      scenario: `At a major medical conference, a key opinion leader presents case studies of off-label use in related indications. Off-label prescribing is increasing. Your therapy is approved for one indication, but emerging evidence suggests benefit in other patient populations. Each supplemental indication requires clinical investment and regulatory approval.`,
      options: [
        {
          text: 'Invest in additional clinical trials for new indications',
          detail: 'Expand label through rigorous evidence',
          cashEffect: -50,
          timeEffect: 36,
          marketBonus: 1.4,
          designEffect: -10,
          result: 'You run pivotal trials for a second indication. Success expands your market significantly and builds evidence base. But it\'s expensive and takes years.',
          lesson: 'Label expansion through clinical trials is the gold standard. Rigorous evidence protects patients and builds trust. Each approved indication represents patients who can be treated with confidence.'
        },
        {
          text: 'Generate real-world evidence to support broader use',
          detail: 'Observational studies, registry data',
          cashEffect: -10,
          timeEffect: 12,
          marketBonus: 0.3,
          result: 'You partner with academic centers to study real-world outcomes. This generates hypothesis-generating data but doesn\'t change the label.',
          lesson: 'Real-world evidence complements but doesn\'t replace clinical trials. It reveals how drugs perform outside controlled settings, in diverse populations, with comorbidities.'
        },
        {
          text: 'Focus on original approved indication only',
          detail: 'Concentrate resources, avoid expansion risk',
          cashEffect: 0,
          marketBonus: 0.1,
          result: 'You focus only on the approved indication. Lower risk, but competitors may expand into adjacent spaces.',
          lesson: 'Not every drug needs to be a platform. Focused execution in one indication can be valuable, especially for rare diseases where the patient population is well-defined.'
        }
      ]
    },
    {
      phase: 'post_market',
      title: 'Distribution and Delivery Strategy',
      scenario: `Your biologic therapy is FDA-approved. Delivery format affects patient access and adherence. Some biologics require IV infusion at healthcare facilities, while others can be self-administered subcutaneously at home. Your operations team presents strategic options for your commercial launch.`,
      options: [
        {
          text: 'Partner with infusion center networks',
          detail: 'Improve site access and administration capacity',
          cashEffect: -15,
          marketBonus: 0.7,
          result: 'You establish partnerships with national infusion center networks. This improves geographic access for patients requiring in-office or infusion center administration. Site capacity expands to meet demand.',
          lesson: 'Infusion center partnerships address the "last mile" problem for IV therapies. Geographic coverage and appointment availability directly impact whether approved therapies reach patients.'
        },
        {
          text: 'Develop subcutaneous formulation',
          detail: 'Enable self-injection at home',
          cashEffect: -30,
          timeEffect: 24,
          marketBonus: 1.2,
          result: 'You invest in reformulating for subcutaneous delivery. After additional clinical studies, patients can self-administer at home. Adherence improves significantly, but development takes two years.',
          lesson: 'Subcutaneous formulations transform the patient experience. Home administration reduces healthcare system burden and improves adherence. The investment in reformulation often yields significant competitive advantage.'
        },
        {
          text: 'Focus on specialty pharmacy partnerships',
          detail: 'Leverage existing distribution infrastructure',
          cashEffect: 0,
          marketBonus: 0.5,
          result: 'You rely on specialty pharmacies for distribution. This minimizes upfront investment but limits your control over patient experience and may constrain access in underserved areas.',
          lesson: 'Specialty pharmacies provide established infrastructure but introduce intermediaries between manufacturer and patient. Distribution strategy reflects trade-offs between capital efficiency and market control.'
        }
      ]
    }
  ],
  patient_access: [
    {
      phase: 'patient_access',
      title: 'How will you navigate PBM formulary access?',
      scenario: `FDA approval gives you permission to sell your drug, but Pharmacy Benefit Managers (PBMs) decide whether patients can actually access it. These intermediaries control formulary placement, negotiate rebates, and manage pharmacy networks. Your commercial team must now secure a position that balances access with profitability.

The Reality: PBMs act as gatekeepers between you and patients. Patient cost-sharing is calculated from list price, not net price after rebates. Formulary placement determines whether doctors can prescribe and patients can afford your drug.`,
      options: [
        {
          text: 'Pay heavy rebates for preferred formulary placement',
          detail: 'Guarantees broad access, 40-60% revenue to rebates',
          cashEffect: 0,
          marketBonus: 0.85,
          revenueEffect: -0.35,
          result: 'You secure broad access but net revenue per prescription is much lower than list price. PBMs capture a large share of your value.',
          lesson: 'The gap between list price and net price reveals who captures value. For specialty drugs, PBM rebates and fees can exceed 40% of list price. FDA approval means you CAN sell; formulary placement determines if you WILL sell.'
        },
        {
          text: 'Limited formulary with patient assistance programs',
          detail: 'Lower access, copay cards offset patient costs',
          cashEffect: -8,
          marketBonus: 0.5,
          revenueEffect: -0.15,
          result: 'Lower formulary coverage means fewer patients, but your copay assistance programs help those who get prescriptions. You maintain higher net revenue per patient.',
          lesson: 'Copay assistance programs help patients afford their out-of-pocket costs, but do not address the underlying benefit design. Cost-sharing requirements create access barriers regardless of list price.'
        },
        {
          text: 'Specialty pharmacy exclusive distribution',
          detail: 'PBM-owned specialty pharmacy controls distribution',
          cashEffect: 0,
          marketBonus: 0.7,
          revenueEffect: -0.25,
          efficacyEffect: 10,
          result: 'PBM-owned specialty pharmacy manages distribution. Access depends on the specialty pharmacy network\'s interests and capabilities.',
          lesson: 'The three largest PBMs each own specialty pharmacies. Vertical integration creates potential conflicts between cost management and patient access that policymakers continue to examine.'
        }
      ]
    },
    {
      phase: 'patient_access',
      title: 'Patient Out-of-Pocket Cost Crisis',
      scenario: `Patients are abandoning prescriptions at the pharmacy counter. Even with insurance, cost-sharing through copays and coinsurance creates barriers. Some benefit designs use "copay accumulators" that don't count manufacturer assistance toward deductibles. The result: insured patients who cannot afford their medication.`,
      options: [
        {
          text: 'Launch robust copay assistance program',
          detail: 'Bridge copay gap for commercially insured',
          cashEffect: -15,
          marketBonus: 0.9,
          revenueEffect: -0.1,
          result: 'Your copay assistance program addresses immediate patient cost-sharing barriers. Adherence improves significantly. However, this solution is limited to commercial insurance; federal healthcare programs prohibit manufacturer copay assistance.',
          lesson: 'Copay assistance programs address immediate access barriers but do not resolve underlying benefit design issues. If a therapy is covered by insurance, cost-sharing structures should not create prohibitive access barriers.'
        },
        {
          text: 'Work with patient advocacy groups',
          detail: 'Build grassroots support for access',
          cashEffect: -5,
          marketBonus: 0.6,
          designEffect: -5,
          result: 'Patient advocates document and publicize access barriers. This builds political momentum for policy reform but does not resolve immediate access challenges.',
          lesson: 'Patient advocacy organizations articulate the real-world impact of access barriers. Their documentation of individual patient experiences informs policy discussions but systemic change requires legislative or regulatory action.'
        },
        {
          text: 'Accept access limitations',
          detail: 'Focus on patients who can afford cost-sharing',
          cashEffect: 0,
          marketBonus: 0.3,
          result: 'You accept that access will be limited to patients who can afford prevailing cost-sharing requirements. This approach accepts incomplete market penetration.',
          lesson: 'Developing a therapy that covered patients cannot access represents an incomplete fulfillment of the development mission. Regulatory approval establishes efficacy; market access determines patient benefit.'
        }
      ]
    },
    {
      phase: 'patient_access',
      title: 'The System Reform Question',
      scenario: `You're testifying before Congress. A Senator asks: "Your company spent over a decade and a billion dollars developing this therapy. It works. Yet my constituents can't afford it despite having insurance. What reforms would you recommend?" You've experienced the full journey: the 90%+ failure rate, the capital intensity, and now the access barriers.`,
      options: [
        {
          text: 'Recommend direct price controls on pharmaceuticals',
          detail: 'Government-established maximum prices',
          cashEffect: 0,
          marketBonus: 0.4,
          result: 'Price controls reduce manufacturer revenue but do not address the underlying access challenge. Patients continue to face cost-sharing requirements because insurance benefit design remains unchanged. Reduced revenue diminishes capital available for future R&D investment.',
          lesson: 'Price controls address revenue without addressing access. If insurance coverage includes the therapy, cost-sharing structures determine patient access. The policy question is not pharmaceutical pricing alone, but the interaction between pricing and benefit design.'
        },
        {
          text: 'Recommend insurance cost-sharing reform',
          detail: 'Cap patient out-of-pocket costs, prohibit copay accumulator programs',
          cashEffect: 0,
          marketBonus: 0.9,
          result: 'Insurance benefit reform addresses the structural access gap: patients currently bear cost-sharing obligations in addition to premium contributions. When covered therapies become accessible without prohibitive cost-sharing, the system functions as intended. Innovation incentives remain intact.',
          lesson: 'Patients contribute through insurance premiums. Cost-sharing requirements create an additional access barrier for covered therapies. Policy solutions include capping out-of-pocket maximums and prohibiting accumulator programs. These reforms address access without disrupting pharmaceutical innovation economics.'
        },
        {
          text: 'Recommend supply chain transparency requirements',
          detail: 'PBM disclosure requirements, rebate pass-through mandates',
          cashEffect: 0,
          marketBonus: 0.7,
          result: 'Transparency requirements reveal the distribution of pharmaceutical value across the supply chain, including PBM rebate retention. This information enables informed policy discussion but does not directly resolve patient access barriers.',
          lesson: 'Transparency is a necessary but insufficient condition for reform. Understanding value distribution across the supply chain informs targeted policy interventions. Fiduciary duty requirements for PBMs and rebate pass-through mandates represent potential applications of transparency findings.'
        }
      ]
    },
    // GCEA Value Flower Framework Questions (Shafrin et al. 2024)
    {
      phase: 'patient_access',
      title: 'How will you demonstrate value to payers under outcome uncertainty?',
      scenario: `Traditional cost-effectiveness analysis uses Quality-Adjusted Life Years (QALYs) based on clinical trial data. However, your therapy's long-term outcomes remain uncertain. The Generalized Cost-Effectiveness Analysis (GCEA) framework recognizes that payers face "outcome uncertainty" when making coverage decisions. Your health economics team proposes different approaches to address this uncertainty gap.

The Reality: Payers increasingly demand real-world evidence, not just trial results. Outcomes-based contracts can share risk between manufacturers and payers, but require robust data infrastructure.`,
      options: [
        {
          text: 'Real-world evidence commitment with value-based pricing',
          detail: 'Lower launch price, escalating based on demonstrated outcomes',
          cashEffect: -10,
          marketBonus: 0.85,
          revenueEffect: -0.2,
          result: 'You launch at a lower price with contractual commitments to collect real-world evidence. If outcomes match or exceed trial results, price increases are permitted. This approach reduces payer risk and accelerates coverage decisions.',
          lesson: 'The GCEA framework recognizes "outcome certainty" as a distinct value element. When long-term outcomes are uncertain, value-based pricing arrangements can bridge the evidence gap. Real-world evidence infrastructure is an investment that pays dividends across your portfolio.'
        },
        {
          text: 'Outcomes-based contracting with money-back guarantee',
          detail: 'Full price with rebates for non-responders',
          cashEffect: -5,
          marketBonus: 0.75,
          revenueEffect: -0.15,
          result: 'Payers appreciate the risk-sharing but implementation proves complex. Defining "response" and tracking individual patient outcomes requires data infrastructure that many health systems lack.',
          lesson: 'Outcomes-based contracts align manufacturer and payer incentives around patient outcomes. However, execution requires agreement on outcome definitions, measurement timing, and data sharing. The administrative burden can exceed the value for therapies with high response rates.'
        },
        {
          text: 'Traditional fixed pricing with comprehensive trial dossier',
          detail: 'Standard approach based on Phase III data',
          cashEffect: 0,
          marketBonus: 0.55,
          revenueEffect: 0,
          result: 'Some payers accept your trial evidence, but others impose step therapy or prior authorization requirements, citing uncertainty about real-world performance. Access is slower and more variable across payer segments.',
          lesson: 'Relying solely on clinical trial evidence leaves payers bearing all outcome uncertainty. The GCEA framework suggests that therapies with greater outcome certainty warrant premium pricing. Manufacturers who invest in reducing uncertainty can capture more value.'
        }
      ]
    },
    {
      phase: 'patient_access',
      title: 'How will you address equity in patient access?',
      scenario: `Your therapy works across all patient populations, but access is uneven. Patients in well-resourced health systems get rapid access while those in underserved communities face delays and denials. The GCEA framework explicitly includes "equity" as a value element - recognizing that society may place additional value on therapies that reach underserved populations.

The Reality: Health equity has become a boardroom priority. Institutional investors, regulators, and patient advocates all scrutinize whether breakthrough therapies reach the patients who need them most.`,
      options: [
        {
          text: 'Income-based tiered patient assistance with equity metrics',
          detail: 'Copay support scaled to income, public equity reporting',
          cashEffect: -20,
          marketBonus: 0.9,
          result: 'Your tiered assistance program ensures that out-of-pocket costs never exceed a percentage of household income. Public reporting of access metrics by demographic group demonstrates commitment to equity and builds trust with advocacy organizations.',
          lesson: 'The GCEA framework values equity explicitly: society may prefer therapies that reduce health disparities. Manufacturers who design access programs with equity in mind - and measure their effectiveness - can differentiate their products and build durable relationships with stakeholders.'
        },
        {
          text: 'Single global reference price with universal access commitment',
          detail: 'Same price worldwide, maximize access over revenue',
          cashEffect: -15,
          marketBonus: 0.7,
          revenueEffect: -0.3,
          result: 'A single global price prevents arbitrage and signals commitment to equity. However, lower revenue constrains investment in future research and development. Some shareholders question whether this approach maximizes long-term value.',
          lesson: 'Global reference pricing eliminates the tension between affordability and arbitrage but may not maximize either access or innovation over time. The pharmaceutical ecosystem depends on returns sufficient to fund the next generation of therapies.'
        },
        {
          text: 'Market-based pricing with standard copay assistance',
          detail: 'Maximize revenue, standard industry assistance programs',
          cashEffect: 0,
          marketBonus: 0.5,
          result: 'Standard copay assistance helps commercially insured patients, but access gaps persist for underserved populations. Advocacy groups and media document disparities, creating reputational risk.',
          lesson: 'Standard assistance programs help patients who can navigate them, but often fail to reach the most vulnerable. The GCEA framework suggests that failing to address equity represents uncaptured societal value - and increasingly, uncaptured commercial value as stakeholders prioritize health equity.'
        }
      ]
    },
    {
      phase: 'patient_access',
      title: 'How will you capture broader societal value beyond clinical endpoints?',
      scenario: `Your therapy keeps patients working, reduces caregiver burden, and generates scientific knowledge that benefits future research. Traditional cost-effectiveness analysis focuses narrowly on patient health outcomes. The GCEA framework includes productivity gains, caregiver spillovers, and scientific spillovers as legitimate value elements.

The Reality: Employers lose billions annually to disease-related productivity loss. Caregivers reduce work hours or exit the workforce entirely. Your therapy addresses these burdens, but payers focus on direct medical costs.`,
      options: [
        {
          text: 'Submit full GCEA value dossier including productivity and caregiver impact',
          detail: 'Comprehensive societal value case to all stakeholders',
          cashEffect: -8,
          marketBonus: 0.8,
          result: 'Your dossier documents productivity gains, reduced caregiver burden, and scientific contributions. Some innovative payers incorporate these elements into coverage decisions. Employer groups become advocates for coverage.',
          lesson: 'The GCEA framework legitimizes broader value capture. Productivity spillovers (patients returning to work), caregiver spillovers (family members freed from care duties), and scientific spillovers (knowledge enabling future innovation) all represent real value. Manufacturers who document these elements expand the value conversation.'
        },
        {
          text: 'Partner with self-insured employers on productivity-based contracts',
          detail: 'Direct contracting with employers who capture productivity value',
          cashEffect: -5,
          marketBonus: 0.65,
          revenueEffect: 0.1,
          result: 'Large self-insured employers enthusiastically adopt your therapy - they directly benefit from reduced absenteeism and disability claims. This channel grows faster than traditional payer coverage.',
          lesson: 'Self-insured employers capture productivity value directly, making them natural partners for therapies that keep workers healthy. The GCEA framework\'s productivity element aligns manufacturer and employer incentives. This market segment often moves faster than traditional payers.'
        },
        {
          text: 'Focus exclusively on clinical endpoints in traditional cost-effectiveness framework',
          detail: 'Standard QALY-based value demonstration',
          cashEffect: 0,
          marketBonus: 0.5,
          result: 'Your traditional cost-effectiveness analysis meets basic payer requirements but fails to differentiate your therapy. Payers treat your drug as a commodity, pressuring for lowest-cost alternatives.',
          lesson: 'Traditional cost-effectiveness frameworks capture only a portion of your therapy\'s value. The GCEA framework identifies value elements that conventional analysis ignores: productivity, caregiver burden, option value, and scientific spillovers. Manufacturers who accept narrow framing leave value on the table.'
        }
      ]
    }
  ]
};

// Random events by phase
const EVENTS = {
  basic_research: [
    { title: 'Genetic Validation', description: 'A large GWAS study confirms your target is genetically linked to disease - the strongest form of target validation.', cashEffect: 0, timeEffect: 0, riskBonus: 0.06, positive: true },
    { title: 'Competing Publication', description: 'A competitor publishes data on the same target, validating the biology but accelerating the competitive timeline.', cashEffect: 0, timeEffect: -3, riskBonus: 0.02, positive: true },
    { title: 'Key Researcher Departs', description: 'Your lead biologist leaves for academia, taking deep target knowledge. Rebuilding expertise takes time.', cashEffect: -1, timeEffect: 6, positive: false }
  ],
  drug_discovery: [
    { title: 'HTS Success', description: 'High-throughput screening identifies multiple chemically diverse hit series, providing excellent starting points.', cashEffect: 0, timeEffect: -3, riskBonus: 0.04, positive: true },
    { title: 'Assay Artifacts', description: 'Many apparent hits turn out to be assay artifacts. Hit confirmation rate is lower than expected.', cashEffect: -2, timeEffect: 3, positive: false },
    { title: 'Structure Solved', description: 'Crystallography provides a high-resolution structure of your target, enabling structure-based drug design.', cashEffect: 0, timeEffect: -6, riskBonus: 0.05, positive: true }
  ],
  lead_optimization: [
    { title: 'SAR Breakthrough', description: 'A key structure-activity relationship insight unlocks dramatic improvements in potency and selectivity.', cashEffect: 0, timeEffect: -6, riskBonus: 0.05, positive: true },
    { title: 'Metabolite Liability', description: 'Studies reveal your lead generates a reactive metabolite. Chemistry must redesign the scaffold.', cashEffect: -5, timeEffect: 9, positive: false },
    { title: 'Off-Target Activity', description: 'Selectivity screening reveals activity against hERG channel - a cardiac liability that must be designed out.', cashEffect: -3, timeEffect: 6, positive: false }
  ],
  ind_enabling: [
    { title: 'Unexpected Toxicity', description: 'GLP toxicology reveals unexpected hepatotoxicity at high doses. Additional mechanistic studies required.', cashEffect: -8, timeEffect: 9, positive: false },
    { title: 'Positive Pre-IND Meeting', description: 'FDA concurs with your development plan and indicates potential Fast Track eligibility.', cashEffect: 0, timeEffect: -3, riskBonus: 0.06, positive: true },
    { title: 'CMC Success', description: 'Process chemistry achieves excellent yield and purity, simplifying scale-up and reducing API cost.', cashEffect: 5, timeEffect: -3, positive: true }
  ],
  phase1: [
    { title: 'Favorable Human PK', description: 'Human pharmacokinetics exceed predictions - longer half-life enables once-daily dosing.', cashEffect: 0, timeEffect: -3, riskBonus: 0.06, positive: true },
    { title: 'Clinical Hold', description: 'An adverse event triggers FDA clinical hold. Dosing suspended pending investigation.', cashEffect: -5, timeEffect: 9, positive: false },
    { title: 'Clean Safety Profile', description: 'Maximum tolerated dose established with mild, manageable side effects. No dose-limiting toxicities observed.', cashEffect: 0, timeEffect: 0, riskBonus: 0.05, positive: true },
    { title: 'MTD Established', description: 'Phase I successfully establishes the recommended Phase II dose with acceptable tolerability.', cashEffect: 0, timeEffect: -2, riskBonus: 0.04, positive: true }
  ],
  phase2: [
    { title: 'Enrollment Challenges', description: 'Competing trials and restrictive eligibility slow recruitment. Additional sites required.', cashEffect: -10, timeEffect: 9, positive: false },
    { title: 'Competitor Failure', description: 'A competing Phase III program fails, creating opportunity for your differentiated approach.', cashEffect: 0, timeEffect: 0, riskBonus: 0.05, marketBonus: 1.2, positive: true },
    { title: 'Partnership Offer', description: 'A large pharma proposes co-development: $100M upfront, shared costs, 50% profit share.', cashEffect: 100, revenueShare: 0.5, positive: true, isPartnership: true }
  ],
  phase3: [
    { title: 'Supply Chain Disruption', description: 'Critical raw material shortages threaten clinical supply. Emergency supplier qualification required.', cashEffect: -25, timeEffect: 6, positive: false },
    { title: 'Positive Interim Analysis', description: 'DSMB reports efficacy exceeding expectations. Trial may complete ahead of schedule.', cashEffect: 0, timeEffect: -6, riskBonus: 0.08, positive: true },
    { title: 'Label Expansion Signal', description: 'Subgroup analyses suggest efficacy in additional population, increasing market opportunity.', marketBonus: 1.3, positive: true }
  ],
  fda_review: [
    { title: 'Advisory Committee Split', description: 'The Advisory Committee votes 8-7 in favor. Approval likely but label negotiations may be difficult.', cashEffect: 0, timeEffect: 3, positive: false },
    { title: 'Priority Review Granted', description: 'FDA grants Priority Review, reducing timeline from ten months to six.', cashEffect: 0, timeEffect: -4, positive: true }
  ],
  post_market: [
    { title: 'Real-World Evidence Positive', description: 'Post-market studies confirm efficacy and safety in broader patient population.', cashEffect: 0, timeEffect: 0, riskBonus: 0.02, positive: true },
    { title: 'Safety Signal Detected', description: 'MedWatch reports identify a rare adverse event requiring label update and risk communication.', cashEffect: -5, timeEffect: 3, positive: false }
  ]
};

// Modality-specific events - "Modalities fail in predictable, non-random ways"
const MODALITY_EVENTS = {
  'small-molecule': {
    lead_optimization: [
      { title: 'CYP Liability Discovered', description: 'Your compound is a strong CYP3A4 inhibitor, creating drug-drug interaction concerns. Must redesign the scaffold.', cashEffect: -8, timeEffect: 9, positive: false, failureMode: 'Metabolic liabilities' },
      { title: 'Selectivity Achieved', description: 'Medicinal chemistry achieves 100-fold selectivity over related kinases. Clean safety profile expected.', cashEffect: 0, timeEffect: -3, riskBonus: 0.06, positive: true }
    ],
    phase1: [
      { title: 'No PD Shift Despite Clean PK', description: 'Your drug shows excellent PK, but pathway biomarkers don\'t move. The target may not be causal in humans.', cashEffect: -5, timeEffect: 6, riskBonus: -0.15, positive: false, failureMode: 'Target not causal' }
    ],
    phase2: [
      { title: 'Narrow Therapeutic Window', description: 'Efficacious doses are close to toxic doses. Dose optimization becomes difficult.', cashEffect: -10, timeEffect: 6, riskBonus: -0.08, positive: false, failureMode: 'Narrow therapeutic window' }
    ]
  },
  'biologic': {
    lead_optimization: [
      { title: 'Affinity Maturation Success', description: 'Phage display generates antibodies with sub-nanomolar affinity. Strong target binding confirmed.', cashEffect: 0, timeEffect: -6, riskBonus: 0.05, positive: true },
      { title: 'Poor Tissue Penetration', description: 'Large molecule size limits tumor penetration. Consider antibody fragment or alternative format.', cashEffect: -5, timeEffect: 6, riskBonus: -0.05, positive: false, failureMode: 'Poor tissue penetration' }
    ],
    phase1: [
      { title: 'Anti-Drug Antibodies (ADA)', description: 'Patients develop neutralizing antibodies, reducing efficacy over time.', cashEffect: -8, timeEffect: 6, riskBonus: -0.10, positive: false, failureMode: 'Immunogenicity' }
    ],
    phase2: [
      { title: 'Target Neutralized But No Benefit', description: 'Complete target suppression confirmed, but no clinical improvement. Biology redundancy suspected.', cashEffect: -15, timeEffect: 6, riskBonus: -0.12, positive: false, failureMode: 'Biology redundancy' }
    ]
  },
  'gene-therapy': {
    ind_enabling: [
      { title: 'Pre-existing AAV Immunity', description: '40% of screened patients have neutralizing antibodies. Patient pool significantly reduced.', cashEffect: -10, timeEffect: 6, riskBonus: -0.08, positive: false, failureMode: 'Pre-existing immunity' },
      { title: 'Novel Capsid Success', description: 'Your engineered capsid evades pre-existing immunity and shows enhanced tissue tropism.', cashEffect: 0, timeEffect: -6, riskBonus: 0.08, positive: true }
    ],
    phase1: [
      { title: 'Dose-Limiting Toxicity', description: 'Hepatotoxicity at therapeutic doses. Maximum tolerated dose may be below efficacious threshold.', cashEffect: -15, timeEffect: 9, riskBonus: -0.12, positive: false, failureMode: 'Dose-limiting toxicity' }
    ],
    phase2: [
      { title: 'Transgene Expression Waning', description: 'Initial robust expression has declined 60% at 18-month follow-up. Durability is the key question.', cashEffect: -10, timeEffect: 12, riskBonus: -0.10, positive: false, failureMode: 'Loss of expression' }
    ]
  },
  'cell-therapy': {
    ind_enabling: [
      { title: 'Manufacturing Complexity', description: 'Vein-to-vein time exceeds 21 days. Some patients progress before receiving cells.', cashEffect: -15, timeEffect: 9, riskBonus: -0.06, positive: false, failureMode: 'Manufacturing' },
      { title: 'Allogeneic Platform Ready', description: 'Off-the-shelf approach eliminates autologous manufacturing delays. Per-patient costs drop dramatically.', cashEffect: 0, timeEffect: -9, riskBonus: 0.08, positive: true }
    ],
    phase1: [
      { title: 'Cytokine Release Syndrome', description: 'Grade 3-4 CRS in 30% of patients. Two ICU admissions. Safety management protocol required.', cashEffect: -10, timeEffect: 6, positive: false, failureMode: 'CRS' }
    ],
    phase2: [
      { title: 'Lack of Persistence', description: 'CAR-T cells not detected after 3 months. Responses are not durable. Antigen escape emerging.', cashEffect: -15, timeEffect: 9, riskBonus: -0.12, positive: false, failureMode: 'Limited persistence' }
    ]
  }
};

// Policy events - exploring the Biotech Social Contract
const POLICY_EVENTS = [
  {
    id: 'price_controls',
    title: 'Price Control Legislation',
    description: 'Congress is debating legislation that would impose international reference pricing on pharmaceuticals, capping U.S. prices at levels paid in other developed countries. You are asked to testify on the potential impact on innovation.',
    options: [
      { text: 'Support the legislation as written', value: 'support' },
      { text: 'Oppose the legislation', value: 'oppose' },
      { text: 'Propose alternative reforms', value: 'alternative' }
    ],
    aftermath: {
      support: {
        title: 'Three Years Later',
        effects: [
          'Venture capital investment in early-stage biotechnology declined 40%',
          'Your Series B financing failed as investors reallocated to other sectors',
          'Multiple rare disease programs were terminated industry-wide',
          'Drug prices declined 25%, but the pipeline of innovative therapies contracted'
        ],
        lesson: 'Price controls reduce expected returns on the small fraction of drugs that succeed. Because roughly 93% of drugs entering clinical trials fail, investors need successful drugs to generate returns sufficient to compensate for the failures. When you cap the upside, the expected value of drug development falls below the threshold required to attract capital. The result is not lower-priced innovation-it is less innovation.',
        marketEffect: -0.4
      },
      oppose: {
        title: 'Three Years Later',
        effects: [
          'The federal legislation failed, but public frustration intensified',
          'Multiple states enacted independent price control measures',
          'Your company became a target for activist campaigns and political attention',
          'Regulatory and political risk became primary investor concerns'
        ],
        lesson: 'Opposing reform without offering alternatives is not sustainable. The pharmaceutical industry must demonstrate that it is honoring its social contract-developing drugs that will eventually go generic and become affordable for all-while ensuring that today\'s patients can access the medicines they need. Failure to address legitimate public concerns invites blunt policy responses.',
        marketEffect: -0.15
      },
      alternative: {
        title: 'Three Years Later',
        effects: [
          'Outcomes-based contracts became more prevalent across the industry',
          'Drug prices remained linked to demonstrated clinical value',
          'Investment in innovation continued as incentives were preserved',
          'Patient access improved through innovative affordability programs'
        ],
        lesson: 'The sustainable path forward aligns prices with the value patients actually receive. Outcomes-based contracting, transparent pricing, and robust patient access programs can preserve innovation incentives while addressing affordability. This requires investment in real-world evidence infrastructure and good-faith engagement between all stakeholders.',
        marketEffect: 0
      }
    }
  },
  {
    id: 'social_contract',
    title: 'The Biotech Social Contract',
    description: 'A congressional hearing examines drug pricing. The biotech social contract: companies develop new medicines that will go generic without undue delay, while society provides insurance with low out-of-pocket costs so patients can afford what their doctors prescribe. But some argue the contract is being violated, from both sides. You are asked to testify.',
    options: [
      { text: 'Call for price controls on all branded medicines', value: 'price_controls' },
      { text: 'Defend the status quo without acknowledging problems', value: 'defend' },
      { text: 'Propose targeted reforms that preserve innovation', value: 'reform' }
    ],
    aftermath: {
      price_controls: {
        title: 'Five Years Later',
        effects: [
          'Price controls reduced expected returns on the small fraction of drugs that succeed',
          'Because ~93% of drugs fail, investors needed successful drugs to compensate for failures, but the upside was capped',
          'Venture capital investment in early-stage biotechnology declined 40%',
          'Your Series B financing failed as investors reallocated to sectors where risk-adjusted returns were achievable',
          'Drug prices fell 25%, but the pipeline of innovative therapies contracted significantly'
        ],
        lesson: 'The result of capping the upside is not lower-priced innovation, it is less innovation. Capital is mobile. When returns become inadequate for the risks involved, investment doesn\'t persist heroically, it flows to sectors where risk-adjusted returns are achievable. The diseases that most need new treatments are often the hardest to develop for.',
        marketEffect: -0.4
      },
      defend: {
        title: 'Three Years Later',
        effects: [
          'Public frustration intensified as some companies continued raising prices on old drugs',
          'Congress passed blunt price control legislation that touched even novel medicines',
          'The industry lost the political capital needed to preserve innovation incentives',
          'Your company faced reputational damage despite being a genuine innovator'
        ],
        lesson: 'When some companies raise prices on old drugs or extend exclusivity through patent thickets rather than genuine innovation, they break the biotech social contract. Defending bad actors, the Landlords who seek rents rather than building new medicines, erodes the political capital that Builders need to maintain innovation incentives for everyone.',
        marketEffect: -0.3
      },
      reform: {
        title: 'Three Years Later',
        effects: [
          'Insurance reforms capped out-of-pocket costs, patients could afford prescribed medicines without paying twice',
          'Price controls were applied only to old drugs that failed to go generic on schedule, ending rent-seeking',
          'Novel medicines retained market-based pricing during their exclusivity period, preserving R&D incentives',
          'Investment in innovation remained strong as the rules became clearer and fairer'
        ],
        lesson: 'We don\'t have to choose between affordability and innovation. The biotech social contract works when both sides keep their end of the deal: (1) cap out-of-pocket costs, we already paid through premiums, no one should pay twice, (2) ensure drugs go generic on schedule, we should celebrate generics, they become part of our armory at affordable prices, (3) preserve market incentives for novel drugs during exclusivity, that\'s what funds the 93% that fail. Drugs go generic; hospitals don\'t. That\'s why inventing medicines is so valuable.',
        marketEffect: 0.1
      }
    }
  }
];

// Gate success rates by phase (for educational display)
// Preclinical phases: no FDA tracking (pre-IND)
// Clinical phases: FDA-cited success rates
const GATE_SUCCESS = {
  basic_research: 0.90,   // Pre-IND, no official rate
  drug_discovery: 0.85,   // Pre-IND, no official rate
  lead_optimization: 0.80, // Pre-IND, no official rate
  ind_enabling: 0.75,     // Pre-IND, no official rate
  phase1: 0.47,           // Citeline 2014-2023: 47%
  phase2: 0.28,           // Citeline 2014-2023: 28% - "Valley of Death"
  phase3: 0.55,           // Citeline 2014-2023: 55%
  fda_review: 0.90,       // Most complete NDAs approved
  post_market: 0.95       // Most drugs remain on market post-approval
  // patient_access has no gate - it's a commercial phase
};

// Modality-Indication Compatibility Matrix
// Applies risk penalties for poor modality-indication fit
// Based on real-world delivery and biology constraints
// Enhanced with BCG New Drug Modalities Report 2024-2025 insights
const MODALITY_INDICATION_COMPATIBILITY = {
  // CNS diseases: which modalities can cross blood-brain barrier?
  'CNS': {
    'small-molecule': { penalty: 0, reason: 'Small molecules can cross blood-brain barrier - good fit' },
    'biologic': { penalty: 25, reason: 'Large molecules cannot cross blood-brain barrier - poor CNS penetration', riskType: 'efficacy' },
    'genetic-medicine': { penalty: 20, reason: 'CNS delivery challenging - requires intrathecal or novel vectors', riskType: 'efficacy' },
    'cell-therapy': { penalty: 30, reason: 'Cell delivery to CNS extremely challenging', riskType: 'efficacy' }
  },
  // Rare/Genetic diseases: curative modalities shine
  // BCG 2025: mAbs have largest rare-disease pipeline; gene therapies first approved for rare genetic diseases
  'Rare/Genetic': {
    'small-molecule': { penalty: 10, reason: 'May need lifelong dosing for genetic disease', riskType: 'design' },
    'biologic': { penalty: 0, reason: 'Monoclonal antibodies have largest rare disease pipeline (BCG 2025) - protein replacement often curative' },
    'genetic-medicine': { penalty: 0, reason: 'Ideal for monogenic diseases - curative potential, first approvals were rare genetic diseases' },
    'cell-therapy': { penalty: 0, reason: 'Stem cell or gene-corrected cells excellent for rare diseases' }
  },
  // Metabolic diseases: liver targets, chronic dosing
  // BCG 2025: GLP-1 peptides dominate blockbuster markets
  'Metabolic': {
    'small-molecule': { penalty: 0, reason: 'Oral dosing, liver targets - excellent fit' },
    'biologic': { penalty: 0, reason: 'GLP-1 peptides dominate metabolic blockbusters (BCG 2025) - Mounjaro, Wegovy, Zepbound' },
    'genetic-medicine': { penalty: 0, reason: 'Liver-targeted siRNA/gene therapy excellent for metabolic' },
    'cell-therapy': { penalty: 25, reason: 'Manufacturing complexity not justified for chronic metabolic diseases', riskType: 'design' }
  },
  // Oncology (hematologic): cell therapy and biologics excel
  // BCG 2023: CAR-T first-in-class success validated cell therapy for heme malignancies
  'Oncology (Hematologic)': {
    'small-molecule': { penalty: 10, reason: 'May face resistance mutations', riskType: 'efficacy' },
    'biologic': { penalty: 0, reason: 'Antibody-drug conjugates (ADCs), bispecifics highly effective - BCG highlights ADC growth' },
    'genetic-medicine': { penalty: 15, reason: 'Limited oncology applications for genetic medicine', riskType: 'design' },
    'cell-therapy': { penalty: 0, reason: 'CAR-T first-in-class for heme malignancies (BCG 2023) - revolutionary success' }
  },
  // Oncology (solid): harder than heme - ADCs emerging
  // BCG 2024: ADCs showing significant growth in solid tumor pipeline
  'Oncology (Solid Tumor)': {
    'small-molecule': { penalty: 0, reason: 'Oral tyrosine kinase inhibitors still backbone of therapy' },
    'biologic': { penalty: 5, reason: 'ADCs gaining traction in solid tumors (BCG 2024) - tumor penetration still challenging', riskType: 'efficacy' },
    'genetic-medicine': { penalty: 20, reason: 'Delivery to solid tumors very hard', riskType: 'efficacy' },
    'cell-therapy': { penalty: 15, reason: 'Tumor microenvironment is immunosuppressive - less effective than heme', riskType: 'efficacy' }
  },
  // Autoimmune: biologics designed for this, CAR-T emerging
  // BCG 2025: CAR-T for autoimmune showing early promise
  'Autoimmune': {
    'small-molecule': { penalty: 0, reason: 'JAK inhibitors, oral options - convenience advantage' },
    'biologic': { penalty: 0, reason: 'TNF, IL-17, IL-23 antibodies dominate - proven track record' },
    'genetic-medicine': { penalty: 15, reason: 'Few validated genetic targets for autoimmune', riskType: 'efficacy' },
    'cell-therapy': { penalty: 5, reason: 'CAR-T for autoimmune emerging as next frontier (BCG 2025) - early but promising', riskType: 'design' }
  },
  // Cardiovascular: small molecules and siRNA for liver-expressed targets
  'Cardiovascular': {
    'small-molecule': { penalty: 0, reason: 'Statins, ACE inhibitors - proven track record' },
    'biologic': { penalty: 5, reason: 'PCSK9 antibodies work but injectable', riskType: 'design' },
    'genetic-medicine': { penalty: 0, reason: 'N-acetylgalactosamine-siRNA for liver cardiovascular targets - excellent (Inclisiran precedent)' },
    'cell-therapy': { penalty: 30, reason: 'Manufacturing complexity not justified for cardiovascular', riskType: 'design' }
  },
  // CNS/Oncology combined (e.g., glioblastoma)
  'CNS/Oncology': {
    'small-molecule': { penalty: 5, reason: 'Can cross blood-brain barrier but resistance common', riskType: 'efficacy' },
    'biologic': { penalty: 20, reason: 'Blood-brain barrier limits penetration', riskType: 'efficacy' },
    'genetic-medicine': { penalty: 25, reason: 'CNS delivery plus tumor targeting - compounded difficulty', riskType: 'efficacy' },
    'cell-therapy': { penalty: 20, reason: 'CAR-T showing early signals in glioblastoma but delivery challenging', riskType: 'efficacy' }
  }
};

// Program Type Modifiers (Orphan vs First-in-Class vs Blockbuster)
// Based on BCG insights: modalities have different fit with program strategies
const MODALITY_PROGRAM_FIT = {
  'orphan': {
    'small-molecule': { modifier: 0, note: 'Neutral - can work but may not be optimal' },
    'biologic': { modifier: -5, note: 'BCG 2025: mAbs have largest rare disease pipeline - good fit' },
    'genetic-medicine': { modifier: -10, note: 'Ideal - gene therapies first approved in rare genetic diseases' },
    'cell-therapy': { modifier: -5, note: 'Good fit - high price justified by curative potential' }
  },
  'first-in-class': {
    'small-molecule': { modifier: 0, note: 'Neutral - requires novel target validation' },
    'biologic': { modifier: 0, note: 'Neutral - bispecifics and ADCs offer differentiation' },
    'genetic-medicine': { modifier: -5, note: 'Novel mechanisms - genetic medicines inherently first-in-class' },
    'cell-therapy': { modifier: -5, note: 'CAR-T was first-in-class for heme malignancies (BCG 2023)' }
  },
  'blockbuster': {
    'small-molecule': { modifier: -5, note: 'Oral convenience drives blockbuster adoption' },
    'biologic': { modifier: -10, note: 'BCG 2025: GLP-1 peptides dominate blockbusters - 8 of top 10 drugs are new modalities' },
    'genetic-medicine': { modifier: 10, note: 'Manufacturing scale limits blockbuster economics', riskType: 'design' },
    'cell-therapy': { modifier: 15, note: 'Autologous manufacturing incompatible with blockbuster volumes', riskType: 'design' }
  }
};

// === TWO-DIMENSIONAL STRATEGY SYSTEM ===
// Dimension 1: Market Size (commercial outcome)
// Dimension 2: Innovation Position (scientific/competitive status)

const MARKET_SIZE_DATA = {
  'orphan': {
    displayName: 'Orphan Drug',
    subtitle: '<200K US patients',
    description: 'Rare disease with regulatory advantages and premium pricing',
    riskBonus: 0.05,         // Easier trials, FDA support
    marketMultiplier: 0.4,    // Smaller market
    trialSize: 'small',
    vcInvestment: 50,         // $50M - smaller trials
    highlights: [
      { text: '+5% success rate', type: 'positive', detail: 'smaller trials' },
      { text: '-60% market size', type: 'neutral', detail: 'rare disease' },
      { text: 'Exempt from IRA', type: 'positive', detail: 'negotiation' }
    ],

    note: '7-year exclusivity, 50% tax credit, priority review'
  },
  'specialty': {
    displayName: 'Specialty Market',
    subtitle: '200K - 1M patients',
    description: 'Focused population with balanced risk/reward profile',
    riskBonus: 0,
    marketMultiplier: 0.7,
    trialSize: 'medium',
    vcInvestment: 80,         // $80M - medium trials
    highlights: [
      { text: 'Standard success rates', type: 'neutral', detail: '' },
      { text: 'Moderate competition', type: 'neutral', detail: '' },
      { text: '$50k-150k/patient/year', type: 'positive', detail: 'typical' }
    ],

    note: 'Sweet spot for biotech - manageable trials, good economics'
  },
  'blockbuster': {
    displayName: 'Blockbuster',
    subtitle: '>1M patients',
    description: 'Large market with fierce competition and massive opportunity',
    riskBonus: -0.05,         // Harder large trials
    marketMultiplier: 1.0,
    trialSize: 'large',
    vcInvestment: 120,        // $120M - large trials
    highlights: [
      { text: '-5% success rate', type: 'negative', detail: 'large trials harder' },
      { text: 'Large market opportunity', type: 'positive', detail: '' },
      { text: 'Subject to IRA', type: 'warning', detail: 'price negotiation' }
    ],

    note: 'Home run potential but requires significant capital and differentiation'
  }
};

const INNOVATION_DATA = {
  'first-in-class': {
    displayName: 'First-in-Class',
    subtitle: 'Pioneer / Novel Mechanism',
    description: 'No approved drugs target this pathway. You\'re pioneering new biology.',
    riskBonus: -0.08,         // Novel biology risk
    marketMultiplier: 1.5,    // Premium if successful
    highlights: [
      { text: '-8% success rate', type: 'negative', detail: 'novel biology risk' },
      { text: '+50% market premium', type: 'positive', detail: 'pricing power' },
      { text: 'Set the standard', type: 'positive', detail: '' }
    ],

    note: 'Highest risk, highest reward. You define the treatment paradigm.'
  },
  'best-in-class': {
    displayName: 'Best-in-Class',
    subtitle: 'Validated / Improve',
    description: 'Proven mechanism exists. You\'re building something better.',
    riskBonus: 0,
    marketMultiplier: 1.2,    // Can capture share
    highlights: [
      { text: 'Standard success rate', type: 'neutral', detail: 'de-risked' },
      { text: '+20% market share', type: 'positive', detail: 'if differentiated' },
      { text: 'Must show superiority', type: 'warning', detail: '' }
    ],

    note: 'Validated mechanism, but you need clear differentiation to win.'
  },
  'fast-follower': {
    displayName: 'Fast-Follower',
    subtitle: 'De-risked / Execute',
    description: 'Copy a proven approach. Compete on execution, price, or access.',
    riskBonus: 0.05,          // De-risked
    marketMultiplier: 0.7,    // Lower share
    highlights: [
      { text: '+5% success rate', type: 'positive', detail: 'de-risked biology' },
      { text: '-30% market share', type: 'negative', detail: 'late to market' },
      { text: 'Faster development', type: 'positive', detail: '' }
    ],

    note: 'Lowest risk, but must compete on price, convenience, or access.'
  }
};

// Modality-Specific Access & Affordability Challenges
// Each modality faces different insurance/coverage realities
const MODALITY_ACCESS_CHALLENGES = {
  'small-molecule': {
    typicalPrice: '$500-5,000/month',
    coverageTier: 'Tier 2-3 (specialty may be Tier 4)',
    patientCopay: '$50-150/month typical',
    accessChallenge: 'Generic competition and formulary wars',
    insuranceReality: 'Oral drugs are easier for patients but face intense formulary competition. When generics exist, insurers require step therapy through cheaper options first.',
    uniqueIssue: 'Step-through requirements',
    question: {
      context: 'Your small molecule is approved, but insurers require patients to fail on 2-3 generic alternatives before covering yours. This "step therapy" delays your drug by 6-12 months per patient.',
      options: [
        { text: 'Accept step therapy requirements', detail: 'Patients try generics first', marketBonus: 0.5, lesson: 'Step therapy protects payer budgets but delays access to newer, potentially better drugs.' },
        { text: 'Prove differentiation with head-to-head data', detail: 'Expensive but removes barriers', cashEffect: -20, marketBonus: 0.85, lesson: 'Head-to-head trials against generics can exempt you from step therapy, but they are expensive and risky.' },
        { text: 'Launch copay program + advocacy', detail: 'Work around the system', cashEffect: -10, marketBonus: 0.7, lesson: 'Copay programs help commercially insured patients, but Medicare and Medicaid patients still face barriers.' }
      ]
    }
  },
  'biologic': {
    typicalPrice: '$5,000-15,000/month',
    coverageTier: 'Specialty Tier (Tier 4-5)',
    patientCopay: '$200-500/month with specialty coinsurance',
    accessChallenge: 'Specialty tier cost-sharing and delivery logistics',
    insuranceReality: 'Biologics require injection (subcutaneous at home) or infusion (IV at a facility). Many plans put biologics on specialty tiers with 20-30% coinsurance instead of flat copays.',
    uniqueIssue: 'Delivery format choice and biosimilar competition',
    question: {
      context: 'Your biologic is approved. You must decide on delivery format: IV infusion requires healthcare facility visits, while subcutaneous allows home self-injection.',
      options: [
        { text: 'Partner with infusion center networks', detail: 'Improve site access', cashEffect: -15, marketBonus: 0.8, lesson: 'Site-of-care matters. Home infusion or convenient centers improve adherence.' },
        { text: 'Develop subcutaneous formulation', detail: 'Enable self-injection at home', cashEffect: -30, timeEffect: 24, marketBonus: 1.2, lesson: 'Subcutaneous formulations let patients self-inject at home, dramatically improving convenience.' },
        { text: 'Focus on specialty pharmacy partnerships', detail: 'Leverage existing infrastructure', marketBonus: 0.6, revenueEffect: -0.2, lesson: 'Specialty pharmacies handle complex logistics but take a large cut.' }
      ]
    }
  },
  'genetic-medicine': {
    typicalPrice: '$20K-40K/year (siRNA) or $500K-3M one-time (gene therapy)',
    coverageTier: 'Specialty tier (siRNA) or individual coverage decisions (gene therapy)',
    patientCopay: '$500-2,000/month (siRNA) or highly variable (gene therapy)',
    accessChallenge: 'Varies by modality subtype: siRNA is shippable and self-injectable; gene therapy requires specialized centers',
    insuranceReality: 'Genetic medicines span a wide range: siRNA therapies (e.g., GalNAc-conjugated) can be synthesized, shipped, and self-injected at home like subcutaneous biologics. AAV gene therapies are one-time cures requiring specialized centers and cold-chain logistics.',
    uniqueIssue: 'Subtype-specific: siRNA faces formulary competition; gene therapy faces center capacity and outcomes contracts',
    question: {
      context: 'Your genetic medicine is approved. The access strategy depends on your specific product type and administration requirements.',
      options: [
        { text: 'Partner with specialty pharmacies for home delivery', detail: 'If siRNA: shippable, self-injectable', cashEffect: -5, marketBonus: 0.85, lesson: 'siRNA therapies (like GalNAc-conjugated ASOs) can be self-injected at home. Specialty pharmacy partnerships enable broad access without specialized centers.' },
        { text: 'Expand center of excellence network', detail: 'If gene therapy: requires specialized administration', cashEffect: -25, marketBonus: 0.7, lesson: 'AAV gene therapies require trained centers for administration, monitoring, and immunosuppression management. This limits access.' },
        { text: 'Offer outcomes-based payment structure', detail: 'Align payment with durability', cashEffect: -5, marketBonus: 0.75, revenueEffect: -0.15, lesson: 'For expensive one-time therapies, outcomes-based contracts align incentives. If the therapy works, everyone benefits.' }
      ]
    }
  },
  'cell-therapy': {
    typicalPrice: '$400,000-500,000 one-time',
    coverageTier: 'Hospital outpatient/inpatient, not pharmacy',
    patientCopay: '$50,000-100,000 potential hospital coinsurance',
    accessChallenge: 'Manufacturing slot availability, site-of-care complexity',
    insuranceReality: 'Cell therapies are administered in hospitals, not pharmacies. Manufacturing takes 3-4 weeks; patients may progress while waiting. Only certified transplant centers can treat.',
    uniqueIssue: 'Manufacturing delays and hospital reimbursement',
    question: {
      context: 'Your CAR-T therapy requires 3-week manufacturing per patient. 20% of patients progress while waiting. Hospitals lose money on each treatment due to ICU stays for CRS management.',
      options: [
        { text: 'Invest in manufacturing speed', detail: 'Reduce vein-to-vein time', cashEffect: -40, marketBonus: 0.9, lesson: 'Faster manufacturing saves lives. But speed requires massive investment in specialized facilities.' },
        { text: 'Partner with hospitals on CRS costs', detail: 'Cover ICU and supportive care', cashEffect: -20, revenueEffect: -0.1, marketBonus: 0.8, lesson: 'Hospitals often lose money on cell therapy patients. Covering these costs improves willingness to treat.' },
        { text: 'Focus on academic medical centers only', detail: 'Limited sites but experienced', marketBonus: 0.5, lesson: 'Academic centers have transplant expertise but limited capacity.' }
      ]
    }
  }
};


// Drug name generator - modality aware
const generateDrugName = () => {
  // Generate simple alphanumeric code names that don't imply modality
  // Format: XXX-NNN (e.g., ABX-001, GTX-042, CTX-307)
  const letters = 'ABCDEFGHJKLMNPQRSTVWXYZ';
  const prefix = letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];
  const number = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${number}`;
};

// Indications with therapeutic area and key challenges
// Indications separated by program type
// ORPHAN: <200,000 US patients (FDA threshold) - get 7 years exclusivity, tax credits, smaller trials
// FIRST-IN-CLASS: Novel mechanism/target - any prevalence but requires target validation
// BLOCKBUSTER: Large chronic disease markets >1M patients - high competition but huge revenue potential
const INDICATIONS_BY_TYPE = {
  orphan: [
    {
      name: 'Amyotrophic Lateral Sclerosis (ALS)',
      area: 'CNS',
      usPrevalence: '~30,000',
      challenges: ['CNS penetration', 'No validated biomarkers', 'Irreversible neurodegeneration'],
      note: 'Orphan drug incentives: 7 years exclusivity, 50% tax credit on trials, exempt from IRA negotiation.'
    },
    {
      name: 'Duchenne Muscular Dystrophy',
      area: 'Rare/Genetic',
      usPrevalence: '~15,000',
      challenges: ['Mutation-specific response', 'Muscle delivery', 'Functional endpoints'],
      note: 'Orphan indication with accelerated approval pathway often used.'
    },
    {
      name: 'Huntington\'s Disease',
      area: 'CNS',
      usPrevalence: '~30,000',
      challenges: ['CNS penetration', 'Huntingtin lowering', 'Slow progression'],
      note: 'Orphan disease - smaller trials (500-1000 patients) may be sufficient for approval.'
    },
    {
      name: 'Cystic Fibrosis (Rare Mutations)',
      area: 'Rare/Genetic',
      usPrevalence: '~40,000 total, subpopulations much smaller',
      challenges: ['Mutation-specific response', 'Chronic dosing', 'Lung function endpoints'],
      note: 'Vertex pioneered mutation-specific therapies. Some mutations affect <1000 patients.'
    },
    {
      name: 'Progressive Supranuclear Palsy',
      area: 'CNS',
      usPrevalence: '~30,000',
      challenges: ['CNS penetration', 'Tau pathology', 'Small patient population'],
      note: 'Rare tauopathy - smaller trials but enrollment is challenging.'
    },
    {
      name: 'Spinal Muscular Atrophy',
      area: 'Rare/Genetic',
      usPrevalence: '~25,000',
      challenges: ['Gene therapy delivery', 'Durability of effect', 'Timing of intervention'],
      note: 'Orphan success story - Spinraza and Zolgensma transformed this space.'
    }
  ],
  'first-in-class': [
    {
      name: 'Alzheimer\'s Disease (Novel Target)',
      area: 'CNS',
      usPrevalence: '~6.7 million',
      challenges: ['Novel mechanism validation', 'CNS penetration', 'Long trials (18-24 months)', 'Biomarker development'],
      note: 'First-in-class risk: novel targets have higher failure rates but command premium pricing.'
    },
    {
      name: 'Treatment-Resistant Depression',
      area: 'CNS',
      usPrevalence: '~2.8 million',
      challenges: ['Novel mechanism validation', 'Subjective endpoints', 'Placebo response'],
      note: 'Non-monoamine targets are first-in-class (e.g., NMDA modulators, psychedelics).'
    },
    {
      name: 'NASH/Metabolic Liver Disease',
      area: 'Metabolic',
      usPrevalence: '~16 million with NASH',
      challenges: ['Novel biology', 'Liver biopsy endpoints', 'Long-term outcomes'],
      note: 'Multiple novel mechanisms under development. No approved disease-modifying therapy.'
    },
    {
      name: 'Heart Failure with Preserved Ejection Fraction',
      area: 'Cardiovascular',
      usPrevalence: '~3 million',
      challenges: ['Heterogeneous syndrome', 'Novel pathways', 'Large trials needed'],
      note: 'Novel mechanisms targeting cardiac metabolism, inflammation, or fibrosis.'
    },
    {
      name: 'Recurrent Glioblastoma',
      area: 'CNS/Oncology',
      usPrevalence: '~13,000/year',
      challenges: ['Blood-brain barrier', 'Tumor microenvironment', 'Novel approaches needed'],
      note: 'Standard of care unchanged for decades - first-in-class desperately needed.'
    }
  ],
  specialty: [
    {
      name: 'Multiple Sclerosis',
      area: 'CNS/Immunology',
      usPrevalence: '~1 million',
      challenges: ['Differentiation from Ocrevus', 'Long-term safety', 'Remyelination'],
      note: 'Specialty market - high-value patients, specialty pharmacy distribution.'
    },
    {
      name: 'Psoriatic Arthritis',
      area: 'Immunology',
      usPrevalence: '~500,000',
      challenges: ['IL-17/IL-23 competition', 'Skin and joint endpoints', 'Differentiation'],
      note: 'Growing specialty market with established biologic pathways.'
    },
    {
      name: 'Ulcerative Colitis',
      area: 'GI/Immunology',
      usPrevalence: '~900,000',
      challenges: ['Biologic competition', 'Mucosal healing endpoints', 'Safety'],
      note: 'Specialty IBD market with multiple mechanisms available.'
    },
    {
      name: 'Systemic Lupus Erythematosus',
      area: 'Immunology',
      usPrevalence: '~300,000',
      challenges: ['Disease heterogeneity', 'Flare prevention', 'Organ involvement'],
      note: 'Underserved specialty market with few effective therapies.'
    },
    {
      name: 'Idiopathic Pulmonary Fibrosis',
      area: 'Pulmonary',
      usPrevalence: '~200,000',
      challenges: ['Progressive disease', 'Functional endpoints', 'Combination approaches'],
      note: 'Specialty market at the orphan/specialty boundary. Nintedanib and pirfenidone approved.'
    },
    {
      name: 'Migraine Prevention',
      area: 'CNS',
      usPrevalence: '~4 million (chronic)',
      challenges: ['CGRP competition', 'Oral vs injectable', 'Payer access'],
      note: 'Large specialty market dominated by CGRP antibodies and gepants.'
    }
  ],
  blockbuster: [
    {
      name: 'Type 2 Diabetes',
      area: 'Metabolic',
      usPrevalence: '~37 million',
      challenges: ['Crowded market', 'CV outcomes required', 'Differentiation critical'],
      note: 'Massive market but fierce competition. GLP-1s dominate. Must show CV benefit.'
    },
    {
      name: 'Obesity',
      area: 'Metabolic',
      usPrevalence: '~100 million',
      challenges: ['Weight loss durability', 'Side effect profile', 'Payer coverage'],
      note: '$100B market by 2030. Semaglutide set new efficacy bar. Oral formulations race.'
    },
    {
      name: 'Chronic Kidney Disease',
      area: 'Nephrology',
      usPrevalence: '~37 million',
      challenges: ['Slow progression', 'Hard endpoints', 'Long trials'],
      note: 'Huge unmet need despite SGLT2 advances. Trials require 3-4 years.'
    },
    {
      name: 'Atopic Dermatitis',
      area: 'Immunology',
      usPrevalence: '~26 million',
      challenges: ['Dupixent dominance', 'JAK safety signals', 'Differentiation'],
      note: 'Blockbuster market but Dupixent sets high bar. Oral options in demand.'
    },
    {
      name: 'Rheumatoid Arthritis',
      area: 'Immunology',
      usPrevalence: '~1.5 million',
      challenges: ['Biologic competition', 'JAK safety concerns', 'Step therapy'],
      note: 'Mature market with many options. Differentiation on safety or convenience.'
    },
    {
      name: 'Non-Small Cell Lung Cancer',
      area: 'Oncology',
      usPrevalence: '~235,000 new cases/year',
      challenges: ['PD-1 dominance', 'Combination complexity', 'Biomarker selection'],
      note: 'Largest oncology market. Checkpoint combinations are current standard.'
    }
  ]
};

// Legacy array for backward compatibility - combine all indications
const INDICATIONS = [
  ...INDICATIONS_BY_TYPE.orphan,
  ...INDICATIONS_BY_TYPE.specialty,
  ...INDICATIONS_BY_TYPE['first-in-class'],
  ...INDICATIONS_BY_TYPE.blockbuster
];

// Legacy array for backward compatibility
const indications = INDICATIONS.map(i => i.name);

// Platform types by modality - investors fund platforms, not just single assets
const PLATFORMS = {
  'small-molecule': [
    { name: 'Targeted Protein Degradation', pipeline: '3-5 additional indications addressable' },
    { name: 'Allosteric Modulation', pipeline: '2-4 related targets in pipeline' },
    { name: 'Structure-Based Drug Design', pipeline: 'Platform applicable to multiple targets' },
    { name: 'Covalent Inhibitor Platform', pipeline: '4-6 programs in discovery across therapeutic areas' }
  ],
  'biologic': [
    { name: 'Antibody Engineering Platform', pipeline: 'Bispecific and ADC programs in development' },
    { name: 'Next-Gen Antibody Discovery', pipeline: '3-4 follow-on programs targeting related pathways' },
    { name: 'Fc-Engineered Therapeutics', pipeline: 'Platform enables rapid development of new candidates' }
  ],
  'gene-therapy': [
    { name: 'AAV Vector Platform', pipeline: 'Capsid technology applicable to 10+ rare diseases' },
    { name: 'Gene Editing Technology', pipeline: 'Platform enables programs across genetic diseases' },
    { name: 'Optimized Delivery System', pipeline: 'Tissue-targeted delivery for CNS, muscle, and liver' }
  ],
  'cell-therapy': [
    { name: 'CAR-T Engineering Platform', pipeline: 'Next-gen constructs for solid tumors in development' },
    { name: 'Allogeneic Cell Platform', pipeline: 'Off-the-shelf approach enables rapid scaling' },
    { name: 'iPSC-Derived Cell Therapy', pipeline: 'Platform produces multiple cell types for different diseases' }
  ]
};

// Exit strategies - randomly assigned based on program type and phase reached
const EXIT_STRATEGIES = [
  {
    type: 'ipo',
    name: 'IPO',
    description: 'Go public to fund Phase III and beyond',
    timing: 'Typically after positive Phase II data',
    typical: 'First-in-class programs with large market potential'
  },
  {
    type: 'acquisition',
    name: 'Acquisition by Large Pharma',
    description: 'Pharma acquires company for strategic asset',
    timing: 'Often after Phase II proof-of-concept',
    typical: 'Programs that complement acquirer\'s pipeline'
  },
  {
    type: 'partnership',
    name: 'Strategic Partnership',
    description: 'Ex-US or co-development deal with large pharma',
    timing: 'Can occur at any stage',
    typical: 'Programs needing commercial infrastructure or capital'
  },
  {
    type: 'merger',
    name: 'Merger with Complementary Biotech',
    description: 'Combine with another biotech to create diversified portfolio',
    timing: 'Usually pre-revenue to share risk',
    typical: 'Platform companies seeking critical mass'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function TheLongGame() {
  const [screen, setScreen] = useState('title');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseStep, setPhaseStep] = useState(0);
  const [cash, setCash] = useState(150);
  const [capitalInvested, setCapitalInvested] = useState(0);
  const [months, setMonths] = useState(0);
  const [riskBonus, setRiskBonus] = useState(0);
  const [marketMultiplier, setMarketMultiplier] = useState(1.0);
  const [revenueShare, setRevenueShare] = useState(1.0);
  const [drugName, setDrugName] = useState('');
  const [indication, setIndication] = useState('');
  const [indicationData, setIndicationData] = useState(null); // Full indication object with challenges
  const [vcInvestment, setVcInvestment] = useState(0);
  const [platform, setPlatform] = useState(null);
  const [exitStrategy, setExitStrategy] = useState(null);

  // Financing state
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0); // Index into FINANCING_ROUNDS
  const [totalDilution, setTotalDilution] = useState(0); // Cumulative dilution percentage
  const [showFinancingScreen, setShowFinancingScreen] = useState(false);
  const [financingResult, setFinancingResult] = useState(null);
  const [alternativeFinancingUsed, setAlternativeFinancingUsed] = useState([]); // Track which alternatives were used
  const [showAlternativeFinancing, setShowAlternativeFinancing] = useState(false); // Show alternative options
  const [revenueMultiplier, setRevenueMultiplier] = useState(1.0); // Impact of financing deals on revenue

  // Program configuration - Two-dimensional strategy
  const [marketSize, setMarketSize] = useState(null); // 'orphan', 'specialty', 'blockbuster'
  const [innovation, setInnovation] = useState(null); // 'first-in-class', 'best-in-class', 'fast-follower'
  const [programType, setProgramType] = useState(null); // Legacy - derived from marketSize for compatibility
  const [modality, setModality] = useState(null); // 'small-molecule', 'biologic', 'genetic-medicine', 'cell-therapy'

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [gateResult, setGateResult] = useState(null);
  const [policyResult, setPolicyResult] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [usedEvents, setUsedEvents] = useState([]);
  const [seenPolicy, setSeenPolicy] = useState(false);
  const [seenIRA, setSeenIRA] = useState(false);
  const [programEvents, setProgramEvents] = useState([]); // Track all events that happened for failure report
  const [phasesCompleted, setPhasesCompleted] = useState([]); // Track phases passed for educational display
  const [decisionsLog, setDecisionsLog] = useState([]); // Track all strategic decisions for final report

  // Decision-based risk tracking (0-100 scale, higher = more risk of failure)
  // Based on real failure data: 40-50% efficacy, 30% safety, 15% trial design
  const [efficacyRisk, setEfficacyRisk] = useState(50); // Target validation risk - affects Phase II
  const [safetyRisk, setSafetyRisk] = useState(30); // Toxicity risk - affects Phase I
  const [designRisk, setDesignRisk] = useState(20); // Trial design risk - affects Phase III

  const currentPhase = PHASES[currentPhaseIndex];

  const startGame = () => {
    // Clear any previous state
    setIndicationData(null);
    setIndication('');
    setModality(null);
    setMarketSize(null);
    setInnovation(null);
    setProgramType(null);
    // Start with modality selection (platform-first approach)
    setScreen('setup_modality');
  };

  // Step 1: Select modality (platform-first approach)
  const selectModality = (mod) => {
    setModality(mod);
    setDrugName(generateDrugName());

    // Pick a random platform based on modality - investors fund platforms, not just single assets
    const modalityPlatforms = PLATFORMS[mod] || PLATFORMS['small-molecule'];
    const selectedPlatform = modalityPlatforms[Math.floor(Math.random() * modalityPlatforms.length)];
    setPlatform(selectedPlatform);

    // Pick a random exit strategy
    const selectedExit = EXIT_STRATEGIES[Math.floor(Math.random() * EXIT_STRATEGIES.length)];
    setExitStrategy(selectedExit);

    // Now go to market size selection (Step 2)
    setScreen('setup_market_size');
  };

  // Step 2: Select market size (Orphan / Specialty / Blockbuster)
  const selectMarketSize = (size) => {
    setMarketSize(size);
    // Set legacy programType for compatibility (indication filtering uses this)
    setProgramType(size);

    // Now go to innovation position selection (Step 3)
    setScreen('setup_innovation');
  };

  // Step 3: Select innovation position (First-in-Class / Best-in-Class / Fast-Follower)
  const selectInnovation = (innov) => {
    setInnovation(innov);

    // Apply combined modifiers from both dimensions
    const marketData = MARKET_SIZE_DATA[marketSize];
    const innovData = INNOVATION_DATA[innov];

    // Combine risk bonuses from both dimensions
    const combinedRiskBonus = (marketData?.riskBonus || 0) + (innovData?.riskBonus || 0);
    setRiskBonus(combinedRiskBonus);

    // Combine market multipliers (multiply together)
    const combinedMarketMultiplier = (marketData?.marketMultiplier || 1) * (innovData?.marketMultiplier || 1);
    setMarketMultiplier(combinedMarketMultiplier);

    // VC investment based on market size
    setVcInvestment(marketData?.vcInvestment || 80);

    // Now go to indication selection (Step 4)
    setScreen('setup_indication');
  };

  // Legacy: Select program type (for backward compatibility)
  const selectProgramType = (type) => {
    setProgramType(type);
    setScreen('setup_indication');
  };

  // Step 4: Select indication (after modality, market size, and innovation are chosen)
  const selectIndication = (indicationObj) => {
    setIndicationData(indicationObj);
    setIndication(indicationObj.name);

    // Initialize game state
    initializeGame(marketSize, modality, indicationObj);
  };

  // Initialize game after both modality and program type are selected
  const initializeGame = (type, mod, indicationData) => {


    // Start with SEED funding - not the full Series A
    // Seed round: $25M to validate target and establish proof-of-concept
    const seedRound = FINANCING_ROUNDS[0];
    setCash(seedRound.amount);
    setCurrentRoundIndex(0);
    setTotalDilution(seedRound.dilution);
    setCapitalInvested(seedRound.amount);

    setMonths(0);
    setCurrentPhaseIndex(0);
    setPhaseStep(0);
    setUsedQuestions([]);
    setUsedEvents([]);
    setSeenPolicy(false);
    setSeenIRA(false);
    setCurrentQuestion(null);
    setCurrentEvent(null);
    setCurrentPolicy(null);
    setQuestionResult(null);
    setGateResult(null);
    setPolicyResult(null);
    setRevenueShare(1.0);
    setShowFinancingScreen(false);
    setFinancingResult(null);
    setAlternativeFinancingUsed([]);
    setShowAlternativeFinancing(false);
    setRevenueMultiplier(1.0);
    setProgramEvents([]);
    setPhasesCompleted([]);
    setDecisionsLog([]);

    // Set modality-specific starting risks (based on real failure patterns)
    // Small molecules: efficacy is main risk (target engagement)
    // Biologics: efficacy risk (pathway redundancy)
    // Gene therapy: safety risk (immune response, durability)
    // Cell therapy: safety risk (CRS, manufacturing)
    if (mod === 'small-molecule') {
      setEfficacyRisk(55); // Off-target effects, metabolism
      setSafetyRisk(35);
      setDesignRisk(20);
    } else if (mod === 'biologic') {
      setEfficacyRisk(50); // Target redundancy
      setSafetyRisk(25);   // ADA risk
      setDesignRisk(25);
    } else if (mod === 'gene-therapy') {
      setEfficacyRisk(40); // Durability concerns
      setSafetyRisk(50);   // Pre-existing immunity, dose-limiting toxicity
      setDesignRisk(30);
    } else if (mod === 'cell-therapy') {
      setEfficacyRisk(35); // Deep responses expected
      setSafetyRisk(55);   // CRS/ICANS
      setDesignRisk(35);   // Manufacturing complexity
    } else if (mod === 'sirna') {
      setEfficacyRisk(40); // Knockdown duration, tissue delivery
      setSafetyRisk(30);   // Immune activation manageable
      setDesignRisk(45);   // Delivery optimization critical
    } else if (mod === 'gene-editing') {
      setEfficacyRisk(35); // Editing efficiency usually high
      setSafetyRisk(60);   // Off-target edits, permanent changes
      setDesignRisk(40);   // Regulatory scrutiny
    }

    // Apply modality-indication compatibility penalties
    // This enforces realistic drug development constraints
    if (indicationData?.area) {
      const compatibilityRules = MODALITY_INDICATION_COMPATIBILITY[indicationData.area];
      if (compatibilityRules && compatibilityRules[mod]) {
        const compat = compatibilityRules[mod];
        if (compat.penalty > 0) {
          // Apply the penalty to the appropriate risk type
          if (compat.riskType === 'efficacy') {
            setEfficacyRisk(prev => Math.min(100, prev + compat.penalty));
          } else if (compat.riskType === 'safety') {
            setSafetyRisk(prev => Math.min(100, prev + compat.penalty));
          } else if (compat.riskType === 'design') {
            setDesignRisk(prev => Math.min(100, prev + compat.penalty));
          }
          // Log this as a warning decision
          setDecisionsLog([{
            question: `Modality-Indication Compatibility`,
            choice: `${MODALITY_DATA[mod]?.displayName || mod} for ${indicationData.area}`,
            riskChange: `+${compat.penalty} ${compat.riskType || 'design'} risk`,
            impact: compat.reason
          }]);
          setProgramEvents([{
            phase: 'Modality Selection',
            type: 'warning',
            message: `⚠️ ${compat.reason}`,
            detail: `+${compat.penalty}% ${compat.riskType || 'design'} risk applied`
          }]);
        }
      }
    }

    // Apply modality-program type fit modifiers (BCG insights)
    // Orphan, first-in-class, and blockbuster programs have different modality affinities
    if (programType && MODALITY_PROGRAM_FIT[programType]) {
      const programFit = MODALITY_PROGRAM_FIT[programType][mod];
      if (programFit && programFit.modifier !== 0) {
        const absModifier = Math.abs(programFit.modifier);
        const riskType = programFit.riskType || 'design';

        if (programFit.modifier > 0) {
          // Penalty for poor fit
          if (riskType === 'efficacy') {
            setEfficacyRisk(prev => Math.min(100, prev + absModifier));
          } else if (riskType === 'safety') {
            setSafetyRisk(prev => Math.min(100, prev + absModifier));
          } else {
            setDesignRisk(prev => Math.min(100, prev + absModifier));
          }
          setProgramEvents(prev => [...prev, {
            phase: 'Program Strategy',
            type: 'warning',
            message: `⚠️ ${MODALITY_DATA[mod]?.displayName || mod} challenging for ${programType} programs`,
            detail: programFit.note
          }]);
        } else {
          // Bonus for good fit
          setDesignRisk(prev => Math.max(5, prev - absModifier));
          setProgramEvents(prev => [...prev, {
            phase: 'Program Strategy',
            type: 'positive',
            message: `✓ ${MODALITY_DATA[mod]?.displayName || mod} well-suited for ${programType} programs`,
            detail: programFit.note
          }]);
        }
      }
    }

    setScreen('phase');
  };

  // Check if we need to raise more capital
  const checkFinancingNeeded = () => {
    const nextPhase = PHASES[currentPhaseIndex];
    const phaseCost = nextPhase?.baseCost || 20;

    // If cash is less than 1.5x the phase cost, trigger financing
    if (cash < phaseCost * 1.5 && currentRoundIndex < FINANCING_ROUNDS.length - 1) {
      return true;
    }
    return false;
  };

  // Raise the next round of financing
  const raiseNextRound = (accepted) => {
    if (!accepted) {
      // Tried to continue without raising - check if we can afford it
      setShowFinancingScreen(false);
      setFinancingResult(null);
      return;
    }

    const nextRoundIndex = currentRoundIndex + 1;
    if (nextRoundIndex >= FINANCING_ROUNDS.length) {
      // No more rounds available
      setShowFinancingScreen(false);
      return;
    }

    const nextRound = FINANCING_ROUNDS[nextRoundIndex];

    // Apply financing
    setCash(c => c + nextRound.amount);
    setCapitalInvested(ci => ci + nextRound.amount);
    setTotalDilution(td => td + nextRound.dilution);
    setCurrentRoundIndex(nextRoundIndex);

    // Show result
    setFinancingResult({
      round: nextRound,
      newCash: cash + nextRound.amount,
      totalDilution: totalDilution + nextRound.dilution
    });
  };

  const acknowledgeFinancing = () => {
    setShowFinancingScreen(false);
    setFinancingResult(null);
  };

  // Handle alternative financing selection
  const selectAlternativeFinancing = (altFinancing) => {
    const phase = PHASES[currentPhaseIndex];
    const phaseCost = phase?.baseCost || 20;
    const newCash = cash + altFinancing.amount;

    // Check if financing is sufficient for the current phase
    if (newCash < phaseCost) {
      // Insufficient financing - fail the program
      setProgramEvents(prev => [...prev, {
        title: 'Insufficient Financing',
        description: `Raised $${altFinancing.amount}M but needed $${phaseCost}M for ${phase?.name}. Program failed due to undercapitalization.`,
        phase: phase?.name,
        financing: true
      }]);
      setShowAlternativeFinancing(false);
      setScreen('failure');
      return;
    }

    // Apply the financing
    setCash(newCash);
    setCapitalInvested(ci => ci + altFinancing.amount);
    setRevenueMultiplier(rm => rm * altFinancing.revenueImpact);
    setAlternativeFinancingUsed(prev => [...prev, altFinancing.id]);

    // Track for post-mortem
    setProgramEvents(prev => [...prev, {
      title: `${altFinancing.name} Secured`,
      description: `Raised $${altFinancing.amount}M via ${altFinancing.name.toLowerCase()}. ${altFinancing.tradeoff}.`,
      phase: PHASES[currentPhaseIndex]?.name,
      financing: true
    }]);

    setShowAlternativeFinancing(false);
  };

  const declineAlternativeFinancing = () => {
    // Player chose not to raise - fail the program
    setShowAlternativeFinancing(false);
    setScreen('failure');
  };

  const advanceStep = () => {
    // If low on cash but traditional financing available, trigger financing
    if (cash <= 0 && currentRoundIndex < FINANCING_ROUNDS.length - 1) {
      setShowFinancingScreen(true);
      return;
    }

    // If bankrupt and traditional rounds exhausted, check for alternative financing
    if (cash <= 0 && currentRoundIndex >= FINANCING_ROUNDS.length - 1) {
      // Check if any alternative financing is available
      const phase = PHASES[currentPhaseIndex];
      const availableAlternatives = ALTERNATIVE_FINANCING.filter(alt => {
        if (alternativeFinancingUsed.includes(alt.id)) return false;
        const phaseOrder = ['basic_research', 'drug_discovery', 'lead_optimization', 'ind_enabling', 'phase1', 'phase2', 'phase3', 'fda_review'];
        const currentPhaseOrder = phaseOrder.indexOf(phase?.id);
        const minPhaseOrder = phaseOrder.indexOf(alt.minPhase);
        if (currentPhaseOrder < minPhaseOrder) return false;
        if (alt.requiresIPO && currentRoundIndex < FINANCING_ROUNDS.length - 1) return false;
        return true;
      });

      if (availableAlternatives.length > 0) {
        // Offer alternative financing
        setShowAlternativeFinancing(true);
        return;
      } else {
        // No options left - fail
        setScreen('failure');
        return;
      }
    }

    const phase = PHASES[currentPhaseIndex];

    if (phaseStep === 0) {
      // Phase intro -> Question (if available) or Event
      let phaseQuestions = [];

      // Handle modality-specific question pools for early phases
      const questionsData = QUESTIONS[phase.id];
      if (questionsData && typeof questionsData === 'object' && !Array.isArray(questionsData)) {
        // It's a modality-specific object, get questions for current modality
        phaseQuestions = questionsData[modality] || [];
      } else if (Array.isArray(questionsData)) {
        // It's a regular array of questions
        phaseQuestions = questionsData;
      }

      // For phase1, inject modality-specific questions (e.g., CRS/ICANS for cell therapy)
      if (phase.id === 'phase1' && QUESTIONS.phase1_modality && QUESTIONS.phase1_modality[modality]) {
        const modalityPhase1Questions = QUESTIONS.phase1_modality[modality];
        const unusedModalityQuestions = modalityPhase1Questions.filter(q => !usedQuestions.includes(q.id));
        phaseQuestions = [...unusedModalityQuestions, ...phaseQuestions];
      }

      // For post_market phase, inject modality-specific access question first
      if (phase.id === 'post_market' && MODALITY_ACCESS_CHALLENGES[modality]) {
        const modalityAccess = MODALITY_ACCESS_CHALLENGES[modality];
        const modalityQuestion = {
          id: `access_${modality}`,
          phase: 'post_market',
          title: `How will you overcome ${modalityAccess.uniqueIssue.toLowerCase()}?`,
          scenario: `${modalityAccess.question.context}\n\nThe Challenge: ${modalityAccess.insuranceReality} Typical price: ${modalityAccess.typicalPrice}. Coverage: ${modalityAccess.coverageTier}. Patient copay: ${modalityAccess.patientCopay}.`,
          options: modalityAccess.question.options
        };
        // Add modality-specific question if not already used
        if (!usedQuestions.includes(modalityQuestion.id)) {
          phaseQuestions = [modalityQuestion, ...phaseQuestions];
        }
      }

      const available = phaseQuestions.filter(q => !usedQuestions.includes(q.id));
      if (available.length > 0) {
        setCurrentQuestion(available[0]);
        setPhaseStep(1);
      } else {
        // No questions, go to event step
        triggerEventStep();
      }
    } else if (phaseStep === 1) {
      // Question answered -> Event step
      triggerEventStep();
    } else if (phaseStep === 2) {
      // Event acknowledged or skipped -> Policy (Phase II) or IRA (Phase III for small molecule) or Gate
      if (currentPhaseIndex === 5 && !seenPolicy) { // Phase II - policy event
        const policy = POLICY_EVENTS[Math.floor(Math.random() * POLICY_EVENTS.length)];
        setCurrentPolicy(policy);
        setPhaseStep(2.5);
      } else if (currentPhaseIndex === 6 && !seenIRA && modality === 'small-molecule' && programType !== 'orphan') {
        // Phase III for small molecules (non-orphan) - IRA implications
        setPhaseStep(2.7);
      } else if (PHASES[currentPhaseIndex]?.id === 'patient_access') {
        // Patient Access is last phase - skip gate and go to victory
        setScreen('victory');
      } else {
        setPhaseStep(3);
      }
    } else if (phaseStep === 2.5) {
      // Policy aftermath acknowledged -> Check for IRA or Gate
      setSeenPolicy(true);
      if (currentPhaseIndex === 6 && !seenIRA && modality === 'small-molecule' && programType !== 'orphan') {
        setPhaseStep(2.7);
      } else {
        setPhaseStep(3);
      }
    } else if (phaseStep === 2.7) {
      // IRA acknowledged -> Gate
      setSeenIRA(true);
      setPhaseStep(3);
    } else if (phaseStep === 3) {
      // Gate passed -> Check financing BEFORE advancing to next phase
      if (currentPhaseIndex >= PHASES.length - 1) {
        setScreen('victory');
      } else {
        // Check if we need financing before the next phase
        const nextPhase = PHASES[currentPhaseIndex + 1];
        const phaseCost = nextPhase?.baseCost || 20;

        if (cash < phaseCost * 1.5 && currentRoundIndex < FINANCING_ROUNDS.length - 1 && !showFinancingScreen) {
          setShowFinancingScreen(true);
          return;
        }

        setCurrentPhaseIndex(currentPhaseIndex + 1);
        setPhaseStep(0);
        setCurrentQuestion(null);
        setCurrentEvent(null);
        setQuestionResult(null);
        setGateResult(null);
      }
    }
  };

  const triggerEventStep = () => {
    const phase = PHASES[currentPhaseIndex];

    // Combine generic phase events with modality-specific events
    const genericEvents = EVENTS[phase.id] || [];
    const modalityEvents = (modality && MODALITY_EVENTS[modality] && MODALITY_EVENTS[modality][phase.id]) || [];
    const allEvents = [...genericEvents, ...modalityEvents];

    const available = allEvents.filter(e => !usedEvents.includes(e.title));

    if (available.length > 0 && Math.random() < 0.65) {
      const event = available[Math.floor(Math.random() * available.length)];
      setCurrentEvent(event);
      setUsedEvents(prev => [...prev, event.title]);
    } else {
      setCurrentEvent(null);
    }
    setPhaseStep(2);
  };

  const handleQuestionAnswer = (option) => {
    if (option.cashEffect) {
      setCash(c => c + option.cashEffect);
      if (option.cashEffect < 0) {
        setCapitalInvested(ci => ci + Math.abs(option.cashEffect));
      }
    }
    if (option.timeEffect) setMonths(m => m + option.timeEffect);
    if (option.riskBonus) setRiskBonus(r => r + option.riskBonus);
    if (option.marketBonus) setMarketMultiplier(mm => mm * option.marketBonus);
    if (option.revenueEffect) setRevenueMultiplier(rm => rm + option.revenueEffect);

    setUsedQuestions([...usedQuestions, currentQuestion.id]);
    setQuestionResult(option);

    // Apply risk effects from this decision
    if (option.efficacyEffect) setEfficacyRisk(r => Math.max(0, Math.min(100, r + option.efficacyEffect)));
    if (option.safetyEffect) setSafetyRisk(r => Math.max(0, Math.min(100, r + option.safetyEffect)));
    if (option.designEffect) setDesignRisk(r => Math.max(0, Math.min(100, r + option.designEffect)));

    // Log this decision for the final report
    const riskImpact = (option.efficacyEffect || 0) + (option.safetyEffect || 0) + (option.designEffect || 0);
    setDecisionsLog(prev => [...prev, {
      type: 'strategic',
      phase: PHASES[currentPhaseIndex]?.name,
      question: currentQuestion.title,
      decision: option.text,
      impact: riskImpact > 0 ? 'risky' : riskImpact < 0 ? 'safe' : (option.riskBonus > 0 ? 'positive' : option.riskBonus < 0 ? 'negative' : 'neutral'),
      riskChange: riskImpact
    }]);
  };

  const handleEventAcknowledge = () => {
    const event = currentEvent;
    if (event.cashEffect) {
      setCash(c => c + event.cashEffect);
      if (event.cashEffect < 0) {
        setCapitalInvested(ci => ci + Math.abs(event.cashEffect));
      }
    }
    if (event.timeEffect) setMonths(m => m + event.timeEffect);
    if (event.riskBonus) setRiskBonus(r => r + event.riskBonus);
    if (event.marketBonus) setMarketMultiplier(mm => mm * event.marketBonus);
    if (event.revenueShare) setRevenueShare(event.revenueShare);

    // Track this event for the failure post-mortem
    if (event.positive === false || event.riskBonus < 0) {
      setProgramEvents(prev => [...prev, {
        title: event.title,
        description: event.description,
        phase: PHASES[currentPhaseIndex]?.name,
        failureMode: event.failureMode || null
      }]);
    }

    setCurrentEvent(null);
    advanceStep();
  };

  const handlePolicyAnswer = (value) => {
    const aftermath = currentPolicy.aftermath[value];
    if (aftermath.marketEffect) {
      setMarketMultiplier(mm => mm * (1 + aftermath.marketEffect));
    }
    setPolicyResult({ policy: currentPolicy, choice: value, aftermath });
  };

  const handlePolicyAftermathContinue = () => {
    setCurrentPolicy(null);
    setPolicyResult(null);
    advanceStep();
  };

  const handleGateRoll = () => {
    const phase = PHASES[currentPhaseIndex];

    // Check if we can afford this phase
    if (cash < phase.baseCost) {
      if (currentRoundIndex < FINANCING_ROUNDS.length - 1) {
        // Traditional financing available - trigger financing screen
        setShowFinancingScreen(true);
        return;
      } else {
        // Traditional rounds exhausted - check for alternative financing options
        const availableAlternatives = ALTERNATIVE_FINANCING.filter(alt => {
          // Check if already used
          if (alternativeFinancingUsed.includes(alt.id)) return false;
          // Check phase requirement
          const phaseOrder = ['basic_research', 'drug_discovery', 'lead_optimization', 'ind_enabling', 'phase1', 'phase2', 'phase3', 'fda_review'];
          const currentPhaseOrder = phaseOrder.indexOf(phase.id);
          const minPhaseOrder = phaseOrder.indexOf(alt.minPhase);
          if (currentPhaseOrder < minPhaseOrder) return false;
          // Check IPO requirement for PIPE
          if (alt.requiresIPO && currentRoundIndex < FINANCING_ROUNDS.length - 1) return false;
          // Check if amount is enough
          if (alt.amount < phase.baseCost - cash) return false;
          return true;
        });

        if (availableAlternatives.length > 0) {
          // Offer alternative financing options
          setShowAlternativeFinancing(true);
          return;
        } else {
          // No options left - fail
          setScreen('failure');
          return;
        }
      }
    }

    const baseSuccess = GATE_SUCCESS[phase.id] || 0.5;

    // Apply modality modifier
    let modalityModifier = 0;
    if (modality === 'biologic' && (phase.id === 'lead_optimization' || phase.id === 'preclinical')) {
      modalityModifier = 0.05;
    }

    // Apply program type modifier
    let programModifier = 0;
    if (programType === 'orphan') {
      programModifier = 0.05;
    }

    const realWorldProbability = Math.min(0.95, Math.max(0.05, baseSuccess + riskBonus + modalityModifier + programModifier));

    // Add phase base time and cost, track capital invested
    setMonths(m => m + phase.baseMonths);
    setCash(c => c - phase.baseCost);
    setCapitalInvested(ci => ci + phase.baseCost);

    // Decision-based failure check for clinical phases
    // Your decisions accumulate risk - too much risk leads to failure
    let failedDueToRisk = false;
    let failureType = '';

    if (phase.id === 'phase1') {
      // Phase I: Safety focus - check safetyRisk
      // Threshold: 70+ = high chance of toxicity issues
      if (safetyRisk >= 70) {
        failedDueToRisk = true;
        failureType = 'safety';
      }
    } else if (phase.id === 'phase2') {
      // Phase II: Efficacy focus - check efficacyRisk (Valley of Death)
      // Threshold: 65+ = high chance of no efficacy signal
      if (efficacyRisk >= 65) {
        failedDueToRisk = true;
        failureType = 'efficacy';
      }
    } else if (phase.id === 'phase3') {
      // Phase III: Design focus - check designRisk
      // Threshold: 60+ = high chance of missed primary endpoint
      if (designRisk >= 60) {
        failedDueToRisk = true;
        failureType = 'design';
      }
    }

    if (failedDueToRisk) {
      // Track the failure reason based on decision type
      setProgramEvents(prev => [...prev, {
        title: `${failureType === 'safety' ? 'Safety Signal Detected' :
          failureType === 'efficacy' ? 'Efficacy Signal Not Detected' :
            'Primary Endpoint Missed'}`,
        description: `Your accumulated ${failureType} risk (${failureType === 'safety' ? safetyRisk :
          failureType === 'efficacy' ? efficacyRisk : designRisk}%) exceeded threshold`,
        phase: phase.name,
        isFailure: true
      }]);
      setScreen('failure');
      return;
    }

    // Program advances
    setGateResult({ success: true, probability: realWorldProbability, realWorldRate: phase.realSuccessRate });

    // Track this phase completion for educational display in final report
    setPhasesCompleted(prev => [...prev, {
      name: phase.name,
      id: phase.id,
      realSuccessRate: phase.realSuccessRate,
      color: phase.color
    }]);
  };

  const years = Math.floor(months / 12);
  const monthsRemainder = months % 12;

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  if (screen === 'title') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <header className="text-center mb-10">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">A DRUG DEVELOPMENT SIMULATION</p>
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                THE LONG <span className="text-emerald-400">GAME</span>
              </h1>
              <p className="text-slate-400 text-lg">Experience the tradeoffs that define pharmaceutical innovation</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <p className="text-slate-300 mb-4">
                You are the CEO of a biotechnology company. Your mission: develop a medicine that will improve patients' lives-and eventually become an affordable generic that serves humanity in perpetuity.
              </p>
              <p className="text-slate-500 text-sm">
                Navigate target discovery through FDA approval, making the strategic decisions that define biotech innovation. Your choices determine patient access and reveal the industry's underlying dynamics.
              </p>
              <p className="text-slate-600 text-xs italic mt-3">
                This model simulates selected aspects of biotech development using simplified assumptions for illustrative purposes only.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">THE CLINICAL REALITY</h3>
              <p className="text-slate-500 text-sm mb-4">
                Of drugs entering clinical trials, approximately 7% will reach FDA approval. The rest will fail-most commonly because the biology that worked in models does not translate to human disease.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Phase I to Phase II</span>
                  <span className="text-slate-200 font-mono">47%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Phase II to Phase III</span>
                  <span className="text-amber-400 font-mono">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Phase III to Approval</span>
                  <span className="text-slate-200 font-mono">55%</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-slate-300">Cumulative: Phase I to Approval</span>
                  <span className="text-red-400 font-mono font-bold">~7%</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs mt-4">Source: Citeline analysis of 2014-2023 clinical development data</p>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-400 text-sm font-semibold">SEED FUNDING SECURED</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                Your pitch was successful. A leading biotech seed fund has committed <span className="text-emerald-400 font-semibold">$5M</span> to validate your target. You'll need to raise additional rounds (Series A, B, C) as you hit milestones.
              </p>
              <p className="text-slate-500 text-sm">
                "We're investing early because we believe in your science. ~93% of programs fail, so successful drugs must be priced to compensate for all the failures. Capital is mobile, we're betting your science is sound."
              </p>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              Begin Development
            </button>

            <p className="text-center text-slate-600 text-sm mt-6">Approximately 20 minutes to complete</p>
          </div>
        </div>
      </div>
    );
  }

  // Market Size Selection (Step 2 of 4)
  if (screen === 'setup_market_size') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 2 OF 4</p>
              <h1 className="text-3xl font-bold mb-2">Choose Market Size</h1>
              <p className="text-slate-400">This determines your patient population and regulatory path</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="text-slate-500 text-xs mb-1">MODALITY SELECTED</div>
              <div className="font-semibold" style={{
                color: modality === 'small-molecule' ? '#fbbf24' :
                  modality === 'biologic' ? '#34d399' :
                    modality === 'genetic-medicine' ? '#a78bfa' : '#f472b6'
              }}>
                {MODALITY_DATA[modality]?.displayName || modality}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => selectMarketSize('orphan')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-purple-400">Orphan Drug</h3>
                  <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">{'<'}200K PATIENTS</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {MARKET_SIZE_DATA.orphan.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {MARKET_SIZE_DATA.orphan.highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>

              <button
                onClick={() => selectMarketSize('specialty')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-cyan-400">Specialty Market</h3>
                  <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">200K - 1M PATIENTS</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {MARKET_SIZE_DATA.specialty.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {MARKET_SIZE_DATA.specialty.highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>

              <button
                onClick={() => selectMarketSize('blockbuster')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-blue-400">Blockbuster</h3>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">{'>'}1M PATIENTS</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {MARKET_SIZE_DATA.blockbuster.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {MARKET_SIZE_DATA.blockbuster.highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : h.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Innovation Position Selection (Step 3 of 4)
  if (screen === 'setup_innovation') {
    const marketData = MARKET_SIZE_DATA[marketSize];
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 3 OF 4</p>
              <h1 className="text-3xl font-bold mb-2">Choose Innovation Position</h1>
              <p className="text-slate-400">This determines your competitive and risk profile</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-slate-500 text-xs mb-1">MODALITY</div>
                  <div className="font-semibold" style={{
                    color: modality === 'small-molecule' ? '#fbbf24' :
                      modality === 'biologic' ? '#34d399' :
                        modality === 'genetic-medicine' ? '#a78bfa' : '#f472b6'
                  }}>
                    {MODALITY_DATA[modality]?.displayName || modality}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs mb-1">MARKET SIZE</div>
                  <div className="font-semibold text-purple-400">{marketData?.displayName || marketSize}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => selectInnovation('first-in-class')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-emerald-400">First-in-Class</h3>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">PIONEER</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {INNOVATION_DATA['first-in-class'].description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {INNOVATION_DATA['first-in-class'].highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>

              <button
                onClick={() => selectInnovation('best-in-class')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-amber-400">Best-in-Class</h3>
                  <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">IMPROVE</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {INNOVATION_DATA['best-in-class'].description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {INNOVATION_DATA['best-in-class'].highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : h.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>

              <button
                onClick={() => selectInnovation('fast-follower')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-slate-300">Fast-Follower</h3>
                  <span className="text-xs px-2 py-1 rounded bg-slate-500/20 text-slate-400">DE-RISKED</span>
                </div>
                <p className="text-slate-300 mb-3">
                  {INNOVATION_DATA['fast-follower'].description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {INNOVATION_DATA['fast-follower'].highlights.map((h, i) => (
                    <span key={i} className={h.type === 'positive' ? 'text-emerald-400' : h.type === 'negative' ? 'text-red-400' : 'text-slate-400'}>
                      {h.text}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Indication Selection (Step 4 of 4)
  if (screen === 'setup_indication') {
    // Get compatibility info for current modality
    const getIndicationFit = (area) => {
      const compat = MODALITY_INDICATION_COMPATIBILITY[area];
      if (!compat) return { fit: 'neutral', penalty: 0, reason: 'Standard fit for this modality' };
      const modalityCompat = compat[modality];
      if (!modalityCompat) return { fit: 'neutral', penalty: 0, reason: 'Standard fit for this modality' };
      if (modalityCompat.penalty === 0) return { fit: 'good', ...modalityCompat };
      if (modalityCompat.penalty <= 10) return { fit: 'moderate', ...modalityCompat };
      return { fit: 'poor', ...modalityCompat };
    };

    // Filter indications by market size (using programType which is set to marketSize for compatibility)
    const filteredIndications = INDICATIONS_BY_TYPE[programType] || INDICATIONS;

    // Get display names
    const marketSizeDisplay = MARKET_SIZE_DATA[marketSize]?.displayName || marketSize;
    const innovationDisplay = INNOVATION_DATA[innovation]?.displayName || innovation;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-6">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 4 OF 4</p>
              <h1 className="text-3xl font-bold mb-2">Choose Your Indication</h1>
              <p className="text-slate-400">Select the disease area your platform will target</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-slate-500 text-xs mb-1">MODALITY</div>
                  <div className="font-semibold" style={{
                    color: modality === 'small-molecule' ? '#fbbf24' :
                      modality === 'biologic' ? '#34d399' :
                        modality === 'genetic-medicine' ? '#a78bfa' : '#f472b6'
                  }}>
                    {MODALITY_DATA[modality]?.displayName || modality}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-500 text-xs mb-1">MARKET</div>
                  <div className="font-semibold text-purple-400">{marketSizeDisplay}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs mb-1">INNOVATION</div>
                  <div className="font-semibold text-emerald-400">{innovationDisplay}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredIndications.map((ind, idx) => {
                const fit = getIndicationFit(ind.area);
                const fitColor = fit.fit === 'good' ? 'emerald' : fit.fit === 'poor' ? 'amber' : 'slate';
                const borderHover = fit.fit === 'good' ? 'hover:border-emerald-500/50' :
                  fit.fit === 'poor' ? 'hover:border-amber-500/50' : 'hover:border-slate-600';

                return (
                  <button
                    key={idx}
                    onClick={() => selectIndication(ind)}
                    className={`w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 ${borderHover} rounded-lg p-4 transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-100">{ind.name}</h3>
                        <span className="text-xs text-slate-500">{ind.area} • {ind.usPrevalence} patients</span>
                      </div>
                      {fit.fit === 'good' && (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ✓ Good Fit
                        </span>
                      )}
                      {fit.fit === 'poor' && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          ⚠ +{fit.penalty}% Risk
                        </span>
                      )}
                    </div>
                    {fit.fit === 'poor' && (
                      <p className="text-xs text-amber-400/80 mb-2">{fit.reason}</p>
                    )}
                    {fit.fit === 'good' && fit.reason && (
                      <p className="text-xs text-emerald-400/80 mb-2">{fit.reason}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {ind.challenges.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modality Selection
  if (screen === 'setup_modality') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 1 OF 4</p>
              <h1 className="text-3xl font-bold mb-2">Choose Your Modality</h1>
              <p className="text-slate-400">The type of molecule determines your development path</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => selectModality('small-molecule')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-amber-400">Small Molecule</h3>
                  <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">5-10 YRS • $200M-$800M</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> Kinase inhibitors, receptor modulators, enzyme inhibitors, allosteric modulators, PROTACs. Oral dosing possible.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-amber-400 text-sm font-medium">Selectivity & toxicity</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Target occupancy + pathway PD shift</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ Lower CMC costs</span>
                  <span className="text-blue-400">✓ Oral bioavailability</span>
                  <span className="text-red-400">⚠ Clean PK but no PD shift → target not causal</span>
                </div>
              </button>

              <button
                onClick={() => selectModality('biologic')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-rose-400">Biologic</h3>
                  <span className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-400">7-12 YRS • $300M-$1B</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> Monoclonal antibodies (mAbs), ADCs, bispecifics, fusion proteins. High target specificity.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-rose-400 text-sm font-medium">Biology redundancy</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Sustained ligand suppression</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ High target specificity</span>
                  <span className="text-amber-400">⚠ ADA risk</span>
                  <span className="text-red-400">⚠ Complete neutralization with no clinical benefit</span>
                </div>
              </button>

              <button
                onClick={() => selectModality('genetic-medicine')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-cyan-400">Genetic Medicine</h3>
                  <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">6-14 YRS • $300M-$1.5B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> Gene therapy (AAV), siRNA/RNAi, CRISPR gene editing. Sequence-based therapeutics with curative potential.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-cyan-400 text-sm font-medium">Delivery & durability</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Sustained payload expression/knockdown in target tissue</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ Platform technology</span>
                  <span className="text-amber-400">⚠ Tissue delivery limits</span>
                  <span className="text-red-400">⚠ Immunogenicity & durability</span>
                </div>
              </button>

              <button
                onClick={() => selectModality('cell-therapy')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-pink-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-pink-400">Cell Therapy</h3>
                  <span className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">8-15 YRS • $600M-$2B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> CAR-T, CAR-NK, TILs, stem cells. Living drugs with deep responses in hematologic cancers.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-pink-400 text-sm font-medium">Safety & manufacturing</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Expansion correlates with response</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ Deep responses</span>
                  <span className="text-amber-400">⚠ CRS/ICANS toxicity</span>
                  <span className="text-red-400">⚠ Expansion without durability</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'phase') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs font-medium tracking-wide">
                  {MARKET_SIZE_DATA[marketSize]?.displayName?.toUpperCase() || marketSize?.toUpperCase() || 'MARKET'} • {
                    INNOVATION_DATA[innovation]?.displayName?.toUpperCase() || innovation?.toUpperCase() || 'INNOVATION'} • {
                    MODALITY_DATA[modality]?.displayName?.toUpperCase() || modality?.toUpperCase() || 'MODALITY'}
                </div>
                <div className="text-lg font-semibold">{drugName}</div>
                <div className="text-slate-400 text-sm">{indication}</div>
                {exitStrategy && (
                  <div className="text-emerald-500 text-xs mt-1">
                    {exitStrategy?.name || 'Exit TBD'}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-slate-500 text-xs">ROUND</div>
                  <div className="text-sm font-semibold text-purple-400">
                    {FINANCING_ROUNDS[currentRoundIndex]?.name || 'Seed'}
                  </div>
                  <div className="text-xs text-slate-500">{totalDilution}% diluted</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">CAPITAL</div>
                  <div className={`text-xl font-mono ${cash < 30 ? 'text-red-400 animate-pulse' : cash < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>${cash}M</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">INVESTED</div>
                  <div className="text-xl font-mono text-amber-400">${capitalInvested}M</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">ELAPSED</div>
                  <div className="text-xl font-mono text-blue-400">
                    {years > 0 ? `${years}y ${monthsRemainder}m` : `${monthsRemainder}m`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">SUCCESS MOD</div>
                  <div className={`text-xl font-mono ${riskBonus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {riskBonus >= 0 ? '+' : ''}{Math.round(riskBonus * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Phase Progress */}
        <div className="border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-3">
            <div className="flex gap-2">
              {PHASES.map((phase, i) => (
                <div
                  key={phase.id}
                  className="flex-1 h-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: i < currentPhaseIndex ? phase.color :
                      i === currentPhaseIndex ? `${phase.color}80` :
                        '#1e293b'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              {PHASES.map((phase, i) => (
                <span key={phase.id} className={i === currentPhaseIndex ? 'text-slate-300' : ''}>
                  {phase.id === 'phase1' ? 'Phase I' : phase.id === 'phase2' ? 'Phase II' : phase.id === 'phase3' ? 'Phase III' : phase.id === 'patient_access' ? 'Patient Access' : phase.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Financing Modal */}
        {showFinancingScreen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-lg w-full mx-4">
              {!financingResult ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-amber-400">Capital Required</h2>
                  </div>

                  <p className="text-slate-300 mb-4">
                    Your runway is getting short. To continue development, you'll need to raise additional capital.
                  </p>

                  <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Current Cash:</span>
                      <span className="text-red-400 font-mono">${cash}M</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Current Round:</span>
                      <span className="text-purple-400">{FINANCING_ROUNDS[currentRoundIndex]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Dilution:</span>
                      <span className="text-amber-400">{totalDilution}%</span>
                    </div>
                  </div>

                  {currentRoundIndex < FINANCING_ROUNDS.length - 1 && (
                    <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4 mb-6">
                      <div className="text-emerald-400 font-semibold mb-2">
                        {FINANCING_ROUNDS[currentRoundIndex + 1]?.name} Available
                      </div>
                      <div className="text-sm text-slate-300 mb-3">
                        {FINANCING_ROUNDS[currentRoundIndex + 1]?.description}
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Amount:</span>
                        <span className="text-emerald-400 font-mono">+${FINANCING_ROUNDS[currentRoundIndex + 1]?.amount}M</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Dilution:</span>
                        <span className="text-amber-400">+{FINANCING_ROUNDS[currentRoundIndex + 1]?.dilution}%</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-3">
                        <strong>Investor Expectation:</strong> {FINANCING_ROUNDS[currentRoundIndex + 1]?.investorExpectation}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => raiseNextRound(true)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Raise {FINANCING_ROUNDS[currentRoundIndex + 1]?.name}
                    </button>
                    <button
                      onClick={() => raiseNextRound(false)}
                      className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                    >
                      Skip for Now
                    </button>
                  </div>

                  <p className="text-slate-600 text-xs mt-4 text-center">
                    "Capital is mobile. Investors are betting your science is sound."
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-emerald-400">{financingResult.round.name} Closed</h2>
                  </div>

                  <p className="text-slate-300 mb-4">
                    Congratulations! Your investors were impressed with your progress and have committed additional capital.
                  </p>

                  <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Capital Raised:</span>
                      <span className="text-emerald-400 font-mono">+${financingResult.round.amount}M</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">New Cash Balance:</span>
                      <span className="text-emerald-400 font-mono">${financingResult.newCash}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Dilution:</span>
                      <span className="text-amber-400">{financingResult.totalDilution}%</span>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
                    <div className="text-blue-400 font-semibold mb-2">Next Milestone</div>
                    <p className="text-sm text-slate-300">{financingResult.round.nextMilestone}</p>
                  </div>

                  <button
                    onClick={acknowledgeFinancing}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Continue Development
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Alternative Financing Modal */}
        {showAlternativeFinancing && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-amber-400">Traditional Financing Exhausted</h2>
              </div>

              <p className="text-slate-300 mb-4">
                You've raised all traditional VC rounds through IPO. To continue, you'll need to pursue alternative financing strategies that are common in late-stage biotech.
              </p>

              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Current Cash:</span>
                  <span className="text-red-400 font-mono">${cash}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phase Cost:</span>
                  <span className="text-slate-300 font-mono">${PHASES[currentPhaseIndex]?.baseCost}M</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {ALTERNATIVE_FINANCING.filter(alt => {
                  if (alternativeFinancingUsed.includes(alt.id)) return false;
                  const phaseOrder = ['basic_research', 'drug_discovery', 'lead_optimization', 'ind_enabling', 'phase1', 'phase2', 'phase3', 'fda_review'];
                  const currentPhaseOrder = phaseOrder.indexOf(PHASES[currentPhaseIndex]?.id);
                  const minPhaseOrder = phaseOrder.indexOf(alt.minPhase);
                  if (currentPhaseOrder < minPhaseOrder) return false;
                  if (alt.requiresIPO && currentRoundIndex < FINANCING_ROUNDS.length - 1) return false;
                  return true;
                }).map(alt => (
                  <button
                    key={alt.id}
                    onClick={() => selectAlternativeFinancing(alt)}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500/50 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-emerald-400">{alt.name}</h3>
                      <span className="text-emerald-400 font-mono text-lg">+${alt.amount}M</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{alt.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                        ⚠️ {alt.tradeoff}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{alt.lesson}</p>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={declineAlternativeFinancing}
                  className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-400 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Discontinue Program (No Further Funding)
                </button>
                <p className="text-slate-600 text-xs mt-2 text-center">
                  Without additional capital, development cannot continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">

            {/* Phase Intro */}
            {phaseStep === 0 && (
              <div className="text-center">
                <div
                  className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                  style={{ backgroundColor: `${currentPhase.color}20`, color: currentPhase.color }}
                >
                  Stage {currentPhaseIndex + 1} of {PHASES.length}
                </div>
                <h2 className="text-3xl font-bold mb-2">{currentPhase.name}</h2>
                <p className="text-slate-400 mb-6">{currentPhase.description}</p>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                  <p className="text-slate-300 text-sm mb-4">
                    {/* Use modality-specific context if available, otherwise fall back to generic */}
                    {MODALITY_PHASE_CONTEXT[modality]?.[currentPhase.id]?.context || currentPhase.context}
                  </p>

                  {/* Use modality-specific activities if available, otherwise fall back to generic */}
                  {(MODALITY_PHASE_CONTEXT[modality]?.[currentPhase.id]?.activities || currentPhase.activities) && (
                    <div className="mb-4 pb-4 border-b border-slate-700">
                      <div className="text-slate-500 text-xs mb-2">KEY ACTIVITIES</div>
                      <div className="flex flex-wrap gap-2">
                        {(MODALITY_PHASE_CONTEXT[modality]?.[currentPhase.id]?.activities || currentPhase.activities).map((activity, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show modality-program fit warnings at the start of Basic Research */}
                  {currentPhase.id === 'basic_research' && programEvents.some(e => e.type === 'warning') && (
                    <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-amber-400 font-semibold text-sm">Strategic Challenge</span>
                      </div>
                      {programEvents.filter(e => e.type === 'warning').map((event, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <p className="text-amber-200 text-sm">{event.message}</p>
                          {event.detail && (
                            <p className="text-amber-400/70 text-xs mt-1">{event.detail}</p>
                          )}
                        </div>
                      ))}
                      <p className="text-slate-400 text-xs mt-3 italic">
                        Success is still possible but requires excellent execution to overcome these challenges.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-slate-500 text-sm">Typical Duration</div>
                      <div className="text-slate-200 font-medium">{currentPhase.duration}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Typical Investment</div>
                      <div className="text-slate-200 font-medium">{currentPhase.cost}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Industry Success Rate</div>
                      <div className="font-medium" style={{ color: currentPhase.color }}>{currentPhase.realSuccessRate}%</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={advanceStep}
                  className="bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Enter {currentPhase.name}
                </button>
              </div>
            )}

            {/* Question */}
            {phaseStep === 1 && currentQuestion && !questionResult && (
              <div>
                <div
                  className="inline-block px-3 py-1 rounded text-xs font-medium mb-4"
                  style={{ backgroundColor: `${currentPhase.color}20`, color: currentPhase.color }}
                >
                  STRATEGIC DECISION
                </div>
                <h2 className="text-2xl font-bold mb-4">{currentQuestion.title}</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
                  <p className="text-slate-300 leading-relaxed">{currentQuestion.scenario}</p>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionAnswer(option)}
                      className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-colors"
                    >
                      <div className="font-medium text-slate-100 mb-1">{option.text}</div>
                      <div className="text-slate-500 text-sm mb-2">{option.detail}</div>
                      <div className="flex gap-4 text-xs">
                        {option.cashEffect && (
                          <span className={option.cashEffect > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {option.cashEffect > 0 ? '+' : ''}{option.cashEffect}M
                          </span>
                        )}
                        {option.timeEffect && (
                          <span className={option.timeEffect < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                            {option.timeEffect > 0 ? '+' : ''}{option.timeEffect} months
                          </span>
                        )}
                        {option.riskBonus && (
                          <span className={option.riskBonus > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {option.riskBonus > 0 ? '+' : ''}{Math.round(option.riskBonus * 100)}% success
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Result */}
            {phaseStep === 1 && questionResult && (
              <div>
                <div className="text-emerald-400 text-sm font-medium mb-2">OUTCOME</div>
                <h2 className="text-2xl font-bold mb-4">{currentQuestion.title}</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-4">
                  <p className="text-slate-300 mb-4">{questionResult.result}</p>
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="text-emerald-400 text-xs font-medium mb-1">KEY INSIGHT</div>
                    <p className="text-slate-400 text-sm">{questionResult.lesson}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setQuestionResult(null);
                    advanceStep();
                  }}
                  className="w-full bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Event */}
            {phaseStep === 2 && currentEvent && (
              <div>
                <div
                  className={`inline-block px-3 py-1 rounded text-xs font-medium mb-4 ${currentEvent.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                >
                  {currentEvent.positive ? 'FAVORABLE DEVELOPMENT' : 'ADVERSE DEVELOPMENT'}
                </div>
                <h2 className="text-2xl font-bold mb-4">{currentEvent.title}</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
                  <p className="text-slate-300">{currentEvent.description}</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  {currentEvent.cashEffect && (
                    <div className={`px-4 py-2 rounded-lg text-sm ${currentEvent.cashEffect > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {currentEvent.cashEffect > 0 ? '+' : ''}{currentEvent.cashEffect}M Capital
                    </div>
                  )}
                  {currentEvent.timeEffect && (
                    <div className={`px-4 py-2 rounded-lg text-sm ${currentEvent.timeEffect < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                      {currentEvent.timeEffect > 0 ? '+' : ''}{currentEvent.timeEffect} Months
                    </div>
                  )}
                  {currentEvent.riskBonus && (
                    <div className={`px-4 py-2 rounded-lg text-sm ${currentEvent.riskBonus > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {currentEvent.riskBonus > 0 ? '+' : ''}{Math.round(currentEvent.riskBonus * 100)}% Success Rate
                    </div>
                  )}
                  {currentEvent.revenueShare && (
                    <div className="px-4 py-2 rounded-lg text-sm bg-purple-500/20 text-purple-400">
                      {Math.round(currentEvent.revenueShare * 100)}% Profit Share
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEventAcknowledge}
                  className={`w-full font-semibold py-3 px-8 rounded-lg transition-colors ${currentEvent.positive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                >
                  {currentEvent.isPartnership ? 'Accept Partnership' : 'Acknowledge'}
                </button>
              </div>
            )}

            {/* No Event */}
            {phaseStep === 2 && !currentEvent && !currentPolicy && (
              <div className="text-center">
                <p className="text-slate-400 mb-6">Development proceeds according to plan this phase.</p>
                <button
                  onClick={advanceStep}
                  className="bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Proceed to Phase Gate
                </button>
              </div>
            )}

            {/* Policy Event */}
            {phaseStep === 2.5 && currentPolicy && !policyResult && (
              <div>
                <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-amber-500/20 text-amber-400">
                  POLICY DEVELOPMENT
                </div>
                <h2 className="text-2xl font-bold mb-4">{currentPolicy.title}</h2>

                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-5 mb-6">
                  <p className="text-slate-300">{currentPolicy.description}</p>
                </div>

                <div className="space-y-3">
                  {currentPolicy.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handlePolicyAnswer(option.value)}
                      className="w-full text-left bg-slate-900 hover:bg-amber-900/30 border border-slate-700 hover:border-amber-600 rounded-lg p-4 transition-colors"
                    >
                      <div className="font-medium text-slate-100">{option.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Aftermath */}
            {policyResult && (
              <div>
                <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-amber-500/20 text-amber-400">
                  UNINTENDED CONSEQUENCES
                </div>
                <h2 className="text-2xl font-bold mb-4">{policyResult.aftermath.title}</h2>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
                  <ul className="space-y-2 mb-4">
                    {policyResult.aftermath.effects.map((effect, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-amber-400 mt-0.5">-</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="text-emerald-400 text-xs font-medium mb-1">THE UNDERLYING DYNAMIC</div>
                    <p className="text-slate-300 text-sm">{policyResult.aftermath.lesson}</p>
                  </div>
                </div>

                <button
                  onClick={handlePolicyAftermathContinue}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* IRA Implications Event - Phase III for small molecules */}
            {phaseStep === 2.7 && (
              <div>
                <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-rose-500/20 text-rose-400">
                  INFLATION REDUCTION ACT
                </div>
                <h2 className="text-2xl font-bold mb-4">Medicare Price Negotiation</h2>

                <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-5 mb-6">
                  <p className="text-slate-300 mb-4">
                    The Inflation Reduction Act of 2022 established Medicare's authority to negotiate prices for certain high-expenditure drugs. Your {modality === 'small-molecule' ? 'small molecule' : 'biologic'} will become eligible for negotiation {modality === 'small-molecule' ? '9' : '13'} years after FDA approval.
                  </p>
                  <p className="text-slate-300 mb-4">
                    This creates a "cliff" in your revenue projections: prices may be reduced by 25-60% when negotiation occurs. The policy aims to reduce Medicare spending but changes the economics of drug development.
                  </p>

                  <div className="bg-slate-900/50 rounded-lg p-4 mt-4">
                    <h4 className="text-rose-400 text-sm font-semibold mb-3">IMPLICATIONS FOR YOUR PROGRAM</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span className="text-slate-300">Your exclusivity window is effectively shortened to {modality === 'small-molecule' ? '9' : '13'} years of market-rate pricing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span className="text-slate-300">Net present value calculations must now discount post-negotiation revenues significantly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span className="text-slate-300">Investors are already adjusting valuations for IRA impact across the industry</span>
                      </div>
                      {programType === 'orphan' && (
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          <span className="text-emerald-400">However: Orphan drugs are currently exempt from Medicare negotiation</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
                  <div className="text-emerald-400 text-xs font-medium mb-2">THE POLICY TRADEOFF</div>
                  <p className="text-slate-400 text-sm">
                    The IRA reflects a genuine tension in drug pricing: society wants both affordable medicines and continued innovation. Lower prices today benefit current patients; reduced investment affects future patients who won't have access to drugs that are never developed. There is no cost-free solution to this tradeoff-only choices about who bears the burden.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSeenIRA(true);
                    setMarketMultiplier(mm => mm * 0.85); // 15% NPV reduction from IRA
                    advanceStep();
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Acknowledge IRA Impact (-15% NPV)
                </button>
              </div>
            )}

            {/* Gate */}
            {phaseStep === 3 && !gateResult && (
              <div className="text-center">
                <div
                  className="inline-block px-3 py-1 rounded text-xs font-medium mb-4"
                  style={{ backgroundColor: `${currentPhase.color}20`, color: currentPhase.color }}
                >
                  PHASE GATE
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentPhase.name} Decision Point</h2>
                <p className="text-slate-400 mb-6">
                  {currentPhase.realSuccessRate
                    ? 'Your data will determine whether the program advances to the next stage.'
                    : currentPhase.id === 'basic_research'
                      ? 'Have you identified and validated a promising drug target?'
                      : currentPhase.id === 'drug_discovery'
                        ? (modality === 'cell-therapy'
                          ? 'Have you established your cell engineering process and source strategy?'
                          : modality === 'genetic-medicine'
                            ? 'Have you validated your delivery platform and target tissue access?'
                            : modality === 'biologic'
                              ? 'Have you identified antibody candidates worth optimizing?'
                              : 'Have you found hit compounds worth optimizing?')
                        : currentPhase.id === 'lead_optimization'
                          ? 'Is your lead compound ready for formal safety testing?'
                          : currentPhase.id === 'ind_enabling'
                            ? 'Is your IND package ready for FDA submission?'
                            : currentPhase.id === 'post_market'
                              ? 'Is your safety profile holding up in real-world use?'
                              : currentPhase.id === 'patient_access'
                                ? 'Will patients who need your therapy actually be able to access it?'
                                : 'Has your program met the requirements for this stage?'}
                </p>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                  {currentPhase.realSuccessRate ? (
                    <>
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <div className="text-slate-500 text-sm">FDA Success Rate</div>
                          <div className="text-2xl font-bold" style={{ color: currentPhase.color }}>
                            {currentPhase.realSuccessRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-sm">Your Accumulated Modifier</div>
                          <div className={`text-2xl font-bold ${riskBonus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {riskBonus >= 0 ? '+' : ''}{Math.round(riskBonus * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-4">
                        <div className="text-slate-500 text-sm">Your Probability of Success</div>
                        <div className="text-3xl font-bold text-slate-100">
                          {Math.round(Math.min(95, Math.max(5, (GATE_SUCCESS[currentPhase.id] + riskBonus) * 100)))}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <div className="text-slate-500 text-sm mb-2">
                        {currentPhase.id === 'post_market'
                          ? 'Post-Approval Monitoring'
                          : currentPhase.id === 'patient_access'
                            ? 'Market Access Phase'
                            : 'Preclinical Phase'}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {currentPhase.id === 'basic_research'
                          ? 'Most targets fail validation. Only those with strong biological evidence should advance.'
                          : currentPhase.id === 'drug_discovery'
                            ? (modality === 'cell-therapy'
                              ? 'Cell therapy development requires engineering cells with the right phenotype, persistence, and safety profile. Manufacturing complexity is the key challenge.'
                              : modality === 'genetic-medicine'
                                ? 'Delivery platform selection determines which tissues you can reach. Liver is well-established; other organs remain challenging.'
                                : modality === 'biologic'
                                  ? 'Antibody discovery requires balancing affinity, specificity, and developability. Immunogenicity is a key clinical risk.'
                                  : 'Most screening campaigns yield few viable hits. Quality matters more than quantity.')
                            : currentPhase.id === 'lead_optimization'
                              ? 'Many leads fail due to poor ADME, toxicity, or lack of efficacy in animal models.'
                              : currentPhase.id === 'ind_enabling'
                                ? 'IND-enabling studies must demonstrate safety sufficient for human testing.'
                                : currentPhase.id === 'post_market'
                                  ? 'Real-world safety signals can emerge. Ongoing surveillance protects patients.'
                                  : currentPhase.id === 'patient_access'
                                    ? 'FDA approval is step one. Now you must navigate payers, PBMs, and cost-sharing to reach patients.'
                                    : 'Your program must meet requirements to advance.'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGateRoll}
                  className="bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Evaluate Data
                </button>
              </div>
            )}

            {/* Gate Result - Always advances but shows real-world context */}
            {phaseStep === 3 && gateResult && (
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-emerald-500/20 text-emerald-400">
                  PHASE COMPLETE
                </div>
                <h2 className="text-2xl font-bold mb-2">{currentPhase.name} Complete</h2>
                <p className="text-slate-400 mb-6">
                  Your program will advance to the next stage of development.
                </p>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                  {gateResult.realWorldRate ? (
                    <>
                      <div className="grid grid-cols-2 gap-6 text-center mb-4">
                        <div>
                          <div className="text-slate-500 text-sm">Real-World Success Rate</div>
                          <div className="text-2xl font-bold" style={{ color: currentPhase.color }}>
                            {gateResult.realWorldRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-sm">Programs That Fail Here</div>
                          <div className="text-2xl font-bold text-red-400">
                            {100 - gateResult.realWorldRate}%
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm">
                          According to FDA data, {100 - gateResult.realWorldRate}% of programs fail at this stage. Your program advances to show the full development journey.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">
                        {currentPhase.id === 'basic_research'
                          ? 'You have validated your target. Most research programs never find a viable target - yours has cleared the first hurdle.'
                          : currentPhase.id === 'drug_discovery'
                            ? (modality === 'cell-therapy'
                              ? 'You have established your cell engineering process. Now the manufacturing optimization and safety characterization begins.'
                              : modality === 'genetic-medicine'
                                ? 'You have validated your delivery platform. Now optimization of expression and durability begins.'
                                : modality === 'biologic'
                                  ? 'You have identified antibody candidates. Now the engineering and optimization work begins.'
                                  : 'You have identified hit compounds. Now the real work begins - optimizing them into a drug candidate.')
                            : currentPhase.id === 'lead_optimization'
                              ? 'Your lead compound has acceptable properties. Time to prepare for IND-enabling studies.'
                              : 'Your IND package is ready. FDA will review before you can begin human trials.'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={advanceStep}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  {currentPhaseIndex >= PHASES.length - 1 ? 'Complete Development' : 'Continue to Next Phase'}
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // Victory Screen
  if (screen === 'victory') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-emerald-500/20 text-emerald-400">
                FDA APPROVAL GRANTED
              </div>
              <h1 className="text-4xl font-bold mb-2">{drugName}</h1>
              <p className="text-slate-400 text-lg">indicated for the treatment of {indication}</p>
              <p className="text-slate-500 text-sm mt-2">
                {programType === 'first-in-class' ? 'First-in-Class' : programType === 'orphan' ? 'Orphan Drug' : 'Blockbuster'} • {modality === 'biologic' ? 'Biologic' : 'Small Molecule'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{years}+ years</div>
                <div className="text-slate-500 text-sm">Development time</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">${capitalInvested}M</div>
                <div className="text-slate-500 text-sm">Total invested</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">${cash}M</div>
                <div className="text-slate-500 text-sm">Capital remaining</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Your Development Journey</h3>
              <p className="text-slate-300 mb-4">
                You navigated {phasesCompleted.length} development phases. Here's what the real-world odds looked like:
              </p>

              {/* Phase-by-phase journey */}
              <div className="space-y-2 mb-4">
                {phasesCompleted.filter(p => p.realSuccessRate).map((phase, idx) => (
                  <div key={phase.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color }}></div>
                    <div className="flex-1 text-slate-400 text-sm">{phase.name}</div>
                    <div className="text-emerald-400 font-medium text-sm">✓ {phase.realSuccessRate}%</div>
                  </div>
                ))}
              </div>

              {/* Cumulative probability */}
              {(() => {
                const clinicalPhases = phasesCompleted.filter(p => p.realSuccessRate);
                if (clinicalPhases.length > 0) {
                  const cumulativeProb = clinicalPhases.reduce((acc, p) => acc * (p.realSuccessRate / 100), 1) * 100;
                  return (
                    <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Cumulative probability of success:</span>
                        <span className="text-2xl font-bold text-emerald-400">{cumulativeProb.toFixed(1)}%</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Only ~{cumulativeProb.toFixed(0)} out of 100 drugs that entered Phase I would have reached this point.
                        You beat the odds!
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Modality-Indication Challenge Overcome */}
            {programEvents.some(e => e.type === 'warning' && e.phase === 'Modality Selection') && (
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Scientific Challenge Overcome</h3>
                <p className="text-slate-300 text-sm">
                  {programEvents.find(e => e.type === 'warning' && e.phase === 'Modality Selection')?.message?.replace('⚠️ ', '')}
                </p>
                <p className="text-purple-300 text-sm mt-2">
                  Your program succeeded despite this biological constraint, demonstrating that careful development can overcome delivery challenges.
                </p>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">The Biotech Social Contract</h3>
              <p className="text-slate-400 text-sm mb-4">
                Your drug is now part of an implicit agreement between the pharmaceutical industry and society:
              </p>
              <div className="space-y-4 text-sm">
                {programType === 'orphan' ? (
                  // Orphan Drug - IRA EXEMPT (conditionally)
                  <>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Years 1-7</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Orphan Drug Exclusivity:</span> 7 years of market exclusivity prevents generic/biosimilar competition. This longer exclusivity period compensates for the smaller patient population.
                      </div>
                    </div>
                    <div className="flex gap-4 bg-emerald-900/30 p-3 rounded-lg border border-emerald-700/50">
                      <div className="w-24 text-emerald-400 flex-shrink-0 font-medium">IRA Status</div>
                      <div className="text-emerald-300">
                        <span className="font-medium">✓ Exempt from Medicare Negotiation</span> <span className="text-emerald-400/80">(while treating only rare diseases)</span>
                        <p className="text-slate-400 text-xs mt-2">
                          Under the IRA, orphan drugs remain exempt as long as all approved indications are for rare diseases. Under the July 2025 "One Big Beautiful Bill Act" updates, this protection extends even to multiple orphan indications. However, if later approved for a non-orphan (common) disease, negotiation eligibility begins {modality === 'small-molecule' ? '9' : '13'} years after that non-orphan approval.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Year 8+</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Generics entry:</span> Branded drug exclusivity is a finite mortgage, not an infinite rent. When it ends, generics and biosimilars enter the market. Your innovation transforms into a public good, permanently affordable and accessible to all who need it.
                      </div>
                    </div>
                  </>
                ) : (
                  // Non-orphan drugs - subject to IRA
                  <>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Years 1-{modality === 'small-molecule' ? '9' : '13'}</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Innovation Period:</span> Premium pricing reflects the investment required to develop this drug and compensates for the ~90% of clinical programs that failed along the way.
                      </div>
                    </div>
                    <div className={`flex gap-4 ${modality === 'small-molecule' ? 'bg-amber-900/30 p-3 rounded-lg border border-amber-700/50' : 'bg-slate-800/50 p-3 rounded-lg'}`}>
                      <div className={`w-24 flex-shrink-0 font-medium ${modality === 'small-molecule' ? 'text-amber-400' : 'text-slate-500'}`}>Year {modality === 'small-molecule' ? '9' : '13'}+</div>
                      <div className={modality === 'small-molecule' ? 'text-amber-300' : 'text-slate-300'}>
                        {modality === 'small-molecule' ? (
                          <>
                            <span className="font-medium">IRA Medicare Negotiation:</span> Under the Inflation Reduction Act, small molecules face Medicare price negotiation after 9 years. This represents a significant reduction in the effective exclusivity period, potentially reducing net present value by up to 40% and shifting R&D investment toward biologics.
                          </>
                        ) : (
                          <>
                            <span className="font-medium">IRA Medicare Negotiation:</span> Under the Inflation Reduction Act, biologics face Medicare price negotiation after 13 years. This timeline closely parallels existing biosimilar competition timelines, resulting in minimal incremental impact on biologic investment economics.
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Perpetuity</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Generics entry:</span> Branded drug exclusivity is a finite mortgage, not an infinite rent. When it ends, generics or biosimilars enter the market. Your innovation transforms into a public good, permanently affordable and accessible to all who need it.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Patient Access & Affordability Reality */}
            {MODALITY_ACCESS_CHALLENGES[modality] && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">The Access Gap</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Here's the uncomfortable truth: FDA approval means you <em>can</em> sell your drug. It doesn't mean patients can <em>access</em> it. Between your innovation and the patient stand payers, PBMs, and cost-sharing structures.
                </p>
                <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 mb-4">
                  <p className="text-slate-400 text-sm">
                    {MODALITY_ACCESS_CHALLENGES[modality].insuranceReality}
                  </p>
                </div>
                <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                  <p className="text-emerald-300 text-sm">
                    <strong>The Fix:</strong> Patients already pay through premiums. The problem is cost-sharing at the pharmacy counter, where they're asked to pay again. Cap out-of-pocket costs. Ban copay accumulators. Let insurance actually work like insurance. Innovation incentives remain intact.
                  </p>
                </div>
              </div>
            )}


            {alternativeFinancingUsed.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Alternative Financing Secured</h3>
                <p className="text-slate-400 text-sm mb-3">Your program required non-traditional financing after exhausting VC rounds:</p>
                <div className="space-y-2">
                  {alternativeFinancingUsed.map(fin => {
                    const finData = ALTERNATIVE_FINANCING.find(f => f.id === fin);
                    return finData ? (
                      <div key={fin} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-300">{finData.name}</span>
                        <span className="text-blue-400">${finData.amount}M</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <p className="text-slate-500 text-xs mt-3">
                  Revenue impact: {Math.round((1 - revenueMultiplier) * 100)}% of future revenues committed to financing partners
                </p>
              </div>
            )}

            <button
              onClick={() => setScreen('title')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Failure Screen
  if (screen === 'failure') {
    const failedPhase = PHASES[currentPhaseIndex];
    const noFinancingLeft = currentRoundIndex >= FINANCING_ROUNDS.length - 1;
    const phaseCost = failedPhase?.baseCost || 0;
    const couldntAffordPhase = cash >= 0 && cash < phaseCost && noFinancingLeft;

    // Get phase-specific failure reason
    const phaseFailure = FAILURE_REASONS[failedPhase?.id] || FAILURE_REASONS.phase2;
    const modalityFailure = MODALITY_FAILURE_MODES[modality] || MODALITY_FAILURE_MODES['small-molecule'];

    // Determine if this is early or late phase
    const isClinicialPhase = ['phase1', 'phase2', 'phase3'].includes(failedPhase?.id);
    const isLatePhase = ['phase2', 'phase3', 'fda_review'].includes(failedPhase?.id);

    const failReason = couldntAffordPhase
      ? `could not secure funding to continue ${failedPhase?.name || 'the next phase'}`
      : cash <= 0
        ? 'ran out of capital'
        : `did not meet endpoints in ${failedPhase?.name || 'this phase'}`;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-red-500/20 text-red-400">
                PROGRAM TERMINATED
              </div>
              <h1 className="text-4xl font-bold mb-2">{drugName} Development Discontinued</h1>
              <p className="text-slate-400 text-lg">Your program {failReason}</p>
              <p className="text-slate-500 text-sm mt-2">
                {programType === 'first-in-class' ? 'First-in-Class' : programType === 'orphan' ? 'Orphan Drug' : 'Blockbuster'} • {modality === 'small-molecule' ? 'Small Molecule' : modality === 'biologic' ? 'Biologic' : modality === 'gene-therapy' ? 'Gene Therapy' : 'Cell Therapy'} • {indication}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">{years}y {monthsRemainder}m</div>
                <div className="text-slate-500 text-xs">Time elapsed</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-400">${capitalInvested}M</div>
                <div className="text-slate-500 text-xs">Capital invested</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">${cash}M</div>
                <div className="text-slate-500 text-xs">Cash remaining</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold" style={{ color: failedPhase?.color }}>
                  {failedPhase?.id === 'phase1' ? 'Phase I' : failedPhase?.id === 'phase2' ? 'Phase II' : failedPhase?.id === 'phase3' ? 'Phase III' : failedPhase?.name || 'Unknown'}
                </div>
                <div className="text-slate-500 text-xs">Failed at</div>
              </div>
            </div>

            {/* Post-Mortem Analysis */}
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Post-Mortem Analysis</h3>

              {/* Phase-specific failure reason */}
              <div className="mb-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Primary Failure Mode</div>
                <div className="text-slate-200 font-medium">{phaseFailure.primary}</div>
              </div>

              <div className="mb-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">What This Means</div>
                <div className="text-slate-300 text-sm">{phaseFailure.details}</div>
              </div>

              {isClinicialPhase && (
                <div className="mb-4">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Endpoint Result</div>
                  <div className="text-red-400 text-sm font-mono bg-slate-800/50 p-2 rounded">{phaseFailure.endpoint}</div>
                </div>
              )}

              {/* Modality-specific issues */}
              <div className="border-t border-red-700/30 pt-4 mt-4">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  {modality === 'small-molecule' ? 'Small Molecule' : modality === 'biologic' ? 'Biologic' : modality === 'gene-therapy' ? 'Gene Therapy' : 'Cell Therapy'} Failure Pattern
                </div>
                <div className="text-slate-300 text-sm">
                  {isLatePhase ? modalityFailure.latePhase : modalityFailure.earlyPhase}
                </div>
              </div>
            </div>

            {/* Accumulated Events */}
            {programEvents.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-5 mb-6">
                <h4 className="text-amber-400 font-semibold mb-3">Contributing Factors</h4>
                <div className="space-y-2">
                  {programEvents.filter(e => !e.financing).slice(-4).map((event, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-red-400">•</span>
                      <div>
                        <span className="text-slate-300 font-medium">{event.title}</span>
                        {event.failureMode && (
                          <span className="text-amber-400 text-xs ml-2">({event.failureMode})</span>
                        )}
                        <span className="text-slate-500 text-xs block">{event.phase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative financing used */}
            {alternativeFinancingUsed.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4 mb-6">
                <h4 className="text-purple-400 font-semibold mb-2">💰 Alternative Financing Pursued</h4>
                <div className="text-slate-300 text-sm">
                  {alternativeFinancingUsed.map(id => {
                    const alt = ALTERNATIVE_FINANCING.find(a => a.id === id);
                    return alt ? `${alt.name} (+$${alt.amount}M, ${alt.tradeoff})` : id;
                  }).join(' • ')}
                </div>
              </div>
            )}

            {/* Industry context */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">This Outcome Is Typical</h3>
              {phaseFailure.successRate && (
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold" style={{ color: failedPhase?.color }}>{phaseFailure.successRate}</div>
                  <div className="text-slate-400 text-sm">
                    of programs successfully complete {failedPhase?.name}.<br />
                    <span className="text-red-400 font-medium">{100 - parseInt(phaseFailure.successRate)}%</span> fail at this stage, you are not alone.
                  </div>
                </div>
              )}
              <p className="text-slate-500 text-sm">
                {modalityFailure.commonIssue}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-6">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">Why This Matters:</strong> You invested ${capitalInvested}M before this failure.
                The drugs that succeed must generate returns sufficient to compensate for programs like this one.
                Because only ~7% reach approval, successful drugs must be priced to cover the cost of failure.
              </p>
            </div>

            <button
              onClick={() => setScreen('title')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
