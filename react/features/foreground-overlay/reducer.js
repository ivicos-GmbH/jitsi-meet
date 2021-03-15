// @flow

import { ReducerRegistry } from '../base/redux';

import { SET_FOREGROUND_OVERLAY } from './actionTypes';

/**
 * The name of the redux store/state property which is the root of the redux
 * state of the feature {@code foreground-overlay}.
 */
const STORE_NAME = 'features/foreground-overlay';

const DEFAULT_STATE = {
    /**
     * The custom overlay foreground image
     *
     * @public
     * @type {string}
     */
    overlayImageUrl: '',

    /**
     * The custom overlay color (if no overlay image is given)
     *
     * @public
     * @type {string}
     */
    overlayColor: '',

    /**
     * Mode chosen for the overlay : example 'fusion' if given background transparent,
     * 'circle' if a shape should be manually extracted from the overlay (default)
     *
     * @public
     * @type {string}
     */
    mode: ''
};

ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {

    switch (action.type) {
    case SET_FOREGROUND_OVERLAY: {

        return {
            ...state,
            ...action.value
        };
    }
    }

    return state;
});
