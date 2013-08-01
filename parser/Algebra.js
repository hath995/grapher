

var SM = SM || {};
SM.ComposeHelpers = function() {
	this.add = function(that) {
		return new SM.Operation('+',this,that);	
	};
	this.subtract = function(that) {
		return new SM.Operation('-',this,that);
	}
	this.multiply = function(that) {
		return new SM.Operation('*',this,that);	
	};
	this.divide = function(that) {
		return new SM.Operation('/',this,that);
	};
	this.exponentiate = function(that) {
		return new SM.Operation('^',this,that);	
	};
}

SM.Real = function(x) {
	SM.ComposeHelpers.call(this,null);
	this.val = x;
}
SM.Real.prototype = {
	resolve: function(input) {
		return this;
	},
	toString: function() {
		return ""+this.val;
	}
}

SM.Variable = function(name) {
	SM.ComposeHelpers.call(this,null);
	this.name = name;
}

SM.Variable.prototype = {
	resolve: function(input) {
		if(this.name in input) {
			if(typeof input[this.name] === "number") {
				return new SM.Real(input[this.name]);
			}else{
				return input[this.name];
			}
		}else{
			return this;
		}
	},
	toString:function() {
		return this.name;
	}
}

SM.Operation = function(op,left, right) {
	SM.ComposeHelpers.call(this,null);
	this.op = op;
	this.left = left;
	this.right = right;
}

SM.Operation.ops = {
	"*":function(a,b) {
		return a*b;
	},
	"/":function(a,b) {
		return a/b;
	},
	"+":function(a,b) {
		return a+b;
	},
	"-":function(a,b) {
		return a-b;
	},
	"^":function(a,b) {
		return Math.pow(a,b);
	}

}

SM.Operation.prototype = {
	resolve: function(input) {
		var rleft = this.left.resolve(input);
		var rright = this.right.resolve(input);
		if(rleft instanceof SM.Real && rright instanceof SM.Real) {
			return new SM.Real(SM.Operation.ops[this.op](rleft.val,rright.val)); 
		}else{
			return new SM.Operation(this.op, rleft, rright);
		}
	},
	toString: function() {
		return "("+this.left.toString()+this.op+this.right.toString()+")";
	}
}

SM.Transcendental = function(fn,param) {
	SM.ComposeHelpers.call(this,null);
	this.fn = fn;
	this.param = param;	
}

SM.Transcendental.fns = {
	"cos":function(val) {
		return Math.cos(val);
	},
	"sin":function(val) {
		return Math.sin(val);
	},
	"tan":function(val) {
		return Math.tan(val);
	},
	"ln":function(val) {
		return Math.log(val);
	},
	"e":function(val) {
		return Math.exp(val);
	},
	"arccos":function(val) {
		return Math.acos(val);
	},
	"arcsin":function(val) {
		return Math.asin(val);
	},
	"arctan":function(val) {
		return Math.atan(val);
	}
}

SM.Transcendental.prototype = {
	resolve: function(input) {
		var rparam = this.param.resolve(input);
		if(rparam instanceof SM.Real) {
			return new SM.Real(SM.Transcendental.fns[this.fn](rparam.val)); 
		}else{
			return new SM.Transcendental(this.fn,rparam);
		}
	},
	toString: function() {
		return this.fn+"("+this.param.toString()+")";
	}
}

exports.SM = SM;

