

/*
Create our svg stub.
foreach function convert to path
if polynomial rank greater than 3 do nothing
convert function to parametric and scale for t=[0,1]
then take coefficient and plug them into matrices and solve for control points
scale all points to container.
*/
/**
	A class for generating SVG elements representing functions
	@class
	@constructor
	@param {integer} h The height in pixels of the element
	@param {integer} w The width in pixels of the element
	@param {Range} xr The range of x values represented in the graph. 
	@param {Range} yr The range of the y values represented 
**/
function SVG(h, w, g) {
	this.height = h;
	this.width = w;
	this.funcs = [];
	this.graph = g;

}

SVG.prototype = {
	/**
		Store functions to be drawn.
		@param {[Polynomial | PiecewiseFunction]} curves Array of Polnomials and or Piecewise Functions
	**/
	addCurves: function(curves) {
		//test if curve is piecewise or other
		//if so generate parametric expression
		//if quadratic or cubic find control points
		//generate xml and attach to object
		for(var i =0; i < curves.length; i++) {
			console.log("yes")
			var fn = curves[i];
			if(fn instanceof PiecewiseFunction) {
				console.log("Better");
				var unitspacepoints = fn.generateBezierPaths();
				var pixelspacepoints = [];
				for(var j=0; j < unitspacepoints.length; j++) {
					var newps = [];
					for(var k=0; k < unitspacepoints[j].length; k++) {
						newps.push(this.graph.pointToPixel(unitspacepoints[j][k]));
					}
					pixelspacepoints.push(newps);   
				}
				this.funcs.push(pixelspacepoints);
			}else if(fn instanceof Polynomial) {
				console.log("?");	
			}else{
				//what the heck!
				console.log("!!?#*$%");	
			}
		}
		//if other test if degree <= 3


	},

	/**
		Generates the SVG XML

	**/
	toXML: function() {
		//for each funcc append xml to xml string
		var xml = '<svg version="1.1" baseProfile="full" width="'+canvas.width+'" height="'+canvas.height+'" xmlns="http://www.w3.org/2000/svg">';
		for(var i = 0; i < this.funcs.length; i++ ) {
			for(var j = 0; j< this.funcs[i].length; j++) {
				var cv = this.funcs[i][j];
				xml +='<path d="M '+cv[0].x+' '+cv[0].y+' Q '+cv[1].x+' '+cv[1].y+', '+cv[2].x+' '+cv[2].y+'" stroke="orange" fill="transparent"/>';  
			}
		}
		return xml+'</svg>';
	},
}
