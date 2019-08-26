import Vue from 'vue'
import App from './App'
import Global from './utils/global.js'

Vue.config.productionTip = false

App.mpType = 'app'
Vue.prototype.globalData = Global

const app = new Vue({
    ...App
})
app.$mount()
