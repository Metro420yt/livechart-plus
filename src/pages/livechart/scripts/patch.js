export default (config) => {
    // issue: using keyboard to open the library edit modal, after opened the button is still selected allowing multiple modals to open
    // fix: move the focus to the status dropdown when opened
    var modalOpenSource
    document.addEventListener('modalOpen', ({ detail }) => {
        modalOpenSource = detail.target
        document.getElementById('library_editor_statusSelect')?.focus()
    })
    document.addEventListener('modalClose', () => modalOpenSource?.focus())


    // issue: when using keyboard navigation, focusing on the "+" button, the anime card will offset vertically and stay like that
    // fix: makes the "+" button unselectable on keyboard, just use the modal, could probably have a better fix
    document.querySelectorAll('[data-user-library-anime-target="episodeIncrementButton"]').forEach(e => e.setAttribute('tabindex', '-1'))
}