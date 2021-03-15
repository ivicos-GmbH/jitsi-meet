// @flow

import { ReducerRegistry } from '../base/redux';

import { SET_TRANSPARENT_FOREGROUND } from './actionTypes';

/**
 * The name of the redux store/state property which is the root of the redux
 * state of the feature {@code room-background}.
 */
const STORE_NAME = 'features/foreground-shape';

const DEFAULT_STATE = {
    /**
     * The custom transparent foreground image
     *
     * @public
     * @type {string}
     */
    foregroundImageUrl: ''
};

ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {

    switch (action.type) {
    case SET_TRANSPARENT_FOREGROUND: {
        const { foregroundImageUrl } = action.value;

        return {
            foregroundImageUrl
        };
    }
    }

    return state;
});
