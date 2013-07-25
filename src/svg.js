

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
SM.SVG = function(g) {
	this.funcs = [];
	this.graph = g;
	this.addCurves(g.functions);

}

SM.SVG.prototype = {
	/**
		Store functions to be drawn.
		@param {[Polynomial | PiecewiseFunction]} curves Array of Polnomials and or Piecewise Functions
	**/
	addCurves: function(curves) {
		//test if curve is piecewise or other
		//if so generate parametric expression
		//if quadratic or cubic find control points
		//generate xml and attach to object
		function transformPointsets(usp,g) {
			var psp =[];
			for(var j=0; j < usp.length; j++) {
				var newps = [];
				for(var k=0; k < usp[j].length; k++) {
					newps.push(g.pointToPixel(unitspacepoints[j][k]));
				}
				psp.push(newps);   
			}
			return psp;
		}
		for(var i =0; i < curves.length; i++) {
			var fn = curves[i];
			if(fn instanceof SM.PiecewiseFunction) {
				var unitspacepoints = fn.generateBezierPaths();
				var pixelspacepoints = transformPointsets(unitspacepoints,this.graph);;
				this.funcs.push(pixelspacepoints);
			}else if(fn instanceof SM.Polynomial) {
				if(fn.degree() <= 3) {
					var pw = new SM.PiecewiseFunction([fn],[this.graph.xrange()]);
				
				}else{
					var xrange = this.graph.xrange();
					var delta = (xrange.upperbound-xrange.lowerbound)/20;
					var curvepoints = [];
					for(var j = 0; j <= 20; j++) {
						var xprime = xrange.lowerbound+j*delta;
						curvepoints.push(new SM.Point(xprime,fn.resolve(xprime)));
					}
					var pw = SM.PiecewiseFunction.createThirdDegSpline(curvepoints);
				}
				var unitspacepoints = pw.generateBezierPaths();
				var pixelspacepoints = transformPointsets(unitspacepoints,this.graph);;
				this.funcs.push(pixelspacepoints);

			}else{
				throw new TypeError("Unexpected type encountered");
				//what the heck!
			}
		}
		//if other test if degree <= 3


	},

	/**
		Generates the SVG XML
		@return {string} The SVG XML

	**/
	toXML: function() {
		//for each funcc append xml to xml string
		var COLOR = new Array('Blue','LimeGreen','Gold','Sienna','DarkRed','LightSlateGray','Purple','Black');
		var xml = '<svg version="1.1" baseProfile="full" width="'+canvas.width+'" height="'+canvas.height+'" xmlns="http://www.w3.org/2000/svg">';
		for(var i = 0; i < this.funcs.length; i++ ) {
			var fncolor = this.graph.functions[i].color;
			for(var j = 0; j< this.funcs[i].length; j++) {
				var cv = this.funcs[i][j];
				if(cv.length === 3) {
					xml +='<path d="M '+cv[0].x+' '+cv[0].y+' Q '+cv[1].x+' '+cv[1].y+', '+cv[2].x+' '+cv[2].y+'" stroke="'+fncolor+'" fill="transparent"/>';  
				}else if(cv.length === 2) {
					xml +='<path d="M '+cv[0].x+' '+cv[0].y+' L '+cv[1].x+' '+cv[1].y+'" stroke="'+fncolor+'" fill="transparent"/>';  
				}else if(cv.length === 4) {
					xml +='<path d="M '+cv[0].x+' '+cv[0].y+' C '+cv[1].x+' '+cv[1].y+', '+cv[2].x+' '+cv[2].y+', '+cv[3].x+' '+cv[3].y+'" stroke="'+fncolor+'" fill="transparent"/>';  
				}
			}
		}
		return xml+'</svg>';
	},
}
