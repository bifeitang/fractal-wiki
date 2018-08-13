import Vue from 'vue'
import App from './App.vue'
import {createStore} from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.use(ElementUI)

const store = createStore()

new Vue({
  store,
  render: h=>h(App)
}).$mount('#app')
