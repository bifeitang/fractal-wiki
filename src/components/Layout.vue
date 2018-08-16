<template lang="html">
  <el-container>
  <el-header class="page-header">Fractal Wiki</el-header>
    <SearchCard></SearchCard>
  <el-container class="overview-container">
    <el-aside class="aside" max-width="300px">
      <ContentDisplay></ContentDisplay>
      <!-- <BasicCard></BasicCard> -->
    </el-aside>
    <el-container class="main">
      <ContentDisplay></ContentDisplay>
      <!-- <BasicCard></BasicCard> -->
    </el-container>
  </el-container >
</el-container>

</template>

<script>
import ContentDisplay from './ContentDisplay'
import SearchCard from './SearchCard'
// import BasicCard from './BasicCard'
export default {
  components:{
    ContentDisplay,
    SearchCard,
    // BasicCard
  }
}
</script>

<style lang="css">
  .page-header {
    height: 75px !important;
    font-weight: bold;
    font-size: 3em;
    border: 5px double #44444d;
  }

  .overview-container {
    display: flex;
  }

  .aside {
    width: 100%;
    height: 100%;
    margin: 10px;
    background: #838f9e;
    font-size: 20px;
    color: #c5c5d1;
    text-align: left;
    border: 2px solid #5d837d;
    flex-shrink: none;
    flex: 0 1 auto !important;
  }

  .main {
    width: 100%;
    height: 100%;
    margin: 10px;
    background: #838f9e;
    font-size: 20px;
    color: #c5c5d1;
    text-align: left;
    border: 2px solid #B3C0D1;
    padding: 6px !important;
    flex-shrink: none;
    flex: 0 1 auto !important;
  }

</style>
