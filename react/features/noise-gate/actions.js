/* eslint-disable lines-around-comment */

import { getLocalJitsiAudioTrack } from '../base/tracks';
// import { NOTIFICATION_TIMEOUT_TYPE, showErrorNotification, showWarningNotification } from '../notifications';
import { NoiseGateEffect } from '../stream-effects/noisegate/noiseGateEffect';

import { SET_NOISE_GATE_ENABLED } from './actionTypes';
import { canEnableNoiseGate, isNoiseGateEnabled } from './functions';
import logger from './logger';

/**
 * Updates the noise gate active state.
 *
 * @param {boolean} enabled - Is noise gate enabled.
 * @returns {{
 *      type: SET_NOISE_GATE_STATE,
 *      enabled: boolean
 * }}
 */
export function setNoiseGateEnabledState(enabled) {
    console.log('ENABLED state', enabled);

    return {
        type: SET_NOISE_GATE_ENABLED,
        enabled
    };
}

/**
 *  Enabled/disable noise gate depending on the current state.
 *
 * @returns {Function}
 */
export function toggleNoiseGate() {
    return (dispatch, getState) => {
        if (isNoiseGateEnabled(getState())) {
            dispatch(setNoiseGateEnabled(false));
        } else {
            dispatch(setNoiseGateEnabled(true));
        }
    };
}

/**
 * Attempt to enable or disable noise gate using the {@link NoiseGateEffect}.
 *
 * @param {boolean} enabled - Enable or disable noise gate.
 *
 * @returns {Function}
 */
export function setNoiseGateEnabled(enabled) {
    console.log('ENABLED', enabled);

    return async (dispatch, getState) => {
        const state = getState();

        const localAudio = getLocalJitsiAudioTrack(state);
        const noiseGateEnabled = isNoiseGateEnabled(state);

        logger.info(`Attempting to set noise gate enabled state: ${enabled}`);

        if (!localAudio) {
            logger.warn('Can not apply noise gate without any local track active.');

            return;
        }
        try {
            console.log('ENABLED TRIED', state);
            if (enabled && !noiseGateEnabled) {
                if (!canEnableNoiseGate(state, dispatch, localAudio)) {
                    return;
                }

                await localAudio.setEffect(new NoiseGateEffect());
                dispatch(setNoiseGateEnabledState(true));
                logger.info('Noise Gate enabled');
            } else if (!enabled && noiseGateEnabled) {
                await localAudio.setEffect(undefined);
                dispatch(setNoiseGateEnabledState(false));
                logger.info('Noise Gate disabled');
            } else {
                logger.warn(`Noise gate enabled state already: ${enabled}`);
            }
        } catch (error) {
            logger.error(
                `Failed to set noise gate enabled to: ${enabled}`,
                error
            );
        }
    };
}
