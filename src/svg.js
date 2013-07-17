

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
function SVG(h, w, xr, yr) {
	this.height = h;
	this.width = w;
	this.xrange = xr;
	this.yrange = yr;
	this.funcs = [];

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
			var fn = curves[i];
			if(fn instanceof PiecewiseFunction) {
				fn.generateBezierXML();
			}else if(fn instanceof Polynomial) {
				
			}else{
				//what the heck!
			}
		}
		//if other test if degree <= 3


	},

	/**
		Generates the SVG XML

	**/
	toXML: function() {
		//for each funcc append xml to xml string
	},
}
