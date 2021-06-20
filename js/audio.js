let playTone
let playChord

;(function(){
	//Create Audio Context
	let AudioContext = window.AudioContext || window.webkitAudioContext
	let context = new AudioContext()

	// Utilitaire Mathématique
	if( ! Math.round10 )
	(function(){
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

	/*
	Main ideas from :
		https://codepen.io/johnslipper/details/eYgZMRL
		https://fazli.sapuan.org/blog/electric-guitar-synth-in-html5/
	*/
	// Signal dampening amount
	let dampening = 0.99

	// Returns a AudioNode object that will produce a plucking sound
	function pluck( frequency ){
		// We create a script processor that will enable
		// low-level signal sample access
		const pluck = context.createScriptProcessor(4096, 0, 1)

		// N is the period of our signal in samples
		const N = Math.round( context.sampleRate / frequency )

		// y is the signal presently
		const y = new Float32Array(N)
		for( let i = 0; i < N; i++ ){
			// We fill this with gaussian noise between [-1, 1]
			y[i] = Math.random() * 2 - 1
			}

		// This callback produces the sound signal
		let n = 0
		pluck.onaudioprocess = function(e){
			// We get a reference to the outputBuffer
			const output = e.outputBuffer.getChannelData(0)

			// We fill the outputBuffer with our generated signal
			for( let i = 0; i < e.outputBuffer.length; i++ ){
				// This averages the current sample with the next one
				// Effectively, this is a lowpass filter with a
				// frequency exactly half of sampling rate
				y[n] = (y[n] + y[(n + 1) % N]) / 2

				// Put the actual sample into the buffer
				output[i] = y[n]

				// Hasten the signal decay by applying dampening.
				y[n] *= dampening

				// Counting constiables to help us read our current
				// signal y
				n++
				if (n >= N) n = 0
				}
			}

		// The resulting signal is not as clean as it should be.
		// In lower frequencies, aliasing is producing sharp sounding
		// noise, making the signal sound like a harpsichord. We
		// apply a bandpass centred on our target frequency to remove
		// these unwanted noise.
		const bandpass = context.createBiquadFilter()
		bandpass.type = "bandpass"
		bandpass.frequency.value = frequency
		bandpass.Q.value = 1

		// We connect the ScriptProcessorNode to the BiquadFilterNode
		pluck.connect(bandpass)

		// Our signal would have died down by 2s, so we automatically
		// disconnect eventually to prevent leaking memory.
		setTimeout(() => { pluck.disconnect(); }, 2000 )
		setTimeout(() => { bandpass.disconnect(); }, 2000 )

		// The bandpass is last AudioNode in the chain, so we return
		// it as the "pluck"
		return bandpass
		}


	// Fret is an array of finger positions
	// e.g. [-1, 3, 5, 5, -1, -1];
	// 0 is an open string
	// >=1 are the finger positions above the neck
	function strum( mNotes, nFreqLa, stagger = 25 ){
		let a = mNotes.constructor == Array ? mNotes : mNotes.split(',')
		
		// Reset dampening to the natural state
		dampening = 0.99

		// Connect our strings to the sink
		const dst = context.destination
		for( let i = 0, ni=a.length ; i < ni ; i++ )
			setTimeout( () => { pluck( tone( a[i], nFreqLa ) ).connect(dst); }, stagger * i )
		}

	function mute() {
		dampening = 0.89
		}

	// Retourne la fréquence d'une note : A4, Mi5, F#2, etc...
	// en fonction de la fréquence du La3
	let tone =(function(){ 
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
	playTone =( sNoteOctave, nFreqLa ) => {
		context.resume().then( pluck( tone( sNoteOctave, nFreqLa )).connect( context.destination ))
		return mute
		}
		
	// Joue un accord
	//	playChord( 'E2,B2,E3,G#3,B3,E4', 440, 50 )
	//	playChord( ['E2','B2','E3'], 440, 150 )
	playChord = ( mNotes, nFreqLa, nTime )=>{
		context.resume().then( strum( mNotes, nFreqLa, nTime ))
		return mute
		}
	})()