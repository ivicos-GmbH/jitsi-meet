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
            backgroundColor: undefined,
            backgroundImageUrl: undefined
        };
    }
    const unparsedBackgroundData = serializedBackgroundProperties.split('|');

    return {
        backgroundColor: unparsedBackgroundData[0],
        backgroundImageUrl: unparsedBackgroundData[1]
    };
}
