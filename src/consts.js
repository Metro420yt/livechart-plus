//@ts-check

/**@type {import("./types.d.ts").Settings}*/
export const settingsMap = {
    // livechart
    overwriteUrl: {
        title: 'Overwrite Library URL',
        description: 'Overwrite any links going to a library',
        default: true,
        relation: 'livechart',
    },
    betterDropdowns: {
        title: 'Better Dropdowns',
        description: 'Improved dropdowns for keyboard movement',
        default: true,
        relation: 'livechart',
    },
    recentSearches: {
        title: 'Save Recent Searches',
        default: true,
        relation: 'livechart',
    },
    keybinds: {
        title: 'Livechart Keybinds',
        description: 'Listen for keybound actions',
        default: true,
    },

    //library
    pendingRls: {
        title: 'Pending Releases',
        description: 'Show anime that have an upcoming first episode',
        default: true,
        relation: 'library',
    },
    bufferStatus: {
        title: 'Buffer Status Updates',
        description: 'Wait to toggle status filters when holding ctrl to reduce loading',
        default: true,
        relation: 'library',
    },
    updatedTime: {
        title: 'Updated Timestamp',
        description: 'Shows when a library was last updated',
        default: true,
        relation: 'library',
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
        relation: 'countdown',
    },
    countdownKeys: {
        title: 'Key Limit',
        description: 'How many keys (day, hour, etc.) to show',
        default: 2,
        range: [1, 4],
        uses: ['showCountdown'],
        relation: 'countdown',
    },
    countdownFormat: {
        title: 'Format',
        description: 'Shorten countdown from day/hour/minute/second to d/h/m/s',
        default: 'short',
        options: {
            long: 'day/hour/minute/second',
            short: 'd/h/m/s',
        },
        uses: ['showCountdown'],
        relation: 'countdown',
    },


    // behind
    behind: {
        title: 'Show Behind',
        description: 'Calculate what shows youre behind on',
        default: true,
        relation: 'behind',
    },
    behindCountdown: {
        title: 'Only count airing',
        description: 'Only count anime that have are airing',
        default: false,
        relation: 'behind',
        uses: ['behind']
    },
    behindCount: {
        title: 'Show count',
        description: 'Show how many episodes youre behind ontop of the icon',
        default: true,
        relation: 'behind',
        uses: ['behind']
    },
    behindStatusFilter: {
        title: 'Status Filters',
        description: 'Select which status\'s to be considered behind',
        default: ['watching', 'considering', 'planning'],
        options: ["completed", "rewatching", "watching", "planning", "considering", "paused", "dropped", "skipping"],
        relation: 'behind',
        uses: ['behind']
    },
}

/**@type {import("./types.d.ts").Relation}*/
export const relationMap = {
    notifications: 'Notifications',
    library: 'Library',
    crunchyroll: 'Crunchyroll',
    behind: 'Behind',
    recentLists: 'Recent Lists',
    livechart: 'Livechart.me',
    countdown: 'Countdowns'
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
    {
        text: 'Changelog',
        link: '../changelog/popup.html',
        footer: true
    },
]
export const defaultPopup = chrome.runtime.getManifest().action.default_popup