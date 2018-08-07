import Vue from 'vue'
import Router from 'vue-router'
import Layouts from '@/components/Layouts'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BasicCard',
      component: Layouts
    }
  ]
})
