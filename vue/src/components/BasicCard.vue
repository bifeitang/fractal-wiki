<template lang="html">
  <!-- Edit Mode -->
  <el-container
  style=" border: 1px solid #eee"
  class="is-hover-shadow">
    <div class="card" type="button" v-if="isEdit" v-on:dblclick="editCard">
      <el-header style="text-align: center; font-size: 16px">
        <el-row :gutter="20">
          <el-col :span="4">CardName:</el-col>
          <el-col :span="4">
            <el-input v-model="title" placeholder="card_name"></el-input>
          </el-col>
          <el-col :span="16">
            <el-select v-model="selectCardType" placeholder="Card Type">
              <el-option v-for="type in cardTypes" :key="type" :value="type">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-header>

      <el-main v-if="show">
        <el-input type="textarea" :rows="10"
        placeholder="content of the card"
        v-model.lazy="content"></el-input>
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
            <span class="text">{{title}}</span>
          </el-col>
        </el-row>
      </el-header>

      <el-main v-if="show">
        <asyncComponents :content="content"></asyncComponents>
        <span v-if="selectCardType ==='Plain'">{{content}}
          <slot></slot>
        </span>
        <span v-if="selectCardType === 'HTML'" v-html="content">{{content}}
          <slot></slot>
        </span>
      </el-main>
    </div>
  </el-container>
</template>

<script>
import asyncComponents from './asyncComponents'

export default {
  name: 'basic-card',
  data () {
    return {
      title : 'Card Name',
      content: "",
      cardTypes: ["CSS", "JavaScript", "Plain", "Edit", "HTML"],
      action: 'unfold',
      show: true,
      selectCardType: 'Plain',
      isEdit: false,
      tags: [],
      contents: []
    }
  },
  components: {
    asyncComponents
  },
  methods: {
    showCard() {
      this.show = !this.show;
    },
    finishEdit() {
      this.isEdit = false;

      this.postRequest('cardCreate', JSON.stringify({
        title: this.title,
        content: this.content,
        card_type: this.selectCardType,
      }));
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
