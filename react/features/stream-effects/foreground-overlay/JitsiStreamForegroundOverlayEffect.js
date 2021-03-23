// @flow
import {
    ShapeExtractor
} from './ShapeExtractor';
import {
    CLEAR_TIMEOUT,
    TIMEOUT_TICK,
    SET_TIMEOUT,
    timerWorkerScript
} from './TimerWorker';


/**
 * Represents a modified MediaStream that adds a foreground overlay to the video stream.
 * <tt>JitsiStreamForegroundOverlayEffect</tt> does the processing of the original
 * video stream.
 */
export default class JitsiStreamForegroundOverlayEffect {
    _model: Object;
    _options: Object;
    _inputVideoElement: HTMLVideoElement;
    _outputCanvasElement: HTMLCanvasElement;
    _outputCanvasCtx: Object;
    _overlayCanvasElement: HTMLCanvasElement;
    _overlayCanvasCtx: Object;
    _onForegroundFrameTimer: Function;
    _onForegroundFrameTimerWorker: Worker;
    startEffect: Function;
    stopEffect: Function;
    _overlayImageUrl: string;
    _overlayColor: string;
    _overlayMode: string;
    _overlayImage: Image;
    _wallpaperImageLoaded: boolean;
    _overlayLoaded: boolean;

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

        this._wallpaperImageLoaded = false;
        this._overlayLoaded = false;

        // Load the overlay image
        this._fetchOverlayImage();

        // Bind event handler so it is only bound once for every instance.
        this._onForegroundFrameTimer = this._onForegroundFrameTimer.bind(this);

        // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElement.getContext('2d');

        // Overlay context : Keep track of static overlay elements on the video track
        this._overlayCanvasElement = document.createElement('canvas');
        this._overlayCanvasElement.getContext('2d');

        this._inputVideoElement = document.createElement('video');
    }

    /**
     * Fetch the overlay image.
     *
     * @private
     * @returns {void}
     */
    _fetchOverlayImage() {
        if (!this._overlayImageUrl) {
            return;
        }
        const self = this;

        this._overlayImage = new Image();
        this._overlayImage.onload = function() {
            self._wallpaperImageLoaded = true;
        };
        this._overlayImage.onerror = function() {

            // Image not loaded : Defaulting to color overlay
            self._wallpaperImageLoaded = false;
            self._overlayColor = self._overlayColor ? self._overlayColor : 'black';
            self._overlayImageUrl = '';
            self._overlayMode = self._overlayMode === 'fusion' ? 'circle' : self._overlayMode;

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

    /**
     * Function enabling to build the complete overlay to apply on top of the video track.
     *
     * @private
     * @returns {void}
     */
    _applyOverlay() {

        // Clear the previous state of the output canvas
        this._overlayCanvasCtx.clearRect(0, 0, this._overlayCanvasElement.width, this._overlayCanvasElement.height);

        // Build the overlay in the overlay canvas
        this._applyForegroundWallpaper();
        if (!this._overlayLoaded) {
            return;
        }
        if (this._overlayMode !== 'fusion') {
            const shapeExtractor = new ShapeExtractor(this._overlayMode);

            shapeExtractor.extract(this._overlayCanvasCtx, this._overlayCanvasElement);
        }
    }

    /**
     * Draw the foreground wallpaper on the overlay canvas.
     *
     * @private
     * @returns {void}
     */
    _applyForegroundWallpaper() {

        this._overlayCanvasCtx.beginPath();

        this._overlayCanvasCtx.globalCompositeOperation = 'source-over';
        if (this._overlayImageUrl) {
            if (this._wallpaperImageLoaded) {
                this._overlayLoaded = true;
                this._overlayCanvasCtx.drawImage(
                    this._overlayImage,
                    0,
                    0,
                    this._overlayImage.width,
                    this._overlayImage.height,
                    0,
                    0,
                    this._overlayCanvasElement.width,
                    this._overlayCanvasElement.height
                );
            }
        } else if (this._overlayColor) {
            this._overlayLoaded = true;
            this._overlayCanvasCtx.fillStyle = this._overlayColor;
            this._overlayCanvasCtx.fillRect(0, 0, this._overlayCanvasElement.width, this._overlayCanvasElement.height);
        }

        this._overlayCanvasCtx.closePath();
    }

    /**
     * Run the processing : Combining the overlay with the video track.
     *
     * @private
     * @returns {void}
     */
    _runProcessing() {

        // If the overlay was still not loaded, try to load it now
        if (!this._overlayLoaded) {
            this._applyOverlay();
        }

        this._outputCanvasCtx.beginPath();

        // Clear the previous state of the output canvas
        this._outputCanvasCtx.clearRect(0, 0, this._outputCanvasElement.width, this._outputCanvasElement.height);

        // Copy the overlay over the current image
        this._outputCanvasCtx.globalCompositeOperation = 'source-over';
        this._outputCanvasCtx.drawImage(this._overlayCanvasCtx.canvas, 0, 0);

        // Fill the transparent area with the video track of the user
        this._outputCanvasCtx.globalCompositeOperation = 'destination-over';
        this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

        this._outputCanvasCtx.closePath();

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
     * Starts loop to capture video frame and render the overlay.
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

        // Initialize the output canvas
        this._outputCanvasElement.width = parseInt(width, 10);
        this._outputCanvasElement.height = parseInt(height, 10);
        this._outputCanvasCtx = this._outputCanvasElement.getContext('2d');

        // Initialize the overlay canvas
        this._overlayCanvasElement.width = parseInt(width, 10);
        this._overlayCanvasElement.height = parseInt(height, 10);
        this._overlayCanvasCtx = this._overlayCanvasElement.getContext('2d');

        // Attempt to apply the full overlay if everything needed is already loaded
        this._applyOverlay();

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
