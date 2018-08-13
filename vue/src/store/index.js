import Vue from 'vue'
import Vuex from 'vuex'
import {fetchJSON, fetchText} from '../api'

Vue.use(Vuex)

export function createStore(){
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      cardSelectionList: {
        values:[]
      },
    },
    actions:{
      LOAD_CARD_LIST: function({commit}){
        // Promise(fetch_list).then(commit list data)
        fetchJSON('/fn/card/getCardLists').then(cardList =>{
          cardList.map(cardInfo => {
            console.log(cardInfo)
            this.append(cardInfo.author + cardInfo.cardTitle, cardInfo.cardHash)
            commit('SET_CARD_LIST')
          })
        })
      },
      UPDATE_CARD_LIST ({commit}){
        setTimeout(() => {
          commit('APPEND_CARD_LIST')
        }, 1000)
        // TODO:  Call this inside card create
        // Post().then((response) => {commit()})
        // Only fetch the card not already exist
        const now = Date.now()
      }
    },
    mutations: {
      SET_CARD_LIST: (state, {list})=>{
        // Do card list update here
        state.cardSelectionList = list
      },
      APPEND_CARD_LIST: (state,{list})=>{
        state.cardSelectionList.append()
      }
    },
    getters: {
      // Allow components access to the data here, do some process and cache the data here
      uniqueCardList: state => {
        return state.cardSelectionList.filter(card => card.filter)
      }
    }
  })
}
