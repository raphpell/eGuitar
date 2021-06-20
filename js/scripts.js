window.onselectstart =function(){ return false } // empêche la sélection de texte

let Config =( function (){
	// Objet wrapper : il sert à déclencher des fonctions quand sa valeur change
	class SpecialVar {
		constructor ( sName, mValue, oPublisher ){
			this.id = sName
			this.mValue = mValue
			this.publisher = oPublisher
			if( Ext[ sName ]) Ext[ sName ].call( this )
			}
		get value (){
			return this.mValue
			}
		set value ( mValue ){
			this.publisher.publish( this.id, this.mValue = mValue )
			return mValue
			}
		refresh (){
			return this.value = this.value
			}
		addSubscriber ( sTitle, fObserver ){
			return this.publisher.subscribe( this.id, fObserver, sTitle )
			}
		}

	// Etend les variables spéciales
	// -> Ext.notation.call( ExtendedObject )
	let Ext ={
		notation:( function (){
			const Notations ={
				'♯':{	FR:['La',	'La♯',	'Si',	'Do',	'Do♯',	'Ré',	'Ré♯',	'Mi',	'Fa',	'Fa♯',	'Sol',	'Sol♯'],
						EN:['A',	'A♯',	'B',	'C',	'C♯',	'D',	'D♯',	'E',	'F',	'F♯',	'G',	'G♯']},
				'♭':{	FR:['La',	'Si♭',	'Si',	'Do',	'Ré♭',	'Ré',	'Mi♭',	'Mi',	'Fa',	'Sol♭',	'Sol',	'La♭'],
						EN:['A',	'B♭',	'B',	'C',	'D♭',	'D',	'E♭',	'E',	'F',	'G♭',	'G',	'A♭']}
				}
			function translateNote ( sNote ){
				if( ~sNote.indexOf('b')) sNote = sNote.replace( /b/, '♭' )
				if( ~sNote.indexOf('#')) sNote = sNote.replace( /#/, '♯' )
				return sNote
				}
			function getNotation ( sNote ){
				let sIndex1
				if( ~sNote.indexOf('♯')) sIndex1 = "♯"
				if( ~sNote.indexOf('♭')) sIndex1 = "♭"
				let sIndex2 = 
					! sIndex1 && sNote.length == 1 || sIndex1 && sNote.length == 2 
					? 'EN'
					: 'FR'
				if( ! sIndex1 ) sIndex1 = '♭'
				return Notations[ sIndex1 ][ sIndex2 ]
				}
			function throwError ( sNote ){
				throw Error ( 'Invalid note name. '+ sNote )
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
					sNote = translateNote( sNote )
					let a = getNotation( sNote )
					for(let i=0; i<12; i++ )
						if( a[i] == sNote )
							return this.getSequence()[i]
					throwError( sNote )
					}
				this.getDefaultNoteName =function( sNote, sLang, sType ){
					sLang = sLang=='FR' ? sLang : 'EN'
					sType = sType=="#" ? '♯': '♭'
					sNote = translateNote( sNote )
					let a = getNotation( sNote )
					let n = 0
					for(; n<12; n++ )
						if( a[n] == sNote )
							break;
					if( n < 12 ) return Notations[sType][sLang][n].replace( '♭', 'b' )
					throwError( sNote )
					}
				this.getDefaultSequence =function( sNote ){
					sNote = translateNote( sNote )
					let a = getNotation( sNote )
					var nIndex = a.indexOf( sNote )
					return a.slice( nIndex ).concat( a.slice( 0, nIndex))
					}
				}
			})()
		}

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
		[ "cases", 12 ],
		[ "config", 0 ],
		[ "fx", 1 ],
		[ "inversion", 1 ],
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
		[ "chord", null ],
		[ "tonic", 'A' ],
		[ "tuning", 'E2,A2,D3,G3,B3,E4' ] // Accordage Guitare standard E
		])

	const DefaultSettings ={ // Doit contenir tous les attributs possibles
		stringsMax: 10,
		casesMax: 24,
		// Défaut : SpecialVars avec répercution localStorage
		cases: null,
		chord: null,
		config: null,
		fx: null,
		inversion: null,
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
		let that = this
		, o = this.Config = oConfig || Config()
		, eParent = document.getElementById( sNodeID )
		this.eHTML = this.createHTML( o.strings.value, o.cases.value )
		Append( eParent, this.eHTML )
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
		let e = Tag( 'DIV', 'manche' ), eCase
		, aStrings = Array( nCordes )
		for(let i=0;i<nCordes; i++) aStrings[i]=[]
		// manche
		for(var i=0, ni=nCases+1; i<ni; i++ ){
			eCase = Tag( 'DIV', 'case case'+ i )
			for(var j=nCordes; j>0; j-- )
				Append( eCase,
					aStrings[j-1][i] = Tag( 'DIV', 'corde corde'+ j ),
					Tag('SPAN')
					)
			Append( eCase,[
				Tag('DIV','frette'),
				Tag('SPAN',{innerHTML:i,className:'fretteNum'})
				])
			if( i==3 || i==5 || i==7 || i==9 || i==12 || i==15 || i==17 || i==19 || i==21 || i==24 )
				Append( eCase, Tag('DIV','incrustation'))
			this.aCordes = aStrings
			Append( e, eCase )
			}
		let eParent
		if( ! this.eHTML ){
			eParent = Tag( 'DIV', 'eGuitar' )
			function playSound ( evt ){
				let e = Events.element( evt )
				if( e.nodeName == 'octave' || e.nodeName == 'B' ) e = e.parentNode
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
			Append( eParent, e )
			}
		else {
			eParent = this.eHTML
			eParent.removeChild( eParent.firstChild )
			eParent.insertBefore( e, eParent.firstChild )
			}

		eParent.style.height = nCordes*30 +'px'
		return eParent
		}
	createMenuHTML (){
		let that = this
		let o = this.Config

		/* Menu haut gauche */
		let sId
		let eUL = Tag( 'UL', 'mancheForm' )
		let e

		sId = 'eCases'+ this.ID
		Append( eUL, Tag('LI','cases'),[
			Tag( 'LABEL', { innerHTML: L10n('CASES'), htmlFor:sId }),
			that.eCases = e = Tag( 'SELECT', { id:sId })
			])
		e.onkeyup = e.onchange = ()=> o.cases.value = parseInt( that.eCases.value )
		for(let i=5, ni=o.casesMax+1; i<ni; i++ )
			Append( e, Tag( 'OPTION', { value: i, innerHTML: i }))
		e.value = o.cases.value

		sId = 'eCordes'+ this.ID
		Append( eUL, Tag('LI','strings'),[
			Tag( 'LABEL', { innerHTML: L10n('CORDES'), htmlFor:sId }),
			that.eStrings = e = Tag( 'SELECT', { id:sId })
			])
		e.onkeyup = e.onchange = ()=> o.strings.value = parseInt( that.eStrings.value )
		for(let i=4, ni=o.stringsMax+1; i<ni; i++ )
			Append( e, Tag( 'OPTION', { value: i, innerHTML: i }))
		e.value = o.strings.value

		sId = 'eAccordage'+ this.ID
		Append( eUL, Tag('LI','tunings'),[
			Tag( 'LABEL', { innerHTML: L10n('ACCORDAGE'), htmlFor:sId }),
			that.eTunings = e = Tag( 'SELECT', { id:sId })
			])
		e.onkeyup = e.onchange = ()=> o.tuning.value = that.eTunings.value
		this.setTunings()

		let eFREQ
		sId = 'eFREQ'+ this.ID
		Append( eUL, Tag('LI','frequence'), [
			Tag('LABEL', { innerHTML: o.notation.getNoteName('La')+"3 ", htmlFor:sId }),
			eFREQ = Tag('INPUT',{
				id: sId,
				className: "range", type: "range", step: 1, min: 400, max: 500, value: o.la3.value,
				oninput: function(){ o.la3.value = this.value }
				}),
			Tag('OUTPUT', { innerHTML: o.la3.value +'Hz' })
			])

		/* MENU DROIT */
		let eUL2 = Tag( 'UL', 'menu' )
		let cb =function( sId, sLabel, bChecked, fFunction, sClass ){
			let sId2 = sId + that.ID
			Append( eUL2,
				Tag('LI', { className:sClass||'' }),[
					that[ sId ] = Tag( 'INPUT', { type:'checkbox', checked:bChecked, id:sId2, onclick:fFunction||null }),
					Tag( 'LABEL', { htmlFor:sId2, title:sLabel })
					])
			return cb
			}
		let f1 = function(){ o.notation.value = [ that.eBemol.checked, that.eNotationI.checked?'EN':'FR' ]}
		cb
		( 'eConfig',		'',					o.config.value,		function(){ o.config.value = this.checked },	'config' )
		( 'eInversion',		L10n('INVERSION'),	o.inversion.value,	function(){ o.inversion.value = this.checked },	'inversion' )
		( 'eOctaves',		L10n('OCTAVES'),	o.octaves.value,	function(){ o.octaves.value = this.checked },	'octaves' )
		( 'eNotesName',		L10n('NOTES'),		o.notes.value,		function(){ o.notes.value = this.checked },		'notes' )
		( 'eBemol',			L10n('BEMOL'),		o.notation.value[0], 			f1,									'bemol' )
		( 'eNotationI',		L10n('ABCDEFG'),	o.notation.value[1] == 'EN',	f1,									'abcdefg' )
		( 'eFretsNumber',	L10n('NUMEROS'),	o.numbers.value,	function(){ o.numbers.value = this.checked },	'numbers' )
		( 'eFlipV',			L10n('MIROIR'),		o.mirror.value,		function(){ o.mirror.value = this.checked },	'vFlip' )
		( 'eFlipH',			L10n('GAUCHER'),	o.lefthanded.value,	function(){ o.lefthanded.value = this.checked },'hFlip' )
		( 'eSound',			L10n('AUDIO'),		o.sound.value,		function(){ o.sound.value = this.checked },		'sound' )
		( 'eFx',			L10n('FX'),			o.fx.value,			function(){ o.fx.value = this.checked },		'fx' )

		Append( this.eHTML, eUL, eUL2 )

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
		o.cases.addSubscriber( 'Selectbox eCases value +...',function ( n ){
			that.eCases.value = n
			that.createHTML( that.Config.strings.value, n )
			that.setTunings ()
			})
		o.config.addSubscriber( 'add/remove css class hideForm.', function( b ){ 
			that.eConfig.checked = b
			that.eHTML.classList[ b ? 'add' : 'remove' ]( 'showMenu' )
			})
		o.fx.addSubscriber( 'add/remove css class fx.', function( b ){ 
			that.eFx.checked = b
			document.body.parentNode.classList[ ! b ? 'add' : 'remove' ]( 'nofx' )
			})
		o.inversion.addSubscriber( 'refresh list', function( b ){ 
			o.mask.refresh()
			})
		o.la3.addSubscriber( 'RangeBox La3 + Output', function( n ){
			eFREQ.value = n
			eFREQ.nextSibling.value = n+'Hz' 
			})
		o.lefthanded.addSubscriber( 'oManche.setLeftHanded', function( b ){
			setFlip( b, o.mirror.value )
			})
		o.mirror.addSubscriber( 'oManche.setMirror', function( b ){
			setFlip( o.lefthanded.value, b )
			})
		o.notation.addSubscriber( 'Checkbox eNotationI/eBemol values + Label La3 +...', function( a ){
			eFREQ.previousSibling.innerHTML = a[1]=='FR' ? 'La3' : 'A3'
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
			that.eHTML.classList[ b ? 'add' : 'remove' ]( 'showFretsNumber' )
			})
		o.octaves.addSubscriber( 'Checkbox eOctaves value +...', function( b ){ 
			that.eOctaves.checked = b
			that.eHTML.classList[ b ? 'add' : 'remove' ]( 'octaves' )
			that.map( e => that.setNoteName( e, b ))
			})
		o.sound.addSubscriber( 'Checkbox eSound value', b => that.eSound.checked = b )
		o.strings.addSubscriber( 'Selectbox eStrings value +...',function ( n ){
			that.eStrings.value = n
			that.createHTML( n, that.Config.cases.value )
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
				for(let j=0, nj=o.cases.value; j<=nj; j++ ){
					let sNote = aNotes[j%12]
					let nOctave = ( sNote == sNoteC ) ? ++aTuning[i].octave : aTuning[i].octave
					let e = that.aCordes[i][j].firstChild
					e.note = sNote
					e.octave = nOctave
					that.setNoteName( e, b )
					if( -1 == e.className.indexOf('octave'))
						e.className += ' octave' + nOctave
					else
						e.className = e.className.replace( /octave\d/, ' octave' + nOctave )
					}
				}
			o.mask.refresh()
			})
		}
	eraseTones (){
		var a = this.eHTML.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i]
			e.firstChild.className = e.firstChild.className.replace( /ton\d[^\s]*/gim, '' )
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
	highlightNotes ( sNote, sClassName ){
		this.getNotes( sNote ).forEach( e => {
			e.className = e.className.replace( /ton\d+[^\s]*/gim, '' )
			e.classList.add( sClassName )
			})
		}
	map ( fFunction ){
		let o = this.Config
		for(let i=0, ni=o.strings.value; i<ni; i++ )
			for(let j=0, nj=o.cases.value+1; j<nj; j++ )
				fFunction( this.aCordes[i][j].firstChild, i, j )
		}
	renameNotes (){
		let o = this.Config
		, a = o.notation.getSequence('E')
		, b = o.octaves.value
		, that = this
		this.map((e,i,j)=>{
			e.note = o.notation.getNoteName( e.note )
			that.setNoteName( e, b )
			})
		}
	setNoteName ( e, bOctave ){
		e.innerHTML = bOctave ? '<b>'+ e.note + '</b><octave>'+ e.octave +'</octave>' : '<b>'+ e.note +'</b>'
		}
	setScale ( sNote, sScaleMask ){
		let o = this.Config
		if( sNote ){
			o.tonic.value = sNote
			o.mask.value = sScaleMask
		} else {
			sNote = o.tonic.value
			sScaleMask = o.mask.value
			}
		this.eraseTones()
		var a = o.notation.getSequence( sNote )
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
		let eSelect = this.eTunings
		eSelect.innerHTML = ''
		for(let a=Tunings, i=0, ni=a.length; i<ni; i++ ){
			let s = a[i][0]
			if( s.split(",").length == o.strings.value )
				Append( eSelect, Tag('OPTION',{
					value:s,
					selected: s == o.tuning.value,
					innerHTML: a[i][1]
					}))
			}
		o.tuning.value = eSelect.value
		}

	// futur methods
	cssCorde ( nCorde, sMethod, sClassName ){
		var a = this.aCordes[ nCorde-1 ]
		if( a ) a.forEach( e => {
			if( e ) e.classList[ sMethod ]( sClassName )
			})
		}
	cssNote ( nCorde, nCase, sMethod, sClassName ){
		let a = this.aCordes[ nCorde-1 ]
		var e = a && a[ nCase ]
		if( e ){
			e.classList[ sMethod ]( sClassName )
			e = e.firstChild
			return e.note + e.octave
			}
		}
	addFinger ( nCorde, nCase, nFinger ){
		let a = this.aCordes[ nCorde-1 ]
		var e = a && a[ nCase ]
		if( e ) return e.firstChild.appendChild( Tag('finger',{ innerHTML:nFinger }))
		return null
		}
	lowlight (){
		for(var i=1, ni=this.aCordes.length; i<=ni; i++ )
			this.cssCorde( i, 'add', 'contrast50' )
		}
	highlight (){
		for(var i=1, ni=this.aCordes.length; i<=ni; i++ )
			this.cssCorde( i, 'remove', 'contrast50' )
		}
	
	// Config handlers
	hideForm ( b ){ return this.Config.config.value = b }
	setFretsNumber ( b ){ return this.Config.numbers.value = b }
	setFx ( b ){ return this.Config.fx.value = b }
	setInversion ( b ){ return this.Config.inversion.value = b }
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
		let o = this.Config = oConfig
		this.createHTML()
		this.setNotes()
		this.setValue( o.mask.value )
		o.tonic.addSubscriber( 'IntervalBox.setNotes', ()=> that.setNotes())
		o.notation.addSubscriber( 'IntervalBox.setNotes', ()=> that.setNotes())
		o.mask.addSubscriber( 'IntervalBox.setValue', sMask => that.setValue( sMask ))
		}
	createHTML (){
		let that = this
		, DT = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7','8']
		, DD = ['8','♭9','9','♭10','10','11','♭12','12','♭13','13','♭14','14','15']
	//	, DD = ['0','&half;','1','1&half;','2','2&half;','3','3&half;','4','4&half;','5','5&half;','6']
		, eUL = this.eHTML = Tag('UL','interval')
		for(let i=0; i<12; i++ )
			Append( eUL, Tag('LI','ton'+i),[
				Tag('DIV'),
				Append( Tag('DL'),[
					Tag('DT' ,{ innerHTML:DT[i] }),
					Tag('DD' ,{ innerHTML:DD[i] })
					])
				])
		eUL.onclick =function( evt ){
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
		for(let i=0; i<12; i++ )
			aDIVs[i].innerHTML = aDIVs[i].parentNode.sNoteName = aNotes[i]
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

let oChords
ChordsBox =(function(){
	let sTuning
	let oCache ={}

	class ChordsBox {
		constructor ( oManche ){
			this.oManche = oManche
			this.aFingers = []
			this.createHTML()
			}
		createHTML (){
			let that = this
			, oManche = this.oManche
			, o = oManche.Config
			, eSelected
			Append( this.eHTML = Tag('UL','chordsbox'))
			this.eHTML.onclick =function( evt ){
				var e = Events.element( evt )
				if( e.nodeName == 'LI' ){
					if( eSelected ) eSelected.className = ''
					e.className = 'selected'
					eSelected = e
					oManche.highlight()
					that.clearFingers()
					let aNotes = []
					if( e.info ){
						oManche.lowlight()
						let s = e.info.frets, sChar
						for(let i=0, ni=s.length; i<ni; i++ ){
							sChar = s.charAt(i)
							if( sChar!='x' ){
								let nCorde = i+1
								, nCase = parseInt( sChar, 16 )
								aNotes.push( oManche.cssNote( nCorde, nCase, 'remove', 'contrast50' ))
								that.aFingers.push( oManche.addFinger( nCorde, nCase, e.info.fingers.charAt(i)))
								}
							}
						if( o.sound.value ) playChord( aNotes, o.la3.value, 50 )
						}
					}
				}
			sTuning = o.tuning.value.replace( /\,/g,'-')
			o.tuning.addSubscriber( 'set cache info', s =>{
				sTuning = s.replace( /\,/g,'-')
				})
			let f = ()=>{
				oManche.highlight()
				this.clearChords()
				}

		//	o.mask.addSubscriber( 'ChordsBox:load0', f )
			o.tonic.addSubscriber( 'ChordsBox:load1', f )
			o.scale.addSubscriber( 'ChordsBox:load2', f )
			o.chord.addSubscriber( 'ChordsBox:load3', ()=> that.loadChords())
			this.loadChords ()
			}
		defineChords ( sFile ){
			let a = oCache[ sTuning ][ sFile ]
			this.eHTML.innerHTML = ''
			if( a && a.length ){
				let aElts = []
				for(var i=-1, ni=a.length; i <ni; i++ ){
					aElts.push( Tag('LI' ,{ innerHTML:i+1, info:a[i] }))
					}
				Append( this.eHTML, aElts )
			}else{
				this.clearChords()
				}
			}
		clearChords (){
			this.eHTML.innerHTML = L10n('PASDSUGG')
			this.clearFingers()
			}
		clearFingers (){
			this.aFingers.forEach( e => { if( e && e.parentNode ) e.parentNode.removeChild( e )})
			this.aFingers = []
			}
		getFileName ( sTonic, sChord, sChordName, sMask ){
			let o ={
				m: "minor",
				M: "major"
				}
			let toFileName =( sChord )=>{
				return sChord
					.replace( /[♯#]/g, 'sharp' )
					.replace( 'M', 'maj' )
					.replace( /♭/g, 'b' )
					.replace( /\//g, '' )
					.replace( /\(([^)]+)\)/g, '$1' )
				}
			, fSlash =()=>{
				let a = this.oManche.Config.notation.getDefaultSequence( sTonic )
				let nIndex = parseInt( sChord.replace( /.*\((\d).*$/, '$1' ))
				console.info( sChord, nIndex )
				
				let n = sMask.indexOf('1')
				let indices = []
				while( n != -1 ){
					indices.push( n )
					n = sMask.indexOf( '1', n + 1 )
					}
				let sRealTonic = a[ indices[ indices.length-nIndex ]]
				let sRealChordName = sChord.replace( /( \(.*\))/gim, '' )
				if( sRealChordName == 'M' ) sRealChordName = ''
				sRealChordName = toFileName( sRealChordName )
				sTonic = this.oManche.Config.notation.getDefaultNoteName( sTonic, 'EN', '#' )
				sRealTonic = this.oManche.Config.notation.getDefaultNoteName( sRealTonic, 'EN', 'b' )
				return sRealTonic +'/'+sRealChordName+'_'+ sTonic.replace( '♯', 'sharp' )
				}
			, f =()=>{
				let sFile = toFileName( o[ sChord ] || sChord )
				sTonic = this.oManche.Config.notation.getDefaultNoteName( sTonic, 'EN', 'b' )
				return sTonic +'/'+ sFile
				}
			return ( sChordName.match( /\/[^\d]/)
				? fSlash()
				: f() ) +'.js'
			}
		loadChords (){
			oChords = null // global
			let o = this.oManche.Config
			, sTonic = o.tonic.value
			, sChord = o.scale.value[1]
			, sChordName = o.chord.value
			, sMask = o.mask.value
			, that = this
			if( ! ~o.scale.value[2].indexOf( 'chord' )) return;
			this.sTonic = sTonic = o.notation.getDefaultNoteName( sTonic ).replace( '♭', 'b' )
			this.sChord = sChord
			
			oCache[ sTuning ] = oCache[ sTuning ] || {}
			
			let sFile = this.getFileName( sTonic, sChord, sChordName, sMask ) 
			if( oCache[ sTuning ][ sFile ] !== undefined ){
				// utilisation du cache
				this.defineChords( sFile )
			}else{
				oCache[ sTuning ][ sFile ] = null
				console.info( "fichier:" + sFile )
				// console.info( "key:"+ sChordName )
				// chargement du fichier
				Scripts.add(
					'js/Chords/'+ sTuning +'/'+ sFile,
					()=>{
						if( oChords ) oCache[ sTuning ][ sFile ] = oChords.positions
						that.defineChords( sFile )
						},
					()=> that.defineChords( sFile )
					)
				}
			}
		}
	return ChordsBox
})();

let Harmonie ={
	noname:'...',
	isMaskIn :function( sMask1, sMask2 ){
		return ( parseInt(sMask2,2) & parseInt(sMask1,2) ).toString(2) == sMask1
		},
	Form:class{
		constructor( oConfig ){
			this.ID = ++Config.ID
			this.Config = oConfig
			this.createHTML()
			this.Config.mask.refresh()
			this.Config.tonic.refresh()
			}
		createHTML(){
			let Config = this.Config
			, that = this
			, eDIV
			this.eHTML = Append( eDIV = Tag( 'DIV', 'harmonieForm' ))
			let selectbox =function( sId, sLabel, a, sSelected, fOnChange ){
				sId = sId + that.ID
				let e = Tag( 'SELECT', { value:sSelected, id:sId })
				a.forEach( m => {
					Append( e, Tag( 'OPTION', m.constructor == String
						? { innerHTML:m, value:m }
						: { innerHTML:m[1], value:m[0] }
						))
					})
				e.onkeyup = e.onchange = fOnChange
				Append( eDIV, [
					Tag( 'LABEL', { innerHTML:sLabel, htmlFor: sId }),
					e
					])
				return e
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
				if( eChords.value && eScale.value ) Config.scale.value = [ sMask, eChords.selectedOptions[0].innerHTML, 'chord/scale', eScale.selectedOptions[0].innerHTML ]
				else if( eChords.value ) Config.scale.value = [ sMask, eChords.selectedOptions[0].innerHTML, 'chord' ]
				else if( eScale.value ) Config.scale.value = [ sMask, eScale.selectedOptions[0].innerHTML, 'scale' ]
				else Config.scale.value = [ sMask, Harmonie.noname, 'noname' ]
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
			let o = this.Config
			, that = this
			, eSUGG = this.eHTML = Tag( 'TABLE', 'suggestion', 'eSuggestion'+ this.ID )
			eSUGG.onclick =function( evt ){
				var e = Events.element( evt )
				if( e.nodeName != 'TD' && e.nodeName != 'CAPTION' ) e = e.parentNode
				var sTonique = e.attributes.tonique && e.attributes.tonique.value
				var sMask = e.attributes && e.attributes.arpege && e.attributes.arpege.value
				if( sMask ){
					that.locked = true
					o.tonic.value = sTonique
					o.mask.value = sMask
					that.locked = false
					if( eTitle ){
						eTitle.innerHTML = e.title
						}
					o.chord.value = e.title
					}
				var sScale = e.scale
				if( sScale ){
					o.tonic.value = e.tonique
					o.scale.value = [ sScale, that.sScaleName ]
					o.mask.value = sScale
					if( eTitle ){
						eTitle.innerHTML = e.tonique + (that.bIsChord?'':' ') + that.sScaleName
						}
					}
				}
			let f = () => that.displayChords()
			o.mask.addSubscriber( 'HarmonieTable.displayChords', f )
			o.tonic.addSubscriber( 'HarmonieTable.displayChords', f )
			o.notation.addSubscriber( 'HarmonieTable.displayChords', f )
			}
		createHTMLForm(){
			let e1, e2
			let fOnClick = function(){
				if( e1.checked ) alert( 'Not implemented yet... '+e2.value )
				}
			return Append( new DocumentFragment, [
				e1 = Tag('INPUT', { type:'checkbox', id: 'eNewCB' }),
				e2 = Tag('INPUT', { type:'text', placeholder:"Nom d'intervalle" }),
				Tag('LABEL', { htmlFor:'eNewCB', innerHTML:'&#10133;', onclick:fOnClick })
				])
			}
		displayChords ( sTonic, sMask, sName ){
			if( this.locked ) return ;
			let o = this.Config
			this.bIsChord = ! sTonic && ~o.scale.value[2].indexOf( 'chord' )
			sTonic = sTonic || o.tonic.value
			sMask = sMask || o.scale.value[0]
			this.sScaleName = sName || o.scale.value[1]
			if( this.bIsChord ){
				o.chord.value = this.getChordName( sTonic, sMask, this.sScaleName, o.scale.value[2] )
				}
			this.setChords( sTonic, sMask )
			}
		getChordName ( sChordTonic, sChordMask, sChordName ){
			// renversement d'accord 
			if( ~sChordName.indexOf( L10n('INVERSION'))){
				let aNotes = this.Config.notation.getSequence( sChordTonic )
				let n = sChordMask.indexOf('1')
				let indices = []
				while( n != -1 ){
					indices.push( n )
					n = sChordMask.indexOf( '1', n + 1 )
					}
				let sRealTonic = null
				// 1er inversion - tonic dernier 1
				if( ~sChordName.indexOf( '(1' ))
					sRealTonic = aNotes[ indices[ indices.length-1 ]]
				// 2ème inversion - tonic avant dernier 1
				if( ~sChordName.indexOf( '(2' ))
					sRealTonic = aNotes[ indices[ indices.length-2 ]]
				// 3ème...
				if( ~sChordName.indexOf( '(3' ))
					sRealTonic = aNotes[ indices[ indices.length-3 ]]
				// 4ème...
				if( ~sChordName.indexOf( '(4' ))
					sRealTonic = aNotes[ indices[ indices.length-4 ]]
				return sRealTonic + sChordName.replace( /( \(.*\))/gim, '/'+ sChordTonic )
				}
			return sChordTonic + sChordName
			}
		// Retourne un tableau des accords présent dans une gamme
		getChordsSuggestion ( sTonique, sScaleMask ){
			var aNotesTmp = this.Config.notation.getSequence( sTonique )
			var aResult = []
			
			// Cherche la position des degrés et la tonique, créé un masque et cherche les accords possibles
			var nPos = sScaleMask.indexOf( '1' )
			var sDegreMask = ''
			while( nPos !== -1 ){
				sDegreMask = sScaleMask.substr( nPos ) + sScaleMask.substr( 0, nPos )
				aResult.push([ 
					aNotesTmp[ nPos ], 
					this.searchChords( sDegreMask ),
					nPos,
					sDegreMask
					])
				nPos = sScaleMask.indexOf( '1', nPos+1 )
				}

			return aResult
			}
		// Recherche des accords inclus dans un mask
		searchChords ( sMask ){
			sMask = sMask || this.Config.scale.value[0]
			let aResult = [], bInversion = this.Config.inversion.value
			Arpeggio.forEach( a => {
				if( bInversion || !~a[1].indexOf( L10n('INVERSION')) )
					if( Harmonie.isMaskIn( a[0] ,sMask )) aResult.push( a )
				})
			return aResult
			}
		// Ajoute les accords d'une gamme
		setChords ( sScaleTonic, sScaleMask ){
			let aResult = this.getChordsSuggestion( sScaleTonic, sScaleMask )
			var o = {}, sOtherName

			let nIndexName = 12
			let nIndexNotes = 13
			let nIndexAmount = 14
			Arpeggio.forEach( a => {
				var sChordName =  a[1]
				sOtherName = a[2]
				sOtherName = (sOtherName?' <small>'+sOtherName.replace(/\|/gi,', ')+'</small>':'')
				o[ sChordName ] = []
				o[ sChordName ][nIndexName] = sChordName + sOtherName
				o[ sChordName ][nIndexAmount] = 0
				// Compte le nombre de "1"
				var sMask = a[0]
				var count = 0
				var pos = sMask.indexOf('1');
				while (pos !== -1) {
					count++;
					pos = sMask.indexOf('1', pos + 1 );
					}
				o[ sChordName ][nIndexNotes] = count
				})
			aResult.forEach( ([sChordTonic,aChords,nTon,sMask1]) => {
				aChords.forEach( ([sMask2,sName]) => {
					o[ sName ][ nTon ] =
						' class="hover ton'+ nTon +'" tonique="'+ sChordTonic +'" arpege="'+ sMask2 +'" title="'+ this.getChordName( sChordTonic, sMask2, sName ) +'">&#10005;'
					o[ sName ][nIndexAmount]++
					})
				})

			var aTR = []
			for(var i=0, ni=Arpeggio.length; i<ni; i++ ){
				var sChordName = Arpeggio[i][1]
				if( o[ sChordName ][nIndexAmount] > 0 ){
					let a = o[ sChordName ]
					for(var j=0, nj=a.length; j<nj; j++ ){
						if( j == nIndexName ) a[j] = '<td class="name">'+ a[j] +'</td>'
						if( j == nIndexAmount || j == nIndexNotes ) a[j] = '<td>'+ a[j] +'</td>'
						else{
							a[j] = a[j] === undefined
								? '<td class="none"></td>'
								: '<td '+ a[j] +'</td>'
							}
						}
					aTR[i] = '<tr>'+ a.join('' ) +'</tr>'
					}
				}
		//	let sCOLGROUP = '<colgroup><col span="12"><col><col class="name"><col></colgroup>'

			let sTHEAD = '<thead><tr>'
			, aNotesTmp = this.Config.notation.getSequence( sScaleTonic )
			for(let i=0, j=0, ni=aNotesTmp.length; i<ni; i++ ){
				sTHEAD += sScaleMask.charAt(i) == '1'
					? '<th abbr="arpege" class="ton'+ i +'">&#85'+(44+j++)+';<br>'+aNotesTmp[i]+'</th>' // Chiffres romains
					: '<th abbr="">-</th>'
				}
			let oTH= {}
			oTH[nIndexName] = '<th class="name">'+ L10n('ACCORDS') +'</th>'
			oTH[nIndexAmount] = '<th abbr="number"><label>'+ L10n('QUANTITE') +'</label></th>'
			oTH[nIndexNotes] = '<th abbr="number"><label>'+ L10n('NOTES') +'</label></th>'
			sTHEAD += oTH[12]+oTH[13]+oTH[14]+'</tr></thead>'

			this.eHTML.innerHTML = sTHEAD +'<tbody>'+ aTR.join("\n") +'</tbody>'

			var aSort = [nIndexAmount,'ASC']
			if( this.TableSorter ) aSort = this.TableSorter.getSort()
			this.TableSorter = new TSorter
			this.TableSorter.init( this.eHTML )
			if( aSort ) this.TableSorter.sort( aSort[0], aSort[1] )

			let e = Tag( 'CAPTION', { tonique:sScaleTonic, scale:sScaleMask }), s

//			if( this.sScaleName != Harmonie.noname ){
				s = ( ~this.Config.scale.value[2].indexOf('scale') )
					? sScaleTonic +' '+ (this.Config.scale.value[3]||this.Config.scale.value[1])
					: this.getChordName( sScaleTonic, sScaleMask, this.sScaleName )
				if( s ){
					e.innerHTML = '<h2>'+ s +'</h2>'
					if( eTitle ) eTitle.innerHTML = s
					}
/*				}
 			else{
				s = sScaleTonic +' '+ Harmonie.noname
				e.innerHTML = '<h2>'+s+'</h2>'
				if( eTitle ) eTitle.innerHTML = s
				Append( e.firstChild, this.createHTMLForm())
				} */
			this.eHTML.insertBefore( e, this.eHTML.firstChild )
			}
		},
	Mask:class{
		constructor( aList, oConfig, eParent ){
			let that = this
			this.eSelected = null
			this.Config = oConfig
			let a = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7']
			let TDs = function( sMask ){
				let eFragment, nChar, nNotes = 0
				eFragment = new DocumentFragment
				for(var i=0, ni=12; i<ni; i++ ){
					nChar = sMask.charAt(i)
					Append( eFragment,
						Tag('TD',nChar=='1'
							? { className:'ton'+i, innerHTML:a[i] }
							: { className:'none', innerHTML:"&nbsp;" }
							)
						)
					if( nChar=='1' ) nNotes++
					}
				return Append( eFragment, Tag('TD',{ innerHTML: nNotes }))
				}
			let sTHEAD = '<thead><tr><th>'+ a.join( '</th><th>' ) +'</th><th abbr="number">' + L10n('NOTES') +'</th><th>' + L10n('INTERVALLES') + '</th></thead>'
			let eTABLE, eBODY, eTR, eTD, bSelected
			this.eHTML = eTABLE = Tag('TABLE','mask')
			eTABLE.innerHTML = sTHEAD
			eBODY = Tag('TBODY')
			let s = oConfig.mask.value
			aList.forEach( ([sMask,sName,sOtherName])=>{
				if( ! sName ) return;
				eTR = Tag('TR')
				eTR.mask = sMask
				if( ! bSelected ){
					bSelected = s == sMask
					if( bSelected ){
						that.eSelected = eTR
						eTR.className = 'selected'
						}
					}
				eTR.style.display = Harmonie.isMaskIn( s, sMask ) ? '' : 'none'
				eTD = Tag('TD','name')
				eTD.innerHTML = sName + (sOtherName?' <small>'+sOtherName.replace(/\|/gi,'</small><small>')+'</small>':'')
				Append( eBODY, eTR, [ TDs( sMask ), eTD ])
				})
			eBODY.onclick =function( evt ){
				var e = Events.element( evt )
				if( e.className == 'mask' ) return false
				while( e && ! e.mask ) e = e.parentNode
				if( e ) oConfig.mask.value = e.mask
				}
			Append( eTABLE, eBODY )
			this.TableSorter = new TSorter
			this.TableSorter.init( this.eHTML )
			if( eParent ) Append( eParent, this.eHTML )
				
			oConfig.mask.addSubscriber( 'Harmonie.Mask selection+filter', s =>{
				if( that.eSelected ) that.eSelected.className = ''
				let aTR = that.eHTML.getElementsByTagName('TR')
				, bInversion = this.Config.inversion.value
				for(let e, i=0, ni=aTR.length; i<ni; i++ ){
					e = aTR[i]
					// selection
					if( e.mask == s ){
						e.className = 'selected'
						that.eSelected = e
						}
					// filtre
					if( e.mask ) e.style.display = Harmonie.isMaskIn( s, e.mask ) ? '' : 'none'
					if( ! bInversion && ~e.lastChild.innerHTML.indexOf( L10n('INVERSION')) )
						e.style.display = 'none'
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

		let eDL = this.eHTML = Tag('DL','tunings'), eDD, nNotes = null, bSelected = false
		Tunings.forEach( a =>{
			if( nNotes != a.notes ){
				nNotes = a.notes
				Append( eDL,  Tag('DT', { innerHTML: nNotes + ' '+ L10n('CORDES')}))
				}
			eDD = Tag('DD', {
				strings: nNotes,
				tuning: a[0],
				innerHTML: '<span class="name">' + a[1] +'</span><b>'+ a[0].replace( /\,/gi, '</b><b>' ) + '</b>'
				})
			bSelected = oConfig.tuning.value == a[0]
			if( bSelected ){
				that.aSelected.push( eDD )
				eDD.className = 'selected'
				}
			Append( eDL, eDD )
			})
		if( eParent ) Append( eParent, this.eHTML )
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