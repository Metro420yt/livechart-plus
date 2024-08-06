export default (config, announceIcon) => {
    const rmArr = ['watch', 'announcement'].map(str => str[0].toUpperCase() + str.slice(1))

    for (const e of document.querySelectorAll(config.selector.action)) {
        const target = e.children[1]
        const text = target?.innerText || e.title
        if (!text) continue;

        if (rmArr.includes(text)) {
            e.title = text
            target?.remove()
        }

        if (text === 'Announcement') {
            const svg = document.createElement('img')
            svg.style = `height:inherit;--lc-mask-image:url(${announceIcon});`
            svg.classList.add('lc-icon-masked')
            e.replaceChildren(svg)
        }
    }
}
