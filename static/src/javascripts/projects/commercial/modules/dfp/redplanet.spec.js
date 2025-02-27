import {
    getConsentFor as getConsentFor_,
    onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import config from '../../../../lib/config';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { isInAuOrNz as isInAuOrNz_ } from '../../../common/modules/commercial/geo-utils';
import { init, resetModule } from './redplanet';
jest.mock('lib/raven');

const isInAuOrNz = isInAuOrNz_;

const AusWithConsentMock = (callback) =>
    callback({
        aus: { personalisedAdvertising: true },
    });

const AusWithoutConsentMock = (callback) =>
    callback({
        aus: { personalisedAdvertising: true },
    });

const onConsentChange = onConsentChange_;

jest.mock('../../../common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('./Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('../../../common/modules/commercial/geo-utils');

jest.mock('../../../common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

jest.mock('../../../../lib/cookies', () => ({
    getCookie: jest.fn(),
}));

jest.mock('../../../../lib/launchpad', () => jest.fn());

jest.mock('../../../common/modules/commercial/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));

jest.mock('@guardian/libs', () => ({
    loadScript: () => Promise.resolve(),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    onConsentChange: jest.fn(),
    getConsentFor: jest.fn()
}));

jest.mock('../../../common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

const CcpaWithConsentMock = (callback) =>
    callback({ ccpa: { doNotSell: false } });

const getConsentFor = getConsentFor_;

window.launchpad = jest.fn().mockImplementationOnce(() => jest.fn());

describe('init', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetModule();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should initialise redplanet when all conditions are true with right params', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        config.set('ophan.browserId', '123');
        config.set('page.section', 'uk');
        config.set('page.sectionName', 'Politics');
        config.set('page.contentType', 'Article');
        onConsentChange.mockImplementation(AusWithConsentMock);
        getConsentFor.mockReturnValue(true);

        await init();

        const expectedNewTrackerCall = [
            'newTracker',
            'launchpad',
            'lpx.qantas.com',
            {
                appId: 'the-guardian',
                discoverRootDomain: true,
            },
        ];
        const expectedTrackUnstructEventCall = [
            'trackUnstructEvent',
            {
                schema: 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
                data: {
                    u1: 'theguardian.com',
                    u2: 'uk',
                    u3: 'Politics',
                    u4: 'Article',
                    uid: '123',
                },
            },
        ];
        expect(window.launchpad.mock.calls).toEqual([
            expectedNewTrackerCall,
            expectedTrackUnstructEventCall,
        ]);
    });

    it('should initialise redplanet when TCFv2 consent has been given', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(AusWithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).toBeCalled();
    });

    it('should not initialise redplanet when TCFv2 consent has not been given', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(AusWithoutConsentMock);
        getConsentFor.mockReturnValue(false);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should throw an error when on CCPA mode', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(CcpaWithConsentMock);
        getConsentFor.mockReturnValue(true);
        expect(await init).toThrow(
            `Error running Redplanet without AUS consent. It should only run in Australia on AUS mode`
        );
    });

    it('should not initialise redplanet when launchpad conditions are false', async () => {
        commercialFeatures.launchpad = false;
        isInAuOrNz.mockReturnValue(true);
        onConsentChange.mockImplementation(AusWithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });

    it('should not initialise redplanet when user not in AUS regions', async () => {
        commercialFeatures.launchpad = true;
        isInAuOrNz.mockReturnValue(false);
        onConsentChange.mockImplementation(AusWithConsentMock);
        getConsentFor.mockReturnValue(true);
        await init();
        expect(window.launchpad).not.toBeCalled();
    });
});
