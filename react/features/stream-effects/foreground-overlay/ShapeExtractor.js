// @flow

import Logger from 'jitsi-meet-logger';

import {
    Circle,
    Square
} from './Shapes';

const logger = Logger.getLogger(__filename);

const DEFAULT_SIZE_RATIO = 0.8;

/**
 * Shape extractor enabling to make part of a background corresponding to a certain shape transparent.
 */
export class ShapeExtractor {
    _sizeRatio: Number;
    _shape: Object;

    /**
     * Represents a shape extractor class.
     *
     * @class
     * @param {string} shapeEncoding - The shape encoding can either correspond to the simple name of
     * a shape 'circle' or 'square' or also include a size ratio between 0 and 1 (ex. circle-0.8).
     */
    constructor(shapeEncoding: string) {

        const shapeProperties = shapeEncoding.split('-');

        this._sizeRatio = this._sanitizeSizeRatio(shapeProperties[1] || DEFAULT_SIZE_RATIO);
        this._shape = this._createShape(shapeProperties[0], this._sizeRatio);

    }

    /**
     * Create the shape corresponding to the request.
     *
     * @private
     * @param {string} shapeName - The name of the chosen shape (will be sanitized by the function if needed).
     * @param {number} sizeRatio - Size ratio between 0 and 1 excluded.
     * @returns {Object} - One of the possible shape object.
     */
    _createShape(shapeName, sizeRatio) {
        switch (shapeName) {
        case 'square':
            return new Square(sizeRatio);
        default:
            return new Circle(sizeRatio);
        }
    }

    /**
     * Sanitize the defined size ratio to give back a size ratio in ]0,1[.
     *
     * @param {string} sizeRatio - Size ratio to be sanitized.
     * @private
     * @returns {number} - Sanitized size ratio.
     */
    _sanitizeSizeRatio(sizeRatio) {
        const sanitizedSizeRatio = isNaN(Number(sizeRatio)) ? DEFAULT_SIZE_RATIO : Number(sizeRatio);

        return sanitizedSizeRatio >= 1 || sanitizedSizeRatio <= 0 ? DEFAULT_SIZE_RATIO : sanitizedSizeRatio;
    }

    /**
     * Extract the shape from a canvasContext.
     *
     * @param {Object} canvasContext - Canvas overlay context to modify.
     * @param {Object} canvasElement - Canvas overlay element.
     * @returns {void}
     */
    extract(canvasContext, canvasElement) {
        if (canvasElement && canvasContext) {
            this._shape.extract(canvasContext, canvasElement);

            return;
        }
        logger.warn('Canvas context or element are not defined. Shape will not be extracted');
    }

}
