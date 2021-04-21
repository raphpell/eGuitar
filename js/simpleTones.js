//Create Audio Context
var AudioContext = window.AudioContext || window.webkitAudioContext
var context = new AudioContext()
var o = null
var g = null


//Sound Storage 
//If you add your own sounds here, please consider 
//submitting a pull request with your additional sounds
var soundObj = {
	bump:["triangle",100,0.8,333,0.2,100,0.4,80,0.7],
	buzzer:["sawtooth",40,0.8, 100,0.3 ,110, 0.5],
	zip:["sawtooth",75,0.8,85,0.2,95,0.4,110,0.6,120,0.7,100,0.8],
	powerdown:["sine", 300, 1.2, 150, 0.5,1,0.9],
	powerup:["sine", 30, 1, 150, 0.4,350,0.9],
	bounce:["square", 75, 0.5, 150, 0.4],
	siren:["sawtooth",900,2.5, 400,0.5 ,900, 1, 400,1.4, 900, 2, 400, 2.5],
	loop:["sine", 340, 2.5, 550, 0.8, 440, 1.4],
	falling:["sine", 750, 5.2, 700, 1, 600, 2, 500, 3, 400, 4, 300, 4.5, 200, 5]
	}


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

var tone = function( sNoteOctave ){
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
	let nOctave =  sNoteOctave.charAt( sNoteOctave.length-1 )
	let sNote =  sNoteOctave.slice( 0, -1 )
	if( oIndex[ sNote ] === undefined ){
		var a = sNote.replace(/([^#♯b♭]*)([#♯b♭]*)/, function ( matched, m1, m2 ){ return [m1, m2]}).split(',')
		sNote2 = oIndex2[ a[0]] + a[1]
		if( oIndex[ sNote2 ] === undefined ) throw Error(`La note "${sNote2}" existe ?`)
		oIndex[ sNote ] = oIndex[ sNote2 ]
		sNote = sNote2
		}
	let nIndex = oIndex[ sNote ] - 9
	let n = nIndex + 12 * ( nOctave - 3 )
	return Math.round10( La3.getValue() * Math.pow( Math.pow( 2, 1/12 ), n ), -2 )
	}

// Chord Storage
var chord = {
	'CM': [261.6, 329.6, 392.0],
	'Cm': [261.6, 311.1, 392.0],
	'C♯M': [277.2, 349.2, 415.3],
	'DM': [293.7, 370.0, 440.0],
	'DmM': [293.7, 349.2, 440.0],
	'D♯': [311.1, 392.0, 466.2],
	'EM': [329.6, 415.3, 493.9],
	'Em': [329.6, 392.0, 493.9],
	'FM': [349.2, 440.0, 523.251],
	'Fm': [349.2, 415.3, 523.251],
	'F♯M': [370.0, 554.365, 466.2],
	'GM': [392.0, 493.9, 587.330],
	'Gm': [392.0, 466.2, 587.330],
	'G♯M': [466.2, 523.251, 622.254],
	'AM': [440.0, 554.365, 659.255],
	'Am': [440.0, 523.251, 659.255],
	'A♯M': [466.2, 587.330, 698.456],
	'BM': [493.9, 622.254, 739.989],
	'Bm': [493.9, 587.330, 739.989]
	}


//Primary function
playTone = (frequency, type, duration) => {
	if( ! context ) context = new AudioContext()
	if( type === undefined ) type = "sine"
	if( duration === undefined ) duration = 1
	if( frequency === undefined ) frequency = 440

	o = context.createOscillator()
	g = context.createGain()
	o.connect(g)
	o.type = type
	
	if( typeof frequency === "string" ){
		// chord
		if( chord[frequency]){
			o.frequency.value = chord[frequency][0]
			completeChord( chord[frequency][1], type, duration )
			completeChord( chord[frequency][2], type, duration )
		} else {
			o.frequency.value = tone( frequency )
		}
	// sound
	} else if( typeof frequency === "object" ){
		o.frequency.value = frequency[0]
		completeChord( frequency[1], type, duration )
		completeChord( frequency[2], type, duration )
	// frequency
	} else {
		o.frequency.value = frequency
		}

	g.connect( context.destination )
	o.start(0)
	g.gain.exponentialRampToValueAtTime( 0.0001, context.currentTime + duration )
	}

//This function helps complete chords and should not be used by itself
completeChord = (frequency, type, duration) => {
	osc = context.createOscillator()
	gn = context.createGain()
	osc.connect(gn)
	osc.type = type
	osc.frequency.value = frequency
	gn.connect(context.destination)
	osc.start(0)
	gn.gain.exponentialRampToValueAtTime(0.0001,context.currentTime + duration)
	}


//This function plays sounds
  function playSound ( waveType, startFreq, endTime ){
	if( soundObj[ arguments[0] ] && arguments.length === 1 ){
		var soundName = arguments[0]
		playSound(...soundObj[soundName])
	} else {
		var oscillatorNode = context.createOscillator()
		var gainNode = context.createGain()

		oscillatorNode.type = waveType
		oscillatorNode.frequency.setValueAtTime( startFreq, context.currentTime )

		for( var i = 3; i < arguments.length; i += 2 ){
			oscillatorNode.frequency.exponentialRampToValueAtTime( arguments[i], context.currentTime + arguments[i+1] )
			}
		gainNode.gain.setValueAtTime( 0.3, context.currentTime )
		gainNode.gain.exponentialRampToValueAtTime( 0.1, context.currentTime +  0.5 )

		oscillatorNode.connect( gainNode )
		gainNode.connect( context.destination )

		oscillatorNode.start()
		oscillatorNode.stop( context.currentTime + endTime )
		}
	}



