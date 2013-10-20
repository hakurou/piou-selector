piou-selector
=============

Description
-----------

Piou-selector est un script de selecteur utilisant les fonctions querySelector et querySelectorAll et est aussi compatible sur les 
navigateurs ne les prenant pas en compte.

Le parseur est un recurcive descent parser et suit la grammaire suivante:
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

Pour l'utiliser il suffit de l'appeler de la manière suivante:
`````javascript
var elements = piou.selector("#foo bar"); 
`````

La variable _elements_ est un tableau qui liste les noeuds trouvés si la recherche s'est bien passée, sinon c'est un tableau vide.

Il est possible de créer ses propres pseudo-classes:
`````javascript
piou.selector.pseu["foo"] = function(value){
	// Retourne un boolean, true pour accepter le noeud, false pour le refuser
	return (/*votre condition, this pointant sur le noeud à tester*/);
};

// Utilisation
var elements = piou.selector("div:foo(bar)"); // bar n'est qu'une valeur d'exemple
`````

