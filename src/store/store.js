import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        kias: 0
    },
    getters: {
        getKias(state) {
            return state.kias
        }
    },
    mutations: {
        setKiasFun(state, val) {
            val = parseInt(val)
            state.kias = val
        }
    },
    actions: {
        setKias(context, n) {
            context.commit("setKiasFun", n)
        }
    }

})