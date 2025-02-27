import {
	getMvtNumValues,
	getMvtValue,
} from 'common/modules/analytics/mvt-cookie';
import { logAutomatEvent } from 'common/modules/experiments/automatLog';
import config_ from 'lib/config';
import { isExpired } from 'lib/time-utils';
import { NOT_IN_TEST } from './ab-constants';
import { getVariantFromLocalStorage } from './ab-local-storage';
import { getIgnoreCanRunFromUrl, getVariantFromUrl } from './ab-url';
import { isTestSwitchedOn } from './ab-utils';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: string) => string | boolean;
};

// We only take account of a variant's canRun function if it's defined.
// If it's not, assume the variant can be run.
const variantCanBeRun = (variant: Variant): boolean =>
	!(variant.canRun && !variant.canRun()) && variant.id !== NOT_IN_TEST;

const testCanBeRun = (test: ABTest): boolean => {
	const expired = isExpired(test.expiry);
	const isSensitive = config.get('page.isSensitive');
	const shouldShowForSensitive = !!test.showForSensitive;
	const isTestOn = isTestSwitchedOn(test.id);
	const canTestBeRun = test.canRun();

	logAutomatEvent({
		key: test.id,
		value: {
			test,
			expired,
			isSensitive,
			shouldShowForSensitive,
			isTestOn,
			canTestBeRun,
		},
	});

	return (
		(isSensitive ? shouldShowForSensitive : true) &&
		isTestOn &&
		!expired &&
		canTestBeRun
	);
};

// Determine whether the user is in the test or not and return the associated
// variant ID, based on the MVT cookie segmentation.
//
// The test population is just a subset of MVT ids. A test population must
// begin from a specific value. Overlapping test ranges are permitted.
const computeVariantFromMvtCookie = (
	test: ABTest,
): Variant | null | undefined => {
	const smallestTestId = getMvtNumValues() * test.audienceOffset;
	const largestTestId = smallestTestId + getMvtNumValues() * test.audience;
	const mvtCookieId = Number(getMvtValue());

	if (
		mvtCookieId &&
		mvtCookieId > smallestTestId &&
		mvtCookieId <= largestTestId
	) {
		// This mvt test id is in the test range, so allocate it to a test variant.
		return test.variants[mvtCookieId % test.variants.length];
	}

	return null;
};

// This is the heart of the A/B testing framework.
// It turns an ABTest into a Runnable<ABTest>, if indeed the test
// actually has a variant which could run on this pageview.
//
// This function can be called at any time, before or after participations are
// persisted to localStorage. It should always give the same result for a given pageview.
export const runnableTest = <T extends ABTest>(
	test: T,
): Runnable<T> | null | undefined => {
	const fromUrl = getVariantFromUrl(test);
	const fromLocalStorage = getVariantFromLocalStorage(test);
	const fromCookie = computeVariantFromMvtCookie(test);
	const variantToRun = fromUrl ?? fromLocalStorage ?? fromCookie;
	const ignoreCanRun = fromUrl && getIgnoreCanRunFromUrl(); // check fromUrl to only ignore can run for forced tests

	if (variantToRun && ignoreCanRun) {
		return { ...test, variantToRun };
	}

	if (testCanBeRun(test) && variantToRun && variantCanBeRun(variantToRun)) {
		return { ...test, variantToRun };
	}

	return null;
};

export const allRunnableTests = <T extends ABTest>(
	tests: readonly T[],
): ReadonlyArray<Runnable<T>> =>
	tests.reduce<ReadonlyArray<Runnable<T>>>((accumulator, currentValue) => {
		const rt = runnableTest(currentValue);
		return rt ? [...accumulator, rt] : accumulator;
	}, []);
export const firstRunnableTest = <T extends ABTest>(
	tests: readonly T[],
): Runnable<T> | null | undefined =>
	tests
		.map((test: T) => runnableTest(test))
		.find((rt: Runnable<T> | null | undefined) => rt !== null);
