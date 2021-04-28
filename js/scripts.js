/*====================*/
/*=== Utilitaires ====*/
/*====================*/
// Mémorise les choix utilisateurs d'une session à une autre
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

window.onselectstart =function(){ return false }	// empêche la sélection de texte

/*============================*/
/*=== VARIABLES SPECIALES ====*/
/*============================*/
// Pattern Publishers/Subscribers
let Publishers = function( bDebug ){
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
	}

// Etend les variables spéciales 'notation'
// -> notationCreator.call( AugmentedObject )
let notationCreator = function(){
	this.getSequence =function( sNote ){
		var a = this.getValue()
		if( ! sNote ){
			return Notations[ a[0]?'♭':'♯' ][ a[1]]
		} else {
			sNote = this.getNoteName( sNote )
			var a = this.getSequence()
			var nIndex = a.indexOf( sNote )
			return a.slice( nIndex ).concat( a.slice( 0, nIndex))
			}
		}
	this.getNoteName =function( sNote ){
		var sIndex1
		if( ~sNote.indexOf('b')) sNote = sNote.replace( /b/, '♭' )
		if( ~sNote.indexOf('♭')) sIndex1 = "♭"
		if( ~sNote.indexOf('#')) sNote = sNote.replace( /#/, '♯' )
		if( ~sNote.indexOf('♯')) sIndex1 = "♯"

		var sIndex2 = 
			! sIndex1 && sNote.length == 1 || sIndex1 && sNote.length == 2 
			? 'EN'
			: 'FR'
		if( ! sIndex1 ) sIndex1 = this.getValue()[0]?'♭':'♯'

		var a = Notations[sIndex1][sIndex2]
		for(var i=0; i<12; i++ )
			if( a[i]== sNote )
				return this.getSequence()[i]

		throw Error ( 'Invalid note name. '+ sNote )
		}
	}

// Objet wrapper : il sert à déclencher des événements quand sa valeur change
// Attention: this.Publisher doit être défini après la création d'une instance
class SpecialVar {
	constructor ( sName, mValue ){
		this.id = sName
		this.value = mValue
		if( sName == 'notation' ) notationCreator.call( this )
		}
	setValue ( mValue ){
		this.value = mValue
		this.Publisher.publish( this.id, mValue )
		return mValue
		}
	getValue (){
		return this.value
		}
	refresh (){
		return this.setValue( this.getValue())
		}
	addSubscriber ( sTitle, fObserver ){
		return this.Publisher.subscribe( this.id, fObserver, sTitle )
		}
	}

// Variables globales pouvant être partagées ou non par tous les composants
// Leur valeur est stocké dans le localStorage
function GlobalVars ( aVars ){
	let oPublisher = Publishers(  )
	aVars.forEach( ([sName, mDefaultValue ]) => {
		let o = new SpecialVar ( sName, Memoire.get( sName ) || mDefaultValue )
		GlobalVars[ sName ] = o
		o.Publisher = oPublisher
		o.type = "global"
		o.Publisher.subscribe( sName, m => Memoire.set( sName, m ), 'Memoire.set' )
		})
	}
GlobalVars([
	[ "la3", 440 ],
	[ "lefthanded", 0 ],
	[ "mirror", 0  ],
	[ "notation", [0,'EN'] ], // Notation courante utilisé dans l'application [true,'FR'] = bBemol sLang
	[ "notes", 0 ],
	[ "numbers", 0 ],
	[ "octaves", 0 ],
	[ "mask", '100101010010' ], // gamme par défaut mPenta
	[ "scale", ['100101010010', L10n('mPenta')]], // gamme par défaut mPenta
	[ "sound", 0 ],
	[ "tonic", 'A' ],
	[ "tuning", 0 ] // Accordage - defaut Accordage standard E ( voir Tunings )
	])

class Manche {
	constructor ( sNodeID, oConfig ){
		this.ID = Manche.ID++
		let that = this
		let o = this.Config = Manche.getDefaultSettings( oConfig )

		this.aFrequences = [0,0,0,0,0,0] // Ecarts accordage standard E en ton (+grave à +aigue)
		var eParent = document.getElementById( sNodeID )
		var nCases = oConfig.cases
		var nStrings = oConfig.strings
		this.e = eParent.appendChild( this.createHTML( nStrings, nCases ))
		this.nCordes = nStrings
		this.nCases = nCases
		this.aCordes =[
			this.e.getElementsByClassName('corde1'),
			this.e.getElementsByClassName('corde2'),
			this.e.getElementsByClassName('corde3'),
			this.e.getElementsByClassName('corde4'),
			this.e.getElementsByClassName('corde5'),
			this.e.getElementsByClassName('corde6')
			]
		this.e.onclick= function( evt ){
			let e = Events.element( evt )
			if( e.nodeName != 'SPAN' ) return ;
			let o = that.Config
			let a = o.notation.getSequence( o.tonic.getValue())
			for( let i=1, ni=a.length; i < ni; i++ ){
				if( a[i] ==  e.innerHTML ){
					let sMask = that.Config.mask.getValue()
					let sToggle = sMask[i] == '0' ? '1' : '0'
					sMask = sMask.substring( 0, i ) + sToggle + sMask.substring( i+1 )
					that.Config.mask.setValue( sMask )
					break;
					}
				}
			}
		this.createMenuHTML()
		this.hideForm( oConfig.config )

		// Ajoute les observateurs des options
		o.lefthanded.addSubscriber( 'oManche.setLeftHanded', b => that.setLeftHanded(b))
		o.mirror.addSubscriber( 'oManche.setMirror', b => that.setMirror(b))
		o.notation.addSubscriber( 'oManche.renameNotes', () => that.renameNotes())
		o.notes.addSubscriber( 'oManche.setNotesName', b => that.setNotesName(b) )
		o.numbers.addSubscriber( 'oManche.setFretsNumber', b => that.setFretsNumber(b))
		o.octaves.addSubscriber( 'oManche.setOctave', b => that.setOctave(b))
		o.sound.addSubscriber( 'oManche.setSound', b => that.setSound(b))
		o.tuning.addSubscriber( 'oManche.setTuning', nId => that.setTuning( nId ))
		o.mask.addSubscriber( 'oManche.setScale', sMask => that.setScale())
		o.tonic.addSubscriber( 'oManche.setScale', sMask => that.setScale())

		// Défini la valeur des options
		o.lefthanded.setValue( oConfig.lefthanded )
		o.mirror.setValue( oConfig.mirror )
		o.notation.setValue( oConfig.notation )
		o.notes.setValue( oConfig.notes )
		o.numbers.setValue( oConfig.numbers )
		o.octaves.setValue( oConfig.octaves )
		o.tuning.setValue( oConfig.tuning )
		o.tonic.setValue( oConfig.tonic )

		this.setScale( oConfig.tonic, oConfig.mask )
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
		let o = this.Config
		
		/* MENU HAUT */
		let eUL = Tag( 'UL', 'mancheForm' )
		let eLI = Tag( 'LI' )
		let eLabel = eUL.appendChild( Tag( 'LABEL' ))
		eLabel.innerHTML = L10n('ACCORDAGE') +' : '
		let eAccordage = eUL.appendChild( Tag( 'SELECT' ))
		eAccordage.onkeyup = eAccordage.onchange = function(){ o.tuning.setValue( eAccordage.value )}
		let eOption
		for(let a=Tunings, i=0, ni=a.length; i<ni; i++ ){
			eOption = Tag( 'OPTION' )
			eOption.value = i
			eOption.selected = i == o.tuning.getValue()
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
			o.notation.getValue()[1] == 'EN',
			function(){ that.setNotation( e5.checked?'EN':'FR', e6.checked )}
			)
		, e6 = this.eBemol = cb( 'eBemol', L10n('BEMOL'),
			o.notation.getValue()[0],
			function(){ that.setNotation( e5.checked?'EN':'FR', e6.checked )}
			)
		, e2 = this.eFlipV = cb( 'eFlipV', L10n('MIROIR'),
			false,
			function(){ o.mirror.setValue( this.checked )}
			)
		, e3 = this.eOctave = cb( 'eOctaves', L10n('OCTAVES'),
			false,
			function(){ o.octaves.setValue( this.checked )}
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
		eINPUT.oninput=function(){ GlobalVars.la3.setValue( this.value )}
		GlobalVars.la3.addSubscriber( 'màj Input range La3', function( n ){
			eINPUT.value = n
			eINPUT.nextSibling.value = n+'Hz' 
			})
		o.notation.addSubscriber( 'màj Label La3', function( a ){
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
			o.config.getValue(),
			function(){ that.hideForm( this.checked )},
			'reglage'
			)
		this.eNotesName = cb( 'eNotesName', '', // L10n('NOTES'),
			false,
			function(){ o.notes.setValue( this.checked )},
			'notes'
			)
		this.eFretsNumber = cb( 'eFretsNumber', '', // L10n('NUMEROS'),
			false,
			function(){ o.numbers.setValue( this.checked )},
			'numbers'
			)
		this.eSound = cb( 'eSound', '' ,
			o.sound.getValue(),
			function(){ o.sound.setValue( this.checked )},
			'sound'
			)
		this.eFlipH = cb( 'eFlipH', '', //L10n('GAUCHER'),
			false,
			function(){ o.lefthanded.setValue( this.checked )},
			'lefthanded'
			)
		
		/* Observateurs */
		o.notation.addSubscriber( 'màj valeur checkbox ABCD et Bémol', function( a ){
			e5.checked = a[1] == 'EN'
			e6.checked = a[0]
			})
		o.tuning.addSubscriber( 'màj valeur selectBox Accordage', function( nId ){ eAccordage.value = nId })

		this.e.appendChild( eUL2 )
		}
	getNotes ( sNote ){
		sNote = this.Config.notation.getNoteName( sNote )
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
		let that = this
		this.getNotes( sNote ).forEach( e => {
			e.className = e.className.replace( /ton\d+[^\s]*/gim, '' )
			e.classList.add( sClassName )
			let sNote = e.innerHTML, sOctave = e.octave
			e.onmouseover = function(){
				if( that.Config.sound.getValue()) playTone( sNote+sOctave )
				}
			})
		}
	removeNote ( sNote ){
		this.getNotes( sNote ).forEach( e => {
			e.className = e.className.replace( /ton\d+[^\s]*/gim, '' )
			e.onmouseover = null
			})
		}
	renameNotes	(){
		let a = this.Config.notation.getSequence('E')
		// Renomme les cordes
		for(let i=0; i<this.nCordes; i++ ){
			let nBase = this.aFrequences[i] || 0
			for(let j=0; j<=this.nCases; j++ ){
				this.aCordes[i][j].firstChild.innerHTML = a[ (nBase+j)%12 ]
				}
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
		this.setFlip( b, this.Config.mirror.getValue())
		}
	setMirror ( b ){
		this.setFlip( this.Config.lefthanded.getValue(), b )
		}
	setNotation	( sLang, bBemol ){
		var a = this.Config.notation.getValue()
		bBemol = bBemol || false
		if( a[0]==bBemol && a[1]==sLang ) return ;
		this.eNotationI.checked = sLang == 'EN'
		this.eBemol.checked = bBemol
		this.Config.notation.setValue([bBemol,sLang])
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
		if( sNote ){
			this.Config.tonic.setValue( sNote )
			this.Config.mask.setValue( sScaleMask )
		} else {
			sNote = this.Config.tonic.getValue()
			sScaleMask = this.Config.mask.getValue()
			}
		this.reset()
		var a = this.Config.notation.getSequence( sNote )
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
		this.eSound.checked = this.Config.sound.getValue()
		}
	setTuning ( nId ){
		var sAccordage = Tunings[ nId ][0]
		var aAccordage = sAccordage.split('|')
		var aNotes = aAccordage[0].split(',')
		var aFrequences = aAccordage[1].split(',') // écarts tons de base accordage
		var aBase = [12,17,22,27,31,36] // tons selon les cordes
		var aNotation = this.Config.notation.getSequence( 'E' ) // liste des 12 notes commencant par E
		for(var i=0; i<this.nCordes; i++ ){
			this.aFrequences[i] = aBase[i] += 2*aFrequences[i] // bouge les écarts de case : 2*ton
			}
		for(var i=0; i<this.nCordes; i++ ){
			var nBase = aBase[i]
			for(var j=0; j<=this.nCases; j++ ){
				/* Test octave */
				let nOctave = parseInt( (nBase+4)/12 ) + 3 // +4 pour aller à DO
				
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
		this.Config.mask.refresh()
		}
	}
Manche.ID = 0
Manche.DefaultSettings ={
	config: 0,
	strings: 6,
	cases: 12,
	mask: GlobalVars.mask.getValue(),
	scale: GlobalVars.scale.getValue(),
	tuning: GlobalVars.tuning.getValue(),
	notation: GlobalVars.notation.getValue(),
	lefthanded: GlobalVars.lefthanded.getValue(),
	mirror: GlobalVars.mirror.getValue(),
	octaves: GlobalVars.octaves.getValue(),
	notes: GlobalVars.notes.getValue(),
	numbers: GlobalVars.numbers.getValue(),
	sound: GlobalVars.sound.getValue(),
	tonic: GlobalVars.tonic.getValue()
	}
// Décision de rendre une var local ou global si elle est définie ou non
Manche.getDefaultSettings = function( oConfig ){
	oConfig = oConfig || {}
	let o = {}, oPublisher = Publishers(  )
	for( const s in Manche.DefaultSettings ){
		if( oConfig[s] !== undefined ){
			o[s] = new SpecialVar ( s, oConfig[ s ])
			o[s].Publisher = oPublisher
			}
		else {
			oConfig[s] = Manche.DefaultSettings[s]
			o[s] = GlobalVars[ s ] // Attention si GlobalVars[ s ]  n'existe pas == undefined
			}
		}
	return o
	}

/* Affichage d'intervalles */
class IntervalBox {
	constructor ( Config ){
		let that = this
		this.Config = Config

		this.createHTML()
		this.setNotes()
		this.setValue( Config.mask.getValue())

		Config.tonic.addSubscriber( 'IntervalBox.setNotes', sNote => that.setNotes( Config.notation.getSequence( sNote )))
		Config.notation.addSubscriber( 'IntervalBox.setNotes', Note => that.setNotes() )
		Config.mask.addSubscriber( 'IntervalBox.setValue', sMask => that.setValue( sMask ) )
		}
	createHTML (){
		let that = this
		, DT = ['1','b2','2','b3','3','4','b5','5','b6','6','b7','7','8']
		, DD = ['0','&half;','1','1&half;','2','2&half;','3','3&half;','4','4&half;','5','5&half;','6']
		, eUL = this.eHTML = Tag('UL','interval')
		, eLI, eDIV, eDL, eDT, eDD
		for(let i=0; i<12; i++ ){
			eLI = Tag('LI','ton'+i)
			eDIV = Tag('DIV')
			eLI.appendChild( eDIV )
			eDIV.innerHTML = eDIV.parentNode.sNoteName = '-'
			eDL = Tag('DL')
			eDT = Tag('DT')
			eDT.innerHTML = DT[i]
			eDD = Tag('DD')
			eDD.innerHTML = DD[i]
			eDL.appendChild( eDT )
			eDL.appendChild( eDD )
			eLI.appendChild( eDL )
			eUL.appendChild( eLI )
			}
		this.eHTML.onclick= function( evt ){
			let e = Events.element( evt )
			if( e.nodeName == 'UL' ) return null
			while( e.nodeName != 'LI' ) e = e.parentNode
			return that.toggleNote( e.firstChild.innerHTML )
			}
		}
	setNotes ( aNotes ){
		if( ! aNotes ){
			let o = this.Config
			aNotes = o.notation.getSequence( o.tonic.getValue())
			}
		let aDIVs = this.eHTML.getElementsByTagName('DIV')
		for(let i=0; i<12; i++ ){
			aDIVs[i].innerHTML = aDIVs[i].parentNode.sNoteName = aNotes[i]
			}
		}
	setValue ( sMask ){
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
				let sMask = ''
				for(let i=0; i<12; i++ ){
					sMask += aLIs[i].classList.contains( 'selected' ) ? 1 : 0
					}
				this.Config.mask.setValue( sMask )
				return bAdded
				}
			}
		return null
		}
	}

/* Recherche des accords présent dans des intervalles */
// Exploser cette objet en deux : HarmonieForm et HarmonieTable. voir trois pour les calcules
Harmonie ={
	cache:{},
	getSimilarity :function( sChordOrScaleMask1 , sChordMask2 , sType ){
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
		},
	searchMask :function( sMask ){
		if( this.cache[sMask] ) return this.cache[sMask]
		var sName = this.Config.tonic.getValue(), sFound
		for(var i=0, a=Arpeggio, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask )
				return this.cache[sMask] = a[i]
			}
		for(var i=0, a=Scales, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask )
				return this.cache[sMask] = a[i]
			}
		return null
		}
	}

/* Affichage formulaire harmonie */
class HarmonieForm {
	constructor( Config ){
		this.Config = Config
		this.createHTML()
		}
	createHTML(){
		HarmonieForm.ID = HarmonieForm.ID ? ++HarmonieForm.ID : 0
		let Config = this.Config
		, eTable = this.eHTML = Tag( 'TABLE', 'harmonieForm' )
		, selectbox =function( sId, sLabel, a, sSelected, fOnChange ){
			let eTH, eTD, eTR = Tag( 'TR' )

			eTH = Tag( 'TH' )
			eTH.align="right"

			let eLabel = eTH.appendChild( Tag( 'LABEL' ))
			eLabel.innerHTML = sLabel +':'
			eTR.appendChild( eTH )

			eTD = Tag( 'TD' )
			let eSelect = eTD.appendChild( Tag( 'SELECT' )), eOption
			a.forEach( m => {
				eOption = Tag( 'OPTION' )
				if( m.constructor == String )
						eOption.innerHTML = eOption.value = m
					else {
						eOption.innerHTML = m[1]
						eOption.value = m[0]
						}
				if( eOption.value == sSelected ) eOption.selected = true 
				eSelect.appendChild( eOption ) 
				})

			eSelect.value =  sSelected
			eSelect.onkeyup = eSelect.onchange = fOnChange
			eTR.appendChild( eTD )

			eLabel.htmlFor = eSelect.id =  sId + oManche.ID
			eTable.appendChild( eTR )
			return eSelect
			}
		, eTonique = this.eTonique = selectbox(
			'eTonique',
			L10n('TONIQUE'),
			Config.notation.getSequence(),
			Config.notation.getNoteName( Config.tonic.getValue() || 'A' ),
			() => Config.tonic.setValue( eTonique.value )
			)
		, eScale = this.eScale = selectbox(
			'eScales',
			L10n('GAMME'),
			Scales,
			Config.mask.getValue(),
			() => Config.mask.setValue( eScale.value )
			)
		, eChords = this.eChords = selectbox(
			'eChords',
			L10n('ARPEGE'),
			Arpeggio,
			Config.mask.getValue(),
			() => Config.mask.setValue( eChords.value )
			)

		eScale.className = 'scale'

		Config.tonic.addSubscriber( 'HarmonieForm tonic value', sTonic => eTonique.value = sTonic )
		Config.mask.addSubscriber( 'HarmonieForm values chords et scale', sMask =>{
			eChords.value = eScale.value = sMask
			if( eScale.value ) Config.scale.setValue([ sMask, eScale.selectedOptions[0].innerHTML ])
			else if( eChords.value ) Config.scale.setValue([ sMask, eChords.selectedOptions[0].innerHTML ])
			})
		Config.scale.addSubscriber( 'HarmonieForm values', a => eScale.value = a[0] )
		Config.notation.addSubscriber( 'HarmonieForm choix tonic', function(){
			var a = Config.notation.getSequence()
			var e = eTonique.firstChild
			var i = 0
			while( e ){
				e.innerHTML = e.value = a[i++]
				e = e.nextSibling
				}
			Config.tonic.setValue( eTonique.value )
			})
		}
	}

/* Affichage des accords trouvé dans des intervalles */
class HarmonieTable {
	constructor( Config ){
		this.Config = Config
		this.locked = false
		this.createHTML()
		}
	createHTML(){
		let Config = this.Config
		, that = this
		, eSUGG = this.eHTML = Tag( 'TABLE', 'suggestion', 'eSuggestion'+ oManche.ID )
		eSUGG.cellSpacing = 0
		eSUGG.onclick =function( evt ){
			var e = Events.element( evt )
			if( e.nodeName != 'DIV' && e.nodeName != 'CAPTION' ) e = e.parentNode
			var sTonique = e.attributes.tonique && e.attributes.tonique.value
			var sMask = e.attributes && e.attributes.arpege && e.attributes.arpege.value
			if( sMask ){
				that.locked = true
				Config.tonic.setValue( sTonique )
				Config.mask.setValue( sMask )
				that.locked = false
				}
			var sScale = e.scale
			if( sScale ){
				Config.tonic.setValue( e.tonique )
				Config.scale.setValue([ sScale, that.sScaleName ])
				Config.mask.setValue( sScale )
				}
			}
		Config.mask.addSubscriber( 'HarmonieTable.displayChords', () => that.displayChords())
		Config.notation.addSubscriber( 'HarmonieTable.displayChords', () => that.displayChords())
		}
	displayChords ( sTonique, sMask, sName ){
		if( this.locked ) return ;
		var sTonique = sTonique || this.Config.tonic.getValue()
		var sScaleMask = sMask || this.Config.scale.getValue()[0]
		this.sScaleName = sName || this.Config.scale.getValue()[1]
		this.setChords( sTonique, sScaleMask )
		}
	// Retourne un tableau des accords présent dans une gamme
	getChordsSuggestion ( sTonique, sScaleMask ){
		var aNotesTmp = this.Config.notation.getSequence( sTonique )
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

		return aResult
		}
	// Recherche des accords dans un mask
	searchChords ( sMask ){
		sMask = sMask || this.Config.scale.getValue()[0]
		var aResult = []
		Arpeggio.forEach( a => {
			if( ( parseInt(sMask,2) & parseInt(a[0],2) ).toString(2) == a[0])
				aResult.push( a.concat( Harmonie.getSimilarity( sMask, a[0], 'scale' )))
			})
		return aResult
		}
	// Ajout des accords dans une gamme
	setChords ( sTonique, sScaleMask ){
		let aResult = this.getChordsSuggestion( sTonique, sScaleMask )
		var o = {}

		Arpeggio.forEach( a => {
			var sChordName =  a[1]
			o[ sChordName ] = []
			o[ sChordName ][12] = 0
			// Compte le nombre de "1"
			var sMask = a[0]
			var count = 0
			var pos = sMask.indexOf('1');
			while (pos !== -1) {
				count++;
				pos = sMask.indexOf('1', pos + 1 );
				}
			o[ sChordName ][13] = count
			})

		aResult.forEach( ([sTonic,aChords,nTon,sMask1]) => {
			aChords.forEach( ([sMask2,sName,sOpacity,sProb]) => {
				var sOpacity = ( sOpacity != undefined ? 'opacity:'+ (1-sOpacity+.3).toFixed(2) +' !important;' : '' )
				var sTitle = ( sProb != undefined ? sProb : '' )
				o[ sName ][ nTon ] =
					'<div class="ton'+ nTon +'" tonique="'+ sTonic +'" arpege="'+ sMask2 +'" style="'+ sOpacity +'" title="'+ sTitle +'">'
					+'<b>'+ sTonic +'</b><i>'+ sName +'</i></div>'
				o[ sName ][12]++
				})
			})

		var aTR = []
		for(var i=0, ni=Arpeggio.length; i<ni; i++ ){
			var sChordName = Arpeggio[i][1]
			if( o[ sChordName ][12] > 0 )
				aTR[i] = '<tr><td>'+ o[ sChordName ].join('</td><td>' ) +'</td></tr>'
			}

		var sTHEAD = '<thead><tr>'

		var aNotesTmp = this.Config.notation.getSequence( sTonique )
		
		var aRoman = 'I?II?III?IV?V?VI?VII?VIII?IX?X?XI?XII'.split('?')
		for(var i=0, j=0, ni=aNotesTmp.length; i<ni; i++ ){
			sTHEAD += sScaleMask.charAt(i) == '1'
				? '<th abbr="arpege">'+aRoman[j++]+'</th>'
				: '<th abbr=""></th>'
			}
		sTHEAD += '<th abbr="number"><label>'+ L10n('ACCORDS') +'</label></th><th abbr="number"><label>'+ L10n('NOTES') +'</label></th></tr></thead>'

		this.eHTML.innerHTML = sTHEAD +'<tbody>'+ aTR.join("\n") +'</tbody>'

		var aSort = [13,'DESC']
		if( this.TableSorter ) aSort = this.TableSorter.getSort()
		this.TableSorter = new TSorter
		this.TableSorter.init( this.eHTML.id )
		if( aSort ) this.TableSorter.sort( aSort[0], aSort[1] )

		var e = Tag( 'CAPTION' )
		e.innerHTML = '<h2>'+ sTonique +" " + this.sScaleName +'</h2>'
		e.tonique = sTonique
		e.scale = sScaleMask
		this.eHTML.insertBefore( e, this.eHTML.firstChild )
		}
	}
