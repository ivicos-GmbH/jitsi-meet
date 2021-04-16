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

    console.log('VOLUME');
    console.log(volume);

    if (audioLevel <= 0.07) {
        const reductedVolume = oldVolume - 0.1;

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

    console.log('OLD VOLUME');
    console.log(oldVolume);
    console.log('NEW VOLUME');
    console.log(newVolume);

    return newVolume;
}
