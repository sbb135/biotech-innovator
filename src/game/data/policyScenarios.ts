// Policy Scenarios - Inspired by RA Capital / Peter Kolchinsky
// Now difficulty-aware: Orphan, Blockbuster, and First-in-Class have different experiences

import { Difficulty } from '@/types/Game.types';

/**
 * Deterministic Policy Scenarios - Inspired by RA Capital / Peter Kolchinsky
 * 
 * These events occur at specific stages of the game to teach key policy lessons.
 * Scenarios now adapt based on difficulty (drug type):
 * 
 * ORPHAN: Less IRA impact (smaller Medicare pop), high specialty pricing, less PBM pressure
 * BLOCKBUSTER: Full IRA impact, massive PBM/insurance battles, high-volume economics
 * FIRST-IN-CLASS: Accelerated approval paths, novel endpoint challenges, premium pricing
 */

export interface PolicyScenario {
    id: string;
    name: string;
    triggerSpace: number;  // Deterministic: occurs at this specific space
    description: string;
    choices: PolicyChoice[];
    educationalContent: {
        title: string;
        insight: string;
        kolchinskyQuote?: string;
    };
    // NEW: Difficulty restrictions
    applicableDifficulties?: Difficulty[]; // If set, only triggers for these modes
}

export interface PolicyChoice {
    label: string;
    consequence: string;
    capitalChange?: number;
    investorConfidenceChange?: number;
    revenueMultiplier?: number;
    // For teaching the "right" lesson
    isOptimalChoice?: boolean;
    lessonIfChosen?: string;
}

/**
 * Get difficulty-specific scenario configurations
 */
const getDifficultyContext = (difficulty: Difficulty) => {
    switch (difficulty) {
        case 'orphan':
            return {
                typicalPrice: '$400,000+/year',
                patientPopulation: '< 200,000 patients',
                iraImpact: 'Lower (smaller Medicare population)',
                pbmPressure: 'Lower (specialty pharmacy model)',
                insuranceModel: 'Specialty tier with manufacturer support',
                revenueScale: 2000, // $2B lifetime
            };
        case 'blockbuster':
            return {
                typicalPrice: '$75,000-150,000/year',
                patientPopulation: 'Millions of patients',
                iraImpact: 'Maximum (large Medicare exposure)',
                pbmPressure: 'Intense (high-volume = more rebate leverage)',
                insuranceModel: 'Formulary battles with PBMs',
                revenueScale: 8000, // $8B lifetime
            };
        case 'firstInClass':
            return {
                typicalPrice: '$150,000-250,000/year',
                patientPopulation: 'Large unmet need population',
                iraImpact: 'Moderate (premium pricing partially offsets)',
                pbmPressure: 'Moderate (no direct competitors initially)',
                insuranceModel: 'Initial exclusivity, then competitive pressure',
                revenueScale: 6000, // $6B lifetime
            };
    }
};

/**
 * Policy scenarios that occur at specific spaces (deterministic)
 * Now with difficulty-specific variations
 */
export const POLICY_SCENARIOS: PolicyScenario[] = [
    // ============================================
    // EARLY GAME: Drug Type Selection (ALL DIFFICULTIES)
    // ============================================
    {
        id: 'drug-modality-choice',
        name: 'Choose Your Modality',
        triggerSpace: 1,  // At Target ID
        description: 'As you identify your target, you must decide what type of drug to develop. This choice has major implications for regulatory timelines and policy risk.',
        choices: [
            {
                label: 'Small Molecule (Oral Pill)',
                consequence: 'Easier to manufacture, oral delivery preferred by patients. BUT: Only 9 years before Medicare price negotiation under the IRA.',
                investorConfidenceChange: -10,
                lessonIfChosen: 'The IRA\'s "pill penalty" gives small molecules only 9 years before price controls vs 13 years for biologics. This asymmetry is causing massive shifts in investment away from pills.',
            },
            {
                label: 'Large Molecule (Biologic/Antibody)',
                consequence: 'Requires injection, complex manufacturing. BUT: 13 years before Medicare negotiation—more time to generate ROI.',
                investorConfidenceChange: 0,
                isOptimalChoice: true,
                lessonIfChosen: 'Biologics get 4 extra years of market exclusivity. This is why you see more antibodies and fewer pills in development pipelines since the IRA passed.',
            },
        ],
        educationalContent: {
            title: 'The Pill Penalty',
            insight: 'The Inflation Reduction Act treats small molecules differently than biologics. Pills face Medicare price negotiation after 9 years; biologics get 13 years. This 4-year difference can reduce a drug\'s value by 40%.',
            kolchinskyQuote: '"The pill penalty has made most early-stage, small-molecule drug development projects for diseases common in older populations uninvestable." — Peter Kolchinsky, RA Capital',
        },
    },

    // ============================================
    // ORPHAN-SPECIFIC: Orphan Drug Designation
    // ============================================
    {
        id: 'orphan-drug-designation',
        name: 'Orphan Drug Designation',
        triggerSpace: 6,  // IND Preparation
        description: 'The FDA\'s Orphan Drug Program offers significant incentives for rare disease drugs. You can apply for Orphan Drug Designation (ODD) to unlock tax credits and 7 years of market exclusivity.',
        applicableDifficulties: ['orphan'],
        choices: [
            {
                label: 'Apply for Orphan Drug Designation',
                consequence: 'Receive 25% tax credit on clinical trial costs, fee waivers, and 7 years market exclusivity upon approval—even beyond patent life.',
                capitalChange: 15, // Tax credit benefit
                investorConfidenceChange: 10,
                isOptimalChoice: true,
                lessonIfChosen: 'ODD provides powerful incentives that make rare disease drug development economically viable. Without these, most orphan drugs would never be developed.',
            },
            {
                label: 'Skip ODD application (faster timeline)',
                consequence: 'Save 3-6 months of regulatory work, but miss out on significant financial benefits.',
                investorConfidenceChange: -5,
                lessonIfChosen: 'Most companies pursuing rare disease indications apply for ODD—the benefits are substantial.',
            },
        ],
        educationalContent: {
            title: 'The Orphan Drug Act Success Story',
            insight: 'Before the 1983 Orphan Drug Act, only 38 orphan drugs existed. Since then, over 600 have been approved. The law\'s incentives transformed rare disease from a market failure into a thriving sector.',
            kolchinskyQuote: '"Orphan drugs demonstrate that smart incentives work. The social contract is alive and well in rare disease." — Industry analyst',
        },
    },

    // ============================================
    // FIRST-IN-CLASS SPECIFIC: Breakthrough Therapy
    // ============================================
    {
        id: 'breakthrough-therapy-designation',
        name: 'Breakthrough Therapy Designation',
        triggerSpace: 14,  // Phase IIa
        description: 'Your novel mechanism is showing strong early efficacy. You may qualify for Breakthrough Therapy Designation, which accelerates FDA interactions and potentially enables approval on smaller trials.',
        applicableDifficulties: ['firstInClass'],
        choices: [
            {
                label: 'Apply for Breakthrough Therapy Designation',
                consequence: 'Intensive FDA guidance, rolling review, potential for accelerated approval. But greater regulatory scrutiny and higher expectations.',
                investorConfidenceChange: 15,
                isOptimalChoice: true,
                lessonIfChosen: 'Breakthrough designation can shave years off development time. For first-in-class drugs with strong efficacy signals, it\'s a powerful tool.',
            },
            {
                label: 'Pursue standard regulatory pathway',
                consequence: 'Conventional timeline with larger trials. More data but more time and cost.',
                capitalChange: -20,
                lessonIfChosen: 'The standard path requires larger trials but provides more robust safety data for novel mechanisms.',
            },
        ],
        educationalContent: {
            title: 'Accelerated Approval Pathways',
            insight: 'FDA offers multiple expedited pathways: Breakthrough Therapy, Fast Track, Accelerated Approval, and Priority Review. For novel mechanisms addressing unmet needs, these can dramatically reduce time-to-market.',
            kolchinskyQuote: '"First-in-class drugs face regulatory uncertainty, but also get regulatory flexibility when they address serious conditions with unmet needs."',
        },
    },

    // ============================================
    // BLOCKBUSTER SPECIFIC: Large-Scale IRA Impact
    // ============================================
    {
        id: 'ira-negotiation-looms-blockbuster',
        name: 'Analysts Model the IRA Impact',
        triggerSpace: 14,  // Phase IIa - Proof of Concept
        description: 'Your drug shows promise for a large Medicare population. Wall Street analysts are modeling a 40%+ NPV reduction due to IRA price controls starting 9 years after approval (small molecules) or 13 years (biologics).',
        applicableDifficulties: ['blockbuster'],
        choices: [
            {
                label: 'Accept reduced long-term value (-40% projected revenue)',
                consequence: 'Continue development knowing that revenues will be capped after 9-13 years post-approval.',
                revenueMultiplier: 0.6,
                investorConfidenceChange: -15,
                lessonIfChosen: 'The IRA clock starts at FDA approval, not during trials. For Medicare-heavy drugs, this 40% NPV reduction is reshaping pipeline priorities.',
            },
            {
                label: 'Accelerate timeline for faster approval',
                consequence: 'Seek Breakthrough Therapy Designation to launch faster and maximize pre-negotiation revenues.',
                capitalChange: -20,
                isOptimalChoice: true,
                lessonIfChosen: 'Companies are racing to launch faster to maximize years before negotiation. The clock starts at approval, so faster approval = more revenue.',
            },
            {
                label: 'Partner with Big Pharma for global reach',
                consequence: 'License rights to a partner who can maximize international revenues where the IRA does not apply.',
                capitalChange: 100,
                revenueMultiplier: 0.5,
                lessonIfChosen: 'Partnering trades upside for certainty. Big Pharma can offset US price controls with global revenues.',
            },
        ],
        educationalContent: {
            title: 'Medicare Negotiation (Clock Starts at Approval)',
            insight: 'The IRA allows Medicare to negotiate prices starting 9 years after FDA approval for small molecules, or 13 years for biologics. This clock does NOT start until approval, but analysts model the impact now.',
            kolchinskyQuote: '"Stay away from any disease of aging where you will be heavily dependent on Medicare." — Investment advice since IRA passage',
        },
    },

    // ============================================
    // ORPHAN-SPECIFIC: Lower IRA Impact
    // ============================================
    {
        id: 'ira-negotiation-looms-orphan',
        name: 'IRA Impact Assessment',
        triggerSpace: 14,  // Phase IIa
        description: 'Your rare disease drug serves a small patient population. While the IRA technically applies, your Medicare exposure is limited. Analysts see less impact than mass-market drugs.',
        applicableDifficulties: ['orphan'],
        choices: [
            {
                label: 'Continue with current pricing strategy',
                consequence: 'Your small Medicare population means limited IRA exposure. Maintain premium orphan drug pricing.',
                investorConfidenceChange: 5,
                isOptimalChoice: true,
                lessonIfChosen: 'Orphan drugs are relatively protected from IRA impact due to limited Medicare patient numbers and specialty pharmacy distribution.',
            },
            {
                label: 'Proactively offer value-based contract',
                consequence: 'Offer outcomes-based pricing to insurers. Builds goodwill but may set precedent.',
                capitalChange: -10,
                investorConfidenceChange: 0,
                lessonIfChosen: 'Value-based contracts can work well for rare diseases where outcomes are clearly measurable.',
            },
        ],
        educationalContent: {
            title: 'Orphan Drugs and the IRA',
            insight: 'Rare disease drugs face less IRA pressure because their Medicare patient populations are small. However, orphan drug pricing ($300K-$500K+/year) still attracts policy attention.',
            kolchinskyQuote: '"The orphan drug model remains viable, but companies should still plan for eventual price pressure."',
        },
    },

    // ============================================
    // FIRST-IN-CLASS SPECIFIC: Novel Endpoint Challenges
    // ============================================
    {
        id: 'novel-endpoint-negotiation',
        name: 'Novel Endpoint Challenge',
        triggerSpace: 16,  // Phase III Planning
        description: 'As a first-in-class drug with a novel mechanism, there are no established clinical endpoints. You must negotiate with FDA on what success looks like.',
        applicableDifficulties: ['firstInClass'],
        choices: [
            {
                label: 'Propose surrogate endpoint (faster, riskier)',
                consequence: 'Accelerated approval possible based on biomarker, but confirmatory trial required post-approval.',
                investorConfidenceChange: 5,
                isOptimalChoice: true,
                lessonIfChosen: 'Surrogate endpoints can dramatically accelerate approval for novel mechanisms, but post-marketing commitments are binding.',
            },
            {
                label: 'Use traditional clinical endpoint (slower, definitive)',
                consequence: 'Longer trial with hard clinical outcomes. More robust evidence but 2-3 years longer development.',
                capitalChange: -50,
                lessonIfChosen: 'Traditional endpoints provide the strongest evidence but require larger, longer, more expensive trials.',
            },
        ],
        educationalContent: {
            title: 'The Endpoint Challenge',
            insight: 'First-in-class drugs often lack validated endpoints. Working with FDA to establish novel endpoints or use surrogate markers is critical for efficient development.',
            kolchinskyQuote: '"Novel mechanisms require novel thinking about how we measure success. This is where regulatory science meets clinical innovation."',
        },
    },

    // ============================================
    // BLOCKBUSTER SPECIFIC: Intense PBM Pressure
    // ============================================
    {
        id: 'pbm-rebate-demand-blockbuster',
        name: 'PBM Demands Maximum Rebates',
        triggerSpace: 21,  // Advisory Committee
        description: 'The "Big 3" PBMs (controlling 80% of the market) are demanding 40% rebates—or they\'ll require prior authorization that blocks 50% of prescriptions. This is the reality of blockbuster drug launches.',
        applicableDifficulties: ['blockbuster'],
        choices: [
            {
                label: 'Pay the 40% rebate for unrestricted access',
                consequence: 'Your net revenue drops significantly, but patients have easy access. This is how the game is played.',
                revenueMultiplier: 0.6,
                investorConfidenceChange: -5,
                isOptimalChoice: true,
                lessonIfChosen: 'PBMs extract 30-50% of blockbuster drug revenue. This is money that could fund more R&D, but without PBM access, your drug won\'t reach patients.',
            },
            {
                label: 'Negotiate 25% rebate with step therapy',
                consequence: 'Lower rebates but patients must fail cheaper drugs first. Some will never reach your therapy.',
                revenueMultiplier: 0.75,
                investorConfidenceChange: -10,
                lessonIfChosen: 'Step therapy requirements mean many patients never access newer, better therapies. This is the cost of resisting PBM demands.',
            },
            {
                label: 'Refuse rebates, go direct-to-patient',
                consequence: 'Bypass PBMs entirely with direct patient programs. Revolutionary but risky.',
                capitalChange: -30,
                investorConfidenceChange: -15,
                lessonIfChosen: 'Some companies are experimenting with PBM bypass strategies, but it\'s difficult when PBMs control 80% of commercially insured patients.',
            },
        ],
        educationalContent: {
            title: 'The PBM Blockbuster Tax',
            insight: 'For high-volume blockbuster drugs, PBMs have maximum leverage. They can demand 30-50% rebates because your drug\'s success depends on broad formulary access.',
            kolchinskyQuote: '"PBMs are now the largest extractors of value from the pharmaceutical supply chain, yet provide questionable value to patients."',
        },
    },

    // ============================================
    // ORPHAN-SPECIFIC: Specialty Pharmacy Model
    // ============================================
    {
        id: 'specialty-distribution-orphan',
        name: 'Specialty Pharmacy Distribution',
        triggerSpace: 21,  // Advisory Committee
        description: 'Rare disease drugs bypass traditional PBMs through specialty pharmacies. You can negotiate directly with payers, but must set up patient support programs.',
        applicableDifficulties: ['orphan'],
        choices: [
            {
                label: 'Partner with specialty pharmacy network + patient support',
                consequence: 'Higher distribution costs but direct patient relationships. Copay assistance ensures access.',
                capitalChange: -20,
                isOptimalChoice: true,
                lessonIfChosen: 'The orphan drug model works differently: specialty pharmacies, patient support programs, and direct payer relationships. Less PBM pressure.',
            },
            {
                label: 'Try traditional pharmacy channels',
                consequence: 'Lower distribution costs but less patient support. May face unexpected PBM demands.',
                investorConfidenceChange: -10,
                lessonIfChosen: 'Traditional channels work poorly for rare diseases—patients need specialized support and monitoring.',
            },
        ],
        educationalContent: {
            title: 'The Orphan Drug Distribution Model',
            insight: 'Rare disease drugs are distributed through specialty pharmacies that provide patient support, adherence monitoring, and cold-chain logistics. This is more expensive but necessary.',
            kolchinskyQuote: '"Orphan drugs require specialized distribution and patient support. The economics are different from mass-market drugs."',
        },
    },

    // ============================================
    // INSURANCE COVERAGE (ALL - but with difficulty-specific framing in getScenarioForDifficulty)
    // ============================================
    {
        id: 'insurance-coverage-decision',
        name: 'Insurance Coverage Negotiation',
        triggerSpace: 19,  // NDA Submission
        description: 'You\'ve submitted for FDA approval. Payers are deciding coverage and out-of-pocket costs. This is where drug prices meet patient reality.',
        choices: [
            {
                label: 'Premium pricing with copay assistance',
                consequence: 'High price to insurance, but manufacturer-funded copay assistance ensures patient affordability.',
                capitalChange: -30,
                isOptimalChoice: true,
                lessonIfChosen: 'Copay assistance bridges the affordability gap, but it\'s a band-aid. The real fix is insurance reform to cap out-of-pocket costs.',
            },
            {
                label: 'Moderate pricing for broader access',
                consequence: 'Lower price means easier insurance approval and lower copays, but less revenue for future R&D.',
                revenueMultiplier: 0.7,
                investorConfidenceChange: -10,
                lessonIfChosen: 'Lower prices help today\'s patients but reduce capital for tomorrow\'s cures.',
            },
        ],
        educationalContent: {
            title: 'The Out-of-Pocket Problem',
            insight: 'Drug prices aren\'t the problem—out-of-pocket costs are. People already paid for coverage. Charging them again at the pharmacy is the real injustice.',
            kolchinskyQuote: '"If a patient has insurance and can\'t afford a covered medicine, that\'s not a drug pricing problem—that\'s an insurance design problem." — Peter Kolchinsky',
        },
    },

    // ============================================
    // VICTORY: The Social Contract (ALL)
    // ============================================
    {
        id: 'generic-clock-begins',
        name: 'The Social Contract',
        triggerSpace: 23,  // FDA Approval
        description: 'Congratulations! Your drug is approved. The IRA negotiation clock is now ticking. Small molecules face Medicare price negotiation after 9 years; biologics get 13 years. Eventually generics/biosimilars will enter and the price will drop 80-90%.',
        choices: [
            {
                label: 'I understand the bargain',
                consequence: 'High prices now fund the R&D. Cheap generics forever benefit humanity. This is the deal.',
                isOptimalChoice: true,
                lessonIfChosen: 'The biotech social contract: investors take enormous risk, patients pay high prices during exclusivity, then everyone benefits when costs drop 80-90%.',
            },
        ],
        educationalContent: {
            title: 'The Biotech Social Contract',
            insight: 'Every brand-name drug is destined to become a cheap generic. The high prices during exclusivity fund the R&D and reward the risk-takers. When generics enter, the drug becomes a permanent public good.',
            kolchinskyQuote: '"We are all like builders who build homes and look forward to being paid a finite mortgage. Once a drug goes generic, it\'s like society has paid off the mortgage." — Peter Kolchinsky',
        },
    },
];

/**
 * Get the policy scenario that should trigger at a specific space
 * Now filters based on difficulty mode
 */
export const getScenarioForSpace = (spaceId: number, difficulty?: Difficulty): PolicyScenario | undefined => {
    return POLICY_SCENARIOS.find(s => {
        // Check if space matches
        if (s.triggerSpace !== spaceId) return false;

        // If scenario has difficulty restrictions, check them
        if (s.applicableDifficulties && difficulty) {
            return s.applicableDifficulties.includes(difficulty);
        }

        // If no restrictions, or no difficulty provided, and no other scenario matches
        // But prefer difficulty-specific scenarios when available
        if (s.applicableDifficulties) {
            // This scenario is difficulty-specific but we don't match - skip it
            return false;
        }

        return true;
    });
};

/**
 * Get all policy scenarios (optionally filtered by difficulty)
 */
export const getAllScenarios = (difficulty?: Difficulty): PolicyScenario[] => {
    if (!difficulty) return POLICY_SCENARIOS;

    return POLICY_SCENARIOS.filter(s => {
        if (!s.applicableDifficulties) return true;
        return s.applicableDifficulties.includes(difficulty);
    });
};

/**
 * Get difficulty context for UI display
 */
export { getDifficultyContext };
