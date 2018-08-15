<template lang="html">
  <div class="SearchComponent">
    <el-input v-model="searchQuery.keywords" @keyup.enter="sendQuery">
      <el-select v-model="searchQuery.field" slot="prepend" placeholder="Field">
        <el-option label="timestamp" value="timestamp"></el-option>
        <el-option label="author" value="author"></el-option>
        <el-option label="title" value="title"></el-option>
        <el-option label="all" value="all"></el-option>
      </el-select>
      <el-button slot="append" icon="el-icon-search" @click="sendQuery"></el-button>
    </el-input>

    <div v-if="results.length !== 0">
      <ContentDisplay v-for="card in results" :metadata="card" :parentShow="false">
      </ContentDisplay>
    </div>
  </div>

</template>

<script>
import {fetchJSON} from '../api'
import ContentDisplay from './ContentDisplay'

export default {
  data(){
    return {
      searchQuery: {
        field: "all",
        keywords: ""
      },
      results: [],
    }
  },
  methods: {
    sendQuery() {
      this.results = []
      fetchJSON('fn/card/fieldCardSearch', this.searchQuery).then(result => {
        result.map(item => {
          this.results.push(JSON.parse(item).Card)
        })
      })
    }
  },
  components: {
    ContentDisplay,
  }
}
</script>

<style lang="css">
</style>
