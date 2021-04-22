// @flow
/* global APP */


/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 * @param {number} VADvalue - VAD value of input signal.
 */
export function createNoiseGateProcessor(VADvalue: number) {
    const state = APP.store.getState();
    const localAudioTrack = state['features/base/tracks'][1].jitsiTrack;

    // localAudioTrack._constraints.advanced = [ 'askjdn', 'kjashdkjnasd' ];

    console.log(localAudioTrack);

    return 0;
}
