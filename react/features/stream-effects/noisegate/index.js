// @flow
let volume: number = 1;

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} audioLevel - Audio level from remote audio track.
 */
export function createNoiseGateProcessor(audioLevel: number) {
    const oldVolume: number = volume;
    let newVolume: number = 0;

    if (audioLevel <= 0.07) {
        const reductedVolume = oldVolume * 0.6;

        if (oldVolume <= 0.1) {
            newVolume = 0;
        } else if (oldVolume > 0.1) {
            newVolume = reductedVolume;
        }

    } else if (audioLevel > 0.07) {
        newVolume = 1;
    }

    volume = newVolume;

    return newVolume;
}
