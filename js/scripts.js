/* -------------*/
var _ ={
	Tag :function( sName, sClasses ){
		var e = document.createElement( sName )
		if( sClasses ) e.className = sClasses
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
SpecialVar =function( mValue ){
	this._aOnSet = []
	this.setValue( mValue )
	}
SpecialVar.prototype =(function(){
	return {
		value: null,
		_aOnSet: null,
		setValue :function( mValue ){
			this.value = mValue
			for(var i=0,ni=this._aOnSet.length; i<ni; i++ ){ this._aOnSet[i]( mValue ) }
			return mValue
			},
		getValue :function(){
			return this.value
			},
		addObserver :function( fObserver ){
			this._aOnSet.push( fObserver )
			}
		}
	})()
/* -------------*/
	
Notation = new SpecialVar ([false,'FR'])
Notation.choices ={
	'♯':{	FR:['Mi',	'Fa',	'Fa♯',	'Sol',	'Sol♯',	'La',	'La♯',	'Si',	'Do',	'Do♯',	'Ré',	'Ré♯'],
			EN:['E',	'F',	'F♯',	'G',	'G♯',	'A',	'A♯',	'B',	'C',	'C♯',	'D',	'D♯']	},
	'♭':{	FR:['Mi',	'Fa',	'Sol♭',	'Sol',	'La♭',	'La',	'Si♭',	'Si',	'Do',	'Ré♭',	'Ré',	'Mi♭'],
			EN:['E',	'F',	'G♭',	'G',	'A♭',	'A',	'B♭',	'B',	'C',	'D♭',	'D',	'E♭']	}
	}
Notation.getSequence =function( sNote ){
	var a = this.value
	if( ! sNote ) return this.choices[ a[0]?'♭':'♯' ][ a[1]]
	else {
		sNote = this.getNoteName( sNote )
		var a = this.getSequence()
		var nIndex = a.indexOf( sNote )
		return a.slice( nIndex ).concat( a.slice( 0, nIndex))
		}
	}
Notation.getNoteName =function( sNote ){	
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
		
	var a = Notation.choices[sIndex1][sIndex2]
	for(var i=0; i<12; i++ ){
		if( a[i]== sNote ) return Notation.getSequence()[i]
		}
	throw Error ( 'Invalid note name... '+ sNote )
	}

Manche =function( sNodeID, nCordes, nCases ){
	this.history = new Manche.History ( this )
	this.aFrequences = [0,0,0,0,0,0]
	var eParent = document.getElementById( sNodeID )
	var nCases = nCases || 12
	this.ID = Manche.ID++
	this.e = eParent.appendChild( Manche.constructor( nCordes, nCases ))
	this.e.style.width = (nCases+1)*70 +'px'
	this.e.style.height = nCordes*30 +'px'
	this.nCordes = nCordes
	this.nCases = nCases
	this.aCordes =[
		this.e.getElementsByClassName('corde1'),
		this.e.getElementsByClassName('corde2'),
		this.e.getElementsByClassName('corde3'),
		this.e.getElementsByClassName('corde4'),
		this.e.getElementsByClassName('corde5'),
		this.e.getElementsByClassName('corde6')
		]
	this.setTuning('Mi,La,Ré,Sol,Si,Mi|0,0,0,0,0,0')
	
	var that = this
	Notation.addObserver( function(){ that.renameNotes() })
	MancheForm( this )
	}
Manche.prototype =(function(){
	return {
		setOctave :function( b ){
			this.eOctave.checked = b
			this.e.classList[ b ? 'add' : 'remove' ]( 'octaves' )
			},
		setNotation	:function( sLang, bBemol ){
			var a = Notation.getValue()
			if( a[0]==bBemol && a[1]==sLang ) return ;
			this.eNotationI.checked = sLang == 'EN'
			this.eBemol.checked = bBemol
			Notation.setValue([bBemol,sLang])
			},
		renameNotes	:function(){
			var a = Notation.getSequence()
			// Renomme les cordes
			for(var i=0; i<this.nCordes; i++ ){
				var nBase = this.aFrequences[i]
				for(var j=0; j<=this.nCases; j++ )
					this.aCordes[i][j].firstChild.innerHTML = a[ (nBase+j)%12 ]
				}
			},
		setNotesName :function( b ){
			this.eNotesName.checked = b
			this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideNotes' )
			},
		setFretsNumber :function( b ){
			this.eFretsNumber.checked = b
			this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideFretsNumber' )
			},
		setForm :function( b ){
			this.e.classList[ ! b ? 'add' : 'remove' ]( 'hideForm' )
			},
		setConfig :function( bFlipH, bFlipV ){
			this.e.classList.remove( 'gaucher_flipped' )
			this.e.classList.remove( 'gaucher' )
			this.e.classList.remove( 'flipped' )
			this.eFlipH.checked = bFlipH
			this.eFlipV.checked = bFlipV
			this.e.classList.add( bFlipH
				?( bFlipV ? 'gaucher_flipped' : 'gaucher' )
				:( bFlipV ? 'flipped' : null )
				)
			},
		getNotes :function( sNote ){
			sNote = Notation.getNoteName( sNote )
			var aElts = []
			var a = this.e.getElementsByClassName('corde')
			for(var i=0, ni=a.length; i<ni; i++ ){
				var e = a[i].firstChild
				if( e.innerHTML == sNote ) aElts.push( e )
				}
			return aElts
			},
		highlightNote :function( nCorde, nCase, sClassName ){
			var e = this.aCordes[ nCorde-1 ][ nCase ]
			if( e ) e.classList.add( sClassName )
			},
		setAccord :function( sAccord ){
		//	this.history.add( 'setAccord', [ sAccord ])
			var sNote
			for( var i=0;i<6;i++ ){
				sNote = sAccord.charAt(i)
				if( sNote !='x' ) this.highlightNote( i+1, sNote, 'position1' )
				}
			},
		highlightNotes :function( sNote, sClassName ){
			this.history.add( 'highlightNotes', [ sNote, sClassName ])
			var a = this.getNotes( sNote )
			for(var i=0, ni=a.length; i<ni; i++ ){
				a[i].className = a[i].className.replace( /ton\d[^\s]*/gim, '' )
				a[i].classList.add( sClassName )
				}
			},
		reset :function(){
			var a = this.e.getElementsByClassName('corde')
			for(var i=0, ni=a.length; i<ni; i++ ){
				var e = a[i]
				e.firstChild.className = e.firstChild.className.replace( /ton\d[^\s]*/gim, '' )
				e.className = e.className.replace( /position\d[^\s]*/gim, '' )
				}
			},
		setScale :function( sNote, sScaleMask ){
			this.reset()
			var a = Notation.getSequence( sNote )
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
			},
		setTuning :function( sAccordage ){
			var aAccordage = sAccordage.split('|')
			var aNotes = aAccordage[0].split(',')
			var aFrequences = aAccordage[1].split(',')
			var aBase = [12,17,22,27,31,36]
			var aNotation = Notation.getSequence()
			for(var i=0; i<this.nCordes; i++ ) this.aFrequences[i] = aBase[i] += 2*aFrequences[i]
			for(var i=0; i<this.nCordes; i++ ){
				var nBase = aBase[i]
				for(var j=0; j<=this.nCases; j++ ){
					var e = this.aCordes[i][j].firstChild
					e.innerHTML = aNotation[ nBase%12 ]
					/* Test octave */
					if( -1 == e.className.indexOf('octave')) e.className += ' octave' + parseInt( nBase/12 )
						else e.className = e.className.replace( /octave\d/, ' octave' + parseInt( nBase/12 ))
				//	e.title = e.className
					nBase++
					}
				}
			this.reset()
			this.history.apply()
			}
		}
	})()
Manche.ID = 0
Manche.aAccordage =[
	["Mi,La,Ré,Sol,Si,Mi|0,0,0,0,0,0",'E'],
	["Ré,La,Ré,Sol,Si,Mi|-1,0,0,0,0,0",'Dropped D']
	]

Manche.guitare = function( sNodeID ){ return new Manche ( sNodeID, 6 )}
Manche.basse = function( sNodeID ){ return new Manche ( sNodeID, 4 )}
Manche.constructor = function( nCordes, nCases ){
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
		eOption.value = a[i][0]
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
	
	var e1 = oManche.eFlipH = checkbox( 'eFlipH', 'Gaucher.' )
	var e2 = oManche.eFlipV = checkbox( 'eFlipV', 'Miroir.' )
	var e3 = oManche.eOctave = checkbox( 'eOctaves', 'Octaves.' )
	var e4 = oManche.eNotesName = checkbox( 'eNotesName', 'Notes.' )
	var e5 = oManche.eNotationI = checkbox( 'eNotationI', 'ABCDEFG.' )
	var e6 = oManche.eBemol = checkbox( 'eBemol', 'Bémol.' )
	var e7 = oManche.eFretsNumber = checkbox( 'eFretsNumber', 'Numéros.' )

	e1.onclick = e2.onclick = function(){
		oManche.setConfig( e1.checked, e2.checked )
		}
 	e3.onclick = function(){ oManche.setOctave( e3.checked ) }
	e4.checked = true
 	e4.onclick = function(){ oManche.setNotesName( e4.checked ) }
 	e5.onclick = function(){ oManche.setNotation( e5.checked?'EN':'FR', e6.checked ) }
 	e6.onclick = function(){ oManche.setNotation( e5.checked?'EN':'FR', e6.checked ) }
	e7.checked = true
 	e7.onclick = function(){ oManche.setFretsNumber( e7.checked ) }
	eAccordage.onkeyup =
	eAccordage.onchange = function(){ oManche.setTuning( eAccordage.value )}
	
	oManche.e.appendChild( eUL )
	oManche.setNotation('EN')
	}

Manche.History =(function(){
	var f =function( oManche ){
		this.oManche = oManche
		this.a = []
		}
	f.prototype={
		add :function( sName, aArguments ){
			this.a.push([ sName, aArguments ])
			},
		reset :function(){
			this.a = []
			},
		apply :function(){
			for(var i=0, ni=this.a.length; i<ni; i++ )
				this.oManche[ this.a[i][0] ].apply( this.oManche, this.a[i][1])
			this.a.length = this.a.length/2
			},
		info :function(){
			for(var i=0, ni=this.a.length; i<ni; i++ )
				console.info( this.a[i][0] +"\t"+ JSON.stringify( this.a[i][1] ))
			}
		}
	return f
	})()

Harmonie =function( eParent, oManche ){
	var that = this
		
	this.oManche = oManche
	this.oIntervalBox = oIntervalBox = new IntervalBox
	eParent.appendChild( oIntervalBox.eHTML )
	
	var _sTonique = 'Mi'
	var _oTonique = this.oTonique = new SpecialVar ( 'Mi' )
	_oTonique.addObserver( function( sNote ){
		that.eTonique.value = sNote
		oIntervalBox.setNotes( Notation.getSequence( sNote ))
		})
	
	var eTable = _.Tag( 'TABLE', 'harmonieForm' )
	var eSUGG = _.Tag( 'DIV', 'suggestion' )

	var selectbox =function( sId, sLabel, a, sRadio ){
		var eTD, eTR = _.Tag( 'TR' )
		
		eTD = _.Tag( 'TD' )
		eTD.align="right"
		eTD
/* 		if( sRadio ){
			var eRadio = eTD.appendChild( _.Tag( 'INPUT' ))
			eRadio.type = 'radio'
			eRadio.id = 'eR_'+ sId
			eRadio.name = sRadio
			} */
		var eLabel = eTD.appendChild( _.Tag( 'LABEL' ))
		eLabel.innerHTML = sLabel +':'
		eTR.appendChild( eTD )
		
		eTD = _.Tag( 'TD' )
		var eSelect = eTD.appendChild( _.Tag( 'SELECT' )), eOption
		for(var i=0, ni=a.length; i<ni; i++ ){
			eOption = _.Tag( 'OPTION' )
			if( a[i].constructor == String )
					eOption.innerHTML = eOption.value = a[i]
				else {
					eOption.innerHTML = a[i][0]
					eOption.value = a[i][1]
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
	
	var eTonique = selectbox( 'eTonique', 'Tonique', Notation.getSequence())
	eTonique.onkeyup = eTonique.onchange =function(){}
	Notation.addObserver( function(){
		var a = Notation.getSequence()
		var e = eTonique.firstChild
		var i = 0
		while( e ){
			e.innerHTML = e.value = a[i++]
			e = e.nextSibling
			}
		})
	
	var eScale = selectbox( 'eScales', 'Gamme', Harmonie.aScales, 'choice' )
	eScale.value = '100101110010'
	btn( "OK", eScale, eScale.onkeyup = eScale.onchange =function(){
		that.showInterval( eTonique.value, eScale.value )
		that.displayChords()
		})

	var eChords = selectbox( 'eChords', 'Arpège', Harmonie.aChords, 'choice' )
	btn( "OK", eChords, eChords.onkeyup = eChords.onchange = function(){
		that.showInterval( eTonique.value, eChords.value )
		})
	
	eParent.appendChild( eTable )
	
	eSUGG.onclick =function( evt ){
		var e = Events.element( evt )
		if( e.nodeName != 'DIV' && e.nodeName != 'H2' ) e = e.parentNode
		if( e.arpege ){
			_oTonique.setValue( e.tonique )
			that.eChords.value = e.arpege 
			that.showInterval( e.tonique, e.arpege )
			}
		if( e.scale ){
			_oTonique.setValue( e.tonique  )
			that.eScale.value = e.scale 
			that.showInterval( e.tonique, e.scale )
			}
		}
	eParent.appendChild( eSUGG )
	
	this.eSUGG = eSUGG
	this.eTonique = eTonique
	this.eScale = eScale
	this.eChords = eChords
	}
Harmonie.ID = 0
Harmonie.aChords =[['M', '100010010000'], ['m', '100100010000']]
Harmonie.aScales =[['Pentatonique Mineure', '100101010010']]
Harmonie.prototype =(function(){
	return {
		displayChords :function(){
			var sTonique = this.eTonique.value
			var sScaleMask = this.eScale.value
			this.oManche.setScale( sTonique, sScaleMask )
			var a = this.getChordsSuggestion( sTonique, sScaleMask )
		
			this.eSUGG.innerHTML = ''

			var e = _.Tag( 'H2' )
			e.innerHTML = sTonique +' '+ this.eScale.selectedOptions[0].innerHTML
			e.tonique = sTonique
			e.scale = sScaleMask
			this.eSUGG.appendChild( e )

			for(var i=0, ni=a.length; i<ni; i++ ){
				var sNote = a[i][0]
				var aj = a[i][1]
				var ton = a[i][2]
				for(var j=0, nj=aj.length; j<nj; j++ ){
					var e = _.Tag( 'DIV' )
					e.innerHTML = '<b>'+ sNote +'</b><i>'+ aj[j][0] +'</i>'
					e.tonique = sNote
					e.arpege = aj[j][1]
					e.className = 'ton'+ ton
					this.eSUGG.appendChild( e )
					}
				}
			},
		getChordsSuggestion :function( sTonique, sScaleMask ){
			var aNotesTmp = Notation.getSequence( sTonique )
			var aNotes = []
			var aResult = []
			
			// Compte le nombre de "1"
			var count = 0
			var pos = sScaleMask.indexOf('1');
			while (pos !== -1) {
				aNotes.push( aNotesTmp[ pos ])
				count++;
				pos = sScaleMask.indexOf('1', pos + 1 );
				}
				
			var ton = 0
			aResult.push([ aNotes[0], this.searchChords( sScaleMask ), ton ])

			var nIndex
			for(var k=0,nk=count-1; k<nk; k++ ){
				nIndex = sScaleMask.indexOf( "1", 1 )
				ton += nIndex
				sScaleMask = sScaleMask.substr( nIndex ) + sScaleMask.substr( 0, nIndex )
				aResult.push([ aNotes[k+1], this.searchChords( sScaleMask ), ton ])
				}
			return aResult
			},
		searchChords :function( sScaleMask ){
			var aResult = []
			for(var j=0,nj=Harmonie.aChords.length; j<nj; j++ ){
				var a = Harmonie.aChords[j]
				if( ( parseInt(sScaleMask,2) & parseInt(a[1],2) ).toString(2) == a[1])
					aResult.push( a )
				}
			return aResult
			},
		showInterval :function( sNote, sMask ){
			this.oTonique.setValue( sNote )
			this.oIntervalBox.setValue( sMask )
			this.oManche.setScale( sNote, sMask )
			}
		}
	})()
	
IntervalBox =function(){
	// Construction HTML
	var eUL = this.eHTML = _.Tag('UL','interval')
	, eLI, eDIV, eDL, eDT, eDD
	for(var i=0; i<12; i++ ){
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

	var that = this
	// Notation.addObserver( function(){ that.setNotes( Notation.getSequence( sNote ) ) })
	}
IntervalBox.DT = ['1','b2','2','b3','3','4','b5','5','b6','6','b7','7','8']
IntervalBox.DD = ['0','&half;','1','1&half;','2','2&half;','3','3&half;','4','4&half;','5','5&half;','6']
IntervalBox.prototype =(function(){
	return {
		setNotes :function( aNotes ){
			var aDIVs = this.eHTML.getElementsByTagName('DIV')
			for(var i=0; i<12; i++ ){
				aDIVs[i].innerHTML = aNotes[i]
				}
			},
		setValue :function( sMask ){
			var aLIs = this.eHTML.getElementsByTagName('LI')
			for(var i=0; i<12; i++ ){
				aLIs[i].classList[ sMask.charAt(i) == "1" ? 'add' : 'remove' ]( 'selected' )
				}
			}
		}
	})()