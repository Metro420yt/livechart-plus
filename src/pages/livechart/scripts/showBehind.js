export default (settings, behindIcon, config) => {
    const parent = document.querySelector(config.selector.library.behindParent)
    const button = document.getElementById('lcx-btn-behind') || document.createElement('button')
    button.id = 'lcx-btn-behind'
    button.classList = 'btn btn-sm'
    button.innerText = 'Behind'
    button.title = 'Show airing anime that you\'re behind on'
    parent.appendChild(button)
    button.dataset.toggled = false

    var animes = document.querySelectorAll(config.selector.library.anime)
    button.onclick = async ({ target }) => {
        for (const btn of document.querySelectorAll(`[id^="lcx-btn-"][data-toggled="true"]:not(#${button.id})`)) btn.click()

        if (target.dataset.toggled === 'true') {
            target.dataset.toggled = false
            for (const a of animes) a.style.display = ''
        }
        else {
            target.dataset.toggled = true
            for (var a of animes) isBehind(a) ? a.style.display = '' : a.style.display = 'none'
        }
    }
    for (const a of animes) behindHandler(a)


    document.addEventListener('modalSubmit', async ({ detail: { target } }) => {
        const anime = document.querySelector(`[data-user-library-anime-id="${target.dataset.libraryEditorAnimeId}"]`), updatedEp = document.getElementById('library_editor_episodesWatchedInput').value

        // wait for the episode progress to update
        do { await new Promise((r) => setTimeout(r, 100)) }
        while (anime.querySelector(config.selector.library.epProgress).innerText !== updatedEp)

        behindHandler(anime, true)
    })
    document.addEventListener('epIncrement', async ({ detail: { target } }) => {
        // go out 1 element until the element has an id
        var parent = target.parentElement
        while (!parent.dataset.userLibraryAnimeId && parent.tagName !== 'BODY') parent = parent.parentElement

        // wait for the original episode number to increase by 1
        const originalEp = Number(parent.querySelector(config.selector.library.epProgress).innerText)
        do { await new Promise((r) => setTimeout(r, 100)) }
        while ((originalEp + 1) !== Number(parent.querySelector(config.selector.library.epProgress).innerText))

        behindHandler(parent, true)
    })


    function isBehind(anime, force = false) {
        if (!force && anime.dataset.behind) return Number(anime.dataset.behind)

        const hasCountdown = anime.querySelector(config.selector.library.countdown)
        if (settings.behindCountdown !== false && !hasCountdown) return anime.dataset.behind = 0

        var watched = anime.querySelector(config.selector.library.epProgress)?.innerText
        var nextEp = hasCountdown?.dataset.label.replace(/EP\d/gi, (str) => str.slice(2)) || anime.dataset.userLibraryAnimeEpisodeCount
        const inFilter = settings.behindStatusFilter.includes(anime.dataset.libraryStatus)

        if (
            anime.querySelector(config.selector.library.hiatus)
            || (!nextEp || nextEp == '1')
            || (settings.behindCountdown && !hasCountdown)
            || !inFilter

        ) return anime.dataset.behind = 0 // not behind

        watched = Number(watched)
        nextEp = Number(nextEp.replace(/[^0-9]/g, ''))
        const epBehind = nextEp - watched

        if (
            (hasCountdown && epBehind > 1)
            || (!hasCountdown && settings.behindCountdown === false)
        ) return anime.dataset.behind = hasCountdown ? epBehind - 1 : epBehind

        return anime.dataset.behind = 0
    }
    function behindHandler(anime, force) {
        const behind = isBehind(anime, force)
        var wrapper = anime.querySelector('#lcx-behind')
        if (behind === 0) {
            wrapper?.remove()
            if (button.dataset.toggled === 'true') anime.style.display = 'none'
            return;
        }

        if (!wrapper) {
            wrapper = document.createElement('div')
            wrapper.id = 'lcx-behind'
            anime.querySelector(config.selector.library.behindIconParent).prepend(wrapper)
        }
        wrapper.title = `${behind} Unwatched Episode${behind > 1 ? 's' : ''}`

        if (!wrapper.querySelector('img')) {
            const icon = document.createElement('img')
            icon.src = behindIcon
            wrapper.appendChild(icon)
        }

        if (settings.behindCount) {
            const old = wrapper.querySelector('p')
            const count = old || document.createElement('p')
            if (behind > 1) {
                count.innerText = behind
                if (!old) wrapper.appendChild(count)
            }
            else if (behind === 1) old?.remove()
        }

    }
}