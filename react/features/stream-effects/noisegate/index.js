// @flow

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} audioLevel - Audio level from remote audio track.
 * @param {number} volume - Current volume from the Thubnail.
 */
export function createNoiseGateProcessor(audioLevel: number, volume: number) {

    let newVolume;

    if (audioLevel <= 0.07) {
        const reductedVolume = volume - 0.1;

        if (volume <= 0.1) {
            newVolume = 0;
        } else if (volume > 0.1) {
            newVolume = reductedVolume;
        }

    } else if (audioLevel > 0.07) {
        const increasedVolume = volume + 0.3;

        if (volume >= 0.7) {
            newVolume = 1;
        } else if (volume < 0.7) {
            newVolume = increasedVolume;
        }
    }

    console.log('FIRST VOLUME');
    console.log(volume);
    console.log('NEW VOLUME');
    console.log(newVolume);

    return newVolume;
}
