// @flow

/**
 * Returns a boolean describing whether a foreground is currently set or not.
 *
 * @param {Object} state - Redux state.
 * @returns {boolean}
 */
export function isForegroundOverlayDefined(state: Object = {}) {
    const foregroundOverlayState = state['features/foreground-overlay'];

    if (foregroundOverlayState?.overlayImageUrl || foregroundOverlayState?.overlayColor) {
        return true;
    }

    return false;
}
