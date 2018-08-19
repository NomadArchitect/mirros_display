import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import appconfig from "@/appconfig";

import axios from "axios";

Vue.config.productionTip = false;

axios.defaults.baseURL = appconfig.backendUrl;

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
