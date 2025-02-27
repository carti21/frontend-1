import { mocked } from 'ts-jest/utils';
import { getBreakpoint as getBreakpoint_ } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import fakeMediator from '../../../lib/mediator';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { isUserLoggedIn as isUserLoggedIn_ } from '../../common/modules/identity/api';
import { _, initCommentAdverts } from './comment-adverts';
import { addSlot } from './dfp/add-slot';
import type { Advert } from './dfp/Advert';
import { getAdvertById as getAdvertById_ } from './dfp/get-advert-by-id';
import { refreshAdvert as refreshAdvert_ } from './dfp/load-advert';

// Workaround to fix issue where dataset is missing from jsdom, and solve the
// 'cannot set property [...] which has only a getter' TypeError
Object.defineProperty(HTMLElement.prototype, 'dataset', {
	writable: true,
	value: {},
});

jest.mock('../../../lib/mediator');
jest.mock('../../../lib/config', () => ({ page: {}, get: () => false }));

jest.mock('./dfp/add-slot', () => ({
	addSlot: jest.fn(),
}));

jest.mock('./dfp/load-advert', () => ({
	refreshAdvert: jest.fn(),
}));

jest.mock('./dfp/get-advert-by-id', () => ({
	getAdvertById: jest.fn(),
}));

jest.mock('../../../lib/detect', () => ({
	getBreakpoint: jest.fn(),
}));

jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		commentAdverts: true,
	},
}));

jest.mock('../../common/modules/identity/api', () => ({
	isUserLoggedIn: jest.fn(),
}));

const { createCommentSlots, runSecondStage, maybeUpgradeSlot } = _;
const commercialFeaturesMock = commercialFeatures;
const isUserLoggedIn = isUserLoggedIn_;
const getAdvertById = getAdvertById_;
const getBreakpoint = getBreakpoint_;
const refreshAdvert = refreshAdvert_;

const mockHeight = (height: number) => {
	// this is an issue with fastdom's typing of measure: () => Promise<void>
	jest.spyOn(fastdom, 'measure').mockReturnValue(
		(Promise.resolve(height) as unknown) as Promise<void>,
	);
};

const generateInnerHtmlWithAdSlot = () => {
	document.body.innerHTML = `
            <div class="js-comments">
                <div class="content__main-column">
                    <div class="js-discussion__ad-slot">
                        <div id="dfp-ad--comments"
                            class="js-ad-slot ad-slot ad-slot--comments js-sticky-mpu
                            data-mobile="1,1|2,2|300,250|300,274|fluid"
                            data-desktop="1,1|2,2|300,250|300,274|fluid">
                        </div>
                    </div>
                </div>
            </div>`;
};

const createTestAdvert = (testAdvert: Partial<Advert>): Advert =>
	({ ...testAdvert } as Advert);

const getElement = (selector: string): Element =>
	document.querySelector(selector) as Element;

describe('createCommentSlots', () => {
	beforeEach(() => {
		mocked(isUserLoggedIn).mockReturnValue(false);
		commercialFeaturesMock.commentAdverts = true;
		document.body.innerHTML = `<div class="js-comments">
            <div class="content__main-column">
                <div class="js-discussion__ad-slot"></div></div></div>`;
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
		fakeMediator.removeAllListeners();
	});

	it('should return an ad slot with the correct sizes', () => {
		const commentMpu = createCommentSlots(false)[0];
		const commentDmpu = createCommentSlots(true)[0];
		expect(commentMpu.getAttribute('data-desktop')).toBe(
			'1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid',
		);
		expect(commentMpu.getAttribute('data-mobile')).toBe(
			'1,1|2,2|300,197|300,250|300,274|fluid',
		);
		expect(commentDmpu.getAttribute('data-desktop')).toBe(
			'1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600',
		);
		expect(commentDmpu.getAttribute('data-mobile')).toBe(
			'1,1|2,2|300,197|300,250|300,274|fluid',
		);
	});

	it('should add js-sticky-mpu to the class list', () => {
		const commentMpu = createCommentSlots(false)[0];
		const commentDmpu = createCommentSlots(true)[0];
		expect(commentMpu.classList).toContain('js-sticky-mpu');
		expect(commentDmpu.classList).toContain('js-sticky-mpu');
	});
});

describe('maybeUpgradeSlot', () => {
	beforeEach(() => {
		generateInnerHtmlWithAdSlot();
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});

	it('should upgrade the MPU to a DMPU where necessary', () => {
		const advert = createTestAdvert({
			sizes: { desktop: [[300, 250]] },
			slot: { defineSizeMapping: jest.fn() },
		});
		expect(advert.sizes.desktop).toEqual([[300, 250]]);

		maybeUpgradeSlot(advert, getElement('.js-discussion__ad-slot'));
		expect(advert.sizes.desktop).toEqual([
			[300, 250],
			[300, 600],
			[160, 600],
		]);
		expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
	});

	it('should not alter the slot if the slot is already a DMPU', () => {
		const advert = createTestAdvert({
			sizes: {
				desktop: [
					[160, 600],
					[300, 250],
					[300, 600],
				],
			},
			slot: { defineSizeMapping: jest.fn() },
		});
		expect(advert.sizes.desktop).toEqual([
			[160, 600],
			[300, 250],
			[300, 600],
		]);

		maybeUpgradeSlot(advert, getElement('.js-discussion__ad-slot'));
		expect(advert.sizes.desktop).toEqual([
			[160, 600],
			[300, 250],
			[300, 600],
		]);
		expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(0);
	});
});

describe('runSecondStage', () => {
	beforeEach(() => {
		generateInnerHtmlWithAdSlot();
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
	});

	it('should upgrade a MPU to DMPU and immediately refresh the slot', () => {
		const adSlotContainer = getElement('.js-discussion__ad-slot');
		const commentMainColumn = getElement(
			'.js-comments .content__main-column',
		);
		const advert = createTestAdvert({
			sizes: { desktop: [[300, 250]] },
			slot: { defineSizeMapping: jest.fn() },
		});
		mocked(getAdvertById).mockReturnValue(advert);

		runSecondStage(commentMainColumn, adSlotContainer);
		expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
		expect(mocked(getAdvertById).mock.calls).toEqual([
			['dfp-ad--comments'],
		]);
		expect(refreshAdvert).toHaveBeenCalledTimes(1);
	});

	it('should not upgrade a DMPU yet still immediately refresh the slot', () => {
		const adSlotContainer = getElement('.js-discussion__ad-slot');
		const commentMainColumn = getElement(
			'.js-comments .content__main-column',
		);
		const advert = createTestAdvert({
			sizes: { desktop: [[300, 250]] },
			slot: { defineSizeMapping: jest.fn() },
		});
		mocked(getAdvertById).mockReturnValue(advert);

		runSecondStage(commentMainColumn, adSlotContainer);
		expect(advert.slot.defineSizeMapping).toHaveBeenCalledTimes(1);
		expect(mocked(getAdvertById).mock.calls).toEqual([
			['dfp-ad--comments'],
		]);
		expect(refreshAdvert).toHaveBeenCalledTimes(1);
	});
});

describe('initCommentAdverts', () => {
	beforeEach(() => {
		mocked(isUserLoggedIn).mockReturnValue(false);
		commercialFeaturesMock.commentAdverts = true;
		document.body.innerHTML = `<div class="js-comments">
            <div class="content__main-column">
                <div class="js-discussion__ad-slot"></div></div></div>`;
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.resetAllMocks();
		fakeMediator.removeAllListeners();
	});

	it('should return false if commentAdverts are switched off', (done) => {
		commercialFeaturesMock.commentAdverts = false;
		void initCommentAdverts().then((result) => {
			expect(result).toBe(false);
			done();
		});
	});

	it('should return false if there is no comments ad slot container', (done) => {
		document.body.innerHTML = `<div class="js-comments">
                <div class="content__main-column"></div></div>`;
		void initCommentAdverts().then((result) => {
			expect(result).toBe(false);
			done();
		});
	});

	it('should return false if on mobile', (done) => {
		document.body.innerHTML = `<div class="js-comments">
                <div class="content__main-column"></div></div>`;

		mocked(getBreakpoint).mockReturnValue('mobile');

		void initCommentAdverts().then((result) => {
			expect(result).toBe(false);
			done();
		});
	});

	it('should insert a DMPU slot if there is enough space', (done) => {
		mockHeight(800); // at 800px we insert a DMPU regardless
		void initCommentAdverts().then(() => {
			fakeMediator.emit('modules:comments:renderComments:rendered');
			fakeMediator.once('page:commercial:comments', () => {
				const adSlot = getElement('.js-ad-slot');
				expect(addSlot).toHaveBeenCalledTimes(1);
				expect(adSlot.getAttribute('data-desktop')).toBe(
					'1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600',
				);
				done();
			});
		});
	});

	it('should insert a DMPU slot if there is space, and the user is logged in', (done) => {
		mockHeight(600); // at 600px we can insert a DMPU if the user is logged in
		mocked(isUserLoggedIn).mockReturnValue(true);
		void initCommentAdverts().then(() => {
			fakeMediator.emit('modules:comments:renderComments:rendered');
			fakeMediator.once('page:commercial:comments', () => {
				const adSlot = getElement('.js-ad-slot');
				expect(addSlot).toHaveBeenCalledTimes(1);
				expect(adSlot.getAttribute('data-desktop')).toBe(
					'1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid|300,600|160,600',
				);
				done();
			});
		});
	});

	it('should insert an MPU if the user is logged in, and the DMPU will not fit', (done) => {
		mockHeight(300); // at 300px we can insert an MPU if the user is logged in
		mocked(isUserLoggedIn).mockReturnValue(true);
		void initCommentAdverts().then(() => {
			fakeMediator.emit('modules:comments:renderComments:rendered');
			fakeMediator.once('page:commercial:comments', () => {
				const adSlot = getElement('.js-ad-slot');
				expect(addSlot).toHaveBeenCalledTimes(1);
				expect(adSlot.getAttribute('data-desktop')).toBe(
					'1,1|2,2|300,250|300,274|620,1|620,350|550,310|fluid',
				);
				done();
			});
		});
	});

	it('should otherwise set the EventListener that can insert the slot', (done) => {
		const spyOn = jest.spyOn(fakeMediator, 'on');
		mockHeight(300);
		void initCommentAdverts()
			.then((result) => {
				fakeMediator.emit('modules:comments:renderComments:rendered');
				expect(result).toBe(true);
			})
			.then(() => {
				expect(spyOn.mock.calls[0]).toEqual(
					expect.arrayContaining([
						'discussion:comments:get-more-replies',
					]),
				);
				done();
			});
	});

	it('should always set the EventListener', (done) => {
		const spyOn = jest.spyOn(fakeMediator, 'on');
		mockHeight(800);
		void initCommentAdverts()
			.then((result) => {
				fakeMediator.emit('modules:comments:renderComments:rendered');
				expect(result).toBe(true);
			})
			.then(() => {
				expect(spyOn.mock.calls[0]).toEqual(
					expect.arrayContaining([
						'discussion:comments:get-more-replies',
					]),
				);
				done();
			});
	});
});
