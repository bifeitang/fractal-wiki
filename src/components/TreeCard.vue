<template lang="html">
  <el-tree :data="treeNodes"
    :props="defaultProps"
    @node-click="handleNodeClick"
    default-expand-all="true">
  </el-tree>
</template>

<script>
export default {
  data() {
    return {
      defaultProps:{
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    treeNodes() {
      return this.$store.state.treeList
    }
  },
  methods:{
    handleNodeClick(data) {
      console.log(data);
    }
  }
}
</script>

<style lang="css">
</style>
