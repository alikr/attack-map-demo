const d3 = Object.assign({},
  require("d3-timer")
);
var defaults = {
  data: [],
  timeout: null,
  startTime: 0,
  minDelay: 200,
  maxDelay: 1000,
  push:()=>{}
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

function loadData(){
  // loadData_Websocket();//模拟websocket获取数据
  loadData_API();//模拟http请求获取数据
}
function loadData_API(){
  defaults.data = [];
  var i = 100;//模拟随机数据
  while(i>0){
    var d = {"src":rand(),"dest":rand(),"time":(new Date()).getTime()};
    defaults.data.push(d);
    i--;
  }
  next(0);
}

function loadData_Websocket(){
  defaults.timeout = d3.interval(function() {
    var point = {
      time: (new Date()).getTime(),
      src: rand(),
      dest: rand()
    }
    defaults.push(point);
  }, defaults.minDelay);
  return false;
}

//按defaults.data的时间顺序读取
function next(index){
  var delay = defaults.minDelay;
  if(index < defaults.data.length){
    var d = defaults.data[index];
    delay = new Date(d.time).getTime() - defaults.startTime;
    delay < defaults.minDelay && (delay = defaults.minDelay);
    delay > defaults.maxDelay && (delay = defaults.maxDelay);
    defaults.startTime = (new Date(d.time)).getTime();
    defaults.push(d);
  }else{
    return loadData_API();
  }

  if(defaults.data.length < 20 && defaults.startTime > 0 ){
    delay = defaults.minDelay;
  }
  defaults.timeout = d3.timeout(()=>{
    next(index + 1);
  },delay);
}

export function startGetData(callback){
  defaults.push = callback;
  defaults.data = [];
  loadData();
}

export function clearData(_options){
  defaults.data = [];
  var timeout = defaults.timeout;
  timeout && typeof timeout.stop === 'function' && timeout.stop();
}