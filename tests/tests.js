"use strict";
test("SM.Term.isMatchingVariables", function() {
	var testbasic = new SM.Term(2,1,'x');
	var testzero = new SM.Term(0,2,'x');
	var testy = new SM.Term(-1,0,'y');
	var testysq = new SM.Term(4,2,'y');
	var testmulti = new SM.Term(5,[0,2],['x','y']);
	
	equal(testbasic.isMatchingVariables(testzero),true,"Testing simple single variable terms");
	equal(testbasic.isMatchingVariables(testy),false,"Testing simple single different variable terms");
	equal(testbasic.isMatchingVariables(testmulti),false,"Testing single variable to multi-different variable term");
	equal(testmulti.isMatchingVariables(testmulti),true,"Testing multi-different variable term");
});

test("SM.Term.isMatchingPowers", function() {
	var testbasic = new SM.Term(2,1,'x');
	var testzero = new SM.Term(0,2,'x');
	var testy = new SM.Term(-1,0,'y');
	var testysq = new SM.Term(4,2,'y');
	var testmulti = new SM.Term(5,[0,2],['x','y']);
	var testmulti2 = new SM.Term(2,[1,3],['x','y']);
	equal(testbasic.isMatchingPowers(testbasic),true,"Test of identical terms");
	equal(testbasic.isMatchingPowers(testzero),false,"Test of unequal power terms");
	equal(testmulti.isMatchingPowers(testmulti),true,"Test of multiple identical terms");
	equal(testmulti.isMatchingPowers(testmulti2),false,"Test of multiple different power terms");

});

test("SM.Term.toString", function() {
	var testbasic = new SM.Term(2,1,'x');
	var testzero = new SM.Term(0,2,'x');
	var testone = new SM.Term(1,0,'x');
	var testnegone = new SM.Term(-1,0,'x');
	var testexponent = new SM.Term(4,2,'x');
	var testconstant = new SM.Term(5,0,'x');
	var testcoefficientone = new SM.Term(1,1,'x');
	var testrationalcoeff = new SM.Term(0.7345,4,'x');
	var testrationalpower = new SM.Term(34,4.123,'x');
	var testrational = new SM.Term(33.333,4.123,'x');

	var testmultibasic = new SM.Term(2,[1,2],['x','y']);
	var testmulti = new SM.Term(2,[2,2],['x','y']);
	var multione = new SM.Term(1,[0,0],['x','y']);
	var multinegone = new SM.Term(-1,[0,0],['x','y']);
	var multineg = new SM.Term(-1,[1,0],['x','y']);
	var multineg2 = new SM.Term(-41,[1,0],['x','y']);
	
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

	equal(testmultibasic.toString(),"2xy^2","test basic multivaribale term ");
	equal(testmulti.toString(),"2x^2*y^2","test multivaribale term ");
	equal(multione.toString(),"1","test multivariable term unit value");
	equal(multinegone.toString(),"-1","test multivariable term with negative one");
	equal(multineg.toString(),"-x","test multivariable term with negative one and zero power ending var");
	equal(multineg2.toString(),"-41x","test multivariable term with negative fourty one and zero power ending var");

});

test("SM.Polynomial.simplify", function() {

	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var m1 = new SM.Term(4,[1,1],['x','y']);
	var m2 = new SM.Term(4,[2,2],['x','z']);
	var polyxyc = new SM.Polynomial([x,y,c]);
	var fivex = new SM.Polynomial([x,x,x,x,x]);
	var threey = new SM.Polynomial([y,y,y]);
	var fivexthreey = new SM.Polynomial([x,x,x,x,x,y,y,y]);
	var cminusc = new SM.Polynomial([c,c.neg()]);

	var differentpowers = new SM.Polynomial([x,x.exponentiate(2).multiply(3),x.exponentiate(3)]);
	differentpowers.simplify();
	equal(differentpowers.toString(),"x+3x^2+x^3","Testing for no simplification of different powers");	

	var differentpowerswithsum = new SM.Polynomial([x,x,x.exponentiate(2).multiply(3),x.exponentiate(2),x.exponentiate(3)]);
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
	
	var mpoly = new SM.Polynomial([x,m1,m1.multiply(2)]);
	mpoly.simplify()
	equal(mpoly,"x+12xy","Test a simple multivariable polynomial");

	var mpoly2 = new SM.Polynomial([x,m1,m2.multiply(2)]);
	mpoly2.simplify()
	equal(mpoly2,"x+4xy+8x^2*z^2","Test a  multivariable polynomial");
	
	var mpoly3 = new SM.Polynomial([m2,m2.neg()]);
	mpoly3.simplify()
	equal(mpoly3,"","Test a zeroed multivariable polynomial");

	var t = (new SM.Term(4,1,'t')).add(new SM.Term(4,0,'t'));
	var rr = new SM.Term(2,1,'x');
	var composed = rr.resolve({"x":t}).add(new SM.Term(4,0,'x'));
	equal(composed.toString(),"8t+12","Testing simplification of different variables");

	
});

test("SM.Term.add", function() {
	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var d = new SM.Term(2,0,'y');
	var poly = new SM.Polynomial([x,c]);
	var multi = new SM.Term(3,[1,1],['x','y']);
	equal(x.add(x).toString(),"2x","Adding like terms");
	equal(x.add(c).toString(),"x+2","Adding a constant term");
	equal(x.add(5).toString(),"x+5","Adding a constant literal");
	equal(x.add(y).toString(),"x+y","Adding a term of a different variable");
	equal(x.add(poly).toString(),"2x+2","Adding a polynomial to a term");
	equal(c.add(d).toString(),"2+2","Adding a constant of a different variable to another.");

	equal(multi.add(d),"3xy+2","Testing a multvariable term by adding a constant");
	equal(multi.add(2).toString(),"3xy+2","Testing a multvariable term by adding a constant literal");
	equal(multi.add(multi),"6xy","Testing a multvariable term by adding to itself");
	//The above test looks wrong but in reality is fine because this situation is solved 
	//by the simplify method.
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("SM.Term.subtract",function() {
	var x = new SM.Term(1,1,'x');
	var twox = new SM.Term(2,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var poly = new SM.Polynomial([x,c]);
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


test("SM.Term.multiply", function() {
	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var poly = new SM.Polynomial([x,c]);
	
	var multi = new SM.Term(5,[1,2],['x','y']);
	equal(x.multiply(c).toString(),"2x","Multiplying by a constant term");
	equal(x.multiply(x).toString(),"x^2","Multiplying by x");
	equal(x.multiply(5).toString(),"5x","Multiplying by a constant literal");
	equal(x.multiply(poly).toString(),"x^2+2x","Multiplying by a polynomial");
	equal(x.multiply(y).toString(),"xy","Multiplying a term of a different variable"); 
	equal(x.multiply(multi).toString(),"5x^2*y^2","Multiplying a multiterm of a different variable"); 
	equal(y.multiply(multi).toString(),"5y^3*x","Multiplying a multiterm of a different variable"); 

	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("SM.Term.divide", function() {

	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var poly = new SM.Polynomial([x,c]);

	equal(x.divide(c).toString(),"0.5x","Dividing by a constant term");
	equal(x.divide(x).toString(),"1","Dividing by x");
	equal(x.divide(5).toString(),"0.2x","Dividing by a constant literal");
	//equal(x.divide(poly).toString(),"x^2+2x","Dividing by a polynomial"); //not yet implemented
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(poly.toString(),"x+2","Testing poly for side effects");
});

test("SM.Term.exponentiate", function() {
	var x = new SM.Term(2,1,'x');
	var multi = new SM.Term(3,[1,2],['x','y']);
	
	equal(x.exponentiate(3).toString(),"8x^3","Testing single variable term");
	equal(multi.exponentiate(3).toString(),"27x^3*y^6","Testing single variable term");
});
test("SM.Term.resolve", function() {
	var zeroc = new SM.Term(0,0,'x');
	var zerox = new SM.Term(0,1,'x');
	var identity = new SM.Term(1,1,'x');
	var xsquared = new SM.Term(1,2,'x');
	var yfunction= new SM.Term(3,3,'y');
	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var poly = new SM.Polynomial([x,c]);

	var multi = new SM.Term(3,[1,1,2],['x','y','z']);
	equal(zeroc.resolve(1),"0","Testing for zero constant");	
	equal(zerox.resolve(1),"0","Testing for zero function");	
	equal(identity.resolve(1),"1","Testing for identity function");	
	equal(xsquared.resolve(2),"4","Testing for xsquared function");	
	equal(yfunction.resolve(2),"24","Testing for yfunction");	

	equal(yfunction.resolve({'x':2,'y':3,'z':2}),"81","Testing for over specification of yfunction");	
	equal(yfunction.resolve({'x':2,'z':2}).toString(),"3y^3","Testing for under specification of yfunction");	
	equal(multi.resolve({'x':2,'y':3,'z':2}).toString(),"72","Testing resolve for multivariable term");	
	equal(multi.resolve({'y':3,'z':2}).toString(),"36x","Testing resolve for multivariable term");	

	//test function composition
	equal(yfunction.resolve(identity).toString(),"3x^3","Testing single variable function composition");
	equal(xsquared.resolve(poly).toString(),"x^2+4x+4","Testing single variable term with polynomial");

	equal(yfunction.resolve({'y':identity}).toString(),"3x^3","Testing single variable function composition with named attributes.");
	equal(multi.resolve({'y':poly}).toString(),"3x^2*z^2+6xz^2","Testing multivariable partial application and composition");
	equal(multi.resolve({'y':x,'x':x,'z':x}).toString(),"3x^4","Testing multivariable composition");

});

test("SM.Polynomial.toString", function() {
	var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var multi = new SM.Term(2,[1,2],['x','y']);
	var polyx = new SM.Polynomial([x]);
	var polyxc = new SM.Polynomial([x,c]);
	var polyxyc = new SM.Polynomial([x,y,c]);
	var multipoly = new SM.Polynomial([x,y,c,multi]);
	equal(polyx.toString(),"x","A monomial 'polynomial'");
	equal(polyxc.toString(),"x+2","A simple 'polynomial'");
	equal(polyxyc.toString(),"x+y+2","A multivariable 'polynomial'");
	equal(multipoly.toString(),"x+y+2+2xy^2","A multivariable 'polynomial' with multivariable term");
	equal(x.toString(),"x","Testing x for side effects");
	equal(y.toString(),"y","Testing y for side effects");
	equal(c.toString(),"2","Testing c for side effects");
});


test("SM.Polynomial.resolve", function() {
var x = new SM.Term(1,1,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var multi = new SM.Term(2,[1,2],['x','y']);
	var polyx = new SM.Polynomial([x]);
	var polyxc = new SM.Polynomial([x,c]);
	var polyxyc = new SM.Polynomial([x,y,c]);
	var multipoly = new SM.Polynomial([x,y,c,multi]);

	var xcube = new SM.Polynomial([new SM.Term(3,[2],'x'),
		new SM.Term(4,[1],'x'),
		new SM.Term(5,[0],'x')]);
	var t = new SM.Polynomial([new SM.Term(2,1,'t'),new SM.Term(-1,0,'t')]);
	
	equal(polyx.resolve(2),"2","Test simple polynomial");
	equal(polyxc.resolve(2),"4","Test a polynomial with a constant");
	equal(polyxyc.resolve({'x':3,'y':4}),"9","Testing a multivariable polynomial");
	equal(multipoly.resolve({'x':3,'y':4}),"105","Testing a multivariable polynomial with multivariable terms");
	equal(multipoly.resolve({'y':4}).toString(),"33x+6","Testing partial function applications");
	equal(multipoly.resolve({'y':polyxc}).toString(),"2x^3+8x^2+10x+4","Testing polynomial function composition");
	equal(xcube.resolve({'x':t}).toString(),"12t^2-4t+4","Testing polynomial function composition change of variable");
	equal(polyxc.resolve({'x':t}).toString(),"2t+1","Testing polynomial function composition change of variable");
	//-0.125x^2+2x-4
	var xarg = new SM.Polynomial([new SM.Term(-0.125,2,'x'),new SM.Term(2,1,'x'),new SM.Term(4,0,'x')]);
	var xar = new SM.Polynomial([new SM.Term(-0.125,2,'x'),new SM.Term(2,1,'x')]);
	var tpain = new SM.Polynomial([new SM.Term(4,1,'t'),new SM.Term(4,0,'t')]);
	equal(xar.resolve({'x':tpain}).toString(),"-2t^2+4t+6","Testing polynomial function composition dual constants");
	equal(xarg.resolve({'x':tpain}).toString(),"-2t^2+4t+10","Testing polynomial function composition dual constants");
	//simplify side-effect?
	var test = xarg.resolve({'x':tpain});
	test.simplify();
	test.sort();
	equal(test.toString(),"-2t^2+4t+10","Testing polynomial function simplify");

});

test("SM.Polynomial.add", function() {
	var x = new SM.Term(1,1,'x');
	var xsquared = new SM.Term(3,2,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var multi = new SM.Term(2,[1,2],['x','y']);
	var polyx = new SM.Polynomial([x]);
	var polyy = new SM.Polynomial([y]);
	var polyc = new SM.Polynomial([c]);
	var polyxc = new SM.Polynomial([x,c]);
	var polyxyc = new SM.Polynomial([x,y,c]);
	var multipoly = new SM.Polynomial([x,y,c,multi]);
	equal(polyx.add(polyx).toString(),"2x","Adding a monomial SM.Polynomial to another monomial SM.Polynomial");
	equal(polyx.add(polyy).toString(),"x+y","Adding a monomial SM.Polynomial to a different variable monomial SM.Polynomial");
	equal(polyx.add(polyc).toString(),"x+2","Adding a monomial SM.Polynomial to another monomial SM.Polynomial constant");

	equal(polyx.add(x).toString(),"2x","Adding a monomial SM.Polynomial to a term");
	equal(x.add(polyx).toString(),"2x","Adding a monomial SM.Polynomial to a term commutatively");
	equal(polyx.add(xsquared).toString(),"3x^2+x","Adding a monomial SM.Polynomial to a higher power term");
	equal(polyx.add(y).toString(),"x+y","Adding a monomial SM.Polynomial to term of a different variable");
	equal(multipoly.add(y).toString(),"2xy^2+x+2y+2","Adding a term to a polynomial of different variables");
	equal(multipoly.add(2).toString(),"4+x+y+2xy^2","Adding a constant to a polynomial of different variable");
	equal(multipoly.add(polyxyc).toString(),"2xy^2+2x+2y+4","Adding a polynomial to a polynomial of different variable");
	equal(multipoly.add(polyxyc).toString(),"2xy^2+2x+2y+4","Adding a polynomial to a polynomial of different variable");

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

test("SM.Polynomial.subtract", function() {
	var x = new SM.Term(1,1,'x');
	var xsquared = new SM.Term(3,2,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var multi = new SM.Term(2,[1,2],['x','y']);
	var polyx = new SM.Polynomial([x]);
	var polyy = new SM.Polynomial([y]);
	var polyc = new SM.Polynomial([c]);
	var polyxc = new SM.Polynomial([x,c]);
	var polyxyc = new SM.Polynomial([x,y,c]);
	var multipoly = new SM.Polynomial([x,y,c,multi]);

	equal(polyx.subtract(polyx).toString(),"","Subtracting a monomial SM.Polynomial to another monomial SM.Polynomial");
	equal(polyx.subtract(polyy).toString(),"x-y","Subtracting a monomial SM.Polynomial to a different variable monomial SM.Polynomial");
	equal(polyx.subtract(polyc).toString(),"x-2","Subtracting a monomial SM.Polynomial to another monomial SM.Polynomial constant");

	equal(polyx.subtract(x).toString(),"","Subtracting a monomial SM.Polynomial to a term");
	equal(polyx.subtract(xsquared).toString(),"-3x^2+x","Subtracting a monomial SM.Polynomial to a higher power term");
	equal(polyx.subtract(y).toString(),"x-y","Subtracting a monomial SM.Polynomial to term of a different variable");
	equal(multipoly.subtract(y).toString(),"2xy^2+x+2","subtracting a term to a polynomial of different variables");
	equal(multipoly.subtract(2).toString(),"x+y+2xy^2","subtracting a constant to a polynomial of different variable");
	equal(multipoly.subtract(polyxyc).toString(),"2xy^2","subtracting a polynomial to a polynomial of different variable");


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

test("SM.Polynomial.multiply", function() {
	var x = new SM.Term(1,1,'x');
	var xsquared = new SM.Term(3,2,'x');
	var y = new SM.Term(1,1,'y');
	var c = new SM.Term(2,0,'x');
	var polyx = new SM.Polynomial([x]);
	var polyy = new SM.Polynomial([y]);
	var polyc = new SM.Polynomial([c]);
	var polyxc = new SM.Polynomial([x,c]);
	var polyxyc = new SM.Polynomial([x,y,c]);
	equal(polyx.multiply(polyx).toString(),"x^2","Multiplying a monomial SM.Polynomial to another monomial SM.Polynomial");
	//equal(polyx.multiply(polyy).toString(),"y+x","Multiplying a monomial SM.Polynomial to a different variable monomial SM.Polynomial");
	equal(polyx.multiply(polyc).toString(),"2x","Multiplying a monomial SM.Polynomial to another monomial SM.Polynomial constant");

	equal(polyx.multiply(x).toString(),"x^2","Multiplying a monomial SM.Polynomial to a term");
	equal(polyx.multiply(xsquared).toString(),"3x^3","Multiplying a monomial SM.Polynomial to a higher power term");
	equal(polyx.multiply(y).toString(),"xy","Multiplying a monomial SM.Polynomial to term of a different variable");
	equal(polyx.multiply(y.multiply(x)).multiply(3).toString(),"3x^2*y","Multiplying a monomial SM.Polynomial to term of a different variable");

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

test("SM.Polynomial.divide", function() {
	var x = new SM.Term(1,1,'x');
	var xsquared = new SM.Term(3,2,'x');
	var c = new SM.Term(2,0,'x');
	var polyx = new SM.Polynomial([x]);
	var polyc = new SM.Polynomial([c]);
	var polyxc = new SM.Polynomial([x,c]);
	//equal(polyx.divide(polyx).toString(),"1","Dividing a monomial SM.Polynomial to another monomial SM.Polynomial");
	//equal(polyx.divide(polyc).toString(),"2x","Dividing a monomial SM.Polynomial to another monomial SM.Polynomial constant");

	equal(polyx.divide(x).toString(),"1","Dividing a monomial SM.Polynomial to a term");
	equal(polyx.divide(xsquared).toString(),"0.3333333333333333x^-1","Dividing a monomial SM.Polynomial to a higher power term");

	equal(x.toString(),"x","Testing x for side effects");
	equal(xsquared.toString(),"3x^2","Testing xsquared for side effects");
	equal(c.toString(),"2","Testing c for side effects");
	equal(polyxc.toString(),"x+2","Testing polyxc for side effects");
	equal(polyx.toString(),"x","Testing polyx for side effects");
	equal(polyc.toString(),"2","Testing polyc for side effects");
	
	equal(polyx.divide(new SM.Term(1,1,'y')).toString(),"xy^-1","Testing multivariable division");
});

test("SM.Polynomial.exponentiate", function() {
	var x = new SM.Term(1,1,'x');
	var xpp = x.add(1);
	var xyp = xpp.multiply(new SM.Term(2,1,'y'));
	var p =  new SM.Polynomial([new SM.Term(1,1,'x'),new SM.Term(1,0,'x')]);

	equal(xpp.exponentiate(2).toString(),"x^2+2x+1","Testing basic squaring");
	equal(xpp.exponentiate(3).toString(),"x^3+3x^2+3x+1","Testing basic cubing");
	equal(xpp.exponentiate(0).toString(),"1","Testing a polynomial to the 0th power");
	equal(xyp.exponentiate(2).toString(),"4x^2*y^2+8xy^2+4y^2","Testing squaring with multivariable term");
	//(2xy+2y)(2xy+2y) =4x^2*y^2+4xy^2+4xy^2+4y^2
	equal(p.exponentiate(1).toString(),"x+1","Testing first couple powers");	
	equal(p.exponentiate(2).toString(),"x^2+2x+1","Testing first couple powers");	
	equal(p.exponentiate(3).toString(),"x^3+3x^2+3x+1","Testing first couple powers");	
	equal(p.exponentiate(4).toString(),"x^4+4x^3+6x^2+4x+1","Testing first couple powers");	
	equal(p.exponentiate(5).toString(),"x^5+5x^4+10x^3+10x^2+5x+1","Testing first couple powers");	
	equal(p.exponentiate(6).toString(),"x^6+6x^5+15x^4+20x^3+15x^2+6x+1","Testing first couple powers");	
	equal(p.exponentiate(7).toString(),"x^7+7x^6+21x^5+35x^4+35x^3+21x^2+7x+1","Testing first couple powers");	
	equal(p.exponentiate(8).toString(),"x^8+8x^7+28x^6+56x^5+70x^4+56x^3+28x^2+8x+1","Testing first couple powers");	
	equal(p.exponentiate(9).toString(),"x^9+9x^8+36x^7+84x^6+126x^5+126x^4+84x^3+36x^2+9x+1","Testing first couple powers");	
	equal(p.exponentiate(10).toString(),"x^10+10x^9+45x^8+120x^7+210x^6+252x^5+210x^4+120x^3+45x^2+10x+1","Testing first couple powers");	
});

test("SM.Polynomial.orthogonal.Polynomials", function() {
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
	equal(stringizer(SM.Polynomial.prototype.orthogonalPolynomials(symm,2)),"[1 x x^2-2 ]","A basic test generating orthogonal polynomials");
	equal(stringizer(SM.Polynomial.prototype.orthogonalPolynomials(simple,1)),"[1 x-1 ]","Another basic test generating orthogonal polynomials");
});

test("SM.Polynomial.leastSquare", function() {
	var linear =[new SM.Term(1,0,'x'),new SM.Term(1,1,'x')];
	var sortaquadratic =[new SM.Term(1,0,'x'),new SM.Term(1,2,'x')] 
	var thepoints = [new SM.Point(4,2),new SM.Point(7,0),new SM.Point(11,2),new SM.Point(13,6),new SM.Point(17,7)];
	var morepoints =[new SM.Point(-1,3.1),new SM.Point(0,0.9),new SM.Point(1,2.9)];
	equal(SM.Polynomial.prototype.leastSquare(thepoints,linear).toString(),"0.486434108527132x-1.6589147286821728","Test of linear regression.");
	equal(SM.Polynomial.prototype.leastSquare(morepoints,sortaquadratic).toString(),"2.1x^2+0.9","Test of a quadratic least square");
});

test("SM.PiecewiseFunction.createSecondDegSpline", function() {
	var Q = [new SM.Point(0,8),new SM.Point(1,12),new SM.Point(3,2),new SM.Point(4,6),new SM.Point(8,0)];
	var Y = [new SM.Point(0,8),new SM.Point(1,6),new SM.Point(3,5),new SM.Point(4,3),new SM.Point(6,2),new SM.Point(8,0)];
	var Z = [new SM.Point(-1,2),new SM.Point(0,1),new SM.Point(0.5,0),new SM.Point(1,1),new SM.Point(2,2),new SM.Point(5/2.0,3)];
	equal(SM.PiecewiseFunction.createSecondDegSpline(Z).toString(),"{f0(x)=-x^2-2x+1 on range: [-1,0), f1(x)=-2x+1 on range: [0,0.5), f2(x)=8x^2-10x+3 on range: [0.5,1), f3(x)=-5x^2+16x-10 on range: [1,2), f4(x)=12x^2-52x+58 on range: [2,2.5], }","Basic test of second degree spline.");
});

test("SM.PiecewiseFunction.createThirdDegSpline",function() {

	var Q = [new SM.Point(1,0),new SM.Point(2,1),new SM.Point(3,0),new SM.Point(4,1),new SM.Point(5,0)];
	equal(SM.PiecewiseFunction.createThirdDegSpline(Q).toString(),"{f0(x)=-0.7142857142857143x^3+2.142857142857143x^2-0.4285714285714286x-0.9999999999999999 on range: [1,2], f1(x)=1.5714285714285714x^3-11.571428571428571x^2+26.999999999999996x-19.285714285714285 on range: [2,3], f2(x)=-1.5714285714285714x^3+16.714285714285715x^2-57.857142857142854x+65.57142857142857 on range: [3,4], f3(x)=0.7142857142857143x^3-10.714285714285715x^2+51.857142857142854x-80.71428571428572 on range: [4,5], }","Test a simple third degree spline.");
});
/*
test("Range", function() {
	var badinput = "3,4";
	var okayinput ="[0,1]";

//	throws(new Range(badinput),"Check for bad input");
});*/

test("SM.Matrix.transpose", function() {
	var m = [[1,3,5],[2,4,6]];
	var ma = new SM.Matrix(2,3,m);
	var mtranspose = [[1,2],[3,4],[5,6]];
	var mat = new SM.Matrix(3,2,mtranspose);
	equal(ma.transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]","Checking transpose for equality");
	equal(mat.transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]","Checking double with intermediate step transpose for equality");
	equal(ma.transpose().transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]","Checking double transpose for equality");
	equal(mat.transpose().transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]","Checking double transpose for equality again");
});
/*
test("SM.Matrix.naiveGaussian", function() {
	
});

test("SM.Matrix.scaledPartialPivotGaussain", function() {
	
});

test("SM.Matrix.LUdecomposition",function() {


});

test("SM.Matrix.FloydWarshall",function() {
	var fwtest = [[0,Infinity,Infinity,Infinity,-1,Infinity],
		      [1,0,Infinity,2,Infinity,Infinity],
		      [Infinity,2,0,Infinity,Infinity,-8],
		      [-4,Infinity,Infinity,0,3,Infinity],
		      [Infinity,7,Infinity,Infinity,0,Infinity],
		      [Infinity,5,10,Infinity,Infinity,0]];
      var mm = new SM.Matrix(6,6,fwtest);
	
});*/
