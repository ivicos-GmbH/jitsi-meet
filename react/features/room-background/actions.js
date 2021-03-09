// @flow

import {
    SET_BACKGROUND_DATA
} from './actionTypes';
import {
    getLatestBackground,
    extractBackgroundProperties
} from './functions';

/**
 * When entering the conference, fetch existing background data stored as other
 * participants properties. The last background set by a participant will be taken.
 * If none is found, the background properties will be undefined.
 *
 * @returns {Function}
 */
export function fetchExistingBackgroundData() {
    return async function(dispatch: Function, getState: Function) {
        const state = getState();
        const participantsState = state['features/base/participants'];
        const conferenceState = state['features/base/conference'].conference;
        const { backgroundColor, backgroundImageUrl } = getLatestBackground(participantsState, conferenceState);

        return dispatch(setBackgroundData({
            backgroundColor,
            backgroundImageUrl
        }));
    };
}

/**
 * Extract background-relevant information (if existing) from serialized background properties
 * and update the state of room-background accordingly.
 *
 * @param {string} serializedBackgroundData - Serialized background properties ('|' separated).
 * @private
 * @returns {Function}
 */
export function updateBackgroundData(serializedBackgroundData) {
    return async function(dispatch: Function) {

        const backgroundDataObject = extractBackgroundProperties(serializedBackgroundData);

        if (backgroundDataObject.backgroundColor || backgroundDataObject.backgroundImageUrl) {
            return dispatch(setBackgroundData({
                backgroundColor: backgroundDataObject.backgroundColor,
                backgroundImageUrl: backgroundDataObject.backgroundImageUrl
            }));
        }
    };
}

/**
 * Action used to set the background image/color.
 *
 * @param {Object} value - The custom data to be set.
 * @returns {Object}
 */
function setBackgroundData(value) {
    return {
        type: SET_BACKGROUND_DATA,
        value
    };
}
