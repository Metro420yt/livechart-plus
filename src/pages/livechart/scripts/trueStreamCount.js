export default async (config) => {
    while (!document.querySelector('[data-controller="mark-icon"]').dataset.markIconViewerStatusValue) await new Promise(r => setTimeout(r, 5000))

    for (const parent of document.querySelectorAll(config.selector.streams.parent)) {
        const count = parent.querySelectorAll(config.selector.streams.item).length
        const label = parent.querySelector(config.selector.streams.label)

        // label.innerText = `${count} (${label.innerText})` //BUG: runs twice sometimes, messing up the label
        label.innerText = count
    }
}
