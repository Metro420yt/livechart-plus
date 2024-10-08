export default (config) => {
    const status = document.querySelector(config.selector.library.pendingRlsParent)

    const button = document.getElementById('lcx-btn-pending') || document.createElement('button')
    button.innerText = 'Pending Release'
    button.id = 'lcx-btn-pending'
    button.active = false
    button.classList.add('btn', 'btn-sm', 'w-fit')
    status.appendChild(button)

    button.onclick = ({ target }) => {
        for (const btn of document.querySelectorAll(`[id^="lcx-btn-"][data-toggled="true"]:not(#${button.id})`)) btn.click() //toggle all lcx buttons
        const animes = document.querySelectorAll(config.selector.library.anime)

        if (target.dataset.toggled === 'true') {
            target.dataset.toggled = false
            for (const a of animes) a.style.display = ''
        }
        else {
            target.dataset.toggled = true
            for (const anime of animes) {
                const countdown = anime.querySelector(config.selector.library.countdown)
                const nextEp = anime.querySelector(config.selector.library.nextEp)

                if (
                    countdown
                    && (nextEp.innerText && /^(EP1|THTR) /.test(nextEp.innerText))
                ) anime.style.display = ''
                else anime.style.display = 'none'
            }
        }
    }
}