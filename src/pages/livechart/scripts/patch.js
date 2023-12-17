export default (config) => {
    // changes target on modalOpen
    var modalOpenSource
    document.addEventListener('modalOpen', ({ detail }) => {
        modalOpenSource = detail.target
        document.getElementById('library_editor_statusSelect')?.focus()
    })
    document.addEventListener('modalClose', () => modalOpenSource?.focus())


    // makes episodeIncrementButton unselectable on keyboard
    document.querySelectorAll('[data-user-library-anime-target="episodeIncrementButton"]').forEach(e => e.setAttribute('tabindex', '-1'))
}