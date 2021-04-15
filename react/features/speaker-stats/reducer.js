// @flow

import { ReducerRegistry } from '../base/redux';

import {
    CONFIGURE_SPEAKER_STATS_COLLECT
} from './actionTypes';

/**
 * The name of the redux store/state property which is the root of the redux
 * state of the feature {@code speaker-stats}.
 */
const STORE_NAME = 'features/speaker-stats';

const DEFAULT_STATE = {
    /**
     * Repeated speaker stats interval object
     *
     * @public
     * @type {Function}
     */
    repeatedStatsRequest: undefined,

    /**
     * Interval of the repeated request (ms)
     *
     * @public
     * @type {number}
     */
    intervalMs: undefined
};

/**
 * Reduces redux actions for the purposes of the feature {@code speaker-stats}.
 */
ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case CONFIGURE_SPEAKER_STATS_COLLECT: {
        const {
            repeatedStatsRequest,
            intervalMs
        } = action.value;

        return {
            repeatedStatsRequest,
            intervalMs
        };
    }
    }

    return state;
});
