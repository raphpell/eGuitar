/* UTILITAIRES */
var _ ={
	Tag :function( sName, sClasses, sId ){
		var e = document.createElement( sName )
		if( sClasses ) e.className = sClasses
		if( sId ) e.id = sId
		return e
		}
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

// Objet wrapper : il sert à déclencher des événements quand la valeur de l'objet change
class SpecialVar {
	constructor ( mValue ){
		this._aOnSet = []
		this.setValue( mValue )
		}
	setValue ( mValue ){
		this.value = mValue
		for(var i=0,ni=this._aOnSet.length; i<ni; i++ ){ this._aOnSet[i]( mValue )}
		return mValue
		}
	getValue (){
		return this.value
		}
	refresh (){
		return this.setValue( this.getValue())
		}
	addObserver ( fObserver ){
		this._aOnSet.push( fObserver )
		}
	}

/*-------------*/
// Notation courante utilisé dans l'application [false,'FR'] = bBemol sLang
Notation = new SpecialVar ([0,'EN'])
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
		if( ! sIndex1 ) sIndex1 = "♭"

		var a = Notations.choices[sIndex1][sIndex2]
		for(var i=0; i<12; i++ )
			if( a[i]== sNote )
				return Notations.getSequence()[i]

		throw Error ( 'Invalid note name... '+ sNote )
		}
	}

// Accordage - defaut Accordage standard E ( voir Manche.aAccordage )
Tuning = new SpecialVar ( 0 )
// Option Gaucher - defaut false
LeftHanded = new SpecialVar ( 0 )
// Option Miroir - defaut false
Mirror = new SpecialVar ( 0 )


class Manche{
	constructor ( sNodeID, oConfig ){
		oConfig = Manche.getDefaultSettings( oConfig )

		this.history = new MancheHistory ( this )
		this.aFrequences = [0,0,0,0,0,0] // Ecarts accordage standard E (+grave à +aigue)
		var eParent = document.getElementById( sNodeID )
		var nCases = oConfig.cases
		this.ID = Manche.ID++
		this.e = eParent.appendChild( Manche.getHTML( oConfig.strings, oConfig.cases ))
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

		// Option Notes - defaut true
		this.notes = new SpecialVar ( 1 )
		
		// Ajoute les observateurs des options
		let that = this
		Tuning.addObserver( function( nId ){ that.setTuning( nId )})
		Notation.addObserver( function(){ that.renameNotes() })
		LeftHanded.addObserver( function(b){ that.setLeftHanded(b) })
		Mirror.addObserver( function(b){ that.setMirror(b) })
		this.notes.addObserver( function(b){ that.setNotesName(b) })
		
		MancheForm( this )
		
		this.e.onclick= function( evt ){
			var e = Events.element( evt )
			if( e.nodeName != 'SPAN' ) return ;
			if( ! that.oIntervalBox ) return ;
			that.oIntervalBox.toggleNote( e.innerHTML )
			}

		// TROUVER UNE SOLUTION POUR QUE LES VARIABLES SPECIALES SOIT GLOBAL OU LOCAL

		// Défini la valeur des options
		if( oConfig.numbers ) this.setFretsNumber( oConfig.numbers )
		if( oConfig.octaves ) this.setOctave( oConfig.octaves )
		this.setForm( oConfig.config )

		LeftHanded.setValue( oConfig.lefthanded )
		Mirror.setValue( oConfig.mirror )
		this.notes.setValue( oConfig.notes )

		// Pour éviter de mettre tous les composants à jour au chargement
		if( Tuning.getValue() != oConfig.tuning )
			Tuning.setValue( oConfig.tuning )
		else
			this.setTuning( oConfig.tuning )
		}
	setOctave ( b ){
		this.eOctave.checked = b
		this.e.classList[ b ? 'add' : 'remove' ]( 'octaves' )
		}
	setNotation	( sLang, bBemol ){
		var a = Notation.getValue()
		bBemol = bBemol || false
		if( a[0]==bBemol && a[1]==sLang ) return ;
		this.eNotationI.checked = sLang == 'EN'
		this.eBemol.checked = bBemol
		Notation.setValue([bBemol,sLang])
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
	setNotesName ( b ){
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideNotes' )
		}
	setFretsNumber ( b ){
		this.eFretsNumber.checked = b
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideFretsNumber' )
		}
	setForm ( b ){
		this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideForm' )
		}
	setLeftHanded ( b ){
		this.setFlip( b, Mirror.getValue())
		}
	setMirror ( b ){
		this.setFlip( LeftHanded.getValue(), b )
		}
	setFlip ( bFlipH, bFlipV ){
		this.e.classList.remove( 'gaucher_flipped' )
		this.e.classList.remove( 'gaucher' )
		this.e.classList.remove( 'flipped' )
		this.eFlipH.checked = bFlipH
		this.eFlipV.checked = bFlipV
		this.e.classList.add( bFlipH
			?( bFlipV ? 'gaucher_flipped' : 'gaucher' )
			:( bFlipV ? 'flipped' : null )
			)
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
	highlightNote ( nCorde, nCase, sClassName ){
		var e = this.aCordes[ nCorde-1 ][ nCase ]
		if( e ) e.classList.add( sClassName )
		}
	setAccord ( sAccord ){
	//	this.history.add( 'setAccord', [ sAccord ])
		var sNote
		for( var i=0;i<6;i++ ){
			sNote = sAccord.charAt(i)
			if( sNote !='x' ) this.highlightNote( i+1, sNote, 'position1' )
			}
		}
	highlightNotes ( sNote, sClassName ){
		this.history.add( 'highlightNotes', [ sNote, sClassName ])
		var a = this.getNotes( sNote )
		for(var i=0, ni=a.length; i<ni; i++ ){
			a[i].className = a[i].className.replace( /ton\d[^\s]*/gim, '' )
			a[i].classList.add( sClassName )
			}
		}
	removeNote ( sNote ){
		this.history.add( 'removeNote', [ sNote ])
		var a = this.getNotes( sNote )
		for(var i=0, ni=a.length; i<ni; i++ )
			a[i].className = a[i].className.replace( /ton\d[^\s]*/gim, '' )
		}
	reset (){
		var a = this.e.getElementsByClassName('corde')
		for(var i=0, ni=a.length; i<ni; i++ ){
			var e = a[i]
			e.firstChild.className = e.firstChild.className.replace( /ton\d[^\s]*/gim, '' )
			e.className = e.className.replace( /position\d[^\s]*/gim, '' )
			}
		}
	searchMask ( sMask ){
		var o = this.oHarmonie
		if( ! o ) return;
		var sName = o.oTonique.getValue(), sFound
		for(var i=0, a=Harmonie.aArpeges, ni=a.length; i<ni ; i++ ){
			if( a[i][1] == sMask ){
				o.eChords.value = sMask
				sFound = a[i][0]
				break;
				}
			}
		for(var i=0, a=Harmonie.aScales, ni=a.length; i<ni ; i++ ){
			if( a[i][1] == sMask ){
				o.eScale.value = sMask
				sFound = a[i][0]
				break;
				}
			}
		o.displayChords( sMask, sFound ? sName +' '+ sFound : sName + '...' )
		}
	setScale ( sNote, sScaleMask ){
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
	setTuning ( nId ){
		var sAccordage = Manche.aAccordage[ nId ][0]
		var aAccordage = sAccordage.split('|')
		var aNotes = aAccordage[0].split(',')
		var aFrequences = aAccordage[1].split(',')
		var aBase = [12,17,22,27,31,36]
		var aNotation = Notations.getSequence( 'E' ) // Notation.getValue()[1]=='EN'?'E': 'Mi' )
		for(var i=0; i<this.nCordes; i++ ) this.aFrequences[i] = aBase[i] += 2*aFrequences[i]
		for(var i=0; i<this.nCordes; i++ ){
			var nBase = aBase[i]
			for(var j=0; j<=this.nCases; j++ ){
				var e = this.aCordes[i][j].firstChild
				e.innerHTML = aNotation[ nBase%12 ]
				/* Test octave */
				if( -1 == e.className.indexOf('octave')) e.className += ' octave' + parseInt( nBase/12 )
					else e.className = e.className.replace( /octave\d/, ' octave' + parseInt( nBase/12 ))
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
	tuning: 0,
	lefthanded:0,
	mirror:0,
	octaves:0,
	notes:0,
	numbers:1
	}
Manche.getDefaultSettings = function( oConfig ){
	oConfig = oConfig || {}
	for( const s in Manche.DefaultSettings )
		oConfig[s] = oConfig[s] !== undefined
			? oConfig[s]
			: Manche.DefaultSettings[s]
	return oConfig
	}

Manche.getHTML = function( nCordes, nCases ){
	var eParent = _.Tag( 'DIV', 'eGuitar' )
	var e = _.Tag( 'DIV', 'manche' ), eCase, eCorde, eFrette
	
	// manche
	for(var i=0, ni=nCases+1; i<ni; i++ ){
		eCase = _.Tag( 'DIV', 'case case'+ i )
		for(var j=nCordes; j>0; j-- ){
			eCorde = _.Tag( 'DIV', 'corde corde'+ j )
			eCorde.appendChild( _.Tag( 'SPAN' ))
			eCase.appendChild( eCorde )
			}
		if( i!=0 ){
			eFrette = _.Tag( 'DIV', 'frette' )
			eFrette.appendChild( _.Tag( 'SPAN' )).innerHTML = i
			eCase.appendChild( eFrette )
			}
		if( i==3 || i==5 || i==7 || i==9 || i==12 || i==15 || i==17 || i==19 || i==21 || i==24 ){
			eFrette = _.Tag( 'DIV', 'incrustation' )
			eCase.appendChild( eFrette )
			}
		e.appendChild( eCase )
		}
	eParent.appendChild( e )
	eParent.style.width = (nCases+1)*70 +'px'
	eParent.style.height = nCordes*30 +'px'
	return eParent
	}

MancheForm =function( oManche ){
	var eUL = _.Tag( 'UL', 'mancheForm' )
	var eLI = _.Tag( 'LI' )
	var eLabel = eUL.appendChild( _.Tag( 'LABEL' ))
	eLabel.innerHTML = 'Accordage : '
	var eAccordage = eUL.appendChild( _.Tag( 'SELECT' )), eOption
	for(var a=Manche.aAccordage, i=0, ni=a.length; i<ni; i++ ){
		eOption = _.Tag( 'OPTION' )
		eOption.value = i
		eOption.innerHTML = a[i][1]
		eAccordage.appendChild( eOption ) 
		}
	eLabel.htmlFor = eAccordage.id =  'eAccordage'+ oManche.ID
	eUL.appendChild( eLI )
	
	var checkbox =function( sId, sLabel ){
		var eLI = _.Tag( 'LI' )
		var eCheckBox = eLI.appendChild( _.Tag( 'INPUT' ))
		var eLabel = eLI.appendChild( _.Tag( 'LABEL' ))
		eCheckBox.type = 'checkbox'
		eLabel.htmlFor = eCheckBox.id = sId + oManche.ID
		eLabel.innerHTML = sLabel
		eLI.appendChild( eCheckBox )
		eLI.appendChild( eLabel )
		eUL.appendChild( eLI )
		return eCheckBox
		}
	
	var e5 = oManche.eNotationI = checkbox( 'eNotationI', 'ABCDEFG.' )
	var e6 = oManche.eBemol = checkbox( 'eBemol', 'Bémol.' )
	var e1 = oManche.eFlipH = checkbox( 'eFlipH', 'Gaucher.' )
	var e2 = oManche.eFlipV = checkbox( 'eFlipV', 'Miroir.' )
	var e3 = oManche.eOctave = checkbox( 'eOctaves', 'Octaves.' )
	var e4 = oManche.eNotesName = checkbox( 'eNotesName', 'Notes.' )
	var e7 = oManche.eFretsNumber = checkbox( 'eFretsNumber', 'Numéros.' )

	e1.onclick = function(){ LeftHanded.setValue( e1.checked )}
	e2.onclick = function(){ Mirror.setValue( e2.checked )}
 	e3.onclick = function(){ oManche.setOctave( e3.checked ) }
 	e4.onclick = function(){ oManche.notes.setValue( e4.checked ) }
 	e5.onclick =
	e6.onclick = function(){ oManche.setNotation( e5.checked?'EN':'FR', e6.checked ) }
	e5.checked = Notation.getValue()[1] == 'EN'
	e6.checked = Notation.getValue()[0]
 	e7.onclick = function(){ oManche.setFretsNumber( e7.checked ) }
	e7.onclick()
	eAccordage.onkeyup =
	eAccordage.onchange = function(){ Tuning.setValue( eAccordage.value ) }

	Notation.addObserver( function( a ){
		e5.checked = a[1] == 'EN'
		e6.checked = a[0]
		})
	Tuning.addObserver( function( nId ){ eAccordage.value = nId })
	oManche.notes.addObserver( function( b ){ e4.checked = b })

	oManche.e.appendChild( eUL )
	}

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

class Harmonie {
	constructor( eParent, oManche ){
		var that = this
		this.aResult = null
			
		this.oManche = oManche
		oManche.oHarmonie = this
		let oIntervalBox = this.oIntervalBox = new IntervalBox ( oManche )
		eParent.appendChild( oIntervalBox.eHTML )

		// this.oChordsBox = oChordsBox = new ChordsBox
		// eParent.appendChild( oChordsBox.eHTML )

		var _sTonique = 'Mi'
		var _oTonique = this.oTonique = new SpecialVar ( 'Mi' )
		_oTonique.addObserver( function( sNote ){
			that.eTonique.value = sNote
			oIntervalBox.setNotes( Notations.getSequence( sNote ))
			})

		var eTable = _.Tag( 'TABLE', 'harmonieForm' )
		var eSUGG = _.Tag( 'TABLE', 'suggestion', 'eSuggestion'+ Manche.ID )
		eSUGG.cellSpacing = 0

		/* Constructeur html */
		var selectbox =function( sId, sLabel, a, sRadio ){
			var eTH, eTD, eTR = _.Tag( 'TR' )
			
			eTH = _.Tag( 'TH' )
			eTH.align="right"
			eTH
		/* 		if( sRadio ){
				var eRadio = eTH.appendChild( _.Tag( 'INPUT' ))
				eRadio.type = 'radio'
				eRadio.id = 'eR_'+ sId
				eRadio.name = sRadio
				} */
			var eLabel = eTH.appendChild( _.Tag( 'LABEL' ))
			eLabel.innerHTML = sLabel +':'
			eTR.appendChild( eTH )
			
			eTD = _.Tag( 'TD' )
			var eSelect = eTD.appendChild( _.Tag( 'SELECT' )), eOption
			for(var i=0, ni=a.length; i<ni; i++ ){
				eOption = _.Tag( 'OPTION' )
				if( a[i].constructor == String )
						eOption.innerHTML = eOption.value = a[i]
					else {
						eOption.innerHTML = a[i][1]
						eOption.value = a[i][0]
						}
				eSelect.appendChild( eOption ) 
				}
			eTR.appendChild( eTD )
			
			eLabel.htmlFor = eSelect.id =  sId + Harmonie.ID
			eTable.appendChild( eTR )
			return eSelect
			}
		var btn =function( sText, eSelect, f ){
			var eBTN = _.Tag( 'Button' )
			eBTN.innerHTML = sText
			eBTN.onclick = f
			eSelect.parentNode.appendChild( eBTN )
			}

		/* Construction html */
		var eTonique = selectbox( 'eTonique', 'Tonique', Notations.getSequence())
		eTonique.onkeyup = eTonique.onchange =function(){}
		Notation.addObserver( function(){
			_oTonique.refresh()
			var a = Notations.getSequence()
			var e = eTonique.firstChild
			var sSelected = Notation.getValue()
			var i = 0
			while( e ){
				e.innerHTML = e.value = a[i++]
				e = e.nextSibling
				}
			})

		var eScale = selectbox( 'eScales', 'Gamme', Harmonie.aScales, 'choice' )
		eScale.value = '100101110010'
		eScale.className = 'scale'
		btn( "OK", eScale, eScale.onkeyup = eScale.onchange =function(){
			that.showInterval( eTonique.value, eScale.value )
			that.displayChords()
			})

		var eChords = selectbox( 'eChords', 'Arpège', Harmonie.aArpeges, 'choice' )
		btn( "OK", eChords, eChords.onkeyup = eChords.onchange = function(){
			that.showInterval( eTonique.value, eChords.value )
			})

		eParent.appendChild( eTable )

		eSUGG.onclick =function( evt ){
			var e = Events.element( evt )
			if( e.nodeName != 'DIV' && e.nodeName != 'CAPTION' ) e = e.parentNode
			var sTonique = e.attributes.tonique && e.attributes.tonique.value
			var sMask = e.attributes && e.attributes.arpege && e.attributes.arpege.value
			if( sMask ){
				that.oTonique.setValue( sTonique )
				that.eChords.value = sMask
				that.showInterval( sTonique, sMask )
			//	that.displayChordsSimilarities( sTonique, sMask )
				}

			var sScale = e.scale
			if( sScale ){
				that.oTonique.setValue( e.tonique )
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
		for(var j=0,nj=Harmonie.aArpeges.length; j<nj; j++ ){
			var a = Harmonie.aArpeges[j]
			if( ( parseInt(sScaleMask,2) & parseInt(a[1],2) ).toString(2) == a[1])
				aResult.push( a.concat( Harmonie.getSimilarity( sScaleMask, a[1], 'scale' )))
			}
		return aResult
		}
	setChords ( sTonique, sScaleMask, aChords ){
		var o = {}
		for(var i=0, ni=Harmonie.aArpeges.length; i<ni; i++ ){
			var sChordName =  Harmonie.aArpeges[i][0]
			o[ sChordName ] = []
			o[ sChordName ][12] = 0
						
			// Compte le nombre de "1"
			var sMask = Harmonie.aArpeges[i][1]
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
				var sChordName =  aj[j][0]
				var sOpacity = ( aj[j][2] != undefined ? 'opacity:'+ aj[j][2] +' !important;' : '' )
				var sTitle = ( aj[j][3] != undefined ? aj[j][3] : '' )
				o[ sChordName ][ ton ] =
					'<div class="ton'+ ton +'" tonique="'+ sNote +'" arpege="'+ aj[j][1] +'" style="'+ sOpacity +'" title="'+ sTitle +'">'
					+'<b>'+ sNote +'</b><i>'+ sChordName +'</i></div>'
				o[ sChordName ][12]++
				}
			}
			
		var aTR = []
		for(var i=0, ni=Harmonie.aArpeges.length; i<ni; i++ ){
			var sChordName = Harmonie.aArpeges[i][0]
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
		sTHEAD += '<th abbr="number"><label>Accords</label></th><th abbr="number"><label>Notes</label></th></tr></thead>'
		
		this.eSUGG.innerHTML = sTHEAD +'<tbody>'+ aTR.join("\n") +'</tbody>'
		
		var aSort = [13,'DESC']
		if( this.TableSorter ) aSort = this.TableSorter.getSort()
		this.TableSorter = new TSorter;
		this.TableSorter.init( this.eSUGG.id )
		if( aSort ) this.TableSorter.sort( aSort[0], aSort[1] )

		var e = _.Tag( 'CAPTION' )
		e.innerHTML = '<h2>'+ this.sScaleName +'</h2>'
		e.tonique = sTonique
		e.scale = sScaleMask
		this.eSUGG.insertBefore( e, this.eSUGG.firstChild )
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
				if( aChords[j].length > 2 )  aChords[j] = aChords[j].slice( 0, 2 )
				aChords[j] = aChords[j].concat( Harmonie.getSimilarity( aChords[j][1], sDegreMask, 'chord' ))
				}
			}

		// Met à jour l'affichage
		var sScaleMask = this.eScale.value 
		var sTonique = ai[0][0]

		this.setChords( sTonique, sScaleMask, this.aResult )
		
		return null
		}
	showInterval ( sNote, sMask ){
		this.oTonique.setValue( sNote )
		this.oIntervalBox.setValue( sMask )
		this.oManche.setScale( sNote, sMask )
		}
	}
Harmonie.ID = 0
Harmonie.getSimilarity = function( sChordOrScaleMask1 , sChordMask2 , sType ){
	var countTons = function ( sMask ){ return sMask.split("1").length - 1 }
	var nTons1 = countTons( sChordOrScaleMask1 )
	var nTons2 = countTons( sChordMask2 )
	var nCommonTons = countTons( ( parseInt( sChordOrScaleMask1, 2 ) & parseInt( sChordMask2, 2 ) ).toString(2) )
	var nOpacity = 1 - nCommonTons / nTons1
	var getLabel = function(){
		switch( sType ){
			case 'scale': return parseInt( nOpacity * 100 ) + "%";
			case 'chord': return "Accord à "+ nTons1 + " tons, "+ nCommonTons + "/" + nTons2 + " ton(s) en commun - " + parseInt( nOpacity * 100 ) + "%";
			default: return ''
			}
		}
	return [
		( Number( nOpacity ) + .1 ).toFixed(2),
		// .1 ajouter pour rendre tous les éléments visibles
		getLabel()
		]
	
	}

class IntervalBox {
	constructor ( oManche ){
		this.sMask = null
		oManche.oIntervalBox = this
		this.oManche = oManche
		let that = this
		// Construction HTML
		let eUL = this.eHTML = _.Tag('UL','interval')
		, eLI, eDIV, eDL, eDT, eDD
		for(let i=0; i<12; i++ ){
			eLI = _.Tag('LI','ton'+i)
			eDIV = _.Tag('DIV')
			eLI.appendChild( eDIV )
			eDL = _.Tag('DL')
			eDT = _.Tag('DT')
			eDT.innerHTML = IntervalBox.DT[i]
			eDD = _.Tag('DD')
			eDD.innerHTML = IntervalBox.DD[i]
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
	var eDIV = this.eHTML = _.Tag('DIV','chords')
	}
