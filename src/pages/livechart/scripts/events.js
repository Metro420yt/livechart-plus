export default (config) => {
    for (const action of document.querySelectorAll(config.selector.modal.open)) action.addEventListener('click', async ({ target }) => {
        // wait for editor modal to appear
        do { await new Promise((r) => setTimeout(r, 100)) }
        while (!document.querySelector(config.selector.modal.editor))
        document.dispatchEvent(new CustomEvent('modalOpen', { detail: { target } }))

        document.querySelector(config.selector.modal.editor).addEventListener('submit', async ({ target }) => document.dispatchEvent(new CustomEvent('modalSubmit', { detail: { target } })))
        document.querySelector(config.selector.modal.close).addEventListener('click', async () => document.dispatchEvent(new Event('modalClose')))
    })
    for (const button of document.querySelectorAll(config.selector.library.epIncrement)) button.addEventListener('click', async ({ target }) => {
        document.dispatchEvent(new CustomEvent('epIncrement', { detail: { target } }))
    })
}