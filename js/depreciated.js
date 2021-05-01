/*
Sauvegarde des fonctions d'un objet en vue de les réappliquer
*/
class MancheHistory {
	constructor ( oObject ){
		this.oObject = oObject
		this.a = []
		}
	add ( sFunctionName, aArguments ){
		this.a.push([ sFunctionName, aArguments ])
		}
	reset (){
		this.a = []
		}
	apply (){
		let o = this.oObject
		this.a.forEach( aElt => o[ aElt[0]].apply( o, aElt[1]))
		}
	info (){
		this.a.forEach( aElt => console.info( aElt[0] +"\t"+ JSON.stringify( aElt[1] )))
		}
	}

/* 
let oConfigFabric = new ConfigFabric( oDefaultSettings )
let oNewConfig = oConfigFabric.get( oSettings )
*/
class ConfigFabric {
	constructor ( oDefaultSettings ){
		this.oDefaultSettings = oDefaultSettings // ne doit être modifié
		}
	get ( oSettings ){
		return Object.assign( {}, this.oDefaultSettings, oSettings )
		}
	}



/* hallucinant */
//compressé
with(new AudioContext)for(t=i=0;n=parseInt('l43l431db98643o86ogfdbdfdgfdzbdzgigikigfdbzbdv98db9864311480'[i++],36);)	with(createOscillator())frequency.value=880*2**(-~-n%20/12),connect(destination),start(t),stop(i>56?t+q*8:t+=n>20?q=6/13:q/2)


/* // Packed notation string
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
 

// Original JavaScript code by Chirp Internet: chirpinternet.eu
// Please acknowledge use of this code by including this header.

function SoundPlayer(audioContext, filterNode) {
  this.audioCtx = audioContext;
  this.gainNode = this.audioCtx.createGain();
  if(filterNode) {
    // run output through extra filter (already connected to audioContext)
    this.gainNode.connect(filterNode);
  } else {
    this.gainNode.connect(this.audioCtx.destination);
  }
  this.oscillator = null;
}

SoundPlayer.prototype.setFrequency = function(val, when) {
  if(this.oscillator !== null) {
    if(when) {
      this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime + when);
    } else {
      this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }
  return this;
};

SoundPlayer.prototype.setVolume = function(val, when) {
  if(when) {
    this.gainNode.gain.exponentialRampToValueAtTime(val, this.audioCtx.currentTime + when);
  } else {
    this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
  }
  return this;
};

SoundPlayer.prototype.setWaveType = function(waveType) {
  this.oscillator.type = waveType;
  return this;
};

SoundPlayer.prototype.play = function(freq, vol, wave, when) {
  this.oscillator = this.audioCtx.createOscillator();
  this.oscillator.connect(this.gainNode);
  this.setFrequency(freq);
  if(wave) {
    this.setWaveType(wave);
  }
  this.setVolume(1/1000);
  if(when) {
    this.setVolume(1/1000, when - 0.02);
    this.oscillator.start(when - 0.02);
    this.setVolume(vol, when);
  } else {
    this.oscillator.start();
    this.setVolume(vol, 0.02);
  }
  return this;
};

SoundPlayer.prototype.stop = function(when) {
  if(when) {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime + when - 0.05, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + when);
  } else {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + 0.05);
  }
  return this;
};