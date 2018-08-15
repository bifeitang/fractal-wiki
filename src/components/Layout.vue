<template lang="html">
  <el-container>
  <el-header>Fractal Wiki</el-header>

  <SearchCard></SearchCard>

  <el-container>
    <el-aside width="300px">
      <ContentDisplay>
      </ContentDisplay>
      <!-- <BasicCard></BasicCard> -->
    </el-aside>

    <el-container>
      <el-main>
        <ContentDisplay></ContentDisplay>
        <!-- <BasicCard></BasicCard> -->
      </el-main>
    </el-container>

  </el-container>
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
</style>
