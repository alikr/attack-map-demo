/*
 * @author smailsky
 * https://github.com/smailsky
 */

import * as d3 from 'd3';
import randomData from './randomData.js';

//计算时间t的1次贝赛尔曲线坐标
function cur1Pt(t, p) {
  var x = (1 - t) * p[0][0] + t * p[1][0];
  var y = (1 - t) * p[0][1] + t * p[1][1];
  return [x, y];
}
//计算时间t的2次贝赛尔曲线坐标
function curPoint(t, p) {
  var x = Math.pow((1 - t), 2) * p[0][0] + 2 * t * (1 - t) * p[2][0] + Math.pow(t, 2) * p[1][0];
  var y = Math.pow((1 - t), 2) * p[0][1] + 2 * t * (1 - t) * p[2][1] + Math.pow(t, 2) * p[1][1];
  return [x, y];
}

function rgbaString(rgb, opacity) {
  return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
}

//粒子
var particler = function() {
  var particle = new Image(),
    tempFileCanvas = d3.select("body")
    .append("canvas")
    .attr("style", "display:none")
    .attr("width", 64)
    .attr("height", 64)
    .node();
  particle.src = "data:image/png;base64,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";
  return function(r, g, b, a) {
    var imgCtx = tempFileCanvas.getContext("2d"),
      imgData, i;
    imgCtx.drawImage(particle, 0, 0);
    imgData = imgCtx.getImageData(0, 0, 64, 64);
    i = imgData.data.length;
    while ((i -= 4) > -1) {
      imgData.data[i + 3] = imgData.data[i] * a;
      if (imgData.data[i + 3]) {
        imgData.data[i] = r;
        imgData.data[i + 1] = g;
        imgData.data[i + 2] = b;
      }
    }
    imgCtx.putImageData(imgData, 0, 0);
    return tempFileCanvas;
  }
}();

const STATUS = {
  STOP: 0,
  PAUSE: 1,
  START: 2,
}
const defaults = {
  canvas: null,
  width: 0,
  height: 0,
  projection: d3.geoMercator(),
  status: -1,
  data: [],
  speed: 0.02,
  lineWidth: 4
}
const Init = function(options){
  this.options = options;
  return this;
}
Init.prototype.randomData = randomData();
Init.prototype.draw = draw;
Init.prototype.start = function(){
  this.options.status = STATUS['START'];
  this.randomData.start(this.options);
  this.draw();
}
Init.prototype.stop = function(options){
  for( var i in options ){
    this.options[i] = options[i];
  }
  this.options.status = STATUS['STOP'];
  this.options.data = [];
  var {canvas, width, height, step} = this.options;
  if(step && typeof step.stop ==='function')step.stop();
  canvas && canvas.getContext('2d').clearRect(0, 0, width, height);
  this.randomData.stop(this.options);
}


const fun = function(options){
  var opts = {};
  for( var i in defaults ){
    opts[i] = defaults[i];
  }
  for( var i in options ){
    opts[i] = options[i];
  }
  return new Init(opts);
}

export default fun;

function draw() {
  const _options = this.options;
  const PI = Math.PI;
  const scaleRadius = d3.scaleLinear().domain([0, 40]).range([1, 50]).clamp(true);
  const scaleOpacity = d3.scaleLinear().domain([0, 40]).range([1, 0]).clamp(true);
  var {canvas, width, height, projection, data, speed} = this.options;
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = _options.lineWidth;

  this.options.step = d3.timer(function() {
    step();
  });

  function step(t) {
    ctx.clearRect(0, 0, _options.width, _options.height);
    var i = _options.data.length;
    do {
      drawLine(_options.data[i], i);
      drawLine(_options.data[i - 1], i - 1);
      drawLine(_options.data[i - 2], i - 2);
      drawLine(_options.data[i - 3], i - 3);
      drawLine(_options.data[i - 4], i - 4);
      i -= 5;
    } while (i > 0);
  }

  function drawLine(d, i) {
    if (!d) return;
    const color = d.color;
    d.step++;
    let {
      ori,
      dest,
      ctrl
    } = d;
    let t1 = d.time1 = d.time1 >= 1 ? 1 : d.time1 + speed;
    let t2 = d.time2 = d.time1 > 0.3 && d.time2 < 1 ? d.time2 + speed : 0;
    t2 = t2 > 1 ? 1 : t2;
    let grd = ctx.createLinearGradient(...ori, ...dest);
    grd.addColorStop(0, rgbaString(color, 0));
    grd.addColorStop(t2, rgbaString(color, 0));
    if (t2 < 1) grd.addColorStop(t1 - 0.00001, rgbaString(color, 1));
    grd.addColorStop(t1, rgbaString(color, 0));
    if (t1 < 1) grd.addColorStop(1, rgbaString(color, 0));
    ctx.strokeStyle = grd;
    ctx.beginPath();
    ctx.moveTo(ori[0], ori[1]);
    ctx.quadraticCurveTo(ctrl[0], ctrl[1], dest[0], dest[1]);
    ctx.stroke();
    var [dx, dy] = curPoint(t1, [ori, dest, ctrl]);
    var r = 20;
    ctx.drawImage(particler(color.r, color.g, color.b, 1), dx - r / 2, dy - r / 2, r, r);

    ctx.beginPath();
    var cr = scaleRadius(d.step);
    var opacity = scaleOpacity(d.step);
    ctx.strokeStyle = rgbaString(color, opacity);
    ctx.arc(...ori, cr, 0, 2 * PI);
    var [cx, cy] = ori;
    ctx.drawImage(particler(color.r, color.g, color.b, 1), cx - cr / 2, cy - cr / 2, cr, cr);
    ctx.stroke();

    if (t1 >= 1) {
      d.tstep++;
      var tr = scaleRadius(d.tstep);
      var popacity = scaleOpacity(d.tstep);
      var [tx, ty] = dest;
      ctx.strokeStyle = rgbaString(color, popacity);
      ctx.beginPath();
      ctx.arc(...dest, tr, 0, 2 * PI);
      ctx.drawImage(particler(color.r, color.g, color.b, 1), tx - tr / 2, ty - tr / 2, tr, tr);
      ctx.stroke();
    }

    if (t2 >= 1) _options.data.splice(i, 1);
  }
}
