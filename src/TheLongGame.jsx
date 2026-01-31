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
    dominantFailure: 'Biology redundancy / pathway compensation',
    failureModes: [
      'Poor tissue penetration - solid tumors, CNS (Delivery)',
      'Target redundancy / pathway compensation (Biology)',
      'Anti-drug antibodies - ADA/immunogenicity (Safety)',
      'Lack of efficacy despite strong target binding (Biology)'
    ],
    biologyRisk: 'High - target biology may not translate from preclinical',
    chemistryRisk: 'Moderate - CMC scale-up, GMP bioreactors',
    deliveryRisk: 'Moderate - IV administration, poor CNS penetration',
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
  'gene-therapy': {
    displayName: 'Gene Therapy (AAV)',
    dominantFailure: 'Immunity & durability',
    failureModes: [
      'Pre-existing immunity to AAV vector (Delivery)',
      'Loss of transgene expression over time (Biology)',
      'Dose-limiting hepatotoxicity (Safety)',
      'Inability to redose due to immune memory (Delivery)'
    ],
    biologyRisk: 'Moderate - monogenic diseases well-understood',
    chemistryRisk: 'High - viral vector CMC, manufacturing capacity constrained',
    deliveryRisk: 'High - pre-existing antibodies, tissue tropism',
    safetyRisk: 'High - dose-limiting toxicities, insertional mutagenesis risk',
    translationalRisk: 'High - durability in humans vs animal models',
    goNoGoBiomarker: 'Durable transgene expression',
    commonFailureSignal: 'Early expression that wanes clinically',
    keyDrivers: ['Vector manufacturing scale', 'Immunogenicity (pre-existing antibodies)', 'Durability of expression', 'Dose-limiting toxicities'],
    biggestCapitalSinks: ['Viral vector CMC (manufacturing capacity)', 'Long-term toxicology', 'Registrational trial costs'],
    platformEffect: 'Moderate - constrained by manufacturing facilities (CMO scarcity raises cost/time)',
    speedUps: ['Novel vectors avoiding pre-existing immunity', 'Tissue-specific promoters'],
    bestFitDiseases: ['Rare monogenic', 'Pediatric genetic', 'Ophthalmology', 'Muscle disorders'],
    poorFitDiseases: ['Polygenic diseases', 'Diseases requiring regulated protein levels'],
    timeline: '8-14 years',
    capitalRange: '$400M-$1.5B+'
  },
  'cell-therapy': {
    displayName: 'Cell Therapy (CAR-T)',
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
  },
  'sirna': {
    displayName: 'siRNA / RNAi',
    dominantFailure: 'Delivery to target tissue',
    failureModes: [
      'Delivery failure to target tissue (Delivery)',
      'Innate immune activation (Safety)',
      'Incomplete knockdown (Biology)',
      'Durability mismatch with disease (Biology)'
    ],
    biologyRisk: 'Moderate - sequence-specific knockdown well-understood',
    chemistryRisk: 'Moderate - chemistry backbone variations, GalNAc conjugation',
    deliveryRisk: 'High - liver is easiest, other tissues much harder',
    safetyRisk: 'Moderate - immune activation risk manageable with chemistry',
    translationalRisk: 'Moderate - knockdown duration may differ from preclinical',
    goNoGoBiomarker: 'Target mRNA knockdown in tissue of interest',
    commonFailureSignal: 'Strong knockdown in liver but disease in different tissue',
    keyDrivers: ['Delivery optimization', 'Clinical proof-of-concept (biomarker assays)', 'Durability of knockdown'],
    biggestCapitalSinks: ['Delivery optimization', 'Clinical proof-of-concept', 'Manufacturing scale-up'],
    platformEffect: 'Strong - GalNAc or LNP platforms make many liver targets fast to advance',
    speedUps: ['Liver targets', 'Platform chemistry', 'Biomarker endpoints'],
    bestFitDiseases: ['Liver diseases', 'Rare genetic (liver-expressed)', 'Cardiovascular (liver targets)'],
    poorFitDiseases: ['CNS without special delivery', 'Diseases requiring CNS or muscle delivery'],
    timeline: '6-10 years',
    capitalRange: '$150M-$600M'
  },
  'gene-editing': {
    displayName: 'Gene Editing (CRISPR)',
    dominantFailure: 'Off-target edits & regulatory uncertainty',
    failureModes: [
      'Off-target genomic edits (Safety)',
      'Mosaicism - incomplete editing (Biology)',
      'Unintended on-target effects (Biology)',
      'Ethical and regulatory barriers (Translational)'
    ],
    biologyRisk: 'High - permanent change, unintended consequences possible',
    chemistryRisk: 'High - specialized analytics, ex vivo vs in vivo manufacturing',
    deliveryRisk: 'High - delivery (ex vivo vs in vivo), tissue-specific access',
    safetyRisk: 'Very High - permanent genomic alteration requires extensive monitoring',
    translationalRisk: 'Very High - regulatory scrutiny, long-term safety follow-up',
    goNoGoBiomarker: 'On-target editing efficiency with acceptable off-target profile',
    commonFailureSignal: 'High editing efficiency but concerning off-target signature',
    keyDrivers: ['Off-target/edit specificity', 'Delivery (ex vivo vs in vivo)', 'Permanent change → heavy long-term safety monitoring'],
    biggestCapitalSinks: ['Bespoke safety/long-term follow-up', 'Specialized analytics', 'Regulatory studies', 'Manufacturing for ex vivo cell editing'],
    platformEffect: 'Strong for ex vivo workflows - in vivo editing remains high-risk/high-cost until delivery platforms mature',
    speedUps: ['Ex vivo approaches', 'Well-characterized guide RNAs', 'Platform delivery systems'],
    bestFitDiseases: ['Severe monogenic diseases', 'Diseases with clear single-gene cause', 'Sickle cell/thalassemia (ex vivo)'],
    poorFitDiseases: ['Polygenic diseases', 'Non-life-threatening conditions'],
    timeline: '8-14+ years',
    capitalRange: '$500M-$2B+'
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
  }
];

// Strategic decisions by phase
const QUESTIONS = {
  basic_research: [
    {
      id: 'target_selection',
      title: 'Target Selection Strategy',
      scenario: 'Your research team has identified two potential drug targets. Target A is a well-characterized kinase with published genetic validation but active competitors. Target B is a novel protein with strong GWAS association data but limited understanding of its biology.',
      options: [
        {
          text: 'Pursue the validated kinase (Target A)',
          detail: 'Known biology, competitive landscape',
          cashEffect: -1,
          timeEffect: 0,
          riskBonus: 0.05,
          efficacyEffect: -15, // Validated target = lower efficacy risk
          result: 'The established biology accelerates your program. However, you learn that three other companies are pursuing the same target.',
          lesson: 'Validated targets reduce biological risk - you know the target is relevant to disease. But validation attracts competition, requiring differentiation on efficacy, safety, or convenience.'
        },
        {
          text: 'Pursue the novel protein (Target B)',
          detail: 'First-mover potential, biological uncertainty',
          cashEffect: -2,
          timeEffect: 6,
          riskBonus: -0.08,
          marketBonus: 1.5,
          efficacyEffect: 20, // Novel target = higher efficacy risk (biology may be wrong)
          result: 'You must build understanding of the target from scratch. Initial validation takes longer than expected, but you establish a proprietary position.',
          lesson: 'Novel targets offer breakthrough potential but carry substantial risk that the underlying biology is wrong - the most common cause of drug failure.'
        },
        {
          text: 'Validate both targets in parallel',
          detail: 'Diversified risk, divided resources',
          cashEffect: -3,
          timeEffect: 3,
          riskBonus: 0,
          efficacyEffect: 5, // Divided focus = slightly higher risk
          result: 'Neither program receives optimal focus. You generate data on both targets but lack the resources to deeply validate either.',
          lesson: 'Early diversification sounds prudent but often leads to underfunding critical experiments. Focus typically outperforms hedging in resource-constrained discovery.'
        }
      ]
    }
  ],
  drug_discovery: [
    {
      id: 'screening_strategy',
      title: 'Screening Approach',
      scenario: 'You need to find compounds that modulate your validated target. You can run a traditional high-throughput screen (HTS) of your compound library, use computational methods to design molecules in silico, or pursue a fragment-based approach.',
      options: [
        {
          text: 'High-throughput screening (HTS)',
          detail: 'Proven approach, large compound library required',
          cashEffect: -5,
          timeEffect: 0,
          riskBonus: 0.03,
          result: 'HTS identifies several hit series with confirmed activity. The diversity of chemotypes gives you options for lead optimization.',
          lesson: 'HTS remains the workhorse of hit discovery - testing real compounds provides reliable data. The quality of your compound library determines the quality of your hits.'
        },
        {
          text: 'In silico design and modeling',
          detail: 'Faster, cheaper, but requires structural data',
          cashEffect: -2,
          timeEffect: -3,
          riskBonus: -0.04,
          result: 'Computational methods predict several promising scaffolds. When synthesized and tested, some show activity but many do not match predictions.',
          lesson: 'In silico methods can accelerate discovery when structural data is available, but predictions must be validated experimentally. Models are approximations of reality.'
        },
        {
          text: 'Fragment-based drug discovery',
          detail: 'Small fragments, requires biophysical methods',
          cashEffect: -3,
          timeEffect: 6,
          riskBonus: 0.05,
          result: 'Fragment screening identifies small, weak binders that provide excellent starting points for rational design.',
          lesson: 'Fragment-based approaches often yield higher-quality leads with better properties, but require significant chemistry effort to build fragments into drug-like molecules.'
        }
      ]
    }
  ],
  lead_optimization: [
    {
      id: 'adme_strategy',
      title: 'ADME Optimization Priority',
      scenario: 'Your lead compound shows excellent target potency but concerning metabolic instability. Chemistry can prioritize improving metabolic stability (risking potency loss) or maintaining potency while accepting higher doses.',
      options: [
        {
          text: 'Prioritize metabolic stability',
          detail: 'Better PK, potential potency trade-off',
          cashEffect: -5,
          timeEffect: 6,
          riskBonus: 0.06,
          result: 'Chemistry improves half-life significantly through strategic modifications. Some potency is lost but can be compensated with dose adjustment.',
          lesson: 'Poor pharmacokinetics is a major cause of clinical failure. A drug that doesn\'t reach and stay at its target cannot work, regardless of how potent it is in a test tube.'
        },
        {
          text: 'Maintain potency, accept higher dosing',
          detail: 'Preserve efficacy, larger pills needed',
          cashEffect: -3,
          timeEffect: 0,
          riskBonus: -0.04,
          result: 'Your drug requires high doses, increasing API cost and pill burden. Some patients may struggle with compliance.',
          lesson: 'Drug-like properties matter beyond just efficacy. Patient compliance, manufacturing cost, and practical dosing considerations affect real-world effectiveness.'
        },
        {
          text: 'Explore prodrug approach',
          detail: 'Innovative but adds complexity',
          cashEffect: -8,
          timeEffect: 12,
          riskBonus: 0.02,
          result: 'The prodrug strategy works - your compound is converted to active drug in the body with excellent PK. But regulatory and CMC complexity increase.',
          lesson: 'Prodrug strategies can solve PK problems elegantly but add development complexity. The active metabolite becomes your real drug.'
        }
      ]
    }
  ],
  ind_enabling: [
    {
      id: 'tox_species',
      title: 'GLP Toxicology Species Selection',
      scenario: 'FDA requires toxicology in a rodent and non-rodent species. For your target, dogs are standard but expensive. Minipigs are cheaper but less common. NHP provide best human prediction but raise ethical and cost concerns.',
      options: [
        {
          text: 'Standard package: rat + dog',
          detail: 'Regulatory comfort, established protocols',
          cashEffect: -8,
          timeEffect: 0,
          riskBonus: 0.02,
          safetyEffect: -10, // Standard choice = lower safety risk
          result: 'The FDA accepts your standard tox package without questions. Dogs show a GI finding that requires monitoring in clinical trials but is manageable.',
          lesson: 'Standard species choices reduce regulatory risk. FDA is familiar with interpreting rat and dog data, which minimizes back-and-forth during IND review.'
        },
        {
          text: 'Alternative: rat + minipig',
          detail: 'Cost savings, potential regulatory questions',
          cashEffect: -5,
          timeEffect: 0,
          riskBonus: -0.03,
          safetyEffect: 10, // Alternative species = higher safety risk (less data)
          result: 'FDA asks for justification of minipig selection. After providing scientific rationale, they accept the package, but the exchange adds time.',
          lesson: 'Non-standard species choices require strong scientific justification. Cost savings must be weighed against regulatory risk and potential delays.'
        },
        {
          text: 'Enhanced package: rat + NHP',
          detail: 'Best human prediction, ethical and cost considerations',
          cashEffect: -15,
          timeEffect: 6,
          riskBonus: 0.08,
          safetyEffect: -20, // NHP = much lower safety risk (best predictor)
          result: 'NHP studies identify a cardiac signal not seen in dogs. You modify your Phase I protocol to include cardiac monitoring, avoiding a potential clinical hold.',
          lesson: 'NHP are often the most predictive non-rodent species for human safety but require ethical justification.'
        }
      ]
    }
  ],
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
  fda_review: [
    {
      id: 'pricing',
      title: 'Pricing and Access Strategy',
      scenario: 'FDA approval is imminent. Health economic analyses support value-based pricing of $150,000/year, reflecting the clinical benefit. But drug pricing scrutiny is intense.',
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
  post_market: [
    {
      phase: 'post_market',
      question: 'PBM Formulary & Access Strategy',
      context: `SITUATION
Following FDA approval, your commercial team has initiated negotiations with CVS Caremark's formulary committee. Their quarterly review is approaching. Express Scripts and OptumRx are awaiting the outcome of these discussions. Formulary placement will significantly impact patient access to your therapy.

BACKGROUND: PHARMACY BENEFIT MANAGERS
Pharmacy Benefit Managers (PBMs) serve as intermediaries between drug manufacturers, insurers, and pharmacies. The three largest PBMs—CVS Caremark, Express Scripts, and OptumRx—represent approximately 80% of the market.

Their functions include:
• Establishing formulary coverage (the list of covered medications)
• Negotiating rebates from manufacturers in exchange for preferred placement
• Managing pharmacy reimbursement rates
• Operating specialty pharmacy subsidiaries

MARKET DYNAMICS
Industry analyses indicate that PBMs may collect different prices from different plan sponsors for identical medications. Patient cost-sharing is frequently calculated from list price rather than the net price negotiated by insurers.`,
      options: [
        {
          text: 'Pay heavy rebates for preferred formulary placement',
          detail: 'High access but 40-60% of revenue goes to rebates',
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
          lesson: 'Copay assistance programs help patients afford their out-of-pocket costs, but don\'t fix the underlying problem. Patients still pay twice—once through premiums, again at the pharmacy counter.'
        },
        {
          text: 'Specialty pharmacy exclusive distribution',
          detail: 'PBM-owned specialty pharmacy controls distribution',
          cashEffect: 0,
          marketBonus: 0.7,
          revenueEffect: -0.25,
          efficacyEffect: 10,
          result: 'PBM-owned specialty pharmacy takes a large cut and can steer patients. Your drug access depends on PBM\'s vertically integrated interests, not patient needs.',
          lesson: 'The Big 3 PBMs each own specialty pharmacies (CVS Specialty, Accredo, Optum Specialty). They\'re paid by manufacturers to manage costs while profiting from those same drugs—a conflict of interest that independent pharmacies and patient advocates have documented extensively.'
        }
      ]
    },
    {
      phase: 'post_market',
      question: 'Patient Out-of-Pocket Cost Crisis',
      context: `SITUATION
Your patient services team reports increasing call volume from patients experiencing prescription abandonment at the pharmacy. Medical affairs has documented cases where insured patients are declining therapy due to cost-sharing obligations that exceed their ability to pay.

COST-SHARING MECHANICS
• Patient copays may be calculated from list price rather than negotiated net price
• Specialty tier placement often involves coinsurance (percentage of cost) rather than flat copays
• Cost-sharing represents an additional financial obligation beyond premium contributions

COPAY ACCUMULATOR PROGRAMS
Some insurance benefit designs exclude manufacturer-provided copay assistance from counting toward deductible or out-of-pocket maximum requirements. When assistance programs expire, patients bear the full cost-sharing burden.

ACCESS IMPLICATIONS
Prescription abandonment at the pharmacy counter represents a gap between regulatory approval and actual patient access. Therapies that cannot be accessed by covered patients represent incomplete market access.`,
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
      phase: 'post_market',
      question: 'Real-World Evidence and Market Expansion',
      context: `SITUATION
At a major medical conference, a key opinion leader presents case studies of off-label use of your therapy in patients with related indications. She reports favorable responses. Your medical affairs team confirms that off-label prescribing is increasing. Physicians are discussing outcomes in clinical forums.

STRATEGIC CONSIDERATION
Your therapy is approved for its initial indication. However, emerging evidence suggests potential benefit in additional patient populations. Each supplemental indication requires clinical development investment and regulatory approval.`,
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
      question: 'The System Reform Question',
      context: `SITUATION
You have been invited to provide testimony before the Senate Health Committee. A member asks: "Your company invested over a decade and substantial capital developing this therapy. It is effective. However, constituents report they cannot afford it despite having insurance coverage. What policy reforms would you recommend?"

CONTEXT
The hearing includes representatives from patient advocacy organizations, pharmacy benefit managers, and insurance carriers. Your testimony will inform ongoing policy discussions regarding pharmaceutical pricing and access.

PERSPECTIVE
Your experience encompasses the full development trajectory: the high clinical failure rate, the capital requirements, and the post-approval access barriers. The pharmaceutical innovation ecosystem largely functions effectively, though specific structural issues create access gaps for covered patients.`,
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
    { title: 'Target Engagement Confirmed', description: 'Biomarker studies confirm robust target engagement at achievable doses.', cashEffect: 0, timeEffect: 0, riskBonus: 0.04, positive: true }
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
    description: 'A congressional hearing examines drug pricing. The biotech social contract: companies develop new medicines that will go generic without undue delay, while society provides insurance with low out-of-pocket costs so patients can afford what their doctors prescribe. But some argue the contract is being violated—from both sides. You are asked to testify.',
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
          'Because ~93% of drugs fail, investors needed successful drugs to compensate for failures—but the upside was capped',
          'Venture capital investment in early-stage biotechnology declined 40%',
          'Your Series B financing failed as investors reallocated to sectors where risk-adjusted returns were achievable',
          'Drug prices fell 25%, but the pipeline of innovative therapies contracted significantly'
        ],
        lesson: 'The result of capping the upside is not lower-priced innovation—it is less innovation. Capital is mobile. When returns become inadequate for the risks involved, investment doesn\'t persist heroically—it flows to sectors where risk-adjusted returns are achievable. The diseases that most need new treatments are often the hardest to develop for.',
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
        lesson: 'When some companies raise prices on old drugs or extend exclusivity through patent thickets rather than genuine innovation, they break the biotech social contract. Defending bad actors—the Landlords who seek rents rather than building new medicines—erodes the political capital that Builders need to maintain innovation incentives for everyone.',
        marketEffect: -0.3
      },
      reform: {
        title: 'Three Years Later',
        effects: [
          'Insurance reforms capped out-of-pocket costs—patients could afford prescribed medicines without paying twice',
          'Price controls were applied only to old drugs that failed to go generic on schedule, ending rent-seeking',
          'Novel medicines retained market-based pricing during their exclusivity period, preserving R&D incentives',
          'Investment in innovation remained strong as the rules became clearer and fairer'
        ],
        lesson: 'We don\'t have to choose between affordability and innovation. The biotech social contract works when both sides keep their end of the deal: (1) cap out-of-pocket costs—we already paid through premiums, no one should pay twice, (2) ensure drugs go generic on schedule—we should celebrate generics, they become part of our armory at affordable prices, (3) preserve market incentives for novel drugs during exclusivity—that\'s what funds the 93% that fail. Drugs go generic; hospitals don\'t. That\'s why inventing medicines is so valuable.',
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
  post_market: 0.95       // Most drugs remain on market
};

// Modality-Indication Compatibility Matrix
// Applies risk penalties for poor modality-indication fit
// Based on real-world delivery and biology constraints
const MODALITY_INDICATION_COMPATIBILITY = {
  // CNS diseases: which modalities can cross blood-brain barrier?
  'CNS': {
    'small-molecule': { penalty: 0, reason: 'Small molecules can cross BBB - good fit' },
    'biologic': { penalty: 25, reason: 'Large molecules cannot cross BBB - poor CNS penetration', riskType: 'efficacy' },
    'gene-therapy': { penalty: 10, reason: 'Requires intrathecal delivery - adds complexity', riskType: 'design' },
    'cell-therapy': { penalty: 30, reason: 'Cell delivery to CNS extremely challenging', riskType: 'efficacy' },
    'sirna': { penalty: 25, reason: 'siRNA delivery to CNS not validated - liver only', riskType: 'efficacy' },
    'gene-editing': { penalty: 15, reason: 'In vivo CNS editing very difficult', riskType: 'design' }
  },
  // Rare/Genetic diseases: curative modalities shine
  'Rare/Genetic': {
    'small-molecule': { penalty: 10, reason: 'May need lifelong dosing for genetic disease', riskType: 'design' },
    'biologic': { penalty: 5, reason: 'Protein replacement often effective', riskType: 'efficacy' },
    'gene-therapy': { penalty: 0, reason: 'Ideal for monogenic diseases - curative potential' },
    'cell-therapy': { penalty: 0, reason: 'Stem cell or gene-corrected cells excellent' },
    'sirna': { penalty: 0, reason: 'Knockdown can address many genetic diseases' },
    'gene-editing': { penalty: 0, reason: 'Curative editing for monogenic diseases - best fit' }
  },
  // Metabolic diseases: liver targets, chronic dosing
  'Metabolic': {
    'small-molecule': { penalty: 0, reason: 'Oral dosing, liver targets - excellent fit' },
    'biologic': { penalty: 5, reason: 'Injectable but effective for metabolic targets', riskType: 'design' },
    'gene-therapy': { penalty: 15, reason: 'Overkill for most metabolic diseases', riskType: 'design' },
    'cell-therapy': { penalty: 25, reason: 'Manufacturing complexity not justified', riskType: 'design' },
    'sirna': { penalty: 0, reason: 'GalNAc delivery to liver - ideal for metabolic' },
    'gene-editing': { penalty: 10, reason: 'Permanent change risky for non-fatal conditions', riskType: 'safety' }
  },
  // Oncology (hematologic): cell therapy and biologics excel
  'Oncology (Hematologic)': {
    'small-molecule': { penalty: 10, reason: 'May face resistance mutations', riskType: 'efficacy' },
    'biologic': { penalty: 0, reason: 'ADCs, bispecifics highly effective' },
    'gene-therapy': { penalty: 15, reason: 'Not standard approach for cancer', riskType: 'design' },
    'cell-therapy': { penalty: 0, reason: 'CAR-T revolutionary for heme malignancies - best fit' },
    'sirna': { penalty: 20, reason: 'Limited oncology applications', riskType: 'efficacy' },
    'gene-editing': { penalty: 5, reason: 'Gene-edited cells emerging', riskType: 'design' }
  },
  // Oncology (solid): harder than heme
  'Oncology (Solid Tumor)': {
    'small-molecule': { penalty: 0, reason: 'Oral TKIs, still backbone of therapy' },
    'biologic': { penalty: 10, reason: 'Tumor penetration challenging', riskType: 'efficacy' },
    'gene-therapy': { penalty: 20, reason: 'Delivery to solid tumors very hard', riskType: 'efficacy' },
    'cell-therapy': { penalty: 15, reason: 'TME is immunosuppressive - less effective than heme', riskType: 'efficacy' },
    'sirna': { penalty: 25, reason: 'Delivery to solid tumors not validated', riskType: 'efficacy' },
    'gene-editing': { penalty: 20, reason: 'In vivo tumor editing not feasible', riskType: 'efficacy' }
  },
  // Autoimmune: biologics designed for this
  'Autoimmune': {
    'small-molecule': { penalty: 0, reason: 'JAK inhibitors, oral options' },
    'biologic': { penalty: 0, reason: 'TNF, IL-17, IL-23 - biologics dominate' },
    'gene-therapy': { penalty: 20, reason: 'Chronic management not curative approach', riskType: 'design' },
    'cell-therapy': { penalty: 10, reason: 'CAR-T for autoimmune emerging but early', riskType: 'design' },
    'sirna': { penalty: 15, reason: 'Few validated liver targets for autoimmune', riskType: 'efficacy' },
    'gene-editing': { penalty: 15, reason: 'Not standard for non-genetic chronic disease', riskType: 'design' }
  },
  // Cardiovascular: small molecules and siRNA for liver-expressed targets
  'Cardiovascular': {
    'small-molecule': { penalty: 0, reason: 'Statins, ACE inhibitors - proven track record' },
    'biologic': { penalty: 5, reason: 'PCSK9 antibodies work but injectable', riskType: 'design' },
    'gene-therapy': { penalty: 20, reason: 'Chronic disease, not curative approach', riskType: 'design' },
    'cell-therapy': { penalty: 30, reason: 'Manufacturing overkill for CV', riskType: 'design' },
    'sirna': { penalty: 0, reason: 'GalNAc-siRNA for liver CV targets - excellent' },
    'gene-editing': { penalty: 10, reason: 'Emerging for genetic dyslipidemias', riskType: 'safety' }
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
        { text: 'Accept step therapy requirements', detail: 'Patients try generics first', marketBonus: 0.5, lesson: 'Step therapy protects payer budgets but delays access to newer, potentially better drugs. Patients who fail generics have already suffered longer.' },
        { text: 'Prove differentiation with head-to-head data', detail: 'Expensive but removes barriers', cashEffect: -20, marketBonus: 0.85, lesson: 'Head-to-head trials against generics can exempt you from step therapy—but they\'re expensive and risky. If you lose, access gets even harder.' },
        { text: 'Launch copay program + advocacy', detail: 'Work around the system', cashEffect: -10, marketBonus: 0.7, lesson: 'Copay programs help commercially insured patients, but Medicare and Medicaid patients still face barriers. Advocacy can change policies but takes years.' }
      ]
    }
  },
  'biologic': {
    typicalPrice: '$5,000-15,000/month',
    coverageTier: 'Specialty Tier (Tier 4-5)',
    patientCopay: '$200-500/month with specialty coinsurance',
    accessChallenge: 'Specialty tier cost-sharing + infusion site access',
    insuranceReality: 'Large molecules require injection or infusion, adding site-of-care costs. Many plans put biologics on specialty tiers with 20-30% coinsurance instead of flat copays.',
    uniqueIssue: 'Infusion site access and biosimilar competition',
    question: {
      context: 'Your biologic requires IV infusion every 4 weeks. Patients need to find infusion centers, take time off work, and pay facility fees on top of drug costs. Total out-of-pocket can exceed $1,000/month.',
      options: [
        { text: 'Partner with infusion center networks', detail: 'Improve site access', cashEffect: -15, marketBonus: 0.8, lesson: 'Site-of-care matters. Home infusion or convenient centers improve adherence, but add complexity and cost to your distribution model.' },
        { text: 'Develop subcutaneous formulation', detail: 'Enable self-injection at home', cashEffect: -30, timeEffect: 24, marketBonus: 1.2, lesson: 'Subcutaneous formulations let patients self-inject at home, dramatically improving convenience. But reformulation takes years and isn\'t always possible.' },
        { text: 'Focus on specialty pharmacy partnerships', detail: 'Leverage existing infrastructure', marketBonus: 0.6, revenueEffect: -0.2, lesson: 'Specialty pharmacies handle complex logistics but take a large cut. They\'re often owned by PBMs, creating conflicts of interest.' }
      ]
    }
  },
  'gene-therapy': {
    typicalPrice: '$1-3.5 million one-time',
    coverageTier: 'No standard tier - individual coverage decisions',
    patientCopay: 'Often $100,000+ without assistance',
    accessChallenge: 'Unprecedented pricing, outcomes-based contracts, center capacity',
    insuranceReality: 'One-time curative therapies at $2M+ break insurance models designed for monthly payments. Payers demand outcomes guarantees and phased payments. Only specialized centers can administer.',
    uniqueIssue: 'Center of excellence capacity and outcomes contracts',
    question: {
      context: 'Your gene therapy is priced at $2.1 million for a one-time treatment. Insurers are refusing coverage, demanding proof of long-term durability. Only 15 centers nationwide can administer it. Patients are stuck waiting.',
      options: [
        { text: 'Offer outcomes-based annuity payments', detail: 'Pay over 5 years, refund if it fails', cashEffect: -5, marketBonus: 0.75, revenueEffect: -0.15, lesson: 'Outcomes-based contracts align incentives: if the therapy works, everyone benefits. But they require years of follow-up data and complex contracts.' },
        { text: 'Expand center of excellence network', detail: 'Train more sites to administer', cashEffect: -25, marketBonus: 0.9, lesson: 'Gene therapies require specialized centers for safe administration. Expanding access means training sites and ensuring quality—not just shipping drug.' },
        { text: 'Work with state Medicaid on coverage', detail: 'Public payers often cover rare disease', cashEffect: -10, marketBonus: 0.6, lesson: 'Medicaid and state programs sometimes cover rare disease therapies when commercial insurers won\'t. But reimbursement rates are lower and approval is slow.' }
      ]
    }
  },
  'cell-therapy': {
    typicalPrice: '$400,000-500,000 one-time',
    coverageTier: 'Hospital outpatient/inpatient, not pharmacy',
    patientCopay: '$50,000-100,000 potential hospital coinsurance',
    accessChallenge: 'Manufacturing slot availability, site-of-care complexity',
    insuranceReality: 'Cell therapies are administered in hospitals, not pharmacies—different coverage rules apply. Manufacturing takes 3-4 weeks; patients may progress while waiting. Only certified transplant centers can treat.',
    uniqueIssue: 'Manufacturing delays and hospital reimbursement',
    question: {
      context: 'Your CAR-T therapy requires 3-week manufacturing per patient. 20% of patients progress while waiting and become ineligible. Hospitals lose money on each treatment due to ICU stays for CRS management not covered by the drug price.',
      options: [
        { text: 'Invest in manufacturing speed', detail: 'Reduce vein-to-vein time', cashEffect: -40, marketBonus: 0.9, lesson: 'Faster manufacturing saves lives—patients with aggressive cancer can\'t wait a month. But speed requires massive investment in specialized facilities.' },
        { text: 'Partner with hospitals on CRS management costs', detail: 'Cover ICU and supportive care', cashEffect: -20, revenueEffect: -0.1, marketBonus: 0.8, lesson: 'Hospitals often lose money on cell therapy patients due to ICU stays. Covering these costs improves hospital willingness to treat, expanding access.' },
        { text: 'Focus on academic medical centers only', detail: 'Limited sites but experienced', marketBonus: 0.5, lesson: 'Academic centers have transplant expertise but limited capacity. Restricting to these sites ensures safety but limits access for patients far from major cities.' }
      ]
    }
  },
  'sirna': {
    typicalPrice: '$10,000-30,000/year (quarterly dosing)',
    coverageTier: 'Specialty Tier',
    patientCopay: '$500-1,500/quarter',
    accessChallenge: 'Specialty pharmacy and quarterly injection compliance',
    insuranceReality: 'siRNA therapies typically require quarterly subcutaneous injections. Better than biologics for compliance, but still specialty tier with high cost-sharing. Liver-targeted design limits indications.',
    uniqueIssue: 'Quarterly dosing adherence and specialty tier placement',
    question: {
      context: 'Your siRNA requires quarterly injections for a chronic condition. Patients must remember to schedule and attend appointments every 3 months. 30% of patients miss at least one dose per year, reducing efficacy.',
      options: [
        { text: 'Launch adherence support program', detail: 'Reminder calls, nurse support', cashEffect: -8, marketBonus: 0.85, lesson: 'Adherence programs improve outcomes by helping patients stay on therapy. The investment pays off through better real-world evidence and outcomes-based contracts.' },
        { text: 'Pursue annual dosing formulation', detail: 'Reduce injection frequency', cashEffect: -35, timeEffect: 36, marketBonus: 1.3, lesson: 'Less frequent dosing dramatically improves adherence. Annual injections would be transformative—but extending siRNA durability is scientifically challenging.' },
        { text: 'Partner with specialty pharmacy on patient services', detail: 'Leverage their patient programs', marketBonus: 0.7, revenueEffect: -0.15, lesson: 'Specialty pharmacies offer patient support services but take a cut of revenue. Their interests may not always align with optimal patient care.' }
      ]
    }
  },
  'gene-editing': {
    typicalPrice: '$2-3 million one-time (no precedent yet)',
    coverageTier: 'Undefined - first-in-class coverage battles',
    patientCopay: 'TBD - likely outcomes-based',
    accessChallenge: 'First-in-class coverage with no precedent, permanent change concerns',
    insuranceReality: 'Gene editing for disease is unprecedented. Insurers have no framework. Concerns about long-term safety of permanent genomic changes create coverage hesitation. Only a few specialized centers can perform.',
    uniqueIssue: 'Novel therapy with no insurance precedent',
    question: {
      context: 'Your gene editing therapy is the first of its kind approved. Insurers don\'t know how to categorize or price coverage. Some are waiting to see long-term safety data before covering. Patients are caught in limbo.',
      options: [
        { text: 'Negotiate individual coverage decisions with major payers', detail: 'One-by-one contract negotiations', cashEffect: -15, marketBonus: 0.6, lesson: 'First-in-class therapies require payer-by-payer negotiations. Each contract is unique, requiring significant market access resources.' },
        { text: 'Offer long-term outcomes guarantee', detail: '10-year durability commitment', cashEffect: 0, revenueEffect: -0.2, marketBonus: 0.8, lesson: 'Guaranteeing long-term outcomes shifts risk from payers to you. If editing reverses or safety issues emerge, you bear the cost—but it unlocks coverage.' },
        { text: 'Work with patient advocacy to pressure coverage', detail: 'Grassroots coverage campaign', cashEffect: -10, marketBonus: 0.7, lesson: 'Patient advocacy can pressure insurers to cover breakthrough therapies. Stories of patients denied access create public and political pressure for coverage.' }
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

  // Program configuration
  const [programType, setProgramType] = useState(null); // 'first-in-class', 'orphan', 'blockbuster'
  const [modality, setModality] = useState(null); // 'small-molecule', 'biologic', 'gene-therapy', 'cell-therapy'

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
    // Clear any previous indication - will be set when program type is selected
    setIndicationData(null);
    setIndication('');
    setScreen('setup_type');
  };

  const selectProgramType = (type) => {
    setProgramType(type);

    // Select indication from the appropriate pool based on program type
    const indicationPool = INDICATIONS_BY_TYPE[type] || INDICATIONS_BY_TYPE['first-in-class'];
    const selectedIndication = indicationPool[Math.floor(Math.random() * indicationPool.length)];
    setIndicationData(selectedIndication);
    setIndication(selectedIndication.name);

    // Apply modifiers based on program type
    // VC investment amounts based on RA Capital framework:
    // - First-in-class: Higher capital needs, novel biology requires longer runway
    // - Orphan: Smaller trials, faster path to approval, less capital needed
    // - Blockbuster: Large markets require large trials, significant capital
    if (type === 'first-in-class') {
      setRiskBonus(-0.08); // Higher risk, novel biology
      setMarketMultiplier(1.5); // Higher reward if successful
      setVcInvestment(100); // $100M Series A - higher risk requires more runway
    } else if (type === 'orphan') {
      setRiskBonus(0.05); // Smaller trials, regulatory support
      setMarketMultiplier(0.4); // Smaller market
      setVcInvestment(50); // $50M Series A - smaller trials, faster path
    } else if (type === 'blockbuster') {
      setRiskBonus(0); // Standard risk
      setMarketMultiplier(1.0); // Large market, competitive
      setVcInvestment(120); // $120M Series A - large trials needed
    }
    setScreen('setup_modality');
  };

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
    // Apply the financing
    setCash(c => c + altFinancing.amount);
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
      let phaseQuestions = QUESTIONS[phase.id] || [];

      // For post_market phase, inject modality-specific access question first
      if (phase.id === 'post_market' && MODALITY_ACCESS_CHALLENGES[modality]) {
        const modalityAccess = MODALITY_ACCESS_CHALLENGES[modality];
        const modalityQuestion = {
          id: `access_${modality}`,
          phase: 'post_market',
          question: `${modalityAccess.accessChallenge}: ${MODALITY_DATA[modality]?.displayName || modality}`,
          context: `${modalityAccess.insuranceReality}\n\n📊 Typical Price: ${modalityAccess.typicalPrice}\n💳 Coverage: ${modalityAccess.coverageTier}\n💰 Patient Copay: ${modalityAccess.patientCopay}\n\n${modalityAccess.question.context}`,
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
                Navigate from target discovery through FDA approval. At each phase, you will face the strategic decisions that drug developers confront every day. Your choices will determine whether your drug reaches patients-and what you learn about why this industry works the way it does.
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
                "We're investing early because we believe in your science. ~93% of programs fail, so successful drugs must be priced to compensate for all the failures. Capital is mobile—we're betting your science is sound."
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

  // Program Type Selection
  if (screen === 'setup_type') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 1 OF 2</p>
              <h1 className="text-3xl font-bold mb-2">Choose Your Program Type</h1>
              <p className="text-slate-400">This decision shapes your entire development strategy</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-slate-500 text-xs mb-1">LEAD PROGRAM</div>
                  <div className="text-lg font-semibold text-emerald-400">{indication}</div>
                </div>
                {indicationData && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                    {indicationData.area}
                  </span>
                )}
              </div>
              {indicationData && (
                <>
                  <div className="flex flex-wrap gap-2 mt-3 mb-2">
                    {indicationData.challenges.map((challenge, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {challenge}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">{indicationData.note}</p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={() => selectProgramType('first-in-class')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-emerald-400">First-in-Class</h3>
                  <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">HIGH RISK / HIGH REWARD</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Novel mechanism of action with no approved drugs targeting this pathway. You're pioneering new biology.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-red-400">-8% success rate (novel biology risk)</span>
                  <span className="text-emerald-400">+50% market potential</span>
                </div>
              </button>

              <button
                onClick={() => selectProgramType('orphan')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-purple-400">Orphan Drug</h3>
                  <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">REGULATORY ADVANTAGES</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Rare disease affecting fewer than 200,000 patients. Smaller trials, FDA incentives, 7-year market exclusivity.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">+5% success rate (smaller trials)</span>
                  <span className="text-amber-400">-60% market size (rare disease)</span>
                  <span className="text-purple-400">Exempt from IRA negotiation</span>
                </div>
              </button>

              <button
                onClick={() => selectProgramType('blockbuster')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-blue-400">Blockbuster Potential</h3>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">LARGE MARKET</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Common disease with large patient population. Best-in-class or differentiated approach in competitive market.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Standard success rates</span>
                  <span className="text-blue-400">Large market opportunity</span>
                  <span className="text-amber-400">Subject to IRA price negotiation</span>
                </div>
              </button>
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
              <p className="text-emerald-400 text-sm font-medium tracking-widest mb-3">STEP 2 OF 2</p>
              <h1 className="text-3xl font-bold mb-2">Choose Your Modality</h1>
              <p className="text-slate-400">The type of molecule determines your development path</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="text-slate-500 text-xs mb-1">PROGRAM TYPE SELECTED</div>
              <div className="text-lg font-semibold" style={{
                color: programType === 'first-in-class' ? '#34d399' :
                  programType === 'orphan' ? '#a78bfa' : '#60a5fa'
              }}>
                {programType === 'first-in-class' ? 'First-in-Class' :
                  programType === 'orphan' ? 'Orphan Drug' : 'Blockbuster Potential'}
              </div>
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
                onClick={() => selectModality('gene-therapy')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-cyan-400">Gene Therapy</h3>
                  <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">8-14 YRS • $400M-$1.5B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> AAV vectors, lentivirus. One-time curative potential for monogenic diseases.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-cyan-400 text-sm font-medium">Immunity & durability</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Durable transgene expression</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ One-time dosing</span>
                  <span className="text-amber-400">⚠ Pre-existing immunity</span>
                  <span className="text-red-400">⚠ Expression that wanes clinically</span>
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

              <button
                onClick={() => selectModality('sirna')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-teal-400">siRNA / RNAi</h3>
                  <span className="text-xs px-2 py-1 rounded bg-teal-500/20 text-teal-400">6-10 YRS • $150M-$600M</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> siRNA, ASOs, RNAi. GalNAc or LNP delivery. Strong platform effect for liver targets.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-teal-400 text-sm font-medium">Delivery to target tissue</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: Target mRNA knockdown in tissue of interest</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ Platform chemistry</span>
                  <span className="text-amber-400">⚠ Non-liver targets difficult</span>
                  <span className="text-red-400">⚠ Durability mismatch with disease</span>
                </div>
              </button>

              <button
                onClick={() => selectModality('gene-editing')}
                className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-lg p-6 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-rose-400">Gene Editing (CRISPR)</h3>
                  <span className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-400">8-14+ YRS • $500M-$2B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  <span className="text-slate-400">Covers:</span> CRISPR-Cas9, base editing, prime editing. Permanent genomic changes. Curative potential.
                </p>
                <div className="bg-slate-800/50 rounded p-3 mb-3">
                  <div className="text-xs text-slate-500 mb-1">DOMINANT FAILURE MODE</div>
                  <div className="text-rose-400 text-sm font-medium">Off-target edits & regulatory uncertainty</div>
                  <div className="text-slate-500 text-xs mt-1">Go/No-Go: On-target editing with acceptable off-target profile</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-emerald-400">✓ Curative potential</span>
                  <span className="text-amber-400">⚠ Off-target edits</span>
                  <span className="text-red-400">⚠ Permanent change requires long-term monitoring</span>
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
                  {programType === 'first-in-class' ? 'FIRST-IN-CLASS' :
                    programType === 'orphan' ? 'ORPHAN DRUG' : 'BLOCKBUSTER'} • {
                    modality === 'biologic' ? 'BIOLOGIC' :
                      modality === 'gene-therapy' ? 'GENE THERAPY' :
                        modality === 'cell-therapy' ? 'CELL THERAPY' :
                          modality === 'sirna' ? 'siRNA/RNAi' :
                            modality === 'gene-editing' ? 'GENE EDITING' : 'SMALL MOLECULE'}
                </div>
                <div className="text-lg font-semibold">{drugName}</div>
                <div className="text-slate-400 text-sm">{indication}</div>
                {platform && (
                  <div className="text-emerald-500 text-xs mt-1">
                    {platform.name} • {exitStrategy?.name || 'Exit TBD'}
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
                  {phase.id === 'phase1' ? 'Phase I' : phase.id === 'phase2' ? 'Phase II' : phase.id === 'phase3' ? 'Phase III' : phase.name.split(' ')[0]}
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
                  <p className="text-slate-300 text-sm mb-4">{currentPhase.context}</p>

                  {currentPhase.activities && (
                    <div className="mb-4 pb-4 border-b border-slate-700">
                      <div className="text-slate-500 text-xs mb-2">KEY ACTIVITIES</div>
                      <div className="flex flex-wrap gap-2">
                        {currentPhase.activities.map((activity, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                            {activity}
                          </span>
                        ))}
                      </div>
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
                        ? 'Have you found hit compounds worth optimizing?'
                        : currentPhase.id === 'lead_optimization'
                          ? 'Is your lead compound ready for formal safety testing?'
                          : 'Is your IND package ready for FDA submission?'}
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
                      <div className="text-slate-500 text-sm mb-2">Preclinical Phase</div>
                      <p className="text-slate-400 text-sm">
                        {currentPhase.id === 'basic_research'
                          ? 'Most targets fail validation. Only those with strong biological evidence should advance.'
                          : currentPhase.id === 'drug_discovery'
                            ? 'Most screening campaigns yield few viable hits. Quality matters more than quantity.'
                            : currentPhase.id === 'lead_optimization'
                              ? 'Many leads fail due to poor ADME, toxicity, or lack of efficacy in animal models.'
                              : 'IND-enabling studies must demonstrate safety sufficient for human testing.'}
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
                            ? 'You have identified hit compounds. Now the real work begins - optimizing them into a drug candidate.'
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

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">The Biotech Social Contract</h3>
              <p className="text-slate-400 text-sm mb-4">
                Your drug is now part of an implicit agreement between the pharmaceutical industry and society:
              </p>
              <div className="space-y-4 text-sm">
                {programType === 'orphan' ? (
                  // Orphan Drug - IRA EXEMPT
                  <>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Years 1-7</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Orphan Drug Exclusivity:</span> 7 years of market exclusivity prevents generic/biosimilar competition. This longer exclusivity period compensates for the smaller patient population.
                      </div>
                    </div>
                    <div className="flex gap-4 bg-emerald-900/30 p-3 rounded-lg border border-emerald-700/50">
                      <div className="w-24 text-emerald-400 flex-shrink-0 font-medium">IRA EXEMPT</div>
                      <div className="text-emerald-300">
                        <span className="font-medium">✓ Exempt from Medicare Price Negotiation:</span> Orphan drugs are specifically excluded from the IRA's Medicare negotiation provisions. Your drug maintains market-based pricing indefinitely, recognizing the higher per-patient economics of rare disease treatments.
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Perpetuity</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Genericization:</span> Eventually generic/biosimilar competition drives prices down. Your innovation becomes permanently available at low cost, serving rare disease patients forever.
                      </div>
                    </div>
                  </>
                ) : (
                  // Non-orphan drugs - subject to IRA
                  <>
                    <div className="flex gap-4">
                      <div className="w-24 text-slate-500 flex-shrink-0">Years 1-{modality === 'small-molecule' ? '9' : '13'}</div>
                      <div className="text-slate-300">
                        <span className="font-medium">Innovation Period:</span> Premium pricing reflects the investment required to develop this drug and compensates for the ~88% of clinical programs that failed along the way.
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
                        <span className="font-medium">Genericization:</span> Your innovation becomes permanently available at low cost, serving humanity for the rest of time.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Patient Access & Affordability Reality */}
            {MODALITY_ACCESS_CHALLENGES[modality] && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Market Access Reality</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Regulatory approval establishes the right to market your therapy. However, patient access depends on coverage decisions by payers, formulary placement by pharmacy benefit managers, and cost-sharing structures that determine out-of-pocket obligations.
                </p>
                <div className="bg-slate-800/50 p-4 rounded mb-4">
                  <div className="text-amber-400 font-medium text-sm mb-2">Primary Access Challenge: {MODALITY_DATA[modality]?.displayName || modality}</div>
                  <div className="text-slate-300 text-sm">{MODALITY_ACCESS_CHALLENGES[modality].accessChallenge}</div>
                </div>
                <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 mb-4">
                  <p className="text-slate-400 text-sm">
                    {MODALITY_ACCESS_CHALLENGES[modality].insuranceReality}
                  </p>
                </div>
                <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                  <p className="text-emerald-300 text-sm">
                    <strong>Policy Consideration:</strong> Patients contribute through insurance premiums. When covered therapies remain inaccessible due to cost-sharing requirements, the gap reflects insurance benefit design rather than therapeutic value. Targeted reforms to out-of-pocket structures can address this without disrupting innovation incentives.
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
                    <span className="text-red-400 font-medium">{100 - parseInt(phaseFailure.successRate)}%</span> fail at this stage—you are not alone.
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
