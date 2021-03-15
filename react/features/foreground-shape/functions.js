// @flow

import { getJitsiMeetGlobalNS, loadScript } from '../base/util';

/**
 * Returns promise that resolves with the set foreground effect instance.
 *
 * @param {boolean} transparentImageUrl - URL of the transparent foreground image ('' if none).
 * @returns {Promise<JitsiStreamForegroundEffect>} - Resolves with the blur effect instance.
 */
export function getForegroundImageEffect(transparentImageUrl) {
    const ns = getJitsiMeetGlobalNS();

    if (ns.effects && ns.effects.createForegroundImage) {
        return ns.effects.createForegroundImage(transparentImageUrl);
    }

    return loadScript('libs/foreground-shape-effect.min.js')
        .then(() => ns.effects.createForegroundImage(transparentImageUrl));
}
