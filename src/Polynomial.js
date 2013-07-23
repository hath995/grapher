

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
	A static constant to help with de/serialization
	@constant
	@static
**/
Polynomial.serializeName = 'Polynomial';

/**
	Custom JSON representation to handle passing to web workers
	@return {Object} For JSON.stringify
**/
Polynomial.prototype.toWebWorker = function() {
	
	var serializedterms = new Array(this.terms.length); 
	for(var i=0;i<this.terms.length; i++) {
		serializedterms[i] = this.terms[i].toWebWorker(); 
	}
	return {
		"serializeName": Polynomial.serializeName,
		"terms":serializedterms	
	};
};

/**
	Finish reconstituting a Polynomial after passing to a web worker
	@static
	@param {Object} that A polynomial stripped of methods
**/
Polynomial.fromWebWorker = function(that) {
	reattachMethods(that,Polynomial);
	for(var i =0; i < that.terms.length; i++) 
	{
		Term.fromWebWorker(that.terms[i]);
	}
};

/**
	Provides the Polynomials degree

**/
Polynomial.prototype.degree = function() {
	var degrees = [];
	for(var i=0; i < this.terms.length; i++) {
		degrees.push(this.terms[i].degree());
	}
	return Math.max.apply(null, degrees);
}

/**
	Evaluates the polynomial for value value
	@param {double | object} value The value to be applied to the function/polynomial
	@return {double | object} the result 
**/
Polynomial.prototype.resolve = function(value) { 
	var sumofterms = 0; 
	for (var i=0;i<this.terms.length;i++)
	{
		var termvalue = this.terms[i].resolve(value);
		if(termvalue instanceof Term || termvalue instanceof Polynomial) {
			if(sumofterms instanceof Term || sumofterms instanceof Polynomial) {
				sumofterms = sumofterms.add(termvalue);
			}else{
				sumofterms = termvalue.add(sumofterms);
			}
		}else{
			if(sumofterms instanceof Term || sumofterms instanceof Polynomial) {
				sumofterms = sumofterms.add(termvalue);
			}else{
				sumofterms += termvalue; 
			}
		}
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
		temppolynomial.terms.push(summand);
		temppolynomial.simplify();
		temppolynomial.sort();
		return temppolynomial;
	}else if(typeof summand === "number") {
		var temppolynomial = new Polynomial(this.terms.slice());
		var variable = 'x';
		if(this.terms !== undefined)
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
	Subtract one of several object to a polynomial
	@param {Term|Polynomial|number} subtrahend A Term, or Polynomial, or number to be added
	@return {Polynomial} The difference
*/
Polynomial.prototype.subtract = function(subtrahend) {
	if(subtrahend instanceof Polynomial)
	{
		var sbt = subtrahend.terms.slice();
		for(var i = 0; i < sbt.length; i++) {
			sbt[i] = sbt[i].neg();
		}
		var temppolynomial = new Polynomial(this.terms.concat(sbt));
		temppolynomial.simplify();
		temppolynomial.sort();
		return temppolynomial;
	}else if(subtrahend instanceof Term) {
		var matchingpower = false;
		var temppolynomial = new Polynomial(this.terms.slice()); 
		temppolynomial.terms.push(subtrahend.neg());
		temppolynomial.simplify();
		temppolynomial.sort();
		return temppolynomial;
	}else if(typeof subtrahend === "number") {
		var temppolynomial = new Polynomial(this.terms.slice());
		var variable = 'x';
		if(this.terms !== undefined)
		{
			variable = this.terms[0].variable;
		}
		var tempterm = new Term(0-subtrahend,0, variable);
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
	var productterms = [];
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
};

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
};

/**
	Produce powers of polynomials, only works with integers currently
	@param {Integer} exponent the power to be raised by
	@return {Polynomial} The resulting polynomial
**/
Polynomial.prototype.exponentiate = function(exponent) {
	var memoizedpowers = {};
	var originalterm = this;
	return (function exponentBySquares(value,exp) {
		if(exp === 0) {
			var singlevar;
			for(var k in value.terms[0].variable)
			{
				singlevar = k;
				break;
			}
			return new Term(1,0,singlevar);	
		}else if(exp === 1) {
			return value;
		}else if(exp%2 === 1) {
			var temp =value.multiply(exponentBySquares(value.multiply(value),(exp-1)/2));
			//var temp =originalterm.multiply(exponentBySquares(value.multiply(value),(exp-1)/2));
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
};

/**
	Due to the implmentation of some of the mathematical operations they generate
	unsimplified polynomials. This corrects that.
**/

Polynomial.prototype.simplify = function() {
	var  powers = {}; //a dictionary of variable groupings each a dictionary of powers 
	var  constants = 0;
	for(var i =0; i < this.terms.length; i++) //for every term
	{
		var termvarsobj = this.terms[i].variable;
		var termvarsordering = [];
		for(var v in termvarsobj) { //get variables from hash
			termvarsordering.push(v);
		}
		termvarsordering.sort(); //get rid of zero powers
		
		var varnames = termvarsordering.join('_'); //join the sorted variables as a string
		if(!powers.hasOwnProperty(varnames)) //create hash bucket for variables
		{
			powers[varnames] = {}; 
		}
		var sortedpower = [];
		var allzeroes = true;
		for(var v in termvarsordering) { //for each variable
			var sp = this.terms[i].power[this.terms[i].variable[termvarsordering[v]]];//find the variables power
			sortedpower.push(sp);
			if(sp !== 0) { allzeroes = false;
			}
		}
		var p = sortedpower.join('_');
		var zeropower;
		if(allzeroes) //create has bucket for powers
		{
			constants += this.terms[i].coefficient;	
		}else if(!powers[varnames].hasOwnProperty(p)) { //put term in bucket
			powers[varnames][p] = this.terms[i];
		}else{ //add together if matching
			powers[varnames][p] = this.terms[i].add(powers[varnames][p]);
		}
	}
	this.terms = [];
	if(constants !== 0) {
		this.terms.push(new Term(constants,0,'x'));
	}
	for(var variable in powers) 
	{
		for(var power in powers[variable]) 
		{
			if(powers[variable][power].coefficient !== 0) {
				this.terms.push(powers[variable][power]);
			}
		}
	}
};
/**
	Due to the implmentation of the mathematical operations terms are  not in 
	any sorted order. This sorts them.
**/
Polynomial.prototype.sort = function() {
	var addfn = function(a,b) {return a+b;};
	this.terms.sort(function(a,b) {
		var left = parseFloat(a.power.reduce(addfn,0));
		var right = parseFloat(b.power.reduce(addfn,0))
		if(left > right)
			return -1;
		if(left < right)
			return 1;
		return 0;	
	});
};

/**
	Generate orthogonal polynomials to assist least square methods
	@param {Number[]} points The x values of data to be interpolated
	@param {Integer} power The highest power of orthogonal polynomial desired
	@return {Polynomial[]} The orthogonal functions
**/
Polynomial.prototype.orthogonalPolynomials = function(points, power) {
	if((typeof points[0]) != "number")
	{
		throw new Error("Array of numbers expected.");
	}

	if(power < 1) 
	{
		throw new Error("Power is expected to be");
	}
	var q = [new Polynomial([new Term(1,0,'x')])]; //q is the name of the basis function set
	var xvals = points.slice();
	/*for(var i = 0; i < points.length; i++) {
		xvals.push(points[i].x);
	}*/

	function innerProduct(fofx, gofx, xvalues) {
		var fgofx = fofx.multiply(gofx);
		var result = 0;
		for(var i = 0; i < xvalues.length; i++) {
			result += fgofx.resolve(xvalues[i]); 
		}
		return result;
	}
	var alphazero = innerProduct((new Term(1,1,'x')).multiply(q[0]),q[0],xvals)/innerProduct(q[0],q[0],xvals); 
	q[1] = (new Term(1,1,'x')).subtract(alphazero);
	for(var i=2; i <= power; i++) {
		var n = i-1;
		var alphan = innerProduct((new Term(1,1,'x')).multiply(q[n]),q[n],xvals)/innerProduct(q[n],q[n],xvals);
		var betan = innerProduct((new Term(1,1,'x')).multiply(q[n]),q[n-1],xvals)/innerProduct(q[n-1],q[n-1],xvals);
		q[i] = (new Term(1,1,'x')).multiply(q[n]).subtract(q[n].multiply(alphan)).subtract(q[n-1].multiply(betan));
	}
	for(var i=0; i < q.length; i++)  {
		q[i].simplify();
		q[i].sort();
	}
	return q;
};

/**
	Generate a function of least squares for given data points and given basis functions
	@param {Point[]} points A sorted array of points
	@param {Polynomial[]} bases The basis functions
	@return {Polynomial} The method of least square distance from all of the points
**/
Polynomial.prototype.leastSquare =  function(points, bases) {
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
	function innerProduct(fofx, gofx, xvalues) {
		var fgofx = fofx.multiply(gofx);
		var result = 0;
		for(var i = 0; i < xvalues.length; i++) {
			result += fgofx.resolve(xvalues[i]); 
		}
		return result;
	}
	var normalequations = [];
	var normalsums = [];
	var n = bases.length;
	for( var i =0; i < n; i++) {
		normalequations.push([]);
		for( var j = 0; j < n; j++) {
			var sum = innerProduct(bases[i],bases[j],points);
			normalequations[i][j] = sum;
		}
		normalsums.push(innerProduct(bases[i],new Term(1,1,'y'),points));
	}
	var normalmatrix = new Matrix(n,n,normalequations);
	var basisconstants = normalmatrix.scaledPartialPivotGaussian(Matrix.columnVector(normalsums));

	/*console.log(normalmatrix.toString());
	console.log(normalsums);
	console.log(Matrix.prototype.columnVector(normalsums).toString());
	console.log(basisconstants.toString());*/
	var result = bases[0].multiply(basisconstants.values[0][0]);
	for(var i =1; i < n; i++) {
		result = result.add(bases[i].multiply(basisconstants.values[i][0]));
	}
	result.sort();
	return result;
};

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
			if(i !== j)
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
		if(interpolated === undefined)
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
};

/**
	Returns the coefficient of the polynomial of the first term of degree n
	@param {integer} n 
	@return {double}
**/
Polynomial.prototype.degreeCoeff = function(n) {
	for(var i =0; i < this.terms.length; i++) {
		if(this.terms[i].degree() ===  n) {
			return this.terms[i].coefficient;
		}
	}
	return 0;
}
