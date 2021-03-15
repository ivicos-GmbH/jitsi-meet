// @flow

import { getJitsiMeetGlobalNS, loadScript } from '../base/util';

/**
 * Returns promise that resolves with the blur effect instance.
 *
 * @returns {Promise<JitsiStreamForegroundEffect>} - Resolves with the blur effect instance.
 */
export function getForegroundImageEffect(transparentImageUrl) {
    const ns = getJitsiMeetGlobalNS();

    if (ns.effects && ns.effects.createForegroundImage) {
        return ns.effects.createForegroundImage(transparentImageUrl);
    }

    return loadScript('libs/foreground-shape-effect.min.js').then(() => ns.effects.createForegroundImage(transparentImageUrl));
}
