import React, { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// THE LONG GAME - Drug Development Simulation
// Language and concepts inspired by the Biotech Social Contract framework
// ═══════════════════════════════════════════════════════════════════════════════

// Modality-specific data: failure modes, biomarkers, and disease fit
// Based on: "Modalities fail in predictable, non-random ways. 
// Choosing a modality is choosing your risk profile before you ever choose a target."
const MODALITY_DATA = {
  'small-molecule': {
    displayName: 'Small Molecule',
    dominantFailure: 'Selectivity & toxicity',
    failureModes: [
      'Insufficient target engagement in humans',
      'Off-target toxicity due to promiscuous binding',
      'Metabolic liabilities (CYP induction/inhibition)',
      'Narrow therapeutic window',
      'Resistance mutations (oncology)'
    ],
    goNoGoBiomarker: 'Target occupancy + pathway PD',
    commonFailureSignal: 'Clean PK but no PD shift → target not causal',
    translationalMustHave: 'Clear exposure-response relationship',
    bestFitDiseases: ['CNS', 'Cardiovascular', 'Metabolic', 'Infectious'],
    poorFitDiseases: ['One-time curative intent', 'Extracellular protein replacement'],
    timeline: '5-10 years',
    capitalRange: '$200M-$800M'
  },
  'biologic': {
    displayName: 'Biologic (mAb)',
    dominantFailure: 'Biology redundancy',
    failureModes: [
      'Poor tissue penetration (solid tumors, CNS)',
      'Target redundancy / pathway compensation',
      'Anti-drug antibodies (ADA)',
      'Lack of efficacy despite strong target binding'
    ],
    goNoGoBiomarker: 'Sustained ligand suppression',
    commonFailureSignal: 'Complete target neutralization with no clinical benefit',
    translationalMustHave: 'Biomarker differentiation from placebo',
    bestFitDiseases: ['Autoimmune', 'Oncology (extracellular)', 'Rare diseases'],
    poorFitDiseases: ['CNS (unless barrier disrupted)', 'Intracellular targets'],
    timeline: '7-12 years',
    capitalRange: '$300M-$1B'
  },
  'gene-therapy': {
    displayName: 'Gene Therapy (AAV)',
    dominantFailure: 'Immunity & durability',
    failureModes: [
      'Pre-existing immunity to vector',
      'Loss of transgene expression over time',
      'Dose-limiting toxicity',
      'Inability to redose'
    ],
    goNoGoBiomarker: 'Durable transgene expression',
    commonFailureSignal: 'Early expression that wanes clinically',
    translationalMustHave: 'Durable expression correlated with function',
    bestFitDiseases: ['Rare monogenic', 'Pediatric genetic', 'Ophthalmology', 'Muscle disorders'],
    poorFitDiseases: ['Polygenic diseases', 'Diseases requiring regulated protein levels'],
    timeline: '8-14 years',
    capitalRange: '$400M-$1.5B+'
  },
  'cell-therapy': {
    displayName: 'Cell Therapy (CAR-T)',
    dominantFailure: 'Safety & manufacturing',
    failureModes: [
      'Cytokine release syndrome (CRS)',
      'Neurotoxicity (ICANS)',
      'Limited persistence or over-persistence',
      'Antigen escape',
      'Manufacturing failures'
    ],
    goNoGoBiomarker: 'Expansion correlates with response',
    commonFailureSignal: 'Expansion without durability or safety control',
    translationalMustHave: 'Controlled persistence linked to efficacy',
    bestFitDiseases: ['Hematologic cancers', 'Certain solid tumors (emerging)'],
    poorFitDiseases: ['Chronic non-fatal diseases', 'Widespread systemic diseases'],
    timeline: '8-15 years',
    capitalRange: '$600M-$2B+'
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
          result: 'You must build understanding of the target from scratch. Initial validation takes longer than expected, but you establish a proprietary position.',
          lesson: 'Novel targets offer breakthrough potential but carry substantial risk that the underlying biology is wrong - the most common cause of drug failure.'
        },
        {
          text: 'Validate both targets in parallel',
          detail: 'Diversified risk, divided resources',
          cashEffect: -3,
          timeEffect: 3,
          riskBonus: 0,
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
          result: 'The FDA accepts your standard tox package without questions. Dogs show a GI finding that requires monitoring in clinical trials but is manageable.',
          lesson: 'Standard species choices reduce regulatory risk. FDA is familiar with interpreting rat and dog data, which minimizes back-and-forth during IND review.'
        },
        {
          text: 'Alternative: rat + minipig',
          detail: 'Cost savings, potential regulatory questions',
          cashEffect: -5,
          timeEffect: 0,
          riskBonus: -0.03,
          result: 'FDA asks for justification of minipig selection. After providing scientific rationale, they accept the package, but the exchange adds time.',
          lesson: 'Non-standard species choices require strong scientific justification. Cost savings must be weighed against regulatory risk and potential delays.'
        },
        {
          text: 'Enhanced package: rat + NHP',
          detail: 'Best human prediction, ethical and cost considerations',
          cashEffect: -15,
          timeEffect: 6,
          riskBonus: 0.08,
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
          result: 'No serious adverse events occur. Your clean safety database builds regulatory confidence and supports aggressive dosing in Phase II.',
          lesson: 'Patient safety is paramount in first-in-human studies. A single serious adverse event can trigger clinical hold, destroying timelines and investor confidence.'
        },
        {
          text: 'Accelerated escalation with sentinel dosing',
          detail: 'Faster dose-finding, requires careful monitoring',
          cashEffect: -3,
          timeEffect: 0,
          riskBonus: -0.06,
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
          result: 'You see a positive trend (p=0.08) but the confidence interval crosses zero. Is this a real effect or noise? Your Phase III decision is difficult.',
          lesson: 'Underpowered trials save money but create uncertainty. You might advance a drug that doesn\'t work or kill a drug that does.'
        },
        {
          text: 'Adequately powered study (n=200)',
          detail: 'Standard approach, balanced investment',
          cashEffect: -35,
          timeEffect: 6,
          riskBonus: 0,
          result: 'Your trial demonstrates statistically significant efficacy (p=0.01). The effect size is clear enough to design efficient Phase III studies.',
          lesson: 'Adequate powering provides reliable go/no-go decisions and data to design efficient Phase III trials.'
        },
        {
          text: 'Large registrational-quality study (n=400)',
          detail: 'Higher investment, substantial de-risking',
          cashEffect: -60,
          timeEffect: 12,
          riskBonus: 0.12,
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
          result: 'Enrollment issues at several sites compromise data quality. With no backup trial, your entire program depends on salvaging the analysis.',
          lesson: 'Single pivotal trials concentrate risk catastrophically. Site issues or bad luck in patient selection can sink years of work with no recovery.'
        },
        {
          text: 'Two replicate trials (n=750 each)',
          detail: 'FDA preferred, regulatory gold standard',
          cashEffect: -160,
          timeEffect: 6,
          riskBonus: 0.08,
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
  post_market: []
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

// Drug name generator - modality aware
const generateDrugName = (modality) => {
  if (modality === 'biologic') {
    // Antibody naming: prefix + target stem + source stem + mab
    const prefixes = ['Ada', 'Beva', 'Deno', 'Efa', 'Goli', 'Inflix', 'Nivo', 'Pembro', 'Ritu', 'Tras'];
    const suffixes = ['mab', 'zumab', 'ximab', 'mumab', 'tumab'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
  } else if (modality === 'gene-therapy') {
    // Gene therapy naming: prefix + gene + vec (vector indicator)
    const prefixes = ['Zol', 'Lux', 'Ona', 'Eti', 'Val', 'Beri', 'Eli', 'Rox'];
    const genes = ['gene', 'para', 'toga', 'sema', 'repta'];
    const suffixes = ['vec', 'parvovec', 'reparvovec', 'adgene'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] +
      genes[Math.floor(Math.random() * genes.length)] +
      suffixes[Math.floor(Math.random() * suffixes.length)];
  } else if (modality === 'cell-therapy') {
    // Cell therapy naming: prefix + cel/leucel (cell indicator)
    const prefixes = ['Ida', 'Axi', 'Brex', 'Lisa', 'Cil', 'Tisa', 'Liso'];
    const suffixes = ['cabtagene', 'cel', 'leucel', 'ucel', 'cleucel'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
  } else {
    // Small molecule naming
    const prefixes = ['Ator', 'Celo', 'Dasa', 'Erlo', 'Flu', 'Gef', 'Ima', 'Lapa', 'Osi', 'Rux'];
    const suffixes = ['tinib', 'ciclib', 'rafenib', 'zomib', 'parib', 'stat', 'pril', 'sartan', 'vir'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
  }
};

// Indications with therapeutic area and key challenges
const INDICATIONS = [
  {
    name: 'Alzheimer\'s Disease',
    area: 'CNS',
    challenges: ['CNS penetration', 'Blood-brain barrier', 'Long trials (18-24 months)', 'Biomarker validation'],
    note: 'Blood-brain barrier penetration is critical. Most CNS drugs fail due to inadequate brain exposure.'
  },
  {
    name: 'Metastatic Pancreatic Cancer',
    area: 'Oncology',
    challenges: ['Tumor heterogeneity', 'Rapid progression', 'Limited treatment window'],
    note: 'One of the hardest cancers to treat. Patients often progress before response can be measured.'
  },
  {
    name: 'Amyotrophic Lateral Sclerosis',
    area: 'CNS',
    challenges: ['CNS penetration', 'No validated biomarkers', 'Irreversible neurodegeneration'],
    note: 'Requires CNS penetration and early intervention. The biology of motor neuron death remains poorly understood.'
  },
  {
    name: 'Cystic Fibrosis',
    area: 'Rare/Genetic',
    challenges: ['Mutation-specific response', 'Chronic dosing', 'Lung function endpoints'],
    note: 'Success depends on targeting specific CFTR mutations. Vertex has transformed this space.'
  },
  {
    name: 'Duchenne Muscular Dystrophy',
    area: 'Rare/Genetic',
    challenges: ['Muscle delivery', 'Dystrophin expression', 'Functional endpoints'],
    note: 'Delivering therapy to muscle tissue is challenging. Exon-skipping and gene therapy approaches compete.'
  },
  {
    name: 'Huntington\'s Disease',
    area: 'CNS',
    challenges: ['CNS penetration', 'Huntingtin lowering', 'Slow progression'],
    note: 'Blood-brain barrier penetration essential. Must lower mutant huntingtin without affecting normal allele.'
  },
  {
    name: 'Recurrent Glioblastoma',
    area: 'CNS/Oncology',
    challenges: ['Blood-brain barrier', 'Tumor microenvironment', 'Immunosuppression'],
    note: 'The blood-brain barrier limits drug access. Median survival remains under 18 months despite decades of research.'
  },
  {
    name: 'Heart Failure (HFpEF)',
    area: 'Cardiovascular',
    challenges: ['Heterogeneous syndrome', 'Hard to enroll', 'Large trials needed'],
    note: 'A syndrome with multiple underlying causes. Trials require thousands of patients and years of follow-up.'
  },
  {
    name: 'Systemic Lupus Erythematosus',
    area: 'Autoimmune',
    challenges: ['Flare unpredictability', 'Heterogeneous disease', 'Steroid-sparing endpoints'],
    note: 'Lupus flares are unpredictable. The disease affects multiple organ systems differently in each patient.'
  },
  {
    name: 'Progressive Supranuclear Palsy',
    area: 'CNS',
    challenges: ['CNS penetration', 'Tau pathology', 'Rare patient population'],
    note: 'A tauopathy requiring CNS penetration. Small patient population makes enrollment challenging.'
  }
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

  const currentPhase = PHASES[currentPhaseIndex];

  const startGame = () => {
    // Generate indication upfront - select full indication object with challenges
    const selectedIndication = INDICATIONS[Math.floor(Math.random() * INDICATIONS.length)];
    setIndicationData(selectedIndication);
    setIndication(selectedIndication.name);
    setScreen('setup_type');
  };

  const selectProgramType = (type) => {
    setProgramType(type);
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
    setDrugName(generateDrugName(mod));

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

  const advanceStep = () => {
    if (cash <= 0) {
      setScreen('failure');
      return;
    }

    // Check if financing is needed before advancing
    if (checkFinancingNeeded() && !showFinancingScreen && currentRoundIndex < FINANCING_ROUNDS.length - 1) {
      setShowFinancingScreen(true);
      return;
    }

    const phase = PHASES[currentPhaseIndex];

    if (phaseStep === 0) {
      // Phase intro -> Question (if available) or Event
      const phaseQuestions = QUESTIONS[phase.id] || [];
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
      // Gate passed -> Next phase or Victory
      if (currentPhaseIndex >= PHASES.length - 1) {
        setScreen('victory');
      } else {
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

    setUsedQuestions([...usedQuestions, currentQuestion.id]);
    setQuestionResult(option);
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

    // Game always advances - this is educational, not punitive
    // But we show what the real-world probability would have been
    setGateResult({ success: true, probability: realWorldProbability, realWorldRate: phase.realSuccessRate });
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
                  Chemically synthesized compound. Oral dosing possible. Subject to IRA negotiation after 9 years.
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
                  <h3 className="text-xl font-semibold text-rose-400">Biologic (mAb)</h3>
                  <span className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-400">7-12 YRS • $300M-$1B</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Large molecule (antibody) produced in living cells. High specificity. 13 years before IRA negotiation.
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
                  <h3 className="text-xl font-semibold text-cyan-400">Gene Therapy (AAV)</h3>
                  <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">8-14 YRS • $400M-$1.5B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Viral vector delivering functional gene copy. One-time curative potential. Often orphan-eligible.
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
                  <h3 className="text-xl font-semibold text-pink-400">Cell Therapy (CAR-T)</h3>
                  <span className="text-xs px-2 py-1 rounded bg-pink-500/20 text-pink-400">8-15 YRS • $600M-$2B+</span>
                </div>
                <p className="text-slate-300 mb-3">
                  Living cells engineered to fight disease. Per-patient manufacturing. Revolutionary efficacy in hematologic cancers.
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
                  {programType === 'first-in-class' ? 'FIRST-IN-CLASS' :
                    programType === 'orphan' ? 'ORPHAN DRUG' : 'BLOCKBUSTER'} • {
                    modality === 'biologic' ? 'BIOLOGIC' :
                      modality === 'gene-therapy' ? 'GENE THERAPY' :
                        modality === 'cell-therapy' ? 'CELL THERAPY' : 'SMALL MOLECULE'}
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
                  {phase.name.split(' ')[0]}
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
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">You Beat the Odds</h3>
              <p className="text-slate-300 mb-4">
                Only approximately 12% of drugs that enter Phase I clinical trials achieve FDA approval. You navigated the full development pathway:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Phase I: ~70% of programs advance (safety and pharmacology)</li>
                <li>Phase II: ~33% of programs advance (the "Valley of Death" - proof of efficacy)</li>
                <li>Phase III: ~25-30% of programs advance (confirmatory evidence at scale)</li>
                <li>FDA Review: ~90% of complete NDAs receive approval</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">The Biotech Social Contract</h3>
              <p className="text-slate-400 text-sm mb-4">
                Your drug is now part of an implicit agreement between the pharmaceutical industry and society:
              </p>
              <div className="space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="w-24 text-slate-500 flex-shrink-0">Years 1-12</div>
                  <div className="text-slate-300">
                    <span className="font-medium">Innovation Period:</span> Premium pricing reflects the investment required to develop this drug and compensates for the ~88% of clinical programs that failed along the way. These are mortgage payments toward an asset of permanent value.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-24 text-slate-500 flex-shrink-0">Year 12+</div>
                  <div className="text-slate-300">
                    <span className="font-medium">Patent Expiry:</span> Generic manufacturers enter. Competition drives prices down 80-90%. The mortgage is paid off.
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-24 text-slate-500 flex-shrink-0">Perpetuity</div>
                  <div className="text-slate-300">
                    <span className="font-medium">Generic Drug Mountain:</span> Your innovation becomes permanently available at low cost, serving humanity for the rest of time. Once a drug is invented, mankind will never have a lesser standard of care.
                  </div>
                </div>
              </div>
            </div>

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
    const failReason = cash <= 0 ? 'depleted capital' : `did not meet endpoints in ${failedPhase?.name}`;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 rounded text-xs font-medium mb-4 bg-red-500/20 text-red-400">
                PROGRAM TERMINATED
              </div>
              <h1 className="text-4xl font-bold mb-2">{drugName} Development Discontinued</h1>
              <p className="text-slate-400 text-lg">Your program {failReason}</p>
              <p className="text-slate-500 text-sm mt-2">
                {programType === 'first-in-class' ? 'First-in-Class' : programType === 'orphan' ? 'Orphan Drug' : 'Blockbuster'} • {modality === 'biologic' ? 'Biologic' : 'Small Molecule'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{years}y {monthsRemainder}m</div>
                <div className="text-slate-500 text-sm">Time elapsed</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">${capitalInvested}M</div>
                <div className="text-slate-500 text-sm">Capital lost</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: failedPhase?.color }}>{failedPhase?.name?.split(' ')[0]}</div>
                <div className="text-slate-500 text-sm">Failed at</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">This Outcome Is Typical, Not Exceptional</h3>
              <p className="text-slate-300 mb-4">
                Only about 12% of drugs that enter clinical trials achieve FDA approval. You experienced the outcome that most drug development programs experience.
              </p>
              {failedPhase && failedPhase.realSuccessRate && (
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                  <div className="text-slate-500 text-sm mb-1">{failedPhase.name} FDA Success Rate</div>
                  <div className="text-2xl font-bold" style={{ color: failedPhase.color }}>{failedPhase.realSuccessRate}%</div>
                  <p className="text-slate-500 text-sm mt-2">{failedPhase.context?.split('.')[0]}.</p>
                </div>
              )}
              <p className="text-slate-400 text-sm">
                This is not a failure of effort, intelligence, or commitment. It is the fundamental nature of drug development: most hypotheses about how to treat disease turn out to be wrong. The biology that worked in models does not translate to human disease.
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-8">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Why This Matters for Drug Economics</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  You invested ${capitalInvested}M in this program before it failed. Your investors have lost that capital. This is the reality that underlies pharmaceutical economics.
                </p>
                <p>
                  The drugs that succeed must generate returns sufficient to compensate for the drugs that fail. Because only ~7% of clinical programs reach approval, successful drugs must generate substantial returns to make the overall enterprise economically viable.
                </p>
                <p className="font-medium text-slate-200">
                  Without the expectation of adequate returns on successful drugs, capital will not flow to drug development, and future patients will not have access to the innovations they need.
                </p>
              </div>
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
