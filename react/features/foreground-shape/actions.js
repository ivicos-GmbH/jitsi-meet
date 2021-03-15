// @flow

import { getLocalVideoTrack } from '../../features/base/tracks';

import { SET_TRANSPARENT_FOREGROUND } from './actionTypes';
import { getForegroundImageEffect } from './functions';
import logger from './logger';

/**
* Signals the local participant is changing its foreground shape image.
*
* @param {boolean} foregroundImageUrl - URL of the transparent foreground image ('' if none).
* @returns {Promise}
*/
export function setForegroundImage(foregroundImageUrl: string) {
    return function(dispatch: (Object) => Object, getState: () => any) {
        const state = getState();

        if (state['features/foreground-shape']?.foregroundImageUrl !== foregroundImageUrl) {
            const { jitsiTrack } = getLocalVideoTrack(state['features/base/tracks']);

            return getForegroundImageEffect(foregroundImageUrl)
                .then(foregroundEffectInstance =>
                    jitsiTrack.setEffect(foregroundImageUrl === '' ? undefined : foregroundEffectInstance)
                        .then(() => {
                            dispatch(newForegroundSet(foregroundImageUrl));
                        })
                        .catch(error => {
                            dispatch(newForegroundSet(''));
                            logger.error('setEffect failed with error:', error);
                        })
                )
                .catch(error => {
                    dispatch(newForegroundSet(''));
                    logger.error('newForegroundSet failed with error:', error);
                });
        }

        return Promise.resolve();
    };
}

/**
 * Signals the local participant that a new transparent foreground has been set.
 *
 * @param {string} value - URL of the transparent foreground image ('' if none).
 * @returns {{
 *      type: SET_TRANSPARENT_FOREGROUND
 * }}
 */
export function newForegroundSet(value) {
    return {
        type: SET_TRANSPARENT_FOREGROUND,
        value
    };
}
