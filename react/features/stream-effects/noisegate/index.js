// @flow
let volume = 1;

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} audioLevel - Audio level from remote audio track.
 * @param {number} volume - Current volume from the Thubnail.
 */
export function createNoiseGateProcessor(audioLevel: number) {
    const oldVolume = volume;
    let newVolume;

    if (audioLevel <= 0.07) {
        const reductedVolume = oldVolume - 0.1;

        if (oldVolume <= 0.1) {
            newVolume = 0;
        } else if (oldVolume > 0.1) {
            newVolume = reductedVolume;
        }

    } else if (audioLevel > 0.07) {
        const increasedVolume = oldVolume + 0.3;

        if (oldVolume >= 0.7) {
            newVolume = 1;
        } else if (oldVolume < 0.7) {
            newVolume = increasedVolume;
        }
    }

    volume = newVolume;

    console.log('FIRST VOLUME');
    console.log(oldVolume);
    console.log('NEW VOLUME');
    console.log(newVolume);

    return newVolume;
}
