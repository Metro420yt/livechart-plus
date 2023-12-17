// used in all popups, auto adds listed imports

/**@type {import("../types").importItem[]}*/
const importList = [
    '/global/nav.js',
    '/global/relatedSettings.js',
    {
        tag: 'link',
        data: {
            href: '/global/_.css',
            rel: 'stylesheet',
        },
    },
    './popup.js'
]

importList.forEach(item => {
    const element = document.createElement(item.tag || 'script')
    var link = typeof item === 'string' ? item : item.path

    if (item.data) for (const key in item.data) element[key] = item.data[key]
    else {
        element.src = link
        element.type = item.type || 'module'
    }
    document.head.appendChild(element)
})