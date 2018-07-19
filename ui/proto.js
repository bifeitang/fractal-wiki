
const API_BASE = "http://localhost:4141/fn"

const endpoint = (name, data) => {
  const url = `${API_BASE}/card/${name}`
  return fetch(url, {
    method: 'post',
    body: (data),
  }).then(r => r.json())
}

endpoint('cardCreate', JSON.stringify({
  title: 'First Card',
  content: 'Test',
  card_type: 'markdown',
})).then(hash => {
  endpoint('cardRead', hash).then(content => {
    console.log(content)
  })
})

document.querySelector('#add-card').addEventListener('click', e => {
  const title = document.querySelector('#new-title').value
  const content = document.querySelector('#new-content').value
  endpoint('cardCreate', JSON.stringify({
    title,
    content,
    card_type: 'html',
  })).then(hash => {
    const list = document.querySelector('#recently-created')
    list.innerHTML += `${title}: ${hash}<br/>\n`
  })

})