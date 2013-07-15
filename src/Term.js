
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
