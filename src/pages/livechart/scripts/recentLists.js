export default (recents, filters, config) => {
    if (recents.length === 0) return;

    const oldButton = document.getElementById('lcx-recentLibraries')
    const button = oldButton || document.createElement('div')
    button.id = 'lcx-recentLibraries'
    button.classList = 'btn btn-sm'
    button.innerText = 'Recent Libraries'
    if (!oldButton) document.querySelector(config.selector.library.recent.buttonParent).appendChild(button)

    const oldList = document.getElementById('lcx-libraryList')
    const list = oldList || document.createElement('div')
    list.classList = 'p-2 card bg-base-300'
    list.id = 'lcx-libraryList'
    if (!oldList) {
        list.style.display = 'none'
        document.querySelector(config.selector.library.recent.listParent).appendChild(list)
    }


    button.onclick = ({ target }) => {
        if (target.dataset.toggled === 'true') {
            target.dataset.toggled = false
            target.style = ''
            list.style.display = 'none'
        }
        else {
            target.dataset.toggled = true
            list.style.display = ''
        }
    }


    list.replaceChildren(...recents.map(user => {
        const item = document.createElement('a')
        item.innerText = user
        item.href = `/users/${user}/library`
        item.classList.add('lcx-link')
        if (filters && filters !== '') item.href += `?${filters}`

        return item
    }))
}