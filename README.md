grapher
=======
This project is a basic computer algebra system written in Javascript. I started work on it to implement numerical algorithms that I was learning. Most of the algorithms worked with polynomials and some matrices. Several methods lent themselves to implementing a graphical interface to work with. Then it occurred to me that I could build on both mathematics and software design to make an interesting project. The challenge of writing good, object-oriented, documented, tested, and useful code is what has been the secondary goal. 

I realize I am reinventing the wheel somewhat but I feel like it is a good practice of knowledge and skill. The realm of math software is dominated mostly by native applications. There are exceptions like Wolfram Alpha but it is limited for non-paying customers. Javascript isn't the best language for scientific computation for a couple of reason but I don't think that means these capabilities should not be present on the web. This is still a learning project for me in a variety of ways but I hope to end with a useful application. 

Implemented Features
--------------------
1.  Standard matrix operations (addition, subtraction, multiplication)
2.	Polynomial addition, subtraction, multiplication, division, exponentiation, evaluation (including multivariable polynomials)
3.	Piecewise Functions
4.	Naïve Gaussian Elimination
5.	Scaled Partial Pivot Gaussian Elimination
6.	LU Decomposition
7.	Basic Simpsons Rule
8.	Bisection method
9.	Romberg Extrapolation
10.	Trapezoid Rule
11.	Lagrange Interpolation
12.	First Degree Spline
13.	Second Degree Spline
14.	Natural Cubic Spline 
15.	Orthogonal Polynomials
16.	Method of Least Squares
17.	2D graphing 
18.	Unit Tests for most Polynomial code
19.	Nearly complete JSDocs Documentation
20. Web Workers assist graphing

Todo (in no particular order)
----------
1.Fully generic algebraic expression parsing and representation
2.Implement a full suite of numeric algorithms
3.Add local storage (IndexedDB)
4.Add remote storage (Riak or Mongo or similar)
5.3D graphing (with and without WebGl support)
6.Differential equation support and graphing
7.Console input and output
8.Calculus support
9.More unit tests
10.Function composition
