importScripts("algebra.js");
"use strict";
var classify ={}; 
classify[SM.Term.serializeName] = SM.Term.fromWebWorker;
classify[SM.Polynomial.serializeName] = SM.Polynomial.fromWebWorker;
classify[SM.PiecewiseFunction.serializeName] = SM.PiecewiseFunction.fromWebWorker;

var currentfunction;
onmessage = function(event) {
	switch(event.data.cmd) {
		case 'calc': 
		var fn = event.data.fn;
		classify[fn.serializeName](fn);
		var plist = [];
		var range = event.data.range;
		var ingraph = false;
		var oldery;
		for(var i=0; i < range; i+=range/512)
		{
			var x = event.data.startx+i;
			var newy = fn.resolve(x);
			if(newy != undefined) {
				if(newy >= event.data.ylow && newy <= event.data.yhigh) {
					if(ingraph == false && oldery != undefined) {
						plist.push(oldery);	
					}
					plist.push(new SM.Point(x,newy));	
					ingraph = true;
				}else if(ingraph == true) {
					plist.push(new SM.Point(x,newy));	
					ingraph = false;
				}
				oldery = new SM.Point(x,newy);
			}
		}
		postMessage({points:plist,color:fn.color});
		break;
	}
}

onerror = function(event) { 
	postMessage(event);
}
//postMessage("("+event.data.value+" ,"+currentfunction.resolve(parseFloat(event.data.value))+")");
