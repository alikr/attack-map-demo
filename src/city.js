const d3 = Object.assign({}, require("d3-selection"));
var citys = [
  {"id":"world","name":"全部城市"},
  {"id":"65","name":"新疆"},
  {"id":"54","name":"西藏"},
  {"id":"15","name":"内蒙古"},
  {"id":"63","name":"青海"},
  {"id":"51","name":"四川"},
  {"id":"23","name":"黑龙江"},
  {"id":"62","name":"甘肃"},
  {"id":"53","name":"云南"},
  {"id":"45","name":"广西"},
  {"id":"43","name":"湖南"},
  {"id":"61","name":"陕西"},
  {"id":"44","name":"广东"},
  {"id":"22","name":"吉林"},
  {"id":"13","name":"河北"},
  {"id":"42","name":"湖北"},
  {"id":"52","name":"贵州"},
  {"id":"37","name":"山东"},
  {"id":"36","name":"江西"},
  {"id":"41","name":"河南"},
  {"id":"21","name":"辽宁"},
  {"id":"14","name":"山西"},
  {"id":"34","name":"安徽"},
  {"id":"35","name":"福建"},
  {"id":"33","name":"浙江"},
  {"id":"32","name":"江苏"},
  {"id":"50","name":"重庆"},
  {"id":"64","name":"宁夏"},
  {"id":"46","name":"海南"},
  {"id":"71","name":"台湾"},
  {"id":"11","name":"北京"},
  {"id":"12","name":"天津"},
  {"id":"31","name":"上海"},
  {"id":"81","name":"香港"},
  {"id":"82","name":"澳门"},
];
export default function list(ele,callback){
	var select = d3.select(ele).append('select');
	select.on('change',function(){
		callback(this.value);
	});
	var options = select.selectAll('option').data(citys);
	options.enter().append('option')
		.attr('value',(d)=>d.id)
		.text((d)=>d.name);
}