var happy = {
  USPhone: function (val) {
    return /^\(?(\d{3})\)?[\- ]?\d{3}[\- ]?\d{4}$/.test(val)
  },
  
  // matches mm/dd/yyyy (requires leading 0's (which may be a bit silly, what do you think?)
  date: function (val) {
    return /^(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/(?:\d{4})/.test(val);
  },
  
  email: function (val) {
    return /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(val);
  },
  
  minLength: function (val, length) {
    return val.length >= length;
  },
  
  maxLength: function (val, length) {
    return val.length <= length;
  },
  
  equal: function (val1, val2) {
    return (val1 == val2);
  }
};

$(document).ready(function() {
	$("#b_add").click(function() {
		buttonAddPoint();
	});

	$("#b_remove").click(function() {
		var p = $("#s_points").val();
		ourGraph.removePoint(p);
		$("#s_points :selected").remove();
	});

	$("#b_removeall").click(function() {
		ourGraph.removeAllPoints();
		$("#s_points").empty();
	});

	$("#x_range").change(function() {
		ourGraph.changeX($(this).val());

	});

	$("#y_range").change(function() {
		ourGraph.changeY($(this).val());

	});

	$("#b_removefunc").click(function() {
		var f = $("#s_functionlist").val();
		ourGraph.removeFunction(f);
		$("#s_functionlist :selected").remove();
					
	});

	$('input[name="f_radio"]').click(function() {
		ourGraph.changeInterpolation($(this).val());
	});

	$("#b_removeallfunc").click(function() {
		$("#s_functionlist").empty();
		ourGraph.removeAllFunctions();			
	});

	$("#b_clear").click(function() {
		
		$("#s_functionlist").empty();
		$("#s_points").empty();
		ourGraph.clear();
	});

	$("#s_functionlist").click(function() {

		$("#f_equation p").detach();
		$("#f_equation").append("<p>"+$("#s_functionlist").val()+"</p>");
	});

	$("#f_imm").change(function() { 
		ourGraph.immediate = $(this).prop("checked");
		$("#b_genfunc").prop("disabled",ourGraph.immediate);
	});

	$("#b_genfunc").click(function() {
		var newpoly = ourGraph.generateFunction();
		$("#s_functionlist").append('<option>'+newpoly+'</option>');
		ourGraph.drawLatest();	
	});

	var pointindex = new SDB.Index("hasPoints",false,false); 	
	var functionindex = new SDB.Index("hasFunctions",false,false); 	
	var nameindex =  new SDB.Index("name",true,false);
	var indices = [pointindex,functionindex,nameindex];
	var rdbbucket = new SDB.Bucket("DataSets",{keyPath: "id",autoIncrement: true},indices);
	var dbadapter = new SDB.IndexedDBAdapter("NumericData",5);
	dbadapter.addBucket(rdbbucket);
	rdb = new SDB.RESTDB(dbadapter);
	rdb.adapterSetup(function() {
		var classify ={}; 
		classify[SM.Term.serializeName] = SM.Term.fromWebWorker;
		classify[SM.Polynomial.serializeName] = SM.Polynomial.fromWebWorker;
		classify[SM.PiecewiseFunction.serializeName] = SM.PiecewiseFunction.fromWebWorker;

		rdb.get("DataSets",null,function(x) {
			if(x.funcs){
				x.funcs.forEach(function(y) {
					classify[y.serializeName](y);
				});
			}

			if(x.points) {
				x.points.forEach(function(p){ SM.reattachMethods(p,SM.Point);});
			}
			datasets[x.name] = x;
			$("#s_datasets").append('<option value="'+x.name+'">'+x.name+'</option>');
		});
	});
	
	$("#b_savesvg").click(function() {
		var savename = $("#t_savename").val();
		if(savename === "") {
			savename = "graph";
		}
		var savenameparts = savename.split('.');
		if(savenameparts[savenameparts.length-1] !== "svg");
		{
			savename += ".svg";
		}
		var svgmaker = new SM.SVG(ourGraph);
		saveAs(new Blob([svgmaker.toXML()]),savename);
	});

	var basicLog = function(x) {console.log(x);};
	$("#b_savepts").click(function() {
		var pointsname = prompt("What do you want to name this point set?");	
		var newrecord = {name:pointsname,points:ourGraph.points,
			hasPoints:1,hasFunctions:0};
		rdb.post("DataSets",newrecord,basicLog);
		datasets[pointsname] = {name:pointsname,points:ourGraph.points};
		$("#s_datasets").append('<option>'+pointsname+'</option>');
	});

	$("#b_savefunc").click(function() {
		var fnsetsname = prompt("What do you want to name this function set?");	
		var newrecord ={name:fnsetsname,
			funcs:ourGraph.functions.map(function(x){return x.toWebWorker()}),
			hasPoints:0,hasFunctions:1};
		rdb.post("DataSets",newrecord,basicLog);
		datasets[fnsetsname] = {name:fnsetsname,funcs:ourGraph.functions};
		$("#s_datasets").append('<option>'+fnsetsname+'</option>');
	});

	$("#b_loaddata").click(function() {
		var dataselected = $("#s_datasets").val();
		var data = datasets[dataselected];
		if(data) {
			if(data.points) {
				data.points.forEach(function(p) {		
					$("#s_points").append('<option>'+p+'</option>');
					ourGraph.points.push(p);
					ourGraph.redraw();
				});
			}
			if(data.funcs) {
				data.funcs.forEach(function(fn) {		
					$("#s_functionlist").append('<option>'+fn+'</option>');
					ourGraph.addFunction(fn);
					ourGraph.redraw();
				});
			}
		}
	});

	
	$("#register").isHappy({
		fields: {
			'#nuname': {
				required: true,
				message: 'Please enter a username.'
			},
			'#nuemail': {
				required:true,
				message: 'Please enter an email address.',
				test: happy.email
			},
			'#pass1':{
				required: true,
				message: 'Please enter a new password',
				test: happy.equal,
				arg: function() {
					return $("#pass2").val();
				}
			},
			'#pass2':{
				required: true,
				message: 'Please enter your password again.'
			}
		},
		submitButton: '#registersubmit'
	});

	$("#registersubmit").click(function() {
		if($(".unhappy").length === 0)
		{
			var response = function(rdata) {
				if(rdata['_id'] !== undefined) {
					$("#register").hide();
					$("#login").hide();
					$("#header").append("<h3>Welcome "+rdata.username);
					username = rdata.username;
				}
			}
			$.post("/users/",$("#register").serializeArray(),response,"json");
		}
	});

	$("#login").isHappy({
		fields: {
			'#uname':{
				required: true,
				message: 'Please enter your username to login.'
			},
			'#upass':{
				required: true,
				message: 'Please enter your password to login.'
			}
			
		},
		submitButton: '#loginsubmit'
	});

	$("#loginsubmit").click(function() {
		if($(".unhappy").length === 0)
		{
			var response = function(rdata) {
				if(rdata['_id'] !== undefined) {
					$("#login").hide();
					$("#register").hide();
					$("#header").append("<h3>Welcome "+rdata.username);
					username = rdata.username;
				}
			}
			$.post("/login/",$("#login").serializeArray(),response,"json");
		}
	});
});
