<template>
     <table class="table">
       <tr v-for="row in data.rows">
         <td v-for="cell in row" v-if="cell.startsWith('icon:')">
           <img :src="'static/' + cell.slice(5)" />
         </td>
         <td v-else-if="cell.startsWith('iconClass:')">
           <i :class="cell.slice(10)"></i>
         </td>
         <td v-else>{{ cell }}</td>
       </tr>
     </table>
</template>

<script>
// @TODO: Check path for image assets
    export default {
      name: 'dataTable',
      props: {
        data: {
          rows: Array
        }
      }
    }
</script>

<style>
    .table {

    }
</style>
