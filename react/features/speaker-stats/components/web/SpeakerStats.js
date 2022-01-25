// @flow

import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { getLocalParticipant } from '../../../base/participants/functions';
import { connect } from '../../../base/redux';
import { escapeRegexp } from '../../../base/util';
import { initSearch } from '../../actions';
import { resetSearchCriteria, initUpdateStats } from '../../actions.any';
import { getSpeakerStats, getSearchCriteria } from '../../functions';


import SpeakerStatsLabels from './SpeakerStatsLabels';
import SpeakerStatsList from './SpeakerStatsList';
import SpeakerStatsSearch from './SpeakerStatsSearch';

/**
 * The type of the React {@code Component} props of {@link SpeakerStats}.
 */
type Props = {

    /**
     * The flag which shows if the facial recognition is enabled, obtained from the redux store.
     * If enabled facial expressions are shown.
     */
    _showFacialExpressions: boolean,

    /**
     * True if the client width is les than 750.
     */
    _reduceExpressions: boolean,

    /**
     * The search criteria.
     */
    _criteria: string | null,

    /**
     * Redux store dispatch method.
     */
    dispatch: Dispatch<any>,

    /**
     * The function to translate human-readable text.
     */
    t: Function
};

/**
 * React component for displaying a list of speaker stats.
 *
 * @augments Component
 */
class SpeakerStats extends Component<Props> {

    /**
     * Initializes a new SpeakerStats instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onSearch = this._onSearch.bind(this);
    }

    /**
     * Resets the search criteria when component will unmount.
     *
     * @private
     * @returns {void}
     */
    componentWillUnmount() {
        this.props.dispatch(resetSearchCriteria());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                cancelKey = 'dialog.close'
                submitDisabled = { true }
                titleKey = 'speakerStats.speakerStats'
                width = { this.props._showFacialExpressions ? 'large' : 'medium' }>
                <div className = 'speaker-stats'>
                    <SpeakerStatsSearch onSearch = { this._onSearch } />
                    <SpeakerStatsLabels
                        reduceExpressions = { this.props._reduceExpressions }
                        showFacialExpressions = { this.props._showFacialExpressions ?? false } />
                    <SpeakerStatsList />
                </div>
            </Dialog>
        );
    }

    _onSearch: () => void;

    /**
     * Search the existing participants by name.
     *
     * @returns {void}
     * @param {string} criteria - The search parameter.
     * @protected
     */
    _onSearch(criteria = '') {
        this.props.dispatch(initSearch(escapeRegexp(criteria)));
    }

    _updateStats: () => void;

    /**
     * Update the internal state with the latest speaker stats.
     *
     * @returns {void}
     * @private
     */
    _updateStats() {
        this.props.dispatch(initUpdateStats(() => this._getSpeakerStats()));
    }

    /**
     * Update the internal state with the latest speaker stats.
     *
     * @returns {Object}
     * @private
     */
    _getSpeakerStats() {
        const stats = { ...this.props.conference.getSpeakerStats() };

        for (const userId in stats) {
            if (stats[userId]) {
                if (stats[userId].isLocalStats()) {
                    const { t } = this.props;
                    const meString = t('me');

                    stats[userId].setDisplayName(
                        this.props._localDisplayName
                            ? `${this.props._localDisplayName} (${meString})`
                            : meString
                    );
                }

                if (!stats[userId].getDisplayName()) {
                    stats[userId].setDisplayName(
                        interfaceConfig.DEFAULT_REMOTE_DISPLAY_NAME
                    );
                }
            }
        }

        return stats;
    }
}

/**
 * Maps (parts of) the redux state to the associated SpeakerStats's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 * *   _localDisplayName: ?string,
 *     _showFacialExpressions: ?boolean,
 *     _reduceExpressions: boolean,
 * }}
 */
function _mapStateToProps(state) {
    const localParticipant = getLocalParticipant(state);
    const { enableFacialRecognition } = state['features/base/config'];
    const { clientWidth } = state['features/base/responsive-ui'];

    return {
        /**
         * The local display name.
         *
         * @private
         * @type {string|undefined}
         */
        _localDisplayName: localParticipant && localParticipant.name,
        _stats: getSpeakerStats(state),
        _criteria: getSearchCriteria(state),
        _showFacialExpressions: enableFacialRecognition,
        _reduceExpressions: clientWidth < 750
    };
}

export default translate(connect(_mapStateToProps)(SpeakerStats));
