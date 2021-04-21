//Create Audio Context
var AudioContext = window.AudioContext || window.webkitAudioContext
var context = null
var o = null
var g = null

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

//Primary function
playTone = (frequency, type ) => {
	if( ! context ) context = new AudioContext()
	if( frequency === undefined ) frequency = 440
	if( type === undefined ) type = "sine"
	o = context.createOscillator()
	g = context.createGain()
	o.connect(g)
	o.type = type
	o.frequency.value = tone( frequency )
	g.connect( context.destination )
	g.gain.setValueAtTime( g.gain.value, context.currentTime )
	g.gain.exponentialRampToValueAtTime( 0.0001, context.currentTime + 1.000 )
	g.gain.setValueAtTime( g.gain.value, context.currentTime + .250 )
	o.start(0)
	}
