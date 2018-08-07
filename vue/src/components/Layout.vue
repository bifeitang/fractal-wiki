<template lang="html">
  <el-container>
  <el-header>Fractal Wiki</el-header>
  <el-container>
    <el-aside width="300px">
      <ContentDisplay>
      </ContentDisplay>
    </el-aside>

    <el-container>
      <el-main>
        <ContentDisplay>
          <ContentDisplay>
          </ContentDisplay>
        </ContentDisplay>
      </el-main>
    </el-container>

  </el-container>
</el-container>
</template>

<script>
import ContentDisplay from './ContentDisplay'
export default {
  components:{
    ContentDisplay
  }
}
</script>

<style lang="css">
</style>
