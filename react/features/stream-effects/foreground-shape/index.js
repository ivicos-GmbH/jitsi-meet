// @flow

import JitsiStreamForegroundEffect from './JitsiStreamForegroundEffect';

/**
 * Creates a new instance of JitsiStreamForegroundEffect.
 *
 * @returns {Promise<JitsiStreamForegroundEffect>}
 */
export async function createForegroundImage(foregroundImageUrl) {

    return new JitsiStreamForegroundEffect(foregroundImageUrl);
}
