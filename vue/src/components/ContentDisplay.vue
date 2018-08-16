<template lang="html">
  <!-- Edit Mode -->
  <el-container
  class="is-hover-shadow"
  v-if="!meta.pureText">
    <!-- In the Edit Mode -->
    <div class="card" type="button" v-if="isEdit" @dblclick="editCard">
      <el-header class="title-edit" style="text-align: center; font-size: 16px">
        <el-row :gutter="10">
          <el-col :span="6" class="card-title">Card Name:</el-col>
          <el-col :span="6">
            <el-input v-model="meta.title" class="card-title" placeholder="Card Name"></el-input>
          </el-col>
          <el-col :span="6">
            <el-select v-model="meta.selectCardType" placeholder="Card Type">
              <el-option v-for="type in cardTypes" :key="type" :value="type">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-header>

      <el-main class="main-card" v-if="show">
        <div v-if="meta.selectCardType === 'Markdown'">
          <markdown-editor v-model="meta.content" ref="markdownEditor"></markdown-editor>
        </div>

        <div class="image" v-else-if="meta.selectCardType === 'Image'">
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList2"
            list-type="picture">
            <el-button size="small" type="primary">click to upload</el-button>
            <div slot="tip" class="el-upload__tip">Only jpg/png，no larger than 500kb</div>
          </el-upload>
        </div>

        <VueTribute :options="tributeOptions" v-else>
          <textarea class="textarea"
          rows="8"
          placeholder="content of the card"
          v-model.lazy="meta.content"
          @keyup.50="updateCardList"
          ></textarea>
        </VueTribute>
      </el-main>

      <el-footer>
        <el-button class="submit-btn" type="success" round v-on:click="finishEdit">Submit</el-button>
      </el-footer>
    </div>

    <!-- In the displaying mode -->
    <div class="card" type="button" v-if="!isEdit" @dblclick="editCard">
      <div v-if="meta.selectCardType === 'Markdown'">
          <div v-html="compiledMarkdown" class="markdown-body"></div>
      </div>
      <div v-else-if="meta.selectCardType === 'Image'">

      </div>
      <div v-else>
        <el-header class="title-closed" style="text-align: center; font-size: 16px">
          <el-row :gutter="20">
            <el-col :span="2" style="margin-top: 10px">
              <el-button
                class="down-btn"
                type="primary"
                size="middle"
                icon="el-icon-arrow-down"
                style="float: left"
                circle
                autofocus
                v-on:click="showCard">
              </el-button>
            </el-col>
            <el-col :span="22">
              <span class="text">{{meta.title}}</span>
            </el-col>
          </el-row>
        </el-header>

        <el-main class="main-card" v-if="show">
          <div v-if="childCards.length">
            <basic-card v-for="child in childCards" :metadata="child"></basic-card>
          </div>
          <div v-else>
            {{meta.content}}
          </div>
        </el-main>
      </div>

    </div>
  </el-container>
  <div v-else>
    {{meta.content}}
  </div>
</template>

<script>
import VueTribute from 'vue-tribute'
import markdownEditor from 'vue-simplemde/src/markdown-editor'
import {fetchJSON, fetchText} from '../api'

export default {
  name: 'basic-card',
  props: {
    metadata: {
      type: Object,
      default () {
        return {
          title: 'Your Title',
          content: 'Your Content',
          selectCardType: 'Plain',
          hash: "",
          pureText: false,
        }
      }
    }
  },
  computed: {
    tributeOptions() {
      return this.$store.state.cardSelectionList
    },
    simplemde() {
      return this.$refs.markdownEditor.simplemde
    },
    compiledMarkdown() {
      console.log("Inside the markdown function")
      return this.simplemde.markdown(this.meta.content)
    }
  },
  data () {
    return {
      meta: this.metadata,
      cardTypes: ["CSS", "JavaScript", "Plain", "HTML", "Markdown", "Image"],
      action: 'unfold',
      show: true,
      isEdit: false,
      childCards: [],
      editTime: 0,
      cardHash: "",
      fileList2: [{name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}, {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}]
    }
  },
  components: {
    VueTribute,
    markdownEditor
  },
  created() {
    this.parseContent();
    this.initCardList();
  },
  methods: {
    showCard() {
      this.show = !this.show;
    },
    finishEdit() {
      this.isEdit = false;

      if (this.editTime === 0) {
        fetchJSON('fn/card/cardCreate', {
          title: this.meta.title,
          content: this.meta.content,
          card_type: this.meta.selectCardType,
        }).then(hash => {
          this.cardHash = hash
        })
      } else {
        fetchJSON('fn/card/cardUpdate', {
          title: this.meta.title,
          content: this.meta.content,
          card_type: this.meta.selectCardType,
          cardHash: this.cardHash
        }).then(hash => {
          this.cardHash = hash
        })
      }

      this.editTime++;
      this.parseContent();
    },
    parseContent() {
      var hashList = this.meta.content.match(/[A-Za-z0-9]{46}/g)
      var tempChildList = []
      if (hashList !== null) {
        fetchText('fn/card/cardRead', String(hashList)).then(result => {
          var cardContents = result.split("|")
          var counter = 0
          var pos = 0

          this.meta.content.replace(/{{\w{46}}}/g,
            function(match, offset, s){
              // push the previous string
              if (offset !== 0) {
                tempChildList.push({
                  content: s.substring(pos, offset),
                  pureText: true,
                })
              }
              pos = offset + match.length

              let curCard = JSON.parse(cardContents[counter])
              tempChildList.push({
                title: curCard.title,
                content: curCard.content,
                selectCardType: curCard.card_type,
                hash: "",
                pureText: false,
              })
              counter++;
              return match;
            });
        });
      }
      this.childCards = tempChildList;
    },
    editCard(e) {
      e.stopPropagation();
      this.isEdit = !this.isEdit;
    },
    initCardList() {
      // Connect this with listener to the submit => create card => update list
      this.$store.dispatch('LOAD_CARD_LIST')
    },
    updateCardList() {
      this.$store.dispatch('UPDATE_CARD_LIST')
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    }
  }
}
</script>

<style lang="css">
  .text {
    font-size: 1.25em;
    font-weight: 400;
    text-align: middle;
  }

  .textarea {
    width: 600px;
    height: 100%;
    background: #cccdd6;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    font-family: 'Goudy Bookletter 1911', Helvetica, Arial, serif, sans-serif;
    padding: 2px;
  }

  el-main.main-card {
    position: absolute;
    left: 2px;
  }

  .card {
    width: 100%;
    height: 100%;
  }

  .el-header {
    padding: 0 0 0 8px;
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
    overflow: visible;
  }

  .title-edit {
    font-size: 1em !important;
  }

  .title-closed {
    font-size: 1.2em !important;
  }

  .card-title {
    font-weight: bold;
    font-size: 1.5em;
  }

  .down-btn {
    border-radius: 15px;
    background: #5d837d !important;
    border-color: #23423d !important;
  }

  .submit-btn {
    background: #5d837d !important;
    border-color: #23423d !important;
    position: relative;
    right: 0;
  }

  .el-select-dropdown__list {
    background: #cccdd6;
  }

  input.el-input__inner {
    background-color: #cccdd6;
  }


</style>

<style>
  @import '~simplemde/dist/simplemde.min.css';
  @import '~github-markdown-css';
</style>
