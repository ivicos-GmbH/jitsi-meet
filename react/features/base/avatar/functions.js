// @flow

import GraphemeSplitter from 'grapheme-splitter';
import _ from 'lodash';

const AVATAR_COLORS = [
    '#6A50D3',
    '#FF9B42',
    '#DF486F',
    '#73348C',
    '#B23683',
    '#F96E57',
    '#4380E2',
    '#2AA076',
    '#00A8B3'
];
const wordSplitRegex = (/\s+|\.+|_+|;+|-+|,+|\|+|\/+|\\+|"+|'+|\(+|\)+|#+|&+/);
const splitter = new GraphemeSplitter();

/**
 * Generates the background color of an initials based avatar.
 *
 * @param {string?} initials - The initials of the avatar.
 * @param {Array<strig>} customAvatarBackgrounds - Custom avatar background values.
 * @returns {string}
 */
export function getAvatarColor(initials: ?string, customAvatarBackgrounds: Array<string>) {
    const hasCustomAvatarBackgronds = customAvatarBackgrounds && customAvatarBackgrounds.length;
    const colorsBase = hasCustomAvatarBackgronds ? customAvatarBackgrounds : AVATAR_COLORS;

    let colorIndex = 0;

    if (initials) {
        let nameHash = 0;

        for (const s of initials) {
            nameHash += s.codePointAt(0);
        }

        colorIndex = nameHash % colorsBase.length;
    }

    return hasCustomAvatarBackgronds ? colorsBase[colorIndex] : `rgba(${colorsBase[colorIndex]}, ${AVATAR_OPACITY})`;
}

/**
 * Generates initials for a simple string.
 *
 * @param {string?} s - The string to generate initials for.
 * @returns {string?}
 */
export function getInitials(s: ?string) {
    // We don't want to use the domain part of an email address, if it is one
    const initialsBasis = _.split(s, '@')[0];
    const [ firstWord, secondWord ] = initialsBasis.split(wordSplitRegex).filter(Boolean);

    return getFirstGraphemeUpper(firstWord) + getFirstGraphemeUpper(secondWord);
}

/**
 * Checks if the passed URL should be loaded with CORS.
 *
 * @param {string} url - The URL.
 * @param {Array<string>} corsURLs - The URL pattern that matches a URL that needs to be handled with CORS.
 * @returns {void}
 */
export function isCORSAvatarURL(url: string | any = '', corsURLs: Array<string> = []) {
    return corsURLs.some(pattern => url.startsWith(pattern));
}
