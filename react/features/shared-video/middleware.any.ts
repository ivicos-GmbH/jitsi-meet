/* global APP */

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable valid-jsdoc */

import { IStore } from '../app/types';
import { CONFERENCE_JOIN_IN_PROGRESS, CONFERENCE_LEFT } from '../base/conference/actionTypes';
import { getCurrentConference } from '../base/conference/functions';
import { IJitsiConference } from '../base/conference/reducer';
import { SET_CONFIG } from '../base/config/actionTypes';
import { MEDIA_TYPE } from '../base/media/constants';
import { PARTICIPANT_LEFT } from '../base/participants/actionTypes';
import { participantJoined, participantLeft, pinParticipant } from '../base/participants/actions';
import { getLocalParticipant, getParticipantById, getParticipantDisplayName } from '../base/participants/functions';
import { FakeParticipant } from '../base/participants/types';
import MiddlewareRegistry from '../base/redux/MiddlewareRegistry';
import StateListenerRegistry from '../base/redux/StateListenerRegistry';
import { SET_DYNAMIC_BRANDING_DATA } from '../dynamic-branding/actionTypes';
import { showWarningNotification } from '../notifications/actions';
import { NOTIFICATION_TIMEOUT_TYPE } from '../notifications/constants';

import { REQUEST_SHARED_VIDEO_STATE, RESET_SHARED_VIDEO_STATUS, SET_SHARED_VIDEO_STATUS } from './actionTypes';
import {
    hideConfirmPlayingDialog,
    resetSharedVideoStatus,
    setAllowedUrlDomians,
    setSharedVideoStatus,
    showConfirmPlayingDialog
} from './actions.any';
import {
    REQUEST_SHARED_VIDEO_STATE_COMMAND,
    DEFAULT_ALLOWED_URL_DOMAINS,
    PLAYBACK_START,
    PLAYBACK_STATUSES,
    SHARED_VIDEO,
    VIDEO_PLAYER_PARTICIPANT_NAME
} from './constants';
import { fetchStoppedVideoUrl, isSharedVideoEnabled, isSharingStatus, isURLAllowedForSharedVideo } from './functions';
import logger from './logger';
import { ISharedVideoState } from './reducer';


/**
 * Middleware that captures actions related to video sharing and updates
 * components not hooked into redux.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const { dispatch, getState } = store;
    const state = getState();
    const conference = getCurrentConference(state);
    const localParticipantId = getLocalParticipant(state)?.id;
    const { videoUrl, status, ownerId, time, muted, volume, previousOwnerId } = action;
    const sharedVideoCurrentState: ISharedVideoState = state['features/shared-video'];

    const getNewVideoOwnerId = (conference: any, localParticipantId: any) => {
        const remoteParticipantIds = conference ? Object.keys(conference.participants) : [];
        const allParticipantIds = [ localParticipantId, ...remoteParticipantIds ];

        allParticipantIds.sort((a, b) => a.localeCompare(b));
        console.log('!!! All participant Ids ', allParticipantIds);
        console.log('!!! Local participant Id ', localParticipantId);

        return allParticipantIds[0].length > 0 && allParticipantIds[0];
    };

    if (!isSharedVideoEnabled(getState())) {
        return next(action);
    }

    switch (action.type) {
    case CONFERENCE_JOIN_IN_PROGRESS: {
        const { conference } = action;
        const localParticipantId = getLocalParticipant(getState())?.id;

        conference.addCommandListener(SHARED_VIDEO,
            ({ value, attributes }: { attributes: {
                from: string; muted: string; ownerId: string; previousOwnerId: string; state: string; time: string; }; value: string; }) => {

                const { from } = attributes;
                const sharedVideoStatus = attributes.state;

                if (isSharingStatus(sharedVideoStatus)) {
                    // confirmShowVideo is undefined the first time we receive
                    // when confirmShowVideo is false we ignore everything except stop that resets it
                    if (getState()['features/shared-video'].confirmShowVideo === false) {
                        return;
                    }

                    if (isURLAllowedForSharedVideo(value, getState()['features/shared-video'].allowedUrlDomains, true)
                        || localParticipantId === from
                        || getState()['features/shared-video'].confirmShowVideo) { // if confirmed skip asking again
                        handleSharingVideoStatus(store, value, attributes, conference);
                    } else {
                        dispatch(showConfirmPlayingDialog(getParticipantDisplayName(getState(), from), () => {

                            handleSharingVideoStatus(store, value, attributes, conference);

                            return true; // on mobile this is used to close the dialog
                        }));
                    }

                    return;
                }

                if (sharedVideoStatus === 'stop') {
                    const videoParticipant = getParticipantById(state, value);

                    if (getState()['features/shared-video'].confirmShowVideo === false) {
                        dispatch(showWarningNotification({
                            titleKey: 'dialog.shareVideoLinkStopped',
                            titleArguments: {
                                name: getParticipantDisplayName(getState(), from)
                            }
                        }, NOTIFICATION_TIMEOUT_TYPE.LONG));
                    }

                    dispatch(hideConfirmPlayingDialog());

                    dispatch(participantLeft(value, conference, {
                        fakeParticipant: videoParticipant?.fakeParticipant
                    }));

                    if (localParticipantId !== from) {
                        dispatch(resetSharedVideoStatus());
                    }
                }
            }
        );
        break;
    }
    case CONFERENCE_LEFT:
        dispatch(setAllowedUrlDomians(DEFAULT_ALLOWED_URL_DOMAINS));
        dispatch(resetSharedVideoStatus());
        break;
    case REQUEST_SHARED_VIDEO_STATE:
        sendRequestSharedVideoStateCommand(conference, videoUrl, localParticipantId);
        break;

    case PARTICIPANT_LEFT: {
        const hasVideoOwnerLeft = action.participant.id === sharedVideoCurrentState.ownerId;

        if (hasVideoOwnerLeft) {

            const { 'disabled': deletedKey, ...newState } = { ...sharedVideoCurrentState };

            if (conference && getNewVideoOwnerId(conference, localParticipantId) === localParticipantId) {
                newState.ownerId = localParticipantId;
                newState.previousOwnerId = sharedVideoCurrentState.ownerId;


                dispatch(setSharedVideoStatus({
                    ...newState
                }));
            }
        }
        break;
    }
    case SET_CONFIG:
    case SET_DYNAMIC_BRANDING_DATA: {
        const result = next(action);
        const state = getState();
        const { sharedVideoAllowedURLDomains: allowedURLDomainsFromConfig = [] } = state['features/base/config'];
        const { sharedVideoAllowedURLDomains: allowedURLDomainsFromBranding = [] } = state['features/dynamic-branding'];

        dispatch(setAllowedUrlDomians([
            ...DEFAULT_ALLOWED_URL_DOMAINS,
            ...allowedURLDomainsFromBranding,
            ...allowedURLDomainsFromConfig
        ]));

        return result;
    }
    case SET_SHARED_VIDEO_STATUS: {
        const state = getState();
        const conference = getCurrentConference(state);
        const localParticipantId = getLocalParticipant(state)?.id;
        const { videoUrl, status, ownerId, time, muted, volume } = action;

        const operator = status === PLAYBACK_STATUSES.PLAYING ? 'is' : '';

        // logger.debug(`User with id: ${ownerId} ${operator} ${status} video sharing.`);

        if (typeof APP !== 'undefined') {
            APP.API.notifyAudioOrVideoSharingToggled(MEDIA_TYPE.VIDEO, status, ownerId);
        }

        getNewVideoOwnerId(conference, localParticipantId);
        if (sharedVideoCurrentState.ownerId === '' || localParticipantId === sharedVideoCurrentState.ownerId) {
            sendShareVideoCommand({
                conference,
                localParticipantId,
                muted,
                status,
                time,
                id: videoUrl,
                ownerId,
                previousOwnerId
            });
        }
        break;
    }
    case RESET_SHARED_VIDEO_STATUS: {
        const state = getState();
        const localParticipantId = getLocalParticipant(state)?.id;
        const { ownerId: stateOwnerId, videoUrl: statevideoUrl } = state['features/shared-video'];

        if (!stateOwnerId) {
            break;
        }

        logger.debug(`User with id: ${stateOwnerId} stop video sharing.`);

        if (typeof APP !== 'undefined') {
            APP.API.notifyAudioOrVideoSharingToggled(MEDIA_TYPE.VIDEO, 'stop', stateOwnerId);
        }

        if (localParticipantId === stateOwnerId && sharedVideoCurrentState.videoUrl) {
            const conference = getCurrentConference(state);

            sendShareVideoCommand({
                conference,
                id: sharedVideoCurrentState.videoUrl,
                localParticipantId,
                muted: true,
                status: 'stop',
                time: 0,
                ownerId: sharedVideoCurrentState.ownerId,
                previousOwnerId: sharedVideoCurrentState.previousOwnerId
            });
        }
        break;
    }
    }

    return next(action);
});

/**
 * Set up state change listener to perform maintenance tasks when the conference
 * is left or failed, e.g. Clear messages or close the chat modal if it's left
 * open.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, store, previousConference) => {
        if (conference && conference !== previousConference) {
            conference.addCommandListener(SHARED_VIDEO,
                ({ value, attributes }: { attributes: any; value: any; }) => {

                    const { dispatch, getState } = store;
                    const { from } = attributes;
                    const localParticipantId = getLocalParticipant(getState())?.id;
                    const status = attributes.state;

                    if (isSharingStatus(status)) {
                        handleSharingVideoStatus(store, value, attributes, conference);
                    } else if (status === 'stop') {
                        dispatch(participantLeft(value, conference));
                        if (localParticipantId !== from) {
                            fetchStoppedVideoUrl();
                            dispatch(resetSharedVideoStatus());
                        }
                    }
                }
            );
        }
    }
);


/**
 * Handles the playing, pause and start statuses for the shared video.
 * Dispatches participantJoined event and, if necessary, pins it.
 * Sets the SharedVideoStatus if the event was triggered by the local user.
 *
 * @param {Store} store - The redux store.
 * @param {string} videoUrl - The id of the video to the shared.
 * @param {Object} attributes - The attributes received from the share video command.
 * @param {JitsiConference} conference - The current conference.
 * @returns {void}
 */
function handleSharingVideoStatus(store: IStore, videoUrl: string,
        // eslint-disable-next-line max-len
        { state, time, from, muted, ownerId, previousOwnerId }: { from: string; muted: string; ownerId: string; previousOwnerId: string; state: string; time: string; },
        conference: IJitsiConference) {
    const { dispatch, getState } = store;
    const localParticipantId = getLocalParticipant(getState())?.id;
    const oldStatus = getState()['features/shared-video']?.status ?? '';
    const oldVideoUrl = getState()['features/shared-video'].videoUrl;

    if (oldVideoUrl && oldVideoUrl !== videoUrl) {
        logger.warn(
            `User with id: ${from} sent videoUrl: ${videoUrl} while we are playing: ${oldVideoUrl}`);

        return;
    }

    // If the video was not started (no participant) we want to create the participant
    // this can be triggered by start, but also by paused or playing
    // commands (joining late) and getting the current state
    if (state === PLAYBACK_START || !isSharingStatus(oldStatus)) {
        const youtubeId = videoUrl.match(/http/) ? false : videoUrl;
        const avatarURL = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : '';

        dispatch(participantJoined({
            conference,
            fakeParticipant: FakeParticipant.SharedVideo,
            id: videoUrl,
            avatarURL,
            name: VIDEO_PLAYER_PARTICIPANT_NAME
        }));

        dispatch(pinParticipant(videoUrl));

        if (localParticipantId === from) {
            dispatch(setSharedVideoStatus({
                videoUrl,
                status: state,
                time: Number(time),
                ownerId: localParticipantId
            }));
        }
    }

    if (localParticipantId !== from) {
        const newState = {
            muted: muted === 'true',
            ownerId,
            status: state,
            time: Number(time),
            videoUrl,
            previousOwnerId
        };

        dispatch(setSharedVideoStatus(newState));
    }
}

/* eslint-disable max-params */

/**
 * Sends SHARED_VIDEO command.
 *
 * @param {string} id - The id of the video.
 * @param {string} status - The status of the shared video.
 * @param {JitsiConference} conference - The current conference.
 * @param {string} localParticipantId - The id of the local participant.
 * @param {string} time - The seek position of the video.
 * @param {string} ownerId - The id of video owner.
 * @param {string} previousOwnerId - The id of the previous video.
 * @returns {void}
 */
// eslint-disable-next-line max-len, require-jsdoc
function sendShareVideoCommand({ id, status, conference, localParticipantId = '', time, muted, ownerId, previousOwnerId }: {
    conference?: IJitsiConference; id: string; localParticipantId?: string; muted: boolean;
    ownerId?: string; previousOwnerId?: string; status: string; time: number;
}): void {
    conference?.sendCommandOnce(SHARED_VIDEO, {

        value: id,
        attributes: {
            from: localParticipantId,
            muted,
            state: status,
            time,
            ownerId,
            previousOwnerId
        }
    });
}


/**
 * Sends REQUEST_SHARED_VIDEO_STATE_COMMAND command.
 *
 * @param {string} id - The id of the video.
 * @param {JitsiConference} conference - The current conference.
 * @param {string} localParticipantId - The id of the local participant.
 * @returns {void}
 */
function sendRequestSharedVideoStateCommand(conference: any, videoUrl: any, localParticipantId: any) {
    conference.sendCommandOnce(REQUEST_SHARED_VIDEO_STATE_COMMAND, {
        value: videoUrl,
        attributes: {
            from: localParticipantId
        }
    });
}

/**
 * Set up state change listener to receive reqeusts for shraed video state broadcast by the video owner.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, store, previousConference) => {
        if (conference && conference !== previousConference) {
            conference.addCommandListener(REQUEST_SHARED_VIDEO_STATE_COMMAND,
                ({ value, attributes }: { attributes: any; value: any; }) => {

                    const { dispatch, getState } = store;
                    const { from } = attributes;
                    const localParticipantId = getLocalParticipant(getState())?.id;
                    const videoState = APP.store.getState()['features/shared-video'];

                    // eslint-disable-next-line max-len
                    if (videoState.status === 'pause' && localParticipantId === videoState.ownerId && localParticipantId !== from) {
                        const newVideoState = { ...videoState,
                            time: videoState.time ? videoState?.time + 0.001 : undefined };

                        dispatch(setSharedVideoStatus(newVideoState));
                    }
                }
            );
        }
    }
);
