import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";

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

const backendUrl = `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOSTNAME}:${process.env.VUE_APP_BACKEND_PORT}${process.env.VUE_APP_BACKEND_PATH}`;

axios.defaults.baseURL = backendUrl;
axios.defaults.headers.common["Content-Type"] = "application/vnd.api+json";

// eslint-disable-next-line no-unused-vars
Vue.config.errorHandler = function (err, vm, info) {
  axios.post("/system/log_client_error", {
    error: err.message,
    stack: err.stack,
    instance: vm.$vnode.tag,
  });
  if (process.env.NODE_ENV != "development") {
    localStorage.reloads = parseInt(localStorage.reloads) + 1 || 1;

    parseInt(localStorage.reloads) <= 5
      ? window.location.reload()
      : vm.$store.commit("SET_RUNTIME_ERROR", vm.$parent._uid);
  } else {
    // eslint-disable-next-line no-console
    console.debug(err, vm, info);
  }
};

Vue.use(ActionCableVue, {
  debug: false,
  debugLevel: "error",
  connectionUrl: `ws://${process.env.VUE_APP_BACKEND_HOSTNAME}:${process.env.VUE_APP_BACKEND_PORT}/cable`,
});

Vue.filter("bcp47tag", function (language) {
  const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
  return language.replace(regex, (match) => {
    return match.toUpperCase().padStart(match.length + 1, "-");
  });
});

import locales from "@/locales/global";
Vue.locales(locales);

new Vue({
  backendUrl: backendUrl,
  store: store,
  render: (h) => h(App),
}).$mount("#app");
