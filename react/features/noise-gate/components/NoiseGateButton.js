/* eslint-disable lines-around-comment */
import { translate } from '../../base/i18n';
import {
    IconShareAudio,
    IconStopAudioShare
} from '../../base/icons';
import { connect } from '../../base/redux';
import {
    AbstractButton
} from '../../base/toolbox/components';
import { setOverflowMenuVisible } from '../../toolbox/actions';
import { toggleNoiseGate } from '../actions';
import { isNoiseGateEnabled } from '../functions';

/**
 * Component that renders a toolbar button for toggling noise Gate.
 */
class NoiseGateButton extends AbstractButton<Props, any, any> {
    accessibilityLabel = 'toolbar.accessibilityLabel.noiseGate';
    icon = IconShareAudio;
    label = 'toolbar.noiseGate';
    tooltip = 'toolbar.noiseGate';
    toggledIcon = IconStopAudioShare;
    toggledLabel = 'toolbar.disableNoiseGate';

    props;

    /**
     * Handles clicking / pressing the button.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        const { dispatch } = this.props;

        dispatch(toggleNoiseGate());
        dispatch(setOverflowMenuVisible(false));
    }

    /**
     * Indicates whether this button is in toggled state or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._isNoiseGateEnabled;
    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    return {
        _isNoiseGateEnabled: isNoiseGateEnabled(state)
    };
}

export default translate(connect(_mapStateToProps)(NoiseGateButton));
