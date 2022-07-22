// @ts-ignore

/**
 * Class Implementing the effect interface expected by a JitsiLocalTrack.
 * Effect applies noise gate on a audio JitsiLocalTrack.
 */
export class NoiseGateEffect {

    /**
     * Web audio context.
     */
    _audioContext;

    /**
     * Source that will be attached to the track affected by the effect.
     */
    _audioSource;

    /**
     * Destination that will contain denoised audio from the audio worklet.
     */
    _audioDestination;

    /**
     * Gain associated node.
     */
    _gainNode;

    /**
     * Analyser associated node.
     */
    _analyser;

    /**
     * LowPassFilter associated node.
     */
    _lowPass;

    /**
     * HighPass associated node.
     */
    _highPass;

    /**
     * Effect interface called by source JitsiLocalTrack.
     *
     * @param {MediaStream} audioStream - Audio stream which will be mixed with _mixAudio.
     * @returns {MediaStream} - MediaStream containing both audio tracks mixed together.
     */
    startEffect(audioStream) {
        console.log('AUDIO', audioStream);
        this._audioContext = new AudioContext();
        this._analyser = new AnalyserNode(this._audioContext, { fftSize: 2048 });
        this._gainNode = new GainNode(this._audioContext);
        this._lowPass = new BiquadFilterNode(this._audioContext, {
            type: 'lowpass',
            frequency: 8000,
            gain: -70
        });
        this._highPass = new BiquadFilterNode(this._audioContext, {
            type: 'highpass',
            frequency: 200,
            gain: -70
        });

        this._audioSource = this._audioContext.createMediaStreamSource(audioStream);
        this._audioDestination = this._audioContext.createMediaStreamDestination();

        this._audioSource.connect(this._lowPass);
        this._lowPass.connect(this._highPass);
        this._highPass.connect(this._analyser);
        this._analyser.connect(this._gainNode);
        this._gainNode.connect(this._audioDestination);

        // GET LEVEL
        const bufferLength = this._analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        this._analyser.getByteTimeDomainData(dataArray);

        let levelContainer = 0.0;

        dataArray.forEach(item => {
            levelContainer += item;
        });
        const levelReturn = levelContainer / bufferLength;

        // NOISE GATE
        if (levelReturn < 127.58) {
            this._gainNode.gain.setTargetAtTime(0, this._audioContext.currentTime, 0.2);

            console.log(`After Gate Level: ${levelReturn}`);
        } else {
            this._gainNode.gain.setTargetAtTime(1, this._audioContext.currentTime, 0.03);
            console.log(`No Gate Level: ${levelReturn}`);
        }

        return this._audioDestination.stream;
    }

    /**
     * Checks if the JitsiLocalTrack supports this effect.
     *
     * @param {JitsiLocalTrack} sourceLocalTrack - Track to which the effect will be applied.
     * @returns {boolean} - Returns true if this effect can run on the specified track, false otherwise.
     */
    isEnabled(sourceLocalTrack) {
        // JitsiLocalTracks needs to be an audio track.
        return sourceLocalTrack.isAudioTrack();
    }

    /**
     * Clean up resources acquired by noise suppressor and rnnoise processor.
     *
     * @returns {void}
     */
    stopEffect() {
        // Technically after this process the Audio Worklet along with it's resources should be garbage collected,
        // however on chrome there seems to be a problem as described here:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1298955
        this._gainNode?.disconnect();
        this._audioDestination?.disconnect();
        this._analyser?.disconnect();
        this._lowPass?.disconnect();
        this._highPass?.disconnect();
        this._audioSource?.disconnect();
        this._audioContext?.close();
    }
}


// let oldVolume: number = 1;

// /**
//  * Creates a new instance of NoiseGateProcessor.
//  *
//  * @returns {Promise<NoiseGateProcessor>}
//  * @param {number} newAudioLevel - Audio level from remote audio track.
//  */
// export function createNoiseGateProcessor(newAudioLevel: number) {
//     let newVolume: number = 0;


//     if (newAudioLevel <= 0.06) {
//         const reductedVolume = oldVolume * 0.5;

//         if (oldVolume <= 0.1) {
//             newVolume = 0;
//         } else if (oldVolume > 0.1) {
//             newVolume = reductedVolume;
//         }

//     } else if (newAudioLevel > 0.06) {
//         newVolume = 1;
//     }

//     oldVolume = newVolume;

//     return newVolume;
// }
