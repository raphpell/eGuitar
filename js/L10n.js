let L10n =function( sId ){
	var o = L10n.sForceLanguage
		? L10n[ L10n.sForceLanguage ]
		: L10n[ L10n.sLanguage ] || L10n[ L10n.sDefaultLanguage ]
	return o && o[sId] || '<code>'+sId+'</code>'
	}
	

L10n.sForceLanguage = '' // Debug purpose
L10n.sDefaultLanguage = 'FR'
L10n.sLanguage = navigator.language.substring(0,2).toUpperCase() || 'FR'

L10n.FR = {
	// App
	DELETE_PREF: "Effacer vos préférences",
	CORDES:		'Cordes',
	ACCORDAGE:	'Accordage',
	ABCDEFG:	'Notation anglaise',
	BEMOL:		'Bémol',
	GAUCHER:	'Miroir vertical',
	MIROIR:		'Miroir horizontal',
	OCTAVES:	'Octaves',
	NUMEROS:	'Numéros des cases',
	TONIQUE:	'Tonique',
	GAMME:		'Gamme',
	GAMMES:		'Gammes',
	ARPEGE:		'Arpège',
	ARPEGES:	'Arpèges',
	ACCORDS:	'Accords',
	NOTES:		'Notes',
	AUDIO:		'Audio',
	QUANTITE:	'Quantité',
	INTERVALLES:'Intervalles',
	
	// Tunings
	Guitare:	'Guitare',
	Basse:		'Basse',
	AccAlt:		'Accordage alternatif',
	
	// Gammes
	mBlues:		'Blues Mineur',
	MPenta:		'Pentatonique majeure',
	mPenta:		'Pentatonique mineure',
	MNat:		'Majeure naturelle',
	MNat1:		'Majeure naturelle - I Ionien',
	MNat2:		'Majeure naturelle - ii Dorien',
	MNat3:		'Majeure naturelle - iii Phrygien',
	MNat4:		'Majeure naturelle - IV Lydien',
	MNat5:		'Majeure naturelle - V Mixolydien',
	MNat6:		'Mineure naturelle - vi Eolien',
	MNat7:		'Majeure naturelle - vii Locrien',
	mHar1:		'Mineure Harmonique - I',
	mHar2:		'Mineure Harmonique - II Locrien ♮13',
	mHar3:		'Mineure Harmonique - III Ionien ♯5',
	mHar4:		'Mineure Harmonique - IV Dorien ♯11',
	mHar5:		'Mineure Harmonique - V Mixolydien ♭9♭13',
	mHar6:		'Mineure Harmonique - VI Lydien ♯9',
	mHar7:		'Mineure Harmonique - VII altéré ♭♭7',
	mMel1:		'Mineure Mélodique - I',
	mMel2:		'Mineure Mélodique - II dorien ♭9',
	mMel3:		'Mineure Mélodique - III lydien ♯5',
	mMel4:		'Mineure Mélodique - IV lydien ♭7',
	mMel5:		'Mineure Mélodique - V mixolydien ♭13',
	mMel6:		'Mineure Mélodique - VI locrien ♮9',
	mMel7:		'Mineure Mélodique - VII altéré',
	MBB:		'Bebop Majeur',
	mBB:		'Bebop Mineur',
	dBB:		'Bebop Dominant',
	Chrom:		'Chromatique',
	}
L10n.EN ={
	// App
	DELETE_PREF: "Delete your preferences",
	CORDES:		'Strings',
	ACCORDAGE:	'Tuning',
	ABCDEFG:	'ABCDEFG',
	BEMOL:		'Flat',
	GAUCHER:	'left handed',
	MIROIR:		'Mirror',
	OCTAVES:	'Octaves',
	NUMEROS:	'Numbers',
	TONIQUE:	'Tonic',
	GAMME:		'Scale',
	GAMMES:		'Scales',
	ARPEGE:		'Arpeggio',
	ARPEGES:	'Arpeggios',
	ACCORDS:	'Chords',
	NOTES:		'Notes',
	AUDIO:		'Audio',
	QUANTITE:	'Amount',
	INTERVALLES:'Intervals',
	
	// Tunings
	Guitare:	'Guitar',
	Basse:		'Bass',
	AccAlt:		'Alternative tuning',
	
	// Scales
	mBlues:		'Minor blues',
	MPenta:		'Major pentatonic',
	mPenta:		'Minor pentatonic',
	MNat1:		'Natural major - I Ionian',
	MNat2:		'Natural major - ii Dorian',
	MNat3:		'Natural major - iii Phrygian',
	MNat4:		'Natural major - IV Lydian',
	MNat5:		'Natural major - V Mixolydian',
	MNat6:		'Natural major - vi Aeolian',
	MNat7:		'Natural major - vii Locrian',
	mHar1:		'Harmonic minor - I',
	mHar2:		'Harmonic minor - II Locrian ♮13',
	mHar3:		'Harmonic minor - III Ionian ♯5',
	mHar4:		'Harmonic minor - IV Dorian ♯11',
	mHar5:		'Harmonic minor - V Mixolydian ♭9♭13',
	mHar6:		'Harmonic minor - VI Lydian ♯9',
	mHar7:		'Harmonic minor - VII altered ♭♭7',
	mMel1:		'Melodic minor - I',
	mMel2:		'Melodic minor - II Dorian ♭9',
	mMel3:		'Melodic minor - III Lydian ♯5',
	mMel4:		'Melodic minor - IV Lydian ♭7',
	mMel5:		'Melodic minor - V Mixolydian ♭13',
	mMel6:		'Melodic minor - VI Locrian ♮9',
	mMel7:		'Melodic minor - VII altered',
	MBB:		'Major bebop',
	mBB:		'Minor bebop',
	dBB:		'Dominant bebop',
	Chrom:		'Chromatic',
	}