const d3 = Object.assign({},
  require("d3-selection"),
  require("d3-geo"),
  require("d3-transition"),
  require("d3-request"),
  require("d3-array"),
  require("d3-ease")
);
const cityIDs = [32, 43, 14];//高亮的省份
var geoJSON = {};//缓存已加载的地图数据

function map(options,callback) {
  if(!options)return;
  var {svg, width, height, cityID} = options;
  d3.select(svg)
    .attr('width',width)
    .attr('height',height);
  geoJSON[cityID] ? draw(options, geoJSON[cityID], callback) : load(options, callback);
}

export default map;

function load(options, callback){
  var {cityID} = options;
  d3.json("./data/" + cityID + ".json", function(error, root) {
    !error && (draw(options, root, callback), geoJSON[cityID] = root);
  });
}

function draw(options, root, callback){
  var {svg, width, height, cityID} = options;
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

  var path = d3.geoPath().projection(projection);
  var d3svg = d3.select(svg);
  var pathg = d3svg.select('.path');
  var textg = d3svg.select('.text');
  d3svg.transition().duration(500).ease(d3.easeLinear).attr('opacity',0)
  .on('end',draw);

  function draw(){
    pathg.selectAll("path").data(data, key).call(setPath, path);;
    var paths = pathg.selectAll("path").data(data, key);
    paths.enter().append("path").call(setPath, path);
    paths.exit().remove();

    var txts = data.filter((d)=>d.properties.name);
    textg.selectAll("text").data(txts, key).call(setText, path);
    var text = textg.selectAll("text").data(txts, key);
    text.enter().append("text").call(setText, path);
    text.exit().remove();
    d3svg.transition().duration(500).ease(d3.easeLinear).attr('opacity',1)
    .on('end',function(){
      typeof callback === 'function' && callback(projection);
    });
  }
}

function key(d, i) {
  return d.properties.id
}

function setPath(selection, path) {
  selection
    .attr("stroke", function(d){
      return d.properties.id == undefined ? "rgba(131, 157, 177, 0.2)" : "rgba(131, 157, 177, 1)"
    })
    .attr("stroke-width", 1)
    .attr("fill", function(d) {
      return ~cityIDs.indexOf(+d.properties.id) ? "url(#hl)" : "rgba(81, 105, 126, 0.5)";
    })
    .attr("d", path);
}

function setText(selection, path) {
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