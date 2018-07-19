<template>
  <div class="tree-structure">
    <li>
      <div
      :class="{bold: isFolder}"
      @click="toggle"
      @dblclick="changeType">
      {{ model.name }}
      <span v-if="isFolder">[{{ open ? '-' : '+' }}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <item
        class="item"
        v-for="(model, index) in model.children"
        :key="index"
        :model="model">
      </item>
      <li class="add" @click="addChild">+</li>
    </ul>
    </li>
  </div>
</template>

<script>
</script>
