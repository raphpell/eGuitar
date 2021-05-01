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
	let context = new AudioContext()

	return ( sNoteOctave, nFreqLa ) => {
		let o = context.createOscillator()
		let g = context.createGain()
		o.connect(g)
		o.type = "sine"
		o.frequency.value = tone( sNoteOctave, nFreqLa )
		g.connect( context.destination )
		g.gain.setValueAtTime( g.gain.value, context.currentTime )
		g.gain.linearRampToValueAtTime( 0.0001, context.currentTime + 1.000 )
		g.gain.setValueAtTime( g.gain.value, context.currentTime + .250 )
		o.start(0)
		}
	})()


/* hallucinant
//compressé
with(new AudioContext)for(t=i=0;n=parseInt('l43l431db98643o86ogfdbdfdgfdzbdzgigikigfdbzbdv98db9864311480'[i++],36);)	with(createOscillator())frequency.value=880*2**(-~-n%20/12),connect(destination),start(t),stop(i>56?t+q*8:t+=n>20?q=6/13:q/2)


// Packed notation string
var sMusique = 'l43l431db98643o86ogfdbdfdgfdzbdzgigikigfdbzbdv98db9864311480'
with(new AudioContext)            // use HTML5 audio
  for(                            // iterate through the note pitches and lengths
    t=i=0;                        // t = current time to place the note
    n=parseInt(sMusique[i++],36);                // n = note pitch/length
    )
    with(createOscillator())      // create the note oscillator

      // Set the note frequency (using Math.pow for the demo).
      //frequency.value=880*2**(-~-n%20/12),
      frequency.value=880*Math.pow(2,-~-n%20/12),

      // Send the note's sound through the speakers (for the demo, we'll connect it to
      // a gain node so we can reduce the volume).
      //connect(destination),
      connect((g=createGain(),g.gain.value=.3,g.connect(destination),g)),

      start(t),                     // schedule the note to sound
      stop(                         // schedule the end of the note
        i>56?                       // if we are in the final chord
          t+                        //   do not increment the time
            q*8                     //   hard-code the length to a semibreve
        :t+=n>20?q=6/13:q/2         // else update the length based on the note value
      )
 */