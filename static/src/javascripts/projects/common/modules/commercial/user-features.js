import { getCookie, removeCookie, addCookie } from '../../../../lib/cookies';
import config from '../../../../lib/config';
import { fetchJson } from '../../../../lib/fetch-json';
import { isUserLoggedIn } from '../identity/api';
import { dateDiffDays } from '../../../../lib/time-utils';

// Persistence keys
const USER_FEATURES_EXPIRY_COOKIE = 'gu_user_features_expiry';
const PAYING_MEMBER_COOKIE = 'gu_paying_member';
const AD_FREE_USER_COOKIE = 'GU_AF1';
const ACTION_REQUIRED_FOR_COOKIE = 'gu_action_required_for';
const DIGITAL_SUBSCRIBER_COOKIE = 'gu_digital_subscriber';
const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';

// These cookies come from the user attributes API
const RECURRING_CONTRIBUTOR_COOKIE = 'gu_recurring_contributor';
const ONE_OFF_CONTRIBUTION_DATE_COOKIE = 'gu_one_off_contribution_date';

// These cookies are dropped by support frontend at the point of making
// a recurring contribution
const SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE =
    'gu.contributions.recurring.contrib-timestamp.Monthly';
const SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE =
    'gu.contributions.recurring.contrib-timestamp.Annual';
const SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE =
    'gu.contributions.contrib-timestamp';

const ARTICLES_VIEWED_OPT_OUT_COOKIE = {
    name: 'gu_article_count_opt_out',
    daysToLive: 90,
};

const CONTRIBUTIONS_REMINDER_SIGNED_UP = {
    name: 'gu_contributions_reminder_signed_up',
    daysToLive: 90,
};

const forcedAdFreeMode = !!window.location.hash.match(
    /[#&]noadsaf(&.*)?$/
);

const userHasData = () => {
    const cookie =
        getCookie(ACTION_REQUIRED_FOR_COOKIE) ||
        getCookie(USER_FEATURES_EXPIRY_COOKIE) ||
        getCookie(PAYING_MEMBER_COOKIE) ||
        getCookie(RECURRING_CONTRIBUTOR_COOKIE) ||
        getCookie(ONE_OFF_CONTRIBUTION_DATE_COOKIE) ||
        getCookie(AD_FREE_USER_COOKIE) ||
        getCookie(DIGITAL_SUBSCRIBER_COOKIE) ||
        getCookie(HIDE_SUPPORT_MESSAGING_COOKIE);
    return !!cookie;
};

const accountDataUpdateWarning = () =>
    getCookie(ACTION_REQUIRED_FOR_COOKIE);

const adFreeDataIsPresent = () => {
    const cookieVal = getCookie(AD_FREE_USER_COOKIE);
    return !Number.isNaN(parseInt(cookieVal, 10));
};

const timeInDaysFromNow = (daysFromNow) => {
    const tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() + daysFromNow);
    return tmpDate.getTime().toString();
};

const persistResponse = (JsonResponse) => {
    addCookie(USER_FEATURES_EXPIRY_COOKIE, timeInDaysFromNow(1));
    addCookie(PAYING_MEMBER_COOKIE, JsonResponse.contentAccess.paidMember);
    addCookie(
        RECURRING_CONTRIBUTOR_COOKIE,
        JsonResponse.contentAccess.recurringContributor
    );
    addCookie(
        DIGITAL_SUBSCRIBER_COOKIE,
        JsonResponse.contentAccess.digitalPack
    );
    addCookie(
        HIDE_SUPPORT_MESSAGING_COOKIE,
        !JsonResponse.showSupportMessaging
    );
    if (JsonResponse.oneOffContributionDate) {
        addCookie(
            ONE_OFF_CONTRIBUTION_DATE_COOKIE,
            JsonResponse.oneOffContributionDate
        );
    }

    removeCookie(ACTION_REQUIRED_FOR_COOKIE);
    if ('alertAvailableFor' in JsonResponse) {
        addCookie(ACTION_REQUIRED_FOR_COOKIE, JsonResponse.alertAvailableFor);
    }

    if (
        adFreeDataIsPresent() &&
        !forcedAdFreeMode &&
        !JsonResponse.contentAccess.digitalPack
    ) {
        removeCookie(AD_FREE_USER_COOKIE);
    }

    if (JsonResponse.contentAccess.digitalPack) {
        addCookie(AD_FREE_USER_COOKIE, timeInDaysFromNow(2));
    }
};

const deleteOldData = () => {
    // We expect adfree cookies to be cleaned up by the logout process, but what if the user's login simply times out?
    removeCookie(USER_FEATURES_EXPIRY_COOKIE);
    removeCookie(PAYING_MEMBER_COOKIE);
    removeCookie(RECURRING_CONTRIBUTOR_COOKIE);
    removeCookie(AD_FREE_USER_COOKIE);
    removeCookie(ACTION_REQUIRED_FOR_COOKIE);
    removeCookie(DIGITAL_SUBSCRIBER_COOKIE);
    removeCookie(HIDE_SUPPORT_MESSAGING_COOKIE);
    removeCookie(ONE_OFF_CONTRIBUTION_DATE_COOKIE);
};

const requestNewData = () =>
    fetchJson(`${config.get('page.userAttributesApiUrl')}/me`, {
        mode: 'cors',
        credentials: 'include',
    })
        .then(persistResponse)
        .catch(() => {});

const datedCookieIsOld = (datedCookieName) => {
    const expiryDateFromCookie = getCookie(datedCookieName);
    const expiryTime = parseInt(expiryDateFromCookie, 10);
    const timeNow = new Date().getTime();
    return timeNow >= expiryTime;
};

const featuresDataIsMissing = () =>
    !getCookie(USER_FEATURES_EXPIRY_COOKIE);

const featuresDataIsOld = () =>
    datedCookieIsOld(USER_FEATURES_EXPIRY_COOKIE);

const adFreeDataIsOld = () => {
    const switches = config.get('switches');
    return (
        switches.adFreeStrictExpiryEnforcement &&
        datedCookieIsOld(AD_FREE_USER_COOKIE)
    );
};

const userNeedsNewFeatureData = () =>
    featuresDataIsMissing() ||
    featuresDataIsOld() ||
    (adFreeDataIsPresent() && adFreeDataIsOld());

const userHasDataAfterSignout = () =>
    !isUserLoggedIn() && userHasData();

/**
 * Updates the user's data in a lazy fashion
 */
const refresh = () => {
    if (isUserLoggedIn() && userNeedsNewFeatureData()) {
        return requestNewData();
    } else if (userHasDataAfterSignout() && !forcedAdFreeMode) {
        deleteOldData();
    }
    return Promise.resolve();
};

const supportSiteRecurringCookiePresent = () =>
    getCookie(SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE) != null ||
    getCookie(SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE) != null;

/**
 * Does our _existing_ data say the user is a paying member?
 * This data may be stale; we do not wait for userFeatures.refresh()
 */
const isPayingMember = () =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a paying user
    isUserLoggedIn() && getCookie(PAYING_MEMBER_COOKIE) !== 'false';

// Expects milliseconds since epoch
const getSupportFrontendOneOffContributionTimestamp = () => {
    const supportFrontendCookie = getCookie(
        SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE
    );

    if (supportFrontendCookie) {
        const ms = parseInt(supportFrontendCookie, 10);
        if (Number.isInteger(ms)) return ms;
    }

    return null;
};

// Expects YYYY-MM-DD format
const getAttributesOneOffContributionTimestamp = () => {
    const attributesCookie = getCookie(ONE_OFF_CONTRIBUTION_DATE_COOKIE);

    if (attributesCookie) {
        const ms = Date.parse(attributesCookie);
        if (Number.isInteger(ms)) return ms;
    }

    return null;
};

// number returned is Epoch time in milliseconds.
// null value signifies no last contribution date.
const getLastOneOffContributionTimestamp = () =>
    getSupportFrontendOneOffContributionTimestamp() ||
    getAttributesOneOffContributionTimestamp();

const getLastOneOffContributionDate = () => {
	const timestamp = getLastOneOffContributionTimestamp();

	if (timestamp === null) {
		return null;
	}

	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
}

const getLastRecurringContributionDate = () => {
    // Check for cookies, ensure that cookies parse, and ensure parsed results are integers
    const monthlyCookie = getCookie(
        SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE
    );
    const annualCookie = getCookie(SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE);
    const monthlyTime = monthlyCookie ? parseInt(monthlyCookie, 10) : null;
    const annualTime = annualCookie ? parseInt(annualCookie, 10) : null;
    const monthlyMS =
        monthlyTime && Number.isInteger(monthlyTime) ? monthlyTime : null;
    const annualMS =
        annualTime && Number.isInteger(annualTime) ? annualTime : null;

    if (!monthlyMS && !annualMS) {
        return null;
    }

    if (monthlyMS && annualMS) {
        return Math.max(monthlyMS, annualMS);
    }

    return monthlyMS || annualMS || null;
};

const getDaysSinceLastOneOffContribution = () => {
    const lastContributionDate = getLastOneOffContributionTimestamp();
    if (lastContributionDate === null) {
        return null;
    }
    return dateDiffDays(lastContributionDate, Date.now());
};

// defaults to last three months
const isRecentOneOffContributor = (askPauseDays = 90) => {
    const daysSinceLastContribution = getDaysSinceLastOneOffContribution();
    if (daysSinceLastContribution === null) {
        return false;
    }
    return daysSinceLastContribution <= askPauseDays;
};

// true if the user has completed their ask-free period
const isPostAskPauseOneOffContributor = (
    askPauseDays = 90
) => {
    const daysSinceLastContribution = getDaysSinceLastOneOffContribution();
    if (daysSinceLastContribution === null) {
        return false;
    }
    return daysSinceLastContribution > askPauseDays;
};

const isRecurringContributor = () =>
    // If the user is logged in, but has no cookie yet, play it safe and assume they're a contributor
    (isUserLoggedIn() && getCookie(RECURRING_CONTRIBUTOR_COOKIE) !== 'false') ||
    supportSiteRecurringCookiePresent();

const isDigitalSubscriber = () =>
    getCookie(DIGITAL_SUBSCRIBER_COOKIE) === 'true';

const shouldNotBeShownSupportMessaging = () =>
    getCookie(HIDE_SUPPORT_MESSAGING_COOKIE) === 'true';

/*
    Whenever the checks are updated, please make sure to update
    applyRenderConditions.scala.js too, where the global CSS class, indicating
    the user should not see the revenue messages, is added to the body.
    Please also update readerRevenueRelevantCookies below, if changing the cookies
    which this function is dependent on.
*/

const shouldHideSupportMessaging = () =>
    shouldNotBeShownSupportMessaging() ||
    isRecentOneOffContributor() || // because members-data-api is unaware of one-off contributions so relies on cookie
    isRecurringContributor(); // guest checkout means that members-data-api isn't aware of all recurring contributions so relies on cookie

const readerRevenueRelevantCookies = [
    PAYING_MEMBER_COOKIE,
    DIGITAL_SUBSCRIBER_COOKIE,
    RECURRING_CONTRIBUTOR_COOKIE,
    SUPPORT_RECURRING_CONTRIBUTOR_MONTHLY_COOKIE,
    SUPPORT_RECURRING_CONTRIBUTOR_ANNUAL_COOKIE,
    SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
    HIDE_SUPPORT_MESSAGING_COOKIE,
];

// For debug/test purposes
const fakeOneOffContributor = () => {
    addCookie(SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE, Date.now().toString());
};

const isAdFreeUser = () =>
    isDigitalSubscriber() || (adFreeDataIsPresent() && !adFreeDataIsOld());

// Extend the expiry of the contributions cookie by 1 year beyond the date of the contribution
const extendContribsCookieExpiry = () => {
    const cookie = getCookie(SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE);
    if (cookie) {
        const contributionDate = parseInt(cookie, 10);
        if (Number.isInteger(contributionDate)) {
            const daysToLive = 365 - dateDiffDays(contributionDate, Date.now());
            addCookie(
                SUPPORT_ONE_OFF_CONTRIBUTION_COOKIE,
                contributionDate.toString(),
                daysToLive
            );
        }
    }
};

const canShowContributionsReminderFeature = () => {
    const signedUpForReminder = !!getCookie(CONTRIBUTIONS_REMINDER_SIGNED_UP.name);
    return config.get('switches.showContributionReminder') && !signedUpForReminder;
};

export {
    accountDataUpdateWarning,
    isAdFreeUser,
    isPayingMember,
    isRecentOneOffContributor,
    isRecurringContributor,
    isDigitalSubscriber,
    shouldHideSupportMessaging,
    refresh,
    deleteOldData,
    getLastOneOffContributionTimestamp,
    getLastOneOffContributionDate,
    getLastRecurringContributionDate,
    getDaysSinceLastOneOffContribution,
    isPostAskPauseOneOffContributor,
    readerRevenueRelevantCookies,
    fakeOneOffContributor,
    shouldNotBeShownSupportMessaging,
    extendContribsCookieExpiry,
    ARTICLES_VIEWED_OPT_OUT_COOKIE,
    CONTRIBUTIONS_REMINDER_SIGNED_UP,
    canShowContributionsReminderFeature
};
