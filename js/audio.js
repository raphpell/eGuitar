let playTone
let playChord
;(function(){
	//Create Audio Context
	let AudioContext = window.AudioContext || window.webkitAudioContext
	let context

	// Utilitaire
	;(function(){
		function decimalAdjust ( type, value, exp ){
			value = +value
			exp = +exp
			value = value.toString().split('e')
			value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)))
			value = value.toString().split('e')
			return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp))
		}
		if( ! Math.round10 ) Math.round10 =function( value, exp ){ return decimalAdjust('round', value, exp)}
		if( ! Math.floor10) Math.floor10 =function( value, exp ){ return decimalAdjust('floor', value, exp)}
		if( ! Math.ceil10 ) Math.ceil10 =function( value, exp ){ return decimalAdjust('ceil', value, exp)}
		})()

	let tone =(function(){ // Retourne la fréquence d'une note
		let cache = {}
		let oIndex = {
			'C':0,
			'C#':1,'C♯':1,'Db':1,'D♭':1,
			'D':2,
			'D#':3,'D♯':3,'Eb':3,'E♭':3,
			'E':4,
			'F':5,
			'F#':6,'F♯':6,'Gb':6,'G♭':6,
			'G':7,
			'G#':8,'G♯':8,'Ab':8,'A♭':8,
			'A':9,
			'A#':10,'A♯':10,'Bb':10,'B♭':10,
			'B':11
			}
		let oIndex2= {
			'La':'A',
			'Si':'B',
			'Do':'C',
			'Ré':'D',
			'Mi':'E',
			'Fa':'F',
			'Sol':'G'
			}

		return ( sNoteOctave, nFreqLa ) => {
			let sId = sNoteOctave + nFreqLa
			if( cache[sId ]) return cache[ sId ]
			let nOctave =  sNoteOctave.charAt( sNoteOctave.length-1 )
			let sNote =  sNoteOctave.slice( 0, -1 )
			if( oIndex[ sNote ] === undefined ){
				var a = sNote.replace(/([^#♯b♭]*)([#♯b♭]*)/, function ( matched, m1, m2 ){ return [m1, m2]}).split(',')
				sNote2 = oIndex2[ a[0]] + a[1]
				if( oIndex[ sNote2 ] === undefined ) throw Error(`La note "${sNote2}" existe ?`)
				sNote = sNote2
				}
			let nIndex = oIndex[ sNote ] - 9
			let n = nIndex + 12 * ( nOctave - 3 )
			return cache[sId] = Math.round10( nFreqLa * Math.pow( Math.pow( 2, 1/12 ), n ), -2 )
			}
		})()
	, aCourbe =(function( amount ){ // Retourne courbe de distorsion
		var k = typeof amount === 'number' ? amount : 50,
		n_samples = 44100,
		curve = new Float32Array(n_samples),
		deg = Math.PI / 180,
		i = 0,
		x;
		for( ; i < n_samples; ++i ){
			x = i * 2 / n_samples - 1;
			curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}
		return curve;
		})()
	, createSignal = function( sNoteOctave, nFreqLa, oTarget ){
		let o = context.createOscillator()
		o.type = "sine"
		o.frequency.value = tone( sNoteOctave, nFreqLa )
		o.connect( oTarget )
		return o
		}
	, createEffect = function(){
		let d = context.createWaveShaper()
		d.curve = aCourbe
		let g = context.createGain()
		g.gain.value = .5
		g.gain.exponentialRampToValueAtTime( 0.0001, context.currentTime + 2.000 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .2 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .4 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .6)
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .8)
		g.gain.setValueAtTime( g.gain.value, context.currentTime + 1)

		d.connect(g)
		g.connect( context.destination )
		return d
		}

	// Emet le son d'une note
	playTone =( sNoteOctave, nFreqLa ) => {
			if( ! context ) context = new AudioContext()
			let o = createEffect()
			createSignal( sNoteOctave, nFreqLa, o ).start(0)
			}

	playChord =( sNotes, nFreqLa ) => {
		if( ! context ) context = new AudioContext()
		let a = sNotes.split(','), o = createEffect(), n = .025
		for(var i=0, ni=a.length; i<ni; i++ )
			createSignal( a[i], nFreqLa, o ).start(i*n)
		}
//	playChord('E2,B2,E3,G#3,B3,E4', 440)
	})()
	
/*
	this.low = audioCtx.createBiquadFilter();
	this.low.type = "lowshelf";
	this.low.frequency.value = 320.0;
	this.low.gain.value = 0.0;
	this.low.connect( this.xfadeGain );

	this.mid = audioCtx.createBiquadFilter();
	this.mid.type = "peaking";
	this.mid.frequency.value = 1000.0;
	this.mid.Q.value = 0.5;
	this.mid.gain.value = 0.0;
	this.mid.connect( this.low );

	this.high = audioCtx.createBiquadFilter();
	this.high.type = "highshelf";
	this.high.frequency.value = 3200.0;
	this.high.gain.value = 0.0;
	this.high.connect( this.mid );
*/