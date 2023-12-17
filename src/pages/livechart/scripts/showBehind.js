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

        behindHandler(anime)
    })
    document.addEventListener('epIncrement', async ({ detail: { target } }) => {
        // go out 1 element until the element has an id
        var parent = target.parentElement
        while (!parent.dataset.userLibraryAnimeId && parent.tagName !== 'BODY') parent = parent.parentElement

        // wait for the original episode number to increase by 1
        const originalEp = Number(parent.querySelector(config.selector.library.epProgress).innerText)
        do { await new Promise((r) => setTimeout(r, 100)) }
        while ((originalEp + 1) !== Number(parent.querySelector(config.selector.library.epProgress).innerText))

        behindHandler(parent)
    })


    function isBehind(anime) {
        const countdown = anime.querySelector(config.selector.library.countdown)
        if (settings.filterCountdown !== false && !countdown) return false

        var watched = anime.querySelector(config.selector.library.epProgress)?.innerText
        var nextEp = countdown?.dataset.label.replace(/EP\d/gi, (str) => str.slice(2)) || anime.dataset.userLibraryAnimeEpisodeCount

        if (
            (!nextEp && !countdown)
            || anime.querySelector(config.selector.library.hiatus)
            || nextEp == '1'
            || (countdown && !settings.behindStatusFilter.includes(anime.dataset.libraryStatus))
            || (!countdown && anime.dataset.libraryStatus !== 'watching')
        ) return false

        watched = Number(watched)
        nextEp = Number(nextEp.replace(/[^0-9]/g, ''))
        const epBehind = nextEp - watched

        if (
            (countdown && epBehind > 1)
            || (!countdown && settings.filterCountdown === false)
        ) return countdown ? epBehind - 1 : epBehind

        return false
    }
    function behindHandler(anime) {
        const behind = isBehind(anime)
        var wrapper = anime.querySelector('#lcx-behind')
        if (!behind) {
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

        if (settings.showBehindCount) {
            var count = wrapper.querySelector('p')
            if (!count && behind > 1) {
                count = document.createElement('p')
                count.innerText = behind
                wrapper.appendChild(count)
            }
            else if (behind === 1) count?.remove()
        }

    }
}