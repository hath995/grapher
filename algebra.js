/**
	Polynomial interpolation demo
	@authors - Aaron R Elligsen
	UNIVERSITY OF OREGON
	MATH 351 - FALL 2012
**/


/**
	Constructor for a term of a polynomial
	@class
	@constructor
	@param {double} coefficient The coefficient of the term.
	@param {double} power The power of the variable in the term.
	@param {string} variable The name of the variable involved in the term
**/
function Term(coefficient, power, variable)
{
	this.coefficient = coefficient;
	this.power = power;
	this.variable = variable;
}


/**
	Returns the additive invese of the term
	@return {Term}  
**/
Term.prototype.neg = function() {
	return new Term(0-this.coefficient,this.power,this.variable);
}


/**
	Adds a term,polynomial, or constant to an existing term
	@param {Term|Polynomial|double} summand The summad being added to the term
	@return {Term|Polynomial} The result of the summation

**/
Term.prototype.add = function(summand) {
	if(summand instanceof Term)
	{
		if(summand.variable == this.variable)
		{
			if(summand.power == this.power)
			{
				var sumofterms = new Term(this.coefficient + summand.coefficient,this.power,this.variable);
				return sumofterms;
				
			}else{
				
				return new Polynomial([this,summand]);
			}
		}else{
			
			return new Polynomial([this,summand]);
		}
	}else if(summand instanceof Polynomial) {
		return summand.add(this);
	}else if(typeof summand === "number") {
		var constant = new Term(summand,0,this.variable);
		return new Polynomial([this,constant]);
	}
}

/**
	Subtract a term, or constant from an existing term
	@param {Term|double} summand The summand being subtract from the term
	@return {Term|Polynomial} The result of the summation
**/
Term.prototype.subtract = function(summand) {
	if(summand instanceof Term)
	{
		return this.add(summand.neg());
	}else if(typeof summand === "number") {
		var constant = new Term(0-summand,0,this.variable);
		return new Polynomial([this,constant]);
	}
}

/**
	Multiply a term, Polynomial, or constant to an existing term
	@param {Term|Polynomial|double} multiplicand The multiplicand in the product
	@return {Term|Polynomial} The product
**/
Term.prototype.multiply = function(multiplicand) {
	var tempterm = new Term();
	if(multiplicand instanceof Term)
	{
		if(multiplicand.variable == this.variable) {
			tempterm.coefficient = this.coefficient*multiplicand.coefficient;
			tempterm.variable = this.variable;
			tempterm.power = this.power + multiplicand.power;
		}
	}else if(multiplicand instanceof Polynomial) {
		return multiplicand.multiply(this); 	
	}else if(typeof multiplicand === "number") {
		
			tempterm.coefficient = this.coefficient*multiplicand;
			tempterm.variable = this.variable;
			tempterm.power = this.power;
	}
	return tempterm;
}

/**
	Divide a term by another term or a constant
	@param {Term|Polynomial|double} denominator The denominator of the divisor 
	@return {Term|Polynomial} The quotient 
**/
Term.prototype.divide = function(denominator) {
	var tempterm = new Term();
	if(denominator instanceof Term)
	{
		if(denominator.variable == this.variable) {
			tempterm.coefficient = this.coefficient/denominator.coefficient;
			tempterm.variable = this.variable;
			tempterm.power = this.power - denominator.power;
		}
	}else if(typeof denominator === "number") {
		
			tempterm.coefficient = this.coefficient/denominator;
			tempterm.variable = this.variable;
			tempterm.power = this.power;
	}
	return tempterm;
}

/**
	Generates a pretty printed version of the term.
	@return {String} Returns a string version of the term
**/
Term.prototype.toString = function () { 
	var retstring ="";
	if(this.coefficient ==0)
	{
		return "";
	}else if(this.coefficient ==-1) {
		retstring += '-';
	}else if(this.coefficient !=1) {
		retstring += this.coefficient;
	}
	if(this.coefficient == 1 && this.power == 0)
	{
		retstring += this.coefficient;
	} 
	if(this.coefficient == -1 && this.power == 0) {
		retstring += 1;
	}
	if(this.power != 0) 
	{
		if(this.power == 1)
		{

			retstring += this.variable
			//do nothing, hurray!
		}else{
			retstring += this.variable
			retstring +="^"+this.power;
		}
	}
	return retstring;
	
}

/**
	Generate a formated string representing a term.
	@return {String} Return the term in formatted string
**/
Term.prototype.serialize = function() {
	return ""+this.coefficient+""+this.variable+"^"+this.power;
}

/**
	@param {double} value Evaluate the term for the value
	@return {double} The result of the function
**/
Term.prototype.resolve = function(value) {
	return this.coefficient * Math.pow(value,this.power);
}

/**
	This is an alternate constructor to initialize Term objects.
	This is meant to be used in conjunction witht the serialize() method
	@param {String} sterm A string of the form ax^b where a,b are floats, and x is any variable 
**/
Term.prototype.initTerm = function(sterm) {
	var termRe = /([-]*\d*(\.\d*)*)([a-zA-Z]+)\^([-]*\d+(\.\d*)*)/;
	var termValues = termRe.exec(sterm);

	this.coefficient = parseFloat(termValues[1]);
	this.power = parseFloat(termValues[4]);
	this.variable = termValues[3];
	//returnv 
};

/**
	Constructs a polynomial, simply a set of terms
	@class
	@constructor
	@param {Term[]} terms An array of Term objects
**/
function Polynomial(terms) {
	this.terms = terms;
}

/**
	Evaluates the polynomial for value value
	@param {double} value The value to be applied to the function/polynomial
	@return {double} the result 
**/
Polynomial.prototype.resolve = function(value) { 
	var sumofterms = 0; 
	for (var i=0;i<this.terms.length;i++)
	{
		sumofterms += this.terms[i].resolve(value);
	}
	return sumofterms;
};

/**
	Generates a string representation of the Polynomial
	@return {string} The string representation
**/
Polynomial.prototype.toString = function() {
	var retstring = "";
	for(var i=0; i < this.terms.length; i++)
	{
		if(i!= this.terms.length-1)
		{
			retstring += this.terms[i].toString();
			if(this.terms[i+1].coefficient >= 0)
			 {
				retstring += "+";
			 }
		}else{
			retstring += this.terms[i].toString();
		}
	}
	return retstring;
};

/**
	Generates an array of serialized terms 
	@return {String[]} The array of serialized terms
**/
Polynomial.prototype.serialize = function() {
	var serialterms = [];
	for(var i=0; i < this.terms.length; i++)
	{
		serialterms[i] = this.terms[i].serialize();
	}
	return serialterms;
};

/**
	Adds one of several object to a polynomial
	@param {Term|Polynomial|number} summand A Term, or Polynomial, or number to be added
	@return {Polynomial} The sum
*/
Polynomial.prototype.add = function(summand) {
	if(summand instanceof Polynomial)
	{
		var temppolynomial = new Polynomial(this.terms.concat(summand.terms));
		temppolynomial.simplify();
		temppolynomial.sort();
		return temppolynomial;
	}else if(summand instanceof Term) {
		var matchingpower = false;
		//var temppolynomial = this;
		var temppolynomial = new Polynomial(this.terms.slice()); 
		for(var i =0; i <this.terms.length; i++)
		{
			if(this.terms[i].power == summand.power)
			{
				temppolynomial.terms[i] = this.terms[i].add(summand);
				matchingpower = true;
				break;
			}
		}
		if(!matchingpower)
		{
			temppolynomial.terms.push(summand);
		}
		temppolynomial.sort();
		return temppolynomial;
	}else if(typeof summand === "number") {
		var temppolynomial = new Polynomial(this.terms.slice());
		var variable = 'x';
		if(this.terms != undefined)
		{
			variable = this.terms[0].variable;
		}
		var tempterm = new Term(summand,0, variable);
		temppolynomial.terms.push(tempterm);
		temppolynomial.simplify();
		return temppolynomial;	
	}

};

/**
	Multiply a polynomial by something
	@param {Polynomial|Term|number} multiplicand The item to be multiplied by
	@return {Polynomial} The product
**/
Polynomial.prototype.multiply = function(multiplicand) {
	var productterms = new Array();
	if(multiplicand instanceof Polynomial) {
		for(var i =0; i < this.terms.length;i++)
		{
			for(var j =0; j < multiplicand.terms.length;j++)
			{
				
				productterms.push(this.terms[i].multiply(multiplicand.terms[j]));
			}
		}
	}else if(multiplicand instanceof Term || typeof multiplicand === "number" ) {
		for(var i =0; i < this.terms.length;i++)
		{
			productterms.push(this.terms[i].multiply(multiplicand));
		}
	}
	var temppolynomial = new Polynomial(productterms);
	return temppolynomial;
}

/***
	Division of a Polynomial by a number or term. Division by a polynomial is a much 
	more complicated case and so is not handled here because it isn't needed in this program.
	@param {Term|number} denominator The denominator
	@return {Polynomial} The quotient	
**/
Polynomial.prototype.divide = function(denominator) {
	var divisionterms = this.terms.slice();
	if(typeof denominator === "number" || denominator instanceof Term)
	{
		for(var i=0; i < divisionterms.length; i ++)
		{
			divisionterms[i] = divisionterms[i].divide(denominator);
		}
	}
	return new Polynomial(divisionterms);
}

/**
	Produce powers of polynomials, only works with integers currently
	@param {Integer} exponent the power to be raised by
	@return {Polynomial} The resulting polynomial
**/
Polynomial.prototype.exponentiate = function(exponent) {
	var memoizedpowers = {};
	var originalterm = this;
	return (function exponentBySquares(value,exp) {
		//if(memoized[exponent] 	
		if(exp == 1) {
			return value;
		}else if(exp%2 ==1) {
			var temp =originalterm.multiply(exponentBySquares(value.multiply(value),(exp-1)/2));
			temp.simplify();
			temp.sort();
			return temp; 
		}else{
			var temp =exponentBySquares(value.multiply(value),(exp)/2); 
			temp.simplify();
			temp.sort();
			return temp;
		}
	})(this,exponent);
}

/**
	Due to the implmentation of some of the mathematical operations they generate
	unsimplified polynomials. This corrects that.
**/
Polynomial.prototype.simplify = function() {
	var  powers = {};
	for(var i =0; i < this.terms.length; i++)
	{
		var p = ""+this.terms[i].power;
		if(powers[p] === undefined)
		{
			powers[p] = this.terms[i];
		}else{
			powers[p] = this.terms[i].add(powers[p]);
		}
	}
	this.terms = new Array();
	for(var power in powers) 
	{
		if(powers[power].coefficient != 0) {
			this.terms.push(powers[power]);
		}
	}
}

/**
	Due to the implmentation of the mathematical operations terms are  not in 
	any sorted order. This sorts them.
**/
Polynomial.prototype.sort = function() {
	this.terms.sort(function(a,b) {
		if(a.power > b.power)
			return -1;
		if(a.power < b.power)
			return 1;
		return 0;	
	});
}

/**
	Generate orthogonal polynomials to assist least square methods
	@param {Point[]} points The data to be interpolated
	@return {Polynomial[]} The orthogonal functions
**/
Polynomial.prototype.orthogonalPolynomials = function(points) {
	
}
/**
	A Class which serves to represent mathematical ranges
	@class
	@constructor
	@param {String} rangestring Anything of the standard mathematical forms
	[x,y],(x,y],[x,y),(x,y) where x,y in reals and square brackets are inclusive
	and parens are exclusive 
**/
function Range(rangestring) {
	
	function evaluateRange(obj,rs)
	{
		var rangeRe = /([[]|[(])([-]*\d*(\.\d*)*),([-]*\d*(\.\d*)*)([\]]|[)])/; 
		var result = rs.match(rangeRe);
		if(result == null)
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
	Tests if a value is within a range
	@param {Double} num The value to be tested
	@return {Boolean} True or false depending on the range defined
**/
Range.prototype.inRange = function(num) {
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
Range.prototype.toString = function() {
	return this.def;
}

/**
	Object representing mathematical piecewise functions
	@class
	@constructor
	@param {Resolveable[]} functs An array of objects implementing the resolve method
	@param {Range[]} ranges An array of Range objects for each of the functs provided
**/
function PiecewiseFunction(functs, ranges) {
	if(!(functs instanceof Array) || !(ranges instanceof Array))
	{
		throw new Error("Parameters expect Arrays.");
	}
	if(functs.length != ranges.length)
	{
		throw new Error("Number of functions and ranges must match.");
	}

	this.functs = functs;
	this.ranges = ranges;

	/**
		Applies the function on the value and returns the result
		@param {Double} value The value to be used in the function
		@return {Double} The result
		@todo Perhaps inplement a binary search for the correct range
	**/
	this.resolve = function(value) {
		for(var i =0; i < ranges.length; i++) 
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
	this.toString = function() {
		var output = "{";
		for(var i=0; i < this.functs.length; i++) {
			this.functs[i].sort();
			output += "f"+i+"(x)="+this.functs[i]+" on range: "+this.ranges[i]+", ";	
		}
		return output+"}";
	}
}

/**
	Given a list of points generates a piece-wise spline function of the first degree.
	@param {Point[]} points An array of point objects sorted by x-value
	@return {PiecewiseFunction} The linear spline interpolation
	
	Roughly based on Page 374
	test code:
	var Q = [new Point(0,8),new Point(1,12),new Point(3,2),new Point(4,6),new Point(8,0)];
	var Y = [new Point(0,8),new Point(1,6),new Point(3,5),new Point(4,3),new Point(6,2),new Point(8,0)];
	ourGraph.points = Y;
	var yspline = createFirstDegSpline(Y);
	ourGraph.drawPoints();
	ourGraph.drawFunction(yspline);
**/
PiecewiseFunction.prototype.createFirstDegSpline = function(points) {
	if(points.length < 2)
	{
		throw new Error("At least 2 points are required");
	}
	var sortedpoints = points.slice();
	sortedpoints.sort(function(a,b) {
		if(a.x < b.x) {
			return -1;
		}else if(a.x > b.x) {
			return 1;
		}else{
			return 0;
		}

	});
	var functionarray = [];
	var rangearray = [];
	for(var i =0; i < sortedpoints.length-1; i++) {
		rangearray.push(new Range("["+sortedpoints[i].x+","+sortedpoints[i+1].x+")"));
		var newspline = new Term(1,1,'x');
		newspline = newspline.subtract(new Term(sortedpoints[i].x,0,'x'));
		newspline = newspline.multiply((sortedpoints[i+1].y-sortedpoints[i].y)/(sortedpoints[i+1].x-sortedpoints[i].x));
		newspline = newspline.add(sortedpoints[i].y);
		functionarray.push(newspline);
	}
	//functionarray.reverse();
	//rangearray.reverse();
	return new PiecewiseFunction(functionarray,rangearray);
}

/**
	Given a list of points generates a piece-wise spline function of the second degree.
	@param {Point[]} points An array of point objects sorted by x-value
	@param {Double} zzero 0 by default, otherwise the slope of the second derivative of the initial function 
	@return {PiecewiseFunction} The quadratic spline interpolation
	
	Roughly based on Page 380
	test code:
	var Q = [new Point(0,8),new Point(1,12),new Point(3,2),new Point(4,6),new Point(8,0)];
	var Y = [new Point(0,8),new Point(1,6),new Point(3,5),new Point(4,3),new Point(6,2),new Point(8,0)];
	var Z = [new Point(-1,2),new Point(0,1),new Point(0.5,0),new Point(1,1),new Point(2,2),new Point(5/2.0,3)];
	ourGraph.points = Z;
	var yspline = createSecondDegSpline(Z);
	ourGraph.drawPoints();
	ourGraph.drawFunction(yspline);
**/
PiecewiseFunction.prototype.createSecondDegSpline = function(points, zzero) {
	if(points.length < 2)
	{
		throw new Error("At least 2 points are required");
	}
	var sortedpoints = points.slice();
	sortedpoints.sort(function(a,b) {
		if(a.x < b.x) {
			return -1;
		}else if(a.x > b.x) {
			return 1;
		}else{
			return 0;
		}

	});
	var z = [];
	if(zzero != undefined)
	{
		z[0] = zzero;
	}else{
		z[0] = 0;
	}
	var functionarray = [];
	var rangearray = [];
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
	@author Sahil Diwan
	@param {Point[]} points An array of points to interpolate
	@return {PiecewiseFunction} A piecewise function using polynomials of degree three
	@todo: IMPLEMENT the stuff on page 392
**/
PiecewiseFunction.prototype.createThirdDegSpline = function(points) {

}

/**
	Generates a polynomial given an array of points using the Lagrange Interpolation Method
	@param {Point[]} points The points to be interpolated
	@return {Polynomial} The function interpolating the points.
**/
Polynomial.prototype.LagrangeInterpolation = function(points)
{
	var interpolated;
	var x = new Term(1,1,'x');
	for(var i=0; i <points.length; i++)
	{
		var ix = points[i].x;
		var li;
		for(var j=0; j<points.length; j++)
		{
			if(i!=j)
			{
				var pointpoly =x.subtract(points[j].x).divide(ix-points[j].x); 
				if(li == undefined)
				{
					li = pointpoly;
				}else{
					li = li.multiply(pointpoly);
				}
			}
		}
		//console.log(""+li);
		li = li.multiply(points[i].y);
		if(interpolated == undefined)
		{
			interpolated = li;
		}else{
			interpolated = interpolated.add(li);
		}
		li = null;
	}
	interpolated.simplify();
	interpolated.sort();
	return interpolated;
}

/**
	A point object representing a point in a 2-d plane
	@class
	@constructor
	@param {Number} x The x value
	@param {Number} y The y value
**/
function Point(x,y)
{
		this.x = parseFloat(x);
		this.y = parseFloat(y);
}

/**
	A method to convert a Point to a String
	@return {String} The point value in parens
**/
Point.prototype.toString = function()
{
		return "("+this.x+","+this.y+")";	
}

/**
	A method to calculate the integral of a function fofx from a to b using 2^n divisions
	@param {Polynomial|Term} fofx The function to be integrated
	@param {Number} a The lower bound
	@param {Number} b The upper bound
	@param {Number} n The power of 2 used to partition the range  
**/
function RombergExtrapolation(fofx, a,b,n)
{
	var h = b-a;
	var r = new Array(n+1);
	for(var i=0; i <= n; i++)
	{
		r[i]= new Array(n+1);
	}
	r[0][0] = h*(fofx.resolve(a)+fofx.resolve(b))/2;
	for(var i=1; i <= n; i++)
	{
		var sum=0;
		h /=2;
		for(var k=1; k < Math.pow(2,i); k+=2)
		{
			//sum += fofx.resolve(a+((2*k-1)*h));
			sum += fofx.resolve(a+k*h);
		}
		r[i][0]=r[i-1][0]/2+sum*h;
		for(var j=1; j<=i;j++)
		{
			r[i][j] = r[i][j-1]+(r[i][j-1]-r[i-1][j-1])/(Math.pow(4,j)-1);
		}
	}
	return r;


}

/**
	A method to calculate the integral of a function fofx from a to b using n divisions
	@param {Polynomial|Term} fofx The function to be integrated
	@param {Number} a The lower bound
	@param {Number} b The upper bound
	@param {Number} n The number of divisions used to partition the range  
**/
function TrapezoidRule(fofx, a, b, n)
{
	var x;
	var h = (b-a)/n;
	var sum =(fofx.resolve(a)+fofx.resolve(b))/2;
	for(var i=1; i< n; i++)
	{
		x = a+i*h;
		sum += fofx.resolve(x);
	}
	sum *=h;
	return sum;

}

/**
	A method to calculate the integral of a function fofx from a to b 
	@param {Polynomial|Term} fofx The function to be integrated
	@param {Number} a The lower bound
	@param {Number} b The upper bound
**/
function basicSimpsonsrule(fofx,a,b)
{
	var h=(b-a)/6;
	var sum =h*(fofx.resolve(a)+4*fofx.resolve((a+b)/2)+fofx.resolve(b));

	return sum;
}


function bisection(fofx, a, b, depthmax, epsilon) 
{
	var left = fofx.resolve(a);
	var right = fofx.resolve(b);
	var center;
	if(left*right >0)
	{
		//throw error? "function has the same sign at a and b"
		return false;
	}
	var error = b-a;
	for(var i = 0; i <depthmax;i++)
	{
		error /=2;
		center = a + error;
		var fofc = fofx.resolve(center);
		if(Math.abs(error) < epsilon)
		{
			return center;
		}
		if(left*fofc <0)
		{
			b = center;
			right = fofc;
		}else{
			a = center;
			right = fofc;
		}

	}
	//throw "Did not converge in $depthmax steps";
}
