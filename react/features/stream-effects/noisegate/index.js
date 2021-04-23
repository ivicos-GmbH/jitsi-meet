// @flow

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} audioLevel - Audio level from remote audio track.
 */
export function createNoiseGateProcessor(audioLevel: number) {
    let volume;

    if (audioLevel < 0.07) {
        volume = 0;
    } else {
        volume = 1;
    }

    // console.log('VOLUME');
    // console.log(audioLevel);

    return volume;
}
