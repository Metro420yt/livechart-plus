//@ts-check

/**@type {import("./types.d.ts").Settings}*/
export const settingsMap = {
    // list
    overwriteUrl: {
        title: 'Overwrite Library URL',
        description: 'Overwrite any links going to a library',
        default: true,
        relation: 'livechart',
    },

    // crunchyroll
    hideWatched: {
        title: 'Auto-Hide Watched',
        description: 'Hide any watched episodes by default',
        default: false,
        relation: 'crunchyroll',
    },
    showCountdown: {
        title: 'Show Countdowns',
        description: 'Show countdowns for airing anime',
        default: true,
        relation: 'crunchyroll',
    },
    shortCountdown: {
        title: 'Shorten Countdown Format',
        description: 'Shorten countdown from day/hour/minute/second to d/h/m/s',
        default: false,
        relation: 'crunchyroll',
        uses: ['showCountdown']
    },
    // behind
    filterCountdown: {
        title: 'Only show airing',
        description: 'Only show anime that have an upcoming episode',
        default: false,
        relation: 'behind',
    },
    showBehindCount: {
        title: 'Show behind count',
        description: 'Show how many episodes youre behind ontop of the icon',
        default: true,
        relation: 'behind',
    },
    behindStatusFilter: {
        title: 'Status Filters',
        description: 'Select which status\'s to be considered behind',
        default: ['watching', 'considering', 'planning'],
        options: ["completed", "rewatching", "watching", "planning", "considering", "paused", "dropped", "skipping"],
        relation: 'behind',
    },

    // recent lists
    saveRecentLists: {
        title: 'Save Recent Libraries',
        description: 'Save links to libraries that you\'ve recently visited',
        default: true,
        relation: 'recentLists'
    },
    showRecentLists: {
        title: 'Show Recent Libraries',
        default: true,
        relation: 'recentLists',
        uses: ['saveRecentLists']
    },

    // recents
    recentSearches: {
        title: 'Save Recent Searches',
        default: true,
        relation: 'livechart',
    },

    //scripts
    'scr:keybinds': {
        title: 'Keybinds',
        description: 'Listen for keybound actions',
        default: true,
        relation: 'script',
    },
    'scr:behind': {
        title: 'Behind',
        description: 'Calculate what shows youre behind on',
        default: true,
        relation: 'script',
    },
    'scr:pendingRls': {
        title: 'Pending Releases',
        description: 'Only show anime that have a release (countdown)',
        default: true,
        relation: 'script',
    },
    'scr:bufferStatus': {
        title: 'Buffer Status Updates',
        description: 'Wait to toggle status filters when holding ctrl to reduce loading',
        default: true,
        relation: 'script',
    },
    'scr:betterDropdowns': {
        title: 'Better Dropdowns',
        description: 'Improved dropdowns for keyboard movement',
        default: true,
        relation: 'script',
    },
    'scr:updatedTime': {
        title: 'Library Updated Time',
        description: 'Shows when a library last updated',
        default: true,
        relation: 'script',
    },
}

/**@type {import("./types.d.ts").Relation}*/
export const relationMap = {
    crunchyroll: 'Crunchyroll',
    behind: 'Behind',
    recentLists: 'Recent Lists',
    livechart: 'Livechart.me',
    script: 'Scripts',
}

/**@type {import("./types.d.ts").NavItem[]}*/
export const navData = [
    {
        text: 'Library',
        link: '../livechart/popup.html'
    },
    {
        text: 'Settings',
        link: '../settings/popup.html'
    },
]
export const defaultPopup = chrome.runtime.getManifest().action.default_popup