<template>
  <div id="app">
    <Layouts></Layouts>
  </div>
</template>

<script>
  import Layouts from './components/Layout.vue'
  export default {
    components:{
      Layouts
    }
  }
</script>

<style>
body {
  background: #44444d;
}
#app {
  /* font-family: 'Cinzel', serif;
  font-family: 'Montserrat Alternates', sans-serif;
  font-family: 'Cinzel Decorative', cursive;
  font-family: 'Goudy Bookletter 1911', serif; */

  /* font-family: 'Avenir', Helvetica, Arial, sans-serif; */
  font-family: 'Goudy Bookletter 1911', Georgia, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0px;
  margin-bottom: 20px;
}

input, textarea, select, button {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
}

</style>
