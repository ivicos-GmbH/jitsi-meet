// @flow

import { openDialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { IconForegroundOverlay } from '../../base/icons';
import { connect } from '../../base/redux';
import { AbstractButton } from '../../base/toolbox/components';
import type { AbstractButtonProps } from '../../base/toolbox/components';
import { isLocalCameraTrackMuted } from '../../base/tracks';

import { isForegroundOverlayDefined } from './../functions';

import { ForegroundOverlayDialog } from './index';

/**
 * The type of the React {@code Component} props of {@link ForegroundOverlayButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * True if the foreground overlay of the room is set
     */
    _isForegroundOverlayEnabled: boolean,

    /**
     * Whether video is currently muted or not.
     */
     _videoMuted: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * An abstract implementation of a button that toggles the foreground overlay dialog.
 */
class ForegroundOverlayButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.selectForegroundOverlay';
    icon = IconForegroundOverlay;
    label = 'toolbar.selectForegroundOverlay';
    tooltip = 'toolbar.selectForegroundOverlay';

    /**
     * Handles clicking / pressing the button, and toggles the foreground overlay dialog
     * state accordingly.
     *
     * @protected
     * @returns {void}
     */
    _handleClick() {
        const { dispatch } = this.props;

        dispatch(openDialog(ForegroundOverlayDialog));
    }

    /**
     * Returns {@code boolean} value indicating if the foreground overlay effect is
     * enabled or not.
     *
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._isForegroundOverlayEnabled;
    }

    /**
     * Returns {@code boolean} value indicating if disabled state is
     * enabled or not.
     *
     * @protected
     * @returns {boolean}
     */
    _isDisabled() {
        return this.props._videoMuted;
    }
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code ForegroundOverlayButton} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _isForegroundOverlayEnabled: boolean
 * }}
 */
function _mapStateToProps(state): Object {
    const tracks = state['features/base/tracks'];

    return {
        _isForegroundOverlayEnabled: isForegroundOverlayDefined(state),
        _videoMuted: isLocalCameraTrackMuted(tracks)
    };
}

export default translate(connect(_mapStateToProps)(ForegroundOverlayButton));
