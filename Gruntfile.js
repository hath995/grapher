
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: '///// Section /////',
				 banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				         '<%= grunt.template.today("yyyy-mm-dd") %> */',
			},
			dist: {
				src: ['src/Term.js','src/Polynomial.js','src/Piecewise.js','src/Matrix.js','src/Graph.js','src/svg.js','src/restdb.js','src/Algebra.js'],
				dest: 'build/grapher.js',
			},
		},
		jshint: {
			beforeconcat: ['src/Term.js','src/Polynomial.js','src/Piecewise.js','src/Matrix.js','src/Graph.js',],
			afterconcat: ['build/grapher.js']
		},
		copy: {
			main: {
				files: [{expand: true, cwd: 'build/', src: ['grapher.js'], dest: 'prod/js/'},
					{expand: true, cwd: 'vendor/', src: ['**'], dest:'prod/js/'},
					{expand: true, src: ['tests/**'], dest:'prod/'},
					{src: ['index.html'],dest:'prod/'}]
			}
		},
		uglify:{
			my_target: {
				files: {
					'./build/graphermin.js': ['./build/grapher.js']
				}
			}
		},
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default',['concat','copy']);
	//node node_modules/jsdoc2/app/run.js -a -t=node_modules/jsdoc2/templates/jsdoc src/*.js
	//./mongod --dbpath ~/code/node/grapher/data
}
