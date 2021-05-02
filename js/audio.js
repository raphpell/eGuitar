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
})();

// Retourne la fréquence d'une note
var tone =(function(){
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

// Emet le son d'une note
playTone =(function(){
	//Create Audio Context
	var AudioContext = window.AudioContext || window.webkitAudioContext
	let context
	

	function genererCourbeDistortion(amount) {
		var k = typeof amount === 'number' ? amount : 50,
		n_samples = 44100,
		curve = new Float32Array(n_samples),
		deg = Math.PI / 180,
		i = 0,
		x;
		for ( ; i < n_samples; ++i ) {
			x = i * 2 / n_samples - 1;
			curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
		}
		return curve;
	}

	return ( sNoteOctave, nFreqLa ) => {
		if( ! context ) context = new AudioContext()
		let o = context.createOscillator()
		let g = context.createGain()
		let d = context.createWaveShaper()
	//	let fn = context.createBiquadFilter()
		
		g.gain.value = .5
		d.curve = genererCourbeDistortion()
		
		o.type = "sine"
		o.frequency.value = tone( sNoteOctave, nFreqLa )
		
	
		o.connect(d)
		d.connect(g)
	//	fn.connect(g)
		g.connect( context.destination )

		g.gain.exponentialRampToValueAtTime( 0.0001, context.currentTime + 2.000 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .2 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .4 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .6)
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .8)
		g.gain.setValueAtTime( g.gain.value, context.currentTime + 1)
		o.start(0)
		}
	})()
