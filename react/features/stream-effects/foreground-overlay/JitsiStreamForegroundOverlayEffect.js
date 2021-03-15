// @flow
import {
    CLEAR_TIMEOUT,
    TIMEOUT_TICK,
    SET_TIMEOUT,
    timerWorkerScript
} from './TimerWorker';

/**
 * Represents a modified MediaStream that adds blur to video background.
 * <tt>JitsiStreamForegroundEffect</tt> does the processing of the original
 * video stream.
 */
export default class JitsiStreamForegroundOverlayEffect {
    _model: Object;
    _options: Object;
    _inputVideoElement: HTMLVideoElement;
    _outputCanvasElement: HTMLCanvasElement;
    _outputCanvasCtx: Object;
    _foregroundImage: Image;
    _onForegroundFrameTimer: Function;
    _onForegroundFrameTimerWorker: Worker;
    startEffect: Function;
    stopEffect: Function;

    /**
     * Represents a modified video MediaStream track.
     *
     * @class
     * @param {string} overlayImageUrl - URL of the foreground shape ('' if none).
     * @param { string } overlayColor - Color of the overlay if no image is given.
     * @param { string } mode - Mode chosen for the overlay : Example 'fusion' if given background transparent,
     * 'circle' if a shape should be manually extracted from the overlay (default).
     */
    constructor(overlayImageUrl: string, overlayColor: string, mode: string) {

        this._foregroundImage = new Image();
        this._foregroundImageLoaded = false;
        this._foregroundImage.onload = function() {
            this._foregroundImageLoaded = true;
        };
        this._foregroundImage.crossOrigin = 'anonymous';
        this._foregroundImage.src = overlayImageUrl;

        // Bind event handler so it is only bound once for every instance.
        this._onForegroundFrameTimer = this._onForegroundFrameTimer.bind(this);

        // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElement.getContext('2d');

        this._inputVideoElement = document.createElement('video');
    }

    /**
     * EventHandler onmessage for the onForegroundFrameTimerWorker WebWorker.
     *
     * @private
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
    async _onForegroundFrameTimer(response: Object) {
        if (response.data.id === TIMEOUT_TICK) {
            await this.runProcessing();
        }
    }

    /**
     * Represents the run post processing.
     *
     * @returns {void}
     */
    runProcessing() {

        this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

        if (this._foregroundImageLoaded || this._foregroundImage.complete) {
            try {
                this._outputCanvasCtx.drawImage(
                    this._foregroundImage,
                    0,
                    0,
                    this._foregroundImage.width,
                    this._foregroundImage.height,
                    0,
                    0,
                    this._outputCanvasElement.width,
                    this._outputCanvasElement.height
                );
            } catch (e) {
                console.log(`Error : ${e}`);
            }
        }

        this._onForegroundFrameTimerWorker.postMessage({
            id: SET_TIMEOUT,
            timeMs: 1000 / 30
        });
    }

    /**
     * Checks if the local track supports this effect.
     *
     * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
     * @returns {boolean} - Returns true if this effect can run on the specified track
     * false otherwise.
     */
    isEnabled(jitsiLocalTrack: Object) {
        return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType === 'camera';
    }

    /**
     * Starts loop to capture video frame and render the segmentation mask.
     *
     * @param {MediaStream} stream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(stream: MediaStream) {
        this._onForegroundFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Foreground effect worker' });
        this._onForegroundFrameTimerWorker.onmessage = this._onForegroundFrameTimer;
        const firstVideoTrack = stream.getVideoTracks()[0];
        const { height, frameRate, width }
            = firstVideoTrack.getSettings ? firstVideoTrack.getSettings() : firstVideoTrack.getConstraints();

        this._outputCanvasElement.width = parseInt(width, 10);
        this._outputCanvasElement.height = parseInt(height, 10);
        this._outputCanvasCtx = this._outputCanvasElement.getContext('2d');

        this._inputVideoElement.width = parseInt(width, 10);
        this._inputVideoElement.height = parseInt(height, 10);
        this._inputVideoElement.autoplay = true;
        this._inputVideoElement.srcObject = stream;
        this._inputVideoElement.onloadeddata = () => {
            this._onForegroundFrameTimerWorker.postMessage({
                id: SET_TIMEOUT,
                timeMs: 1000 / 30
            });
        };

        return this._outputCanvasElement.captureStream(parseInt(frameRate, 10));
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
    stopEffect() {
        this._onForegroundFrameTimerWorker.postMessage({
            id: CLEAR_TIMEOUT
        });

        this._onForegroundFrameTimerWorker.terminate();
    }
}
