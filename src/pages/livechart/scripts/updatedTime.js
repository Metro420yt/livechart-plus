export default async (config, relative, user) => {
    if (user.httpStatus !== 200) return;

    const target = document.querySelector('[data-controller="page-preferences"]>div')
    target.classList.remove('flex')

    var timestamp = Date.parse(user.updated_at)
    timestamp -= timestamp % 60000 //slightly anonymize
    const date = new Date(timestamp)

    const old = document.getElementById('lcx-updatedTime')
    const p = old || document.createElement('p')
    p.id = 'lcx-updatedTime'
    p.innerText = `Updated ${date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })} (${relative} ago)`
    if (!old) target.appendChild(p)
}
