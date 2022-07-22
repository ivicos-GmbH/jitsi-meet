/* eslint-disable lines-around-comment */
import { NOTIFICATION_TIMEOUT_TYPE, showWarningNotification } from '../notifications';
import { isScreenAudioShared } from '../screen-share';

/**
 * Is noise Gate currently enabled.
 *
 * @param {IState} state - The state of the application.
 * @returns {boolean}
 */
export function isNoiseGateEnabled(state) {
    return state['features/noise-gate'].enabled;
}

/**
 * Verify if noise Gate can be enabled in the current state.
 *
 * @param {*} state - Redux state.
 * @param {*} dispatch - Redux dispatch.
 * @param {*} localAudio - Current local audio track.
 * @returns {boolean}
 */
export function canEnableNoiseGate(state, dispatch, localAudio) {
    const { channelCount } = localAudio.track.getSettings();

    // Sharing screen audio implies an effect being applied to the local track, because currently we don't support
    // more then one effect at a time the user has to choose between sharing audio or having noise Gate active.
    if (isScreenAudioShared(state)) {
        dispatch(showWarningNotification({
            titleKey: 'notify.noiseGateFailedTitle',
            descriptionKey: 'notify.noiseGateDesktopAudioDescription'
        }, NOTIFICATION_TIMEOUT_TYPE.MEDIUM));

        return false;
    }

    // Stereo audio tracks aren't currently supported, make sure the current local track is mono
    if (channelCount > 1) {
        dispatch(showWarningNotification({
            titleKey: 'notify.noiseGateFailedTitle',
            descriptionKey: 'notify.noiseGateStereoDescription'
        }, NOTIFICATION_TIMEOUT_TYPE.MEDIUM));

        return false;
    }

    return true;
}
