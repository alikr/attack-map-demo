import {curPoint, point2cur, rgbaString, tempCanvas} from './tool.js';
const particler = tempCanvas();
const d3 = Object.assign({},
  require("d3-selection"),
  require("d3-timer"),
  require("d3-color"),
  require("d3-scale"),
  require("d3-geo")
);

const point = {
  time: 0,//原数据时间
  src: [84.9023,41.748],//起点坐标,新疆
  dest: [128.1445,48.5156],//终点坐标,黑龙江
  ctrl: [0, 0],//控制点坐标
  time1: 0,//弧线结束点步长【0--| time2-->time1 |--1】
  time2: 0,//弧线开始点步长
  step: 0,//起点圆步长
  dstep: 0,//终点圆步长
  stop: false,//动画是否结束
  color: {r:0,g:0,b:0}
};
const config = {
  canvas: null,
  data: [],
  speed: 0.04,
  lineWidth: 4,
  width: 0,
  height: 0,
  timer:d3.timer,
  projection: d3.geoMercator()
}
const PI_2 = Math.PI * 2;
const R = 20;//动画线顶点圆半径
const maxRadius = 40;
const scaleRadius = d3.scaleLinear().domain([0, maxRadius]).range([1, 50]).clamp(true);
const scaleOpacity = d3.scaleLinear().domain([0, maxRadius]).range([1, 0]).clamp(true);
const scaleColor = d3.scaleOrdinal(d3.schemeCategory20);

export function push(d){
  d.src = config.projection(d.src);
  d.dest = config.projection(d.dest);
  d.src[0] = ~~d.src[0];
  d.src[1] = ~~d.src[1];
  d.dest[0] = ~~d.dest[0];
  d.dest[1] = ~~d.dest[1];
  d.time1 = point.time1;
  d.time2 = point.time2;
  d.step = point.step;
  d.dstep = point.dstep;
  d.stop = point.stop;
  d.ctrl = point2cur([d.src, d.dest], 0.4);
  d.color = d3.rgb(scaleColor(Math.floor(Math.random() * 20)));
  config.data.push(d);
}

export function stop(options){
  var {canvas, width, height} = options;
  config.data = [];
  config.canvas = null;
  typeof config.timer.stop ==='function' && config.timer.stop();
  canvas && canvas.getContext('2d').clearRect(0, 0, width, height);
}

export function start(options) {
  for(var key in config){
    if(options[key]!=undefined)config[key] = options[key];
  }
  // push(point);//test
  var {canvas, width, height} = config;
  canvas.width = width;
  canvas.height = height;
  var speed = config.speed;
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = config.lineWidth;

  config.timer = d3.timer(function() {
    step();
  });

  function step(t) {
    ctx.clearRect(0, 0, config.width, config.height);
    var j = config.data.length -1;
    while (j >= 0) {
      var d = config.data[j];
      d.stop && config.data.splice(j, 1);
      j--;
    }
    var i = config.data.length -1;
    var steps = 100;
    while (i >= 0) {
      for(var j = 0; j <= steps; j++){
        var d = config.data[i - j];
        drawLine(d);
      }
      i-=steps;
    }
  }

  function drawLine(d) {
    if(d == undefined)return;
    if(d.time2 >= 1 && d.dstep >= maxRadius){
      d.stop = true;
      return;
    }
    const color = d.color;
    d.step++;
    let {
      src,
      dest,
      ctrl
    } = d;

    //弧线
    let t1 = d.time1 = d.time1 >= 1 ? 1 : d.time1 + speed;
    let t2 = d.time2 = d.time1 > 0.3 ? d.time2 + speed : d.time2;
    t2 = d.time2 = t2 > 1 ? 1 : t2;
    let grd = ctx.createLinearGradient(...src, ...dest);
    grd.addColorStop(0, rgbaString(color, 0));
    grd.addColorStop(t2, rgbaString(color, 0));
    grd.addColorStop(t2, rgbaString(color, 0));
    grd.addColorStop(t1, rgbaString(color, 1));
    grd.addColorStop(t1, rgbaString(color, 0));
    grd.addColorStop(1, rgbaString(color, 0));
    ctx.strokeStyle = grd;
    ctx.beginPath();
    ctx.moveTo(src[0], src[1]);
    ctx.quadraticCurveTo(ctrl[0], ctrl[1], dest[0], dest[1]);
    ctx.stroke();
    var [dx, dy] = curPoint(t1, [src, dest, ctrl]);
    t1 < 1 && ctx.drawImage(particler(color.r, color.g, color.b, 1), dx - R / 2, dy - R / 2, R, R);

    //开始点
    ctx.beginPath();
    var cr = scaleRadius(d.step);
    var opacity = scaleOpacity(d.step);
    ctx.strokeStyle = rgbaString(color, opacity);
    ctx.arc(...src, cr, 0, PI_2);
    ctx.stroke();
    var [cx, cy] = src;
    ctx.drawImage(particler(color.r, color.g, color.b, 1), cx - cr / 2, cy - cr / 2, cr, cr);

    //结束点
    if (t1 >= 1) {
      d.dstep++;
      var tr = scaleRadius(d.dstep);
      var d_opacity = scaleOpacity(d.dstep);
      ctx.strokeStyle = rgbaString(color, d_opacity);
      var [tx, ty] = dest;
      ctx.beginPath();
      ctx.arc(...dest, tr, 0, PI_2);
      ctx.stroke();
      ctx.drawImage(particler(color.r, color.g, color.b, 1), tx - tr / 2, ty - tr / 2, tr, tr);
    }
  }
}