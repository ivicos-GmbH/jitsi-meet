import { ReducerRegistry } from '../base/redux';

import {
    SET_NOISE_GATE_ENABLED
} from './actionTypes';

const DEFAULT_STATE = {
    enabled: false
};

/**
 * Reduces the Redux actions of the feature features/noise-gate.
 */
ReducerRegistry.register('features/noise-gate', (state = DEFAULT_STATE, action) => {
    const { enabled } = action;

    switch (action.type) {
    case SET_NOISE_GATE_ENABLED:
        return {
            ...state,
            enabled
        };
    default:
        return state;
    }
});
