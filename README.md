piou-selector
=============

Description
-----------

Piou-selector est un script de selecteur utilisant les fonctions querySelector et querySelectorAll et est aussi compatible sur les 
navigateurs ne les prenant pas en compte.
Le parseur est un recurcive descent et suit la grammaire suivante:
`````
exp			:= <base> > <exp>
			 | <base> ~ <exp>
			 | <base> + <exp>
			 | <base> <exp>
			 | <base>
base		:= tag<suit>
			: <sup>
suit		:= <sup>
			 | E
sup			:= #ident<suit>
			 | .class<suit>
			 | <pseu><suit>
			 | <attr><suit>
pseu		:= :pseudo
			 | :pseudo(...)
attr		:= [attr]
			 | [attr=value]
			 | [attr*=value]
			 | [attr|=value]
			 | [attr^=value]
			 | [attr$=value]
			 | [attr~=value]
`````
			 

Utilisation
-----------

`````javascript
var elements = piou.selector("#foo bar"); 
`````

