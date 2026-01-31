/**
 * PATH EVENTS - Complete Event System
 * 
 * Phase-specific events for all 6 paths based on real drug development stories.
 * Events include setbacks (cost time/money) and positive events (save time/boost confidence).
 */

import { PathEvent } from '@/types/Game.types';

// ============================================
// TIER 1A: ORPHAN SMALL MOLECULE EVENTS
// Rare Neurological Disease
// ============================================

export const ORPHAN_SM_EVENTS: PathEvent[] = [
    // DISCOVERY PHASE
    {
        id: 'osm-formulation-challenge',
        pathId: 'orphan-small-molecule',
        phase: 'discovery',
        type: 'decision',
        title: 'Formulation Challenge',
        description: 'Your liquid formulation is unstable - the compound degrades within weeks. For pediatric dosing, you need a liquid that parents can give at home. The chemistry team proposes two approaches.',
        choices: [
            { id: 'new-formulation', text: 'Invest in new formulation chemistry', cost: 4, timeImpact: 0.5, outcome: 'New approach stabilizes the liquid. Pediatric dosing solved.', confidence: 5 },
            { id: 'switch-capsule', text: 'Switch to capsule form only', cost: 1, timeImpact: 0.25, outcome: 'Capsules work for older patients. Still need liquid for infants.', confidence: -5 },
        ],
        reference: {
            source: 'FDA Guidance: Oral Formulations for Pediatric Patients (2022)',
            url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
            learnMore: 'Pediatric formulation is a major challenge - many rare diseases affect children, requiring palatable liquids or small tablets.',
        },
    },
    {
        id: 'osm-biomarker-success',
        pathId: 'orphan-small-molecule',
        phase: 'discovery',
        type: 'news',
        title: 'Biomarker Success',
        description: 'Blood protein levels correlate perfectly with motor function! This means you can measure drug activity with a simple blood test rather than waiting for clinical improvement.',
        choices: [
            { id: 'accelerate', text: 'Use biomarker to accelerate trials', cost: 0, timeImpact: -0.33, outcome: 'FDA agrees biomarker can support accelerated approval pathway.', confidence: 15 },
        ],
        reference: {
            source: 'FDA Biomarker Qualification Program',
            url: 'https://www.fda.gov/drugs/biomarker-qualification-program',
            learnMore: 'Validated biomarkers can reduce clinical trial duration by 30-50% by providing earlier endpoints than clinical outcomes.',
        },
    },
    // PRECLINICAL PHASE
    {
        id: 'osm-animal-tox',
        pathId: 'orphan-small-molecule',
        phase: 'preclinical',
        type: 'decision',
        title: 'Animal Toxicity Signal',
        description: 'Retinal findings in monkeys after 6 months of dosing. The findings are subtle, but could signal safety concerns. You need to decide how to proceed.',
        choices: [
            { id: 'additional-studies', text: 'Conduct additional ophthalmology studies', cost: 6, timeImpact: 0.66, outcome: 'Studies show findings are reversible and species-specific. IND proceeds.', confidence: 5 },
            { id: 'proceed-monitoring', text: 'Proceed with enhanced monitoring plan', cost: 2, timeImpact: 0.25, outcome: 'FDA accepts approach but requires ocular monitoring in trials.', confidence: -5 },
        ],
    },
    {
        id: 'osm-foundation-support',
        pathId: 'orphan-small-molecule',
        phase: 'preclinical',
        type: 'news',
        title: 'Patient Foundation Support',
        description: 'The disease foundation has been watching your progress. They are impressed and want to help.',
        choices: [
            { id: 'accept-grant', text: 'Accept $15M research grant', cost: -15, timeImpact: 0, outcome: 'Non-dilutive funding! Foundation also helps with patient recruitment.', confidence: 10 },
        ],
    },
    // PHASE I
    {
        id: 'osm-manufacturing-scale',
        pathId: 'orphan-small-molecule',
        phase: 'phase1',
        type: 'decision',
        title: 'Manufacturing Scale-up',
        description: 'Yield drops significantly at commercial scale - the synthesis that worked in the lab does not work in large reactors. Process development is needed.',
        choices: [
            { id: 'process-optimization', text: 'Full process optimization', cost: 3, timeImpact: 0.42, outcome: 'New synthesis route increases yield 3x. Manufacturing problem solved.', confidence: 5 },
            { id: 'outsource', text: 'Outsource to specialty CMO', cost: 5, timeImpact: 0.25, outcome: 'Higher cost per unit, but faster. Margins will be lower.', confidence: 0 },
        ],
    },
    {
        id: 'osm-breakthrough',
        pathId: 'orphan-small-molecule',
        phase: 'phase1',
        type: 'news',
        title: 'Breakthrough Therapy Designation',
        description: 'Based on your early Phase I data, FDA grants Breakthrough Therapy designation! This means intensive guidance and potentially faster review.',
        choices: [
            { id: 'accept', text: 'Accept designation and intensive FDA engagement', cost: 0, timeImpact: -0.33, outcome: 'Regular FDA meetings accelerate development. Clear path forward.', confidence: 20 },
        ],
    },
    // PHASE II
    {
        id: 'osm-slow-enrollment',
        pathId: 'orphan-small-molecule',
        phase: 'phase2',
        type: 'decision',
        title: 'Enrollment Challenge',
        description: 'Families are choosing the existing biologic over your experimental oral treatment. Enrollment is 40% behind schedule. You need more trial sites internationally.',
        choices: [
            { id: 'add-sites', text: 'Add international sites', cost: 5, timeImpact: 0.58, outcome: 'European and Asian sites accelerate enrollment. Trial back on track.', confidence: 0 },
            { id: 'patient-support', text: 'Enhanced patient support program', cost: 3, timeImpact: 0.42, outcome: 'Travel support and family services help. Enrollment improves.', confidence: 5 },
        ],
    },
    {
        id: 'osm-competitor',
        pathId: 'orphan-small-molecule',
        phase: 'phase2',
        type: 'news',
        title: 'Competitor Announcement',
        description: 'A larger company announces a similar oral program for your disease. They are well-funded and have more resources. Investor confidence shaken.',
        choices: [
            { id: 'differentiate', text: 'Emphasize your clinical lead and data', cost: 2, timeImpact: 0, outcome: 'Investment community recognizes your 2-year head start.', confidence: -10 },
        ],
    },
    // PHASE III
    {
        id: 'osm-positive-competitor-data',
        pathId: 'orphan-small-molecule',
        phase: 'phase3',
        type: 'news',
        title: 'Competitor Validates Target',
        description: 'The existing biologic competitor just published 5-year follow-up data showing sustained benefit. This validates that your mechanism works long-term.',
        choices: [
            { id: 'leverage', text: 'Use data to support your regulatory discussions', cost: 0, timeImpact: 0, outcome: 'FDA accepts long-term target validation. Your approval path clearer.', confidence: 10 },
        ],
    },
    // APPROVAL
    {
        id: 'osm-fda-meeting',
        pathId: 'orphan-small-molecule',
        phase: 'approval',
        type: 'news',
        title: 'Positive FDA Meeting',
        description: 'Pre-NDA meeting goes exceptionally well. FDA agrees to a single pivotal trial with historical control arm - no need for placebo!',
        choices: [
            { id: 'proceed', text: 'File NDA with Priority Review request', cost: 0, timeImpact: -0.25, outcome: 'Priority Review granted. 6-month review clock starts.', confidence: 15 },
        ],
    },
];

// ============================================
// TIER 1B: ORPHAN BIOLOGIC EVENTS
// Spinal Muscular Atrophy (SMA)
// ============================================

export const ORPHAN_BIO_EVENTS: PathEvent[] = [
    // DISCOVERY
    {
        id: 'obi-delivery-challenge',
        pathId: 'orphan-biologic',
        phase: 'discovery',
        type: 'decision',
        title: 'Drug Delivery Challenge',
        description: 'Your oligonucleotide does not reach motor neurons when injected systemically. The blood-brain barrier blocks it. You need a different delivery approach.',
        choices: [
            { id: 'intrathecal', text: 'Develop intrathecal (spinal) delivery', cost: 5, timeImpact: 0.66, outcome: 'Spinal injection bypasses barrier. Drug reaches motor neurons.', confidence: 10 },
            { id: 'modify', text: 'Modify chemistry for better penetration', cost: 8, timeImpact: 1.0, outcome: 'New chemistry shows promise but needs more optimization.', confidence: 0 },
        ],
    },
    {
        id: 'obi-foundation-advocacy',
        pathId: 'orphan-biologic',
        phase: 'discovery',
        type: 'news',
        title: 'Foundation Mobilizes Families',
        description: 'The patient foundation has spent 30 years building a community. They are ready to help with your clinical trials.',
        choices: [
            { id: 'partner', text: 'Partner closely with foundation', cost: 0, timeImpact: -0.25, outcome: 'Foundation helps identify patients. Natural history data available.', confidence: 15 },
        ],
    },
    // PRECLINICAL
    {
        id: 'obi-manufacturing-complexity',
        pathId: 'orphan-biologic',
        phase: 'preclinical',
        type: 'decision',
        title: 'Manufacturing Complexity',
        description: 'Oligonucleotide synthesis at scale is harder than expected. Purity specifications are difficult to meet consistently.',
        choices: [
            { id: 'invest', text: 'Invest in new manufacturing process', cost: 4, timeImpact: 0.5, outcome: 'Process optimized. Consistent high purity achieved.', confidence: 5 },
            { id: 'partner', text: 'Partner with specialty manufacturer', cost: 2, timeImpact: 0.33, outcome: 'CMO expertise accelerates manufacturing. Royalty commitment made.', confidence: 0 },
        ],
    },
    // PHASE I
    {
        id: 'obi-injection-protocol',
        pathId: 'orphan-biologic',
        phase: 'phase1',
        type: 'decision',
        title: 'Infant Injection Protocol',
        description: 'Developing a safe spinal injection protocol for infants is proving difficult. Parents are understandably nervous.',
        choices: [
            { id: 'specialist', text: 'Train specialized pediatric centers', cost: 2, timeImpact: 0.33, outcome: 'Expert centers develop safe, standardized protocols.', confidence: 5 },
            { id: 'sedation', text: 'Develop sedation protocol', cost: 1, timeImpact: 0.25, outcome: 'Sedation makes procedure easier but adds safety monitoring.', confidence: 0 },
        ],
    },
    {
        id: 'obi-expanded-access',
        pathId: 'orphan-biologic',
        phase: 'phase1',
        type: 'news',
        title: 'Expanded Access Success',
        description: 'A desperately ill infant received your drug through compassionate use. The results exceeded expectations - dramatic improvement within weeks.',
        choices: [
            { id: 'publicize', text: 'Share results with medical community', cost: 0, timeImpact: 0, outcome: 'Word spreads. Enrollment accelerates. Hope builds.', confidence: 10 },
        ],
    },
    // PHASE II
    {
        id: 'obi-natural-history',
        pathId: 'orphan-biologic',
        phase: 'phase2',
        type: 'decision',
        title: 'Natural History Data Gap',
        description: 'FDA requests more data on disease progression without treatment. They need a comparison for your single-arm trial.',
        choices: [
            { id: 'retrospective', text: 'Fund retrospective natural history study', cost: 3, timeImpact: 0.5, outcome: 'Historical data shows stark contrast with your treatment effect.', confidence: 5 },
            { id: 'registry', text: 'Partner with foundation registry', cost: 1, timeImpact: 0.25, outcome: 'Foundation data supports your regulatory case.', confidence: 5 },
        ],
    },
    {
        id: 'obi-pricing-controversy',
        pathId: 'orphan-biologic',
        phase: 'phase2',
        type: 'news',
        title: 'Pricing Questions',
        description: 'Advocacy groups are questioning the expected price point. Media attention is growing.',
        choices: [
            { id: 'patient-access', text: 'Announce robust patient access program', cost: 5, timeImpact: 0, outcome: 'Commitment to access calms concerns. Price discussion continues.', confidence: -8 },
        ],
    },
    // PHASE III
    {
        id: 'obi-trial-stopped-early',
        pathId: 'orphan-biologic',
        phase: 'phase3',
        type: 'news',
        title: 'Trial Stopped Early for Efficacy',
        description: 'The Data Monitoring Committee has stopped your trial early! The drug clearly works - 51% of treated infants are achieving motor milestones that zero untreated infants achieve.',
        choices: [
            { id: 'celebrate', text: 'Prepare for accelerated filing', cost: 0, timeImpact: -0.5, outcome: 'Historic moment. First-ever treatment for this disease on the horizon.', confidence: 25 },
        ],
    },
    // APPROVAL
    {
        id: 'obi-priority-voucher',
        pathId: 'orphan-biologic',
        phase: 'approval',
        type: 'news',
        title: 'Priority Review Voucher',
        description: 'Your rare pediatric disease approval qualifies for a Priority Review Voucher - a transferable asset that can be sold to another company.',
        choices: [
            { id: 'sell', text: 'Sell voucher (current market: $100M)', cost: -100, timeImpact: 0, outcome: 'Non-dilutive funding! Helps build commercial infrastructure.', confidence: 5 },
            { id: 'hold', text: 'Hold voucher for future program', cost: 0, timeImpact: 0, outcome: 'Asset preserved for pipeline expansion.', confidence: 0 },
        ],
    },
];

// ============================================
// TIER 2A: BLOCKBUSTER SMALL MOLECULE EVENTS
// Cardiovascular Disease (Statin story)
// ============================================

export const BLOCKBUSTER_SM_EVENTS: PathEvent[] = [
    // DISCOVERY
    {
        id: 'bsm-program-nearly-killed',
        pathId: 'blockbuster-small-molecule',
        phase: 'discovery',
        type: 'decision',
        title: 'Board Debates Killing Program',
        description: 'Management questions the value of being 5th to market. The board is divided. Four drugs already exist - why invest hundreds of millions more?',
        choices: [
            { id: 'fight', text: 'Present case: best beats first', cost: 2, timeImpact: 0.25, outcome: 'Data showing 3-4x potency convinces board. Program continues.', confidence: -15 },
            { id: 'reduce', text: 'Reduce scope to save costs', cost: 0, timeImpact: 0.5, outcome: 'Smaller team, slower progress, but survival.', confidence: -20 },
        ],
    },
    // PRECLINICAL
    {
        id: 'bsm-competitor-merger',
        pathId: 'blockbuster-small-molecule',
        phase: 'preclinical',
        type: 'news',
        title: 'Competitor Merger',
        description: 'Two of your competitors have merged. Their combined sales force is now the largest in cardiovascular medicine.',
        choices: [
            { id: 'differentiate', text: 'Double down on clinical differentiation', cost: 5, timeImpact: 0, outcome: 'Focus on being measurably better, not just different.', confidence: -10 },
        ],
    },
    // PHASE I
    {
        id: 'bsm-head-to-head',
        pathId: 'blockbuster-small-molecule',
        phase: 'phase1',
        type: 'news',
        title: 'Head-to-Head Data',
        description: 'Your Phase I data is in. Direct comparison shows 20% better LDL lowering than the market leader at equivalent doses.',
        choices: [
            { id: 'publish', text: 'Publish and present at major conference', cost: 1, timeImpact: 0, outcome: 'Medical community takes notice. Being 5th matters less.', confidence: 15 },
        ],
    },
    // PHASE II
    {
        id: 'bsm-muscle-side-effects',
        pathId: 'blockbuster-small-molecule',
        phase: 'phase2',
        type: 'decision',
        title: 'Muscle Pain Reports',
        description: 'Reports of muscle pain (myalgia) are emerging. Statins are known for this, but your rate seems higher than competitors.',
        choices: [
            { id: 'study', text: 'Conduct additional muscle safety study', cost: 8, timeImpact: 0.5, outcome: 'Data shows rate similar to competitors at equivalent efficacy doses.', confidence: 0 },
            { id: 'monitoring', text: 'Add monitoring to label', cost: 2, timeImpact: 0.25, outcome: 'Label warning added. Some prescriber concern.', confidence: -10 },
        ],
    },
    {
        id: 'bsm-drug-interaction',
        pathId: 'blockbuster-small-molecule',
        phase: 'phase2',
        type: 'news',
        title: 'Drug Interaction Found',
        description: 'A significant interaction with a common antibiotic has been discovered. Patients taking both drugs have elevated statin levels.',
        choices: [
            { id: 'label', text: 'Add interaction warning to label', cost: 1, timeImpact: 0.33, outcome: 'Label updated. Prescribers educated. Manageable issue.', confidence: -5 },
        ],
    },
    // PHASE III
    {
        id: 'bsm-enrollment-extended',
        pathId: 'blockbuster-small-molecule',
        phase: 'phase3',
        type: 'decision',
        title: 'Outcomes Trial Extension',
        description: 'Your 10,000-patient outcomes trial needs more cardiovascular events to reach statistical power. You need to either extend the trial or add more sites.',
        choices: [
            { id: 'extend', text: 'Extend trial duration 12 months', cost: 25, timeImpact: 1.0, outcome: 'More events accumulated. Statistical power achieved.', confidence: 0 },
            { id: 'sites', text: 'Add high-risk population sites', cost: 35, timeImpact: 0.5, outcome: 'Faster event accrual. Trial completes on schedule.', confidence: 5 },
        ],
    },
    {
        id: 'bsm-outcomes-success',
        pathId: 'blockbuster-small-molecule',
        phase: 'phase3',
        type: 'news',
        title: 'Outcomes Trial Success',
        description: 'Your outcomes trial shows significant reduction in cardiovascular events - heart attacks, strokes, and cardiovascular death. This changes everything.',
        choices: [
            { id: 'announce', text: 'Major press conference and publication', cost: 2, timeImpact: 0, outcome: 'World takes notice. This is no longer just another statin.', confidence: 25 },
        ],
    },
    // APPROVAL
    {
        id: 'bsm-dtc-advertising',
        pathId: 'blockbuster-small-molecule',
        phase: 'approval',
        type: 'news',
        title: 'DTC Advertising Enabled',
        description: 'FDA has recently allowed direct-to-consumer TV advertising for prescription drugs. "Ask your doctor about..." campaigns are now possible.',
        choices: [
            { id: 'launch', text: 'Launch major DTC campaign', cost: 50, timeImpact: 0, outcome: 'Brand awareness explodes. Patients requesting by name.', marketImpact: 0.20, confidence: 10 },
            { id: 'modest', text: 'Modest physician-focused marketing', cost: 15, timeImpact: 0, outcome: 'Professional approach. Slower adoption but respected.', confidence: 5 },
        ],
    },
    {
        id: 'bsm-partnership',
        pathId: 'blockbuster-small-molecule',
        phase: 'approval',
        type: 'decision',
        title: 'Major Partnership Offer',
        description: 'A major pharma company wants to co-market your drug with their sales force. $500M upfront, but they want co-promotion rights.',
        choices: [
            { id: 'accept', text: 'Accept partnership', cost: -500, timeImpact: 0, outcome: 'Massive commercial infrastructure. Blockbuster potential.', marketImpact: 0.30, confidence: 15 },
            { id: 'decline', text: 'Build your own commercial capability', cost: 100, timeImpact: 0, outcome: 'Keep full economics. Higher risk, higher reward.', confidence: 0 },
        ],
    },
    {
        id: 'bsm-generic-competition',
        pathId: 'blockbuster-small-molecule',
        phase: 'approval',
        type: 'news',
        title: 'First Statin Goes Generic',
        description: 'The first approved statin has gone generic. Price pressure is coming to the entire class. Payers are questioning brand drug prices.',
        choices: [
            { id: 'value', text: 'Emphasize superior efficacy data', cost: 5, timeImpact: 0, outcome: 'Value story holds for now. Premium pricing maintained.', marketImpact: -0.15, confidence: -5 },
        ],
    },
];

// ============================================
// TIER 2B: BLOCKBUSTER BIOLOGIC EVENTS  
// Cancer Immunotherapy (PD-1 story)
// ============================================

export const BLOCKBUSTER_BIO_EVENTS: PathEvent[] = [
    // DISCOVERY
    {
        id: 'bbi-program-nearly-sold',
        pathId: 'blockbuster-biologic',
        phase: 'discovery',
        type: 'decision',
        title: 'New Management - Program at Risk',
        description: 'Your company was acquired. New management marked the checkpoint program "low priority" and is considering selling it.',
        choices: [
            { id: 'advocate', text: 'Internal advocacy campaign', cost: 2, timeImpact: 0.25, outcome: 'New leadership convinced. Program gets another chance.', confidence: -20 },
            { id: 'partner', text: 'Find external partner to share risk', cost: 0, timeImpact: 0.5, outcome: 'Partner brings credibility and funding.', confidence: -10 },
        ],
    },
    // PRECLINICAL
    {
        id: 'bbi-competitor-validates',
        pathId: 'blockbuster-biologic',
        phase: 'preclinical',
        type: 'news',
        title: 'Competitor Validates Concept',
        description: 'A competitor just proved checkpoint inhibition works with a different target. They are ahead of you - but they have validated the entire approach.',
        choices: [
            { id: 'accelerate', text: 'Double down and accelerate', cost: 20, timeImpact: -0.25, outcome: 'Race is on. Your target may be better than theirs.', confidence: -10 },
        ],
    },
    // PHASE I
    {
        id: 'bbi-complete-responses',
        pathId: 'blockbuster-biologic',
        phase: 'phase1',
        type: 'news',
        title: 'Complete Responses Observed',
        description: 'Remarkable: Some patients with "terminal" metastatic cancer now have no detectable disease. Complete responses in patients who were weeks from death.',
        choices: [
            { id: 'expand', text: 'Rapidly expand trials', cost: 15, timeImpact: 0, outcome: 'More tumor types tested. Responses seen across cancers.', confidence: 20 },
        ],
    },
    {
        id: 'bbi-autoimmune-toxicity',
        pathId: 'blockbuster-biologic',
        phase: 'phase1',
        type: 'decision',
        title: 'Autoimmune Toxicity',
        description: 'Releasing immune brakes is causing autoimmune side effects. Patients developing severe colitis, hepatitis, and skin reactions. About 20% affected.',
        choices: [
            { id: 'protocols', text: 'Develop toxicity management protocols', cost: 10, timeImpact: 0.5, outcome: 'Steroid protocols established. Toxicity manageable if caught early.', confidence: 0 },
            { id: 'exclusion', text: 'Exclude autoimmune-prone patients', cost: 5, timeImpact: 0.25, outcome: 'Smaller eligible population but safer profile.', confidence: -5 },
        ],
    },
    // PHASE II
    {
        id: 'bbi-manufacturing-scale',
        pathId: 'blockbuster-biologic',
        phase: 'phase2',
        type: 'decision',
        title: 'Manufacturing Scale Challenge',
        description: 'Antibody production at commercial scale is proving difficult. Cell culture yields are inconsistent.',
        choices: [
            { id: 'new-facility', text: 'Build or contract new manufacturing', cost: 15, timeImpact: 0.66, outcome: 'Large-scale production capability secured.', confidence: 5 },
            { id: 'optimize', text: 'Optimize existing process', cost: 8, timeImpact: 0.5, outcome: 'Yields improve but capacity still limited.', confidence: 0 },
        ],
    },
    {
        id: 'bbi-biomarker',
        pathId: 'blockbuster-biologic',
        phase: 'phase2',
        type: 'news',
        title: 'Biomarker Discovered',
        description: 'PD-L1 expression on tumors predicts response! Patients with high expression respond much better. Better patient selection now possible.',
        choices: [
            { id: 'companion', text: 'Develop companion diagnostic', cost: 10, timeImpact: 0.33, outcome: 'Precision medicine approach. Higher response rates.', confidence: 15 },
        ],
    },
    // PHASE III
    {
        id: 'bbi-beat-competitor',
        pathId: 'blockbuster-biologic',
        phase: 'phase3',
        type: 'news',
        title: 'Beat Competitor to Approval',
        description: 'You filed for approval 3 months before your competitor. The race is won.',
        choices: [
            { id: 'celebrate', text: 'Prepare for launch', cost: 0, timeImpact: 0, outcome: 'First-mover advantage in immune checkpoint market.', confidence: 25 },
        ],
    },
    {
        id: 'bbi-immune-death',
        pathId: 'blockbuster-biologic',
        phase: 'phase3',
        type: 'decision',
        title: 'Fatal Immune-Related Event',
        description: 'A patient has died from severe immune-related pneumonitis. The first treatment-related death in your trials.',
        choices: [
            { id: 'protocol', text: 'Amend protocol and continue', cost: 5, timeImpact: 0.25, outcome: 'Enhanced monitoring prevents future events. Trial continues.', confidence: -10 },
            { id: 'pause', text: 'Pause enrollment for safety review', cost: 3, timeImpact: 0.5, outcome: 'Thorough review. FDA satisfied with safety measures.', confidence: -5 },
        ],
    },
    // APPROVAL
    {
        id: 'bbi-lung-cancer',
        pathId: 'blockbuster-biologic',
        phase: 'approval',
        type: 'news',
        title: 'Lung Cancer Expansion',
        description: 'Your drug is approved for non-small cell lung cancer - the #1 cancer killer. Market potential explodes.',
        choices: [
            { id: 'expand', text: 'Pursue 10 more tumor types', cost: 50, timeImpact: 0, outcome: 'Platform effect: one drug, many cancers.', marketImpact: 1.0, confidence: 10 },
        ],
    },
    {
        id: 'bbi-combination',
        pathId: 'blockbuster-biologic',
        phase: 'approval',
        type: 'news',
        title: 'Combination Approval',
        description: 'Your drug combined with another checkpoint inhibitor shows even better results. Combination approved.',
        choices: [
            { id: 'launch', text: 'Launch combination regimen', cost: 10, timeImpact: 0, outcome: 'Highest response rates yet. New standard of care.', marketImpact: 0.50, confidence: 15 },
        ],
    },
];

// ============================================
// TIER 3A: FIRST-IN-CLASS SMALL MOLECULE EVENTS
// Blood Cancer / CML (Imatinib story)
// ============================================

export const FIRSTINCLASS_SM_EVENTS: PathEvent[] = [
    // DISCOVERY
    {
        id: 'fsm-funding-skepticism',
        pathId: 'firstinclass-small-molecule',
        phase: 'discovery',
        type: 'decision',
        title: 'Investor Skepticism',
        description: 'Novel target means hard to fund. Investors want proven biology. "You are targeting something nobody has ever targeted successfully."',
        choices: [
            { id: 'persist', text: 'Persist with VC fundraising', cost: 2, timeImpact: 0.5, outcome: 'Eventually find believers. Funding secured but delayed.', confidence: -15 },
            { id: 'academic', text: 'Seek academic/foundation grants', cost: 0, timeImpact: 0.25, outcome: 'Non-dilutive funding from leukemia foundation.', confidence: 0 },
        ],
    },
    // PRECLINICAL
    {
        id: 'fsm-dog-liver-tox',
        pathId: 'firstinclass-small-molecule',
        phase: 'preclinical',
        type: 'decision',
        title: 'Dog Liver Toxicity',
        description: 'SEVERE liver damage in dogs. The board is debating killing the program. This could be a species-specific effect... or it could kill patients.',
        choices: [
            { id: 'monkey', text: 'Test in monkeys (more relevant species)', cost: 8, timeImpact: 0.66, outcome: 'Monkey studies favorable! Dog toxicity appears species-specific.', confidence: -25 },
            { id: 'stop', text: 'Kill the program (too risky)', cost: 0, timeImpact: 0, outcome: 'Program terminated. Story ends.', confidence: -100 },
        ],
    },
    {
        id: 'fsm-academic-champion',
        pathId: 'firstinclass-small-molecule',
        phase: 'preclinical',
        type: 'news',
        title: 'Academic Champion',
        description: 'A renowned hematologist at a major cancer center has become fascinated by your science. They want to run investigator-initiated trials.',
        choices: [
            { id: 'collaborate', text: 'Provide drug for academic studies', cost: 2, timeImpact: 0, outcome: 'Key opinion leader becomes passionate advocate.', confidence: 15 },
        ],
    },
    // PHASE I
    {
        id: 'fsm-100-percent-response',
        pathId: 'firstinclass-small-molecule',
        phase: 'phase1',
        type: 'news',
        title: '100% Response Rate',
        description: 'ALL 31 patients in Phase I responded to treatment. 100%. This has never happened in oncology. Ever. "The room went silent. Everyone knew we had something special."',
        choices: [
            { id: 'accelerate', text: 'Accelerate development immediately', cost: 10, timeImpact: -0.5, outcome: 'Expanded trials planned. Historic data in hand.', confidence: 40 },
        ],
    },
    // PHASE II
    {
        id: 'fsm-resistance',
        pathId: 'firstinclass-small-molecule',
        phase: 'phase2',
        type: 'news',
        title: 'Resistance Mutations Emerge',
        description: 'Some patients who initially responded are developing resistance. Mutations in the target enzyme allow cancer cells to escape.',
        choices: [
            { id: 'next-gen', text: 'Start developing next-generation inhibitor', cost: 15, timeImpact: 0, outcome: 'Second-line drug development begins.', confidence: -10 },
        ],
    },
    {
        id: 'fsm-patent-dispute',
        pathId: 'firstinclass-small-molecule',
        phase: 'phase2',
        type: 'decision',
        title: 'Patent Dispute',
        description: 'University claims rights to early discoveries. They want more royalties than originally agreed.',
        choices: [
            { id: 'settle', text: 'Settle quickly', cost: 5, timeImpact: 0, outcome: 'Higher royalty but preserved timeline and relationship.', confidence: 0 },
            { id: 'fight', text: 'Litigate aggressively', cost: 3, timeImpact: 0.5, outcome: 'Court favors you but relationship damaged.', confidence: -5 },
        ],
    },
    // PHASE III
    {
        id: 'fsm-manufacturing',
        pathId: 'firstinclass-small-molecule',
        phase: 'phase3',
        type: 'decision',
        title: 'Manufacturing Scale Challenge',
        description: 'Scaling synthesis of your complex molecule is proving difficult. Commercial-scale yields are inconsistent.',
        choices: [
            { id: 'new-route', text: 'Develop new synthesis route', cost: 8, timeImpact: 0.66, outcome: 'New route found. 3x yield improvement.', confidence: 5 },
            { id: 'multiple', text: 'Qualify multiple manufacturers', cost: 10, timeImpact: 0.5, outcome: 'Supply chain diversified. Costs higher but secure.', confidence: 5 },
        ],
    },
    {
        id: 'fsm-time-cover',
        pathId: 'firstinclass-small-molecule',
        phase: 'phase3',
        type: 'news',
        title: 'TIME Magazine Cover',
        description: 'Your drug is featured on the cover of TIME: "Magic Bullet for Cancer." Public awareness explodes. This is now a story everyone knows.',
        choices: [
            { id: 'leverage', text: 'Use attention to build support', cost: 0, timeImpact: 0, outcome: 'Patient advocacy strengthens. Regulatory support increases.', confidence: 20 },
        ],
    },
    // APPROVAL
    {
        id: 'fsm-fast-track',
        pathId: 'firstinclass-small-molecule',
        phase: 'approval',
        type: 'news',
        title: 'Fastest Cancer Drug Review Ever',
        description: 'FDA has reviewed and approved your drug in just 10 weeks - the fastest cancer drug approval in FDA history.',
        choices: [
            { id: 'launch', text: 'Launch immediately', cost: 0, timeImpact: -0.5, outcome: 'Patients who were dying now have hope.', confidence: 25 },
        ],
    },
    {
        id: 'fsm-expanded-indications',
        pathId: 'firstinclass-small-molecule',
        phase: 'approval',
        type: 'news',
        title: 'Expanded Indications',
        description: 'Your kinase inhibitor works in other cancers with the same target (GIST, dermatofibrosarcoma). Multiple additional approvals are possible.',
        choices: [
            { id: 'pursue', text: 'Pursue 5 additional indications', cost: 30, timeImpact: 0, outcome: 'One drug becomes a platform. Market expands 50%.', marketImpact: 0.50, confidence: 10 },
        ],
    },
];

// ============================================
// TIER 3B: FIRST-IN-CLASS BIOLOGIC EVENTS
// First Checkpoint Inhibitor (CTLA-4)
// ============================================

export const FIRSTINCLASS_BIO_EVENTS: PathEvent[] = [
    // DISCOVERY
    {
        id: 'fbi-century-failure',
        pathId: 'firstinclass-biologic',
        phase: 'discovery',
        type: 'decision',
        title: 'A Century of Failure',
        description: 'Immunotherapy for cancer has failed for 100 years. Every previous attempt failed. Investors are deeply skeptical. "Why would this work when nothing else has?"',
        choices: [
            { id: 'persist', text: 'Persist with the science', cost: 3, timeImpact: 0.5, outcome: 'Find true believers willing to fund the attempt.', confidence: -20 },
            { id: 'smaller', text: 'Start smaller, prove in mice first', cost: 1, timeImpact: 0.75, outcome: 'Mouse data eventually convinces investors.', confidence: -10 },
        ],
    },
    // PRECLINICAL
    {
        id: 'fbi-autoimmunity-concern',
        pathId: 'firstinclass-biologic',
        phase: 'preclinical',
        type: 'news',
        title: 'Autoimmunity Concerns',
        description: 'Releasing immune brakes might cause autoimmunity - the immune system attacking healthy tissue. Mice develop inflammation in multiple organs.',
        choices: [
            { id: 'proceed', text: 'Proceed with careful monitoring', cost: 3, timeImpact: 0.25, outcome: 'Additional safety monitoring protocols developed.', confidence: -10 },
        ],
    },
    // PHASE I  
    {
        id: 'fbi-first-patient',
        pathId: 'firstinclass-biologic',
        phase: 'phase1',
        type: 'news',
        title: 'First Patient Response',
        description: 'A young woman with metastatic melanoma. Her tumor had collapsed her lung. Doctors were about to send her to hospice. After treatment, her tumor shrank enough for surgery. She survived.',
        choices: [
            { id: 'expand', text: 'Expand enrollment aggressively', cost: 10, timeImpact: 0, outcome: 'More patients enrolled. More responses. Hope builds.', confidence: 25 },
        ],
    },
    {
        id: 'fbi-severe-colitis',
        pathId: 'firstinclass-biologic',
        phase: 'phase1',
        type: 'decision',
        title: 'Severe Autoimmune Toxicity',
        description: 'Patients are developing severe colitis, hepatitis, and skin reactions. The immune system is attacking itself. About 20% are seriously affected.',
        choices: [
            { id: 'steroids', text: 'Develop steroid management protocols', cost: 8, timeImpact: 0.66, outcome: 'Toxicity manageable with steroids if caught early.', confidence: 0 },
            { id: 'dose-reduce', text: 'Reduce dose to minimize toxicity', cost: 5, timeImpact: 0.5, outcome: 'Lower toxicity but also lower efficacy.', confidence: -10 },
        ],
    },
    // PHASE II
    {
        id: 'fbi-slow-enrollment',
        pathId: 'firstinclass-biologic',
        phase: 'phase2',
        type: 'decision',
        title: 'Enrollment Challenges',
        description: 'Melanoma patients have few options but are still hesitant about a completely novel approach. Immunotherapy has such a bad history.',
        choices: [
            { id: 'sites', text: 'Add more specialized sites', cost: 4, timeImpact: 0.5, outcome: 'Major melanoma centers drive enrollment.', confidence: 0 },
            { id: 'education', text: 'Physician education campaign', cost: 2, timeImpact: 0.33, outcome: 'Doctors become more comfortable with the approach.', confidence: 5 },
        ],
    },
    {
        id: 'fbi-durable-responses',
        pathId: 'firstinclass-biologic',
        phase: 'phase2',
        type: 'news',
        title: 'Durable Responses',
        description: 'Patients who responded are STILL responding years later. Some are now effectively cancer-free. This is unprecedented in metastatic melanoma.',
        choices: [
            { id: 'publish', text: 'Publish long-term data', cost: 1, timeImpact: 0, outcome: 'Medical community takes notice. Paradigm shift begins.', confidence: 20 },
        ],
    },
    // PHASE III
    {
        id: 'fbi-trial-deaths',
        pathId: 'firstinclass-biologic',
        phase: 'phase3',
        type: 'decision',
        title: 'Fatal Immune Events',
        description: 'Two patients have died from severe immune-related adverse events. First treatment-related deaths in the program.',
        choices: [
            { id: 'pause', text: 'Pause for comprehensive safety review', cost: 3, timeImpact: 0.5, outcome: 'Thorough review. Enhanced protocols. FDA satisfied.', confidence: -10 },
            { id: 'continue', text: 'Continue with enhanced monitoring', cost: 2, timeImpact: 0.25, outcome: 'Faster but scrutiny increases.', confidence: -15 },
        ],
    },
    {
        id: 'fbi-survival-benefit',
        pathId: 'firstinclass-biologic',
        phase: 'phase3',
        type: 'news',
        title: 'Survival Benefit Proven',
        description: 'First-ever survival improvement in metastatic melanoma! Your drug extends life by months, with 20% achieving long-term survival.',
        choices: [
            { id: 'historic', text: 'Prepare for historic filing', cost: 0, timeImpact: 0, outcome: 'First immune checkpoint inhibitor heads to FDA.', confidence: 30 },
        ],
    },
    // APPROVAL
    {
        id: 'fbi-patient-advocates',
        pathId: 'firstinclass-biologic',
        phase: 'approval',
        type: 'news',
        title: 'Survivor Advocacy',
        description: 'Survivors of your trials become powerful voices. They testify at FDA advisory committees. Their stories are compelling.',
        choices: [
            { id: 'support', text: 'Support patient advocacy efforts', cost: 1, timeImpact: 0, outcome: 'Human impact drives regulatory and public support.', confidence: 15 },
        ],
    },
    {
        id: 'fbi-nobel-connection',
        pathId: 'firstinclass-biologic',
        phase: 'approval',
        type: 'news',
        title: 'Nobel Prize Science',
        description: 'The scientists who discovered your target are being recognized with major awards. The scientific legacy of your work is becoming clear.',
        choices: [
            { id: 'celebrate', text: 'Acknowledge the scientific pioneers', cost: 0, timeImpact: 0, outcome: 'Your drug made Nobel Prize science into medicine.', confidence: 10 },
        ],
    },
];

// ============================================
// UNIVERSAL EDUCATIONAL EVENTS
// ============================================

export const UNIVERSAL_EVENTS: PathEvent[] = [
    {
        id: 'universal-pbm-negotiation',
        pathId: '*',
        phase: 'approval',
        type: 'decision',
        title: 'The PBM Negotiation',
        description: 'Your drug has a list price of $50,000/year. But this is not what patients pay. Pharmacy Benefit Managers (PBMs) want a 40% rebate to put you on their formulary. Without it, patients cannot access your drug.',
        choices: [
            { id: 'accept-rebates', text: 'Accept the rebate system (industry standard)', cost: 0, timeImpact: 0, outcome: 'Drug gets formulary placement. Net revenue 40% lower than list price.', confidence: 5 },
            { id: 'lower-list-price', text: 'Lower list price, refuse large rebates', cost: 0, timeImpact: 0.25, outcome: 'Some PBMs may not cover you. Risky but innovative.', confidence: -5, marketImpact: -0.15 },
        ],
    },
    {
        id: 'universal-insurance-affordability',
        pathId: '*',
        phase: 'approval',
        type: 'news',
        title: 'Patient Affordability Crisis',
        description: 'Patients are struggling to afford your drug. Your list price is $50K, insurers pay $30K (after rebates), but patients with high-deductible plans pay copays based on the LIST price.',
        choices: [
            { id: 'copay-assistance', text: 'Launch copay assistance program', cost: 20, timeImpact: 0, outcome: 'Patients pay $0-$35/month. Company covers the rest.', confidence: 15 },
            { id: 'advocate-reform', text: 'Publicly advocate for insurance reform', cost: 5, timeImpact: 0, outcome: 'Join coalition supporting out-of-pocket caps.', confidence: 5 },
        ],
    },
];

// ============================================
// EVENT POOL GETTER
// ============================================

export const getEventsForPath = (pathId: string): PathEvent[] => {
    const pathEvents = (() => {
        switch (pathId) {
            case 'orphan-small-molecule':
                return ORPHAN_SM_EVENTS;
            case 'orphan-biologic':
                return ORPHAN_BIO_EVENTS;
            case 'blockbuster-small-molecule':
                return BLOCKBUSTER_SM_EVENTS;
            case 'blockbuster-biologic':
                return BLOCKBUSTER_BIO_EVENTS;
            case 'firstinclass-small-molecule':
                return FIRSTINCLASS_SM_EVENTS;
            case 'firstinclass-biologic':
                return FIRSTINCLASS_BIO_EVENTS;
            default:
                return [];
        }
    })();

    // Add universal events
    const universalEvents = UNIVERSAL_EVENTS.filter(e => e.pathId === '*');

    return [...pathEvents, ...universalEvents];
};

export const getEventsForPhase = (pathId: string, phase: string): PathEvent[] => {
    return getEventsForPath(pathId).filter(e => e.phase === phase);
};

