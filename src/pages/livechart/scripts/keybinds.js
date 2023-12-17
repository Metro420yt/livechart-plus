export default (config) => {
    document.addEventListener('keypress', (event) => {
        if (event.code === 'Escape') {
            if (event.target.tagName === 'TEXTAREA') return event.target.blur();

            if (document.querySelector(config.selector.modal.editor)) { // esc: modal close
                document.querySelector(config.selector.modal.close)?.click()
            }
        }
        else if (event.code === 'Enter' && event.ctrlKey) {
            if (document.querySelector(config.selector.modal.editor)) { // ctrl+enter: modal save
                const save = document.querySelector(config.selector.modal.save)
                if (save.disabled) document.querySelector(config.selector.modal.close)?.click()
                else save.click()
            }
        }
    })
}