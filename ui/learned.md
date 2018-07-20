## Promises
```
Promise.all([promise1, promise2, promise3]).then((results => {
  results[0]
  results[1]
  results[2]
}))
```

## Use Replace in javascript
```
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

    var explainCard = document.getElementById('explain-card')
    explainCard.innerHTML = list.innerHTML.replace(/{{\w{46}}}/g, function(){
      console.log(arguments);
      var pattern = /[A-Za-z0-9]{46}/g
      var cardHash = String(arguments[0]).match(pattern)
      console.log(String(cardHash))

      endpoint('cardRead', String(cardHash)).then(content => {
        cardContent = content.content
        console.log(cardContent)
      });
      console.log(cardContent);

      return cardContent;
    });
  });
});
```

```

function matcher(match,offset,string){
  var pattern = /[A-Za-z0-9]{46}/g
  var cardHash = String(string).match(pattern)
  console.log(String(cardHash))

  endpoint('cardRead', cardHash).then(content => {
    cardContent = content.content
    console.log(cardContent)
    return cardContent;
  });
}


/*
var card_content = document.getElementById('recently-created').innerText
// var pattern = /{{\w{46}}}/;
var pattern = /([A-Za-z0-9]{46})/g
var cardHash = String(card_content).match(pattern)*/

// document.querySelector('#recently-created').addEventListener('')
// console.log(card_content);
// console.log(cardHash);

```
