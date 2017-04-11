var lineChart = document.getElementById('target').innerHTML += '<div id="line-chart"></div>';
/**************
DRAW EVERYTHING
**************/
var chartTitle = 'Crimes Executed, 1626—2002'

var chartWidth = 960;

var chartHeight = 300;

//draw space
var svg = d3.select('#line-chart').append('svg')
	.attr('width', chartWidth)
	.attr('height', chartHeight);
	
d3.select('svg'),
	margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
var title = svg.append('text')
	.attr("transform", "translate(" + (margin.left + 6) + "," + (margin.top + 20) + ")")
	.attr('class','chart-title')
	.text(chartTitle);
	
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var buttonSpace = d3.select('#target').append('div')
	.attr('id', 'button-space');
	
//draw tooltip
var tooltip = d3.select('#target').append('div')
	.attr('id','tooltip')
	.style('display','none');

var info = d3.select('#tooltip')
	.append('p')
	.attr('id','info');

var moreInfo = d3.select('#tooltip')
	.append('p')
	.attr('id','more-info');
/***************	
SET SCALES, ETC.
***************/	
//tell d3 the time format is four-digit year	
var parseTime = d3.timeParse('%Y');

//set scale	
var x = d3.scaleTime()
    .rangeRound([0, chartWidth - margin.left - margin.right]);

var y = d3.scaleLinear()
    .range([chartHeight - margin.top - margin.bottom, 0]);
    
var z = d3.scaleOrdinal(['#339999','#66CCCC','#81CCCC','#116363']);
        
var line = d3.line()
	//.curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.count); });
/****************    
BRING IN THE DATA    
****************/    
//load csv    
d3.csv('methods_for_graphic.csv', type, function(error, data){
	
	if (error) throw error;
	
	d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
	
	//function slugifies crime strings for classing later on 
	function slug(s){
		return s.split(' ').join('-').split('---').join('-').toLowerCase();
	};
	
	//flip original dataset's columns into rows, one for each line on chart (dynamically)
	var crimes = data.columns.slice(1).map(function(key){
		return {
			key:key,
			keySlug:slug(key),
			values:data.map(function(d){
				return {year:d['PERIOD'], count: d[key]};
			}),
		};
	});

	//set domain
	x.domain(d3.extent(data, function(d) { return d['PERIOD']; }));
  	y.domain([
    	d3.min(crimes, function(c) { return d3.min(c.values, function(d) { return d.count; }); }),
    	d3.max(crimes, function(c) { return d3.max(c.values, function(d) { return d.count; }); })
  	]);
  	
  	z.domain(crimes.map(function(c) {return c.id;}));
  	
  	//x axis
  	g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (chartHeight - margin.top - margin.bottom) + ")")
      .call(d3.axisBottom(x));
     
    //y axis 
    g.append("g")
		.attr('class','y-axis')	
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr('x',-((chartHeight - margin.top - margin.bottom) / 2))
      .attr("dy", "0.71em")
      .attr("text-anchor", "middle")
      .text("Executions"); 
    
    
    //data paths
    var crime = g.selectAll(".crime")
      .data(crimes)
      .enter().append('g')
      .attr('class','crime');
    
    crime.append('path')
    	.attr('class','line')
    	.attr("d", function(d) { return line(d.values); })
    	.attr('id',function(d) {return 'line-'+d.keySlug;})
    	.style('stroke','#d3d3d3')
    	.style('fill','none')
    	.style('stroke-width',1)
    	.on('mouseover',lineMouseOver)
    	.on('mouseout',lineMouseOut)
    	.on('click',function(d){
    	
    	});
    var activePaths = [];
    
    //button stuff!
    d3.select('#button-space').selectAll('.buttons')
    	.data(crimes)
    	.enter()
    	.append('span')
    	.attr('class','buttons')
    	.text(function(d){return d.key;})
    	.attr('id',function(d){
    		return 'button-'+d.keySlug;
    	})
    	.style('color','#000')
    	.style('background-color','#d3d3d3')
    	.on('click',function(d){
    		//toggle between active and inactive
    		var active = d.active ? false : true,
    		newBgColor = active ? function(d){return z(d.key);} : '#d3d3d3',
    		newFontColor = active ? '#fafafa' : '#000',
    		newLineStroke = active ? function(d){return z(d.key);} : '#d3d3d3',
    		newLineWidth = active ? 4 : 1,
    		newClass = active ? 'active-line' : 'inactive-line',
    		newOpacity = active ? 1 : .5;
    		
    		d3.select('#button-'+d.keySlug)
    			.style('background-color',newBgColor)
    			.style('color',newFontColor);
    		
    		d3.select('#line-'+d.keySlug).moveToFront()
    			.style('stroke-width',newLineWidth)
    			.style('stroke',newLineStroke)
    			.style('opacity',newOpacity)
    			.style('class',newClass);

  			d.active = active;
  			//UPDATE SCALE BASED ON WHAT'S ACTIVE
  			//empty active paths array
  			activePaths = [];
  			//push active data points to active paths array 
  			crimes.forEach(function(d){
  				if (d.active == true) {
  					activePaths.push(d);
  				}
  			});
  			
  			//update scale; provide for if no lines are active
  			if (activePaths.length === 0) {
  				y.domain([
    				d3.min(crimes, function(c) {
    					return d3.min(c.values, function(d) 
    						{ return d.count; }); 
    					}),
    				d3.max(crimes, function(c) { 
    					return d3.max(c.values, function(d) 
    						{ return d.count; }); 
    					})
  					]);
  				}
  			else {
  				y.domain([
    				d3.min(activePaths, function(c) {
    					return d3.min(c.values, function(d) 
    						{ return d.count; }); 
    					}),
    				d3.max(activePaths, function(c) { 
    					return d3.max(c.values, function(d) 
    						{ return d.count; }); 
    					})
  					]);
  			}
  			//update lines to new scale
  			d3.selectAll('.line')
    			.transition().duration(200).ease(d3.easeLinear)
    			.attr('d',function(d) {return line(d.values);});
    		
    		//update y axis to new scale
    		d3.select('.y-axis')
    			.transition().duration(200).ease(d3.easeLinear)
    			.call(d3.axisLeft(y));
			console.log(activePaths);
			activeStyle;
    	});
    
  	crimes.forEach(function(d){
  		if (d.key == 'Murder') {
  			console.log(d);
  			d.active = true;
  			}
  		});
  	
    console.log(crimes);
    function lineMouseOver(crimes, i){
    	d3.select('#tooltip')
    			.style('display','block')
    			.style("left", (d3.event.pageX + 25) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");
    		console.log(crimes.values[i].count);
    		d3.select('#info')
    			.text(crimes.key);		
    };
    function lineMouseOut(d){
    
    		d3.select('#tooltip')
    			.style('display','none');
    		
    };
    
	
});

//parse data
function type(d, _, columns){
  	d['PERIOD'] = parseTime(d['PERIOD']);
  	//loop so strings for column beyond 1st column
  	//always parsed to int no matter how many columns
  	for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  	return d;
	}


