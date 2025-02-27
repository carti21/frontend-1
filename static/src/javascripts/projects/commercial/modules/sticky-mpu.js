import config from '../../../lib/config';
import mediator from '../../../lib/mediator';
import fastdom from '../../../lib/fastdom-promise';
import { Sticky } from '../../common/modules/ui/sticky';
import { register, unregister } from './messenger';

const noSticky = !!(
    document.documentElement &&
    document.documentElement.classList.contains('has-no-sticky')
);
let stickyElement;
let stickySlot;

const onResize = (specs, _, iframe) => {
    if (stickySlot.contains(iframe)) {
        unregister('resize', onResize);
        stickyElement.updatePosition();
    }
};

const isStickyMpuSlot = (adSlot) => {
    const dataName = adSlot.dataset.name;
    return dataName === 'comments' || dataName === 'right';
};

const stickyCommentsMpu = (adSlot) => {
    if (isStickyMpuSlot(adSlot)) {
        stickySlot = adSlot;
    }

    const referenceElement = document.querySelector(
        '.js-comments'
    );

    if (!referenceElement || !adSlot) {
        return;
    }

    fastdom
        .measure(() => referenceElement.offsetHeight - 600)
        .then(newHeight =>
            fastdom.mutate(() => {
                (adSlot.parentNode).style.height = `${newHeight}px`;
            })
        )
        .then(() => {
            if (noSticky) {
                stickyElement = new Sticky(adSlot);
                stickyElement.init();
                register('resize', onResize);
            }
            mediator.emit('page:commercial:sticky-comments-mpu');
        });
};

stickyCommentsMpu.whenRendered = new Promise(resolve => {
    mediator.on('page:commercial:sticky-comments-mpu', resolve);
});

const stickyMpu = (adSlot) => {
    if (isStickyMpuSlot(adSlot)) {
        stickySlot = adSlot;
    }

    const referenceElement = document.querySelector(
        ['.js-article__body:not([style*="display: none;"])',
        '.js-liveblog-body-content:not([style*="display: none;"])'].join(', ')
    );

    // Fixes overlapping ad issue on liveblogs by Setting to max ad height.
    const stickyPixelBoundary = config.get('page.isLiveBlog') ? 600 : 300;

    if (
        !referenceElement ||
        !adSlot ||
        config.get('page.hasShowcaseMainElement')
    ) {
        return;
    }

    fastdom
        .measure(() => referenceElement.offsetTop + stickyPixelBoundary)
        .then(newHeight =>
            fastdom.mutate(() => {
                (adSlot.parentNode).style.height = `${newHeight}px`;
            })
        )
        .then(() => {
            if (noSticky) {
                // if there is a sticky 'paid by' band move the sticky mpu down so it will be always visible
                const options = config.get('page.isPaidContent')
                    ? {
                          top: 43,
                      }
                    : {};
                stickyElement = new Sticky(adSlot, options);
                stickyElement.init();
                register('resize', onResize);
            }
            mediator.emit('page:commercial:sticky-mpu');
        });
};

stickyMpu.whenRendered = new Promise(resolve => {
    mediator.on('page:commercial:sticky-mpu', resolve);
});

export { stickyMpu, stickyCommentsMpu };
