function anchor(anchorType, anchorText) {
  return call('anchors','anchor',{
    anchorType: anchorType,
    anchorText: anchorText
  }).replace(/"/g, '');
}


// -----------------------------------------------------------------
//  Public Zome Function
// -----------------------------------------------------------------
function fieldCardSearch(params){

  if (params.field === "all") {
    var rankedPosts = JSON.parse(call('querysearch', 'searchQS', {
      queryString: params.keywords,
      entryType: "card"
    }));

    var cardsList = []

    rankedPosts.map(function(ele) {
      debug(get(ele.Hash))
      cardsList.push(JSON.stringify({
        Card: get(ele.Hash),
        Weight: ele.Weight,
      }))
    })

    return cardsList;
  } /*else {

    if (params.field === null) {
      return false;
    }

    var cardHashes = call('querysearch', 'queryQS', {
      entryType: "card",
      queryOptions: {
        Field: params.field,
        Load: true
      }
    })
    var cardsList = JSON.parse(cardHashes).map(hash => {
      return get(hash)
    })

    return cardsList;
  }*/

  return null;
}

function cardCreate (params) {
  /*if (!params.nodeHash) {
    throw("please create the corresponding node first");
  }*/
  // Is there necessarily link the card to a certain position of the tree?

  var timestamp = Date.now()
  var card = {
    title: params.title,
    author: App.Agent.String,
    content: params.content,
    card_type: params.card_type,
    timestamp: timestamp,
  }

  var cardHash = commit("card", card)

  call('querysearch', 'indexQS', {entryType: "card", entryHash: cardHash})
  call('querysearch', 'indexKeywordQS', {entryType: "card", entryHash: cardHash})

  commit('author_card_link', {
    "Links": [
      {Base: makeHash("author", App.Agent.String), Link: cardHash, Tag: "AUTHOR_TO_CARD"}
  ]})

  debug("New card created:" + cardHash)

  return cardHash;
}

function cardRead (cardHash) {
  /* usage of GetMask:
   * get retreive an entry from local chain or DHT
   * GetMask.EntryType
   * GetMask.Entry
   * GetMask.All */
  var hashList = cardHash.split(",")
  var contentList = []
  for (var i = 0; i < hashList.length; i++) {
    var content = get(hashList[i])
    contentList.push(JSON.stringify(content))
  }

  return contentList.join('|');
}

function cardUpdate (params) {
  var timestamp = Date.now()
  var updateCard = {
    title: params.title,
    content: params.content,
    card_type: params.card_type,
    author: App.Agent.String,
    timestamp: timestamp,
  }

  var cardNewHash = update("card", updateCard, params.cardHash);
  call('querysearch', 'indexQS', {entryType: "card", entryHash: cardNewHash})
  call('querysearch', 'indexKeywordQS', {entryType: "card", entryHash: cardNewHash})
  return cardNewHash;
}

function cardDelete (cardHash) {
  var result = remove(cardHash, "");
  return result;
}

function addLink (params) {
  var targetHash = params.targetHash
  var curHash = params.curHash
  cardLinkHash = commit("card_link", {
    "Links": [
      {"Base": curHash, "Link": targetHash, "Tag": 'OUT_LINK'},
      {"Base": targetHash, "Link": curHash, "Tag": 'IN_LINK'}
    ]
  })
  return cardLinkHash;
}

function getCardLists() {
  var authorList = []
  var authors = getLinks(App.Key.Hash, "AUTHORS", {Load:true}).map(function(author){
    authorList.push(author.Entry);
  })

  var result = []
  for (var i = 0; i < authorList.length; i++) {
      getLinks(makeHash('author', authorList[i]), "AUTHOR_TO_CARD", {Load: true}).map(function(card) {
        result.push({
          author: card.Entry.author,
          cardHash: card.Hash,
          cardTitle: card.Entry.title,
          timestamp: card.Entry.timestamp,
        })
    })
  }

  return JSON.stringify(result);
}

function updateCardList(preTime) {
  function timefilter(item) {
    return item.timestamp > preTime
  }
  var updateList = JSON.parse(getCardLists()).filter(timefilter)
  return JSON.stringify(updateList);
}

// -----------------------------------------------------------------
//  The Genesis Function https://developer.holochain.org/genesis
// -----------------------------------------------------------------

/**
 * Called only when your source chain is generated
 * @return {boolean} success
 */
function genesis () {
  var authorHash = commit("author", App.Agent.String)
  commit("author_link", { Links: [
    {Base: App.Key.Hash, Link: authorHash, Tag: "AUTHORS"},
  ]});
  return true;
}

// -----------------------------------------------------------------
//  Validation functions for every change to the local chain or DHT
// -----------------------------------------------------------------

/**
 * Called to validate any changes to the local chain or DHT
 * @param {string} entryName - the type of entry
 * @param {*} entry - the entry data to be set
 * @param {object} header - header for the entry containing properties EntryLink, Time, and Type
 * @param {*} pkg - the extra data provided by the validate[X]Pkg methods
 * @param {object} sources - an array of strings containing the keys of any authors of this entry
 * @return {boolean} is valid?
 */
function validateCommit (entryName, entry, header, pkg, sources) {
  switch (entryName) {
    case "card":
      // check to determine the user permission commit to the local_chain
      return true;
    case "author":
      return true;
    case "author_link":
      return true;
    case "author_card_link":
      return true;
    case "card_link":
      return true;
    default:
      // invalid entry name
      return false;
  }
}

/**
 * Called to validate any changes to the local chain or DHT
 * @param {string} entryName - the type of entry
 * @param {*} entry - the entry data to be set
 * @param {object} header - header for the entry containing properties EntryLink, Time, and Type
 * @param {*} pkg - the extra data provided by the validate[X]Pkg methods
 * @param {object} sources - an array of strings containing the keys of any authors of this entry
 * @return {boolean} is valid?
 */
function validatePut (entryName, entry, header, pkg, sources) {
  switch (entryName) {
    case "card":
      // check to determine the user permission commit to the local_chain
      return true;
    case "author":
      return true;
    case "author_link":
      return true;
    case "author_card_link":
      return true;
    case "card_link":
      return true;
    default:
      // invalid entry name
      return false;
  }
}

/**
 * Called to validate any changes to the local chain or DHT
 * @param {string} entryName - the type of entry
 * @param {*} entry - the entry data to be set
 * @param {object} header - header for the entry containing properties EntryLink, Time, and Type
 * @param {string} replaces - the hash for the entry being updated
 * @param {*} pkg - the extra data provided by the validate[X]Pkg methods
 * @param {object} sources - an array of strings containing the keys of any authors of this entry
 * @return {boolean} is valid?
 */
function validateMod (entryName, entry, header, replaces, pkg, sources) {
  switch (entryName) {
    case "card":
      // check to determine the user permission commit to the local_chain
      return true;
    case "author":
      return true;
    case "author_link":
      return true;
    case "author_card_link":
      return true;
    case "card_link":
      return true;
    default:
      // invalid entry name
      return false;
  }
}

/**
 * Called to validate any changes to the local chain or DHT
 * @param {string} entryName - the type of entry
 * @param {string} hash - the hash of the entry to remove
 * @param {*} pkg - the extra data provided by the validate[X]Pkg methods
 * @param {object} sources - an array of strings containing the keys of any authors of this entry
 * @return {boolean} is valid?
 */
function validateDel (entryName, hash, pkg, sources) {
  switch (entryName) {
    case "card":
      // check to determine the user permission commit to the local_chain
      return true;
    case "author":
      return true;
    case "author_link":
      return true;
    case "author_card_link":
      return true;
    case "card_link":
      return true;
    default:
      // invalid entry name
      return false;
  }
}

/**
 * Called to validate any changes to the local chain or DHT
 * @param {string} entryName - the type of entry
 * @param {string} baseHash - the hash of the base entry being linked
 * @param {?} links - ?
 * @param {*} pkg - the extra data provided by the validate[X]Pkg methods
 * @param {object} sources - an array of strings containing the keys of any authors of this entry
 * @return {boolean} is valid?
 */
function validateLink (entryName, baseHash, links, pkg, sources) {
  switch (entryName) {
    case "card":
      // check to determine the user permission commit to the local_chain
      return true;
    case "author":
      return true;
    case "author_link":
      return true;
    case "author_card_link":
      return true;
    case "card_link":
      return true;
    default:
      // invalid entry name
      return false;
  }
}

/**
 * Called to get the data needed to validate
 * @param {string} entryName - the name of entry to validate
 * @return {*} the data required for validation
 */
function validatePutPkg (entryName) {
  return null;
}

/**
 * Called to get the data needed to validate
 * @param {string} entryName - the name of entry to validate
 * @return {*} the data required for validation
 */
function validateModPkg (entryName) {
  return null;
}

/**
 * Called to get the data needed to validate
 * @param {string} entryName - the name of entry to validate
 * @return {*} the data required for validation
 */
function validateDelPkg (entryName) {
  return null;
}

/**
 * Called to get the data needed to validate
 * @param {string} entryName - the name of entry to validate
 * @return {*} the data required for validation
 */
function validateLinkPkg (entryName) {
  return null;
}
