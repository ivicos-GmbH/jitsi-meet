// @flow

import React, { Component } from 'react';

import { Watermarks } from '../../base/react';
import { connect } from '../../base/redux';
import { setColorAlpha } from '../../base/util';
import { Subject } from '../../conference';
import { fetchCustomBrandingData } from '../../dynamic-branding';
import { Captions } from '../../subtitles/';

declare var interfaceConfig: Object;

type Props = {

    /**
     * The alpha(opacity) of the background
     */
    _backgroundAlpha: number,

    /**
     * The user selected background color.
     */
     _customBackgroundColor: string,

    /**
     * The user selected background image url.
     */
     _customBackgroundImageUrl: string,

    /**
     * Fetches the branding data.
     */
    _fetchCustomBrandingData: Function,

    /**
     * Prop that indicates whether the chat is open.
     */
    _isChatOpen: boolean,

    /**
     * Used to determine the value of the autoplay attribute of the underlying
     * video element.
     */
    _noAutoPlayVideo: boolean
}

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on Web/React.
 *
 * @extends Component
 */
class LargeVideo extends Component<Props> {
    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props._fetchCustomBrandingData();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const style = this._getCustomSyles();
        const className = `videocontainer${this.props._isChatOpen ? ' shift-right' : ''}`;

        return (
            <div
                className = { className }
                id = 'largeVideoContainer'
                style = { style }>
                <Subject />
                <div id = 'sharedVideo'>
                    <div id = 'sharedVideoIFrame' />
                </div>
                <div id = 'etherpad' />

                <Watermarks />

                <div id = 'dominantSpeaker'>
                    <div className = 'dynamic-shadow' />
                    <div id = 'dominantSpeakerAvatarContainer' />
                </div>
                <div id = 'remotePresenceMessage' />
                <span id = 'remoteConnectionMessage' />
                <div id = 'largeVideoElementsContainer'>
                    <div id = 'largeVideoBackgroundContainer' />

                    {/*
                      * FIXME: the architecture of elements related to the large
                      * video and the naming. The background is not part of
                      * largeVideoWrapper because we are controlling the size of
                      * the video through largeVideoWrapper. That's why we need
                      * another container for the background and the
                      * largeVideoWrapper in order to hide/show them.
                      */}
                    <div id = 'largeVideoWrapper'>
                        <video
                            autoPlay = { !this.props._noAutoPlayVideo }
                            id = 'largeVideo'
                            muted = { true }
                            playsInline = { true } /* for Safari on iOS to work */ />
                    </div>
                </div>
                { interfaceConfig.DISABLE_TRANSCRIPTION_SUBTITLES
                    || <Captions /> }
            </div>
        );
    }

    /**
     * Creates the custom styles object.
     *
     * @private
     * @returns {Object}
     */
    _getCustomSyles() {
        const styles = {};
        const { _customBackgroundColor, _customBackgroundImageUrl } = this.props;

        styles.backgroundColor = _customBackgroundColor || interfaceConfig.DEFAULT_BACKGROUND;

        if (this.props._backgroundAlpha !== undefined) {
            const alphaColor = setColorAlpha(styles.backgroundColor, this.props._backgroundAlpha);

            styles.backgroundColor = alphaColor;
        }

        if (_customBackgroundImageUrl) {
            styles.backgroundImage = `url(${_customBackgroundImageUrl})`;
            styles.backgroundSize = 'cover';
        }

        return styles;
    }
}

/**
 * For a local participant, extract the background-related information from the participant state.
 *
 * @param {Object} participant - The Redux state for participants feature.
 * @private
 * @returns {Object}
 */
function _extractBackgroundInfo(participant) {
    const { backgroundColor, backgroundImageUrl, backgroundLastUpdate } = participant;

    return {
        backgroundColor,
        backgroundImageUrl,
        backgroundLastUpdate
    };
}

/**
 * For a remote participant, extract the background-related information from the conference state.
 *
 * @param {Object} participant - Participant related information in the conference state.
 * @private
 * @returns {Object}
 */
function _extractBackgroundInfoRemote(participant) {
    if (!participant?._properties) {
        return {
            backgroundColor: undefined,
            backgroundImageUrl: undefined,
            backgroundLastUpdate: undefined
        };
    }
    const properties = participant?._properties;

    return {
        backgroundColor: properties.backgroundColor,
        backgroundImageUrl: properties.backgroundImageUrl,
        backgroundLastUpdate: properties.backgroundLastUpdate
    };
}

/**
 * The function synchronizes the information between local and remote participants to get the latest
 * background defined.
 *
 * @param {Object} participantsState - Participants redux state.
 * @param {Object} conferenceState - Conference redux state.
 * @private
 * @returns {Object}
 */
function _getLatestBackground(participantsState, conferenceState) {

    const localParticipant = participantsState
        .filter(participant => participant.local)
        .map(p => _extractBackgroundInfo(p));

    const remoteParticipants = participantsState
        .filter(participant => !participant.local)
        .map(p => (conferenceState?.participants || {})[p.id])
        .map(p => _extractBackgroundInfoRemote(p));

    const participants = localParticipant
        .concat(remoteParticipants)
        .filter(participant => participant.backgroundLastUpdate !== undefined);

    console.log('Background participants list : ');
    console.log(participants);
    const reference = participants
        .sort((a, b) => parseInt(b.backgroundLastUpdate, 10) - parseInt(a.backgroundLastUpdate, 10))[0];

    console.log('Background reference chosen : ');
    console.log(reference);

    return {
        backgroundColor: reference?.backgroundColor,
        backgroundImageUrl: reference?.backgroundImageUrl
    };
}

/**
 * Returns background properties depending on the states of participants, conference and dynamic branding.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function _resolveBackground(state) {
    const participantsState = state['features/base/participants'];
    const conferenceState = state['features/base/conference'].conference;
    const dynamicBrandingState = state['features/dynamic-branding'];

    const { backgroundColor, backgroundImageUrl } = _getLatestBackground(participantsState, conferenceState);

    if (backgroundColor || backgroundImageUrl) {
        return {
            backgroundColor,
            backgroundImageUrl
        };
    }

    return {
        backgroundColor: dynamicBrandingState.backgroundColor,
        backgroundImageUrl: dynamicBrandingState.backgroundImageUrl
    };
}

/**
 * Maps (parts of) the Redux state to the associated LargeVideo props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const testingConfig = state['features/base/config'].testing;
    const { backgroundColor, backgroundImageUrl } = _resolveBackground(state);
    const { isOpen: isChatOpen } = state['features/chat'];

    return {
        _backgroundAlpha: state['features/base/config'].backgroundAlpha,
        _customBackgroundColor: backgroundColor,
        _customBackgroundImageUrl: backgroundImageUrl,
        _isChatOpen: isChatOpen,
        _noAutoPlayVideo: testingConfig?.noAutoPlayVideo
    };
}

const _mapDispatchToProps = {
    _fetchCustomBrandingData: fetchCustomBrandingData
};

export default connect(_mapStateToProps, _mapDispatchToProps)(LargeVideo);
