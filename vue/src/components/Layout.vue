<template lang="html">
  <el-container>
  <el-header>Fractal Wiki</el-header>
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
// import BasicCard from './BasicCard'
export default {
  components:{
    ContentDisplay,
    // BasicCard
  }
}
</script>

<style lang="css">
</style>
