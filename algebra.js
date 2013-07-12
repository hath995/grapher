/**
	Polynomial interpolation demo
	@authors - Aaron R Elligsen
	UNIVERSITY OF OREGON
	MATH 351 - FALL 2012
**/
"use strict";
/**
	A pseudo-constructor which reatttaches methods to an object which has been 
	passed through JSON serialization
	@param {Object} serialized A 'class' object but without the attached methods
**/
function reattachMethods(serialized,originalclass) {
	if(serialized.hasOwnProperty("__proto__")) {
		serialized.__proto__ = originalclass.prototype;
	}else{
		for(var property in originalclass.prototype) {
			serialized[property] = originalclass.prototype[property];
		}
		serialized.constructor = originalclass;
	}
}

/**
	Constructor for a term of a polynomial
	@class
	@constructor
	@param {double} coefficient The coefficient of the term.
	@param {double|double[]} power The power of the variable in the term.
	@param {string|string[]} variable The name of the variable involved in the term
	@todo: convert all power and variable code to work with objects
		then implement the Term contructor to generate the correct structure using exiting code
		implement isMatchingVariable
		immplement isMathchingPowers
		fix the resolve functions to yield partial functions
**/
function Term(coefficient, power, variable)
{
	if(variable === undefined || power === undefined || coefficient === undefined) {
		throw new Error("Cofficient, power, and variable expected in parameters.");
	}
	this.coefficient = coefficient;
	if(power instanceof Array) {
		this.power = power;
	}else{
		this.power =[power];
	}

	if(variable instanceof Array)
	{
		var varobj = {};
		for(var i =0; i < variable.length; i++) {
			varobj[variable[i]] = i;
		}
		this.variable = varobj;
	}else if(typeof variable == "string") {
		this.variable ={};
		this.variable[variable] = 0;
	}else{
		this.variable = variable;
	}

}

/**
	A static constant to help with de/serialization
	@constant
	@static
**/
Term.serializeName = 'Term';

/**
	Stringify the object but with additional property to help deserialization
	@return {Object} object to JSON stringify 
**/
Term.prototype.toWebWorker = function() {
	this.serializeName = Term.serializeName;
	return this;
};

/**
	Reattaches class methods to destringified object
	@param {Object} that A Term stripped of methods
	@static
**/
Term.fromWebWorker = function(that) {
	reattachMethods(that,Term);	
};

/**
	Compare two terms if they have matching variable sets
	@private 
	@param {Term} that The term being compared
	@return {Boolean}
**/
Term.prototype.isMatchingVariables = function(that) {
	var leftcontained = true;
	var rightcontained = true;
	for(var v in this.variable) {
		if(that.variable[v] === undefined) {
			leftcontained = false;
		}
	}

	for(var v in that.variable) {
		if(this.variable[v] === undefined) {
			rightcontained = false;
		}
	}	
	return leftcontained && rightcontained;
};

/**
	Compare if two terms have matching variables and powers
	@private
	@param {Term} that The term being compared
	@return {Boolean}
**/
Term.prototype.isMatchingPowers = function(that) {
	var matching = true;
	if(this.power.length != that.power.length) {
		return false;
	}else{
		for(var v in this.variable) {
			if(this.power[this.variable[v]] != that.power[that.variable[v]]) {
				matching = false;
			}
		}
	}
	return matching;
};

/**
	Returns the additive invese of the term
	@return {Term}  
**/
Term.prototype.neg = function() {
	return new Term(0-this.coefficient,this.power,this.variable);
};


/**
	Adds a term,polynomial, or constant to an existing term
	@param {Term|Polynomial|double} summand The summad being added to the term
	@return {Term|Polynomial} The result of the summation

**/
Term.prototype.add = function(summand) {
	if(summand instanceof Term)
	{
		if(this.isMatchingVariables(summand) )
		{
			if(this.isMatchingPowers(summand) )
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
		var constant = new Term(summand,0,'x');
		var newpoly = new Polynomial([this,constant]);
		return newpoly; 
	}
};

/**
	Subtract a term, or constant from an existing term
	@param {Term|double} summand The summand being subtract from the term
	@return {Term|Polynomial} The result of the summation
**/
Term.prototype.subtract = function(summand) {
	if(summand instanceof Term)
	{
		return this.add(summand.neg());
	}else if(summand instanceof Polynomial) {
		var newpoly = summand.terms.slice();
		for(var i=0; i< newpoly.length; i++) {
			newpoly[i] = newpoly[i].neg();
		}
		var difference = new Polynomial(newpoly);
		return difference.add(this);
	}else if(typeof summand === "number") {
		var constant = new Term(0-summand,0,'x');
		return new Polynomial([this,constant]);
	}
};

/**
	Multiply a term, Polynomial, or constant to an existing term
	@param {Term|Polynomial|double} multiplicand The multiplicand in the product
	@return {Term|Polynomial} The product
**/
Term.prototype.multiply = function(multiplicand) {
	var newcoef;
	var newpowers = [];
	var newvars = {};
	if(multiplicand instanceof Term)
	{
		newcoef = this.coefficient*multiplicand.coefficient;
		var varcount = 0;
		for(var v in this.variable) {
			//if(newvars[v] == undefined) {
				newvars[v] = varcount;
				newpowers[varcount] = this.power[this.variable[v]];
				varcount++;
			//}
		}
		for(var v in multiplicand.variable) {
			if(newvars[v] === undefined) {
				newvars[v] = varcount;
				newpowers[varcount] = multiplicand.power[multiplicand.variable[v]];
				varcount++;
			}else{
				newpowers[newvars[v]] += multiplicand.power[multiplicand.variable[v]];
			}
		}
				
		
	}else if(multiplicand instanceof Polynomial) {
		return multiplicand.multiply(this);
	}else if(typeof multiplicand === "number") {
		
			newcoef = this.coefficient*multiplicand;
			newvars = this.variable;
			newpowers = this.power.slice();
	}
	var tempterm = new Term(newcoef,newpowers,newvars);
	return tempterm;
};

/**
	Divide a term by another term or a constant
	@param {Term|double} denominator The denominator of the divisor 
	@return {Term|Polynomial} The quotient 
**/
Term.prototype.divide = function(denominator) {
	if(denominator instanceof Term)
	{
		var newcoef = this.coefficient/denominator.coefficient;
		var newpowers = [];
		var newvars = {};
		var varcount = 0;
		for(var v in this.variable) {
			//if(newvars[v] == undefined) {
				newvars[v] = varcount;
				newpowers[varcount] = this.power[this.variable[v]];
				varcount++;
			//}
		}
		for(var v in denominator.variable) {
			if(newvars[v] === undefined) {
				newvars[v] = varcount;
				newpowers[varcount] = 0-denominator.power[denominator.variable[v]];
				varcount++;
			}else{
				newpowers[newvars[v]] -= denominator.power[denominator.variable[v]];
			}
		}
		var tempterm = new Term(newcoef,newpowers,newvars);
		return tempterm;
	}else if(typeof denominator === "number") {
		
			var tempterm = new Term(this.coefficient/denominator,this.power,this.variable);
			return tempterm;
	}
};

/**
	Produce powers of a Term 
	@param {Integer} exponent the power to be raised by
	@return {Term} the power of the input
**/
Term.prototype.exponentiate = function(exponent) {
	var newpowers = [];
	for(var i =0; i < this.power.length; i++ ) {
		newpowers[i] = this.power[i]*exponent;
	}
	return new Term(Math.pow(this.coefficient,exponent),newpowers,this.variable);

};

/**
	Generates a pretty printed version of the term.
	@return {String} Returns a string version of the term
**/
Term.prototype.toString = function () { 
	var retstring ="";
	if(this.coefficient === 0)
	{
		return "";
	}else if(this.coefficient === -1) {
		retstring += '-';
	}else if(this.coefficient !== 1) {
		retstring += this.coefficient;
	}

	var isconstant = true;
	for(var i=0; i < this.power.length; i++) {
		if(this.power[i] !== 0) {
			isconstant = false;
		}
	}
	if(isconstant) {
		if(this.coefficient === 1 )
		{
			retstring += this.coefficient;
		} 
		if(this.coefficient === -1) {
			retstring += 1;
		}
	}
	var trouble; //hackery here to remove extraneous *'s from the toString
	for(var v in this.variable) {
		trouble = false;
		var thepower = this.power[this.variable[v]]; 
		if(thepower !== 0) 
		{
			if(thepower === 1)
			{

				//retstring += this.variable
				retstring += v; 
			}else{
				retstring += v; 
				retstring +="^"+thepower+"*";
				trouble = true;
			}
		}
	}
	if(trouble) {
		retstring = retstring.slice(0,-1);
	}
	return retstring;
	
};

/**
	Generate a formated string representing a term.
	@return {String} Return the term in formatted string
**/
Term.prototype.serialize = function() {
	var retstring =""+this.coefficient;
	for(var v in this.variable) {
		retstring += ""+v+"^"+this.power[this.variable[v]];
	}
	return retstring; 
};

/**
	@param {double|Object} value Evaluate the term for the value
	@return {double|Term} The result of the function
**/
Term.prototype.resolve = function(value) {
	if(this.power.length == 1 && typeof value == "number" ) {
		return this.coefficient * Math.pow(value,this.power);
	}else{
		if(typeof value == "number") {
			throw new Error("Tuple expected.");
		}
		var result = this.coefficient;
		var remainingvars = {};
		for(var v in this.variable) {
			remainingvars[v] = 0;
		}
		for(var v in value) {
			if(this.variable.hasOwnProperty(v))
			{
				result *= Math.pow(value[v],this.power[this.variable[v]]);
			}
			
			delete remainingvars[v];
		}
		var varsleft = false;
		var remainingpowers = [];
		var rpcount = 0;
		for(var v in remainingvars) {
			varsleft = true;
			remainingpowers[rpcount] = this.power[this.variable[v]];
			remainingvars[v] = rpcount;
			rpcount++;
		}
		if(varsleft) {
			
			return new Term(result,remainingpowers,remainingvars);
		}else{
			return result;
		}
	}
};

/**
	This is an alternate constructor to initialize Term objects.
	This is meant to be used in conjunction witht the serialize() method
	@deprecated
	@param {String} sterm A string of the form ax^b where a,b are floats, and x is any variable 
**/
Term.prototype.initTerm = function(sterm) {
	var termRe = /([-]*\d*(\.\d*)*)([a-zA-Z]+)\^([-]*\d+(\.\d*)*)+/;
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
	Evaluates the polynomial for value value
	@param {double} value The value to be applied to the function/polynomial
	@return {double} the result 
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
};

/**
	Due to the implmentation of some of the mathematical operations they generate
	unsimplified polynomials. This corrects that.
**/
/*Polynomial.prototype.simplify = function() {
	var  powers = {};
	var  constants = 0;
	for(var i =0; i < this.terms.length; i++) //for every term
	{
		var v = this.terms[i].variable;
		if(powers[v] === undefined) //create hash bucket for variables
		{
			powers[v] = {};
		}
		var p = ""+this.terms[i].power;
		if(p == "0") //create has bucket for powers
		{
			constants += this.terms[i].coefficient;	
		}else if(powers[v][p] === undefined) { //put term in bucket
			powers[v][p] = this.terms[i];
		}else{ //add together if matching
			powers[v][p] = this.terms[i].add(powers[v][p]);
		}
	}
	var oldterms = this.terms.slice();
	this.terms = [];
	if(constants != 0) {
		var constantvariable = oldterms[0].variable;	
		this.terms.push(new Term(constants,0,constantvariable));
	}
	for(var variable in powers) 
	{
		for(var power in powers[variable]) 
		{
			if(powers[variable][power].coefficient != 0) {
				this.terms.push(powers[variable][power]);
			}
		}
	}
}*/
Polynomial.prototype.simplify = function() {
	var  powers = {}; 
	var  constants = 0;
	for(var i =0; i < this.terms.length; i++) //for every term
	{
		var termvarsobj = this.terms[i].variable;
		var termvarsordering = [];
		for(var v in termvarsobj) {
			termvarsordering.push(v);
		}
		termvarsordering.sort();
		var varnames = termvarsordering.join('_');
		if(!powers.hasOwnProperty(varnames)) //create hash bucket for variables
		{
			powers[varnames] = {}; 
		}
		var sortedpower = [];
		var allzeroes = true;
		for(var v in termvarsordering) {
			var sp = this.terms[i].power[this.terms[i].variable[termvarsordering[v]]];
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
	var basisconstants = normalmatrix.scaledPartialPivotGaussian(Matrix.prototype.columnVector(normalsums));

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
	A Class which serves to represent mathematical ranges
	@class
	@constructor
	@param {String} rangestring Anything of the standard mathematical forms
	[x,y],(x,y],[x,y),(x,y) where x,y in reals and square brackets are inclusive
	and parens are exclusive 
**/
function Range(rangestring) {
	/**
		Private helper function to parse the range string
		@private
		@param {Range} The object being initialized
		@param {String} The range as a string to be parsed on initalized for
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
Range.serializeName = "Range";	

/**
	A method to help with serializing and passing to web worker
**/
Range.prototype.toWebWorker = function() {
	this.serializeName = Range.serializeName;
};

/**
	Reattach methods after being passed to web worker
	@param {Object} that A Range stripped of methods
**/
Range.fromWebWorker = function(that) {
	reattachMethods(that,Range);
};

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
			
}; 

/**
	Creates a string representation
	@return {string} 
**/
Range.prototype.toString = function() {
	return this.def;
};

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

	
}

/**
	Applies the function on the value and returns the result
	@param {Double} value The value to be used in the function
	@return {Double} The result
	@todo Perhaps inplement a binary search for the correct range
**/
PiecewiseFunction.prototype.resolve = function(value) {
	for(var i =0; i < this.ranges.length; i++) 
	{
		if(this.ranges[i].inRange(value)) {
			return this.functs[i].resolve(value);
		}
	}
};

/**
	Creates a simple string representation of the piecewise function
	@return {string} The string representation
**/
PiecewiseFunction.prototype.toString = function() {
	var output = "{";
	for(var i=0; i < this.functs.length; i++) {
		this.functs[i].sort();
		output += "f"+i+"(x)="+this.functs[i]+" on range: "+this.ranges[i]+", ";	
	}
	return output+"}";
};
/**
	A static constant to help with de/serialization
	@constant
	@static
**/
PiecewiseFunction.serializeName = "PiecewiseFunction";

/**
	Prepares an Object ready to be passed to a web worker	
	@return {Object}
**/
PiecewiseFunction.prototype.toWebWorker = function() {
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
};

/**
	Reconstitutes a PiecewiseFunction object and its data members after passed to web worker
	@static
	@param {Object} that A PiecewiseFunction strippd of its methods
**/
PiecewiseFunction.fromWebWorker = function(that) {
	reattachMethods(that, PiecewiseFunction);
	for(var i=0; i < that.ranges.length; i++)
	{
		Range.fromWebWorker(that.ranges[i]);
	}
	var fromHelper = {}; //Probably should centralize this somewhere...
	fromHelper[Term.serializeName] = Term.fromWebWorker;
	fromHelper[Polynomial.serializeName] = Polynomial.fromWebWorker;
	fromHelper[PiecewiseFunction.serializeName] = PiecewiseFunction.fromWebWorker; //MADNESS, but legal
	for(var j = 0; j < that.functs.length; j++) 
	{
		fromHelper[that.functs[j].serializeName](that.functs[j]);
	}
};

/**
	Given a list of points generates a piece-wise spline function of the first degree.
	@param {Point[]} points An array of point objects sorted by x-value
	@return {PiecewiseFunction} The linear spline interpolation
	@example	
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
};

/**
	Given a list of points generates a piece-wise spline function of the second degree.
	@param {Point[]} points An array of point objects sorted by x-value
	@param {Double} zzero 0 by default, otherwise the slope of the second derivative of the initial function 
	@return {PiecewiseFunction} The quadratic spline interpolation
	@example	
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
	if(zzero !== undefined)
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
};

/**
	Creates a Natural Cubic Spline given a series of points
	@author Sahil Diwan
	@param {Point[]} points An array of points to interpolate
	@return {PiecewiseFunction} A piecewise function using polynomials of degree three
	IMPLEMENTED algorithm on page 392
**/
PiecewiseFunction.prototype.createThirdDegSpline = function(points) {
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
	var h = [];
	var b = [];
	for(var i = 0; i < sortedpoints.length - 1; i++) {
		h[i] = sortedpoints[i + 1].x - sortedpoints[i].x;
		b[i] = ((sortedpoints[i + 1].y - sortedpoints[i].y)/h[i]);
	}
	var u = [];
	var v = [];
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

	var functionarray = [];
	var rangearray = [];

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
};

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
