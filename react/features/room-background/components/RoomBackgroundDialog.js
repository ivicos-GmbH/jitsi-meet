// @flow
/* eslint-disable react/jsx-no-bind, no-return-assign */
import React, { useState } from 'react';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { Tooltip } from '../../base/tooltip';
import { setBackgroundImage } from '../actions';

const images = [
    {
        tooltip: 'Image 1',
        name: 'background-1.jpg',
        id: 1,
        src: 'images/virtual-background/background-1.jpg'
    },
    {
        tooltip: 'Image 2',
        name: 'background-2.jpg',
        id: 2,
        src: 'images/virtual-background/background-2.jpg'
    },
    {
        tooltip: 'Image 3',
        name: 'background-3.jpg',
        id: 3,
        src: 'images/virtual-background/background-3.jpg'
    },
    {
        tooltip: 'Image 4',
        name: 'background-4.jpg',
        id: 4,
        src: 'images/virtual-background/background-4.jpg'
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
    t: Function
};

/**
 * Renders room background dialog.
 *
 * @returns {ReactElement}
 */
function RoomBackground({ dispatch, t }: Props) {
    const [ selected, setSelected ] = useState('');

    const removeRoomBackground = () => {
        setSelected('none');
        dispatch(
            setBackgroundImage('', '')
        );
    };

    const addRoomImageBackground = image => {
        setSelected(image.id);
        dispatch(
            setBackgroundImage(image.src, '')
        );
    };

    return (
        <Dialog
            hideCancelButton = { true }
            submitDisabled = { false }
            titleKey = { 'roomBackground.title' }
            width = 'small'>
            <div className = 'room-background-dialog'>
                <Tooltip
                    content = { t('roomBackground.removeBackground') }
                    position = { 'top' }>
                    <div
                        className = { selected === 'none' ? 'none-selected' : 'room-background-none' }
                        onClick = { () => removeRoomBackground() }>
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
                            onClick = { () => addRoomImageBackground(image) }
                            onError = { event => event.target.style.display = 'none' }
                            src = { image.src } />
                    </Tooltip>
                ))}
            </div>
        </Dialog>
    );
}

export default translate(connect()(RoomBackground));
