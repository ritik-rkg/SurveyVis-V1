/*
 * Parallel Coordinates visualization, inspired by :
 * Byron Houwens : https://codepen.io/BHouwens/pen/RaeGVd?editors=0010
 * Mike Bostock : https://bl.ocks.org/mbostock/1341021
 *
 */

/*
 * Data
 *****************************/
const data = [
  {player: 1, team: 1, distance: 12, time_standing: 2, time_jogging: 2, time_sprinting: 1, fast_distance: 10, sprint_distance: 2, work_to_rest: 1},
  {player: 3, team: 2, distance: 13, time_standing: 3, time_jogging:3 , time_sprinting: 1, fast_distance: 7, sprint_distance: 5, work_to_rest: 1},
  {player: 12, team: 1, distance: 21, time_standing: 2, time_jogging: 4, time_sprinting: 5, fast_distance: 18, sprint_distance: 3, work_to_rest: 2},
  {player: 34, team: 1, distance: 4, time_standing: 3, time_jogging: 1, time_sprinting: 0, fast_distance: 2, sprint_distance: 0, work_to_rest: 1},
  {player: 1, team: 1, distance: 9, time_standing: 2, time_jogging: 2.3, time_sprinting: 2.2, fast_distance: 1, sprint_distance: 2, work_to_rest: 1},
  {player: 3, team: 2, distance: 3, time_standing: 1, time_jogging: 0.3 , time_sprinting: 2, fast_distance: 17, sprint_distance: 3, work_to_rest: 1},
  {player: 12, team: 1, distance: 7, time_standing: 0.5, time_jogging: 2.5, time_sprinting: 4, fast_distance: 8, sprint_distance: 4, work_to_rest: 2},
  {player: 34, team: 1, distance: 2, time_standing: 1.2, time_jogging: 1.8, time_sprinting: 0.6, fast_distance: 12, sprint_distance: 1, work_to_rest: 1}
];

const features = [
  {name: 'team', range: [1,2]}, 
  {name: 'distance', range: [0,21]}, 
  {name: 'time_standing', range: [0,3]}, 
  {name: 'time_jogging', range: [0,4]}, 
  {name: 'time_sprinting', range: [0,5]}, 
  {name: 'fast_distance', range: [0,18]}, 
  {name: 'sprint_distance', range: [0,5]}, 
  {name: 'work_to_rest', range: [0,2]}
];

/*
 * Parameters
 *****************************/
const width = 960, height = 400, padding = 28, brush_width = 20;
const filters = {};

/*
 * Helper functions
 *****************************/
// Horizontal scale
const xScale = d3.scalePoint()
  .domain(features.map(x=>x.name))
  .range([padding, width-padding]);

// Each vertical scale
const yScales = {};
features.map(x=>{
  yScales[x.name] = d3.scaleLinear()
    .domain(x.range)
    .range([height-padding, padding]);
});
yScales.team = d3.scaleOrdinal()
    .domain(features[0].range)
    .range([height-padding, padding]);

// Each axis generator
const yAxis = {};
d3.entries(yScales).map(x=>{
  yAxis[x.key] = d3.axisLeft(x.value);
});

// Each brush generator
const brushEventHandler = function(feature){
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") 
    return; // ignore brush-by-zoom
  if(d3.event.selection != null){
    filters[feature] = d3.event.selection.map(d=>yScales[feature].invert(d));
  }else{
    if(feature in filters)
      delete(filters[feature]);
  }
  applyFilters();
}

const applyFilters = function(){
  d3.select('g.active').selectAll('path')
    .style('display', d=>(selected(d)?null:'none'));
}
           
 const selected = function(d){
   const _filters = d3.entries(filters);
   return _filters.every(f=>{
      return f.value[1] <= d[f.key] && d[f.key] <= f.value[0];
   });
 }

const yBrushes = {};
d3.entries(yScales).map(x=>{
  let extent = [
    [-(brush_width/2), padding],
    [brush_width/2, height-padding]
  ];
  yBrushes[x.key]= d3.brushY()
    .extent(extent)
    .on('brush', ()=>brushEventHandler(x.key))
    .on('end', ()=>brushEventHandler(x.key));
});

// Paths for data
const lineGenerator = d3.line();

const linePath = function(d){
  const _data = d3.entries(d).filter(x=>x.key!='player');
  let points = _data.map(x=>([xScale(x.key),yScales[x.key](x.value)]));
  return(lineGenerator(points));
}

/*
 * Parallel Coordinates
 *****************************/
// Main svg container
const pcSvg = d3.select('div.parallelCoordinates')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Inactive data
pcSvg.append('g').attr('class','inactive').selectAll('path')
  .data(data)
  .enter()
    .append('path')
    .attr('d', d=>linePath(d));

// Inactive data
pcSvg.append('g').attr('class','active').selectAll('path')
  .data(data)
  .enter()
    .append('path')
    .attr('d', d=>linePath(d));

// Vertical axis for the features
const featureAxisG = pcSvg.selectAll('g.feature')
  .data(features)
  .enter()
    .append('g')
      .attr('class','feature')
      .attr('transform',d=>('translate('+xScale(d.name)+',0)'));

featureAxisG
      .append('g')
      .each(function(d){
        d3.select(this).call(yAxis[d.name]);
      });

featureAxisG
  .each(function(d){
    d3.select(this)
      .append('g')
      .attr('class','brush')
      .call(yBrushes[d.name]);
  });

featureAxisG
  .append("text")
  .attr("text-anchor", "middle")
  .attr('y', padding/2)
  .text(d=>d.name);