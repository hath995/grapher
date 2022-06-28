import {Term, Point} from "../src/Term";
import {Polynomial} from "../src/Polynomial";
import {Matrix} from "../src/Matrix";
import {PiecewiseFunction} from "../src/Piecewise";
import * as assert from "assert";

describe("Term.isMatchingVariables", function() {
    var testbasic = new Term(2,1,'x');
    var testzero = new Term(0,2,'x');
    var testy = new Term(-1,0,'y');
    var testysq = new Term(4,2,'y');
    var testmulti = new Term(5,[0,2],['x','y']);

    it("Testing simple single variable terms", () => {
        assert.equal(testbasic.isMatchingVariables(testzero),true);
    });
    it("Testing simple single different variable terms", () => {
        assert.equal(testbasic.isMatchingVariables(testy),false);
    });
    it("Testing single variable to multi-different variable term", () => {
        assert.equal(testbasic.isMatchingVariables(testmulti),false);
    });
    it("Testing multi-different variable term", () => {
        assert.equal(testmulti.isMatchingVariables(testmulti),true);
    });
});

describe("Term.isMatchingPowers", function() {
    var testbasic = new Term(2,1,'x');
    var testzero = new Term(0,2,'x');
    var testy = new Term(-1,0,'y');
    var testysq = new Term(4,2,'y');
    var testmulti = new Term(5,[0,2],['x','y']);
    var testmulti2 = new Term(2,[1,3],['x','y']);
    it("Test of identical terms", () => {
        assert.equal(testbasic.isMatchingPowers(testbasic),true);
    });
    it("Test of unequal power terms", () => {
        assert.equal(testbasic.isMatchingPowers(testzero),false);
    });
    it("Test of multiple identical terms", () => {
        assert.equal(testmulti.isMatchingPowers(testmulti),true);
    });
    it("Test of multiple different power terms", () => {
        assert.equal(testmulti.isMatchingPowers(testmulti2),false);
    });

});

describe("Term.toString", function() {
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

    var testmultibasic = new Term(2,[1,2],['x','y']);
    var testmulti = new Term(2,[2,2],['x','y']);
    var multione = new Term(1,[0,0],['x','y']);
    var multinegone = new Term(-1,[0,0],['x','y']);
    var multineg = new Term(-1,[1,0],['x','y']);
    var multineg2 = new Term(-41,[1,0],['x','y']);

    it("test basic term with unit power", () => {
        assert.equal(testbasic.toString(),"2x");
    });
    it("test basic term with zero coefficient", () => {
        assert.equal(testzero.toString(),"");
    });
    it("test basic term unit value", () => {
        assert.equal(testone.toString(),"1");
    });
    it("test basic term with negative one", () => {
        assert.equal(testnegone.toString(),"-1");
    });
    it("test term with exponent", () => {
        assert.equal(testexponent.toString(),"4x^2");
    });
    it("test constant term", () => {
        assert.equal(testconstant.toString(),"5");
    });
    it("test term with unit coefficient", () => {
        assert.equal(testcoefficientone.toString(),"x");
    });
    it("test term with rational coefficient", () => {
        assert.equal(testrationalcoeff.toString(),"0.7345x^4");
    });
    it("term with  a rational power", () => {
        assert.equal(testrationalpower.toString(),"34x^4.123");
    });
    it("term with both a rational coefficient and power", () => {
        assert.equal(testrational.toString(),"33.333x^4.123");
    });

    it("test basic multivaribale term ", () => {
        assert.equal(testmultibasic.toString(),"2xy^2");
    });
    it("test multivaribale term ", () => {
        assert.equal(testmulti.toString(),"2x^2*y^2");
    });
    it("test multivariable term unit value", () => {
        assert.equal(multione.toString(),"1");
    });
    it("test multivariable term with negative one", () => {
        assert.equal(multinegone.toString(),"-1");
    });
    it("test multivariable term with negative one and zero power ending var", () => {
        assert.equal(multineg.toString(),"-x");
    });
    it("test multivariable term with negative fourty one and zero power ending var", () => {
        assert.equal(multineg2.toString(),"-41x");
    });
});

describe("Polynomial.simplify", function() {

    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var m1 = new Term(4,[1,1],['x','y']);
    var m2 = new Term(4,[2,2],['x','z']);
    var polyxyc = new Polynomial([x,y,c]);
    var fivex = new Polynomial([x,x,x,x,x]);
    var threey = new Polynomial([y,y,y]);
    var fivexthreey = new Polynomial([x,x,x,x,x,y,y,y]);
    var cminusc = new Polynomial([c,c.neg()]);

    var differentpowers = new Polynomial([x,x.exponentiate(2).multiply(3),x.exponentiate(3)]);
    differentpowers.simplify();
    it("Testing for no simplification of different powers", () => {
        assert.equal(differentpowers.toString(),"x+3x^2+x^3");
    });

    var differentpowerswithsum = new Polynomial([x,x,x.exponentiate(2).multiply(3),x.exponentiate(2),x.exponentiate(3)]);
    differentpowerswithsum.simplify();
    it("Testing simplification of different powers", () => {
        assert.equal(differentpowerswithsum.toString(),"2x+4x^2+x^3");
    });


    cminusc.simplify();
    it("Testing for zero", () => {
        assert.equal(cminusc,"");
    });

    fivex.simplify();
    it("Testing fivex for simplification", () => {
        assert.equal(fivex.toString(),"5x");
    });

    threey.simplify();
    it("Testing threey for simplification", () => {
        assert.equal(threey.toString(),"3y");
    });

    polyxyc.simplify();
    it("Testing polyxyc for simplification", () => {
        assert.equal(polyxyc.toString(),"2+x+y");
    });

    var mpoly = new Polynomial([x,m1,m1.multiply(2)]);
    mpoly.simplify()
    it("Test a simple multivariable polynomial", () => {
        assert.equal(mpoly,"x+12xy");
    });

    var mpoly2 = new Polynomial([x,m1,m2.multiply(2)]);
    mpoly2.simplify()
    it("Test a  multivariable polynomial", () => {
        assert.equal(mpoly2,"x+4xy+8x^2*z^2");
    });

    var mpoly3 = new Polynomial([m2,m2.neg()]);
    mpoly3.simplify()
    it("Test a zeroed multivariable polynomial", () => {
        assert.equal(mpoly3,"");
    });

    var t = (new Term(4,1,'t')).add(new Term(4,0,'t'));
    var rr = new Term(2,1,'x');
    var composed = rr.resolve({"x":t}).add(new Term(4,0,'x'));
    it("Testing simplification of different variables", () => {
        assert.equal(composed.toString(),"8t+12");
    });


});

describe("Term.add", function() {
    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var d = new Term(2,0,'y');
    var poly = new Polynomial([x,c]);
    var multi = new Term(3,[1,1],['x','y']);
    it("Adding like terms", () => {
        assert.equal(x.add(x).toString(),"2x");
    });
    it("Adding a constant term", () => {
        assert.equal(x.add(c).toString(),"x+2");
    });
    it("Adding a constant literal", () => {
        assert.equal(x.add(5).toString(),"x+5");
    });
    it("Adding a term of a different variable", () => {
        assert.equal(x.add(y).toString(),"x+y");
    });
    it("Adding a polynomial to a term", () => {
        assert.equal(x.add(poly).toString(),"2x+2");
    });
    it("Adding a constant of a different variable to another.", () => {
        assert.equal(c.add(d).toString(),"2+2");
    });

    it("Testing a multvariable term by adding a constant", () => {
        assert.equal(multi.add(d),"3xy+2");
    });
    it("Testing a multvariable term by adding a constant literal", () => {
        assert.equal(multi.add(2).toString(),"3xy+2");
    });
    it("Testing a multvariable term by adding to itself", () => {
        assert.equal(multi.add(multi),"6xy");
    });
    //The above test looks wrong but in reality is fine because this situation is solved 
    //by the simplify method.
    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing poly for side effects", () => {
        assert.equal(poly.toString(),"x+2");
    });
});

describe("Term.subtract",function() {
    var x = new Term(1,1,'x');
    var twox = new Term(2,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var poly = new Polynomial([x,c]);
    it("subtracting equal like terms", () => {
        assert.equal(x.subtract(x).toString(),"");
    });
    it("subtracting like terms", () => {
        assert.equal(x.subtract(twox).toString(),"-x");
    });
    it("repeated subtracting like terms", () => {
        assert.equal(x.subtract(twox).subtract(twox).toString(),"-3x");
    });
    it("subtracting a constant literal", () => {
        assert.equal(x.subtract(5).toString(),"x-5");
    });
    it("subtracting a term of a different variable", () => {
        assert.equal(x.subtract(y).toString(),"x-y");
    });
    it("Adding a term of a different variable", () => {
        assert.equal(x.subtract(poly).toString(),"-2");
    });

    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing x for side effects", () => {
        assert.equal(twox.toString(),"2x");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing poly for side effects", () => {
        assert.equal(poly.toString(),"x+2");
    });
});


describe("Term.multiply", function() {
    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var poly = new Polynomial([x,c]);

    var multi = new Term(5,[1,2],['x','y']);
    it("Multiplying by a constant term", () => {
        assert.equal(x.multiply(c).toString(),"2x");
    });
    it("Multiplying by x", () => {
        assert.equal(x.multiply(x).toString(),"x^2");
    });
    it("Multiplying by a constant literal", () => {
        assert.equal(x.multiply(5).toString(),"5x");
    });
    it("Multiplying by a polynomial", () => {
        assert.equal(x.multiply(poly).toString(),"x^2+2x");
    });
    it("Multiplying a term of a different variable", () => {
        assert.equal(x.multiply(y).toString(),"xy"); 
    });
    it("Multiplying a multiterm of a different variable", () => {
        assert.equal(x.multiply(multi).toString(),"5x^2*y^2"); 
    });
    it("Multiplying a multiterm of a different variable", () => {
        assert.equal(y.multiply(multi).toString(),"5y^3*x"); 
    });

    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing poly for side effects", () => {
        assert.equal(poly.toString(),"x+2");
    });
});

describe("Term.divide", function() {

    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var poly = new Polynomial([x,c]);

    it("Dividing by a constant term", () => {
        assert.equal(x.divide(c).toString(),"0.5x");
    });
    it("Dividing by x", () => {
        assert.equal(x.divide(x).toString(),"1");
    });
    it("Dividing by a constant literal", () => {
        assert.equal(x.divide(5).toString(),"0.2x");
    });
    //equal(x.divide(poly).toString(),"x^2+2x","Dividing by a polynomial"); //not yet implemented
    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing poly for side effects", () => {
        assert.equal(poly.toString(),"x+2");
    });
});

describe("Term.exponentiate", function() {
    var x = new Term(2,1,'x');
    var multi = new Term(3,[1,2],['x','y']);

    it("Testing single variable term", () => {
        assert.equal(x.exponentiate(3).toString(),"8x^3");
    });
    it("Testing single variable term", () => {
        assert.equal(multi.exponentiate(3).toString(),"27x^3*y^6");
    });
});

describe("Term.resolve", function() {
    var zeroc = new Term(0,0,'x');
    var zerox = new Term(0,1,'x');
    var identity = new Term(1,1,'x');
    var xsquared = new Term(1,2,'x');
    var yfunction= new Term(3,3,'y');
    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var poly = new Polynomial([x,c]);

    var multi = new Term(3,[1,1,2],['x','y','z']);
    it("Testing for zero constant", () => {
        assert.equal(zeroc.resolve(1),"0");
    });
    it("Testing for zero function", () => {
        assert.equal(zerox.resolve(1),"0");
    });
    it("Testing for identity function", () => {
        assert.equal(identity.resolve(1),"1");
    });
    it("Testing for xsquared function", () => {
        assert.equal(xsquared.resolve(2),"4");
    });
    it("Testing for yfunction", () => {
        assert.equal(yfunction.resolve(2),"24");
    });

    it("Testing for over specification of yfunction", () => assert.equal(yfunction.resolve({'x':2,'y':3,'z':2}),"81"));
    it("Testing for under specification of yfunction", () => assert.equal(yfunction.resolve({'x':2,'z':2}).toString(),"3y^3"));
    it("Testing resolve for multivariable term", () => assert.equal(multi.resolve({'x':2,'y':3,'z':2}).toString(),"72"));
    it("Testing resolve for multivariable term", () => assert.equal(multi.resolve({'y':3,'z':2}).toString(),"36x"));
    //test function composition
    it("Testing single variable function composition", () => assert.equal(yfunction.resolve(identity).toString(),"3x^3"));
    it("Testing single variable term with polynomial", () => assert.equal(xsquared.resolve(poly).toString(),"x^2+4x+4"));
    it("Testing single variable function composition with named attributes.", () => assert.equal(yfunction.resolve({'y':identity}).toString(),"3x^3"));
    it("Testing multivariable partial application and composition", () => assert.equal(multi.resolve({'y':poly}).toString(),"3x^2*z^2+6xz^2"));
    it("Testing multivariable composition", () => assert.equal(multi.resolve({'y':x,'x':x,'z':x}).toString(),"3x^4"));

});

describe("Polynomial.toString", function() {
    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var multi = new Term(2,[1,2],['x','y']);
    var polyx = new Polynomial([x]);
    var polyxc = new Polynomial([x,c]);
    var polyxyc = new Polynomial([x,y,c]);
    var multipoly = new Polynomial([x,y,c,multi]);
    it("A monomial 'polynomial'", () => {
        assert.equal(polyx.toString(),"x");
    });
    it("A simple 'polynomial'", () => {
        assert.equal(polyxc.toString(),"x+2");
    });
    it("A multivariable 'polynomial'", () => {
        assert.equal(polyxyc.toString(),"x+y+2");
    });
    it("A multivariable 'polynomial' with multivariable term", () => {
        assert.equal(multipoly.toString(),"x+y+2+2xy^2");
    });
    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
});


describe("Polynomial.resolve", function() {
    var x = new Term(1,1,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var multi = new Term(2,[1,2],['x','y']);
    var polyx = new Polynomial([x]);
    var polyxc = new Polynomial([x,c]);
    var polyxyc = new Polynomial([x,y,c]);
    var multipoly = new Polynomial([x,y,c,multi]);

    var xcube = new Polynomial([new Term(3,[2],'x'),
        new Term(4,[1],'x'),
        new Term(5,[0],'x')]);
    var t = new Polynomial([new Term(2,1,'t'),new Term(-1,0,'t')]);

    it("Test simple polynomial", () => {
        assert.equal(polyx.resolve(2),"2");
    });
    it("Test a polynomial with a constant", () => {
        assert.equal(polyxc.resolve(2),"4");
    });
    it("Testing a multivariable polynomial", () => assert.equal(polyxyc.resolve({'x':3,'y':4}),"9"));
    it("Testing a multivariable polynomial with multivariable terms", () => assert.equal(multipoly.resolve({'x':3,'y':4}),"105"));
    it("Testing partial function applications", () => assert.equal(multipoly.resolve({'y':4}).toString(),"33x+6"));
    it("Testing polynomial function composition", () => assert.equal(multipoly.resolve({'y':polyxc}).toString(),"2x^3+8x^2+10x+4"));
    it("Testing polynomial function composition change of variable", () => assert.equal(xcube.resolve({'x':t}).toString(),"12t^2-4t+4"));
    it("Testing polynomial function composition change of variable", () => assert.equal(polyxc.resolve({'x':t}).toString(),"2t+1"));
    //-0.125x^2+2x-4
    var xarg = new Polynomial([new Term(-0.125,2,'x'),new Term(2,1,'x'),new Term(4,0,'x')]);
    var xar = new Polynomial([new Term(-0.125,2,'x'),new Term(2,1,'x')]);
    var tpain = new Polynomial([new Term(4,1,'t'),new Term(4,0,'t')]);
    it("Testing polynomial function composition dual constants", () => {
        assert.equal(xar.resolve({'x':tpain}).toString(),"-2t^2+4t+6");
    });
    it("Testing polynomial function composition dual constants", () => {
        assert.equal(xarg.resolve({'x':tpain}).toString(),"-2t^2+4t+10");
    });
    //simplify side-effect?
    var test = xarg.resolve({'x':tpain});
    test.simplify();
    test.sort();
    it("Testing polynomial function simplify", () => {
        assert.equal(test.toString(),"-2t^2+4t+10");
    });

});

describe("Polynomial.add", function() {
    var x = new Term(1,1,'x');
    var xsquared = new Term(3,2,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var multi = new Term(2,[1,2],['x','y']);
    var polyx = new Polynomial([x]);
    var polyy = new Polynomial([y]);
    var polyc = new Polynomial([c]);
    var polyxc = new Polynomial([x,c]);
    var polyxyc = new Polynomial([x,y,c]);
    var multipoly = new Polynomial([x,y,c,multi]);
    it("Adding a monomial Polynomial to another monomial Polynomial", () => {
        assert.equal(polyx.add(polyx).toString(),"2x");
    });
    it("Adding a monomial Polynomial to a different variable monomial Polynomial", () => {
        assert.equal(polyx.add(polyy).toString(),"x+y");
    });
    it("Adding a monomial Polynomial to another monomial Polynomial constant", () => {
        assert.equal(polyx.add(polyc).toString(),"x+2");
    });

    it("Adding a monomial Polynomial to a term", () => {
        assert.equal(polyx.add(x).toString(),"2x");
    });
    it("Adding a monomial Polynomial to a term commutatively", () => {
        assert.equal(x.add(polyx).toString(),"2x");
    });
    it("Adding a monomial Polynomial to a higher power term", () => {
        assert.equal(polyx.add(xsquared).toString(),"3x^2+x");
    });
    it("Adding a monomial Polynomial to term of a different variable", () => {
        assert.equal(polyx.add(y).toString(),"x+y");
    });
    it("Adding a term to a polynomial of different variables", () => {
        assert.equal(multipoly.add(y).toString(),"2xy^2+x+2y+2");
    });
    it("Adding a constant to a polynomial of different variable", () => {
        assert.equal(multipoly.add(2).toString(),"4+x+y+2xy^2");
    });
    it("Adding a polynomial to a polynomial of different variable", () => {
        assert.equal(multipoly.add(polyxyc).toString(),"2xy^2+2x+2y+4");
    });
    it("Adding a polynomial to a polynomial of different variable", () => {
        assert.equal(multipoly.add(polyxyc).toString(),"2xy^2+2x+2y+4");
    });

    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing xsquared for side effects", () => {
        assert.equal(xsquared.toString(),"3x^2");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing polyxc for side effects", () => {
        assert.equal(polyxc.toString(),"x+2");
    });
    it("Testing polyx for side effects", () => {
        assert.equal(polyx.toString(),"x");
    });
    it("Testing polyy for side effects", () => {
        assert.equal(polyy.toString(),"y");
    });
    it("Testing polyc for side effects", () => {
        assert.equal(polyc.toString(),"2");
    });
    it("Testing polyxyc for side effects", () => {
        assert.equal(polyxyc.toString(),"x+y+2");
    });
});

describe("Polynomial.subtract", function() {
    var x = new Term(1,1,'x');
    var xsquared = new Term(3,2,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var multi = new Term(2,[1,2],['x','y']);
    var polyx = new Polynomial([x]);
    var polyy = new Polynomial([y]);
    var polyc = new Polynomial([c]);
    var polyxc = new Polynomial([x,c]);
    var polyxyc = new Polynomial([x,y,c]);
    var multipoly = new Polynomial([x,y,c,multi]);

    it("Subtracting a monomial Polynomial to another monomial Polynomial", () => assert.equal(polyx.subtract(polyx).toString(),""));
    it("Subtracting a monomial Polynomial to a different variable monomial Polynomial", () => assert.equal(polyx.subtract(polyy).toString(),"x-y"));
    it("Subtracting a monomial Polynomial to another monomial Polynomial constant", () => assert.equal(polyx.subtract(polyc).toString(),"x-2"));

    it("Subtracting a monomial Polynomial to a term", () => assert.equal(polyx.subtract(x).toString(),""));
    it("Subtracting a monomial Polynomial to a higher power term", () => assert.equal(polyx.subtract(xsquared).toString(),"-3x^2+x"));
    it("Subtracting a monomial Polynomial to term of a different variable", () => assert.equal(polyx.subtract(y).toString(),"x-y"));
    it("subtracting a term to a polynomial of different variables", () => assert.equal(multipoly.subtract(y).toString(),"2xy^2+x+2"));
    it("subtracting a constant to a polynomial of different variable", () => assert.equal(multipoly.subtract(2).toString(),"x+y+2xy^2"));
    it("subtracting a polynomial to a polynomial of different variable", () => assert.equal(multipoly.subtract(polyxyc).toString(),"2xy^2"));


    it("Testing x for side effects", () => {
        assert.equal(x.toString(),"x");
    });
    it("Testing xsquared for side effects", () => {
        assert.equal(xsquared.toString(),"3x^2");
    });
    it("Testing y for side effects", () => {
        assert.equal(y.toString(),"y");
    });
    it("Testing c for side effects", () => {
        assert.equal(c.toString(),"2");
    });
    it("Testing polyxc for side effects", () => {
        assert.equal(polyxc.toString(),"x+2");
    });
    it("Testing polyx for side effects", () => {
        assert.equal(polyx.toString(),"x");
    });
    it("Testing polyy for side effects", () => {
        assert.equal(polyy.toString(),"y");
    });
    it("Testing polyc for side effects", () => {
        assert.equal(polyc.toString(),"2");
    });
    it("Testing polyxyc for side effects", () => {
        assert.equal(polyxyc.toString(),"x+y+2");
    });
});

describe("Polynomial.multiply", function() {
    var x = new Term(1,1,'x');
    var xsquared = new Term(3,2,'x');
    var y = new Term(1,1,'y');
    var c = new Term(2,0,'x');
    var polyx = new Polynomial([x]);
    var polyy = new Polynomial([y]);
    var polyc = new Polynomial([c]);
    var polyxc = new Polynomial([x,c]);
    var polyxyc = new Polynomial([x,y,c]);
    it("Multiplying a monomial Polynomial to another monomial Polynomial", () => assert.equal(polyx.multiply(polyx).toString(),"x^2"));
    //equal(polyx.multiply(polyy).toString(),"y+x","Multiplying a monomial Polynomial to a different variable monomial Polynomial");
    it("Multiplying a monomial Polynomial to another monomial Polynomial constant", () => assert.equal(polyx.multiply(polyc).toString(),"2x"));

    it("Multiplying a monomial Polynomial to a term", () => assert.equal(polyx.multiply(x).toString(),"x^2"));
    it("Multiplying a monomial Polynomial to a higher power term", () => assert.equal(polyx.multiply(xsquared).toString(),"3x^3"));
    it("Multiplying a monomial Polynomial to term of a different variable", () => assert.equal(polyx.multiply(y).toString(),"xy"));
    it("Multiplying a monomial Polynomial to term of a different variable", () => assert.equal(polyx.multiply(y.multiply(x)).multiply(3).toString(),"3x^2*y"));
    it("Testing x for side effects", () => assert.equal(x.toString(),"x"));
    it("Testing xsquared for side effects", () => assert.equal(xsquared.toString(),"3x^2"));
    it("Testing y for side effects", () => assert.equal(y.toString(),"y"));
    it("Testing c for side effects", () => assert.equal(c.toString(),"2"));
    it("Testing polyxc for side effects", () => assert.equal(polyxc.toString(),"x+2"));
    it("Testing polyx for side effects", () => assert.equal(polyx.toString(),"x"));
    it("Testing polyy for side effects", () => assert.equal(polyy.toString(),"y"));
    it("Testing polyc for side effects", () => assert.equal(polyc.toString(),"2"));
    it("Testing polyxyc for side effects", () => assert.equal(polyxyc.toString(),"x+y+2"));
});

describe("Polynomial.divide", function() {
    var x = new Term(1,1,'x');
    var xsquared = new Term(3,2,'x');
    var c = new Term(2,0,'x');
    var polyx = new Polynomial([x]);
    var polyc = new Polynomial([c]);
    var polyxc = new Polynomial([x,c]);
    //equal(polyx.divide(polyx).toString(),"1","Dividing a monomial Polynomial to another monomial Polynomial");
    //equal(polyx.divide(polyc).toString(),"2x","Dividing a monomial Polynomial to another monomial Polynomial constant");

    it("Dividing a monomial Polynomial to a term", () => assert.equal(polyx.divide(x).toString(),"1"));
    it("Dividing a monomial Polynomial to a higher power term", () => assert.equal(polyx.divide(xsquared).toString(),"0.3333333333333333x^-1"));
    it("Testing x for side effects", () => assert.equal(x.toString(),"x"));
    it("Testing xsquared for side effects", () => assert.equal(xsquared.toString(),"3x^2"));
    it("Testing c for side effects", () => assert.equal(c.toString(),"2"));
    it("Testing polyxc for side effects", () => assert.equal(polyxc.toString(),"x+2"));
    it("Testing polyx for side effects", () => assert.equal(polyx.toString(),"x"));
    it("Testing polyc for side effects", () => assert.equal(polyc.toString(),"2"));

    it("Testing multivariable division", () => assert.equal(polyx.divide(new Term(1,1,'y')).toString(),"xy^-1"));
});

describe("Polynomial.exponentiate", function() {
    var x = new Term(1,1,'x');
    var xpp = x.add(1);
    var xyp = xpp.multiply(new Term(2,1,'y'));
    var p =  new Polynomial([new Term(1,1,'x'),new Term(1,0,'x')]);

    it("Testing basic squaring", () => assert.equal(xpp.exponentiate(2).toString(),"x^2+2x+1"));
    it("Testing basic cubing", () => assert.equal(xpp.exponentiate(3).toString(),"x^3+3x^2+3x+1"));
    it("Testing a polynomial to the 0th power", () => assert.equal(xpp.exponentiate(0).toString(),"1"));
    it("Testing squaring with multivariable term", () => assert.equal(xyp.exponentiate(2).toString(),"4x^2*y^2+8xy^2+4y^2"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(1).toString(),"x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(2).toString(),"x^2+2x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(3).toString(),"x^3+3x^2+3x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(4).toString(),"x^4+4x^3+6x^2+4x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(5).toString(),"x^5+5x^4+10x^3+10x^2+5x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(6).toString(),"x^6+6x^5+15x^4+20x^3+15x^2+6x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(7).toString(),"x^7+7x^6+21x^5+35x^4+35x^3+21x^2+7x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(8).toString(),"x^8+8x^7+28x^6+56x^5+70x^4+56x^3+28x^2+8x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(9).toString(),"x^9+9x^8+36x^7+84x^6+126x^5+126x^4+84x^3+36x^2+9x+1"));
    it("Testing first couple powers", () => assert.equal(p.exponentiate(10).toString(),"x^10+10x^9+45x^8+120x^7+210x^6+252x^5+210x^4+120x^3+45x^2+10x+1"));
});

describe("Polynomial.orthogonal.Polynomials", function() {
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
    it("A basic test generating orthogonal polynomials", () => assert.equal(stringizer(Polynomial.prototype.orthogonalPolynomials(symm,2)),"[1 x x^2-2 ]"));
    it("Another basic test generating orthogonal polynomials", () => assert.equal(stringizer(Polynomial.prototype.orthogonalPolynomials(simple,1)),"[1 x-1 ]"));
});

describe("Polynomial.leastSquare", function() {
    var linear =[new Term(1,0,'x'),new Term(1,1,'x')];
    var sortaquadratic =[new Term(1,0,'x'),new Term(1,2,'x')] 
    var thepoints = [new Point(4,2),new Point(7,0),new Point(11,2),new Point(13,6),new Point(17,7)];
    var morepoints =[new Point(-1,3.1),new Point(0,0.9),new Point(1,2.9)];
    it("Test of linear regression.", () => assert.equal(Polynomial.prototype.leastSquare(thepoints,linear).toString(),"0.486434108527132x-1.6589147286821728"));
    it("Test of a quadratic least square", () => assert.equal(Polynomial.prototype.leastSquare(morepoints,sortaquadratic).toString(),"2.1x^2+0.9"));
});

describe("PiecewiseFunction.createSecondDegSpline", function() {
    var Q = [new Point(0,8),new Point(1,12),new Point(3,2),new Point(4,6),new Point(8,0)];
    var Y = [new Point(0,8),new Point(1,6),new Point(3,5),new Point(4,3),new Point(6,2),new Point(8,0)];
    var Z = [new Point(-1,2),new Point(0,1),new Point(0.5,0),new Point(1,1),new Point(2,2),new Point(5/2.0,3)];
    it("Basic test of second degree spline.", () => assert.equal(PiecewiseFunction.createSecondDegSpline(Z).toString(),"{f0(x)=-x^2-2x+1 on range: [-1,0), f1(x)=-2x+1 on range: [0,0.5), f2(x)=8x^2-10x+3 on range: [0.5,1), f3(x)=-5x^2+16x-10 on range: [1,2), f4(x)=12x^2-52x+58 on range: [2,2.5], }"));
});

describe("PiecewiseFunction.createThirdDegSpline",function() {

    var Q = [new Point(1,0),new Point(2,1),new Point(3,0),new Point(4,1),new Point(5,0)];
    it("Test a simple third degree spline.", () => assert.equal(PiecewiseFunction.createThirdDegSpline(Q).toString(),"{f0(x)=-0.7142857142857143x^3+2.142857142857143x^2-0.4285714285714286x-0.9999999999999999 on range: [1,2], f1(x)=1.5714285714285714x^3-11.571428571428571x^2+26.999999999999996x-19.285714285714285 on range: [2,3], f2(x)=-1.5714285714285714x^3+16.714285714285715x^2-57.857142857142854x+65.57142857142857 on range: [3,4], f3(x)=0.7142857142857143x^3-10.714285714285715x^2+51.857142857142854x-80.71428571428572 on range: [4,5], }"));
});
/*
describe("Range", function() {
    var badinput = "3,4";
    var okayinput ="[0,1]";

    //throws(new Range(badinput),"Check for bad input");
});*/

    describe("Matrix.transpose", function() {
        var m = [[1,3,5],[2,4,6]];
        var ma = new Matrix(2,3,m);
        var mtranspose = [[1,2],[3,4],[5,6]];
        var mat = new Matrix(3,2,mtranspose);
        it("Checking transpose for equality", () => assert.equal(ma.transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]"));
        it("Checking double with intermediate step transpose for equality", () => assert.equal(mat.transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]"));
        it("Checking double transpose for equality", () => assert.equal(ma.transpose().transpose().toString() ,"[ [ 1 3 5 ] [ 2 4 6 ] ]"));
        it("Checking double transpose for equality again", () => assert.equal(mat.transpose().transpose().toString() ,"[ [ 1 2 ] [ 3 4 ] [ 5 6 ] ]"));
    });
// /*
// describe("Matrix.naiveGaussian", function() {

// });

// describe("Matrix.scaledPartialPivotGaussain", function() {

// });

// describe("Matrix.LUdecomposition",function() {


// });

// describe("Matrix.FloydWarshall",function() {
//     var fwtest = [[0,Infinity,Infinity,Infinity,-1,Infinity],
//               [1,0,Infinity,2,Infinity,Infinity],
//               [Infinity,2,0,Infinity,Infinity,-8],
//               [-4,Infinity,Infinity,0,3,Infinity],
//               [Infinity,7,Infinity,Infinity,0,Infinity],
//               [Infinity,5,10,Infinity,Infinity,0]];
//       var mm = new Matrix(6,6,fwtest);

// });*/
