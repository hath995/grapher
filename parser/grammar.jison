/* Parses and evaluates algebraic expressions */

/* lexical grammar */
%lex
%%
\s+	{/* skip whitespace*/}
[0-9]+("."[0-9]+)?\b	{return 'NUMBER';}
"+"	{return '+';}
"-"	{return '-';}
"*"	{return '*';}
"/"	{return '/';}
"^"	{return '^';}
"("	{return '(';}
")"	{return ')';}
"|"	{return '|';}
"="	{return '=';}
"cos"	{return 'TRANS';}
"sin"	{return 'TRANS';}
"tan"	{return 'TRANS';}
"ln"	{return 'TRANS';}
"e"	{return 'TRANS';}
"arccos"	{return 'TRANS';}
"arcsin"	{return 'TRANS';}
"arctan"	{return 'TRANS';}
[a-zA-Z]	{return 'VARIABLE';}
/lex

%left '+' '-'
%left '*' '/'
%left '^'

%%
result
	: expression
		{return $1}
	| expression '|' subresult 
		{return ($1).resolve($3);}
	;

subresult
	: variable '=' expression subresult2
		{var holder = Object.create($4); holder[$1.name] = $3; $$ = holder;}		
	;

subresult2
	: '|' subresult
		{$$ = $2;}
	| 
		{$$ = {};}
	;

expression
	: component
		{$$ = $1}
	| component '+' expression 
		{$$ = new SM.Operation('+',$1,$3);}
	| component '-' expression 
		{$$ = new SM.Operation('-',$1,$3);}
	;

component
	: factor
		{$$ = $1} 
	| factor '*' component 
		{$$ = new SM.Operation('*',$1,$3);}
	| factor '/' component 
		{$$ = new SM.Operation('/',$1,$3);}
	;

factor
	: item 
		{$$ = $1}
	| item "^" factor 
		{$$ = new SM.Operation('^',$1,$3);}
	;

item
	: "(" expression ")" 
		{$$ = $2}
	| singular
		{$$ = $1}
	;
singular
	: transcendental
		{$$ = $1}
	| variable
		{$$ = $1}
	| number
		{$$ = $1}
	;

transcendental
	: TRANS "(" expression ")"
		{$$ = new SM.Transcendental($1,$3);}
	; 

variable
	: VARIABLE
		{$$ = new SM.Variable($1);}
	;

number
	: NUMBER
		{$$ = new SM.Real(Number($1))}
	;

