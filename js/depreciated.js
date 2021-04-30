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
		}
	info (){
		this.a.forEach( aElt => console.info( aElt[0] +"\t"+ JSON.stringify( aElt[1] )))
		}
	}

/* 
let oConfigFabric = new ConfigFabric( oDefaultSettings )
let oNewConfig = oConfigFabric.get( oSettings )
*/
class ConfigFabric {
	constructor ( oDefaultSettings ){
		this.oDefaultSettings = oDefaultSettings // ne doit être modifié
		}
	get ( oSettings ){
		return Object.assign( {}, this.oDefaultSettings, oSettings )
		}
	}