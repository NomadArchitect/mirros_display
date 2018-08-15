import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import appconfig from "@/appconfig";

import axios from "axios";
import VueAxios from "vue-axios";

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);

axios.defaults.baseURL = appconfig.backendUrl;

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
