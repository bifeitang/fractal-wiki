
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
}))/*.then(hash => {
  endpoint('cardRead', hash).then(content => {
    // console.log(content)
  })
})*/

document.querySelector('#add-card').addEventListener('click', e => {
  const title = document.querySelector('#new-title').value
  const content = document.querySelector('#new-content').value
  endpoint('cardCreate', JSON.stringify({
    title,
    content,
    card_type: 'html',
  })).then(hash => {
    const list = document.querySelector('#recently-created')
    list.innerHTML += `Get new card<br/>${title}: {{${hash}}}<br/>\n`
  });
});


const readCardPromise = (name, data) => {
  const url = `${API_BASE}/card/${name}`
  return fetch(url, {
    method: 'post',
    body: (data),
  }).then(r => r.text())
}


document.querySelector('#refresh').addEventListener('click', e =>{
  var explainCard = document.getElementById('explain-card')
  var inputCard = document.querySelector('#recently-created')
  // match: input file string; output /[A-Za-z0-9]{46}/g list of hash
  var hashList = inputCard.innerHTML.match(/[A-Za-z0-9]{46}/g)
  // request: send request, get all contents together, in a list
  readCardPromise('cardRead', String(hashList)).then(result => {
    var contents = result.split("|")
    var counter = 0
    explainCard.innerHTML = inputCard.innerHTML.replace(/{{\w{46}}}/g, function(){
      var replace = contents[counter]
      counter += 1;
      return replace;
    });
  });
});
