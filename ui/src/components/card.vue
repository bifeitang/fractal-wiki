<template>
    <div id="editor">
        <!-- here each card is supposed to be actual card, with function:
          * doubleClick() fold unfold (toggle)
          * postNew() send the new content -->
        <markdown-editor v-model="content" ref="markdownEditor">
        </markdown-editor>
    </div>
</template>

<script>

// Local Registration
import markdownEditor from 'vue-simplemde/src/markdown-editor'

export default {
    name: 'editor',
    components: {
        markdownEditor
        // or 'mavon-editor': mavonEditor
    },
    data () {
      return {
        content: '',
        configs: {
          status: false, // disable the status bar at the bottom
          spellChecker: false // disable spell check
        }
      }
    },
    computed: {
      simplemde () {
        return this.$refs.markdownEditor.simplemde
      }
    },
    mounted () {
      console.log(this.simplemde)
      this.simplemde.togglePreview()
      // 'change' envent has bound, via @input attache an event listener
      // You can attache events in this [list](https://codemirror.net/doc/manual.html#events) yourself if necessary
      this.simplemde.codemirror.on('beforeChange', (instance, changeObj) => {
        // do some things
      })
      // remove SimpleMDE, when component destroy will invoke
      this.simplemde = null
      // some useful methods
      this.$refs.markdownEditor.initialize() // init
      this.simplemde.toTextArea()
      this.simplemde.isPreviewActive() // returns boolean
      this.simplemde.isSideBySideActive() // returns boolean
      this.simplemde.isFullscreenActive() // returns boolean
      this.simplemde.clearAutosavedValue() // no returned value
      this.simplemde.markdown(this.content) // returns parsed html
      this.simplemde.codemirror.refresh() // refresh codemirror
    },
    methods: {
      handleInput () {
        // do some things
      }
    }
}
</script>
<style>
  @import 'simplemde/dist/simplemde.min.css';
</style>
