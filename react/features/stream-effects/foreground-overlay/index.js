// @flow

import JitsiStreamForegroundOverlayEffect from './JitsiStreamForegroundOverlayEffect';

/**
 * Creates a new instance of JitsiStreamForegroundOverlayEffect.
 *
 * @param {string} overlayImageUrl - URL of the foreground shape ('' if none).
 * @param { string } overlayColor - Color of the overlay if no image is given.
 * @param { string } mode - Mode chosen for the overlay : Example 'fusion' if given background transparent,
 * 'circle' if a shape should be manually extracted from the overlay (default).
 * @returns {Promise<JitsiStreamForegroundOverlayEffect>}
 */
export async function createForegroundOverlay(overlayImageUrl: string, overlayColor: string, mode: string) {

    return new JitsiStreamForegroundOverlayEffect(overlayImageUrl, overlayColor, mode);
}
