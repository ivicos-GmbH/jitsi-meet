// @flow
/* eslint-disable react/jsx-no-bind, no-return-assign */
import React, { useState } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { IconCircle, IconSquare } from '../../base/icons';
import { connect } from '../../base/redux';
import { Tooltip } from '../../base/tooltip';
import { setForegroundOverlay } from '../actions';

const images = [
    {
        tooltip: 'Image 1',
        name: 'background-1.jpg',
        id: 'image_1',
        src: 'images/virtual-background/background-1.jpg'
    },
    {
        tooltip: 'Image 2',
        name: 'background-2.jpg',
        id: 'image_2',
        src: 'images/virtual-background/background-2.jpg'
    },
    {
        tooltip: 'Image 3',
        name: 'background-3.jpg',
        id: 'image_3',
        src: 'images/virtual-background/background-3.jpg'
    },
    {
        tooltip: 'Image 4',
        name: 'background-4.jpg',
        id: 'image_4',
        src: 'images/virtual-background/background-4.jpg'
    }
];

const transparentImages = [
    {
        tooltip: 'Example Transparent Foreground',
        name: 'example-transparent-foreground.png',
        id: 'example_transparent_foreground',
        src: 'images/foreground-overlay/example-transparent-foreground.png'
    },
    {
        tooltip: 'Example Transparent Foreground 2',
        name: 'example-transparent-foreground-2.png',
        id: 'example_transparent_foreground_2',
        src: 'images/foreground-overlay/example-transparent-foreground-2.png'
    }
];

const colors = [
    {
        tooltip: 'Black',
        code: 'black',
        id: 'black'
    },
    {
        tooltip: 'Blue',
        code: '#004A7F',
        id: 'blue'
    },
    {
        tooltip: 'Red',
        code: '#7F0000',
        id: 'red'
    },
    {
        tooltip: 'Green',
        code: '#007F0E',
        id: 'green'
    }
];

const foregroundCombinations = [
    {
        name: 'circle-0.8',
        icon: IconCircle
    },
    {
        name: 'square-0.8',
        icon: IconSquare
    }
];

type Props = {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * The overlay combination mode
     */
    _overlayMode: string,
};

/**
 * Renders foreground overlay dialog.
 *
 * @returns {ReactElement}
 */
function ForegroundOverlay({ dispatch, t, _overlayMode }: Props) {
    const [ selected, setSelected ] = useState('');

    const removeForegroundOverlay = () => {
        setSelected('none');
        dispatch(
            setForegroundOverlay({
                overlayImageUrl: '',
                overlayColor: '',
                mode: '' })
        );
    };

    const addOverlayImageForeground = image => {
        setSelected(image.id);
        const additionalParameter = {};

        if (_overlayMode === 'fusion') {
            additionalParameter.mode = 'circle-0.8';
        }
        dispatch(
            setForegroundOverlay({
                overlayImageUrl: image.src,
                overlayColor: '',
                ...additionalParameter
            })
        );
    };

    const addTransparentOverlayImageForeground = image => {
        setSelected(image.id);
        dispatch(
            setForegroundOverlay({
                overlayImageUrl: image.src,
                overlayColor: '',
                mode: 'fusion'
            })
        );
    };

    const addOverlayColorForeground = color => {
        setSelected(color.id);
        const additionalParameter = {};

        if (_overlayMode === 'fusion') {
            additionalParameter.mode = 'circle-0.8';
        }
        dispatch(
            setForegroundOverlay({
                overlayImageUrl: '',
                overlayColor: color.code,
                ...additionalParameter
            })
        );
    };

    const addOverlayMode = combinationTypeName => {
        if (_overlayMode === 'fusion') {
            return;
        }
        setSelected(combinationTypeName);
        dispatch(
            setForegroundOverlay({
                mode: combinationTypeName
            })
        );
    };

    return (
        <Dialog
            hideCancelButton = { true }
            submitDisabled = { false }
            titleKey = { 'foregroundOverlay.title' }
            width = 'small'>
            <div>
                <b>Classic foreground</b>
                <hr />
                Foreground
            </div>
            <div className = 'foreground-overlay-dialog'>
                <Tooltip
                    content = { t('foregroundOverlay.removeForeground') }
                    position = { 'top' }>
                    <div
                        className = { selected === 'none' ? 'none-selected' : 'foreground-overlay-none' }
                        onClick = { () => removeForegroundOverlay() }>
                        None
                    </div>
                </Tooltip>
                {images.map((image, index) => (
                    <Tooltip
                        content = { image.tooltip }
                        key = { index }
                        position = { 'top' }>
                        <img
                            className = { selected === image.id ? 'thumbnail-selected' : 'thumbnail' }
                            onClick = { () => addOverlayImageForeground(image) }
                            onError = { event => event.target.style.display = 'none' }
                            src = { image.src } />
                    </Tooltip>
                ))};
            </div>
            <div className = 'foreground-overlay-dialog'>
                {colors.map((color, index) => (
                    <Tooltip
                        content = { color.tooltip }
                        key = { index }
                        position = { 'top' }>
                        <div
                            className = { selected === color.id ? 'thumbnail-color-selected' : 'thumbnail-color' }
                            onClick = { () => addOverlayColorForeground(color) }
                            onError = { event => event.target.style.display = 'none' }
                            style = {{ backgroundColor: color.code }} />
                    </Tooltip>
                ))}
            </div>
            <br />
            <div>
                Shape
            </div>
            <div className = 'foreground-overlay-dialog'>
                {foregroundCombinations.map((combinationType, index) => (
                    <Tooltip
                        content = { combinationType.name }
                        key = { index }
                        position = { 'top' }>
                        <div
                            className = { selected === combinationType.name ? 'thumbnail-selected' : 'thumbnail' }
                            onClick = { () => addOverlayMode(combinationType.name) }
                            onError = { event => event.target.style.display = 'none' }>
                            <combinationType.icon className = { 'embedded-svg' } />
                        </div>
                    </Tooltip>
                ))}
            </div>
            <br />
            <div>
                <b>Custom Foreground</b>
                <hr />
            </div>
            <div className = 'foreground-overlay-dialog'>
                {transparentImages.map((image, index) => (
                    <Tooltip
                        content = { image.tooltip }
                        key = { index }
                        position = { 'top' }>
                        <img
                            className = { selected === image.id ? 'thumbnail-selected' : 'thumbnail' }
                            onClick = { () => addTransparentOverlayImageForeground(image) }
                            onError = { event => event.target.style.display = 'none' }
                            src = { image.src } />
                    </Tooltip>
                ))};
            </div>
        </Dialog>
    );
}

/**
 * Maps (parts of) the Redux state to the associated ForegroundOverlay props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {

    return {
        _overlayMode: state['features/foreground-overlay'].mode
    };
}

export default translate(connect(_mapStateToProps)(ForegroundOverlay));
