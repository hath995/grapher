

/**
	Polynomial interpolation demo
	@authors - Aaron R Elligsen, and Sahil Diwan
	UNIVERSITY OF OREGON
	MATH 351 - FALL 2012
**/
"use strict";

/**
	A class representing a 2-axis graph
	@class
	@constructor
	@param {double} xlow/xhigh The high and low values of the x-range.
	@param {double} ylow/yhigh The high and low values of the y-range.
	@param {double} points The array of points added.
	@param {double} functions The array of functions added/formed.
**/
SM.Graph = function (xlow,xhigh, ylow,yhigh,counter,points,functions) {
	this.xlow = xlow;
	this.xhigh = xhigh;
	this.ylow = ylow;
	this.yhigh = yhigh;
	this.counter = counter;
	this.immediate = true;
	this.points =points;
	this.functions = functions;
	var lsq = function(points) {
		var linear = [new SM.Term(1,0,'x'),new SM.Term(1,1,'x')];
		return SM.Polynomial.prototype.leastSquare(points,linear);
	}

	var qsq = function(points) {
		var quadratic =[new SM.Term(1,0,'x'),new SM.Term(1,1,'x'),new SM.Term(1,2,'x')];
		return SM.Polynomial.prototype.leastSquare(points,quadratic);
	}
	this.datamethods = [SM.Polynomial.prototype.LagrangeInterpolation,SM.PiecewiseFunction.createFirstDegSpline,SM.PiecewiseFunction.createSecondDegSpline,SM.PiecewiseFunction.createThirdDegSpline,lsq,qsq]
	//Todo: redo this selection system, less hardcoding	
	this.currentinterpolator = 0;
	this.changeInterpolation = function(value) {
		if(value == "poly") {
			this.currentinterpolator = 0;
		}else if(value == "spline1") {
			this.currentinterpolator = 1;
		}else if(value == "spline2") {
			this.currentinterpolator = 2;
		}else if(value == "spline3") {
			this.currentinterpolator = 3;
		}else if(value == "lslinear") {
			this.currentinterpolator = 4;
		}else if(value == "lsquadratic") {
			this.currentinterpolator = 5;
		}



	}
	//this.workers = [new Worker("sidecalc.js"),new Worker("sidecalc.js"),new Worker("sidecalc.js"),new Worker("sidecalc.js")];
	this.workers = [];
	for(var i=0; i < this.workers.length; i++)
	{
		this.workers[i].onmessage = function (e) {
			ourGraph.plotAndConnectPoints(e.data);
			ourGraph.drawPoints();
		};
	}
}

SM.Graph.prototype = {
	/**
		Read and parse input of x-range and updates the x-range.
		@param {string} rangestring The values for xhigh and xlow as a string
	**/
	changeX:  function(rangestring) {
		var pointRe = /([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)/;
		var pointValues = pointRe.exec(rangestring);
		this.xlow =parseFloat( pointValues[1]);
		this.xhigh =parseFloat( pointValues[3]);
		this.redraw();

	},

	/**
		Read and parse input of y-range and updates the y-range.
		@param {string} rangestring The values for yhigh and ylow as a string
	**/
	changeY:  function (rangestring) {
		var pointRe = /([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)/;
		var pointValues = pointRe.exec(rangestring);
		this.ylow =parseFloat( pointValues[1]);
		this.yhigh =parseFloat( pointValues[3]);
		this.redraw();
	},

	/**
		Calulates the X pixels per unit ratio
		@return {double} xpu Returns the xpu value
	**/
	xpu:  function() {

		return canvas.width/(this.xhigh - this.xlow);
	},


	/**
		Calulates the Y pixels per unit ratio
		@return {double} ypu Returns the ypu value
	**/
	ypu: function() {

		return canvas.height/(this.yhigh - this.ylow);
	},

	/**
		Adds a point to the array of points to be interpolated. 
		It also checks if the point is outside the current viewing window and 
		adjusts if necessary. 
		@param {Point} newpoint The newpoint to be drawn
	**/
	addPoint: function(newpoint)
	{
		var previouspoint =this.points[this.points.length-1];
		if(previouspoint != undefined) {
			if(newpoint.x == previouspoint.x && newpoint.y == previouspoint.y) 
				return;
		}
		//This ^ handles a common failure case of the graph object and double clicking.
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
		

		if(redrawrequired) {
			this.redraw();
		}else{
			this.drawLatest();
		}
		

	},

	/**
		Create a new function based on the current points and method and add it to the functions array
	**/
	generateFunction: function() {
		if(this.points.length >1)
		{
			var newpoly = this.datamethods[this.currentinterpolator](this.points);		
			newpoly.color = this.pickColor(); 
			this.functions.push(newpoly);
			return newpoly;
		}
	},

	/**
		Draws all points currently in array onto graph
	**/
	drawPoints:  function()
	{
	   var c = canvas.getContext('2d');
	   c.fillStyle = "red";

	   for (var i = 0; i < this.points.length; i++) {
		var pixel = this.pointToPixel(this.points[i]);
		c.fillRect(pixel.x-2,pixel.y-2,5,5);
	   }
	},

	/**
		Draws the axes of the graph along with the gridlines within
	**/
	drawAxes:  function()
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
	},

	/**
		Draws the backdrop of the graph
	**/
	redraw: function()
	{
		var c = canvas.getContext('2d');
		c.fillStyle= "white";
		c.fillRect(0,0,canvas.width,canvas.height);
		this.drawAxes();
		var workersupport = true;
		if(typeof(this.workers[0]) === "undefined") {
			workersupport = false;	
		}
		if(this.functions.length >0)
		{
			for(var i=0; i <this.functions.length; i++)
			{
				if(workersupport) {
					this.workers[i%this.workers.length].postMessage({
						"cmd":"calc",
						"startx":this.xlow,
						"ylow":this.ylow,
						"yhigh":this.yhigh,
						"range":this.xhigh-this.xlow,
						"fn":this.functions[i].toWebWorker()
					});
				}else{
					this.drawFunction(this.functions[i]);
				}
			}
		}
		this.drawPoints();


	},

	/**
		Draw the latest function added
	**/
	drawLatest: function()
	{
		var c = canvas.getContext('2d');
		if(this.functions.length >0)
		{
			
			this.drawFunction(this.functions[this.functions.length-1]);
		}
		this.drawPoints();


	},
	/**
		Draws a function on the graph by drawing lines between calculated points.
		@param {Polynomial|Term} interpolated The interpolated function
	**/
	drawFunction: function(interpolated)
	{

		var range = this.xhigh - this.xlow;
		var plist = [];
	//	for(var i=0; i < range; i+=range/128)
		var ingraph = false;
		var oldery;
		for(var i=0; i < range; i+=range/512)
		{
			var x = this.xlow+i;
			var newy = interpolated.resolve(x);
			if(newy != undefined) {
				if(newy >= this.ylow && newy <= this.yhigh) {
					if(ingraph == false && oldery != undefined) {
						plist.push(oldery);	
					}
					plist.push(new SM.Point(x,newy));	
					ingraph = true;
				}else if(ingraph == true) {
					plist.push(new SM.Point(x,newy));	
					ingraph = false;
				}
				oldery = new SM.Point(x,newy);
			}
		}
		//console.log(plist);
		plist.sort(SM.Point.sorter);

		//console.log(plist);
		var c = canvas.getContext('2d');
		c.beginPath();
		if(!interpolated.color) {
			interpolated.color = this.pickColor(); 
		}
		c.strokeStyle=interpolated.color;
		c.lineWidth = 2;
		var pixel = this.pointToPixel(plist[0]);
		c.moveTo(pixel.x,pixel.y);
		for(var i=1; i < plist.length; i++)
		{
			pixel = this.pointToPixel(plist[i]);
			c.lineTo(pixel.x,pixel.y) ;	
			c.stroke();
		}
	},

	/**
		Draws a curve defined by points
		@param {Point[]} points The points to be plotted and connected;
	**/
	plotAndConnectPoints: function(points) {
		points.points.sort(SM.Point.sorter);

		var c = canvas.getContext('2d');
		c.beginPath();
		if(!points.color) {
			c.strokeStyle=this.pickColor();
		}else{
			c.strokeStyle=points.color;
		}
		c.lineWidth = 2;
		var pixel = this.pointToPixel(points.points[0]);
		c.moveTo(pixel.x,pixel.y);
		for(var i=1; i < points.points.length; i++)
		{
			var pixel = this.pointToPixel(points.points[i]);
			c.lineTo(pixel.x,pixel.y);	
			c.stroke();
		}
	},

	/**
		Removes the chosen point from the graph
		@param {String} p The point to be removed
	**/
	removePoint: function(p)
	{
		for(var i=0; i < this.points.length; i++)
		{
			if(p == this.points[i].toString())
			{
				this.points.splice(i,1);
			}

		}
		this.redraw();

	},

	/**
		Removes all points from the graph
	**/
	removeAllPoints: function()
	{
		this.points = [];
		this.redraw();
	},

	/**
		Removes the chosen function from the graph
		@param {String} f The function to be removed
	**/
	removeFunction: function(f)
	{
		for(var i=0; i < this.functions.length; i++)
		{
			if(f == this.functions[i].toString())
			{
				this.functions.splice(i,1);
			}

		}
		this.redraw();

	},

	/**
		Removes all functions from the graph
	**/
	removeAllFunctions: function()
	{
		this.functions = [];
		this.redraw();
	},

	/**
		Clears all points and functions from the graph
	**/
	clear: function()
	{
			this.functions = [];
			this.points = [];
			this.redraw();
	},

	/**
		Provide graphs current x-range
		@return {Range} 
	**/
	xrange: function() 
	{
		return new SM.Range("["+this.xlow+","+this.xhigh+"]");
	},

	/**
		Provide graphs current y-range
		@return {Range} 
	**/
	yrange: function() 
	{
		return new SM.Range("["+this.ylow+","+this.yhigh+"]");
	},

	/**
		Convert point in unit space to pixel space
		@param {Point} point The point to be translated
		@return {Point} The point in pixel space
	**/
	pointToPixel: function(point) {
		var xpu = this.xpu();
		var ypu = this.ypu(); 
		var pixelx =(point.x-this.xlow) * xpu ;
		var pixely =canvas.height -(point.y-this.ylow)* ypu;
		return new SM.Point(pixelx,pixely);
	},

	/**
		Convert point in pixel space to point in unit space
		@param {Point} point the point to be translated
		@return {Point} The point in unit space
	**/
	pixelToPoint: function(point) {
	   var x = this.xlow+point.x/this.xpu();
	   var y = this.ylow+(canvas.height-point.y)/this.ypu();
	   return new SM.Point(x,y);
	},

	/**
		Add a function to the Graphs internal function list
		@param {Resolveable} fn The function to be added to the graph
	**/
	addFunction: function(fn) {
		fn.color = this.pickColor(); 
		this.functions.push(fn);

	},

	/**
		Pick a color for a new function to be assigned
		@return {String} HTML color name
	**/
	pickColor: function() {
		
		var COLOR = ['Blue','LimeGreen','Gold','Sienna','DarkRed','LightSlateGray','Purple','Black'];
		var fncolor = COLOR[this.counter%COLOR.length];  
		this.counter++;
		return fncolor;
	}
}

