<template>
  <section class="container">
    <section class="banner">
    </section>

    <section class="tree">
      <!-- write the list here -->
    </section>

    <section class="card_list">
      <button class="card_button" v-on:dblclick="displayCard">
        <card v-if="show_editor">
        </card>
        <button>submit</button>
      </button>
    </section>

  </section>
</template>

<script>
  import card from './card';

  export default {
    data() {
      return {
        show_editor: false
      };
    },
    components: {
      card
    },
    methods: {
      displayCard(){
        this.show_editor = !this.show_editor;
      }
    }
  };
</script>

<style>
@import '../common/style/layout.css';

</style>
