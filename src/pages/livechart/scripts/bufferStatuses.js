export default (config) => {
    const links = document.querySelectorAll(config.selector.library.statusFilterLink)
    var marks = {}
    for (const link of links) {
        marks[link.dataset.libraryStatus] = link.classList.contains(config.className.statusFilterMarked)
        link.onclick = e => clickHandler(link, e)
    }
    const origMarks = JSON.stringify({ ...marks })

    document.addEventListener('keyup', (event) => {
        if (
            event.key === 'Control'
            && JSON.stringify(marks) !== origMarks
        ) load()
    })


    function clickHandler(link, event) { // add status to buffer
        event.preventDefault()
        marks[link.dataset.libraryStatus] = !marks[link.dataset.libraryStatus] // add or remove items from buffer

        if (event.ctrlKey) link.dataset.toggled = link.dataset.toggled === 'true' ? false : true
        else load()
    }
    function load() {
        if (Object.values(marks).every(v => v === false)) marks = marks = { completed: true, rewatching: true, watching: true, planning: true, considering: true, }
        const url = new URL(decodeURIComponent(document.location))

        const q = config.queryKey.status
        url.searchParams.delete(q)
        for (const key in marks) if (marks[key] === true) url.searchParams.append(q, key)
        document.location = url.href
    }
}