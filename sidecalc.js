importScripts("algebra.js");
"use strict";
var classify ={}; 
classify[Term.serializeName] = Term.fromWebWorker;
classify[Polynomial.serializeName] = Polynomial.fromWebWorker;
classify[PiecewiseFunction.serializeName] = PiecewiseFunction.fromWebWorker;

var currentfunction;
onmessage = function(event) {
	switch(event.data.cmd) {
		case 'calc': 
		var fn = event.data.fn;
		classify[fn.serializeName](fn);
		var plist = [];
		var range = event.data.range;
		for(var i=0; i < range; i+=range/512)
		{
			var x = event.data.startx+i;
			var newy = fn.resolve(x);
			if(newy != undefined) {
				plist.push(new Point(x,newy));	
			}
		}
		postMessage(plist);
		break;
	}
}
//postMessage("("+event.data.value+" ,"+currentfunction.resolve(parseFloat(event.data.value))+")");
