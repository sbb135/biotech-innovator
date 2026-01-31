// ============================================
// CORE GAME TYPES
// ============================================

export type GamePhase = 'discovery' | 'preclinical' | 'clinical' | 'regulatory';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'won' | 'lost';
export type Difficulty = 'orphan' | 'blockbuster' | 'firstInClass';

// ============================================
// DATA TOKENS - Scientific Evidence
// ============================================

export interface DataTokens {
    efficacy: number;   // Does it work?
    safety: number;     // Is it safe enough?
    pkpd: number;       // Right drug properties?
    cmc: number;        // Can you make it at scale?
}

export type TokenType = keyof DataTokens;

// ============================================
// BOARD SPACES
// ============================================

export interface Space {
    id: number;
    name: string;
    phase: GamePhase;
    cost: number;
    successRate?: number;
    dataYield: Partial<DataTokens>;
    isGate?: boolean;
    gateRequirement?: DataTokens;
    riskCardChance?: number;
    policyCardChance?: number;
    specialEffect?: SpaceSpecialEffect;
    tooltip: SpaceTooltip;
}

export interface SpaceTooltip {
    quick: string;
    detailed: string;
    costBreakdown?: string;
}

export type SpaceSpecialEffect =
    | { type: 'RETURN_TO_START' }
    | { type: 'RETURN_TO_SPACE'; spaceId: number }
    | { type: 'WAIT_TURNS'; turns: number }
    | { type: 'CHOICE_REQUIRED' }
    | { type: 'CAN_UPGRADE'; cost: number; bonus: Partial<DataTokens> }
    | { type: 'VICTORY_CHECK' }
    | { type: 'GENERIC_CLOCK' };

// ============================================
// CARDS
// ============================================

export interface RiskCard {
    id: string;
    name: string;
    phase: GamePhase;
    description: string;
    trigger: CardTrigger;
    effect: RiskCardEffect;
    educationalNote: string;
}

export interface CardTrigger {
    spaces?: number[];
    probability: number;
    turnRange?: [number, number];
}

export type RiskCardEffect =
    | { type: 'DATA_CHANGE'; tokens: Partial<DataTokens> }
    | { type: 'CAPITAL_CHANGE'; amount: number }
    | { type: 'CHOICE'; options: CardChoice[] }
    | { type: 'COMPOUND'; effects: RiskCardEffect[] };

export interface CardChoice {
    label: string;
    cost?: number;
    dataChange?: Partial<DataTokens>;
    capitalChange?: number;
    probability?: number;
    successEffect?: RiskCardEffect;
    failureEffect?: RiskCardEffect;
    consequence: string;
}

export interface PolicyCard {
    id: string;
    name: string;
    category: 'positive' | 'negative' | 'neutral';
    description: string;
    trigger: CardTrigger;
    effect: PolicyCardEffect;
    educationalInsight: {
        title: string;
        content: string;
        reflectionQuestion?: string;
    };
}

export type PolicyCardEffect =
    | { type: 'REVENUE_MULTIPLIER'; value: number }
    | { type: 'COST_MULTIPLIER'; phases: GamePhase[]; value: number }
    | { type: 'SUCCESS_RATE_BONUS'; phases: GamePhase[]; value: number }
    | { type: 'SKIP_PHASE'; phaseToSkip: string }
    | { type: 'CAPITAL_GRANT'; amount: number }
    | { type: 'EXCLUSIVITY_BONUS'; years: number }
    | { type: 'CLINICAL_HOLD'; costToResolve: number; turnsLost: number }
    | { type: 'FORCED_CHOICE'; options: CardChoice[] };

// ============================================
// GAME HISTORY & DECISIONS
// ============================================

export interface Decision {
    id: string;
    turn: number;
    space: number;
    type: 'space' | 'card' | 'financing' | 'gate';
    chosenOption: string;
    alternatives: string[];
    capitalBefore: number;
    capitalAfter: number;
    tokensBefore: DataTokens;
    tokensAfter: DataTokens;
    outcome: string;
}

export interface FinancingEvent {
    turn: number;
    type: 'series' | 'dilution' | 'partnership' | 'emergency';
    amount: number;
    dilutionPercent?: number;
    note?: string;  // Description of the financing event
}

export interface FailedProgram {
    turn: number;
    phase: GamePhase;
    space: number;
    reason: string;
    capitalLost: number;
}

// ============================================
// SHADOW PROGRAMS - Parallel programs that fail
// ============================================

export interface ShadowProgram {
    id: string;
    name: string;
    scientist: string;
    scientistBackground: string;
    targetDisease: string;
    failureSpace: number;      // Space ID where this program fails
    failureReason: string;
    costAtFailure: number;     // $M spent before failure
    vignette: string;          // Emotional story when it fails
    phaseFailureRate?: number; // % of drugs that fail at this phase (for display)
}

export interface ShadowProgramState {
    program: ShadowProgram;
    status: 'active' | 'failed';
    failedAtTurn?: number;
}

// Reference to a policy scenario by ID
export interface PolicyScenarioRef {
    scenarioId: string;
    triggeredAtSpace: number;
}

export interface GameHistory {
    decisions: Decision[];
    financingEvents: FinancingEvent[];
    failedPrograms: FailedProgram[];
    spaceVisits: number[];
    cardsDrawn: string[];
}

// ============================================
// SCORING
// ============================================

export interface ScoreBonus {
    category: string;
    description: string;
    value: number;
}

export interface ScorePenalty {
    category: string;
    description: string;
    value: number;
}

export interface Score {
    base: number;
    bonuses: ScoreBonus[];
    penalties: ScorePenalty[];
    total: number;
}

// ============================================
// MAIN GAME STATE
// ============================================

export interface CardState {
    riskDeck: RiskCard[];
    policyDeck: PolicyCard[];
    activeRiskCards: RiskCard[];
    activePolicyCards: PolicyCard[];
}

export interface GameState {
    // Core resources
    capital: number;
    dataTokens: DataTokens;

    // Progression
    currentSpace: number;
    turnNumber: number;
    phase: GamePhase;

    // Settings
    difficulty: Difficulty;
    status: GameStatus;

    // Revenue projection (affected by policy cards)
    revenueProjection: number;

    // Wait state (for clinical holds, etc.)
    waitTurns: number;

    // Cards
    cards: CardState;

    // History
    history: GameHistory;

    // Scoring
    score: Score;

    // Active modal/decision
    pendingDecision: PendingDecision | null;

    // Educational insights unlocked
    unlockedInsights: string[];

    // Shadow Programs - The 9 that fail for every 1 that succeeds
    shadowPrograms: ShadowProgramState[];
    totalFailureCost: number;  // Running total of money "lost" to parallel failures

    // Investor Confidence (affected by failures)
    investorConfidence: number; // 0-100, affects financing terms

    // Pending shadow program failure to show
    pendingShadowFailure: ShadowProgram | null;

    // Pending policy scenario to show
    pendingPolicyScenario: PolicyScenarioRef | null;

    // Policy scenarios that have been completed
    completedPolicyScenarios: string[];

    // Total Spent - Cumulative investment in THIS program
    totalSpent: number; // Running total of all capital spent

    // ============================================
    // NEW: TIME TRACKING (Kolchinsky Framework)
    // ============================================
    currentYear: number;           // Current year in development (0 = start)
    yearHistory: YearMilestone[];  // Log of when each phase was completed

    // ============================================
    // NEW: FUNDING & OWNERSHIP TRACKING
    // ============================================
    founderOwnership: number;          // Current founder ownership % (0-1)
    fundingRoundsCompleted: string[];  // Which rounds have been completed
    fundingHistory: FundingEvent[];    // Log of all funding events
    pendingFundingRound: string | null; // Current funding round being offered
}

// Year milestone for history tracking
export interface YearMilestone {
    space: number;
    year: number;
    event: string;
}

// Funding event for history
export interface FundingEvent {
    round: string;           // 'seed', 'seriesA', etc.
    year: number;            // What year this happened
    amountRaised: number;    // $M raised
    dilution: number;        // % diluted (0-1)
    preMoneyValuation: number; // Implied pre-money ($M)
    investorExpectation: string; // What they wanted to see
}


export interface PendingDecision {
    type: 'space' | 'card' | 'gate' | 'financing';
    title: string;
    context: string;
    options: CardChoice[];
    educationalNote?: string;
    isForced?: boolean;
}

// ============================================
// GAME ACTIONS (for reducer)
// ============================================

export type GameAction =
    | { type: 'START_GAME'; difficulty: Difficulty }
    | { type: 'ADVANCE_SPACE' }
    | { type: 'PAY_COST'; amount: number }
    | { type: 'GAIN_DATA'; tokens: Partial<DataTokens> }
    | { type: 'LOSE_DATA'; tokens: Partial<DataTokens> }
    | { type: 'DRAW_RISK_CARD'; card: RiskCard }
    | { type: 'DRAW_POLICY_CARD'; card: PolicyCard }
    | { type: 'RESOLVE_DECISION'; choiceIndex: number }
    | { type: 'DILUTE'; amount: number; dilutionPercent: number }
    | { type: 'EMERGENCY_FINANCING' }
    | { type: 'PARTNERSHIP'; recoveryAmount: number }
    | { type: 'SET_PENDING_DECISION'; decision: PendingDecision }
    | { type: 'CLEAR_PENDING_DECISION' }
    | { type: 'APPLY_REVENUE_MULTIPLIER'; multiplier: number }
    | { type: 'SET_WAIT_TURNS'; turns: number }
    | { type: 'DECREMENT_WAIT' }
    | { type: 'SET_STATUS'; status: GameStatus }
    | { type: 'UNLOCK_INSIGHT'; insight: string }
    | { type: 'RETURN_TO_SPACE'; spaceId: number }
    | { type: 'GAME_OVER'; reason: string }
    | { type: 'VICTORY' }
    | { type: 'SAVE_GAME' }
    | { type: 'LOAD_GAME'; state: GameState }
    // Shadow Program Actions
    | { type: 'SHADOW_PROGRAM_FAILED'; programId: string; cost: number }
    | { type: 'SET_PENDING_SHADOW_FAILURE'; program: ShadowProgram }
    | { type: 'CLEAR_PENDING_SHADOW_FAILURE' }
    | { type: 'UPDATE_INVESTOR_CONFIDENCE'; delta: number }
    // Policy Scenario Actions
    | { type: 'SET_PENDING_POLICY_SCENARIO'; scenarioId: string }
    | { type: 'CLEAR_PENDING_POLICY_SCENARIO' }
    | { type: 'COMPLETE_POLICY_SCENARIO'; scenarioId: string }
    // Year/Time Tracking Actions
    | { type: 'ADVANCE_TIME'; years: number }
    | { type: 'ADD_YEAR_MILESTONE'; milestone: YearMilestone }
    // Funding Round Actions
    | { type: 'SET_PENDING_FUNDING_ROUND'; round: string }
    | { type: 'CLEAR_PENDING_FUNDING_ROUND' }
    | { type: 'COMPLETE_FUNDING_ROUND'; event: FundingEvent }
    | { type: 'UPDATE_FOUNDER_OWNERSHIP'; ownership: number };

// ============================================
// DIFFICULTY SETTINGS
// ============================================

export interface DifficultySettings {
    startingCapital: number;
    phaseIISuccessRate: number;
    phaseIIISuccessRate: number;
    phaseIIICostMultiplier: number;
    revenueProjection: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    advanceTurn: () => void;
    drawRiskCard: () => void;
    drawPolicyCard: () => void;
    canAfford: (cost: number) => boolean;
    meetsGateRequirements: (requirements: DataTokens) => boolean;
    getTokenDeficit: (requirements: DataTokens) => Partial<DataTokens>;
}

// ============================================
// PATH SYSTEM TYPES (New 6-Path Structure)
// ============================================

export type PathTier = 'orphan' | 'blockbuster' | 'first-in-class';
export type PathModality = 'small-molecule' | 'biologic';
export type PathPhase = 'discovery' | 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approval';

export interface GamePath {
    id: string;
    tier: PathTier;
    modality: PathModality;
    name: string;
    subtitle: string;
    icon: string;
    story: string;

    parameters: {
        startingCapital: number;
        phaseIISuccessRate: number;
        phaseIIICostMultiplier: number;
        marketPotential: number;
        timelineYears: { min: number; max: number };
        patientPopulation: number;
    };

    keyPoints: string[];
    fundingRounds: string[];

    victoryMetrics: {
        developmentTime: number;
        totalRaised: number;
        founderOwnership: number;
        patientImpact: string;
        socialContract: string;
    };
}

export interface FundingRoundDef {
    id: string;
    name: string;
    description: string;
    typicalRaise: { min: number; max: number };
    dilution: { min: number; max: number };
    investorExpectation: string;
    targetMultiple: string;
}

// ============================================
// PATH EVENTS & DECISIONS
// ============================================

export type PathEventType = 'setback' | 'opportunity' | 'crisis' | 'decision' | 'news';

export interface PathEvent {
    id: string;
    pathId: string;
    phase: PathPhase;
    type: PathEventType;
    title: string;
    description: string;
    choices: EventChoice[];
    reference?: {
        source: string;      // e.g., "FDA CDER Annual Report 2023"
        url?: string;        // Link to source
        learnMore?: string;  // Additional educational context
    };
}

export interface EventChoice {
    id: string;
    text: string;
    cost: number;          // Capital cost (can be negative for gains)
    timeImpact: number;    // Years added (negative = saves time)
    outcome: string;       // Description of what happens
    confidence?: number;   // Investor confidence change
    marketImpact?: number; // Market potential change (multiplier)
    riskIncrease?: number; // Increase failure chance
}

// ============================================
// NEW GAME STATE FOR PATH SYSTEM
// ============================================

export interface PathGameState {
    // Selected path
    selectedPath: string | null;
    pathData: GamePath | null;

    // Core resources
    capital: number;
    burnRate: number;  // $M per quarter

    // Time tracking
    currentYear: number;
    currentQuarter: 1 | 2 | 3 | 4;

    // Progression
    currentPhase: PathPhase;
    phaseProgress: number;  // 0-100% through current phase

    // Funding & Ownership
    founderOwnership: number;
    fundingRoundsCompleted: string[];

    // Investor confidence (affects funding terms)
    investorConfidence: number;

    // Market tracking
    marketPotential: number;

    // Events
    pendingEvent: PathEvent | null;
    completedEvents: string[];
    eventHistory: CompletedEvent[];

    // Game status
    status: 'path-selection' | 'playing' | 'victory' | 'defeat';
    defeatReason?: string;
}

export interface CompletedEvent {
    eventId: string;
    choiceId: string;
    year: number;
    outcome: string;
}
