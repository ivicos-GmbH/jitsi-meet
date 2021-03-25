// @flow

import { getLocalParticipant } from '../base/participants';
import { StateListenerRegistry } from '../base/redux';

import {
    resizeLargeVideo
} from './../large-video';
import { updateBackgroundData } from './actions';
import { extractBackgroundProperties } from './functions';

declare var APP: Object;

/**
 * Updates the room background when participants backgroundData property is updated
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/base/participants'],
    /* listener */(state, { dispatch }, previousState) => {

        if (!state.length) {
            return;
        }

        const localParticipant = getLocalParticipant(state);
        const backgroundData = localParticipant?.backgroundData;

        if (backgroundData === getLocalParticipant(previousState)?.backgroundData) {
            return;
        }

        // Updating the background of the room
        dispatch(updateBackgroundData(backgroundData));

        // Sending an event to the client to communicate the background change
        if (typeof APP !== 'undefined') {
            const backgroundProperties = extractBackgroundProperties(backgroundData);

            APP.API.notifyBackgroundChanged(
                localParticipant.id,
                {
                    backgroundImageUrl: backgroundProperties.backgroundImageUrl,
                    backgroundColor: backgroundProperties.backgroundColor
                });
        }
    }
);

/**
 * When the background of the room is updated, resize the video.
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/room-background'],
    /* listener */(state, { dispatch }) => {
        dispatch(resizeLargeVideo());
    }
);
