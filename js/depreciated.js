/*
Sauvegarde des fonctions d'un objet en vue de les réappliquer
*/
class MancheHistory {
	constructor ( oObject ){
		this.oObject = oObject
		this.a = []
		}
	add ( sFunctionName, aArguments ){
		this.a.push([ sFunctionName, aArguments ])
		}
	reset (){
		this.a = []
		}
	apply (){
		let o = this.oObject
		this.a.forEach( aElt => o[ aElt[0]].apply( o, aElt[1]))
		this.a.length = this.a.length/2 // ???
		}
	info (){
		this.a.forEach( aElt => console.info( aElt[0] +"\t"+ JSON.stringify( aElt[1] )))
		}
	}