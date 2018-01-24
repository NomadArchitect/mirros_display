<template>
  <div class="list">
    <ul>
      <li v-for="item in data.items">
        <i v-if="item.iconClass" :class="item.iconClass"></i>
        {{ item.text }}
      </li>
    </ul>
  </div>
</template>

<script>

  export default {
    name: 'list',
    props: {
      data: {
        items: Array
      }
    }
  }
</script>

<style>

</style>
