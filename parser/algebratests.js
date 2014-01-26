var _ = require('./Algebra');
var SM = _.SM;
console.log(SM);

var p = function(x) {console.log(x);};

var x = new SM.Real(2);
p(x.toString());
x = new SM.Variable('x');
p(x.toString());
x = new SM.Operation('*',new SM.Real(2),new SM.Variable('x'))
p(x.toString());
x = new SM.Operation('*',new SM.Real(2),new SM.Variable('x')).resolve({"x":4});
p(x.toString());
x = new SM.Operation('*',new SM.Variable('y'),new SM.Operation('*',new SM.Real(2),new SM.Variable('x'))).resolve({"x":4});
p(x.toString());
x = new SM.Operation('+',new SM.Variable('y'),new SM.Operation('*',new SM.Real(2),new SM.Variable('x'))).resolve({"x":4});
p(x.toString());
x = new SM.Operation('*',new SM.Variable('y'),new SM.Operation('*',new SM.Real(2),new SM.Variable('x'))).resolve({"x":4,"y":16});
p(x.toString());
x = new SM.Operation('+',new SM.Variable('y'),new SM.Operation('*',new SM.Real(2),new SM.Variable('x'))).resolve({"x":4,"y":16});
p(x.toString());
x = new SM.Transcendental("sin",new SM.Variable('x'));
p(x.toString());
x = new SM.Transcendental("sin",new SM.Variable('x').resolve({"x":Math.PI/2}));
p(x.toString());
p(x.resolve({}).toString());
x = new SM.Operation('*',new SM.Variable('x'),new SM.Transcendental('cos',new SM.Operation('^',new SM.Variable('y'),new SM.Real(2))));
p(x.toString());
p(x.resolve({"x":15}).toString());


var x = (new SM.Real(2)).add(new SM.Variable('x'));
p(x.toString());
var x = (new SM.Variable('y')).add(new SM.Variable('x'));
p(x.toString());
var x = (new SM.Variable('y')).exponentiate(new SM.Variable('x'));
p(x.toString());
p(x.resolve({"x":3,"y":2}).toString());
p(x.resolve({"x":3}).toString());
p(x.resolve({"y":2}).toString());
p(x.resolve({"y":(new SM.Real(2)).add(new SM.Variable('x'))}).toString());
p(x.resolve({"y":(new SM.Real(2)).add(new SM.Variable('x'))}).resolve({"x":3}).toString());
