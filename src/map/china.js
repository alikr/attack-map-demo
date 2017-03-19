/*
 * @author smailsky
 * https://github.com/smailsky
 */

import * as d3 from 'd3';
import line from './line.js';
var Line = {};
const defaults = {
  svg: null,
  canvas: null,
  width: 0,
  height: 0,
  cityID : 'world'
}
const Init = function(options){
  this.options = options;
  return this;
}
Init.prototype.draw = china;

const fun = function(options){
  var opts = {};
  for( var i in defaults ){
    opts[i] = defaults[i];
  }
  for( var i in options ){
    opts[i] = options[i];
  }
  Line = line(opts);
  return new Init(opts);
}

export default fun;

function china(cityID) {
  typeof Line.stop === 'function' && Line.stop();
  var {svg, canvas, width, height} = this.options;
  const cityIDs = [32, 43, 14];

  d3.json("/data/" + cityID + ".json", function(error, root) {
    if (error) {
      console.log(error);
      return;
    }
    var data = root.features;
    //初始化projection和path
    var center = d3.geoCentroid(root);
    var scale1 = d3.min([width, height]);
    var offset = [width / 2, height / 2];
    var proj = d3.geoMercator()
      .scale(scale1)
      .center(center)
      .translate(offset);
    var paths = d3.geoPath().projection(proj);

    //利用之前的projection计算出新的projection（center,scale,translate）
    var bounds = paths.bounds(root);
    var hscale = scale1 * width / (bounds[1][0] - bounds[0][0]);
    var vscale = scale1 * height / (bounds[1][1] - bounds[0][1]);
    var scale = d3.min([hscale, vscale]);
    var offset = [
      width - (bounds[0][0] + bounds[1][0]) / 2,
      height - (bounds[0][1] + bounds[1][1]) / 2
    ];
    var projection = d3.geoMercator()
      .center(center)
      .scale(scale)
      .translate(offset);
    if (cityID == "world") {
      projection = d3.geoMercator()
        .center([107, 38])
        .scale(width * 0.6)
        .translate([width / 2, height / 2]);
    }

    typeof Line.stop === 'function' && Line.stop({projection});

    var path = d3.geoPath().projection(projection);
    var d3svg = d3.select(svg);
    var pathg = d3svg.select('.path');
    var textg = d3svg.select('.text');
    d3svg.transition().duration(500).ease(d3.easeLinear).attr('opacity',0)
    .on('end',draw);

    function draw(){
      var fillColor = "rgba(81, 105, 126, 0.5)";
      var key = function(d, i) {
        return d.properties.id
      };

      function setPath(selection) {
        selection
          .attr("stroke", function(d){
            return d.properties.id == undefined ? "rgba(131, 157, 177, 0.2)" : "rgba(131, 157, 177, 1)"
          })
          .attr("stroke-width", 1)
          .attr("fill", function(d) {
            return ~cityIDs.indexOf(+d.properties.id) ? "url(#hl)" : fillColor;
          })
          .attr("d", path);
      }

      function setText(selection) {
        selection
          .attr("text-anchor", "middle")
          .attr("fill", 'rgba(255,255,255,0.3)')
          .attr("x", function(d) {
            var pos = path.centroid(d);
            return pos[0];
          })
          .attr("y", function(d) {
            var pos = path.centroid(d);
            return pos[1];
          })
          .text(function(d) {
            return d.properties.name || ""
          });
      }

      pathg.selectAll("path").data(data, key).call(setPath);;
      var paths = pathg.selectAll("path").data(data, key);
      paths.enter().append("path").call(setPath);
      paths.exit().remove();

      var txts = data.filter((d)=>d.properties.name);
      textg.selectAll("text").data(txts, key).call(setText);
      var text = textg.selectAll("text").data(txts, key);
      text.enter().append("text").call(setText);
      text.exit().remove();
      d3svg.transition().duration(500).ease(d3.easeLinear).attr('opacity',1)
      .on('end',function(){
        typeof Line.start === 'function' && Line.start();
      });
    }
  });
}
