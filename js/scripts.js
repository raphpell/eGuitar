/*====================*/
/*=== Utilitaires ====*/
/*====================*/
// Mémorise les choix utilisateurs
Memoire =(function( sBase ){
	let o = JSON.parse( localStorage.getItem( sBase )) || {}
	return {
		clear:function(){
			localStorage.removeItem( sBase )
			},
		set:function( sName, mValue ){
			if( o[ sName ] == mValue ) return false
			o[ sName ] = mValue
			localStorage.setItem( sBase, JSON.stringify( o ))
			return true
			},
		get:function( sName ){
			return o[ sName ] || null
			}
		}
	})( 'eGuitar' )

Tag =function( sName, sClasses, sId ){
	var e = document.createElement( sName )
	if( sClasses ) e.className = sClasses
	if( sId ) e.id = sId
	return e
	}
Events ={
	get :function( evt ){
		return evt?evt:(window.event?window.event:null)
		},
	element :function( m ){
		if(!m)return null
		if(m.nodeName)return m
		if(m.type){
			m=Events.get(m)
			return m.target?(m.target.nodeType==3?m.target.parentNode:m.target):m.srcElement
			}
		return false
		}
	}

window.onselectstart =function(){ return false }	// prevent text selection

/*============================*/
/*=== VARIABLES SPECIALES ====*/
/*============================*/
let Publishers = (function( bDebug ){
	let o = {}
	let oTopics = {}
	let nID = -1
	o.publish =function( sTopic, mArg ){
		if ( ! oTopics[ sTopic ]) return false
		let aSubscribers = oTopics[ sTopic ]
		, n = aSubscribers ? aSubscribers.length : 0
		if( bDebug ) console.warn( `publish "${sTopic}" : "${mArg}"` )
		while( n-- ){
			if( bDebug ) console.info( `\t${aSubscribers[n].title}` )
			aSubscribers[ n ].func( mArg )
			}
		return this
		}
	o.subscribe =function( sTopic, fFunc, sTitle ){
		if( ! oTopics[ sTopic ]) oTopics[ sTopic ] = []
		if( bDebug ) console.info( `Publisher "${sTopic}" \n\t\tnew subscriber "${sTitle||''}"` )
		let sToken = ( ++nID ).toString()
		oTopics[ sTopic ].unshift({ token: sToken, func: fFunc, title:sTitle||'' })
		return sToken
		}
	o.unsubscribe =function( sToken ){
		for( let m in oTopics ){
			if( oTopics[ m ]){
				for( let i=0, ni=oTopics[m].length; i < ni; i++ ){
					if( oTopics[m][i].token === sToken ){
						oTopics[m].splice( i, 1 )
						return sToken
						}
					}
				}
			}
		return null
		}
	return o
	})( false )

// Objet wrapper : il sert à déclencher des événements quand la valeur de l'objet change
class SpecialVar {
	constructor ( sName, mValue ){
		this.id = sName
		this.value = mValue
		Publishers.subscribe( sName, m => Memoire.set( sName, m ), 'Memoire.set' )
		}
	setValue ( mValue ){
		this.value = mValue
		Publishers.publish( this.id, mValue )
		return mValue
		}
	getValue (){
		return this.value
		}
	refresh (){
		return this.setValue( this.getValue())
		}
	addSubscriber ( sTitle, fObserver ){
		return Publishers.subscribe( this.id, fObserver, sTitle )
		}
	}

// Variables partagés par tous les composants
// valeur changée -> composants mis à jour
function SpecialVars ( aVars ){
	aVars.forEach( ([sName, mDefaultValue ]) => {
		window[ sName ] = new SpecialVar ( sName, Memoire.get( sName ) || mDefaultValue )
		})
	}
SpecialVars([
	[ "La3", 440 ],
	[ "LeftHanded", 0 ],
	[ "Mirror", 0  ],
	[ "Notation", [0,'EN'] ], // Notation courante utilisé dans l'application [true,'FR'] = bBemol sLang
	[ "Notes", 0 ],
	[ "Numbers", 0 ],
	[ "Octaves", 0 ],
	[ "Sound", 0 ],
	[ "Tonic", 0 ],
	[ "Tuning", 0 ] // Accordage - defaut Accordage standard E ( voir Tunings )
	])

Notations= {
	choices :{
		'♯':{	FR:['La',	'La♯',	'Si',	'Do',	'Do♯',	'Ré',	'Ré♯',	'Mi',	'Fa',	'Fa♯',	'Sol',	'Sol♯'],
				EN:['A',	'A♯',	'B',	'C',	'C♯',	'D',	'D♯',	'E',	'F',	'F♯',	'G',	'G♯']},
		'♭':{	FR:['La',	'Si♭',	'Si',	'Do',	'Ré♭',	'Ré',	'Mi♭',	'Mi',	'Fa',	'Sol♭',	'Sol',	'La♭'],
				EN:['A',	'B♭',	'B',	'C',	'D♭',	'D',	'E♭',	'E',	'F',	'G♭',	'G',	'A♭']}
		},
	// Notations.getSequence = Retourne la sequence de 12 notes depuis la note de départ sNote
	getSequence :function( sNote ){
		var a = Notation.getValue()
		if( ! sNote ) return Notations.choices[ a[0]?'♭':'♯' ][ a[1]]
		else {
			sNote = Notations.getNoteName( sNote )
			var a = Notations.getSequence()
			var nIndex = a.indexOf( sNote )
			return a.slice( nIndex ).concat( a.slice( 0, nIndex))
			}
		},
	getNoteName :function( sNote ){
		var sIndex1
		if( ~sNote.indexOf('b')) sNote = sNote.replace( /b/, '♭' )
		if( ~sNote.indexOf('♭')) sIndex1 = "♭"
		if( ~sNote.indexOf('#')) sNote = sNote.replace( /#/, '♯' )
		if( ~sNote.indexOf('♯')) sIndex1 = "♯"

		var sIndex2 = 
			! sIndex1 && sNote.length == 1 || sIndex1 && sNote.length == 2 
			? 'EN'
			: 'FR'
		if( ! sIndex1 ) sIndex1 = Notation.getValue()[0]?'♭':'♯'

		var a = Notations.choices[sIndex1][sIndex2]
		for(var i=0; i<12; i++ )
			if( a[i]== sNote )
				return Notations.getSequence()[i]

		throw Error ( 'Invalid note name... '+ sNote )
		}
	}

class Manche {
	constructor ( sNodeID, oConfig ){
		let that = this
		this.oConfig = oConfig = Manche.getDefaultSettings( oConfig )

		this.history = new MancheHistory ( this )
		this.aFrequences = [0,0,0,0,0,0] // Ecarts accordage standard E en ton (+grave à +aigue)
		var eParent = document.getElementById( sNodeID )
		var nCases = oConfig.cases
		this.ID = Manche.ID++
		this.e = eParent.appendChild( this.createHTML( oConfig.strings, oConfig.cases ))
		this.nCordes = oConfig.strings
		this.nCases = oConfig.cases
		this.aCordes =[
			this.e.getElementsByClassName('corde1'),
			this.e.getElementsByClassName('corde2'),
			this.e.getElementsByClassName('corde3'),
			this.e.getElementsByClassName('corde4'),
			this.e.getElementsByClassName('corde5'),
			this.e.getElementsByClassName('corde6')
			]
		this.e.onclick= function( evt ){
			var e = Events.element( evt )
			if( e.nodeName != 'SPAN' ) return ;
			if( ! that.oIntervalBox ) return ;
			that.oIntervalBox.toggleNote( e.innerHTML )
			}
		this.createMenuHTML()
		this.hideForm( oConfig.config )

		// TROUVER UNE SOLUTION POUR QUE LES VARIABLES SPECIALES SOIT GLOBAL OU LOCAL
		// Ajoute les observateurs des options
		Tuning.addSubscriber( 'oManche.setTuning', function( nId ){ that.setTuning( nId )})
		Notation.addSubscriber( 'oManche.renameNotes', function(){ that.renameNotes() })
		LeftHanded.addSubscriber( 'oManche.setLeftHanded', function(b){ that.setLeftHanded(b) })
		Sound.addSubscriber( 'oManche.setSound', function(b){ that.setSound(b) })
		Mirror.addSubscriber( 'oManche.setMirror', function(b){ that.setMirror(b) })
		Notes.addSubscriber( 'oManche.setNotesName', function(b){ that.setNotesName(b) })
		Numbers.addSubscriber( 'oManche.setFretsNumber', function(b){ that.setFretsNumber(b) })
		Octaves.addSubscriber( 'oManche.setOctave', function(b){ that.setOctave(b) })
		
		// Défini la valeur des options
		LeftHanded.setValue( oConfig.lefthanded )
		Mirror.setValue( oConfig.mirror )
		Notes.setValue( oConfig.notes )
		Numbers.setValue( oConfig.numbers )
		Octaves.setValue( oConfig.octaves )
		Notation.setValue( oConfig.notation )

		// Pour éviter de mettre tous les composants à jour au chargement
		if( Tuning.getValue() != oConfig.tuning )
			Tuning.setValue( oConfig.tuning )
		else
			this.setTuning( oConfig.tuning )

		this.oConfig = null
		}
	createHTML ( nCordes, nCases ){
		var eParent = Tag( 'DIV', 'eGuitar' )
		var e = Tag( 'DIV', 'manche' ), eCase, eCorde, eFrette
		
		// manche
		for(var i=0, ni=nCases+1; i<ni; i++ ){
			eCase = Tag( 'DIV', 'case case'+ i )
			for(var j=nCordes; j>0; j-- ){
				eCorde = Tag( 'DIV', 'corde corde'+ j )
				eCorde.appendChild( Tag( 'SPAN' ))
				eCase.appendChild( eCorde )
				}
			if( i!=0 ){
				eFrette = Tag( 'DIV', 'frette' )
				eFrette.appendChild( Tag( 'SPAN' )).innerHTML = i
				eCase.appendChild( eFrette )
				}
			if( i==3 || i==5 || i==7 || i==9 || i==12 || i==15 || i==17 || i==19 || i==21 || i==24 ){
				eFrette = Tag( 'DIV', 'incrustation' )
				eCase.appendChild( eFrette )
				}
			e.appendChild( eCase )
			}
		eParent.appendChild( e )
		eParent.style.width = 30+ (nCases+1)*70 +'px'
		eParent.style.height = nCordes*30 +'px'
		return eParent
		}
	createMenuHTML (){
		let that = this
		/* MENU HAUT */
		let eUL = Tag( 'UL', 'mancheForm' )
		let eLI = Tag( 'LI' )
		let eLabel = eUL.appendChild( Tag( 'LABEL' ))
		eLabel.innerHTML = L10n('ACCORDAGE') +' : '
		let eAccordage = eUL.appendChild( Tag( 'SELECT' ))
		eAccordage.onkeyup = eAccordage.onchange = function(){ Tuning.setValue( eAccordage.value )}
		let eOption
		for(let a=Tunings, i=0, ni=a.length; i<ni; i++ ){
			eOption = Tag( 'OPTION' )
			eOption.value = i
			eOption.selected = i == Tuning.getValue()
			eOption.innerHTML = a[i][1]
			eAccordage.appendChild( eOption ) 
			}
		eLabel.htmlFor = eAccordage.id =  'eAccordage'+ this.ID
		eUL.appendChild( eLI )

		let checkbox =function( sTag, sId, sLabel, sClass, fFunction ){
			let eTAG = Tag( sTag )
			if( sClass ) eTAG.className = sClass
			let eCheckBox = eTAG.appendChild( Tag( 'INPUT' ))
			let eLabel = eTAG.appendChild( Tag( 'LABEL' ))
			eCheckBox.type = 'checkbox'
			if( fFunction ) eCheckBox.onclick = fFunction
			eLabel.htmlFor = eCheckBox.id = sId + that.ID
			eLabel.innerHTML = sLabel
			return eTAG
			}
		, cb =function( sId, sLabel, bChecked, fFunction, sClassName ){
			let eLI = checkbox( 'LI', sId, sLabel, sClassName||'', fFunction )
			let eCB = eLI.firstChild
			eCB.checked = bChecked
			cb.eUL.appendChild( eLI )
			return eCB
			}
		cb.eUL = eUL
		let e5 = this.eNotationI = cb( 'eNotationI',
			L10n('ABCDEFG'),
			Notation.getValue()[1] == 'EN',
			function(){ that.setNotation( e5.checked?'EN':'FR', e6.checked )}
			)
		, e6 = this.eBemol = cb( 'eBemol', L10n('BEMOL'),
			Notation.getValue()[0],
			function(){ that.setNotation( e5.checked?'EN':'FR', e6.checked )}
			)
		, e2 = this.eFlipV = cb( 'eFlipV', L10n('MIROIR'),
			false,
			function(){ Mirror.setValue( this.checked )}
			)
		, e3 = this.eOctave = cb( 'eOctaves', L10n('OCTAVES'),
			false,
			function(){ Octaves.setValue( this.checked )}
			)

		eLI = Tag('LI')
		eLabel = Tag('LABEL')
		eLabel.innerHTML = "LA3 "
		let eINPUT = Tag('INPUT')
		eINPUT.className = "range"
		eINPUT.type = "range"
		eINPUT.step = 1
		eINPUT.min = 400
		eINPUT.max = 500
		eINPUT.value = LA3
		eINPUT.oninput=function(){ La3.setValue( this.value )}
		La3.addSubscriber( 'màj Input range La3', function( n ){
			eINPUT.value = n
			eINPUT.nextSibling.value = n+'Hz' 
			})
		Notation.addSubscriber( 'màj Label La3', function( a ){
			eLabel.innerHTML = a[1]=='FR' ? 'La3' : 'A3'
			})
		let eOUTPUT = Tag('OUTPUT')
		eOUTPUT.innerHTML = LA3+'Hz'

		eLI.appendChild( eLabel )
		eLI.appendChild( eINPUT )
		eLI.appendChild( eOUTPUT )
		eUL.appendChild( eLI )

		this.e.appendChild( eUL )

		/* MENU DROIT */
		let eUL2 = Tag( 'UL', 'mancheMenu' )
		cb.eUL = eUL2
		cb( 'eConfig', '' ,
			this.oConfig.config,
			function(){ that.hideForm( this.checked )},
			'reglage'
			)
		this.eNotesName = cb( 'eNotesName', '', // L10n('NOTES'),
			false,
			function(){ Notes.setValue( this.checked )},
			'notes'
			)
		this.eFretsNumber = cb( 'eFretsNumber', '', // L10n('NUMEROS'),
			false,
			function(){ Numbers.setValue( this.checked )},
			'numbers'
			)
		this.eSound = cb( 'eSound', '' ,
			Sound.getValue(),
			function(){ Sound.setValue( this.checked )},
			'sound'
			)
		this.eFlipH = cb( 'eFlipH', '', //L10n('GAUCHER'),
			false,
			function(){ LeftHanded.setValue( this.checked )},
			'lefthanded'
			)
		
		/* Observateurs */
		Notation.addSubscriber( 'màj valeur checkbox ABCD et Bémol', function( a ){
			e5.checked = a[1] == 'EN'
			e6.checked = a[0]
			})
		Tuning.addSubscriber( 'màj valeur selectBox Accordage', function( nId ){ eAccordage.value = nId })

		this.e.appendChild( eUL2 )
		}
	getNotes ( sNote ){
		sNote = Notations.getNoteName( sNote )
		var aElts = []
		var a = this.e.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i].firstChild
			if( e.innerHTML == sNote ) aElts.push( e )
			}
		return aElts
		}
	hideForm ( b ){
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideForm' )
		}
	highlightNote ( nCorde, nCase, sClassName ){
		var e = this.aCordes[ nCorde-1 ][ nCase ]
		if( e ) e.classList.add( sClassName )
		}
	highlightNotes ( sNote, sClassName ){
		this.history.add( 'highlightNotes', [ sNote, sClassName ])
		let a = this.getNotes( sNote )
		for(let i=0, ni=a.length; i<ni; i++ ){
			a[i].className = a[i].className.replace( /ton\d[^\s]*/gim, '' )
			a[i].classList.add( sClassName )
			let sNote = a[i].innerHTML, sOctave = a[i].octave
			a[i].onmouseover = function(){
				if( Sound.getValue()) playTone( sNote+sOctave )
				}
			}
		}
	removeNote ( sNote ){
		this.history.add( 'removeNote', [ sNote ])
		var a = this.getNotes( sNote )
		for(var i=0, ni=a.length; i<ni; i++ ){
			a[i].className = a[i].className.replace( /ton\d[^\s]*/gim, '' )
			a[i].onmouseover = null
			}
		}
	renameNotes	(){
		var a = Notations.getSequence('E')
		// Renomme les cordes
		for(var i=0; i<this.nCordes; i++ ){
			var nBase = this.aFrequences[i]
			for(var j=0; j<=this.nCases; j++ )
				this.aCordes[i][j].firstChild.innerHTML = a[ (nBase+j)%12 ]
			}
		}
	reset (){
		var a = this.e.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i]
			e.firstChild.className = e.firstChild.className.replace( /ton\d[^\s]*/gim, '' )
			e.firstChild.onmouseover = null
			e.className = e.className.replace( /position\d[^\s]*/gim, '' )
			}
		}
	searchMask ( sMask ){
		var o = this.oHarmonie
		if( ! o ) return;
		var sName = Tonic.getValue(), sFound
		for(var i=0, a=Arpeggio, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask ){
				o.eChords.value = sMask
				sFound = a[i][1]
				break;
				}
			}
		for(var i=0, a=Scales, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask ){
				o.eScale.value = sMask
				sFound = a[i][1]
				break;
				}
			}
		o.displayChords( sMask, sFound ? sName +' '+ sFound : sName + '...' )
		}
	setAccord ( sAccord ){ // not used
	//	this.history.add( 'setAccord', [ sAccord ])
		var sNote
		for( var i=0;i<6;i++ ){
			sNote = sAccord.charAt(i)
			if( sNote !='x' ) this.highlightNote( i+1, sNote, 'position1' )
			}
		}
	setFlip ( bFlipH, bFlipV ){
		this.e.classList.remove( 'gaucher' )
		this.e.classList.remove( 'droitier' )
		this.e.classList.remove( 'gaucher_flipped' )
		this.e.classList.remove( 'droitier_flipped' )
		this.eFlipH.checked = bFlipH
		this.eFlipV.checked = bFlipV
		this.e.classList.add( bFlipH
			?( bFlipV ? 'gaucher_flipped' : 'gaucher' )
			:( bFlipV ? 'droitier_flipped' : 'droitier' )
			)
		}
	setFretsNumber ( b ){
		this.eFretsNumber.checked = b
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideFretsNumber' )
		}
	setLeftHanded ( b ){
		this.setFlip( b, Mirror.getValue())
		}
	setMirror ( b ){
		this.setFlip( LeftHanded.getValue(), b )
		}
	setNotation	( sLang, bBemol ){
		var a = Notation.getValue()
		bBemol = bBemol || false
		if( a[0]==bBemol && a[1]==sLang ) return ;
		this.eNotationI.checked = sLang == 'EN'
		this.eBemol.checked = bBemol
		Notation.setValue([bBemol,sLang])
		}
	setNotesName ( b ){
		this.eNotesName.checked = b
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideNotes' )
		}
	setOctave ( b ){
		this.eOctave.checked = b
		this.e.classList[ b ? 'add' : 'remove' ]( 'octaves' )
		}
	setScale ( sNote, sScaleMask ){
		this.history.reset()
		this.reset()
		var a = Notations.getSequence( sNote )
		var aNotes = []
		
		// Compte le nombre de "1"
		var count = 0;
		var pos = sScaleMask.indexOf('1')
		while( pos !== -1 ){
			this.highlightNotes(  a[ pos ], 'ton'+ pos )
			aNotes.push( a[ pos ])
			count++
			pos = sScaleMask.indexOf('1', pos + 1 )
			}
		}
	setSound ( b ){
		this.eSound.checked = Sound.getValue()
		}
	setTuning ( nId ){
		var sAccordage = Tunings[ nId ][0]
		var aAccordage = sAccordage.split('|')
		var aNotes = aAccordage[0].split(',')
		var aFrequences = aAccordage[1].split(',') // écarts tons de base accordage
		var aBase = [12,17,22,27,31,36] // tons selon les cordes
		var aNotation = Notations.getSequence( 'E' ) // liste des 12 notes commencant par E
	//	console.info( aNotation )
		for(var i=0; i<this.nCordes; i++ ){
			this.aFrequences[i] = aBase[i] += 2*aFrequences[i] // bouge les écarts de case : 2*ton
			}
		for(var i=0; i<this.nCordes; i++ ){
			var nBase = aBase[i]
			for(var j=0; j<=this.nCases; j++ ){
				/* Test octave */
				let nOctave = parseInt( (nBase+4)/12 ) + 3 // +4 pour aller à DO...
				
				var e = this.aCordes[i][j].firstChild
				e.innerHTML = aNotation[ nBase%12 ] // note
				e.octave = nOctave
				if( -1 == e.className.indexOf('octave'))
					e.className += ' octave' + nOctave
				else
					e.className = e.className.replace( /octave\d/, ' octave' + nOctave )
				nBase++
				}
			}

		this.reset()
		this.history.apply()
		}
	}
Manche.ID = 0
Manche.DefaultSettings ={
	config: 0,
	strings: 6,
	cases: 12,
	tuning: Tuning.getValue(),
	notation: Notation.getValue(),
	lefthanded: LeftHanded.getValue(),
	mirror: Mirror.getValue(),
	octaves: Octaves.getValue(),
	notes: Notes.getValue(),
	numbers: Numbers.getValue()
	}
Manche.getDefaultSettings = function( oConfig ){
	oConfig = oConfig || {}
	for( const s in Manche.DefaultSettings )
		oConfig[s] = oConfig[s] !== undefined
			? oConfig[s]
			: Manche.DefaultSettings[s]
	return oConfig
	}

/*
Sauvegarde les fonctions d'affichage des notes du manche
Utiliser pour conserver l'affichage lors du changement d'accordage
*/
class MancheHistory {
	constructor ( oManche ){
		this.oManche = oManche
		this.a = []
		}
	add ( sName, aArguments ){
		this.a.push([ sName, aArguments ])
		}
	reset (){
		this.a = []
		}
	apply (){
		for(var i=0, ni=this.a.length; i<ni; i++ )
			this.oManche[ this.a[i][0] ].apply( this.oManche, this.a[i][1])
		this.a.length = this.a.length/2
		}
	info (){
		for(var i=0, ni=this.a.length; i<ni; i++ )
			console.info( this.a[i][0] +"\t"+ JSON.stringify( this.a[i][1] ))
		}
	}

/* Recherche des accords présent dans des intervalles */
class Harmonie {
	constructor( eParent, oManche ){
		var that = this
		this.aResult = null
			
		this.oManche = oManche
		oManche.oHarmonie = this
		let oIntervalBox = this.oIntervalBox = new IntervalBox ( oManche )
		eParent.appendChild( oIntervalBox.eHTML )

		Tonic.addSubscriber( 'selectBox Tonic[màj selection]+IntervalBox.setNotes', function( sNote ){
			that.eTonique.value = sNote
			oIntervalBox.setNotes( Notations.getSequence( sNote ))
			})

		var eTable = Tag( 'TABLE', 'harmonieForm' )
		var eSUGG = Tag( 'TABLE', 'suggestion', 'eSuggestion'+ oManche.ID )
		eSUGG.cellSpacing = 0

		/* Constructeur html */
		var selectbox =function( sId, sLabel, a, sRadio ){
			var eTH, eTD, eTR = Tag( 'TR' )
			
			eTH = Tag( 'TH' )
			eTH.align="right"

			var eLabel = eTH.appendChild( Tag( 'LABEL' ))
			eLabel.innerHTML = sLabel +':'
			eTR.appendChild( eTH )
			
			eTD = Tag( 'TD' )
			var eSelect = eTD.appendChild( Tag( 'SELECT' )), eOption
			for(var i=0, ni=a.length; i<ni; i++ ){
				eOption = Tag( 'OPTION' )
				if( a[i].constructor == String )
						eOption.innerHTML = eOption.value = a[i]
					else {
						eOption.innerHTML = a[i][1]
						eOption.value = a[i][0]
						}
				eSelect.appendChild( eOption ) 
				}
			eTR.appendChild( eTD )
			
			eLabel.htmlFor = eSelect.id =  sId + oManche.ID
			eTable.appendChild( eTR )
			return eSelect
			}
		var btn =function( sText, eSelect, f ){
			var eBTN = Tag( 'Button' )
			eBTN.innerHTML = sText
			eBTN.onclick = f
			eSelect.parentNode.appendChild( eBTN )
			}

		/* Construction html */
		var eTonique = selectbox( 'eTonique', L10n('TONIQUE'), Notations.getSequence())
		eTonique.value = Notations.getNoteName( Memoire.get( 'Tonic' ) || 'A' )
		eTonique.onkeyup = eTonique.onchange =function(){}
		Notation.addSubscriber( 'selectBox Tonic[Renommage options] + màj SpecialVar Tonic', function(){
			var a = Notations.getSequence()
			var e = eTonique.firstChild
			var i = 0
			while( e ){
				e.innerHTML = e.value = a[i++]
				e = e.nextSibling
				}
			Tonic.setValue( eTonique.value )
			that.displayChords()
			})

		var eScale = selectbox( 'eScales', L10n('GAMME'), Scales, 'choice' )
		eScale.value = Memoire.get( 'Scale' ) || '100101010010'
		eScale.className = 'scale'
		btn( "OK", eScale, eScale.onkeyup = eScale.onchange =function(){
			Memoire.set( 'Scale', eScale.value )
			that.showInterval( eTonique.value, eScale.value )
			that.displayChords()
			})

		var eChords = selectbox( 'eChords', L10n('ARPEGE'), Arpeggio, 'choice' )
		eChords.value = Memoire.get( 'Arpege' ) || '100100010000'
		btn( "OK", eChords, eChords.onkeyup = eChords.onchange = function(){
			Memoire.set( 'Arpege', eChords.value )
			that.showInterval( eTonique.value, eChords.value )
			})

		eParent.appendChild( eTable )

		eSUGG.onclick =function( evt ){
			var e = Events.element( evt )
			if( e.nodeName != 'DIV' && e.nodeName != 'CAPTION' ) e = e.parentNode
			var sTonique = e.attributes.tonique && e.attributes.tonique.value
			var sMask = e.attributes && e.attributes.arpege && e.attributes.arpege.value
			if( sMask ){
				Tonic.setValue( sTonique )
				that.eChords.value = sMask
				that.showInterval( sTonique, sMask )
			//	that.displayChordsSimilarities( sTonique, sMask )
				}

			var sScale = e.scale
			if( sScale ){
				Tonic.setValue( e.tonique )
				that.eScale.value = sScale
				that.showInterval( e.tonique, sScale )
			//	that.displayChordsSimilarities( e.tonique, sScale )
				}
			}

		eParent.appendChild( eSUGG )

		this.eSUGG = eSUGG
		this.eTonique = eTonique
		this.eScale = eScale
		this.eChords = eChords
		}
	displayChords ( sMask, sName ){
		var that = this
		var sTonique = this.eTonique.value
		var sScaleMask = sMask || this.eScale.value
		this.sScaleName = sName || sTonique +' '+ this.eScale.selectedOptions[0].innerHTML

		this.oManche.setScale( sTonique, sScaleMask )
		this.setChords( sTonique, sScaleMask, this.getChordsSuggestion( sTonique, sScaleMask ))
		}
	displayChordsSimilarities ( sTonique, sChordMask ){
		var ai = this.aResult

		// Cherche le degré de l'accord pour créé un masque correspondant à celui de la gamme
		for( var i=0, ni=ai.length; i<ni; i++ ){
			if( ai[i][0] == sTonique ){
				var nPos = ai[i][2]
				sChordMask = sChordMask.substr( 12-nPos ) + sChordMask.substr( 0, 12-nPos )
				break;
				}
			}
			
		// Parcours les degrés
		for( var i=0, ni=ai.length; i<ni; i++ ){
			var aChords = ai[i][1]
			var nPos = ai[i][2]
			var sDegreMask = sChordMask.substr( nPos ) + sChordMask.substr( 0, nPos )

			// Parcours les accords résultat
			for( var j=0, nj=aChords.length; j<nj; j++ ){
				// Stock la similitude : valeur de 0 à 1
				if( aChords[j].length > 2 ) aChords[j] = aChords[j].slice( 0, 2 )
				aChords[j] = aChords[j].concat( Harmonie.getSimilarity( aChords[j][1], sDegreMask, 'chord' ))
				}
			}

		// Met à jour l'affichage
		var sScaleMask = this.eScale.value 
		var sTonique = ai[0][0]

		this.setChords( sTonique, sScaleMask, this.aResult )

		return null
		}
	getChordsSuggestion ( sTonique, sScaleMask ){
		var aNotesTmp = Notations.getSequence( this.sFondamental = sTonique )
		var aResult = []
		
		// Cherche la position des degrés et la tonique, créé un masque et cherche les accords possibles
		var nPos = sScaleMask.indexOf('1');
		var sDegreMask = ''
		while( nPos !== -1 ){
			sDegreMask = sScaleMask.substr( nPos ) + sScaleMask.substr( 0, nPos )
			aResult.push([ 
				aNotesTmp[ nPos ], 
				this.searchChords( sDegreMask ),
				nPos,
				sDegreMask
				])
			nPos = sScaleMask.indexOf('1', nPos + 1 );
			}

		return this.aResult = aResult
		}
	searchChords ( sScaleMask ){
		var aResult = []
		for(var j=0,nj=Arpeggio.length; j<nj; j++ ){
			var a = Arpeggio[j]
			if( ( parseInt(sScaleMask,2) & parseInt(a[0],2) ).toString(2) == a[0])
				aResult.push( a.concat( Harmonie.getSimilarity( sScaleMask, a[0], 'scale' )))
			}
		return aResult
		}
	setChords ( sTonique, sScaleMask, aChords ){
		var o = {}
		for(var i=0, ni=Arpeggio.length; i<ni; i++ ){
			var sChordName =  Arpeggio[i][1]
			o[ sChordName ] = []
			o[ sChordName ][12] = 0
						
			// Compte le nombre de "1"
			var sMask = Arpeggio[i][0]
			var count = 0
			var pos = sMask.indexOf('1');
			while (pos !== -1) {
				count++;
				pos = sMask.indexOf('1', pos + 1 );
				}
			o[ sChordName ][13] = count
			}

		for(var i=0, ni=aChords.length; i<ni; i++ ){
			var sNote = aChords[i][0] // Note
			var aj = aChords[i][1] // Liste des accords
			var ton = aChords[i][2] // index !!
			for(var j=0, nj=aj.length; j<nj; j++ ){
				var sChordName =  aj[j][1]
				var sOpacity = ( aj[j][2] != undefined ? 'opacity:'+ (1-aj[j][2]+.3).toFixed(2) +' !important;' : '' )
				var sTitle = ( aj[j][3] != undefined ? aj[j][3] : '' )
				o[ sChordName ][ ton ] =
					'<div class="ton'+ ton +'" tonique="'+ sNote +'" arpege="'+ aj[j][0] +'" style="'+ sOpacity +'" title="'+ sTitle +'">'
					+'<b>'+ sNote +'</b><i>'+ sChordName +'</i></div>'
				o[ sChordName ][12]++
				}
			}

		var aTR = []
		for(var i=0, ni=Arpeggio.length; i<ni; i++ ){
			var sChordName = Arpeggio[i][1]
			if( o[ sChordName ][12] > 0 )
				aTR[i] = '<tr><td>'+ o[ sChordName ].join('</td><td>' ) +'</td></tr>'
			}

		var sTHEAD = '<thead><tr>'

		var aNotesTmp = Notations.getSequence( sTonique )
		
		var aRoman = 'I?II?III?IV?V?VI?VII?VIII?IX?X?XI?XII'.split('?')
		for(var i=0, j=0, ni=aNotesTmp.length; i<ni; i++ ){
			sTHEAD += sScaleMask.charAt(i) == '1'
				? '<th abbr="arpege">'+aRoman[j++]+'</th>'
				: '<th abbr=""></th>'
			}
		sTHEAD += '<th abbr="number"><label>'+ L10n('ACCORDS') +'</label></th><th abbr="number"><label>'+ L10n('NOTES') +'</label></th></tr></thead>'

		this.eSUGG.innerHTML = sTHEAD +'<tbody>'+ aTR.join("\n") +'</tbody>'

		var aSort = [13,'DESC']
		if( this.TableSorter ) aSort = this.TableSorter.getSort()
		this.TableSorter = new TSorter;
		this.TableSorter.init( this.eSUGG.id )
		if( aSort ) this.TableSorter.sort( aSort[0], aSort[1] )

		var e = Tag( 'CAPTION' )
		e.innerHTML = '<h2>'+ this.sScaleName +'</h2>'
		e.tonique = sTonique
		e.scale = sScaleMask
		this.eSUGG.insertBefore( e, this.eSUGG.firstChild )
		}
	showInterval ( sNote, sMask ){
		Tonic.setValue( sNote )
		this.oIntervalBox.setValue( sMask )
		this.oManche.setScale( sNote, sMask )
		}
	}
Harmonie.getSimilarity = function( sChordOrScaleMask1 , sChordMask2 , sType ){
	var countTons = function ( sMask ){ return sMask.split("1").length - 1 }
	var nTons1 = countTons( sChordOrScaleMask1 )
	var nTons2 = countTons( sChordMask2 )
	var nCommonTons = countTons( ( parseInt( sChordOrScaleMask1, 2 ) & parseInt( sChordMask2, 2 ) ).toString(2) )
	var nOpacity = nCommonTons / nTons1
	var getLabel = function(){
		switch( sType ){
			case 'scale': return parseInt( nOpacity * 100 ) + "%";
			case 'chord': return "Accord à "+ nTons1 + " tons, "+ nCommonTons + "/" + nTons2 + " ton(s) en commun - " + parseInt( nOpacity * 100 ) + "%";
			default: return ''
			}
		}
	return [
		( Number( nOpacity )).toFixed(2),
		getLabel()
		]
	
	}

/* Affichage d'intervalles */
class IntervalBox {
	constructor ( oManche ){
		oManche.oIntervalBox = this
		this.oManche = oManche
		this.sMask = null
		
		// Construction HTML
		let eUL = this.eHTML = Tag('UL','interval')
		, eLI, eDIV, eDL, eDT, eDD
		for(let i=0; i<12; i++ ){
			eLI = Tag('LI','ton'+i)
			eDIV = Tag('DIV')
			eLI.appendChild( eDIV )
			eDL = Tag('DL')
			eDT = Tag('DT')
			eDT.innerHTML = IntervalBox.DT[i]
			eDD = Tag('DD')
			eDD.innerHTML = IntervalBox.DD[i]
			eDL.appendChild( eDT )
			eDL.appendChild( eDD )
			eLI.appendChild( eDL )
			eUL.appendChild( eLI )
			}
		let that = this
		this.eHTML.onclick= function( evt ){
			let e = Events.element( evt )
			if( e.nodeName == 'UL' ) return null
			while( e.nodeName != 'LI' ) e = e.parentNode
			return that.toggleNote( e.firstChild.innerHTML )
			}
		}
	setNotes ( aNotes ){
		let aDIVs = this.eHTML.getElementsByTagName('DIV')
		for(let i=0; i<12; i++ ){
			aDIVs[i].innerHTML = aDIVs[i].parentNode.sNoteName = aNotes[i]
			}
		}
	setValue ( sMask ){
		this.sMask = sMask
		let aLIs = this.eHTML.getElementsByTagName('LI')
		for(let i=0; i<12; i++ ){
			aLIs[i].classList[ sMask.charAt(i) == "1" ? 'add' : 'remove' ]( 'selected' )
			}
		}
	toggleNote ( sNote ){
		let aLIs = this.eHTML.getElementsByTagName('LI')
		for(let i=0; i<12; i++ ){
			if( aLIs[i].firstChild.innerHTML == sNote ){
				if( i == 0 ) return ; // La tonique doit rester sélectionnée
				let e = aLIs[i]
				, bAdded = e.classList.toggle( 'selected' )
				, sTon = e.className.replace( /\s*selected\s*/, '' )
				this.oManche[ bAdded ? 'highlightNotes' : 'removeNote' ]( e.sNoteName , sTon )
				let sMask = ''
				for(let i=0; i<12; i++ ){
					sMask += aLIs[i].classList.contains( 'selected' ) ? 1 : 0
					}
				this.sMask = sMask
				this.oManche.searchMask( sMask )
				return bAdded
				}
			}
		return null
		}
	}
IntervalBox.DT = ['1','b2','2','b3','3','4','b5','5','b6','6','b7','7','8']
IntervalBox.DD = ['0','&half;','1','1&half;','2','2&half;','3','3&half;','4','4&half;','5','5&half;','6']

ChordsBox =function(){
	var eDIV = this.eHTML = Tag('DIV','chords')
	}
