// @flow

import type { Dispatch } from 'redux';

import {
    INIT_SEARCH,
    INIT_UPDATE_STATS,
    UPDATE_STATS,
    INIT_REORDER_STATS,
    CONFIGURE_SPEAKER_STATS_COLLECT
} from './actionTypes';
import {
    clearSpeakerStatsInterval,
    createSpeakerStatsInterval
} from './functions';

declare var APP: Object;

/**
 * Starts a search by criteria.
 *
 * @param {string | null} criteria - The search criteria.
 * @returns {Object}
 */
export function initSearch(criteria: string | null) {
    return {
        type: INIT_SEARCH,
        criteria
    };
}

/**
 * Gets the new stats and triggers update.
 *
 * @param {Function} getSpeakerStats - Function to get the speaker stats.
 * @returns {Object}
 */
export function initUpdateStats(getSpeakerStats: Function) {
    return {
        type: INIT_UPDATE_STATS,
        getSpeakerStats
    };
}

/**
 * Updates the stats with new stats.
 *
 * @param {Object} stats - The new stats.
 * @returns {Object}
 */
export function updateStats(stats: Object) {
    return {
        type: UPDATE_STATS,
        stats
    };
}

/**
 * Initiates reordering of the stats.
 *
 * @returns {Object}
 */
export function initReorderStats() {
    return {
        type: INIT_REORDER_STATS
    };
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
