<template lang="html">
  <!-- Edit Mode -->
  <el-container
  style=" border: 1px solid #eee"
  class="is-hover-shadow"
  v-if="!meta.pureText">
    <div class="card" type="button" v-if="isEdit" @dblclick="editCard">
      <el-header style="text-align: center; font-size: 16px">
        <el-row :gutter="20">
          <el-col :span="4">CardName:</el-col>
          <el-col :span="4">
            <el-input v-model="meta.title" placeholder="card_name"></el-input>
          </el-col>
          <el-col :span="16">
            <el-select v-model="meta.selectCardType" placeholder="Card Type">
              <el-option v-for="type in cardTypes" :key="type" :value="type">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-header>

      <el-main v-if="show">
        <el-input type="textarea" :rows="10"
        placeholder="content of the card"
        v-model.lazy="meta.content"></el-input>
        <el-button type="success" round v-on:click="finishEdit">Submit</el-button>
      </el-main>
    </div>
    <div class="card" type="button" v-if="!isEdit" v-on:dblclick="editCard">
      <el-header style="text-align: center; font-size: 16px">
        <el-row :gutter="20">
          <el-col :span="2" style="margin-top: 10px"><el-button
          type="primary"
          size="middle"
          icon="el-icon-arrow-down"
          style="float: left"
          circle
          autofocus
          v-on:click="showCard"></el-button></el-col>
          <el-col :span="22">
            <span class="text">{{meta.title}}</span>
          </el-col>
        </el-row>
      </el-header>

      <el-main v-if="show">
        <div v-if="childCards.length">
          <basic-card v-for="child in childCards" :metadata="child"></basic-card>
        </div>
        <div v-else>
          {{meta.content}}
        </div>
      </el-main>
    </div>
  </el-container>
  <div v-else>
    {{meta.content}}
  </div>
</template>

<script>
import asyncComponents from './asyncComponents'

export default {
  name: 'basic-card',
  props: {
    metadata: {
      type: Object,
      default () {
        return {
          title: 'default title',
          content: 'default content',
          selectCardType: 'Plain',
          hash: "",
          pureText: false,
        }
      }
    }
  },
  data () {
    return {
      meta: this.metadata,
      cardTypes: ["CSS", "JavaScript", "Plain", "Edit", "HTML"],
      action: 'unfold',
      show: true,
      isEdit: false,
      childCards: [],
    }
  },
  components: {
    asyncComponents
  },
  created() {
    this.parseContent()
  },
  methods: {
    showCard() {
      this.show = !this.show;
    },
    finishEdit() {
      this.isEdit = false;

      this.postRequest('cardCreate', JSON.stringify({
        title: this.meta.title,
        content: this.meta.content,
        card_type: this.meta.selectCardType,
      }));

      this.parseContent();
    },
    parseContent() {
      // Create the pormise
      const API_BASE = "http://localhost:4141/fn"

      const readCardPromise = (name, data) => {
        const url = `${API_BASE}/card/${name}`
        return fetch(url, {
          method: 'post',
          body: (data),
        }).then(r => r.text())
      }

      var hashList = this.meta.content.match(/[A-Za-z0-9]{46}/g)
      var tempChildList = []
      readCardPromise('cardRead', String(hashList)).then(result => {
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
      this.childCards = tempChildList;
    },
    postRequest(funName, funContents) {
      const API_BASE = "http://localhost:4141/fn"

      const endpoint = (name, data) => {
        const url = `${API_BASE}/card/${name}`
        return fetch(url, {
          method: 'post',
          body: (data),
        }).then(r => r.json())
      }

      endpoint(funName, funContents);
    },
    editCard(e) {
      e.stopPropagation();
      this.isEdit = !this.isEdit;
    }
  }
}
</script>

<style lang="css">
  .text {
    font-size: 16px;
    text-align: left;
  }

  .card {
    width: 100%;
    height: 100%;
  }

  .el-header {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
</style>
