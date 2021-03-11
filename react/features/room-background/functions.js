// @flow

/**
 * Extract background-relevant information if existing from serialized background properties.
 *
 * @param {Object} serializedBackgroundProperties - Serialized background properties ('|' separated).
 * @private
 * @returns {Object}
 */
export function extractBackgroundProperties(serializedBackgroundProperties) {
    if (!serializedBackgroundProperties) {
        return {
            backgroundLastUpdate: undefined,
            backgroundColor: undefined,
            backgroundImageUrl: undefined
        };
    }
    const unparsedBackgroundData = serializedBackgroundProperties.split('|');

    return {
        backgroundLastUpdate: unparsedBackgroundData[0],
        backgroundColor: unparsedBackgroundData[1],
        backgroundImageUrl: unparsedBackgroundData[2]
    };
}
