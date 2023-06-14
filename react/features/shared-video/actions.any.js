import { getCurrentConference } from '../base/conference';
import { openDialog } from '../base/dialog/actions';
import { getLocalParticipant } from '../base/participants';
import { SharedVideoDialog } from '../shared-video/components';

import { RESET_SHARED_VIDEO_STATUS, SET_SHARED_VIDEO_STATUS,REQUEST_SHARED_VIDEO_STATE } from './actionTypes';

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
 * @param {string} options.ownerId - Participant ID of the owner.
 * @param {string} options.status - Sharing status.
 * @param {number} options.time - Playback timestamp.
 * @param {string} options.videoUrl - URL of the shared video.
 *
 * @returns {{
 *     type: SET_SHARED_VIDEO_STATUS,
 *     muted: boolean,
 *     ownerId: string,
 *     status: string,
 *     time: number,
 *     videoUrl: string,
 *     previousOwnerId: string,
 * }}
 */
export function setSharedVideoStatus({ videoUrl, status, time, ownerId, muted, previousOwnerId }) {
    return {
        type: SET_SHARED_VIDEO_STATUS,
        ownerId,
        status,
        time,
        videoUrl,
        muted,
        previousOwnerId
    };
}

/**
 * Displays the dialog for entering the video link.
 *
 * @param {Function} onPostSubmit - The function to be invoked when a valid link is entered.
 * @returns {Function}
 */
export function showSharedVideoDialog(onPostSubmit) {
    return openDialog(SharedVideoDialog, { onPostSubmit });
}

/**
 *
 * Stops playing a shared video.
 *
 * @returns {Function}
 */
export function stopSharedVideo() {
    return (dispatch, getState) => {
        const state = getState();
        const { ownerId } = state['features/shared-video'];
        const localParticipant = getLocalParticipant(state);

        if (ownerId === localParticipant.id) {
            dispatch(resetSharedVideoStatus());
        }
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
export function playSharedVideo(videoUrl) {
    return (dispatch, getState) => {
        const conference = getCurrentConference(getState());

        if (conference) {
            const localParticipant = getLocalParticipant(getState());

            dispatch(setSharedVideoStatus({
                videoUrl,
                status: 'start',
                time: 0,
                ownerId: localParticipant.id,
                previousOwnerId: null 
            }));
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
    return (dispatch, getState) => {
        const state = getState();
        const { status } = state['features/shared-video'];

        if ([ 'playing', 'start', 'pause' ].includes(status)) {
            dispatch(stopSharedVideo());
        } else {
            dispatch(showSharedVideoDialog(id => dispatch(playSharedVideo(id))));
        }
    };
}

/**
 *
 * Updates a shared video ownerId.
 *
 * @param {string} ownerId - The new Video Owner Id for the current video.
 *
 * @returns {Function}
 */
export function updateSharedVideoOwner(ownerId) {
    return (dispatch, getState) => {
        const conference = getCurrentConference(getState());
        const state = getState();
        const currentVideoState = state['features/shared-video'];

        if (conference) {

            dispatch(setSharedVideoStatus({
                videoUrl: currentVideoState.videoUrl,
                status: currentVideoState.status,
                time: currentVideoState.time,
                muted: currentVideoState.muted,
                ownerId: ownerId,
                previousOwnerId: currentVideoState.ownerId
            }));
        }
    };
}

/**
 *
 * Pauses a shared video
 *
 * @returns {Function}
 */
export function pauseSharedVideo() {
    return (dispatch, getState) => {
        const conference = getCurrentConference(getState());
        const state = getState();
        const currentVideoState = state['features/shared-video'];

        if (conference) {

            dispatch(setSharedVideoStatus({
                videoUrl: currentVideoState.videoUrl,
                status: 'pause',
                time: currentVideoState.time,
                muted: currentVideoState.muted,
                ownerId: currentVideoState.ownerId,
                previousOwnerId: currentVideoState.previousOwnerId
            }));
        }
    };
}


/**
 *
 * Shared video state is updated with the passed object
 *
 * @param {string} videoUrl - The video url to be played.
 *
 * @returns {Function}
 */
export function updateVideoState(updatedState) {
    return (dispatch, getState) => {
        const state = getState();
        const currentVideoState = state['features/shared-video'];
        const localParticipantId = getLocalParticipant(state)?.id;
        const conference = getCurrentConference(state);

        if (conference && localParticipantId && localParticipantId===currentVideoState.ownerId){
            dispatch(setSharedVideoStatus(updatedState ? updatedState : currentVideoState));
        }
    };
}

/**
 * Requests shared video state from the video owner.
 *
 * @returns {{
*     type: REQUEST_SHARED_VIDEO_STATE,
*     muted: boolean,
*     ownerId: string,
*     status: string,
*     time: number,
*     videoUrl: string,
*     previousOwnerId: string,
* }}
*/

export function requestSharedVideoStateFromVideoOwner(currentVideoState) {
    // const currentVideoState = state['features/shared-video']
    return {
        type: REQUEST_SHARED_VIDEO_STATE,
        ...currentVideoState
    };
}
