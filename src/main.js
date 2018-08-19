import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import appconfig from "@/appconfig";

import axios from "axios";

import VueTranslate from "vue-translate-plugin";

Vue.config.productionTip = false;
Vue.use(VueTranslate);

axios.defaults.baseURL = appconfig.backendUrl;

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
