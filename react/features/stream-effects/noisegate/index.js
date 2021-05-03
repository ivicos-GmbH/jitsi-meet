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
        const reductedVolume = oldVolume - 0.2;

        if (oldVolume <= 0.1) {
            newVolume = 0;
        } else if (oldVolume > 0.1) {
            newVolume = reductedVolume;
        }

    } else if (audioLevel > 0.07) {
        const increasedVolume = oldVolume + 0.5;

        if (oldVolume >= 0.5) {
            newVolume = 1;
        } else if (oldVolume < 0.5) {
            newVolume = increasedVolume;
        }
    }

    volume = newVolume;

    return newVolume;
}
