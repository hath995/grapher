import {Polynomial} from "./Polynomial";
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
export function reattachMethods(serialized,originalclass) {
	serialized.__proto__ = originalclass.prototype;
	if(!(serialized instanceof originalclass)) {
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
	@param {number} coefficient The coefficient of the term.
	@param {number|number[]} power The power of the variable in the term.
	@param {string|string[]} variable The name of the variable involved in the term
	@todo: convert all power and variable code to work with objects
		then implement the Term contructor to generate the correct structure using exiting code
		implement isMatchingVariable
		immplement isMathchingPowers
		fix the resolve functions to yield partial functions
**/
export class Term {
	coefficient: number;
	power: number[];
	variable: {[name: string]: number};
	serializeName?: string;
constructor(coefficient: number, power: number|number[], variable: string | string[] | {[name: string]: number})
{
	if(!(this instanceof Term)) {
		return new Term(coefficient, power, variable);
	}
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
static serializeName = 'Term';

/**
	Reattaches class methods to destringified object
	@param {Object} that A Term stripped of methods
	@static
**/
static fromWebWorker(that) {
	reattachMethods(that, Term);	
}

	/**
		Stringify the object but with additional property to help deserialization
		@return {Object} object to JSON stringify 
	**/
	toWebWorker() {
		this.serializeName = Term.serializeName;
		return this;
	}



	/**
		Compare two terms if they have matching variable sets
		@private 
		@param {Term} that The term being compared
		@return {boolean}
	**/
	isMatchingVariables(that: Term): boolean {
		var leftcontained = true;
		var rightcontained = true;
		if(Array.isArray(this.variable) && Array.isArray(that.variable)) {
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
		}else if(Array.isArray(this.variable) || Array.isArray(that.variable)) {
			return false;
		}else{
			return this.variable == that.variable;
		}
	}

	/**
		Compare if two terms have matching variables and powers
		@private
		@param {Term} that The term being compared
		@return {Boolean}
	**/
	isMatchingPowers(that: Term): boolean {
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
	}

	/**
		Returns the additive invese of the term
		@return {Term}  
	**/
	neg() {
		return new Term(0-this.coefficient,this.power,this.variable);
	}


	/**
		Adds a term,polynomial, or constant to an existing term
		@param {Term|Polynomial|number} summand The summad being added to the term
		@return {Term|Polynomial} The result of the summation

	**/
	add(summand: Term | Polynomial | number): Term | Polynomial {
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
			for(var k in this.variable) {
				break;
			}
			var constant = new Term(summand,0,k);
			var newpoly = new Polynomial([this,constant]);
			return newpoly; 
		}
		throw Error("incorrect summand type provided to Term.add");
	}

	/**
		Subtract a term, or constant from an existing term
		@param {Term|number} summand The summand being subtract from the term
		@return {Term|Polynomial} The result of the summation
	**/
	subtract(summand: Term | Polynomial | number): Term | Polynomial {
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
		throw Error("incorrect summand type provided to Term.subtract");
	}

	/**
		Multiply a term, Polynomial, or constant to an existing term
		@param {Term|Polynomial|number} multiplicand The multiplicand in the product
		@return {Term|Polynomial} The product
	**/
	multiply(multiplicand: Term|Polynomial|number): Term | Polynomial {
		var newcoef;
		var newpowers: number[] = [];
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
	}

	/**
		Divide a term by another term or a constant
		@param {Term|number} denominator The denominator of the divisor 
		@return {Term|Polynomial} The quotient 
	**/
	divide(denominator: Term | number): Term | Polynomial {
		if(denominator instanceof Term)
		{
			var newcoef = this.coefficient/denominator.coefficient;
			var newpowers: number[] = [];
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
		throw new Error("Incorrect denominator type provided to Term.divide");
	}

	/**
		Produce powers of a Term 
		@param {number} exponent the power to be raised by
		@return {Term} the power of the input
	**/
	exponentiate(exponent: number) {
		var newpowers: number[] = [];
		for(var i =0; i < this.power.length; i++ ) {
			newpowers[i] = this.power[i]*exponent;
		}
		return new Term(Math.pow(this.coefficient,exponent),newpowers,this.variable);

	}

	/**
		Generates a pretty printed version of the term.
		@return {String} Returns a string version of the term
	**/
	toString(): string { 
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
		
	}

	/**
		Generate a formated string representing a term.
		@return {String} Return the term in formatted string
	**/
	serialize() {
		var retstring =""+this.coefficient;
		for(var v in this.variable) {
			retstring += ""+v+"^"+this.power[this.variable[v]];
		}
		return retstring; 
	}

	/**
		@param {number|Object} value Evaluate the term for the value
		@return {number|Term} The result of the function
	**/
	resolve(value) {
		var isnomial = value instanceof Term || value instanceof Polynomial;
		if(this.power.length == 1 && typeof value == "number" ) {
			return this.coefficient * Math.pow(value, this.power[0]);
		}else if(this.power.length == 1 && isnomial) {
			return value.exponentiate(this.power[0]).multiply(this.coefficient);
		}else{
			if(isnomial) {
				throw new Error("Tuple expected.");
			}
			var result;
			var coefficient = this.coefficient;
			var remainingvars = {};
			for(var v in this.variable) {
				remainingvars[v] = 0;
			}
			for(var v in value) {
				if(this.variable.hasOwnProperty(v))
				{
					if(typeof value[v] === "number") {
						coefficient *= Math.pow(value[v],this.power[this.variable[v]]);
					}else{
						if(result) {

							result = result.multiply(value[v].exponentiate(this.power[this.variable[v]]));
						}else{
							result = value[v].exponentiate(this.power[this.variable[v]]);
						}
					}
				}
				
				delete remainingvars[v];
			}
			var varsleft = false;
			var remainingpowers: number[] = [];
			var rpcount = 0;
			for(var v in remainingvars) {
				varsleft = true;
				remainingpowers[rpcount] = this.power[this.variable[v]];
				remainingvars[v] = rpcount;
				rpcount++;
			}
			if(varsleft) {
				if(result) {	
					return result.multiply(new Term(coefficient,remainingpowers,remainingvars));
				}else{
					return new Term(coefficient,remainingpowers,remainingvars);
				}
			}else{
				if(result) {
					return result.multiply(coefficient);
				}else{
					return coefficient;
				}
			}
		}
	}

	/**
		This is an alternate constructor to initialize Term objects.
		This is meant to be used in conjunction witht the serialize() method
		@deprecated
		@param {String} sterm A string of the form ax^b where a,b are floats, and x is any variable 
	**/
	initTerm(sterm: string) {
		var termRe = /([-]*\d*(\.\d*)*)([a-zA-Z]+)\^([-]*\d+(\.\d*)*)+/;
		var termValues = termRe.exec(sterm);
		if(termValues) {
			this.coefficient = parseFloat(termValues[1]);
			this.power = parseFloat(termValues[4]);
			this.variable = termValues[3];
		}
		//returnv 
	}

	/**
		Returns the monomial's degree
	**/	
	degree(): number {
		var degree = 0;
		for(var i =0; i < this.power.length; i++) {
			degree += this.power[i];
		}
		return degree;
	}
};

/**
	A point object representing a point in a 2-d plane
	@class
**/
class Point {
	/**
	 * 
	 * @constructor
	 * @param {number} x The x value
	 * @param {number} y The y value
	 */
	x: number;
	y: number;
	constructor(x: number, y: number)
	{
		if(!(this instanceof Point)) {
			return new Point(x,y);
		}
			this.x = parseFloat(x);
			this.y = parseFloat(y);
	}


/**
	Helper method to sort point objects
	@static
	@param {Point} a The first point to compare
	@param {Point} b The second point to compare
	@return {integer} The comparison of the points
**/
static sorter(a: Point, b: Point) {
	if(a.x < b.x) {
		return -1;
	}else if(a.x > b.x) {
		return 1;
	}else{
		return 0;
	}

}

/**
	A method to convert a Point to a String
	@return {String} The point value in parens
**/
	toString()
	{
			return "("+this.x+","+this.y+")";	
	};
}

/**
	A method to calculate the integral of a function fofx from a to b using 2^n divisions
	@param {Polynomial|Term} fofx The function to be integrated
	@param {number} a The lower bound
	@param {number} b The upper bound
	@param {number} n The power of 2 used to partition the range  
**/
export function RombergExtrapolation(fofx, a,b,n)
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
	@param {number} a The lower bound
	@param {number} b The upper bound
	@param {number} n The number of divisions used to partition the range  
**/
export function TrapezoidRule(fofx, a, b, n)
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
	@param {number} a The lower bound
	@param {number} b The upper bound
**/
export function basicSimpsonsrule(fofx,a,b)
{
	var h=(b-a)/6;
	var sum =h*(fofx.resolve(a)+4*fofx.resolve((a+b)/2)+fofx.resolve(b));

	return sum;
}


export function bisection(fofx, a, b, depthmax, epsilon) 
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
