import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import appconfig from "@/appconfig";

import axios from "axios";

import VueTranslate from "vue-translate-plugin";
import AsyncComputed from "vue-async-computed";

import "@/assets/sass/global.scss";

Vue.config.productionTip = false;
Vue.use(VueTranslate);
Vue.use(AsyncComputed);

axios.defaults.baseURL = appconfig.backendUrl;
axios.defaults.headers.common["Content-Type"] = "application/vnd.api+json";

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
