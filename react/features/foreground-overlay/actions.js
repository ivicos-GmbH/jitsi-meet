// @flow

import { getLocalVideoTrack } from '../base/tracks';
import { createForegroundOverlay } from '../stream-effects/foreground-overlay';

import { SET_FOREGROUND_OVERLAY } from './actionTypes';
import logger from './logger';

/**
* Signals the local participant is changing its foreground overlay.
*
* @param {string} overlayOptions - Options defining the overlay wished by the user.
* @returns {Promise}
*/
export function setForegroundOverlay(overlayOptions: Object) {
    return function(dispatch: (Object) => Object, getState: () => any) {
        const state = getState();

        const overlayCombinedOptions = {
            ...state['features/foreground-overlay'],
            ...overlayOptions
        };

        if (state['features/foreground-overlay'] !== overlayOptions) {

            const tracksState = getLocalVideoTrack(state['features/base/tracks']);
            const jitsiTrack = tracksState?.jitsiTrack;

            if (!jitsiTrack) {
                return;
            }

            return createForegroundOverlay(
                overlayCombinedOptions.overlayImageUrl,
                overlayCombinedOptions.overlayColor,
                overlayCombinedOptions.mode)
                .then(foregroundOverlayEffectInstance =>
                    jitsiTrack.setEffect(
                        overlayCombinedOptions.overlayImageUrl === ''
                        && overlayCombinedOptions.overlayColor === ''
                            ? undefined : foregroundOverlayEffectInstance
                    )
                        .then(() => {
                            dispatch(newForegroundOverlaySet(
                                overlayCombinedOptions.overlayImageUrl,
                                overlayCombinedOptions.overlayColor,
                                overlayCombinedOptions.mode));
                        })
                        .catch(error => {
                            dispatch(newForegroundOverlaySet('', '', ''));
                            logger.error('setEffect failed with error:', error);
                        })
                )
                .catch(error => {
                    dispatch(newForegroundOverlaySet('', '', ''));
                    logger.error('newForegroundOverlaySet failed with error:', error);
                });
        }

        return Promise.resolve();
    };
}

/**
 * Signals the local participant that a new foreground overlay has been set.
 *
* @param {string} overlayImageUrl - URL of the foreground shape ('' if none).
* @param { string } overlayColor - Color of the overlay if no image is given.
* @param { string } mode - Mode chosen for the overlay : Example 'fusion' if given background transparent,
* 'circle' if a shape should be manually extracted from the overlay (default).
 * @returns {{
 *      type: SET_FOREGROUND_OVERLAY
 * }}
 */
export function newForegroundOverlaySet(overlayImageUrl: string, overlayColor: string, mode: string) {
    const value = {
        overlayImageUrl,
        overlayColor,
        mode
    };

    return {
        type: SET_FOREGROUND_OVERLAY,
        value
    };
}