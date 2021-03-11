// @flow

import {
    SET_BACKGROUND_DATA
} from './actionTypes';
import {
    extractBackgroundProperties
} from './functions';

/**
 * Extract background-relevant information (if existing) from serialized background properties
 * and update the state of room-background accordingly.
 *
 * @param {string} serializedBackgroundData - Serialized background properties ('|' separated).
 * @private
 * @returns {Function}
 */
export function updateBackgroundData(serializedBackgroundData) {
    return (dispatch: Dispatch<any>) => {

        const backgroundDataObject = extractBackgroundProperties(serializedBackgroundData);

        return dispatch(setBackgroundData({
            backgroundColor: backgroundDataObject.backgroundColor,
            backgroundImageUrl: backgroundDataObject.backgroundImageUrl
        }));
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
