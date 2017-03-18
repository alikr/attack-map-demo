/*
 * @author smailsky
 * https://github.com/smailsky
 */

import Vue from 'vue';
import map from './map/index.vue';

const app = new Vue({
	el: '#app',
	render:(h)=>h(map)
})