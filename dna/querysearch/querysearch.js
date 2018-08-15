'use strict';

function bridgeGenesis(side, dna, appData) {
  debug(App.Name + ' Bridged to: DNA: ' + dna);
  return true;
}
"use strict";

/*=================================
=            Callbacks            =
=================================*/

function genesis() {
  return true;
}

function validatePut(entry_type, entry, header, pkg, sources) {
  return true;
}
function validateCommit(entry_type, entry, header, pkg, sources) {
  return true;
}

function validateLink(linkingEntryType, baseHash, linkHash, pkg, sources) {
  //
  return true;
}
function validateMod(entry_type, hash, newHash, pkg, sources) {
  //
  return true;
}
function validateDel(entry_type, hash, pkg, sources) {
  //
  return true;
}
function validatePutPkg(entry_type) {
  //
  return null;
}
function validateModPkg(entry_type) {
  //
  return null;
}
function validateDelPkg(entry_type) {
  //
  return null;
}
function validateLinkPkg(entry_type) {
  //
  return null;
}

/*=====  End of Callbacks  ======*/
"use strict";

/*========================================
=            Public Functions            =
========================================*/

/**
 * Index an entry for keyword search.
 *
 * @param      {Object}   payload            JSON payload
 * @param      {string}   payload.entryType  The entry type
 * @param      {hash-string}   payload.entryHash  The entry hash
 * @param      {Object}   payload.entry [payload.entry] The entry itself. Only required for bridge calls. Will be removed in future.
 * @return     {boolean}  Returns true if successfully indexed otherwise false
 */
function indexKeywordQS(_ref) {
  var entryType = _ref.entryType,
      entryHash = _ref.entryHash,
      _ref$entry = _ref.entry,
      entry = _ref$entry === undefined ? get(entryHash) : _ref$entry;

  // load the entry (will have to call over bridge in bridging case)

  var entryFlat = flattenObject(entry);

  // index each of the fields that need indexing
  textSearchSpec()[entryType].fields.forEach(function (_ref2) {
    var fieldName = _ref2.fieldName,
        weight = _ref2.weight;


    debug(fieldName);
    console.log(JSON.stringify(entryFlat));
    debug("Extracted Keywords:" + JSON.stringify(processString(entryFlat[fieldName])));

    processString(entryFlat[fieldName]).forEach(function (keyword) {

      debug("linking to: " + keyword);

      // create a new anchor if it doesn't exist already
      var keywordAnchorHash = commit('keywordAnchor', {
        sourceEntryHash: entryHash,
        keyword: entryType + ":" + fieldName + ":" + keyword
      });
    });
  });

  return true;
}

/**
 * Index an entry for ordinal queries
 *
 * @param      {Object}  payload            JSON payload
 * @param      {string}  payload.entryType  The entry type
 * @param      {Object}  payload.entryHash  The entry hash
 * @param      {Object}  payload.entry [payload.entry] The entry itself. Only required for bridge calls. Will be removed in future.
 * @return     {boolean} Returns true if successfully indexed otherwise false
 */
function indexQS(_ref3) {
  var entryType = _ref3.entryType,
      entryHash = _ref3.entryHash,
      _ref3$entry = _ref3.entry,
      entry = _ref3$entry === undefined ? get(entryHash) : _ref3$entry;

  //create a skeletal entry with the correct fields plus the hash of the original
  var entryFlat = flattenObject(entry);
  var skeletalEntryType = "skel_" + entryType;
  var skeletalEntry = indexSpec()[entryType].reduce(function (obj, _ref4) {
    var fieldName = _ref4.fieldName;

    obj[fieldName.replace('.', '_')] = entryFlat[fieldName];
    return obj;
  }, {});
  skeletalEntry.sourceEntryHash = entryHash;
  commit(skeletalEntryType, skeletalEntry);
  return true;
}

/**
 * Makes an ordinal query on entryType defined by the queryOptions
 *
 * @param      {Object}  payload               JSON payload
 * @param      {string}  payload.entryType     The entry type
 * @param      {Object}  payload.queryOptions  The query options
 * @return     {string-hash[]}  Array of hashes of entries that match the query
 */
function queryQS(_ref5) {
  var entryType = _ref5.entryType,
      queryOptions = _ref5.queryOptions;

  // get the corresponding skeleton entry type
  var skeletonEntryType = "skel_" + entryType;

  queryOptions.Field = queryOptions.Field.replace('.', '_');
  queryOptions.Load = true;

  return queryDHT(skeletonEntryType, queryOptions).map(function (elem) {
    if (elem && elem.Entry) {
      return elem.Entry.sourceEntryHash;
    } else {
      return null;
    }
  }).filter(function (elem) {
    return elem;
  }); // filter out null elements
}

/**
 * { function_description }
 *
 * @param      {Object}  payload              The argument 1
 * @param      {string}  payload.entryType    The entry type
 * @param      {<type>}  payload.queryString  The query string
 * @param      {<type>}  payload.options      The options
 * @return     {Object[]}  Array of resulst that match at least one keyword. Objects have the form {<entryHash>: <weight>}
 */
function searchQS(_ref6) {
  var entryType = _ref6.entryType,
      queryString = _ref6.queryString,
      _ref6$options = _ref6.options,
      options = _ref6$options === undefined ? {} : _ref6$options;

  // results is a dictionary mapping hashes to ranks
  var results = {};

  processString(queryString).forEach(function (keyword) {
    textSearchSpec()[entryType].fields.forEach(function (_ref7) {
      var fieldName = _ref7.fieldName,
          weight = _ref7.weight;

      queryDHT('keywordAnchor', {
        Field: 'keyword',
        Constrain: { EQ: entryType + ":" + fieldName + ":" + keyword }
      }).forEach(function (Hash) {
        if (hashExists(Hash)) {
          var entryHash = get(Hash).sourceEntryHash;
          if (results[entryHash]) {
            results[entryHash] += weight;
          } else {
            results[entryHash] = weight;
          }
        }
      });
    });
  });

  return Object.keys(results).map(function (hash) {
    return { Hash: hash, Weight: results[hash] };
  });
}

/*=====  End of Public Functions  ======*/
"use strict";

/**@constructor*/
function BaseStemmer() {
				this.setCurrent = function (value) {
								this.current = value;
								this.cursor = 0;
								this.limit = this.current.length;
								this.limit_backward = 0;
								this.bra = this.cursor;
								this.ket = this.limit;
				};

				this.getCurrent = function () {
								return this.current;
				};

				this.copy_from = function (other) {
								this.current = other.current;
								this.cursor = other.cursor;
								this.limit = other.limit;
								this.limit_backward = other.limit_backward;
								this.bra = other.bra;
								this.ket = other.ket;
				};

				this.in_grouping = function (s, min, max) {
								if (this.cursor >= this.limit) return false;
								var ch = this.current.charCodeAt(this.cursor);
								if (ch > max || ch < min) return false;
								ch -= min;
								if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) return false;
								this.cursor++;
								return true;
				};

				this.in_grouping_b = function (s, min, max) {
								if (this.cursor <= this.limit_backward) return false;
								var ch = this.current.charCodeAt(this.cursor - 1);
								if (ch > max || ch < min) return false;
								ch -= min;
								if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) return false;
								this.cursor--;
								return true;
				};

				this.out_grouping = function (s, min, max) {
								if (this.cursor >= this.limit) return false;
								var ch = this.current.charCodeAt(this.cursor);
								if (ch > max || ch < min) {
												this.cursor++;
												return true;
								}
								ch -= min;
								if ((s[ch >>> 3] & 0X1 << (ch & 0x7)) == 0) {
												this.cursor++;
												return true;
								}
								return false;
				};

				this.out_grouping_b = function (s, min, max) {
								if (this.cursor <= this.limit_backward) return false;
								var ch = this.current.charCodeAt(this.cursor - 1);
								if (ch > max || ch < min) {
												this.cursor--;
												return true;
								}
								ch -= min;
								if ((s[ch >>> 3] & 0x1 << (ch & 0x7)) == 0) {
												this.cursor--;
												return true;
								}
								return false;
				};

				this.eq_s = function (s) {
								if (this.limit - this.cursor < s.length) return false;
								if (this.current.slice(this.cursor, this.cursor + s.length) != s) {
												return false;
								}
								this.cursor += s.length;
								return true;
				};

				this.eq_s_b = function (s) {
								if (this.cursor - this.limit_backward < s.length) return false;
								if (this.current.slice(this.cursor - s.length, this.cursor) != s) {
												return false;
								}
								this.cursor -= s.length;
								return true;
				};

				/** @return {number} */this.find_among = function (v) {
								var i = 0;
								var j = v.length;

								var c = this.cursor;
								var l = this.limit;

								var common_i = 0;
								var common_j = 0;

								var first_key_inspected = false;

								while (true) {
												var k = i + (j - i >>> 1);
												var diff = 0;
												var common = common_i < common_j ? common_i : common_j; // smaller
												var w = v[k];
												var i2;
												/// s : string, substring_i : int, result : int, method
												for (i2 = common; i2 < w[0].length; i2++) {
																if (c + common == l) {
																				diff = -1;
																				break;
																}
																diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
																if (diff != 0) break;
																common++;
												}
												if (diff < 0) {
																j = k;
																common_j = common;
												} else {
																i = k;
																common_i = common;
												}
												if (j - i <= 1) {
																if (i > 0) break; // v->s has been inspected
																if (j == i) break; // only one item in v

																// - but now we need to go round once more to get
																// v->s inspected. This looks messy, but is actually
																// the optimal approach.

																if (first_key_inspected) break;
																first_key_inspected = true;
												}
								}
								while (true) {
												var w = v[i];
												if (common_i >= w[0].length) {
																this.cursor = c + w[0].length;
																if (w.length < 4) return w[2];
																var res = w[3](this);
																this.cursor = c + w[0].length;
																if (res) return w[2];
												}
												i = w[1];
												if (i < 0) return 0;
								}
				};

				// find_among_b is for backwards processing. Same comments apply
				this.find_among_b = function (v) {
								var i = 0;
								var j = v.length;

								var c = this.cursor;
								var lb = this.limit_backward;

								var common_i = 0;
								var common_j = 0;

								var first_key_inspected = false;

								while (true) {
												var k = i + (j - i >> 1);
												var diff = 0;
												var common = common_i < common_j ? common_i : common_j;
												var w = v[k];
												var i2;
												for (i2 = w[0].length - 1 - common; i2 >= 0; i2--) {
																if (c - common == lb) {
																				diff = -1;
																				break;
																}
																diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
																if (diff != 0) break;
																common++;
												}
												if (diff < 0) {
																j = k;
																common_j = common;
												} else {
																i = k;
																common_i = common;
												}
												if (j - i <= 1) {
																if (i > 0) break;
																if (j == i) break;
																if (first_key_inspected) break;
																first_key_inspected = true;
												}
								}
								while (true) {
												var w = v[i];
												if (common_i >= w[0].length) {
																this.cursor = c - w[0].length;
																if (w.length < 4) return w[2];
																var res = w[3](this);
																this.cursor = c - w[0].length;
																if (res) return w[2];
												}
												i = w[1];
												if (i < 0) return 0;
								}
				};

				/* to replace chars between c_bra and c_ket in this.current by the
     * chars in s.
     */
				this.replace_s = function (c_bra, c_ket, s) {
								var adjustment = s.length - (c_ket - c_bra);
								this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
								this.limit += adjustment;
								if (this.cursor >= c_ket) this.cursor += adjustment;else if (this.cursor > c_bra) this.cursor = c_bra;
								return adjustment;
				};

				this.slice_check = function () {
								if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > this.current.length) {
												return false;
								}
								return true;
				};

				this.slice_from = function (s) {
								var result = false;
								if (this.slice_check()) {
												this.replace_s(this.bra, this.ket, s);
												result = true;
								}
								return result;
				};

				this.slice_del = function () {
								return this.slice_from("");
				};

				this.insert = function (c_bra, c_ket, s) {
								var adjustment = this.replace_s(c_bra, c_ket, s);
								if (c_bra <= this.bra) this.bra += adjustment;
								if (c_bra <= this.ket) this.ket += adjustment;
				};

				this.slice_to = function () {
								var result = '';
								if (this.slice_check()) {
												result = this.current.slice(this.bra, this.ket);
								}
								return result;
				};

				this.assign_to = function () {
								return this.current.slice(0, this.limit);
				};
};

// // for node unit tests only. Can be deleted for production
// if(typeof module !== 'undefined') {
//   module.exports = BaseStemmer;
// }
"use strict";

// This file was generated automatically by the Snowball to Javascript compiler
// http://snowballstem.org/
// 


/**@constructor*/
Stemmer = function Stemmer() {

    var base = new BaseStemmer();
    /** @const */var a_0 = [["arsen", -1, -1], ["commun", -1, -1], ["gener", -1, -1]];

    /** @const */var a_1 = [["'", -1, 1], ["'s'", 0, 1], ["'s", -1, 1]];

    /** @const */var a_2 = [["ied", -1, 2], ["s", -1, 3], ["ies", 1, 2], ["sses", 1, 1], ["ss", 1, -1], ["us", 1, -1]];

    /** @const */var a_3 = [["", -1, 3], ["bb", 0, 2], ["dd", 0, 2], ["ff", 0, 2], ["gg", 0, 2], ["bl", 0, 1], ["mm", 0, 2], ["nn", 0, 2], ["pp", 0, 2], ["rr", 0, 2], ["at", 0, 1], ["tt", 0, 2], ["iz", 0, 1]];

    /** @const */var a_4 = [["ed", -1, 2], ["eed", 0, 1], ["ing", -1, 2], ["edly", -1, 2], ["eedly", 3, 1], ["ingly", -1, 2]];

    /** @const */var a_5 = [["anci", -1, 3], ["enci", -1, 2], ["ogi", -1, 13], ["li", -1, 15], ["bli", 3, 12], ["abli", 4, 4], ["alli", 3, 8], ["fulli", 3, 9], ["lessli", 3, 14], ["ousli", 3, 10], ["entli", 3, 5], ["aliti", -1, 8], ["biliti", -1, 12], ["iviti", -1, 11], ["tional", -1, 1], ["ational", 14, 7], ["alism", -1, 8], ["ation", -1, 7], ["ization", 17, 6], ["izer", -1, 6], ["ator", -1, 7], ["iveness", -1, 11], ["fulness", -1, 9], ["ousness", -1, 10]];

    /** @const */var a_6 = [["icate", -1, 4], ["ative", -1, 6], ["alize", -1, 3], ["iciti", -1, 4], ["ical", -1, 4], ["tional", -1, 1], ["ational", 5, 2], ["ful", -1, 5], ["ness", -1, 5]];

    /** @const */var a_7 = [["ic", -1, 1], ["ance", -1, 1], ["ence", -1, 1], ["able", -1, 1], ["ible", -1, 1], ["ate", -1, 1], ["ive", -1, 1], ["ize", -1, 1], ["iti", -1, 1], ["al", -1, 1], ["ism", -1, 1], ["ion", -1, 2], ["er", -1, 1], ["ous", -1, 1], ["ant", -1, 1], ["ent", -1, 1], ["ment", 15, 1], ["ement", 16, 1]];

    /** @const */var a_8 = [["e", -1, 1], ["l", -1, 2]];

    /** @const */var a_9 = [["succeed", -1, -1], ["proceed", -1, -1], ["exceed", -1, -1], ["canning", -1, -1], ["inning", -1, -1], ["earring", -1, -1], ["herring", -1, -1], ["outing", -1, -1]];

    /** @const */var a_10 = [["andes", -1, -1], ["atlas", -1, -1], ["bias", -1, -1], ["cosmos", -1, -1], ["dying", -1, 3], ["early", -1, 9], ["gently", -1, 7], ["howe", -1, -1], ["idly", -1, 6], ["lying", -1, 4], ["news", -1, -1], ["only", -1, 10], ["singly", -1, 11], ["skies", -1, 2], ["skis", -1, 1], ["sky", -1, -1], ["tying", -1, 5], ["ugly", -1, 8]];

    /** @const */var /** Array<int> */g_v = [17, 65, 16, 1];

    /** @const */var /** Array<int> */g_v_WXY = [1, 17, 65, 208, 1];

    /** @const */var /** Array<int> */g_valid_LI = [55, 141, 2];

    var /** boolean */B_Y_found = false;
    var /** number */I_p2 = 0;
    var /** number */I_p1 = 0;

    /** @return {boolean} */
    function r_prelude() {
        // (, line 25
        // unset Y_found, line 26
        B_Y_found = false;
        // do, line 27
        var /** number */v_1 = base.cursor;
        lab0: {
            // (, line 27
            // [, line 27
            base.bra = base.cursor;
            // literal, line 27
            if (!base.eq_s("'")) {
                break lab0;
            }
            // ], line 27
            base.ket = base.cursor;
            // delete, line 27
            if (!base.slice_del()) {
                return false;
            }
        }
        base.cursor = v_1;
        // do, line 28
        var /** number */v_2 = base.cursor;
        lab1: {
            // (, line 28
            // [, line 28
            base.bra = base.cursor;
            // literal, line 28
            if (!base.eq_s("y")) {
                break lab1;
            }
            // ], line 28
            base.ket = base.cursor;
            // <-, line 28
            if (!base.slice_from("Y")) {
                return false;
            }
            // set Y_found, line 28
            B_Y_found = true;
        }
        base.cursor = v_2;
        // do, line 29
        var /** number */v_3 = base.cursor;
        lab2: {
            // repeat, line 29
            replab3: while (true) {
                var /** number */v_4 = base.cursor;
                lab4: {
                    // (, line 29
                    // goto, line 29
                    golab5: while (true) {
                        var /** number */v_5 = base.cursor;
                        lab6: {
                            // (, line 29
                            if (!base.in_grouping(g_v, 97, 121)) {
                                break lab6;
                            }
                            // [, line 29
                            base.bra = base.cursor;
                            // literal, line 29
                            if (!base.eq_s("y")) {
                                break lab6;
                            }
                            // ], line 29
                            base.ket = base.cursor;
                            base.cursor = v_5;
                            break golab5;
                        }
                        base.cursor = v_5;
                        if (base.cursor >= base.limit) {
                            break lab4;
                        }
                        base.cursor++;
                    }
                    // <-, line 29
                    if (!base.slice_from("Y")) {
                        return false;
                    }
                    // set Y_found, line 29
                    B_Y_found = true;
                    continue replab3;
                }
                base.cursor = v_4;
                break replab3;
            }
        }
        base.cursor = v_3;
        return true;
    };

    /** @return {boolean} */
    function r_mark_regions() {
        // (, line 32
        I_p1 = base.limit;
        I_p2 = base.limit;
        // do, line 35
        var /** number */v_1 = base.cursor;
        lab0: {
            // (, line 35
            // or, line 41
            lab1: {
                var /** number */v_2 = base.cursor;
                lab2: {
                    // among, line 36
                    if (base.find_among(a_0) == 0) {
                        break lab2;
                    }
                    break lab1;
                }
                base.cursor = v_2;
                // (, line 41
                // gopast, line 41
                golab3: while (true) {
                    lab4: {
                        if (!base.in_grouping(g_v, 97, 121)) {
                            break lab4;
                        }
                        break golab3;
                    }
                    if (base.cursor >= base.limit) {
                        break lab0;
                    }
                    base.cursor++;
                }
                // gopast, line 41
                golab5: while (true) {
                    lab6: {
                        if (!base.out_grouping(g_v, 97, 121)) {
                            break lab6;
                        }
                        break golab5;
                    }
                    if (base.cursor >= base.limit) {
                        break lab0;
                    }
                    base.cursor++;
                }
            }
            // setmark p1, line 42
            I_p1 = base.cursor;
            // gopast, line 43
            golab7: while (true) {
                lab8: {
                    if (!base.in_grouping(g_v, 97, 121)) {
                        break lab8;
                    }
                    break golab7;
                }
                if (base.cursor >= base.limit) {
                    break lab0;
                }
                base.cursor++;
            }
            // gopast, line 43
            golab9: while (true) {
                lab10: {
                    if (!base.out_grouping(g_v, 97, 121)) {
                        break lab10;
                    }
                    break golab9;
                }
                if (base.cursor >= base.limit) {
                    break lab0;
                }
                base.cursor++;
            }
            // setmark p2, line 43
            I_p2 = base.cursor;
        }
        base.cursor = v_1;
        return true;
    };

    /** @return {boolean} */
    function r_shortv() {
        // (, line 49
        // or, line 51
        lab0: {
            var /** number */v_1 = base.limit - base.cursor;
            lab1: {
                // (, line 50
                if (!base.out_grouping_b(g_v_WXY, 89, 121)) {
                    break lab1;
                }
                if (!base.in_grouping_b(g_v, 97, 121)) {
                    break lab1;
                }
                if (!base.out_grouping_b(g_v, 97, 121)) {
                    break lab1;
                }
                break lab0;
            }
            base.cursor = base.limit - v_1;
            // (, line 52
            if (!base.out_grouping_b(g_v, 97, 121)) {
                return false;
            }
            if (!base.in_grouping_b(g_v, 97, 121)) {
                return false;
            }
            // atlimit, line 52
            if (base.cursor > base.limit_backward) {
                return false;
            }
        }
        return true;
    };

    /** @return {boolean} */
    function r_R1() {
        if (!(I_p1 <= base.cursor)) {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_R2() {
        if (!(I_p2 <= base.cursor)) {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_1a() {
        var /** number */among_var;
        // (, line 58
        // try, line 59
        var /** number */v_1 = base.limit - base.cursor;
        lab0: {
            // (, line 59
            // [, line 60
            base.ket = base.cursor;
            // substring, line 60
            if (base.find_among_b(a_1) == 0) {
                base.cursor = base.limit - v_1;
                break lab0;
            }
            // ], line 60
            base.bra = base.cursor;
            // (, line 62
            // delete, line 62
            if (!base.slice_del()) {
                return false;
            }
        }
        // [, line 65
        base.ket = base.cursor;
        // substring, line 65
        among_var = base.find_among_b(a_2);
        if (among_var == 0) {
            return false;
        }
        // ], line 65
        base.bra = base.cursor;
        switch (among_var) {
            case 1:
                // (, line 66
                // <-, line 66
                if (!base.slice_from("ss")) {
                    return false;
                }
                break;
            case 2:
                // (, line 68
                // or, line 68
                lab1: {
                    var /** number */v_2 = base.limit - base.cursor;
                    lab2: {
                        // (, line 68
                        // hop, line 68
                        {
                            var /** number */c1 = base.cursor - 2;
                            if (base.limit_backward > c1 || c1 > base.limit) {
                                break lab2;
                            }
                            base.cursor = c1;
                        }
                        // <-, line 68
                        if (!base.slice_from("i")) {
                            return false;
                        }
                        break lab1;
                    }
                    base.cursor = base.limit - v_2;
                    // <-, line 68
                    if (!base.slice_from("ie")) {
                        return false;
                    }
                }
                break;
            case 3:
                // (, line 69
                // next, line 69
                if (base.cursor <= base.limit_backward) {
                    return false;
                }
                base.cursor--;
                // gopast, line 69
                golab3: while (true) {
                    lab4: {
                        if (!base.in_grouping_b(g_v, 97, 121)) {
                            break lab4;
                        }
                        break golab3;
                    }
                    if (base.cursor <= base.limit_backward) {
                        return false;
                    }
                    base.cursor--;
                }
                // delete, line 69
                if (!base.slice_del()) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_1b() {
        var /** number */among_var;
        // (, line 74
        // [, line 75
        base.ket = base.cursor;
        // substring, line 75
        among_var = base.find_among_b(a_4);
        if (among_var == 0) {
            return false;
        }
        // ], line 75
        base.bra = base.cursor;
        switch (among_var) {
            case 1:
                // (, line 77
                // call R1, line 77
                if (!r_R1()) {
                    return false;
                }
                // <-, line 77
                if (!base.slice_from("ee")) {
                    return false;
                }
                break;
            case 2:
                // (, line 79
                // test, line 80
                var /** number */v_1 = base.limit - base.cursor;
                // gopast, line 80
                golab0: while (true) {
                    lab1: {
                        if (!base.in_grouping_b(g_v, 97, 121)) {
                            break lab1;
                        }
                        break golab0;
                    }
                    if (base.cursor <= base.limit_backward) {
                        return false;
                    }
                    base.cursor--;
                }
                base.cursor = base.limit - v_1;
                // delete, line 80
                if (!base.slice_del()) {
                    return false;
                }
                // test, line 81
                var /** number */v_3 = base.limit - base.cursor;
                // substring, line 81
                among_var = base.find_among_b(a_3);
                if (among_var == 0) {
                    return false;
                }
                base.cursor = base.limit - v_3;
                switch (among_var) {
                    case 1:
                        // (, line 83
                        // <+, line 83
                        {
                            var /** number */c1 = base.cursor;
                            base.insert(base.cursor, base.cursor, "e");
                            base.cursor = c1;
                        }
                        break;
                    case 2:
                        // (, line 86
                        // [, line 86
                        base.ket = base.cursor;
                        // next, line 86
                        if (base.cursor <= base.limit_backward) {
                            return false;
                        }
                        base.cursor--;
                        // ], line 86
                        base.bra = base.cursor;
                        // delete, line 86
                        if (!base.slice_del()) {
                            return false;
                        }
                        break;
                    case 3:
                        // (, line 87
                        // atmark, line 87
                        if (base.cursor != I_p1) {
                            return false;
                        }
                        // test, line 87
                        var /** number */v_4 = base.limit - base.cursor;
                        // call shortv, line 87
                        if (!r_shortv()) {
                            return false;
                        }
                        base.cursor = base.limit - v_4;
                        // <+, line 87
                        {
                            var /** number */c2 = base.cursor;
                            base.insert(base.cursor, base.cursor, "e");
                            base.cursor = c2;
                        }
                        break;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_1c() {
        // (, line 93
        // [, line 94
        base.ket = base.cursor;
        // or, line 94
        lab0: {
            var /** number */v_1 = base.limit - base.cursor;
            lab1: {
                // literal, line 94
                if (!base.eq_s_b("y")) {
                    break lab1;
                }
                break lab0;
            }
            base.cursor = base.limit - v_1;
            // literal, line 94
            if (!base.eq_s_b("Y")) {
                return false;
            }
        }
        // ], line 94
        base.bra = base.cursor;
        if (!base.out_grouping_b(g_v, 97, 121)) {
            return false;
        }
        // not, line 95
        lab2: {
            // atlimit, line 95
            if (base.cursor > base.limit_backward) {
                break lab2;
            }
            return false;
        }
        // <-, line 96
        if (!base.slice_from("i")) {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_2() {
        var /** number */among_var;
        // (, line 99
        // [, line 100
        base.ket = base.cursor;
        // substring, line 100
        among_var = base.find_among_b(a_5);
        if (among_var == 0) {
            return false;
        }
        // ], line 100
        base.bra = base.cursor;
        // call R1, line 100
        if (!r_R1()) {
            return false;
        }
        switch (among_var) {
            case 1:
                // (, line 101
                // <-, line 101
                if (!base.slice_from("tion")) {
                    return false;
                }
                break;
            case 2:
                // (, line 102
                // <-, line 102
                if (!base.slice_from("ence")) {
                    return false;
                }
                break;
            case 3:
                // (, line 103
                // <-, line 103
                if (!base.slice_from("ance")) {
                    return false;
                }
                break;
            case 4:
                // (, line 104
                // <-, line 104
                if (!base.slice_from("able")) {
                    return false;
                }
                break;
            case 5:
                // (, line 105
                // <-, line 105
                if (!base.slice_from("ent")) {
                    return false;
                }
                break;
            case 6:
                // (, line 107
                // <-, line 107
                if (!base.slice_from("ize")) {
                    return false;
                }
                break;
            case 7:
                // (, line 109
                // <-, line 109
                if (!base.slice_from("ate")) {
                    return false;
                }
                break;
            case 8:
                // (, line 111
                // <-, line 111
                if (!base.slice_from("al")) {
                    return false;
                }
                break;
            case 9:
                // (, line 112
                // <-, line 112
                if (!base.slice_from("ful")) {
                    return false;
                }
                break;
            case 10:
                // (, line 114
                // <-, line 114
                if (!base.slice_from("ous")) {
                    return false;
                }
                break;
            case 11:
                // (, line 116
                // <-, line 116
                if (!base.slice_from("ive")) {
                    return false;
                }
                break;
            case 12:
                // (, line 118
                // <-, line 118
                if (!base.slice_from("ble")) {
                    return false;
                }
                break;
            case 13:
                // (, line 119
                // literal, line 119
                if (!base.eq_s_b("l")) {
                    return false;
                }
                // <-, line 119
                if (!base.slice_from("og")) {
                    return false;
                }
                break;
            case 14:
                // (, line 121
                // <-, line 121
                if (!base.slice_from("less")) {
                    return false;
                }
                break;
            case 15:
                // (, line 122
                if (!base.in_grouping_b(g_valid_LI, 99, 116)) {
                    return false;
                }
                // delete, line 122
                if (!base.slice_del()) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_3() {
        var /** number */among_var;
        // (, line 126
        // [, line 127
        base.ket = base.cursor;
        // substring, line 127
        among_var = base.find_among_b(a_6);
        if (among_var == 0) {
            return false;
        }
        // ], line 127
        base.bra = base.cursor;
        // call R1, line 127
        if (!r_R1()) {
            return false;
        }
        switch (among_var) {
            case 1:
                // (, line 128
                // <-, line 128
                if (!base.slice_from("tion")) {
                    return false;
                }
                break;
            case 2:
                // (, line 129
                // <-, line 129
                if (!base.slice_from("ate")) {
                    return false;
                }
                break;
            case 3:
                // (, line 130
                // <-, line 130
                if (!base.slice_from("al")) {
                    return false;
                }
                break;
            case 4:
                // (, line 132
                // <-, line 132
                if (!base.slice_from("ic")) {
                    return false;
                }
                break;
            case 5:
                // (, line 134
                // delete, line 134
                if (!base.slice_del()) {
                    return false;
                }
                break;
            case 6:
                // (, line 136
                // call R2, line 136
                if (!r_R2()) {
                    return false;
                }
                // delete, line 136
                if (!base.slice_del()) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_4() {
        var /** number */among_var;
        // (, line 140
        // [, line 141
        base.ket = base.cursor;
        // substring, line 141
        among_var = base.find_among_b(a_7);
        if (among_var == 0) {
            return false;
        }
        // ], line 141
        base.bra = base.cursor;
        // call R2, line 141
        if (!r_R2()) {
            return false;
        }
        switch (among_var) {
            case 1:
                // (, line 144
                // delete, line 144
                if (!base.slice_del()) {
                    return false;
                }
                break;
            case 2:
                // (, line 145
                // or, line 145
                lab0: {
                    var /** number */v_1 = base.limit - base.cursor;
                    lab1: {
                        // literal, line 145
                        if (!base.eq_s_b("s")) {
                            break lab1;
                        }
                        break lab0;
                    }
                    base.cursor = base.limit - v_1;
                    // literal, line 145
                    if (!base.eq_s_b("t")) {
                        return false;
                    }
                }
                // delete, line 145
                if (!base.slice_del()) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_Step_5() {
        var /** number */among_var;
        // (, line 149
        // [, line 150
        base.ket = base.cursor;
        // substring, line 150
        among_var = base.find_among_b(a_8);
        if (among_var == 0) {
            return false;
        }
        // ], line 150
        base.bra = base.cursor;
        switch (among_var) {
            case 1:
                // (, line 151
                // or, line 151
                lab0: {
                    var /** number */v_1 = base.limit - base.cursor;
                    lab1: {
                        // call R2, line 151
                        if (!r_R2()) {
                            break lab1;
                        }
                        break lab0;
                    }
                    base.cursor = base.limit - v_1;
                    // (, line 151
                    // call R1, line 151
                    if (!r_R1()) {
                        return false;
                    }
                    // not, line 151
                    {
                        var /** number */v_2 = base.limit - base.cursor;
                        lab2: {
                            // call shortv, line 151
                            if (!r_shortv()) {
                                break lab2;
                            }
                            return false;
                        }
                        base.cursor = base.limit - v_2;
                    }
                }
                // delete, line 151
                if (!base.slice_del()) {
                    return false;
                }
                break;
            case 2:
                // (, line 152
                // call R2, line 152
                if (!r_R2()) {
                    return false;
                }
                // literal, line 152
                if (!base.eq_s_b("l")) {
                    return false;
                }
                // delete, line 152
                if (!base.slice_del()) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_exception2() {
        // (, line 156
        // [, line 158
        base.ket = base.cursor;
        // substring, line 158
        if (base.find_among_b(a_9) == 0) {
            return false;
        }
        // ], line 158
        base.bra = base.cursor;
        // atlimit, line 158
        if (base.cursor > base.limit_backward) {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_exception1() {
        var /** number */among_var;
        // (, line 168
        // [, line 170
        base.bra = base.cursor;
        // substring, line 170
        among_var = base.find_among(a_10);
        if (among_var == 0) {
            return false;
        }
        // ], line 170
        base.ket = base.cursor;
        // atlimit, line 170
        if (base.cursor < base.limit) {
            return false;
        }
        switch (among_var) {
            case 1:
                // (, line 174
                // <-, line 174
                if (!base.slice_from("ski")) {
                    return false;
                }
                break;
            case 2:
                // (, line 175
                // <-, line 175
                if (!base.slice_from("sky")) {
                    return false;
                }
                break;
            case 3:
                // (, line 176
                // <-, line 176
                if (!base.slice_from("die")) {
                    return false;
                }
                break;
            case 4:
                // (, line 177
                // <-, line 177
                if (!base.slice_from("lie")) {
                    return false;
                }
                break;
            case 5:
                // (, line 178
                // <-, line 178
                if (!base.slice_from("tie")) {
                    return false;
                }
                break;
            case 6:
                // (, line 182
                // <-, line 182
                if (!base.slice_from("idl")) {
                    return false;
                }
                break;
            case 7:
                // (, line 183
                // <-, line 183
                if (!base.slice_from("gentl")) {
                    return false;
                }
                break;
            case 8:
                // (, line 184
                // <-, line 184
                if (!base.slice_from("ugli")) {
                    return false;
                }
                break;
            case 9:
                // (, line 185
                // <-, line 185
                if (!base.slice_from("earli")) {
                    return false;
                }
                break;
            case 10:
                // (, line 186
                // <-, line 186
                if (!base.slice_from("onli")) {
                    return false;
                }
                break;
            case 11:
                // (, line 187
                // <-, line 187
                if (!base.slice_from("singl")) {
                    return false;
                }
                break;
        }
        return true;
    };

    /** @return {boolean} */
    function r_postlude() {
        // (, line 203
        // Boolean test Y_found, line 203
        if (!B_Y_found) {
            return false;
        }
        // repeat, line 203
        replab0: while (true) {
            var /** number */v_1 = base.cursor;
            lab1: {
                // (, line 203
                // goto, line 203
                golab2: while (true) {
                    var /** number */v_2 = base.cursor;
                    lab3: {
                        // (, line 203
                        // [, line 203
                        base.bra = base.cursor;
                        // literal, line 203
                        if (!base.eq_s("Y")) {
                            break lab3;
                        }
                        // ], line 203
                        base.ket = base.cursor;
                        base.cursor = v_2;
                        break golab2;
                    }
                    base.cursor = v_2;
                    if (base.cursor >= base.limit) {
                        break lab1;
                    }
                    base.cursor++;
                }
                // <-, line 203
                if (!base.slice_from("y")) {
                    return false;
                }
                continue replab0;
            }
            base.cursor = v_1;
            break replab0;
        }
        return true;
    };

    this.stem = /** @return {boolean} */function () {
        // (, line 205
        // or, line 207
        lab0: {
            var /** number */v_1 = base.cursor;
            lab1: {
                // call exception1, line 207
                if (!r_exception1()) {
                    break lab1;
                }
                break lab0;
            }
            base.cursor = v_1;
            lab2: {
                // not, line 208
                {
                    var /** number */v_2 = base.cursor;
                    lab3: {
                        // hop, line 208
                        {
                            var /** number */c1 = base.cursor + 3;
                            if (0 > c1 || c1 > base.limit) {
                                break lab3;
                            }
                            base.cursor = c1;
                        }
                        break lab2;
                    }
                    base.cursor = v_2;
                }
                break lab0;
            }
            base.cursor = v_1;
            // (, line 208
            // do, line 209
            lab4: {
                // call prelude, line 209
                if (!r_prelude()) {
                    break lab4;
                }
            }
            // do, line 210
            lab5: {
                // call mark_regions, line 210
                if (!r_mark_regions()) {
                    break lab5;
                }
            }
            // backwards, line 211
            base.limit_backward = base.cursor;base.cursor = base.limit;
            // (, line 211
            // do, line 213
            var /** number */v_5 = base.limit - base.cursor;
            lab6: {
                // call Step_1a, line 213
                if (!r_Step_1a()) {
                    break lab6;
                }
            }
            base.cursor = base.limit - v_5;
            // or, line 215
            lab7: {
                var /** number */v_6 = base.limit - base.cursor;
                lab8: {
                    // call exception2, line 215
                    if (!r_exception2()) {
                        break lab8;
                    }
                    break lab7;
                }
                base.cursor = base.limit - v_6;
                // (, line 215
                // do, line 217
                var /** number */v_7 = base.limit - base.cursor;
                lab9: {
                    // call Step_1b, line 217
                    if (!r_Step_1b()) {
                        break lab9;
                    }
                }
                base.cursor = base.limit - v_7;
                // do, line 218
                var /** number */v_8 = base.limit - base.cursor;
                lab10: {
                    // call Step_1c, line 218
                    if (!r_Step_1c()) {
                        break lab10;
                    }
                }
                base.cursor = base.limit - v_8;
                // do, line 220
                var /** number */v_9 = base.limit - base.cursor;
                lab11: {
                    // call Step_2, line 220
                    if (!r_Step_2()) {
                        break lab11;
                    }
                }
                base.cursor = base.limit - v_9;
                // do, line 221
                var /** number */v_10 = base.limit - base.cursor;
                lab12: {
                    // call Step_3, line 221
                    if (!r_Step_3()) {
                        break lab12;
                    }
                }
                base.cursor = base.limit - v_10;
                // do, line 222
                var /** number */v_11 = base.limit - base.cursor;
                lab13: {
                    // call Step_4, line 222
                    if (!r_Step_4()) {
                        break lab13;
                    }
                }
                base.cursor = base.limit - v_11;
                // do, line 224
                var /** number */v_12 = base.limit - base.cursor;
                lab14: {
                    // call Step_5, line 224
                    if (!r_Step_5()) {
                        break lab14;
                    }
                }
                base.cursor = base.limit - v_12;
            }
            base.cursor = base.limit_backward;
            // do, line 227
            var /** number */v_13 = base.cursor;
            lab15: {
                // call postlude, line 227
                if (!r_postlude()) {
                    break lab15;
                }
            }
            base.cursor = v_13;
        }
        return true;
    };

    /**@return{string}*/
    this['stemWord'] = function ( /**string*/word) {
        base.setCurrent(word);
        this.stem();
        return base.getCurrent();
    };
};

// // for node unit tests only. Can be deleted for production
// if(typeof module !== 'undefined') {
//   module.exports = Stemmer;
// }
'use strict';

var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
'use strict';

/*=========================================
=            String Processing            =
=========================================*/
// functions related to convering a string to a 
// series of tokens for indexing or querying

function tidy(str) {
  return JSON.stringify(str).replace(/[^\w\s]/gi, '').trim().toLowerCase();
}

function tokenize(str) {
  // this will do for now but actually should be much smarter
  return str.split(/[ ]+/);
}

function stem(tokens) {
  var stemmer = new Stemmer();
  return tokens.map(function (word) {
    return stemmer.stemWord(word);
  });
}

function removeStopWords(tokens) {
  // return the set of tokens without stopwords
  // keeping it super simple for now but need to add support for multi-language and
  // app author configuration
  return tokens.filter(function (x) {
    return !(stopwords.indexOf(x) > -1);
  });
}

var pipeline = [tidy, tokenize, stem, removeStopWords];

// call process in a string to return a set containing the index tokens
var processString = function processString(str) {
  return pipeline.reduce(function (val, fn) {
    return fn(val);
  }, str);
};

/*=====  End of String Processing  ======*/

// export for unit testing in node

// if(typeof module !== 'undefined') {
//   module.exports = {
//     tidy: tidy,
//     tokenize: tokenize,
//     removeStopWords: removeStopWords,
//     stem: stem,
//     processString: processString
//   };
// }
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function flattenObject(ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (_typeof(ob[i]) == 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function hashExists(hash) {
  try {
    get(hash);
    return true;
  } catch (err) {
    return false;
  }
}

function textSearchSpec() {
  return JSON.parse(property("textSearchSpec"));
}

function indexSpec() {
  return JSON.parse(property("indexSpec"));
}
