/**
	Polynomial interpolation demo
	@authors - Aaron R Elligsen, and Sahil Diwan
	UNIVERSITY OF OREGON
	MATH 351 - FALL 2012
**/


/**
	A class representing a 2-axis graph
	@class
	@constructor
	@param {double} xlow/xhigh The high and low values of the x-range.
	@parapm {double} ylow/yhigh The high and low values of the y-range.
	@param {double} points The array of points added.
	@param {double} functions The array of functions added/formed.
**/
function graph(xlow,xhigh, ylow,yhigh,counter,points,functions) {
	this.xlow = xlow;
	this.xhigh = xhigh;
	this.ylow = ylow;
	this.yhigh = yhigh;
	this.counter = counter;
	//var points = [];
	this.points =points;
	//var functions = [];
	this.functions = functions;
	this.datamethods = [Polynomial.prototype.LagrangeInterpolation,PiecewiseFunction.prototype.createFirstDegSpline,PiecewiseFunction.prototype.createSecondDegSpline,PiecewiseFunction.prototype.createThirdDegSpline]
	
	this.currentinterpolator = 0;
	this.changeInterpolation = function(value) {
		if(value == "poly") {
			this.currentinterpolator = 0;
		}else if(value == "spline1") {
			this.currentinterpolator = 1;
		}else if(value == "spline2") {
			this.currentinterpolator = 2;
		}else if(value == "spline3") {
			this.currentinterpolator = 2;
		}

	}
}

/**
	Read and parse input of x-range and updates the x-range.
	@param {string} rangestring The values for xhigh and xlow as a string
**/
graph.prototype.changeX = function(rangestring) {
	var pointRe = /([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)/;
	var pointValues = pointRe.exec(rangestring);
	this.xlow =parseFloat( pointValues[1]);
	this.xhigh =parseFloat( pointValues[3]);
	this.redraw();

}

/**
	Read and parse input of y-range and updates the y-range.
	@param {string} rangestring The values for yhigh and ylow as a string
**/
graph.prototype.changeY = function (rangestring) {
	var pointRe = /([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)/;
	var pointValues = pointRe.exec(rangestring);
	this.ylow =parseFloat( pointValues[1]);
	this.yhigh =parseFloat( pointValues[3]);
	this.redraw();
}

/**
	Calulates the X pixels per unit ratio
	@return {double} xpu Returns the xpu value
**/
graph.prototype.xpu = function() {

	return canvas.width/(this.xhigh - this.xlow);
}


/**
	Calulates the Y pixels per unit ratio
	@return {double} ypu Returns the ypu value
**/
graph.prototype.ypu = function() {

	return canvas.height/(this.yhigh - this.ylow);
}

/**
	Adds a point to the array of points to be interpolated. 
	It also checks if the point is outside the current viewing window and 
	adjusts if necessary. 
	@param {Point} newpoint The newpoint to be drawn
**/
graph.prototype.addPoint = function(newpoint)
{
	this.points.push(newpoint);
	var redrawrequired = false;
	if(newpoint.x >= this.xhigh)
	{
		this.xhigh = newpoint.x + (newpoint.x-this.xlow)/4;	
		redrawrequired = true;
	}

	if(newpoint.x <= this.xlow)
	{
		this.xlow = newpoint.x - (this.xhigh-newpoint.x)/4;	
		redrawrequired = true;
	}

	if(newpoint.y >= this.yhigh)
	{
		this.yhigh = newpoint.y +(newpoint.y-this.ylow)/4;	
		redrawrequired = true;
	}
	if(newpoint.y <= this.ylow)
	{
		this.ylow = newpoint.y -(this.yhigh-newpoint.y)/4;	
		redrawrequired = true;
	}
	$("#x_range").val(this.xlow+","+this.xhigh);
	$("#y_range").val(this.ylow+","+this.yhigh);
	$("#s_points").append('<option>'+newpoint+'</option>');
	if(this.points.length >1)
	{
		//var newpoly = LagrangeInterpolation(this.points);		
		//var newpoly = createFirstDegSpline(this.points);		
		var newpoly = this.datamethods[this.currentinterpolator](this.points);		
		this.functions.push(newpoly);
		$("#s_functionlist").append('<option>'+newpoly+'</option>');
	}
	this.redraw();

}

/**
	Draws all points currently in array onto graph
**/
graph.prototype.drawPoints = function()
{
   var c = canvas.getContext('2d');
   c.fillStyle = "red";
   var xpu = this.xpu();
   var ypu = this.ypu();

   for (var i = 0; i < this.points.length; i++) {
	var pixelx =(this.points[i].x-this.xlow) * xpu ;
	var pixely =canvas.height -(this.points[i].y-this.ylow)* ypu;
	c.fillRect(pixelx-2,pixely-2,5,5);
   }
}

/**
	Draws the axes of the graph along with the gridlines within
**/
graph.prototype.drawAxes = function()
{
	var c = canvas.getContext('2d');
	var xsituation =0; 
	var xpu = this.xpu();
	var ypu = this.ypu(); 

	// draws vertical lines on grid
	c.strokeStyle = "#ccc";
	c.beginPath();
	c.lineWidth =1;
	var xdivision = xpu;
	while((canvas.width/xdivision) > 32)
	{
		xdivision *=2;
	}
	for(var x = 0; x < canvas.width; x += xdivision) {
		var x2 = this.xlow+x/xpu;
		if(x2.toString().length >5 )
		{
			x2 = x2.toFixed(1);
		}

		c.moveTo(x, 0);
		c.lineTo(x, canvas.height);
		c.stroke();
		c.fillStyle = "black";
		c.font = "bold 10pt Times";
		c.fillText(x2, x+2, canvas.height - 5);
	}


	// draws horizontal lines on grid
	var ydivision = ypu;
	while((canvas.width/ydivision) > 32)
	{
		ydivision *=2;
	}
	c.strokeStyle = "#ccc";
	c.beginPath();
	for(var y = 0; y < canvas.height; y += ydivision) {
		var y2 = this.ylow+(canvas.height-y)/ypu;
		if(y2.toString().length > 5)
		{
			y2 = y2.toFixed(1);
		}

		c.moveTo(0, y);
		c.lineTo(canvas.width, y);
		c.stroke();
		c.fillStyle = "black";
		c.font = "bold 10pt Times";
		c.fillText(y2, 5, y-3);
	}
	c.strokeStyle="black";
	c.beginPath();
	c.lineWidth =5;
	c.moveTo(canvas.width,canvas.height);
	c.lineTo(0,canvas.height);
	c.stroke();
	c.moveTo(0,0);
	c.lineTo(0,canvas.height);
	c.stroke();
}

/**
	Draws the backdrop of the graph
**/
graph.prototype.redraw = function()
{
	var c = canvas.getContext('2d');
	c.fillStyle= "white";
	c.fillRect(0,0,canvas.width,canvas.height);
	this.counter =0;
	this.drawAxes();
	if(this.functions.length >0)
	{
		for(var i=0; i <this.functions.length; i++)
		{
			this.drawFunction(this.functions[i]);
		}
	}
	this.drawPoints();


}

/**
	Draws a function on the graph by drawing lines between calculated points.
	@param {Polynomial|Term} interpolated The interpolated function
**/
graph.prototype.drawFunction = function(interpolated)
{
	var COLOR = new Array('Blue','LimeGreen','Gold','Sienna','DarkRed','LightSlateGray','Purple','Black');

	var range = this.xhigh - this.xlow;
	var plist = [];
//	for(var i=0; i < range; i+=range/128)
	for(var i=0; i < range; i+=range/512)
	{
		var x = this.xlow+i;
		var newy = interpolated.resolve(x);
		if(newy != undefined) {
			plist.push(new Point(x,newy));	
		}
	}
	//console.log(plist);
	plist.sort(function(a,b) {
		if(a.x > b.x)
		{
			return 1;
		}
		if(a.x < b.x)
		{
			return -1;
		}		
		return 0;
	});

	//console.log(plist);
	var xpu = this.xpu();
	var ypu = this.ypu(); 
	c = canvas.getContext('2d');
	c.beginPath();
	c.strokeStyle=COLOR[this.counter%COLOR.length];
	this.counter++;
	c.lineWidth = 2;
	var pixelx =(plist[0].x-this.xlow) * xpu ;
	var pixely =canvas.height -(plist[0].y-this.ylow)* ypu;
	c.moveTo(pixelx,pixely);
	for(var i=1; i < plist.length; i++)
	{
		var oldx = pixelx;
		var oldy = pixely;
		pixelx =(plist[i].x-this.xlow) * xpu ;
		pixely =canvas.height -(plist[i].y-this.ylow)* ypu;
		c.lineTo(pixelx,pixely) ;	
		//c.bezierCurveTo(oldx,pixely,pixelx,oldy,pixelx,pixely);
		c.stroke();
	}
}

/**
	Removes the chosen point from the graph
	@param {String} p The point to be removed
**/
graph.prototype.removePoint = function(p)
{
	for(var i=0; i < this.points.length; i++)
	{
		if(p == this.points[i].toString())
		{
			this.points.splice(i,1);
		}

	}
	$("#s_points :selected").remove();
	this.redraw();

}

/**
	Removes all points from the graph
**/
graph.prototype.removeAllPoints = function()
{
	this.points = [];
	$("#s_points").empty();
	this.redraw();
}

/**
	Removes the chosen function from the graph
	@param {String} f The function to be removed
**/
graph.prototype.removeFunction = function(f)
{
	for(var i=0; i < this.functions.length; i++)
	{
		if(f == this.functions[i].toString())
		{
			this.functions.splice(i,1);
		}

	}
	$("#s_functionlist :selected").remove();
	this.redraw();

}

/**
	Removes all functions from the graph
**/
graph.prototype.removeAllFunctions = function()
{
	this.functions = [];
	$("#s_functionlist").empty();
	this.redraw();
}

/**
	Clears all points and functions from the graph
**/
graph.prototype.clear = function()
{
		this.functions = [];
		$("#s_functionlist").empty();
		this.points = [];
		$("#s_points").empty();
		this.redraw();
}


