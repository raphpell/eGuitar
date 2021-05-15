window.onselectstart =function(){ return false } // empêche la sélection de texte

let Config =( function (){
	// Pattern Publishers/Subscribers
	function Publishers (){
		let o = {}
		let oTopics = {}
		let nID = -1
		o.publish =function( sTopic, mArg ){
			if ( ! oTopics[ sTopic ]) return false
			let aSubscribers = oTopics[ sTopic ]
			, n = aSubscribers ? aSubscribers.length : 0
			let b = Publishers.bConsole
			if( b ) console.groupCollapsed( `%cpublish "${sTopic}" : %O` , 'color:yellow;', mArg )
			//	console.trace() 
			while( n-- ){
				if( b ) console.info( `${aSubscribers[n].title}` )
				aSubscribers[ n ].func( mArg )
				}
			if( b ) console.groupEnd()
			return this
			}
		o.subscribe =function( sTopic, fFunc, sTitle ){
			if( ! oTopics[ sTopic ]) oTopics[ sTopic ] = []
			let sToken = ( ++nID ).toString()
			if( Publishers.bConsole ) console.log( `%cPublisher "${sTopic}" new subscriber\n\t "${sTitle||''}" %O` , 'color:lightskyblue', fFunc, sToken )
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
	Publishers.bConsole = 0

	// Objet wrapper : il sert à déclencher des fonctions quand sa valeur change
	class SpecialVar {
		constructor ( sName, mValue, oPublisher ){
			this.id = sName
			this.mValue = mValue
			this.publisher = oPublisher
			if( sName == 'notation' ) notationCreator.call( this )
			}
		get value (){
			return this.mValue
			}
		set value ( mValue ){
			this.mValue = mValue
			this.publisher.publish( this.id, mValue )
			return mValue
			}
		refresh (){
			return this.value = this.value
			}
		addSubscriber ( sTitle, fObserver ){
			return this.publisher.subscribe( this.id, fObserver, sTitle )
			}
		}

	// Etend les variables spéciales 'notation'
	// -> notationCreator.call( AugmentedObject )
	let notationCreator = ( function (){
		const cache = {}
		const Notations ={
			'♯':{	FR:['La',	'La♯',	'Si',	'Do',	'Do♯',	'Ré',	'Ré♯',	'Mi',	'Fa',	'Fa♯',	'Sol',	'Sol♯'],
					EN:['A',	'A♯',	'B',	'C',	'C♯',	'D',	'D♯',	'E',	'F',	'F♯',	'G',	'G♯']},
			'♭':{	FR:['La',	'Si♭',	'Si',	'Do',	'Ré♭',	'Ré',	'Mi♭',	'Mi',	'Fa',	'Sol♭',	'Sol',	'La♭'],
					EN:['A',	'B♭',	'B',	'C',	'D♭',	'D',	'E♭',	'E',	'F',	'G♭',	'G',	'A♭']}
			}
		return function (){
			this.getSequence =function( sNote ){
				var a = this.value
				if( ! sNote ) return Notations[ a[0]?'♭':'♯' ][ a[1]]
				sNote = this.getNoteName( sNote )
				var a = this.getSequence()
				var nIndex = a.indexOf( sNote )
				return a.slice( nIndex ).concat( a.slice( 0, nIndex))
				}
			this.getNoteName =function( sNote ){
				let sIndex1
				if( ~sNote.indexOf('b')) sNote = sNote.replace( /b/, '♭' )
				if( ~sNote.indexOf('♭')) sIndex1 = "♭"
				if( ~sNote.indexOf('#')) sNote = sNote.replace( /#/, '♯' )
				if( ~sNote.indexOf('♯')) sIndex1 = "♯"

				let sIndex2 = 
					! sIndex1 && sNote.length == 1 || sIndex1 && sNote.length == 2 
					? 'EN'
					: 'FR'
				if( ! sIndex1 ) sIndex1 = this.value[0]?'♭':'♯'

				let a = Notations[sIndex1][sIndex2]
				for(let i=0; i<12; i++ )
					if( a[i]== sNote )
						return this.getSequence()[i]

				throw Error ( 'Invalid note name. '+ sNote )
				}
			}
		})()

	// Créé les variables globales pouvant être partagées les composants par défaut
	// Leur valeur est stocké dans le localStorage
	function GlobalVars ( aVars ){
		let oPublisher = Publishers()
		aVars.forEach( ([sName, mDefaultValue ]) => {
			let mValue = Memoire.get( sName )
			let o = GlobalVars[ sName ] = new SpecialVar ( sName, mValue !== undefined ? mValue : mDefaultValue, oPublisher )
			oPublisher.subscribe( sName, m => Memoire.set( sName, m ), `Memoire.set-${sName}` )
			})
		}
	// Variables globales
	GlobalVars([
		[ "config", 0 ],
		[ "fx", 1 ],
		[ "la3", 440 ],
		[ "lefthanded", 0 ],
		[ "mask", '100101010010' ], // gamme par défaut mPenta
		[ "mirror", 0  ],
		[ "notation", [0,'EN'] ], // Notation courante utilisé dans l'application [true,'FR'] = bBemol sLang
		[ "notes", 0 ],
		[ "numbers", 0 ],
		[ "octaves", 0 ],
		[ "scale", ['100101010010', L10n('mPenta')]], // gamme par défaut mPenta
		[ "sound", 0 ],
		[ "strings", 6 ],
		[ "tonic", 'A' ],
		[ "tuning", 'E2,A2,D3,G3,B3,E4' ] // Accordage Guitare standard E
		])

	const DefaultSettings ={ // Doit contenir tous les attributs possibles
		cases: 12,
		// Défaut : SpecialVars avec répercution localStorage
		config: null,
		fx: null,
		la3: null,
		lefthanded: null,
		mask: null,
		mirror: null,
		notation: null,
		notes: null,
		numbers: null,
		octaves: null,
		scale: null,
		sound: null,
		strings: null,
		tonic: null,
		tuning: null
		}

	let f = function ( oConfig ){
		oConfig = oConfig || {}
		let o = {}, oPublisher = Publishers()
		for( const s in DefaultSettings ){
			o[s] = oConfig[s] !== undefined
				? ( GlobalVars[ s ]
					? new SpecialVar ( s, oConfig[ s ], oPublisher )
					: oConfig[ s ] 
					)
				: GlobalVars[ s ] || DefaultSettings[s]
			}
		return o
		}
	f.ID = 0
	return f
	})()

class Manche {
	constructor ( sNodeID, oConfig ){
		this.ID = ++Config.ID
		this.stringsMax = 10
		let that = this
		, o = this.Config = oConfig || Config()
		, eParent = document.getElementById( sNodeID )
		, e = this.eHTML = eParent.appendChild( this.createHTML( o.strings.value, o.cases ))
		this.createMenuHTML()

		// Ajoute les observateurs des options
		o.mask.addSubscriber( 'oManche.setScale', sMask => that.setScale())
		o.tonic.addSubscriber( 'oManche.setScale', sMask => that.setScale())

		// Rafraichissement de la valeur des options
		o.config.refresh()
		o.fx.refresh()
		o.lefthanded.refresh()
		o.notes.refresh()
		o.numbers.refresh()
		o.octaves.refresh()
		o.tuning.refresh()
		o.tonic.refresh()
		}
	createHTML ( nCordes, nCases ){
		let o = this.Config
		let e = Tag( 'DIV', 'manche' ), eCase, eCorde, eFrette
		, aStrings = Array( nCordes )
		for(let i=0;i<nCordes; i++) aStrings[i]=[]
		// manche
		for(var i=0, ni=nCases+1; i<ni; i++ ){
			eCase = Tag( 'DIV', 'case case'+ i )
			for(var j=nCordes; j>0; j-- ){
				aStrings[j-1][i] = eCorde = Tag( 'DIV', 'corde corde'+ j )
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
			this.aCordes = aStrings
			e.appendChild( eCase )
			}
		let eParent
		if( ! this.eHTML ){
			eParent = Tag( 'DIV', 'eGuitar' )
			function playSound ( evt ){
				let e = Events.element( evt )
				if( e.nodeName == 'SUP' ) e = e.parentNode
				if( e.nodeName != 'SPAN' ) return ;
				if( o.sound.value && /ton/.test( e.className )){
					playTone( e.note + e.octave, o.la3.value)
					return false
					}
				return o.sound.value ? false : e
				}
			eParent.onclick = function( evt ){
				let e = playSound( evt )
				if( ! e ) return ;
				let a = o.notation.getSequence( o.tonic.value)
				for( let i=1, ni=a.length; i < ni; i++ ){
					if( a[i] == e.note ){
						let sMask = o.mask.value
						, sToggle = sMask[i] == '0' ? '1' : '0'
						sMask = sMask.substring( 0, i ) + sToggle + sMask.substring( i+1 )
						o.mask.value = sMask
						break;
						}
					}
				}
			eParent.onmouseover = evt => playSound( evt )
			eParent.appendChild( e )
			}
		else {
			eParent = this.eHTML
			eParent.removeChild( eParent.firstChild )
			eParent.insertBefore( e, eParent.firstChild )
			}

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
		let eLabel = eLI.appendChild( Tag( 'LABEL' ))
		let eOption
		eLabel.innerHTML = L10n('CORDES') +': '
		let e = eLI.appendChild( Tag( 'SELECT' ))
		e.onkeyup = e.onchange = ()=> o.strings.value = that.eStrings.value
		this.eStrings = e
		for(let i=4, ni=this.stringsMax+1; i<ni; i++ ){
			eOption = Tag( 'OPTION' )
			eOption.value = eOption.innerHTML = i
			eOption.selected = i == o.strings.value
			e.appendChild( eOption )
			}
		eUL.appendChild( eLI )

		eLI = Tag( 'LI' )
		eLabel = eLI.appendChild( Tag( 'LABEL' ))
		eLabel.innerHTML = L10n('ACCORDAGE') +': '
		e = this.eTunings = eLI.appendChild( Tag( 'SELECT' ))
		e.onkeyup = e.onchange = ()=> o.tuning.value = that.eTunings.value
		this.setTunings()
		eLabel.htmlFor = e.id =  'eAccordage'+ this.ID
		eUL.appendChild( eLI )

		eLI = Tag('LI')
		eLabel = Tag('LABEL')
		eLabel.innerHTML = o.notation.getNoteName('La')+"3 "
		let eINPUT = Tag('INPUT')
		eINPUT.className = "range"
		eINPUT.type = "range"
		eINPUT.step = 1
		eINPUT.min = 400
		eINPUT.max = 500
		eINPUT.value = o.la3.value
		eINPUT.oninput=function(){ o.la3.value = this.value }
		let eOUTPUT = Tag('OUTPUT')
		eOUTPUT.innerHTML = eINPUT.value+'Hz'

		eLI.appendChild( eLabel )
		eLI.appendChild( eINPUT )
		eLI.appendChild( eOUTPUT )
		eUL.appendChild( eLI )

		/* MENU DROIT */
		let eUL2 = Tag( 'UL', 'menu' )
		let cb =function( sId, sLabel, bChecked, fFunction, sClass ){
			let eLI = Tag( 'LI' )
			if( sClass ) eLI.className = sClass
			let eCB = eLI.appendChild( Tag( 'INPUT' ))
			let eLabel = eLI.appendChild( Tag( 'LABEL' ))
			eCB.type = 'checkbox'
			if( fFunction ) eCB.onclick = fFunction
			eLabel.htmlFor = eCB.id = sId + that.ID
			eLabel.title = sLabel
			eCB.checked = bChecked
			eUL2.appendChild( eLI )
			that[ sId ] = eCB
			return cb
			}
		let f1 = function(){ o.notation.value = [ that.eBemol.checked, that.eNotationI.checked?'EN':'FR' ]}
		cb
		( 'eConfig',		'',				o.config.value,		function(){ o.config.value = this.checked },	'config' )
		( 'eNotesName',		L10n('NOTES'),	o.notes.value,		function(){ o.notes.value = this.checked },		'notes' )
		( 'eNotationI',		L10n('ABCDEFG'),o.notation.value[1] == 'EN',	f1,									'abcdefg' )
		( 'eBemol',			L10n('BEMOL'),	o.notation.value[0], 			f1,									'bemol' )
		( 'eOctaves',		L10n('OCTAVES'),o.octaves.value,	function(){ o.octaves.value = this.checked },	'octaves' )
		( 'eFlipV',			L10n('MIROIR'),	o.mirror.value,		function(){ o.mirror.value = this.checked },	'vFlip' )
		( 'eFlipH',			L10n('GAUCHER'),o.lefthanded.value,	function(){ o.lefthanded.value = this.checked },'hFlip' )
		( 'eFretsNumber',	L10n('NUMEROS'),o.numbers.value,	function(){ o.numbers.value = this.checked },	'numbers' )
		( 'eSound',			L10n('AUDIO'),	o.sound.value,		function(){ o.sound.value = this.checked },		'sound' )
		( 'eFx',			L10n('FX'),		o.fx.value,			function(){ o.fx.value = this.checked },		'fx' )

		eUL.appendChild( eUL2 )
		this.eHTML.appendChild( eUL )

		/* Observateurs */
		let setFlip = function( bFlipH, bFlipV ){
			let o = that.eHTML.classList
			o.remove( 'gaucher' )
			o.remove( 'droitier' )
			o.remove( 'gaucher_flipped' )
			o.remove( 'droitier_flipped' )
			that.eFlipH.checked = bFlipH
			that.eFlipV.checked = bFlipV
			o.add( bFlipH
				?( bFlipV ? 'gaucher_flipped' : 'gaucher' )
				:( bFlipV ? 'droitier_flipped' : 'droitier' )
				)
			}
		o.fx.addSubscriber( 'add/remove css class fx.', function( b ){ 
			that.eFx.checked = b
			document.body.classList[ ! b ? 'add' : 'remove' ]( 'fx' )
			})
		o.config.addSubscriber( 'add/remove css class hideForm.', function( b ){ 
			that.eConfig.checked = b
			that.eHTML.classList[ ! b ? 'add' : 'remove' ]( 'hideForm' )
			})
		o.la3.addSubscriber( 'RangeBox La3 + Output', function( n ){
			eINPUT.value = n
			eINPUT.nextSibling.value = n+'Hz' 
			})
		o.lefthanded.addSubscriber( 'oManche.setLeftHanded', function( b ){
			setFlip( b, o.mirror.value )
			})
		o.mirror.addSubscriber( 'oManche.setMirror', function( b ){
			setFlip( o.lefthanded.value, b )
			})
		o.notation.addSubscriber( 'Checkbox eNotationI/eBemol values + Label La3 +...', function( a ){
			eLabel.innerHTML = a[1]=='FR' ? 'La3' : 'A3'
			that.eNotationI.checked = a[1] == 'EN'
			that.eBemol.checked = a[0]
			that.renameNotes()
			})
		o.notes.addSubscriber( 'Checkbox eNotesName value +...', function( b ){
			that.eNotesName.checked = b
			that.eHTML.classList[ ! b ? 'add' : 'remove' ]( 'hideNotes' )
			})
		o.numbers.addSubscriber( 'Checkbox eFretsNumber value +...', function( b ){
			that.eFretsNumber.checked = b
			that.eHTML.classList[ ! b ? 'add' : 'remove' ]( 'hideFretsNumber' )
			})
		o.octaves.addSubscriber( 'Checkbox eOctaves value +...', function( b ){ 
			that.eOctaves.checked = b
			that.eHTML.classList[ b ? 'add' : 'remove' ]( 'octaves' )
			that.map( e => e.innerHTML = b ? e.note + '<sup>'+e.octave+'</sup>' : e.note )
			})
		o.sound.addSubscriber( 'Checkbox eSound value', b => that.eSound.checked = b )
		o.strings.addSubscriber( 'Checkbox eStrings value +...',function ( n ){
			that.eStrings.value = n
			that.createHTML( n, that.Config.cases )
			that.setTunings ()
			})
		o.tuning.addSubscriber( 'Selectbox eTunings value +...', function( sTuning ){
			that.eTunings.value = sTuning
			// màj des notes
			let sNoteC = o.notation.getNoteName('C')
			let b = o.octaves.value
			let aTuning = sTuning.split(',')
			for(let i=0, ni=o.strings.value; i<ni; i++ ){
				aTuning[i] = { note:aTuning[i].slice(0,-1), octave:aTuning[i].slice(-1) }
				let aNotes = o.notation.getSequence( aTuning[i].note )
				for(let j=0, nj=o.cases; j<=nj; j++ ){
					let sNote = aNotes[j%12]
					let nOctave = ( sNote == sNoteC ) ? ++aTuning[i].octave : aTuning[i].octave
					let e = that.aCordes[i][j].firstChild
					e.innerHTML = b ? sNote + '<sup>'+nOctave+'</sup>' : sNote
					e.note = sNote
					e.octave = nOctave
					if( -1 == e.className.indexOf('octave'))
						e.className += ' octave' + nOctave
					else
						e.className = e.className.replace( /octave\d/, ' octave' + nOctave )
					}
				}
			o.mask.refresh()
			})
		}
	eraseNotes (){
		var a = this.eHTML.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i]
			e.firstChild.className = e.firstChild.className.replace( /ton\d[^\s]*/gim, '' )
			e.className = e.className.replace( /position\d[^\s]*/gim, '' )
			}
		}
	getNotes ( sNote ){
		sNote = this.Config.notation.getNoteName( sNote )
		var aElts = []
		var a = this.eHTML.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i].firstChild
			if( e.note == sNote ) aElts.push( e )
			}
		return aElts
		}
	highlightNote ( nCorde, nCase, sClassName ){
		var e = this.aCordes[ nCorde-1 ][ nCase ]
		if( e ) e.classList.add( sClassName )
		}
	highlightNotes ( sNote, sClassName ){
		this.getNotes( sNote ).forEach( e => {
			e.className = e.className.replace( /ton\d+[^\s]*/gim, '' )
			e.classList.add( sClassName )
			})
		}
	map ( fFunction ){
		let o = this.Config
		for(let i=0, ni=o.strings.value; i<ni; i++ )
			for(let j=0, nj=o.cases+1; j<nj; j++ )
				fFunction( this.aCordes[i][j].firstChild, i, j )
		}
	removeNote ( sNote ){
		this.getNotes( sNote ).forEach( e => {
			e.className = e.className.replace( /ton\d+[^\s]*/gim, '' )
			})
		}
	renameNotes (){
		let a = this.Config.notation.getSequence('E')
		let b = this.Config.octaves.value
		let that = this
		this.map((e,i,j)=>{
			e.note = that.Config.notation.getNoteName( e.note )
			e.innerHTML = b ? e.note + '<sup>'+e.octave+'</sup>' : e.note
			})
		}
	setScale ( sNote, sScaleMask ){
		if( sNote ){
			this.Config.tonic.value = sNote
			this.Config.mask.value = sScaleMask
		} else {
			sNote = this.Config.tonic.value
			sScaleMask = this.Config.mask.value
			}
		this.eraseNotes()
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
	setTunings (){
		let o = this.Config
		let e
		let eSelect = this.eTunings
		eSelect.innerHTML = ''
		for(let a=Tunings, i=0, ni=a.length; i<ni; i++ ){
			let sTuning = a[i][0]
			if( sTuning.split(",").length == o.strings.value){
				e = Tag( 'OPTION' )
				e.value = sTuning
				e.selected = sTuning == o.tuning.value
				e.innerHTML = a[i][1]
				eSelect.appendChild( e )
				}
			}
		o.tuning.value = eSelect.value
		}

	// Config handlers
	hideForm ( b ){ return this.Config.config.value = b }
	setFretsNumber ( b ){ return this.Config.numbers.value = b }
	setFx ( b ){ return this.Config.fx.value = b }
	setLa3 ( nFreq ){ return this.Config.la3.value = nFreq }
	setLeftHanded ( b ){ return this.Config.lefthanded.value = b }
	setMirror ( b ){ return this.Config.mirror.value = b }
	setNotation ( sLang, bBemol ){
		let o = this.Config.notation
		let a = o.value
		if( a[0]==bBemol && a[1]==sLang ) return null;
		return o.value = [bBemol,sLang]
		}
	setNotesName ( b ){ return this.Config.notes.value = b }
	setOctaves ( b ){ return this.Config.octaves.value = b }
	setSound ( b ){ return this.Config.sound.value = b }
	setStrings ( n ){ return this.Config.strings.value = n }
	setTuning ( sTuning ){ return this.Config.tuning.value = sTuning }
	}

class IntervalBox {
	constructor ( oConfig ){
		let that = this
		this.Config = oConfig

		this.createHTML()
		this.setNotes()
		this.setValue( oConfig.mask.value )

		oConfig.tonic.addSubscriber( 'IntervalBox.setNotes', ()=> that.setNotes())
		oConfig.notation.addSubscriber( 'IntervalBox.setNotes', ()=> that.setNotes())
		oConfig.mask.addSubscriber( 'IntervalBox.setValue', sMask => that.setValue( sMask ))
		}
	createHTML (){
		let that = this
		, DT = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7','8']
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
			aNotes = o.notation.getSequence( o.tonic.value)
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
				this.Config.mask.value = sMask
				return bAdded
				}
			}
		return null
		}
	}

let Harmonie ={
	cache:{},
	getSimilarity :function( sChordOrScaleMask1, sChordMask2, sType ){
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
		var sName = this.Config.tonic.value, sFound
		for(var i=0, a=Arpeggio, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask )
				return this.cache[sMask] = a[i]
			}
		for(var i=0, a=Scales, ni=a.length; i<ni ; i++ ){
			if( a[i][0] == sMask )
				return this.cache[sMask] = a[i]
			}
		return null
		},
	Form:class{
		constructor( oConfig ){
			this.ID = ++Config.ID
			this.Config = oConfig
			this.createHTML()
			this.Config.mask.refresh()
			}
		createHTML(){
			let Config = this.Config
			, that = this
			, eTable = this.eHTML = Tag( 'TABLE', 'harmonieForm' )
			, selectbox =function( sId, sLabel, a, sSelected, fOnChange ){
				let eTH, eTD, eTR = Tag( 'TR' )

				eTH = Tag( 'TH' )
				eTH.align="right"

				let eLabel = eTH.appendChild( Tag( 'LABEL' ))
				eLabel.innerHTML = sLabel +': '
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

				eLabel.htmlFor = eSelect.id =  sId + that.ID
				eTable.appendChild( eTR )
				return eSelect
				}
			, eTonique = this.eTonique = selectbox(
				'eTonique',
				L10n('TONIQUE'),
				Config.notation.getSequence(),
				Config.notation.getNoteName( Config.tonic.value || 'A' ),
				() => Config.tonic.value = eTonique.value
				)
			, eScale = this.eScale = selectbox(
				'eScales',
				L10n('GAMME'),
				Scales,
				Config.mask.value,
				() => Config.mask.value = eScale.value
				)
			, eChords = this.eChords = selectbox(
				'eChords',
				L10n('ARPEGE'),
				Arpeggio,
				Config.mask.value,
				() => Config.mask.value = eChords.value
				)

			eScale.className = 'scale'

			Config.tonic.addSubscriber( 'HarmonieForm selectBox tonic value', sTonic => eTonique.value = sTonic )
			Config.mask.addSubscriber( 'HarmonieForm selectBox chords et scales values + publish scale', sMask =>{
				eChords.value = eScale.value = sMask
				if( eScale.value ) Config.scale.value = [ sMask, eScale.selectedOptions[0].innerHTML ]
				else if( eChords.value ) Config.scale.value = [ sMask, eChords.selectedOptions[0].innerHTML ]
				else Config.scale.value = [ sMask, 'noname' ]
				})
			Config.scale.addSubscriber( 'HarmonieForm values', a => eScale.value = a[0] )
			Config.notation.addSubscriber( 'HarmonieForm selectBox tonic choix', function(){
				var a = Config.notation.getSequence()
				var e = eTonique.firstChild
				var i = 0
				while( e ){
					e.innerHTML = e.value = a[i++]
					e = e.nextSibling
					}
				Config.tonic.value = eTonique.value
				})
			}
		},
	Table:class{
		constructor( oConfig ){
			this.ID = ++Config.ID
			this.Config = oConfig
			this.locked = false
			this.createHTML()
			}
		createHTML(){
			let Config = this.Config
			, that = this
			, eSUGG = this.eHTML = Tag( 'TABLE', 'suggestion', 'eSuggestion'+ this.ID )
			eSUGG.cellSpacing = 0
			eSUGG.onclick =function( evt ){
				var e = Events.element( evt )
				if( e.nodeName != 'DIV' && e.nodeName != 'CAPTION' ) e = e.parentNode
				var sTonique = e.attributes.tonique && e.attributes.tonique.value
				var sMask = e.attributes && e.attributes.arpege && e.attributes.arpege.value
				if( sMask ){
					that.locked = true
					Config.tonic.value = sTonique
					Config.mask.value = sMask
					that.locked = false
					}
				var sScale = e.scale
				if( sScale ){
					Config.tonic.value = e.tonique
					Config.scale.value = [ sScale, that.sScaleName ]
					Config.mask.value = sScale
					}
				}
			Config.mask.addSubscriber( 'HarmonieTable.displayChords', () => that.displayChords())
			Config.notation.addSubscriber( 'HarmonieTable.displayChords', () => that.displayChords())
			}
		displayChords ( sTonique, sMask, sName ){
			if( this.locked ) return ;
			var sTonique = sTonique || this.Config.tonic.value
			var sScaleMask = sMask || this.Config.scale.value[0]
			this.sScaleName = sName || this.Config.scale.value[1]
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
		// Recherche des accords respectant un mask
		searchChords ( sMask ){
			sMask = sMask || this.Config.scale.value[0]
			var aResult = []
			Arpeggio.forEach( a => {
				if( ( parseInt(sMask,2) & parseInt(a[0],2) ).toString(2) == a[0])
					aResult.push( a.concat( Harmonie.getSimilarity( sMask, a[0], 'scale' )))
				})
			return aResult
			}
		// Ajoute les accords d'une gamme
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
						'<div class="ton'+ nTon +'" tonique="'+ sTonic +'" arpege="'+ sMask2 +'" style="'+ sOpacity +'" title="'+ sTonic+sName +'">&#10005;</div>'
					o[ sName ][12]++
					})
				})

			var aTR = []
			for(var i=0, ni=Arpeggio.length; i<ni; i++ ){
				var sChordName = Arpeggio[i][1]
				if( o[ sChordName ][12] > 0 )
					aTR[i] = '<tr><td>'+ sChordName +'</td><td>'+ o[ sChordName ].join('</td><td>' ) +'</td></tr>'
				}

			let sTHEAD = '<thead><tr><th class="chordNames">'+ L10n('ACCORDS') +'</th>'
			, aNotesTmp = this.Config.notation.getSequence( sTonique )
			for(let i=0, j=0, ni=aNotesTmp.length; i<ni; i++ ){
				sTHEAD += sScaleMask.charAt(i) == '1'
					? '<th abbr="arpege">&#85'+(44+j++)+';</th>' //  class="ton'+ i +'" // Chiffres romains
					: '<th abbr=""></th>'
				}
			sTHEAD += '<th abbr="number"><label>'+ L10n('QUANTITE') +'</label></th><th abbr="number"><label>'+ L10n('NOTES') +'</label></th></tr></thead>'

			this.eHTML.innerHTML = sTHEAD +'<tbody>'+ aTR.join("\n") +'</tbody>'

			var aSort = [14,'DESC']
			if( this.TableSorter ) aSort = this.TableSorter.getSort()
			this.TableSorter = new TSorter
			this.TableSorter.init( this.eHTML )
			if( aSort ) this.TableSorter.sort( aSort[0], aSort[1] )

			var e = Tag( 'CAPTION' )
			if( this.sScaleName != 'noname' )
				e.innerHTML = '<h2>'+ sTonique +" " + this.sScaleName +'</h2>'
			else{
				// ajouter la possibilité d'ajouter un nom à cet intervalle
				e.innerHTML = '<h2>'+ sTonique +'...</h2>'
				}
			e.tonique = sTonique
			e.scale = sScaleMask
			this.eHTML.insertBefore( e, this.eHTML.firstChild )
			}
		},
	Mask:class{
		constructor( aList, oConfig, eParent ){
			let that = this
			this.eSelected = null
			let a = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7']
			let TDs = function( sMask ){
				let eFragment, eTD, nChar, nNotes = 0
				eFragment = new DocumentFragment
				for(var i=0, ni=12; i<ni; i++ ){
					nChar = sMask.charAt(i)
					eTD = Tag('TD')
					if( nChar=='1' ){
						eTD.className = 'ton'+i
						eTD.innerHTML = a[i]
						nNotes++
						}
					else{
						eTD.className = 'none'
						eTD.innerHTML = "&nbsp;"
						}
					eFragment.appendChild( eTD )
					}
				eTD = Tag('TD')
				eTD.innerHTML = nNotes
				eFragment.appendChild( eTD )
				return eFragment
				}
			let sTHEAD = '<thead><tr><th>'+ a.join( '</th><th>' ) +'</th><th abbr="number">' + L10n('NOTES') +'</th><th>' + L10n('INTERVALLES') + '</th></thead>'
			let eTABLE, eBODY, eTR, eTD, bSelected
			this.eHTML = eTABLE = Tag('TABLE','mask')
			eTABLE.innerHTML = sTHEAD
			eBODY = Tag('TBODY')
			aList.forEach( ([sMask,sName,sOtherName])=>{
				if( ! sName ) return;
				eTR = Tag('TR')
				eTR.mask = sMask
				if( ! bSelected ){
					bSelected = oConfig.mask.value == sMask
					if( bSelected ){
						that.eSelected = eTR
						eTR.className = 'selected'
						}
					}
				eTD = Tag('TD','name')
				eTD.innerHTML = sName + (sOtherName?' <small>'+sOtherName.replace(/\|/gi,', ')+'</small>':'')
				eTR.appendChild( TDs( sMask ) )
				eTR.appendChild( eTD )
				eBODY.appendChild( eTR )
				})
			eBODY.onclick =function( evt ){
				var e = Events.element( evt )
				if( e.className == 'mask' ) return false
				while( e && ! e.mask ) e = e.parentNode
				if( e ) oConfig.mask.value = e.mask
				}
			eTABLE.appendChild( eBODY )
			this.TableSorter = new TSorter
			this.TableSorter.init( this.eHTML )
			if( eParent ) eParent.appendChild( this.eHTML )
				
			oConfig.mask.addSubscriber( 'Harmonie.Mask selection', s =>{
				if( that.eSelected ) that.eSelected.className = ''
				var aTR = that.eHTML.getElementsByTagName('TR')
				for(let e, i=0, ni=aTR.length; i<ni; i++ ){
					e = aTR[i]
					if( e.mask == s ){
						e.className = 'selected'
						that.eSelected = e
						}
					}
				})
			}
		}
	}

class TuningsList {
	constructor( oConfig, eParent ){
		let that = this
		this.aSelected = []
		for(let a=Tunings, i=0, ni=a.length; i<ni; i++ ){
			let sTuning = a[i][0]
			a[i].notes = sTuning.split(",").length
			}
		Tunings.sort( (a,b)=>{ return a.notes-b.notes })

		let eDL = this.eHTML = Tag('DL','tunings'), eDD, eDT, nNotes = null, bSelected = false
		Tunings.forEach( a =>{
			if( nNotes != a.notes ){
				nNotes = a.notes
				eDT = Tag('DT')
				eDT.innerHTML = nNotes + ' '+ L10n('CORDES')
				eDL.appendChild( eDT )
				}
			eDD = Tag('DD')
		//	if( ! bSelected ){
				bSelected = oConfig.tuning.value == a[0]
				if( bSelected ){
					that.aSelected.push( eDD )
					eDD.className = 'selected'
					}
		//		}
			eDD.strings = nNotes
			eDD.tuning = a[0]
			eDD.innerHTML = '<span class="name">' + a[1] +'</span><b>'+ a[0].replace( /\,/gi, '</b><b>' ) + '</b>'
			eDL.appendChild( eDD )
			})
		if( eParent ) eParent.appendChild( this.eHTML )
		eDL.onclick =function( evt ){
			var e = Events.element( evt )
			if( e.className == 'tunings' ) return false
			while( e && ! e.tuning ) e = e.parentNode
			if( e ){
				oConfig.strings.value = e.strings
				oConfig.tuning.value = e.tuning
				}
			}
		oConfig.tuning.addSubscriber( 'TuningsList selection', s =>{
			let a = that.aSelected
			if( a.length ) a.forEach( e => { e.className = '' })
			that.aSelected = []
			var aDD = that.eHTML.getElementsByTagName('DD')
			for(let e, i=0, ni=aDD.length; i<ni; i++ ){
				e = aDD[i]
				if( e.tuning == s ){
					e.className = 'selected'
					that.aSelected.push( e )
					}
				}
			})
		}
	}