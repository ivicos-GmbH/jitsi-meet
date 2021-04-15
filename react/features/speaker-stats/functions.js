// @flow

declare var APP: Object;

/**
 * Clears the speaker stats requests with a specific timer ID.
 *
 * @param {Object} timerId - ID of the timer to be cleared.
 * @returns {void}
 */
export function clearSpeakerStatsInterval(timerId: Object) {
    if (timerId) {
        clearInterval(timerId);
    }
}

/**
 * Creates a timer to perform repeated requests to get speaker stats.
 *
 * @param {number} intervalRequest - Interval between two consecutive request (ms).
 * @returns {Object} - ID of the corresponding timer.
 */
export function createSpeakerStatsInterval(intervalRequest: number) {
    return setInterval(fetchDetailedSpeakerStats, intervalRequest);
}

/**
 * Fetch speaker stats and send them back to the client.
 *
 * @returns {void}
 */
export function fetchDetailedSpeakerStats() {
    const stats = APP.conference.getSpeakerStats();
    const userIds = Object.keys(stats);
    const speakerTimeList = userIds.map(userId => {
        return {
            userId,
            userName: stats[userId].displayName,
            speakerTime: stats[userId].getTotalDominantSpeakerTime()
        };
    });

    APP.API.notifySpeakerStatsReceived(speakerTimeList);
}
