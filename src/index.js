/*
 * @author alikr
 * https://github.com/smailsky
 */

import style from './style.css';
import map from './map.js';
import {start, stop, push} from './line.js';
import city from './city.js';
import {startGetData, clearData} from './randomData.js';

const options = {
  svg: null,
  canvas: null,
  width: 0,
  height: 0,
  cityID : 'world'
}
options.svg = document.querySelector('.map');
options.canvas = document.querySelector('.canvas');
options.width = window.innerWidth;
options.height = window.innerHeight;

draw();

city('.city',(cityID)=>{
  options.cityID = cityID;
  draw();
});

function draw(){
  clearData();
  stop(options);
  map(options,(projection)=>{
    document.querySelector('.loading') && document.querySelector('.loading').remove();
    options.projection = projection;
    start(options);
    startGetData(push);
  });
}

window.onresize = function(){
  options.width = window.innerWidth;
  options.height = window.innerHeight;
  draw();
}