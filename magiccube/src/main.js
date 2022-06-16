import Vue from 'vue'
import App from './App.vue'
import './assets/fonts/font.css';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

//引入axios
import axios from 'axios';
Vue.prototype.$axios = axios

//引入echarts
import echarts from "echarts";
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
