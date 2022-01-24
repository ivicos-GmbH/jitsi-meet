import { ColorSchemeRegistry, schemeColor } from '../../../base/color-scheme';
import { BoxModel, fixAndroidViewClipping } from '../../../base/styles';
import BaseTheme from '../../../base/ui/components/BaseTheme.native';

export const INSECURE_ROOM_NAME_LABEL_COLOR = BaseTheme.palette.actionDanger;

const TITLE_BAR_BUTTON_SIZE = 24;


/**
 * The styles of the safe area view that contains the title bar.
 */
const titleBarSafeView = {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
};

const NAVBAR_BUTTON_SIZE = 24;

/**
 * The styles of the feature conference.
 */
export default {

    /**
     * {@code Conference} Style.
     */
    conference: fixAndroidViewClipping({
        alignSelf: 'stretch',
        backgroundColor: BaseTheme.palette.uiBackground,
        flex: 1
    }),

    displayNameContainer: {
        margin: 10
    },

    headerNavigationIcon: {
        marginLeft: 12
    },

    headerNavigationButton: {
        height: BaseTheme.spacing[6],
        marginTop: 20,
        width: BaseTheme.spacing[6]
    },

    /**
     * View that contains the indicators.
     */
    indicatorContainer: {
        flex: 1,
        flexDirection: 'row'
    },

    inviteButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1
    },

    inviteButton: {
        iconStyle: {
            padding: 10,
            color: ColorPalette.white,
            fontSize: NAVBAR_BUTTON_SIZE
        },
        underlayColor: ColorPalette.buttonUnderlay
    },

    lonelyButton: {
        alignItems: 'center',
        borderRadius: 24,
        flexDirection: 'row',
        height: BaseTheme.spacing[6],
        justifyContent: 'space-around',
        paddingHorizontal: 12
    },

    lonelyButtonComponents: {
        marginHorizontal: 6
    },

    lonelyMeetingContainer: {
        alignSelf: 'stretch',
        alignItems: 'center',
        padding: BoxModel.padding * 2
    },

    lonelyMessage: {
        paddingVertical: 12
    },

    pipButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
    },

    pipButton: {
        iconStyle: {
            padding: 10,
            color: ColorPalette.white,
            fontSize: NAVBAR_BUTTON_SIZE
        },
        underlayColor: ColorPalette.buttonUnderlay
    },

    titleBarSafeViewTransparent: {
        ...titleBarSafeView
    },

    titleBarWrapper: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: 14
    },

    roomTimer: {
        color: ColorPalette.white,
        fontSize: 12,
        fontWeight: '400',
        paddingHorizontal: 8
    },

    roomTimerView: {
        backgroundColor: BaseTheme.palette.action02,
        borderRadius: 3,
        justifyContent: 'center',
        minWidth: 50
    },

    roomName: {
        color: BaseTheme.palette.text01,
        ...BaseTheme.typography.bodyShortBold,
        paddingVertical: 6
    },

    roomNameView: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 3,
        flexShrink: 1,
        height: 28,
        justifyContent: 'center',
        paddingHorizontal: 10
    },

    roomNameWrapper: {
        flexDirection: 'row',
        marginHorizontal: 35
    },

    /**
     * The style of the {@link View} which expands over the whole
     * {@link Conference} area and splits it between the {@link Filmstrip} and
     * the {@link Toolbox}.
     */
    toolboxAndFilmstripContainer: {
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0
    },

    insecureRoomNameLabel: {
        backgroundColor: INSECURE_ROOM_NAME_LABEL_COLOR
    },

    raisedHandsCountLabel: {
        backgroundColor: BaseTheme.palette.warning02,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: BaseTheme.spacing[0],
        marginBottom: BaseTheme.spacing[0],
        marginRight: BaseTheme.spacing[1]
    },

    raisedHandsCountLabelText: {
        color: BaseTheme.palette.uiBackground,
        paddingLeft: BaseTheme.spacing[2]
    }
};

ColorSchemeRegistry.register('Conference', {
    lonelyButton: {
        backgroundColor: schemeColor('inviteButtonBackground')
    },

    lonelyMessage: {
        color: schemeColor('onVideoText')
    }
});
