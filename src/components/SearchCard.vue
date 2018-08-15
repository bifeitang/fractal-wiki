<template lang="html">
  <el-input v-model="searchQuery.keywords">
    <el-select v-model="searchQuery.field" slot="prepend" placeholder="Field">
      <el-option label="timestamp" value="timestamp"></el-option>
      <el-option label="author" value="author"></el-option>
      <el-option label="title" value="title"></el-option>
      <el-option label="all" value="all"></el-option>
    </el-select>
    <el-button slot="append" icon="el-icon-search" @click="sendQuery"></el-button>
  </el-input>
</template>

<script>
import {fetchJSON} from '../api'

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
      console.log("Inside sending query")
      fetchJSON('fn/card/fieldCardSearch', this.searchQuery).then(result => {
        console.log(result);
        this.results = result;
        console.log(this.results);
      })
    }
  }
}
</script>

<style lang="css">
</style>
