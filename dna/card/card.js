'use strict';

function anchor(anchorType, anchorText) {
  return call('anchors','anchor',{
    anchorType: anchorType,
    anchorText: anchorText
  }).replace(/"/g, '');
}


// -----------------------------------------------------------------
//  Public Zome Function
// -----------------------------------------------------------------

function cardCreate (params) {
  /*if (!params.nodeHash) {
    throw("please create the corresponding node first");
  }*/
  // Is there necessarily link the card to a certain position of the tree?

  const card = {
    title: params.title,
    content: params.content,
    card_type: params.card_type
  }

  const cardHash = commit("card", card)

  commit('cardLinks', {Links:[
    {Base: App.Agent.Hash, Link: cardHash, Tag: "AUTHOR_TO_CARD"}
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
  const hashList = cardHash.split(",")
  const contentList = []
  for (var i = 0; i < hashList.length; i++) {
    var content = get(hashList[i])
    contentList.push(JSON.stringify(content))
  }

  debug("Able to read the content of a new card: " + contentList)

  return contentList.join('|');
}

function cardUpdate (params) {
  // Allowed changing area: title, content, card_type
  const card = {
    title: params.title,
    content: params.content,
    card_type: params.card_type,
  }
  var cardOutHash = update("card", sampleValue, params.cardHash);
  return cardOutHash;
}

function cardDelete (cardHash) {
  var result = remove(cardHash, "");
  return result;
}

function addLink (params) {
  var targetHash = params.targetHash
  var curHash = params.curHash
  debug("targetHash: " + targetHash)
  debug("curHash: " + curHash)
  cardLinkHash = commit("card_link", {
    "Links": [
      {"Base": curHash, "Link": targetHash, "Tag": 'OUT_LINK'},
      {"Base": targetHash, "Link": curHash, "Tag": 'IN_LINK'}
    ]
  })
  debug("cardLinkHash: " + cardLinkHash)
  return cardLinkHash;
}

function getCardLists() {
  var authorList = []
  let authors = getLinks(App.Key.Hash, "AUTHORS", {Load:true}).map(function(author){
    authorList.push(author.Entry);
  })

  var result = []
  for (var i = 0; i < authorList.length; i++) {
    getLinks(authorList[i], "AUTHOR_TO_CARD", {Load: true}).map(function(cardHash){
      // TODO: store the first result in memory, don't get it all the time
      const cardTitle = get(cardHash).title
      result.push({
        author: authorList[i],
        cardHash: cardHash,
        cardTitle: cardTitle
      })
    })
  }

  return result;
}

// -----------------------------------------------------------------
//  The Genesis Function https://developer.holochain.org/genesis
// -----------------------------------------------------------------

/**
 * Called only when your source chain is generated
 * @return {boolean} success
 */
function genesis () {
  let authorHash = commit("authorHash", App.Agent.String)
  commit("getAuthors", { Links: [
    {Base: App.Key.Hash, Link: authorHash, Tag: "AUTHORS"}
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
    case "card_link":
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
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
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
      return true;
    case "card_link":
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
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
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
      return true;
    case "card_link":
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
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
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
      return true;
    case "card_link":
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
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
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
      return true;
    case "card_link":
      // be sure to consider many edge cases for validating
      // do not just flip this to true without considering what that means
      // the action will ONLY be successfull if this returns true, so watch out!
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
