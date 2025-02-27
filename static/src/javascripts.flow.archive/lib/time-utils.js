/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/lib/time-utils.js
 * to .ts, then delete it.
 */

// @flow

// from and to should be Epoch time in milliseconds
const dateDiffDays = (from: number, to: number): number => {
    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = to - from;
    return Math.floor(diffMs / oneDayMs);
};

const isExpired = (testExpiry: string): boolean => {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
};

export { dateDiffDays, isExpired };
