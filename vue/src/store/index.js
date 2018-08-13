import Vue from 'vue'
import Vuex from 'vuex'
import {fetchJSON} from '../api'

Vue.use(Vuex)

export function createStore(){
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      cardSelectionList: {
        values: [
          { key: 'Micheal', value: 'hash' },
        ]
      },
    },
    actions:{
      LOAD_CARD_LIST: ({commit}) => {
        fetchJSON('fn/card/getCardLists').then(cardList =>{
          var lists = []
          cardList.map(cardInfo => {
            lists.push({
              key: cardInfo.cardTitle + cardInfo.author,
              value: cardInfo.cardHash
            })
          })
          commit('SET_CARD_LIST', {lists})
        })
      }/*,
      UPDATE_CARD_LIST ({commit}){
        setTimeout(() => {
          commit('APPEND_CARD_LIST')
        }, 1000)
        // TODO:  Call this inside card create
        // Post().then((response) => {commit()})
        // Only fetch the card not already exist
        const now = Date.now()
      }*/
    },
    mutations: {
      SET_CARD_LIST: (state, {lists})=>{
        lists.map(item => {
          state.cardSelectionList.values.push(item)
        })
      }/*,
      APPEND_CARD_LIST: (state,{list})=>{
        state.cardSelectionList.append()
      }*/
    }/*,
    getters: {
      // Allow components access to the data here, do some process and cache the data here
      uniqueCardList: state => {
        return state.cardSelectionList.filter(card => card.filter)
      }
    }*/
  })
}
