import {reattachMethods, Term, Point} from "./Term";
import {Polynomial} from "./Polynomial";
import {Matrix} from "./Matrix";
/**
	A Class which serves to represent mathematical ranges
	@class
	@constructor
	@param {String} rangestring Anything of the standard mathematical forms
	[x,y],(x,y],[x,y),(x,y) where x,y in reals and square brackets are inclusive
	and parens are exclusive 
**/
export class Range {

	def: string;
	lowerbound: number;
	upperbound: number;
	inclusivelower: boolean;
	inclusiveupper: boolean;
	serializeName?: string;

	constructor(rangestring) {
		/**
			Private helper function to parse the range string
			@private
			@param {Range} The object being initialized
			@param {string} The range as a string to be parsed on initalized for
		**/
		function evaluateRange(obj,rs)
		{
			var rangeRe = /([[]|[(])([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)([\]]|[)])/; 
			var result = rs.match(rangeRe);
			if(result === null)
			{
				throw new Error("Range given not parseable.");
			}else{
				if(result[1] == '(')
				{
					obj.inclusivelower = false;
				}

				if(result[6] == ')')
				{
					obj.inclusiveupper = false;
				}
				obj.lowerbound = parseFloat(result[2]);
				obj.upperbound = parseFloat(result[4]);
			}

		}

		this.def = rangestring;
		this.lowerbound = 0;
		this.upperbound = 0;
		this.inclusivelower = true;
		this.inclusiveupper = true;
		try{
		evaluateRange(this,rangestring);
		}catch(e) {
			throw e;
		}

	}
/**
	A static constant to help with de/serialization
	@constant
	@static
**/
	static serializeName = "Range";	

/**
	Reattach methods after being passed to web worker
	@static
	@param {Object} that A Range stripped of methods
**/
	static fromWebWorker = function(that) {
		reattachMethods(that,Range);
	};
	/**
		A method to help with serializing and passing to web worker
	**/
	toWebWorker() {
		this.serializeName = Range.serializeName;
	}

	/**
		Tests if a value is within a range
		@param {number} num The value to be tested
		@return {Boolean} True or false depending on the range defined
	**/
	inRange(num: number) {
		if(this.inclusivelower)
		{
			if(this.inclusiveupper) 
			{
				return this.lowerbound <= num && this.upperbound >= num;
			}else{
				return this.lowerbound <= num && this.upperbound > num;
			}
		}else{
			if(this.inclusiveupper) 
			{
				return this.lowerbound < num && this.upperbound >= num;
			}else{
				return this.lowerbound < num && this.upperbound > num;
			}

		}
				
	} 

	/**
		Creates a string representation
		@return {string} 
	**/
	toString() {
		return this.def;
	}
}
/**
	Object representing mathematical piecewise functions
	@class
	@constructor
	@param {Resolveable[]} functs An array of objects implementing the resolve method
	@param {Range[]} ranges An array of Range objects for each of the functs provided
**/
export class PiecewiseFunction {
	functs: (Term | Polynomial)[];
	ranges: Range[];
	serializeName?: string;
	paths?: Point[][];

	constructor(functs: (Term | Polynomial)[], ranges: Range[]) {
		if(!(functs instanceof Array) || !(ranges instanceof Array))
		{
			throw new Error("Parameters expect Arrays.");
		}
		if(functs.length != ranges.length) {
			throw new Error("Number of functions and ranges must match.");
		}
		this.functs = functs;
		this.ranges = ranges;
	}

/**
	A static constant to help with de/serialization
	@constant
	@static
**/
	static serializeName = "PiecewiseFunction";

/**
	Reconstitutes a PiecewiseFunction object and its data members after passed to web worker
	@static
	@param {Object} that A PiecewiseFunction strippd of its methods
**/
	static fromWebWorker(that) {
		reattachMethods(that, PiecewiseFunction);
		for(var i=0; i < that.ranges.length; i++)
		{
			Range.fromWebWorker(that.ranges[i]);
		}
		var fromHelper = {}; //Probably should centralize this somewhere...
		fromHelper[Term.serializeName] = Term.fromWebWorker;
		fromHelper[Polynomial.serializeName] = Polynomial.fromWebWorker;
		fromHelper[PiecewiseFunction.serializeName] = PiecewiseFunction.fromWebWorker; 
		for(var j = 0; j < that.functs.length; j++) 
		{
			fromHelper[that.functs[j].serializeName](that.functs[j]);
		}
	};

/**
	Given a list of points generates a piece-wise spline function of the first degree.
	@static
	@param {Point[]} points An array of point objects sorted by x-value
	@return {PiecewiseFunction} The linear spline interpolation
**/
	static createFirstDegSpline(points) {
		if(points.length < 2)
		{
			throw new Error("At least 2 points are required");
		}
		var sortedpoints = points.slice();
		sortedpoints.sort(Point.sorter);
		var functionarray: (Term | Polynomial)[] = [];
		var rangearray: Range[] = [];
		for(var i =0; i < sortedpoints.length-1; i++) {
			rangearray.push(new Range("["+sortedpoints[i].x+","+sortedpoints[i+1].x+")"));
			var newspline: Term | Polynomial = new Term(1,1,'x');
			newspline = newspline.subtract(new Term(sortedpoints[i].x,0,'x'));
			newspline = newspline.multiply((sortedpoints[i+1].y-sortedpoints[i].y)/(sortedpoints[i+1].x-sortedpoints[i].x));
			newspline = newspline.add(sortedpoints[i].y);
			functionarray.push(newspline);
		}
		return new PiecewiseFunction(functionarray,rangearray);
	}

/**
	Given a list of points generates a piece-wise spline function of the second degree.
	@static
	@param {Point[]} points An array of point objects sorted by x-value
	@param {number} zzero 0 by default, otherwise the slope of the second derivative of the initial function 
	@return {PiecewiseFunction} The quadratic spline interpolation
**/
static createSecondDegSpline(points: Point[], zzero: number = 0) {
	if(points.length < 2)
	{
		throw new Error("At least 2 points are required");
	}
	var sortedpoints = points.slice();
	sortedpoints.sort(Point.sorter);
	var z: number[] = [];
	z[0] = zzero;
	var functionarray: (Term | Polynomial)[] = [];
	var rangearray: Range[] = [];
	for(var i =0; i < sortedpoints.length-1; i++) {
		if(i == sortedpoints.length-2) {
			rangearray.push(new Range("["+sortedpoints[i].x+","+sortedpoints[i+1].x+"]"));
		}else{
			rangearray.push(new Range("["+sortedpoints[i].x+","+sortedpoints[i+1].x+")"));
		}
		z[i+1]=2*((sortedpoints[i+1].y-sortedpoints[i].y)/(sortedpoints[i+1].x-sortedpoints[i].x))-z[i];
		var newspline = new Term(1,1,'x');
		var ns1 = newspline.subtract(new Term(sortedpoints[i].x,0,'x'));
		//console.log(ns1);
		var newquadratic = ns1.exponentiate(2);
		var nq = newquadratic.multiply((z[i+1]-z[i])/(2*(sortedpoints[i+1].x-sortedpoints[i].x)));
		//console.log(nq);
		var ns2 = ns1.multiply(z[i]);
		var nq2 = nq.add(ns2);
		var f = nq2.add(sortedpoints[i].y);
		functionarray.push(f);
	}
		//console.log(z);
	//functionarray.reverse();
	//rangearray.reverse();
	return new PiecewiseFunction(functionarray,rangearray);
}

/**
	Creates a Natural Cubic Spline given a series of points
	@author Sahil Diwan
	@static
	@param {Point[]} points An array of points to interpolate
	@return {PiecewiseFunction} A piecewise function using polynomials of degree three
**/
static createThirdDegSpline(points) {
	if(points.length < 2)
	{
		throw new Error("At least 2 points are required");
	}
	var sortedpoints = points.slice();
	sortedpoints.sort(Point.sorter);
	var h: number[] = [];
	var b: number[] = [];
	for(var i = 0; i < sortedpoints.length - 1; i++) {
		h[i] = sortedpoints[i + 1].x - sortedpoints[i].x;
		b[i] = ((sortedpoints[i + 1].y - sortedpoints[i].y)/h[i]);
	}
	var u: number[] = [];
	var v: number[] = [];
	for(var i = 1; i < sortedpoints.length - 1; i++) {
		if(i == 1) {
			u[1] = ((h[0] + h[1]) * 2);
			v[1] = (((b[1] - b[0])) * 6);
		} 
		else {
			u[i] = (((h[i] + h[i - 1]) * 2) - ((Math.pow(h[i - 1], 2) / u[i - 1])));
			v[i] = (((b[i] - b[i - 1]) * 6) - ((h[i - 1] * v[i - 1]) / u[i - 1]));
		}
	}
	var z = [0];
	z[sortedpoints.length-1]=0;
	for(i = sortedpoints.length - 2; i >= 1; i--) {
		z[i] = ((v[i] - (h[i] * z[i + 1])) / u[i]);
	}

	var functionarray: (Term | Polynomial)[] = [];
	var rangearray: Range[] = [];

	for(var i = 0; i < sortedpoints.length - 1; i++) {
		var tmp1 = (new Term(1, 1, "x")).subtract(sortedpoints[i].x).exponentiate(3).multiply(z[i + 1] / (6 * h[i]));
		/*console.log(tmp1.toString());
		console.log(sortedpoints[i].x)
		console.log(z[i + 1] / (6 * h[i]))*/
		var tmp2 = (new Term(sortedpoints[i + 1].x, 0, "x").subtract(new Term(1, 1, "x")).exponentiate(3).multiply(z[i] / (6 * h[i])));
		var tmp3 = (new Term(1, 1, "x").subtract(sortedpoints[i].x).multiply((sortedpoints[i + 1].y / h[i]) - ((h[i]/6) * z[i+1])));
		var tmp4 = (new Term(sortedpoints[i + 1].x, 0, "x").subtract(new Term(1, 1, "x")).multiply((sortedpoints[i].y / h[i]) - ((h[i]/6) * z[i])));

		functionarray[i] = tmp1.add(tmp2).add(tmp3).add(tmp4); 
		rangearray.push(new Range("["+sortedpoints[i].x+","+sortedpoints[i+1].x+"]"));
	}

	return new PiecewiseFunction(functionarray,rangearray);
}


	/**
		Applies the function on the value and returns the result
		@param {number} value The value to be used in the function
		@return {number} The result
		@todo Perhaps inplement a binary search for the correct range
	**/
	resolve(value) {
		for(var i =0; i < this.ranges.length; i++) 
		{
			if(this.ranges[i].inRange(value)) {
				return this.functs[i].resolve(value);
			}
		}
	}

	/**
		Creates a simple string representation of the piecewise function
		@return {string} The string representation
	**/
	toString() {
		var output = "{";
		for(var i=0; i < this.functs.length; i++) {
			(this.functs[i] as Polynomial).sort();
			output += "f"+i+"(x)="+this.functs[i]+" on range: "+this.ranges[i]+", ";	
		}
		return output+"}";
	}

	/**
		Prepares an Object ready to be passed to a web worker	
		@return {Object}
	**/
	toWebWorker() {
		for(var i = 0; i < this.ranges.length; i++)
		{
			this.ranges[i].toWebWorker();
		}
		var serializedfuncts = new Array(this.functs.length);
		for(var j=0; j < this.functs.length; j++)
		{
			serializedfuncts[j] = this.functs[j].toWebWorker();
		}
		return {
			"serializeName":PiecewiseFunction.serializeName,
			"ranges":this.ranges,
			"functs":serializedfuncts
		};
	}





	/**
		Generate points for SVG paths/curves
		@return {Point[]} Path control points in order
	**/
	generateBezierPaths() {
		var paths: Point[][] = [];
		for(var i = 0; i < this.functs.length; i++) {
			var pointset: Point[] = [];
			var fn =this.functs[i];
			var fnrange = this.ranges[i];
			var startp = new Point(fnrange.lowerbound,fn.resolve(fnrange.lowerbound));
			var endp = new Point(fnrange.upperbound,fn.resolve(fnrange.upperbound));
			pointset.push(startp);
			switch(fn.degree()) {
				case 1: 
					pointset.push(endp);
					break;
				case 2:
					var xcoeff = (endp.x-startp.x);
					var parax = (new Term(xcoeff,1,'t')).add(new Term(startp.x,0,'t'));
					var paray = fn.resolve({'x':parax});
					var quadbezier = new Matrix(3,3,[[1,0,0],[-2,2,0],[1,-2,1]]);
					var xhalf = quadbezier.scaledPartialPivotGaussian(Matrix.columnVector([startp.x,xcoeff,0]));
					paray.simplify();
					paray.sort();
					var paraycoeffs = [paray.degreeCoeff(0),paray.degreeCoeff(1),paray.degreeCoeff(2)];
					var yhalf = quadbezier.scaledPartialPivotGaussian(Matrix.columnVector(paraycoeffs));
					pointset.push(new Point(xhalf.values[1][0],yhalf.values[1][0]));
					pointset.push(endp);
					break;
				case 3: 
					var xcoeff = (endp.x-startp.x);
					var parax = (new Term(xcoeff,1,'t')).add(new Term(startp.x,0,'t'));
					var paray = fn.resolve({'x':parax});
					var cubicbezier = new Matrix(4,4,[[1,0,0,0],[-3,3,0,0],[3,-6,3,0],[-1,3,-3,1]]);
					var xhalf = cubicbezier.scaledPartialPivotGaussian(Matrix.columnVector([startp.x,xcoeff,0,0]));
					paray.simplify();
					paray.sort();
					var paraycoeffs = [paray.degreeCoeff(0),paray.degreeCoeff(1),paray.degreeCoeff(2),paray.degreeCoeff(3)];
					var yhalf = cubicbezier.scaledPartialPivotGaussian(Matrix.columnVector(paraycoeffs));
					pointset.push(new Point(xhalf.values[1][0],yhalf.values[1][0]));
					pointset.push(new Point(xhalf.values[2][0],yhalf.values[2][0]));

					pointset.push(endp);
					break;
				default: 
					throw new Error("Function degree out of bounds.");
					break;	
			}

			paths.push(pointset);
		}
		this.paths = paths;
		return paths;
	}
}
