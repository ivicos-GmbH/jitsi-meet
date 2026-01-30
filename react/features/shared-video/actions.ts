import { IStore } from '../app/types';
import { getCurrentConference } from '../base/conference/functions';
import { hideDialog, openDialog } from '../base/dialog/actions';
import { getLocalParticipant } from '../base/participants/functions';

import {
    REQUEST_SHARED_VIDEO_STATE,
    RESET_SHARED_VIDEO_STATUS,
    SET_ALLOWED_URL_DOMAINS,
    SET_CONFIRM_SHOW_VIDEO,
    SET_DISABLE_BUTTON,
    SET_SHARED_VIDEO_STATUS
} from './actionTypes';
import { ShareVideoConfirmDialog, SharedVideoDialog } from './components/index.web';
import { PLAYBACK_START, PLAYBACK_STATUSES } from './constants';
import { isSharedVideoEnabled, sendShareVideoCommand } from './functions';


/**
 * Marks that user confirmed or not to play video.
 *
 * @param {boolean} value - The value to set.
 * @returns {{
 *     type: SET_CONFIRM_SHOW_VIDEO,
 * }}
 */
export function setConfirmShowVideo(value: boolean) {
    return {
        type: SET_CONFIRM_SHOW_VIDEO,
        value
    };
}

/**
 * Resets the status of the shared video.
 *
 * @returns {{
 *     type: SET_SHARED_VIDEO_STATUS,
 * }}
 */
export function resetSharedVideoStatus() {
    return {
        type: RESET_SHARED_VIDEO_STATUS
    };
}

/**
 * Updates the current known status of the shared video.
 *
 * @param {Object} options - The options.
 * @param {boolean} options.muted - Is video muted.
 * @param {boolean} options.ownerId - Participant ID of the owner.
 * @param {boolean} options.status - Sharing status.
 * @param {boolean} options.time - Playback timestamp.
 * @param {boolean} options.videoUrl - URL of the shared video.
 *
 * @returns {{
 *     type: SET_SHARED_VIDEO_STATUS,
 *     muted: boolean,
 *     ownerId: string,
 *     status: string,
 *     time: number,
 *     videoUrl: string,
 * }}
 */
export function setSharedVideoStatus({ videoUrl, status, time, ownerId, muted, previousOwnerId }: {
    muted?: boolean; ownerId?: string; previousOwnerId?: string; status: string; time: number; videoUrl: string;
}) {
    return {
        type: SET_SHARED_VIDEO_STATUS,
        ownerId,
        previousOwnerId,
        status,
        time,
        videoUrl,
        muted
    };
}

/**
 * Displays the dialog for entering the video link.
 *
 * @param {Function} onPostSubmit - The function to be invoked when a valid link is entered.
 * @returns {Function}
 */
export function showSharedVideoDialog(onPostSubmit: Function) {
    return openDialog('SharedVideoDialog', SharedVideoDialog, { onPostSubmit });
}

/**
 *
 * Stops playing a shared video.
 *
 * @returns {Function}
 */
export function stopSharedVideo() {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const { ownerId } = state['features/shared-video'];
        const localParticipant = getLocalParticipant(state);

        if (ownerId === localParticipant?.id) {
            dispatch(resetSharedVideoStatus());
        }
    };
}

/**
 * Pauses the shared video.
 *
 * @returns {Function}
 */
export function pauseSharedVideo() {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const conference = getCurrentConference(getState());
        const state = getState();
        const currentVideoState = state['features/shared-video'];

        if (conference && currentVideoState.videoUrl) {
            dispatch(setSharedVideoStatus({
                videoUrl: currentVideoState.videoUrl,
                status: 'pause',
                time: currentVideoState.time ?? 0,
                muted: currentVideoState.muted,
                ownerId: currentVideoState.ownerId,
                previousOwnerId: currentVideoState.previousOwnerId
            }));
        }
    };
}

/**
 * Updates the shared video owner.
 *
 * @param {string} ownerId - The new owner ID.
 * @returns {Function}
 */
export function updateSharedVideoOwner(ownerId: string) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const conference = getCurrentConference(getState());
        const state = getState();
        const currentVideoState = state['features/shared-video'];

        if (conference && currentVideoState.videoUrl && currentVideoState.status) {
            dispatch(setSharedVideoStatus({
                videoUrl: currentVideoState.videoUrl,
                status: currentVideoState.status,
                time: currentVideoState.time ?? 0,
                muted: currentVideoState.muted,
                ownerId,
                previousOwnerId: currentVideoState.ownerId
            }));
        }
    };
}

/**
 * Updates the shared video state.
 *
 * @param {Object} updatedState - The updated state object.
 * @returns {Function}
 */
export function updateVideoState(updatedState: {
    muted?: boolean;
    ownerId?: string;
    previousOwnerId?: string;
    status?: string;
    time?: number;
    videoUrl?: string;
}) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const currentVideoState = state['features/shared-video'];
        const localParticipantId = getLocalParticipant(state)?.id;
        const conference = getCurrentConference(state);
        const isLocalParticipantVideoOwner = localParticipantId && localParticipantId === currentVideoState.ownerId;

        if (conference && isLocalParticipantVideoOwner) {
            dispatch(setSharedVideoStatus(updatedState ? updatedState as any : currentVideoState));
        }
    };
}

/**
 * Requests shared video state update from the video owner.
 *
 * @param {Object} currentVideoState - The current video state.
 * @returns {Object}
 */
export function requestSharedVideoStateFromVideoOwner(currentVideoState: any) {
    return {
        type: REQUEST_SHARED_VIDEO_STATE,
        ...currentVideoState
    };
}

/**
 *
 * Plays a shared video.
 *
 * @param {string} videoUrl - The video url to be played.
 *
 * @returns {Function}
 */
export function playSharedVideo(videoUrl: string) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        if (!isSharedVideoEnabled(getState())) {
            return;
        }
        const conference = getCurrentConference(getState());

        if (conference) {
            const localParticipant = getLocalParticipant(getState());

            // we will send the command and will create local video fake participant
            // and start playing once we receive ourselves the command
            sendShareVideoCommand({
                conference,
                id: videoUrl,
                localParticipantId: localParticipant?.id,
                status: PLAYBACK_START,
                time: 0
            });
        }
    };
}

/**
 *
 * Stops playing a shared video.
 *
 * @returns {Function}
 */
export function toggleSharedVideo() {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const { status = '' } = state['features/shared-video'];

        if ([ PLAYBACK_STATUSES.PLAYING, PLAYBACK_START, PLAYBACK_STATUSES.PAUSED ].includes(status)) {
            dispatch(stopSharedVideo());
        } else {
            dispatch(showSharedVideoDialog((id: string) => dispatch(playSharedVideo(id))));
        }
    };
}

/**
 * Sets the allowed URL domains of the shared video.
 *
 * @param {Array<string>} allowedUrlDomains - The new whitelist to be set.
 * @returns {{
 *     type: SET_ALLOWED_URL_DOMAINS,
 *     allowedUrlDomains: Array<string>
 * }}
 */
export function setAllowedUrlDomians(allowedUrlDomains: Array<string>) {
    return {
        type: SET_ALLOWED_URL_DOMAINS,
        allowedUrlDomains
    };
}

/**
 * Shows a confirmation dialog whether to play the external video link.
 *
 * @param {string} actor - The actor's name.
 * @param {Function} onSubmit - The function to execute when confirmed.
 *
 * @returns {Function}
 */
export function showConfirmPlayingDialog(actor: String, onSubmit: Function) {
    return (dispatch: IStore['dispatch']) => {
        // shows only one dialog at a time
        dispatch(setConfirmShowVideo(false));

        dispatch(openDialog('ShareVideoConfirmDialog', ShareVideoConfirmDialog, {
            actorName: actor,
            onSubmit: () => {
                dispatch(setConfirmShowVideo(true));
                onSubmit();
            }
        }));
    };
}

/**
 * Hides the video play confirmation dialog.
 *
 * @returns {Function}
 */
export function hideConfirmPlayingDialog() {
    return (dispatch: IStore['dispatch']) => {
        dispatch(hideDialog('ShareVideoConfirmDialog', ShareVideoConfirmDialog));
    };
}

/**
 * Disables or enables the share video button.
 *
 * @param {boolean} disabled - The current state of the share video button.
 * @returns {{
 *     type: SET_DISABLE_BUTTON,
 *     disabled: boolean
 * }}
 */
export function setDisableButton(disabled: boolean) {
    return {
        type: SET_DISABLE_BUTTON,
        disabled
    };
}
