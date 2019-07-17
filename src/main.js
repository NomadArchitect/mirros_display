import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import appconfig from "@/app-config";

import axios from "axios";
import VueAxios from "vue-axios";

import VueTranslate from "vue-translate-plugin";
import AsyncComputed from "vue-async-computed";

import ActionCableVue from "actioncable-vue";

import "@/assets/sass/global.scss";

Vue.config.productionTip = false;
Vue.use(VueTranslate);

Vue.use(AsyncComputed);
Vue.use(VueAxios, axios);

Vue.config.errorHandler = function(err, vm, info) {
  // TODO: send error to backend for logging
  err, vm, info;
  localStorage.reloads = parseInt(localStorage.reloads) + 1 || 1;

  parseInt(localStorage.reloads) <= 10
    ? window.location.reload()
    : vm.$store.commit("SET_RUNTIME_ERROR", true);
};

const backend =
  process.env.NODE_ENV === "development"
    ? new URL(appconfig.backendUrl).host
    : `${window.location.host}`;

Vue.use(ActionCableVue, {
  debug: false,
  debugLevel: "error",
  connectionUrl: `ws://${backend}/cable`
});

axios.defaults.baseURL = appconfig.backendUrl;
axios.defaults.headers.common["Content-Type"] = "application/vnd.api+json";

Vue.filter("bcp47tag", function(language) {
  const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
  return language.replace(regex, match => {
    return match.toUpperCase().padStart(match.length + 1, "-");
  });
});

import locales from "@/locales/global";
Vue.locales(locales);

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
