// @flow
let oldVolume: number = 1;

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} newAudioLevel - Audio level from remote audio track.
 */
export function createNoiseGateProcessor(newAudioLevel: number) {
    let newVolume: number = 0;


    if (newAudioLevel <= 0.06) {
        const reductedVolume = oldVolume * 0.5;

        if (oldVolume <= 0.1) {
            newVolume = 0;
        } else if (oldVolume > 0.1) {
            newVolume = reductedVolume;
        }

    } else if (newAudioLevel > 0.06) {
        newVolume = 1;
    }

    oldVolume = newVolume;

    return newVolume;
}
