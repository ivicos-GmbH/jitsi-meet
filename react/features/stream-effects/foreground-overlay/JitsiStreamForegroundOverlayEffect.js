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
    _overlayImage: Image;
    _overlayImageLoaded: Boolean;
    _onForegroundFrameTimer: Function;
    _onForegroundFrameTimerWorker: Worker;
    startEffect: Function;
    stopEffect: Function;
    _overlayImageUrl: String;
    _overlayColor: String;
    _overlayMode: String;

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

        this._overlayImageUrl = overlayImageUrl;
        this._overlayColor = overlayColor;
        this._overlayMode = mode;

        this._fetchOverlayImage();

        // Bind event handler so it is only bound once for every instance.
        this._onForegroundFrameTimer = this._onForegroundFrameTimer.bind(this);

        // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElement.getContext('2d');

        this._inputVideoElement = document.createElement('video');
    }

    /**
     * Fetch the overlay image.
     */
    _fetchOverlayImage() {
        if (!this._overlayImageUrl) {
            return;
        }
        this._overlayImage = new Image();
        this._overlayImageLoaded = false;
        this._overlayImage.onload = function() {
            this._overlayImageLoaded = true;
        };
        this._overlayImage.crossOrigin = 'anonymous';
        this._overlayImage.src = this._overlayImageUrl;
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
            await this._runProcessing();
        }
    }

    _applyForegroundOverlay() {
        if (this._overlayImageUrl) {
            if (this._overlayImageLoaded || this._overlayImage.complete) {
                try {
                    this._outputCanvasCtx.drawImage(
                        this._overlayImage,
                        0,
                        0,
                        this._overlayImage.width,
                        this._overlayImage.height,
                        0,
                        0,
                        this._outputCanvasElement.width,
                        this._outputCanvasElement.height
                    );
                } catch (e) {
                    console.log(`Error : ${e}`);
                }
            }
        } else if (this._overlayColor) {
            this._outputCanvasCtx.fillStyle = this._overlayColor;
            this._outputCanvasCtx.fillRect(0, 0, this._outputCanvasElement.width, this._outputCanvasElement.height);
        }
    }

    _drawBackground() {
        this._applyForegroundOverlay();
        const RADIUS_RATIO = 0.7;
        const radius = (Math.min(this._outputCanvasElement.width, this._outputCanvasElement.height) / 2) * RADIUS_RATIO;

        this._outputCanvasCtx.arc(
            this._outputCanvasElement.width / 2,
            this._outputCanvasElement.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        this._outputCanvasCtx.globalCompositeOperation = 'xor';
        this._outputCanvasCtx.fill();
    }

    /**
     * Represents the run post processing.
     *
     * @private
     * @returns {void}
     */
    _runProcessing() {

        if (this._overlayMode === 'fusion') {
            this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);
            this._applyForegroundOverlay();
        } else {
            this._drawBackground();
            this._outputCanvasCtx.globalCompositeOperation = 'destination-over';
            this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);
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
