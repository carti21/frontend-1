type ListenerFunction = (f: () => void) => void;

declare type EpicCta = { url: string; ctaText: string };

declare type EpicTemplate = (
	EpicVariant,
	AcquisitionsEpicTemplateCopy,
) => string;

type PageCheck = (page: Record<string, unknown>) => boolean;

declare type Variant = {
	id: string;
	test: (x: Record<string, unknown>) => void;
	campaignCode?: string;
	canRun?: () => boolean;
	impression?: ListenerFunction;
	success?: ListenerFunction;
	engagementBannerParams?: EngagementBannerTestParams;
};

declare type EpicVariant = Variant & {
	// filters, where empty is taken to mean 'all', multiple entries are combined with OR
	countryGroups: string[];
	tagIds: string[];
	sections: string[];
	excludedTagIds: string[];
	excludedSections: string[];

	supportURL: string;
	componentName: string;
	template: EpicTemplate;
	classNames: string[];
	showTicker?: boolean; // Deprecated, use tickerSettings instead
	tickerSettings?: TickerSettings | null;
	showReminderFields?: ReminderFields | null;

	buttonTemplate?: (
		primaryCta: EpicCta,
		secondaryCta?: EpicCta,
		reminderCta?: ReminderFields,
	) => string;
	ctaText?: string;
	secondaryCta?: EpicCta;
	copy: AcquisitionsEpicTemplateCopy;
	backgroundImageUrl?: string;
};

declare type ABTest = {
	id: string;
	start: string;
	expiry: string;
	author: string;
	description: string;
	audience: number;
	audienceOffset: number;
	successMeasure: string;
	audienceCriteria: string;
	showForSensitive: boolean;
	idealOutcome?: string;
	dataLinkNames?: string;
	ophanComponentId?: string;
	variants: readonly Variant[];
	canRun: () => boolean;
	notInTest?: () => void;
};

declare type Runnable<T extends ABTest> = T & {
	variantToRun: Variant;
};

declare type AcquisitionsABTest = ABTest & {
	campaignId: string;
	componentType: OphanComponentType;
	geolocation: ?string;
};

declare type MaxViews = {
	days: number;
	count: number;
	minDaysBetweenViews: number;
};

declare type ArticlesViewedSettings = {
	minViews?: number;
	maxViews?: number;
	count: number;
};

declare type DeploymentRules = 'AlwaysAsk' | MaxViews;

declare type EpicABTest = AcquisitionsABTest & {
	campaignPrefix: string;
	useLocalViewLog: boolean;
	userCohort: AcquisitionsComponentUserCohort;
	pageCheck: PageCheck;
	useTargetingTool: boolean;
	insertEvent: string;
	viewEvent: string;
	highPriority: boolean;
	deploymentRules: DeploymentRules;
};

declare type InitEpicABTestVariant = {
	id: string;
	products: readonly OphanProduct[];
	test?: (html: string, variant: EpicVariant, parentTest: EpicABTest) => void;
	countryGroups?: string[];
	tagIds?: string[];
	sections?: string[];
	excludedTagIds?: string[];
	excludedSections?: string[];
	buttonTemplate?: (
		primaryCta: EpicCta,
		secondaryCta?: EpicCta,
		reminderCta?: ReminderFields,
	) => string;
	ctaText?: string;
	secondaryCta?: EpicCta;
	copy: AcquisitionsEpicTemplateCopy;
	classNames?: string[];
	showTicker?: boolean;
	tickerSettings?: TickerSettings | null;
	showReminderFields?: ReminderFields | null;
	supportBaseURL?: string;
	backgroundImageUrl?: string;
	canRun?: () => boolean;
	template?: EpicTemplate;
};

declare type InitBannerABTestVariant = {
	id: string;
	products: readonly OphanProduct[];
	engagementBannerParams: () => Promise<?EngagementBannerTemplateParams>;
};

declare type InitEpicABTest = {
	id: string;
	start: string;
	expiry: string;
	author: string;
	description: string;
	audience: number;
	audienceOffset: number;
	successMeasure: string;
	audienceCriteria: string;
	idealOutcome: string;
	campaignId: string;
	canRun?: () => boolean;
	variants: readonly InitEpicABTestVariant[];

	campaignPrefix?: string;
	useLocalViewLog?: boolean;
	useTargetingTool?: boolean;
	userCohort?: AcquisitionsComponentUserCohort;
	pageCheck?: PageCheck;
	template?: EpicTemplate;
	deploymentRules?: DeploymentRules;
	testHasCountryName?: boolean;
	geolocation: ?string;
	highPriority: boolean;
	articlesViewedSettings?: ArticlesViewedSettings;
};

declare type Interaction = {
	component: string;
	value: string;
};

/**
 * the structure stored in localStorage
 */
declare type Participations = Record<
	string,
	{
		variant: string;
	}
>;
