export default (config) => {
    for (const e of document.querySelectorAll('[class*=action-button]')) {
        if (
            !e.children[1]
            || e.children[1].innerText !== 'Watch'
        ) continue;

        e.title = e.children[1].innerText
        e.children[1].remove()
    }
}
