<template lang="html">
  <VueTribute :options="tributeOptions">
    <!-- <textarea></textarea> -->
    <textarea :rows="10"></textarea>
  </VueTribute>
</template>

<script>
import VueTribute from 'vue-tribute'

export default {
  components:{
    VueTribute
  },
  data () {
    return {
      tributeOptions: {
        values: [
          { key: 'Micheal', value: 'hash' },
          { key: 'Lisa', value: 'fun' },
          { key: 'Willum', value: 'seems legit' },
          { key: 'Danial', value: 'Cool' },
          { key: 'Yang', value: 'bad'},
          { key: 'Joel', value: 'best'}
        ]
      }
    }
  },
  created() {
    setInterval(this.initCardList, 10000);
  },
  methods: {
    initCardList() {
      // Connect this with listener to the submit => create card => update list
      const API_BASE = "http://localhost:4141/fn"

      const readCardPromise = (name, data) => {
        const url = `${API_BASE}/card/${name}`
        return fetch(url, {
          method: 'post',
          body: (data),
        })
      }

      readCardPromise("getCardLists").then(result => {
        console.log(result);
      })
    },
    append() {
      let kv = Math.random()
        .toString(36)
        .slice(2)
      this.tributeOptions.values.push({
        key: kv,
        value: kv
      })
    }
  }
}
</script>

<style lang="css">
</style>
