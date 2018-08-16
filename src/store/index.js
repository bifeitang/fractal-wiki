import Vue from 'vue'
import Vuex from 'vuex'
import {fetchJSON} from '../api'

Vue.use(Vuex)

// DEBUG: Not necessary to use the cache now

export function createStore(){
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      cardSelectionList: {
        trigger: '@',
        selectTemplate: function (item) {
          return '{{' + item.original.value + "}}";
        },
        values: [],
      },
      updateTime: 0,
      treeList: [{
        label: 'card1',
        children: []
      },{
        label: 'card2',
        children: [{
          label: 'card2.1',
          children: [{
            label: 'card2.1.1',
            children: []
          }, {
            label: 'card2.2.2',
            children: []
          }]
        }]
      }, {
        label: 'card3',
        children: []
      }]
    },
    actions:{
      LOAD_CARD_LIST: ({state, commit}) => {
        fetchJSON('fn/card/getCardLists').then(cardList =>{
          console.log("Init Time:" + state.updateTime)
          // BUG: May miss some cards if others are pushing
          commit('UPDATE_TIME')
          var lists = []
          cardList.map(cardInfo => {
            lists.push({
              key: cardInfo.cardTitle + cardInfo.author,
              value: cardInfo.cardHash
            })
          })
          commit('SET_CARD_LIST', {lists})
        })
      },
      UPDATE_CARD_LIST: ({state, commit}) => {
        console.log("Update Time:" + state.updateTime)
        fetchJSON('fn/card/updateCardList', state.updateTime).then(cardList =>{
          // BUG: May miss some cards if others are pushing
          commit('UPDATE_TIME')
          var lists = []
          cardList.map(cardInfo => {
            lists.push({
              key: cardInfo.cardTitle + cardInfo.author,
              value: cardInfo.cardHash
            })
          })
          commit('SET_CARD_LIST', {lists})
        })
      }
    },
    mutations: {
      SET_CARD_LIST: (state, {lists})=>{
        if (lists.length === 0) {
          return;
        }
        var listToMap = new Map(state.cardSelectionList.values.map(
          i => [i.key, i.value]
        ))

        lists.map(i => {
          listToMap.set(i.key, i.value)
        })

        const newCardList =  Array.from(listToMap).map(i => {
          return {
            key: i[0],
            value: i[1]
          }
        })
        state.cardSelectionList.values = newCardList
        console.log(state.cardSelectionList.values)
      },
      UPDATE_TIME: (state) => {
        state.updateTime = Date.now()
      },
      ADD_TREE_NODE: (state, {treeList, indices, newNode}) => {
          let parent = treeList[indices.shift()];
          indices.forEach((i) => {
            parent = parent.children[i];
          });
          parent.children.push(newNode);
      }
    }
  })
}
