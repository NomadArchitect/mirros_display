<template>
    <div v-html="data.content"></div>
</template>

<script>
export default {
  name: "genericHTML",
  props: {
    data: {
      content: Object
    }
  }
};
</script>

<style>
</style>
