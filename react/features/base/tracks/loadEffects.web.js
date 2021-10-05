// @flow

import { createForegroundOverlay } from '../../stream-effects/foreground-overlay';
import { createVirtualBackgroundEffect } from '../../stream-effects/virtual-background';

import logger from './logger';

/**
 * Loads the enabled stream effects.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promsie} - A Promise which resolves when all effects are created.
 */
export default function loadEffects(store: Object): Promise<any> {
    const state = store.getState();
    const virtualBackground = state['features/virtual-background'];
    const foregroundOverlay = state['features/foreground-overlay'];

    const backgroundPromise = virtualBackground.backgroundEffectEnabled
        ? createVirtualBackgroundEffect(virtualBackground)
            .catch(error => {
                logger.error('Failed to obtain the background effect instance with error: ', error);

                return Promise.resolve();
            })
        : Promise.resolve();
    const foregroundOverlayPromise = foregroundOverlay
        ? createForegroundOverlay(
            foregroundOverlay?.overlayImageUrl,
            foregroundOverlay?.overlayColor,
            foregroundOverlay?.mode
        )
            .catch(error => {
                logger.error('Failed to obtain the foreground overlay effect instance with error: ', error);

                return Promise.resolve();
            })
        : Promise.resolve();

    return Promise.all([ backgroundPromise, foregroundOverlayPromise ]);
}
