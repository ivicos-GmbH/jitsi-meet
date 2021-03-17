// @flow

import { getBlurEffect } from '../../blur';
import { createForegroundOverlay } from '../../stream-effects/foreground-overlay';
import { createScreenshotCaptureEffect } from '../../stream-effects/screenshot-capture';

import logger from './logger';

/**
 * Loads the enabled stream effects.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promsie} - A Promise which resolves when all effects are created.
 */
export default function loadEffects(store: Object): Promise<any> {
    const state = store.getState();
    const foregroundOverlay = state['features/foreground-overlay'];

    const blurPromise = state['features/blur'].blurEnabled
        ? getBlurEffect()
            .catch(error => {
                logger.error('Failed to obtain the blur effect instance with error: ', error);

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
    const screenshotCapturePromise = state['features/screenshot-capture']?.capturesEnabled
        ? createScreenshotCaptureEffect(state)
            .catch(error => {
                logger.error('Failed to obtain the screenshot capture effect effect instance with error: ', error);

                return Promise.resolve();
            })
        : Promise.resolve();

    return Promise.all([ blurPromise, foregroundOverlayPromise, screenshotCapturePromise ]);
}
