// @flow

import type { Dispatch } from 'redux';

import {
    CONFIGURE_SPEAKER_STATS_COLLECT
} from './actionTypes';
import {
    clearSpeakerStatsInterval,
    createSpeakerStatsInterval,
    fetchDetailedSpeakerStats
} from './functions';

declare var APP: Object;

/**
 * Fetch speaker stats and send them back to the client.
 *
 * @returns {void}
 */
export function getSpeakerStats() {
    fetchDetailedSpeakerStats();
}

/**
 * Action triggering timer to regularly collect speaker stats at a regular interval.
 *
 * @param {number} intervalRequest - Interval between two consecutive request (ms).
 * @returns {Function}
 */
export function startSpeakerStatsCollect(intervalRequest: number) {
    APP.API.notifySpeakerStatsCollectStarted(intervalRequest);

    return async (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState()['features/speaker-stats'];

        clearSpeakerStatsInterval(state?.repeatedStatsRequest);
        const repeatedStatsRequest = createSpeakerStatsInterval(intervalRequest);

        if (repeatedStatsRequest) {
            dispatch(updateSpeakerStatsState({
                repeatedStatsRequest,
                intervalMs: intervalRequest
            }));
        }
    };
}

/**
 * Action stopping the timer regularly collecting speaker stats at a regular interval.
 *
 * @returns {Function}
 */
export function stopSpeakerStatsCollect() {
    APP.API.notifySpeakerStatsCollectStopped();

    return async (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState()['features/speaker-stats'];

        clearSpeakerStatsInterval(state?.repeatedStatsRequest);
        dispatch(clearSpeakerStatsState());
    };
}

/**
 * Action used to update the configuration for the speaker stats event.
 *
 * @param {Object} value - The custom data to be set.
 * @returns {Object}
 */
function updateSpeakerStatsState(value) {
    return {
        type: CONFIGURE_SPEAKER_STATS_COLLECT,
        value
    };
}

/**
 * Action used to clear the configuration for the speaker stats event.
 *
 * @returns {Object}
 */
function clearSpeakerStatsState() {
    return {
        type: CONFIGURE_SPEAKER_STATS_COLLECT,
        value: {
            repeatedStatsRequest: undefined,
            intervalMs: undefined
        }
    };
}
