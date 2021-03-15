// @flow

import { getJitsiMeetGlobalNS, loadScript } from '../base/util';

/**
 * Returns promise that resolves with the set foreground overlay effect instance.
 *
* @param {string} overlayImageUrl - URL of the foreground shape ('' if none).
* @param { string } overlayColor - Color of the overlay if no image is given.
* @param { string } mode - Mode chosen for the overlay : Example 'fusion' if given background transparent,
* 'circle' if a shape should be manually extracted from the overlay (default).
 * @returns {Promise<JitsiStreamForegroundEffect>} - Resolves with the foreground overlay effect instance.
 */
export function getForegroundOverlayEffect(overlayImageUrl, overlayColor, mode) {
    const ns = getJitsiMeetGlobalNS();

    if (ns.effects && ns.effects.createForegroundOverlay) {
        return ns.effects.createForegroundOverlay(overlayImageUrl, overlayColor, mode);
    }

    return loadScript('libs/foreground-overlay-effect.min.js')
        .then(() => ns.effects.createForegroundOverlay(overlayImageUrl, overlayColor, mode));
}
