// @flow

/**
 * Circle shape
 */
export class Circle {

    _sizeRatio: number;

    /**
     * Represents a circle shape class.
     *
     * @class
     * @param {string} sizeRatio - Size ratio between 0 and 1 of the shape (1 being the maximum possible).
     */
    constructor(sizeRatio: number) {
        this._sizeRatio = sizeRatio;
    }

    /**
     * Extract the shape from a canvasContext.
     *
     * @param {Object} canvasContext - Canvas overlay context to modify.
     * @param {HTMLCanvasElement} canvasElement - Canvas overlay element.
     * @returns {void}
     */
    extract(canvasContext: Object, canvasElement: HTMLCanvasElement) {
        canvasContext.beginPath();

        // Create circle
        const radius
            = (Math.min(canvasElement.width, canvasElement.height) / 2) * this._sizeRatio;

        canvasContext.arc(
            canvasElement.width / 2,
            canvasElement.height / 2,
            radius,
            0,
            Math.PI * 2
        );

        // Extract the shape from the wallpaper
        canvasContext.globalCompositeOperation = 'xor';
        canvasContext.fill();

        canvasContext.closePath();
    }
}

/**
 * Square shape
 */
export class Square {

    _sizeRatio: number;

    /**
     * Represents a square shape class.
     *
     * @class
     * @param {string} sizeRatio - Size ratio between 0 and 1 of the shape (1 being the maximum possible).
     */
    constructor(sizeRatio: number) {
        this._sizeRatio = sizeRatio;
    }

    /**
     * Extract the shape from a canvasContext.
     *
     * @param {Object} canvasContext - Canvas overlay context to modify.
     * @param {HTMLCanvasElement} canvasElement - Canvas overlay element.
     * @returns {void}
     */
    extract(canvasContext: Object, canvasElement: HTMLCanvasElement) {
        canvasContext.beginPath();

        // Create square
        const halfSquareSize
            = (Math.min(canvasElement.width, canvasElement.height) / 2) * this._sizeRatio;

        canvasContext.rect(
            (canvasElement.width / 2) - halfSquareSize,
            (canvasElement.height / 2) - halfSquareSize,
            2 * halfSquareSize,
            2 * halfSquareSize
        );

        // Extract the shape from the wallpaper
        canvasContext.globalCompositeOperation = 'xor';
        canvasContext.fill();

        canvasContext.closePath();
    }
}
