// @flow

import { ReducerRegistry } from '../base/redux';

import { RESET_SHARED_VIDEO_STATUS, SET_SHARED_VIDEO_STATUS, SET_DISABLE_BUTTON } from './actionTypes';

const initialState = {};

/**
 * Reduces the Redux actions of the feature features/shared-video.
 */
ReducerRegistry.register('features/shared-video', (state = initialState, action) => {
    const { videoUrl, status, time, ownerId, disabled, muted, previousOwnerId } = action;

    switch (action.type) {
    case RESET_SHARED_VIDEO_STATUS:
        return initialState;
    case SET_SHARED_VIDEO_STATUS:
        const newState = {
            ...state,
            muted,
            ownerId,
            status,
            time,
            videoUrl,
            previousOwnerId
        }

        return newState;

    case SET_DISABLE_BUTTON:
        return {
            ...state,
            disabled
        };

    default:
        return state;
    }
});
