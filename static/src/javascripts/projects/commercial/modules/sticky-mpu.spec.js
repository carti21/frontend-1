import mediator from '../../../lib/mediator';
import fastdom from '../../../lib/fastdom-promise';
import { stickyMpu, stickyCommentsMpu } from './sticky-mpu';

jest.mock('../../../lib/raven');

// Workaround to fix issue where dataset is missing from jsdom, and solve the
// 'cannot set property [...] which has only a getter' TypeError
Object.defineProperty(HTMLElement.prototype, 'dataset', {
    writable: true,
    value: {},
});

const mockHeight = (height) => {
    jest.spyOn(fastdom, 'measure').mockReturnValue(Promise.resolve(height));
};

describe('Sticky MPU', () => {
    const domSnippet = `
        <div class="content__article-body js-article__body"><div>
    `;

    const adSlotRight =
        '<div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>';

    beforeEach(() => {
        jest.resetAllMocks();

        if (document.body) {
            document.body.innerHTML = `${domSnippet}<div class="aside-slot-container" aria-hidden="true">${adSlotRight}</div>`;
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(stickyMpu).toBeDefined();
        expect(stickyMpu.whenRendered).toBeDefined();
    });

    it('should resize the parent container', done => {
        mockHeight(8000);
        const targetSlot = (document.querySelector(
            '.js-ad-slot'
        ));
        targetSlot.dataset = {
            name: targetSlot.getAttribute('data-name') || '',
        };
        mediator.once('page:commercial:sticky-mpu', () => {
            const container = (document.querySelector(
                '.aside-slot-container'
            ));
            expect(container.style.height).toBe('8000px');
            done();
        });
        stickyMpu(targetSlot);
    });
});

describe('Sticky Comments MPU', () => {
    const domSnippet = `
        <div class="js-comments"><div>
    `;

    const adSlotComments =
        '<div id="dfp-ad--comments" class="js-ad-slot ad-slot ad-slot--comments" data-name="comments" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>';

    beforeEach(() => {
        jest.resetAllMocks();

        if (document.body) {
            document.body.innerHTML = `${domSnippet}<div class="aside-slot-container" aria-hidden="true">${adSlotComments}</div>`;
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(stickyCommentsMpu).toBeDefined();
        expect(stickyCommentsMpu.whenRendered).toBeDefined();
    });

    it('should resize the parent container', done => {
        mockHeight(10000);
        const targetSlot = (document.querySelector(
            '.js-ad-slot'
        ));
        targetSlot.dataset = {
            name: targetSlot.getAttribute('data-name') || '',
        };
        mediator.once('page:commercial:sticky-comments-mpu', () => {
            const container = (document.querySelector(
                '.aside-slot-container'
            ));
            expect(container.style.height).toBe('10000px');
            done();
        });
        stickyCommentsMpu(targetSlot);
    });
});
