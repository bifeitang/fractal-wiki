import Vue from 'vue'
import Vuex from 'vuex'
import {fetchJSON} from '../api'

Vue.use(Vuex)

// DEBUG: Not necessary to use the cache now

export function createStore(){
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      // TODO: Better to use a Hash map here and then transfer it into the desired list
      cardSelectionList: {
        trigger: '@',
        selectTemplate: function (item) {
          return '{{' + item.original.value + "}}";
        },
        values: [],
      },
      updateTime: 0
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
        lists.map(item => {
          state.cardSelectionList.values.push(item)
        })
      },
      UPDATE_TIME: (state) => {
        state.updateTime = Date.now()
      }
    }
  })
}
