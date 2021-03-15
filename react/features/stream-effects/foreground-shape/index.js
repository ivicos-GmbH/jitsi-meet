// @flow

import JitsiStreamForegroundEffect from './JitsiStreamForegroundEffect';

/**
 * Creates a new instance of JitsiStreamForegroundEffect.
 *
 * @param {string} foregroundImageUrl - Image URL of the foreground.
 * @returns {Promise<JitsiStreamForegroundEffect>}
 */
export async function createForegroundImage(foregroundImageUrl) {

    return new JitsiStreamForegroundEffect(foregroundImageUrl);
}
