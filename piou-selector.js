/*

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

*/
/**
 * Lib de selecteur de noeuds
 * @author hakurou
 * @version 1.0.0
 */
(function(){
	"use strict";
	
	// Namespace creation for this lib
	if(typeof window.piou == "undefined")
		window.piou = {};
		
	////////////////////////////////////////////////
	var Query = {
		/**
		 * Dit s'il est possible d'utiliser le querySelector/querySelectorAll
		 */
		qs: (typeof document.querySelector != "undefined"),
		
		/**
		 * Retourne tous les elements dépendant d'un noeud
		 * @param context				Noeud de base (ex: document)
		 * @return Array 				Liste de noeuds s'il y en a, sinon null
		 */
		getAll: function(context)
		{
			if(context.all)
				var elements = context.all;
			else
				var elements = context.getElementsByTagName("*");
				
			var e = [];
			this.each(elements, function(){
				if(this.nodeName.toLowerCase() != "html")
					e.push(this);
			});
			return e;
		},
		
		/**
		 * Retourne tous les elements selon un attribut
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByAttr: function(s, context, parent, nList)
		{
			if(nList != null)
				return this.getByAttrIn(s, context, parent, nList);
			
			if(parent != null)
				return this.getByAttrFrom(s, context, parent, nList);
			
			if(this.qs)
				return context.querySelectorAll(s[0]);
			else
			{
				var e = [];
				var tmp = this.getAll(context);
				this.each(tmp, function(){
					if(Query.isAttrOk(s, this))
						e.push(this);
				});
				return e;
			}
		},
		
		/**
		 * Retourne tous les elements selon un attribut depuis une liste à filtrer
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByAttrIn: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(nList, function(){
				if(Query.isAttrOk(s, this))
					tmp.push(this);
			});
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon un attribut depuis une liste de noeuds parents
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByAttrFrom: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(parent, function(){
				var e = Query.getByAttr(s, this)
				Query.each(e, function(){
					tmp.push(this);
				});
			});
			return tmp;
		},
		
		/**
		 * Dit si l'attribut du nom courant correspond au selecteur
		 * @param s						Occurences du pattern concerné
		 * @param node					Noeud a tester
		 * @return Boolean				Retourne true si l'attribut correspond au selecteur, sinon false
		 */
		isAttrOk: function(s, node)
		{
			if(s.length == 2)
				return node.hasAttribute(s[1]);
			else if(s.length == 4)
			{
				var v = this.regProtect(s[3]);
				var a = null;
				if(s[1] == "class")
					a = node.className;
				else
					a = node.hasAttribute(s[1])
					
				if(s[2] == "=")
					return (a && a == s[3])
				else if(s[2] == "*=")
					return (a && a.match(v))
				else if(s[2] == "|=")
					return (a && 
						a.match(new RegExp("-" + v + "-|^" + v + "-|-" + v + "$|^" + v + "$")));
				else if(s[2] == "^=")
					return (a && a.match("^" + v));
				else if(s[2] == "$=")
					return (a && a.match(v + "$"));
				else if(s[2] == "~=")
					return (a && 
						a.match(new RegExp("\s+" + v + "\s+|^" + v + "\s+|\s+" + v + "$|^" + v + "$")));;
			}
			return false;
		},
		
		/**
		 * Protege les caracteres d'un chaine qui correspondent aux clés de regexp
		 * @param String str			Chaine à traiter
		 * @return String				Chaine traitée
		 */
		regProtect: function(str)
		{
			str = str.replace(/\./g, "\\.");
			str = str.replace(/\[/g, "\\[");
			str = str.replace(/\]/g, "\\]");
			str = str.replace(/\(/g, "\\(");
			str = str.replace(/\)/g, "\\)");
			str = str.replace(/\+/g, "\\+");
			str = str.replace(/\*/g, "\\*");
			str = str.replace(/\?/g, "\\?");
			
			return str;
		},
		
		/**
		 * Retourne tous les elements selon un id
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getById: function(s, context, parent, nList)
		{
			if(nList != null)
				return this.getByIdIn(s, context, parent, nList);
			
			if(parent != null)
				return this.getByIdFrom(s, context, parent, nList);
			
			if(this.qs)
				return context.querySelector(s[0]);
			else
				return context.getElementById(s[1]);
		},
		
		/**
		 * Retourne tous les elements selon un id depuis une liste de noeuds parents
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByIdFrom: function(s, context, parent, nList)
		{
			var e = this.getById(s, context);

			if(e == null)
				return [];
				
			var tmp = [];
			var p = e;
			do
			{
				p = p.parentNode;
				this.each(parent, function(){
					if(p == this)
						tmp =[e];
				});
			}
			while(p != null && tmp == null);
			
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon un id sur une liste a filtrer
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByIdIn: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(nList, function(){
				if(this.id == s[1])
					tmp = [this];
			});
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon une classe
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByClass: function(s, context, parent, nList)
		{
			if(nList != null)
				return this.getByClassIn(s, context, parent, nList);
				
			if(parent != null)
				return this.getByClassFrom(s, context, parent, nList);	
				
			if(this.qs)
				return context.querySelectorAll(s[0]);
			else if(typeof context.getElementsByClassName != "undefined")
				return context.getElementsByClassName(s[1]);
			else
				return this.getByClass(s, context, parent, this.getAll(context));
		},
		
		/**
		 * Retourne tous les elements selon une classe depuis une liste de noeuds parents
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByClassFrom: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(parent, function(){
				var e = Query.getByClass(s, this);
				Query.each(e, function(){
					tmp.push(this);
				});
			});
			
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon une classe dans une liste de noeuds à filtrer
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByClassIn: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(nList, function(){
				if(this.className.match(new RegExp("\s+" + s[1] + "\s+|^" + s[1] + "$|\s+" + s[1] + "$|^" + s[1] + "\s+")))
					tmp.push(this);
			});
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon un nom de noeud
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByTag: function(s, context, parent, nList)
		{
			if(nList != null)
				return this.getByTagIn(s, context, parent, nList);
			
			if(parent != null)
				return this.getByTagFrom(s, context, parent, nList);

			if(this.qs)
				return context.querySelectorAll(s[1]);
			else
				return context.getElementsByTagName(s[1]);				
		},
		
		/**
		 * Retourne tous les elements selon un nom de noeud sur une liste de noeuds à filtrer
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByTagIn: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(nList, function(){
				if(this.nodeName.toLowerCase() == s[1].toLowerCase())
					tmp.push(this);
			});

			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon un nom depuis une liste de noeuds parents
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByTagFrom: function(s, context, parent, nList)
		{
			var nl = [];
			this.each(parent, function(){
				var e = Query.getByTag(s, this);
				Query.each(e, function(){
					nl.push(this);
				});
			});

			return nl;
		},
		
		/**
		 * Retourne tous les elements selon une pseudo classe
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByPseu: function(s, context, parent, nList)
		{
			var tmp = [];
			
			if(nList != null)
				return this.getByPseuIn(s, context, parent, nList);
				
			if(parent != null)
				return this.getByPseuFrom(s, context, parent, nList);
				
			if(this.qs)
				tmp = context.querySelectorAll(s[0]);
				
			if(tmp.length == 0)
			{
				var eList = this.getAll(context);
				return this.getByPseu(s, context, parent, eList);
			}
			else
				return tmp;
		},
		
		/**
		 * Retourne tous les elements selon une pseudo classe sur une liste de noeuds à filtrer
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByPseuIn: function(s, context, parent, nList)
		{
			var tmp = [];
			if(typeof selector.pseu[s[1]] != "undefined")
			{
				var args = (s[2] != null) ? s[2].split(/\s*,\s*/): [];
				
				this.each(nList, function(){
					if(selector.pseu[s[1]].apply(this, args))
						tmp.push(this);
				})
			}
			return tmp;
		},
		
		/**
		 * Retourne tous les elements selon une pseudo classe depuis une liste de noeuds parents
		 * @param s						Occurences du pattern concerné
		 * @param context				Noeud de base (ex: document)
		 * @param parent				Liste des noeuds parents
		 * @param nList					Liste des noeuds sur lesquels il faut filtrer
		 * @return Array				Liste de noeuds s'il y en a, sinon null
		 */
		getByPseuFrom: function(s, context, parent, nList)
		{
			var tmp = [];
			this.each(parent, function(){
				var r = Query.getByPseu(s, this);
				Query.each(r, function(){
					tmp.push(this);
				});
			});
			return tmp;
		},
		
		/**
		 * Retourne true si le noeud courant correpond a la regle nth
		 * @param index					Position du noeud courant
		 * @param m						Premier chiffre du nth
		 * @param st					Pas de démarrage
		 * @return Boolean				True si ca correspond, sinon false
		 */
		nthChild: function(index, m, st)
		{
			var r = null;
			if((m == 0 | m == null) && st != null && st >= 0)
				return (index == st);
			else if(m == "-" && st != null)
				return (-index + parseInt(st) >= 0);
			else if(st != null)
				return ((r = ((index - st) / m)) !== false && r >= 0 && parseInt(r) == r);
			else if(st == null)
				return ((index % m) == 0);	
	
			return false;
		},
		
		/**
		 * Retourne la position d'un noeud dans la liste de ses pairs
		 * @param node					Noeud dont la position est a récupérer
		 * @param inverse				Compte a partie du debut (false), sinon a partir de la fin (true)
		 * @return Int					Position
		 */
		getNodePosition: function(node, name, inverse)
		{
			var pos = 0, nodes = 0, found = false;
			this.each(node.parentNode.childNodes, function(){
				if(name == null || node.nodeName.toLowerCase() == name)
					nodes++;
					
				if(!found)
					pos++;
					
				if(node == this && (name == null || node.nodeName.toLowerCase() == name))
					found = true;
			});
			return (inverse) ? nodes - pos + 1: pos;
		},
		
		/**
		 * Test si le noeud courant correspond a tel index, tel type
		 */
		nth: function(node, value, inverse, name)
		{
			var i = 1, r = null;
			i = Query.getNodePosition(node, name, (inverse) ? true: false);
		
			if((value == "even" && (i % 2) == 0) || 
				(value == "odd" && (i % 2) != 0) ||
				(value.match(/^\d+$/) && value == i))
				return true;
			else if((r = value.match(/^((-|\+)?(\d+)?)n((-|\+)\d+)?$/)))
				return Query.nthChild(
					i, 
					(r[1] != null) ? r[1]: null, 
					(r[4] != null) ? r[4]: null);	
			return false;	
		},
		
		/**
		 * Opère une boucle sur une liste de noeud au nodeType == 1
		 * @param eList					Liste a itérer
		 * @param func					Callback à appeler à chaque itération
		 */
		each: function(eList, func)
		{
			if(eList == null)
				return;
			
			if(eList.length == null || eList.nodeType != null)
				eList = [eList];
			
			if(eList.length > 0)
				for(var i = 0, iMax = eList.length; i < iMax; ++i)
					if(eList[i].nodeType == 1)
						func.call(eList[i], i);
		}
	};	
	
	////////////////////////////////////////////////
	/**
	 * Classe de parsing des selecteurs
	 */
	var Parser = (function(){
		/**
		 * Constructeur
		 * @param str					Selecteur
		 * @param context				Noeud racine, document par defaut
		 */
		var Parser = function(str, context)
		{
			/**
			 * Définition des différents lexemes d'un selecteur
			 */
			this.pt = {
				id: 		/^#([\w-]+)/,
				"class":	/^\.([\w-]+)/,
				tag:		/^([\w-]+)/,
				blank:		/^\s+/,
				tilde:		/^~\s+?/,
				add:		/^\+\s+?/,
				children:	/^>\s+?/,
				pseu:		/^:([\w-]+)/,
				pseuArg:	/^:([\w-]+)\(([^\)]+)\)/,
				attrCpx:	/^\[([\w-]+)(=|\*=|\|=|\^=|\$=|~=)([^\]]+)\]/,
				attr:		/^\[([\w-]+)\]/
			};
			
			this.str = str;
			this.context = context;
		};
		
		Parser.prototype = {
			/**
			 * Amorce la collecte des noeuds
			 * @return Array			Liste des noeuds trouvés			
			 */
			parse: function(parent, nList)
			{	
				this.match(this.pt.blank);
				var r = this.parseExp(parent, nList);
				return (r != null && r.length == null) ? [r]: r;
			},
			
			/**
			 * Retourne la liste des noeuds trouvés sur une suite de noeuds fils
			 * @param parent			Noeuds parents
			 * @param nList				Liste de noeuds à filtrer
			 * @return Array			Liste des noeuds trouvés			
			 */
			getChildrenExp: function(parent, nList)
			{
				var tmp = []; 
				Query.each(nList, function(){
					Query.each(this.childNodes, function(){
						tmp.push(this);
					});
				});
				
				return this.parseExp(parent, tmp);
			},
			
			/**
			 * Retourne la liste des noeuds trouvés sur une suite de noeuds frères
			 * @param parent			Noeuds parents
			 * @param nList				Liste de noeuds à filtrer
			 * @return Array			Liste des noeuds trouvés			
			 */
			getSiblingExp: function(parent, nList)
			{
				var tmp = [];
				Query.each(nList, function(){
					var n = this.nextElementSibling;
					do
					{
						if(n.nodeType == 1)
							tmp.push(n);
							
						n = n.nextElementSibling;
					}
					while(n != null);
				});
				
				return this.parseExp(parent, tmp);
			},
			
			/**
			 * Retourne la liste des noeuds trouvés sur une suite de noeuds qui se suivent
			 * @param parent			Noeuds parents
			 * @param nList				Liste de noeuds à filtrer
			 * @return Array			Liste des noeuds trouvés			
			 */
			getNextNodeExp: function(parent, nList)
			{
				var tmp = [];
				Query.each(nList, function(){
					var n = this.nextElementSibling;
					while(n != null)
					{
						if(n.nodeType == 1)
						{
							tmp.push(n);
							break;
						}
							
						n = n.nextElementSibling;
					}
				});
				
				return this.parseExp(parent, tmp);
			},
			
			/**
			 * Parse les expressions selon la grammaire définie
			 * @param parent			Noeuds parents
			 * @param nList				Liste de noeuds à filtrer
			 * @return Array			Liste des noeuds trouvés			
			 */
			parseExp: function(parent, nList)
			{
				var e = this.parseBase(parent, nList);
				
				if(this.match(this.pt.blank) && this.str.length > 0)
				{
					if((this.match(this.pt.children)) != null)
						e = this.getChildrenExp(parent, e);
					else if((this.match(this.pt.add)) != null)
						e = this.getNextNodeExp(parent, e);
					else if((this.match(this.pt.tilde)) != null)
						e = this.getSiblingExp(parent, e);
					else
						e = this.parseExp(e, nList);
				}
				
				return e;
			},
			
			/**
			 * @see selector.parseExp
			 */
			parseBase: function(parent, nList)
			{
				var e = null;
				var r = null;
				if((r = this.match(this.pt.tag)) != null)
				{
					e = Query.getByTag(r, this.context, parent, nList);
					var tmp = this.parseSuit(parent, e);
					
					if(tmp != null)
						e = tmp;
				}
				else
					e = this.parseSup(parent, nList);
				
				if(e == null)
					throw "piou-selector::parseBase: Error, node not found";
					
				return e;
			},
			
			/**
			 * @see selector.parseExp
			 */
			parseSuit: function(parent, nList)
			{
				return this.parseSup(parent, nList);
			},
			
			/**
			 * @see selector.parseExp
			 */
			parseSup: function(parent, nList)
			{
				var e = null;
				var r = null;
				if((r = this.match(this.pt.id)) != null)
					e = Query.getById(r, this.context, parent, nList);
				else if((r = this.match(this.pt["class"])) != null)
					e = Query.getByClass(r, this.context, parent, nList);
				else
				{
					e = this.parsePseu(parent, nList);
					if(e == null)
						e = this.parseAttr(parent, nList);
				}
				
				if(e != null)
				{
					var r = this.parseSuit(parent, e);
					if(r != null)
						e = r;
				}
					
				return e;
			},
			
			/**
			 * @see selector.parseExp
			 */
			parsePseu: function(parent, nList)
			{
				var e = null;
				var r = null;
				if((r = this.match(this.pt.pseuArg)) != null || (r = this.match(this.pt.pseu)) != null)
					e = Query.getByPseu(r, this.context, parent, nList);
				
				return e;
			},
			
			/**
			 * @see selector.parseExp
			 */
			parseAttr: function(parent, nList)
			{
				var e = null;
				var r = null;
				if((r = this.match(this.pt.attr)) != null || (r = this.match(this.pt.attrCpx)) != null)
					e = Query.getByAttr(r, this.context, parent, nList);
				
				return e;
			},
			
			/**
			 * Trouve le prochain lexeme et deduis son nombre de caractères du
			 * selecteur courant
			 * @param pattrn 			Pattern de définition d'un lexeme
			 * @return Array			Retourne les occurences correspondantes
			 */
			match: function(pttrn)
			{
				var r = null;
				if((r = this.str.match(pttrn)))
					this.str = this.str.substr(r[0].length);

				return r;
			}
		};
		
		return Parser;
	})();
	
	////////////////////////////////////////////////
	/**
	 * Demande une selection depuis un selecteur type CSS
	 * @param str						Selecteur
	 * @param context					Noeud racine, par defaut "document"
	 * @param Array						Retourne la liste des noeuds trouvés
	 */
	var selector = function(str, context)
	{
		if(context == null)
			context = document;
			
		var nodes = [];
		var parts = str.split(/,/g);

		for(var i in parts)
		{
			var p = new Parser(parts[i], context);
			var tmp = p.parse();console.log(tmp);
			Query.each(tmp, function(){
				nodes.push(this);
			});
		}
		
		return nodes;
	}
	
	/**
	 * Couple Query avec selector afin de pouvoir l'utiliser depuis l'extérieur si besoin
	 */
	selector.query = Query;
	
	/**
	 * Liste des fonctions des pseudo-classes, peut être altérée depuis l'extérieur
	 */
	selector.pseu = {
		"first-child": function(){
			var n = this.parentNode.childNodes;
			for(var i = 0, iMax = n.length; i < iMax; ++i)
				if(n[i].nodeType == 1)
					break;
			
			return (n[i] == this);
		},
		
		"nth-child": function(value){
			return Query.nth(this, value);
		},
		
		"nth-last-child": function(value){
			return Query.nth(this, value, true);
		},
		
		"last-child": function(){
			var n = this.parentNode.childNodes;
			for(var i = n.length - 1; i > 0; --i)
				if(n[i].nodeType == 1)
					break;
			
			return (n[i] == this);
		},
		
		"nth-of-type": function(value){
			return Query.nth(this, value, false, this.nodeName.toLowerCase());
		},
		
		"nth-last-of-type": function(value){
			return Query.nth(this, value, true, this.nodeName.toLowerCase());
		},
		
		"first-of-type": function(){
			var n = this.parentNode.childNodes;
			for(var i = 0, iMax = n.length; i < iMax; ++i)
				if(n[i].nodeType == 1 && this.nodeName.toLowerCase() == n[i].nodeName.toLowerCase())
					break;
			
			return (n[i] == this);
		},
		
		"last-of-type": function(){
			var n = this.parentNode.childNodes;
			for(var i = n.length - 1; i >= 0; --i)
				if(n[i].nodeType == 1 && this.nodeName.toLowerCase() == n[i].nodeName.toLowerCase())
					break;
			
			return (n[i] == this);
		},
		
		"only-child": function(){
			var nbNodes = 0;
			Query.each(this.parentNode.childNodes, function(){
				nbNodes++;
			})
			
			return (nbNodes == 1);
		},
		
		"empty": function(){
			return (this.childNodes.length == 0);
		},
		
		"not": function(value){
			var p = new Parser(value, document);
			return (p.parse(null, this).length == 0)
		},
		
		"checked": function(){
			if(this.checked)
				return true;
			else
				return false;
		}
	};
	
	selector.version = "1.0.0";
	window.piou.selector = selector;
		
})();
