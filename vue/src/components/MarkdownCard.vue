<template lang="">
  <div class="markdown-editor">
    <markdown-editor v-model="content" ref="markdownEditor">
    </markdown-editor>
  </div>
</template>

<script>
import markdownEditor from 'vue-simplemde/src/markdown-editor'

export default {
  data() {
    return {
      content: ''
    }
  },
  components: {
    markdownEditor
  }
}
</script>

<style>

</style>
