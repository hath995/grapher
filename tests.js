
test("Term.toString", function() {
	var testbasic = new Term(2,1,'x');
	var testzero = new Term(0,2,'x');
	var testone = new Term(1,0,'x');
	var testnegone = new Term(-1,0,'x');
	var testexponent = new Term(4,2,'x');
	var testconstant = new Term(5,0,'x');
	var testcoefficientone = new Term(1,1,'x');
	var testrationalcoeff = new Term(0.7345,4,'x');
	var testrationalpower = new Term(34,4.123,'x');
	var testrational = new Term(33.333,4.123,'x');

	equal(testbasic.toString(),"2x","test basic term with unit power");
	equal(testzero.toString(),"","test basic term with zero coefficient");
	equal(testone.toString(),"1","test basic term unit value");
	equal(testnegone.toString(),"-1","test basic term with negative one");
	equal(testexponent.toString(),"4x^2","test term with exponent");
	equal(testconstant.toString(),"5","test constant term");
	equal(testcoefficientone.toString(),"x","test term with unit coefficient");
	equal(testrationalcoeff.toString(),"0.7345x^4","test term with rational coefficient");
	equal(testrationalpower.toString(),"34x^4.123","term with  a rational power");
	equal(testrational.toString(),"33.333x^4.123","term with both a rational coefficient and power");

});


test("Term.add", function() {
	var x = new Term(1,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var d = new Term(2,0,'y');
	var poly = new Polynomial([x,c]);
	equal(x.add(x).toString(),"2x","Adding like terms");
	equal(x.add(c).toString(),"x+2","Adding a constant term");
	equal(x.add(5).toString(),"x+5","Adding a constant literal");
	equal(x.add(y).toString(),"x+y","Adding a term of a different variable");
	equal(x.add(poly).toString(),"2x+2","Adding a polynomial to a term");
	equal(c.add(d).toString(),"2+2","Adding a constant of a different variable to another.");
	//The above test looks wrong but in reality is fine because this situation is solved 
	//by the simplify method.
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("Term.subtract",function() {
	var x = new Term(1,1,'x');
	var twox = new Term(2,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var poly = new Polynomial([x,c]);
	equal(x.subtract(x).toString(),"","subtracting equal like terms");
	equal(x.subtract(twox).toString(),"-x","subtracting like terms");
	equal(x.subtract(twox).subtract(twox).toString(),"-3x","repeated subtracting like terms");
	equal(x.subtract(5).toString(),"x-5","subtracting a constant literal");
	equal(x.subtract(y).toString(),"x-y","subtracting a term of a different variable");
	equal(x.subtract(poly).toString(),"-2","Adding a term of a different variable");

	equal(x.toString(),"x","Testing x for side effects");
	equal(twox.toString(),"2x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});


test("Term.multiply", function() {
	var x = new Term(1,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var poly = new Polynomial([x,c]);
	equal(x.multiply(c).toString(),"2x","Multiplying by a constant term");
	equal(x.multiply(x).toString(),"x^2","Multiplying by x");
	equal(x.multiply(5).toString(),"5x","Multiplying by a constant literal");
	equal(x.multiply(poly).toString(),"x^2+2x","Multiplying by a polynomial");
	//equal(x.multiply(y).toString(),"xy"."Multiplying a term of a different variable"); //not yet implemented

	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("Term.divide", function() {

	var x = new Term(1,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var poly = new Polynomial([x,c]);

	equal(x.divide(c).toString(),"0.5x","Dividing by a constant term");
	equal(x.divide(x).toString(),"1","Dividing by x");
	equal(x.divide(5).toString(),"0.2x","Dividing by a constant literal");
	//equal(x.divide(poly).toString(),"x^2+2x","Dividing by a polynomial"); //not yet implemented
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("Term.resolve", function() {
	var zeroc = new Term(0,0,'x');
	var zerox = new Term(0,1,'x');
	var identity = new Term(1,1,'x');
	var xsquared = new Term(1,2,'x');
	var yfunction= new Term(3,3,'y');
	equal(zeroc.resolve(1),"0","Testing for zero constant");	
	equal(zerox.resolve(1),"0","Testing for zero function");	
	equal(identity.resolve(1),"1","Testing for identity function");	
	equal(xsquared.resolve(2),"4","Testing for xsquared function");	
	equal(yfunction.resolve(2),"24","Testing for yfunction");	
});

test("Polynomial.toString", function() {
	var x = new Term(1,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var polyx = new Polynomial([x]);
	var polyxc = new Polynomial([x,c]);
	var polyxyc = new Polynomial([x,y,c]);
	equal(polyx.toString(),"x","A monomial 'polynomial'");
	equal(polyxc.toString(),"x+2","A simple 'polynomial'");
	equal(polyxyc.toString(),"x+y+2","A multivariable 'polynomial'");
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
});

test("Polynomial.add", function() {
	var x = new Term(1,1,'x');
	var xsquared = new Term(3,2,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var polyx = new Polynomial([x]);
	var polyy = new Polynomial([y]);
	var polyc = new Polynomial([c]);
	var polyxc = new Polynomial([x,c]);
	var polyxyc = new Polynomial([x,y,c]);
	equal(polyx.add(polyx).toString(),"2x","Adding a monomial Polynomial to another monomial Polynomial");
	equal(polyx.add(polyy).toString(),"x+y","Adding a monomial Polynomial to a different variable monomial Polynomial");
	equal(polyx.add(polyc).toString(),"x+2","Adding a monomial Polynomial to another monomial Polynomial constant");

	equal(polyx.add(x).toString(),"2x","Adding a monomial Polynomial to a term");
	equal(x.add(polyx).toString(),"2x","Adding a monomial Polynomial to a term commutatively");
	equal(polyx.add(xsquared).toString(),"3x^2+x","Adding a monomial Polynomial to a higher power term");
	equal(polyx.add(y).toString(),"x+y","Adding a monomial Polynomial to term of a different variable");

	equal(x.toString(),"x","Testing x for side effects");
	equal(xsquared.toString(),"3x^2","Testing xsquared for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(polyxc.toString(),"x+2","Testing polyxc for side effects");
	equal(polyx.toString(),"x","Testing polyx for side effects");
	equal(polyy.toString(),"y","Testing polyy for side effects");
	equal(polyc.toString(),"2","Testing polyc for side effects");
	equal(polyxyc.toString(),"x+y+2","Testing polyxyc for side effects");
});

test("Polynomial.subtract", function() {
	var x = new Term(1,1,'x');
	var xsquared = new Term(3,2,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var polyx = new Polynomial([x]);
	var polyy = new Polynomial([y]);
	var polyc = new Polynomial([c]);
	var polyxc = new Polynomial([x,c]);
	var polyxyc = new Polynomial([x,y,c]);
	equal(polyx.subtract(polyx).toString(),"","Subtracting a monomial Polynomial to another monomial Polynomial");
	equal(polyx.subtract(polyy).toString(),"x-y","Subtracting a monomial Polynomial to a different variable monomial Polynomial");
	equal(polyx.subtract(polyc).toString(),"x-2","Subtracting a monomial Polynomial to another monomial Polynomial constant");

	equal(polyx.subtract(x).toString(),"","Subtracting a monomial Polynomial to a term");
	equal(polyx.subtract(xsquared).toString(),"-3x^2+x","Subtracting a monomial Polynomial to a higher power term");
	equal(polyx.subtract(y).toString(),"x-y","Subtracting a monomial Polynomial to term of a different variable");

	equal(x.toString(),"x","Testing x for side effects");
	equal(xsquared.toString(),"3x^2","Testing xsquared for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(polyxc.toString(),"x+2","Testing polyxc for side effects");
	equal(polyx.toString(),"x","Testing polyx for side effects");
	equal(polyy.toString(),"y","Testing polyy for side effects");
	equal(polyc.toString(),"2","Testing polyc for side effects");
	equal(polyxyc.toString(),"x+y+2","Testing polyxyc for side effects");
});

test("Polynomial.multiply", function() {
	var x = new Term(1,1,'x');
	var xsquared = new Term(3,2,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var polyx = new Polynomial([x]);
	var polyy = new Polynomial([y]);
	var polyc = new Polynomial([c]);
	var polyxc = new Polynomial([x,c]);
	var polyxyc = new Polynomial([x,y,c]);
	equal(polyx.multiply(polyx).toString(),"x^2","Multiplying a monomial Polynomial to another monomial Polynomial");
	//equal(polyx.multiply(polyy).toString(),"y+x","Multiplying a monomial Polynomial to a different variable monomial Polynomial");
	equal(polyx.multiply(polyc).toString(),"2x","Multiplying a monomial Polynomial to another monomial Polynomial constant");

	equal(polyx.multiply(x).toString(),"x^2","Multiplying a monomial Polynomial to a term");
	equal(polyx.multiply(xsquared).toString(),"3x^3","Multiplying a monomial Polynomial to a higher power term");
	//equal(polyx.multiply(y).toString(),"xy","Multiplying a monomial Polynomial to term of a different variable");

	equal(x.toString(),"x","Testing x for side effects");
	equal(xsquared.toString(),"3x^2","Testing xsquared for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(polyxc.toString(),"x+2","Testing polyxc for side effects");
	equal(polyx.toString(),"x","Testing polyx for side effects");
	equal(polyy.toString(),"y","Testing polyy for side effects");
	equal(polyc.toString(),"2","Testing polyc for side effects");
	equal(polyxyc.toString(),"x+y+2","Testing polyxyc for side effects");
});

test("Polynomial.divide", function() {
	var x = new Term(1,1,'x');
	var xsquared = new Term(3,2,'x');
	var c = new Term(2,0,'x');
	var polyx = new Polynomial([x]);
	var polyc = new Polynomial([c]);
	var polyxc = new Polynomial([x,c]);
	//equal(polyx.divide(polyx).toString(),"x^2","Dividing a monomial Polynomial to another monomial Polynomial");
	//equal(polyx.divide(polyc).toString(),"2x","Dividing a monomial Polynomial to another monomial Polynomial constant");

	equal(polyx.divide(x).toString(),"1","Dividing a monomial Polynomial to a term");
	equal(polyx.divide(xsquared).toString(),"0.3333333333333333x^-1","Dividing a monomial Polynomial to a higher power term");

	equal(x.toString(),"x","Testing x for side effects");
	equal(xsquared.toString(),"3x^2","Testing xsquared for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(polyxc.toString(),"x+2","Testing polyxc for side effects");
	equal(polyx.toString(),"x","Testing polyx for side effects");
	equal(polyc.toString(),"2","Testing polyc for side effects");
});

test("Polynomial.exponentiate", function() {
	var x = new Term(1,1,'x');
	var xpp = x.add(1);

	equal(xpp.exponentiate(2).toString(),"x^2+2x+1","Testing basic squaring");
	equal(xpp.exponentiate(3).toString(),"x^3+3x^2+3x+1","Testing basic cubing");
});

test("Polynomial.simplify", function() {

	var x = new Term(1,1,'x');
	var y = new Term(1,1,'y');
	var c = new Term(2,0,'x');
	var polyxyc = new Polynomial([x,y,c]);
	var fivex = new Polynomial([x,x,x,x,x]);
	var threey = new Polynomial([y,y,y]);
	var fivexthreey = new Polynomial([x,x,x,x,x,y,y,y]);
	var cminusc = new Polynomial([c,c.neg()]);

	var differentpowers = new Polynomial([x,x.exponentiate(2).multiply(3),x.exponentiate(3)]);
	differentpowers.simplify();
	equal(differentpowers.toString(),"x+3x^2+x^3","Testing for no simplification of different powers");	

	var differentpowerswithsum = new Polynomial([x,x,x.exponentiate(2).multiply(3),x.exponentiate(2),x.exponentiate(3)]);
	differentpowerswithsum.simplify();
	equal(differentpowerswithsum.toString(),"2x+4x^2+x^3","Testing simplification of different powers");	

	cminusc.simplify();
	equal(cminusc,"","Testing for zero");
	
	fivex.simplify();
	equal(fivex.toString(),"5x","Testing fivex for simplification");

	threey.simplify();
	equal(threey.toString(),"3y","Testing threey for simplification");

	polyxyc.simplify();	
	equal(polyxyc.toString(),"2+x+y","Testing polyxyc for simplification");
});

test("Polynomial.orthogonalPolynomials", function() {
	var simple = [0,1,2];
	var symm = [-2,-1,0,1,2];
	function stringizer(ary) {
		var res = "";
		for(var i =0; i< ary.length; i++)
		{
			res += ary[i].toString()+" ";
		}
		return "["+res+"]";
	}
	equal(stringizer(Polynomial.prototype.orthogonalPolynomials(symm,2)),"[1 x x^2-2 ]","A basic test generating orthogonal polynomials");
	equal(stringizer(Polynomial.prototype.orthogonalPolynomials(simple,1)),"[1 x-1 ]","Another basic test generating orthogonal polynomials");
});

test("PiecewiseFunction.createSecondDegSpline", function() {
	var Q = [new Point(0,8),new Point(1,12),new Point(3,2),new Point(4,6),new Point(8,0)];
	var Y = [new Point(0,8),new Point(1,6),new Point(3,5),new Point(4,3),new Point(6,2),new Point(8,0)];
	var Z = [new Point(-1,2),new Point(0,1),new Point(0.5,0),new Point(1,1),new Point(2,2),new Point(5/2.0,3)];
	equal(PiecewiseFunction.prototype.createSecondDegSpline(Z).toString(),"{f0(x)=-x^2-2x+1 on range: [-1,0), f1(x)=-2x+1 on range: [0,0.5), f2(x)=8x^2-10x+3 on range: [0.5,1), f3(x)=-5x^2+16x-10 on range: [1,2), f4(x)=12x^2-52x+58 on range: [2,2.5], }","Basic test of second degree spline.");
});

/*
test("Range", function() {
	var badinput = "3,4";
	var okayinput ="[0,1]";

//	throws(new Range(badinput),"Check for bad input");
});*/

test("Matrix.transpose", function() {
	var m = [[1,3,5],[2,4,6]];
	var ma = new Matrix(2,3,m);
	var mtranspose = [[1,2],[3,4],[5,6]];
	var mat = new Matrix(3,2,mtranspose);
	equal(ma.transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]","Checking transpose for equality");
	equal(mat.transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]","Checking double with intermediate step transpose for equality");
	equal(ma.transpose().transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]","Checking double transpose for equality");
	equal(mat.transpose().transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]","Checking double transpose for equality again");
});
/*
test("Matrix.naiveGaussian", function() {
	
});

test("Matrix.scaledPartialPivotGaussain", function() {
	
});

test("Matrix.LUdecomposition",function() {


});

test("Matrix.FloydWarshall",function() {
	var fwtest = [[0,Infinity,Infinity,Infinity,-1,Infinity],
		      [1,0,Infinity,2,Infinity,Infinity],
		      [Infinity,2,0,Infinity,Infinity,-8],
		      [-4,Infinity,Infinity,0,3,Infinity],
		      [Infinity,7,Infinity,Infinity,0,Infinity],
		      [Infinity,5,10,Infinity,Infinity,0]];
      var mm = new Matrix(6,6,fwtest);
	
});*/
