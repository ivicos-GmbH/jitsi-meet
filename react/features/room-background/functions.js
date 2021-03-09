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

/**
 * The function synchronizes the information between remote participants to make sure to get the latest
 * background defined.
 *
 * @param {Object} participantsState - Participants redux state.
 * @param {Object} conferenceState - Conference redux state.
 * @private
 * @returns {Object}
 */
export function getLatestBackground(participantsState, conferenceState) {

    const remoteParticipants = participantsState
        .filter(participant => !participant.local)
        .map(p => (conferenceState?.participants || {})[p.id])
        .map(p => extractBackgroundProperties(p?._properties?.backgroundData));

    const participants = remoteParticipants
        .filter(participant => participant.backgroundLastUpdate !== undefined);

    const reference = participants
        .sort((a, b) => parseInt(b.backgroundLastUpdate, 10) - parseInt(a.backgroundLastUpdate, 10))[0];

    return {
        backgroundColor: reference?.backgroundColor,
        backgroundImageUrl: reference?.backgroundImageUrl
    };
}
