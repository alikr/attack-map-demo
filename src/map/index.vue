/*
 * @author smailsky
 * https://github.com/smailsky
 */

<template>
  <div>
    <city v-on:city="showCity"></city>
    <canvas :width="width" :height="height" style="position:absolute;left:0;top:0;pointer-events:none;z-index:10"></canvas>
    <svg :width="width" :height="height">
      <defs>
        <pattern id="hl" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="300" height="30" fill="#3C8B74"></rect>
          <path d="M0,0L10,10z" stroke="#43BB84"></path>
        </pattern>
      </defs>
      <g class="path"></g>
      <g class="text"></g>
    </svg>
  </div>
</template>

<script>
import map from './china.js';
import city from './city.vue';

var Map = {};

export default {
  components: {
    city
  },
  data() {
    return {
      width: 0,
      height: 0
    }
  },
  mounted() {
    var width = this.width = window.innerWidth;
    var height = this.height = window.innerHeight;
    
    var el = this.$el;
    var svg = el.querySelector('svg');
    var canvas = el.querySelector('canvas');
    var {
      width,
      height
    } = this;
    
    Map = map({svg, canvas, width, height});
    Map.draw('world');

  },
  methods: {
    showCity: function(e_id) {
      var cityID = e_id.target ? e_id.target.value : e_id;
      Map.draw(cityID);
    }
  }
}
</script>
<style lang="css">
html,
body {
  font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #fff;
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

body {
  background: #0d1928;
  min-height: 600px;
  background-size: 100% 100%;
  position: relative;
}
</style>
