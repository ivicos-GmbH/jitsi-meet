// @flow

import { StateListenerRegistry } from '../base/redux';

declare var APP: Object;

/**
 * Send an event when the foreground overlay has been changed
 */
StateListenerRegistry.register(
    /* selector */ state => state['features/foreground-overlay'],
    /* listener */state => {

        if (typeof APP !== 'undefined') {
            APP.API.notifyForegroundOverlayChanged(
                {
                    overlayImageUrl: state.overlayImageUrl,
                    overlayColor: state.overlayColor,
                    mode: state.mode
                });
        }
    }
);
