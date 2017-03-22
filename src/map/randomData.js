import * as d3 from 'd3';
const scaleColor = d3.scaleOrdinal(d3.schemeCategory20);
const STATUS = {
  STOP: 0,
  PAUSE: 1,
  START: 2,
}
var defaults = {
  status: STATUS['STOP'],
  data: [],
  projection: d3.geoMercator()
}

var lts = [
  [84.9023, 41.748],
  [88.7695, 31.6846],
  [117.5977, 44.3408],
  [96.2402, 35.4199],
  [102.9199, 30.1904],
  [128.1445, 48.5156],
  [95.7129, 40.166],
  [101.8652, 25.1807],
  [108.2813, 23.6426],
  [111.5332, 27.3779],
  [109.5996, 35.6396],
  [113.4668, 22.8076],
  [126.4746, 43.5938],
  [115.4004, 37.9688],
  [112.2363, 31.1572],
  [106.6113, 26.9385],
  [118.7402, 36.4307],
  [116.0156, 27.29],
  [113.4668, 33.8818],
  [122.3438, 41.0889],
  [112.4121, 37.6611],
  [117.2461, 32.0361],
  [118.3008, 25.9277],
  [120.498, 29.0918],
  [120.0586, 32.915],
  [107.7539, 30.1904],
  [105.9961, 37.3096],
  [109.9512, 19.2041],
  [121.0254, 23.5986],
  [116.4551, 40.2539],
  [117.4219, 39.4189],
  [121.4648, 31.2891],
  [114.2578, 22.3242],
  [113.5547, 22.1484]
];
var ltsSize = lts.length;
function rand() {
  var index = Math.floor(Math.random() * ltsSize);
  var t = lts[index];
  return t || lts[0];
}

var _timeout;
var _data = [];//一次API请求数据集
var _startTime = 0;
var minDelay = 60;
var maxDelay = 1000;

function loadData(){
  loadData_Websocket();//模拟websocket获取数据
  // loadData_API();//模拟http请求获取数据
}
function loadData_API(){
  _data = [];
  var i = 100;//模拟随机数据
  while(i>0){
    var d = {"src":rand(),"dest":rand(),"time":(new Date()).getTime()};
    _data.push(d);
    i--;
  }
  next(0);
}

function loadData_Websocket(){
  _timeout = d3.interval(function() {
    var point = {
      time: (new Date()).getTime(),
      src: rand(),
      dest: rand()
    }
    push(point);
  }, 60);
  return false;
}

//按_data的时间顺序读取
function next(index){
  if(defaults.status < STATUS.PAUSE)return;
  var delay = minDelay;
  if(index < _data.length){
    var d = _data[index];
    delay = _startTime === 0 ? 0 : (new Date(d.time)).getTime() - _startTime;
    delay = d3.max([delay, minDelay]);
    delay = d3.min([delay, maxDelay]);
    _startTime = (new Date(d.time)).getTime();
    push(d);
  }
  //重新请求数据
  if(defaults.data.length < 20){
    loadData();
    return;
  }
  _timeout = d3.timeout(()=>{
    next(index + 1);
  },delay);
}

function push(d){
  var ori = defaults.projection(d.src);
  var dest = defaults.projection(d.dest);
  ori[0] = ~~ori[0];
  ori[1] = ~~ori[1];
  dest[0] = ~~dest[0];
  dest[1] = ~~dest[1];

  var point = {
    time: d.time,//原数据时间
    ori: ori,//起点屏幕坐标
    dest: dest,//终点屏幕坐标
    ctrl: [0, 0],//控制点坐标
    time1: 0,//弧线结束点步长【0--| time2-->time1 |--1】
    time2: 0,//弧线开始点步长
    step: 0,//起点圆步长
    dstep: 0,//终点圆步长
    stop: false,//动画是否结束
    color: d3.rgb(scaleColor(Math.floor(Math.random()*20)))
  }
  point.ctrl = point2cur([point.ori, point.dest], 0.4);
  defaults.data.push(point);
}

//计算控制点
function point2cur(p, cur) {
  var p1 = p[0];
  var p2 = p[1];
  var curveness = cur ? cur : 0.3;
  var c = [
    (p1[0] + p2[0]) / 2 - (p1[1] - p2[1]) * curveness,
    (p1[1] + p2[1]) / 2 - (p2[0] - p1[0]) * curveness
  ];
  return c;
}

export function start(_options){
  defaults = _options || defaults;
  defaults.data = [];
  loadData();
}

export function stop(_options){
  _options = _options || defaults;
  _options.data = [];
  _options.status = STATUS['STOP'];
  _timeout && typeof _timeout.stop === 'function' && _timeout.stop();
}