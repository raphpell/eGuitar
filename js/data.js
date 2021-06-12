const Tunings =[
	/* Guitare */
	// 6 cordes
	['E2,A2,D3,G3,B3,E4','Standard ('+L10n('Guitare')+')' ],
	['D2,A2,D3,G3,B3,E4','Drop D'],
	['E2,A2,E3,A3,C#4,E4','Open Tuning A'],
	['D#2,G#2,C#3,F#3,A#3,D#4','Half Step Down'],
	['D2,G2,C3,F3,A3,D4','Full Step Down'],
	['C#2,F#2,B2,E3,G#3,C#4','C# Tuning (2 and 2/3 Steps Down)'],
	['D2,A2,D3,G3,B3,D4','Double Drop D'],
	['C2,G2,C3,F3,A3,D4','Drop C'],
	['C#2,G#2,C#3,F#3,A#3,D#4','Drop C#'],
	['B0,F#2,B2,E3,G#3,C#4','Drop B'],
	['A#0,F2,A#2,D#3,G3,C4','Drop A#'],
	['A0,E2,A2,D3,F#3,B3','Drop A'],
	['D2,A2,D3,F#3,A3,D4','Open D'],
	['D2,A2,D3,F3,A3,D4','Open D Minor'],
	['D2,G2,D3,G3,B3,D4','Open G'],
	['D2,G2,D3,G3,A#3,D4','Open G Minor'],
	['C2,G2,C3,G3,C4,E4','Open C'],
	['C#2,F#2,B3,E3,G#3,C#4','Open C#'],
	['C2,G2,C3,G3,C4,D#4','Open C Minor'],
	['E2,G#2,D3,E3,B3,E4','Open E7'],
	['E2,B2,D3,G3,B3,E4','Open E Minor7'],
	['D2,G2,D3,F#3,B3,D4','Open G Major7'],
	['E2,A2,E3,A3,C4,E4','Open A Minor'],
	['E2,A2,E3,G3,C4,E4','Open A Minor7'],
	['E2,B2,E3,G#3,B3,E4','Open E'],
	['E2,A2,C#3,E3,A3,E4','Open A'],
	['C2,F2,A#2,D#3,G3,C4','C Tuning'],
	['A#0,D#2,G#2,C#3,F3,A#3','Bb Tuning'],
	['D2,A2,D3,D3,D4,D4','D A D D D D'],
	['C2,G2,D3,G3,B3,D4','C G D G B D'],
	['C2,G2,D3,G3,B3,E4','C G D G B E'],
	['D2,A2,D3,E3,A3,D4','D A D E A D'],
	['D2,G2,D3,G3,A3,D4','D G D G A D'],
	['D2,A2,D3,G3,A3,D4','Open Dsus3'],
	['D2,G2,D3,G3,C4,D4','Modal G (Open Gsus3)'],
	['D2,G2,D3,G3,B3,E4','G6'],
	['C3,E3,G3,A#3,C4,D4','Overtone'],
	['A2,C3,D3,E3,G3,A4','Pentatonic'],
	['C3,D#3,F#3,A3,C4,D#4','Minor Third'],
	['C3,E3,G#3,C4,E4,G#4','Major Third'],
	['E2,A2,D3,G3,C4,F4','All Fourths'],
	['C2,F#2,C3,F#3,C4,F#4','Augmented Fourths'],
	['D2,G2,D3,F3,C4,D4','Slow Motion'],
	['C2,G2,D3,G3,B3,C4','Admiral'],
	['C2,F2,C3,G3,A#3,F4','Buzzard'],
	['C2,G2,D3,G3,A3,D4','Face'],
	['D2,A2,D3,D3,A3,D4','Four and Twenty'],
	['D2,D3,D3,D3,D4,D4','Ostrich'],
	['C2,G2,D3,D#3,D4,D#4','Capo 300'],
	['E2,A2,D3,E3,E3,A3','Balalaika'],
	['C2,F2,C3,G3,C4,D4','Cittern One'],
	['C2,G2,C3,G3,C4,G4','Cittern Two'],
	['G2,B2,D3,G3,B3,D4','Dobro'],
	['E4,B3,G3,D3,A2,E2','Lefty'],
	['C2,G2,D3,A3,E4,B4','Mandoguitar'],
	['A0,D2,G2,C3,E3,A3','A to A (Baritone)'],
	['B0,A2,D3,G3,B3,E4','Rusty Cage'],
	// 7 cordes
	['B1,E2,A2,D3,G3,B3,E4','Standard ('+L10n('Guitare')+')'],
	['A1,E2,A2,D3,G3,B3,E4','Van Eps ('+L10n('Guitare')+')'],
	// 8 cordes
	['B1,E2,A2,D3,G3,B3,E4,A4','Galbraith ('+L10n('Guitare')+')'],
	['B1,D2,E2,A2,D3,G3,B3,E4', L10n('AccAlt') +' ('+L10n('Guitare')+')'],
	// 9 cordes
	['E3,E2,A3,A2,D4,D3,G3,B3,E4','Standard ('+L10n('Guitare')+')'],
	['E2,A2,D3,G4,G3,B3,B3,E4,E4', L10n('AccAlt') +' ('+L10n('Guitare')+')'],
	// 10 cordes
	['F#1,G#1,A#1,C2,E3,A2,D3,G3,B3,E4','Standard ('+L10n('Guitare')+')'],
	// 12 cordes
	['E3,E2,A3,A2,D4,D3,G4,G3,B3,B3,E4,E4','Standard ('+L10n('Guitare')+')'],

	/* Guitare Basse */
	// 4 cordes
	['E1,A1,D2,G2','Standard ('+L10n('Basse')+')'],
	// 5 cordes
	['B0,E1,A1,D2,G2','Standard ('+L10n('Basse')+')'],
	// 6 cordes
	['B0,E1,A1,D2,G2,C3','Standard ('+L10n('Basse')+')'],

	/* Banjo */
	// 4 cordes
	['C2,G3,D3,A4','Tenor (Banjo)'],
	// 5 cordes
	['G4,D3,G3,B3,D4','Bluegrass G (Banjo)'],
	['G4,C3,G3,B3,D4','C (Banjo)'],
	['G4,B2,E3,G#3,B3','Diapson Long (Banjo)'],

	/* Ukulélé */
	['D5,G4,B4,E5','Sopranino/piccolo standard (Ukulélé)'],
	['G4,C4,E4,A4','Soprano standard (Ukulélé)'],
	['A4,D4,F♯4,B4','Soprano alternatif (Ukulélé)'],
	['G3,C4,E4,A4','Ténor standard (Ukulélé)'],
	['D3,G3,B3,E4','Baryton (Ukulélé)'],
	['E2,A2,D3,G3','Basse (Ukulélé)'],

	/* Ukulélé */
	['A2,D3,G3,C3,E4,A4','Guitalélé (Ukulélé)']

	]
const Arpeggio =[
	['100100010000','m','min'],
	['100010010000','M','Maj'],
	['100010001000','aug','5+'],
	['100100100000','dim','m♭5'],
	['110000010000','sus♭2'],
//	['110000100000','sus♭2♭5'],
	['110000001000','sus♭2♯5'],
	['101000010000','sus2'],
	['101000100000','sus2♭5'],
//	['101000001000','sus2♯5'],
	['101001010000','sus2sus4'],
	['100101010000','m(sus4)'],
	['100001010000','sus4'],
//	['100001100000','sus4♭5'],
	['100011010000','add4','add11'],
	['100000110000','sus♯4'],
//	['100000101000','sus♯4♯5'],
//	['100001010100','sus4(6)'],
//	['101000010100','sus2(6)'],
	['100010010001','M7','&Delta;7'],
//	['101000010001','M7sus2','M7/2'],
	['100001010001','M7sus4','M7/4'],
	['100010100001','M7♭5'],
	['101000100001','M7♭5sus2'],
	['100010001001','M7#5'],
	['101000001001','M7#5sus2'],
	['100001001001','M7#5sus4'],
	['110010010001','M7♭9'],
	['100110010001','M7#9'],
	['101010010101','M769'],
	['101010010001','M9','&Delta;9|M7(add9)|9(M7)'],
	['101011010001','M11','11(M7)'],
	['100010010101','M13'],
	['100000010000','5'],
	['100010100000','♭5'],
	['100010010100','6','M6'],
	['100011010100','6sus4'],
//	['100001000100','6/4'],
	['101010010100','6/9','maj6/9'],
	['100010010010','7','dom'],
	['100100100100','7dim','&deg;|&deg;7|dim7'],
	['100001010010','7sus4'],
	['100010100010','7♭5','7(-5)'],
	['100010001010','7aug','7♯5|+7|7(+5)|aug7'],
	['110010001010','7aug♭9'],
	['110010010010','7♭9','7(♭9)|7(add♭9)|7-9;-9'],
	['110010100010','7♭9♭5'],
	['100110110010','7♭9#11'],
	['100110010010','7♯9'],
	['100110100010','7♭5♯9'],
	['101010010000','add9','add2'],
	['101010010010','9','7(add9)'],
	['101001010010','9sus4','9sus|9/4'],
	['101010100010','9♭5','9(♭5)|9(-5)'],
	['101010001010','9aug','9♯5|+9|9(+5)|aug9'],
	['101010110010','9♯11'],
	['101010110001','9♯11(M7)'],
	['101011010010','11'],
	['100010010110','13','7(add13)|7(add6)'],
	['101010010110','13add9'],
//	['100100001000','m#5'],
	['100100010100','m6','-6'],
//	['100100011000','m♭6'],
//	['100001001000','m6/4'],
	['101100010100','m6/9'],
	['100101011000','m6sus4'],
	['100100010001','mM7','m(+7)|-(M7)|m7b8'],
	['100100100001','mM7♭5'],
	['100100001001','mM7#5'],
	['100100010010','m7','-7'],
//	['101000010010','m7sus2','m7/2'],
	['101000001010','m7sus2#5'],
//	['100001001010','m7sus4#5'],
//	['100100001010','m7#5'],
	['100100100010','m7♭5','m7(-5)|&#119209;7|1/2dim'],
//	['101000100010','m7♭5sus2'],
	['110100100010','m7♭5♭9'],
	['100100011010','m7♭6'],
	['110100010010','m7♭9'],
	['110100110010','m7♭9#11'],
	['110101010010','m7♭9sus4'],
	['110101011010','m7♭6♭9sus4'],
	['100101101010','m7add♭6♭5sus4'],
	['101100010000','m(add9)','m(add2)'],
	['101100010010','m9'],
	['101100100010','m9♭5'],
	['101100110010','m9#11'],
	['101100010001','mM9','mMaj9|m9(M7)'],
	['101101010001','mM11','m11(M7)'],
	['101101010010','m11','m9(sus4)'],
	['101101100010','m11♭5'],
	['110101100010','m11♭5♭9'],
	['101100010110','m13']
	]
const Scales =[
	['100000000000',''],
	['100101010010', L10n('mPenta')],
	['101010010100', L10n('MPenta')],
	['101011010101', L10n('MNat1')],
	['101101010110', L10n('MNat2')],
	['110101011010', L10n('MNat3')],
	['101010110101', L10n('MNat4')],
	['101011010110', L10n('MNat5')],
	['101101011010', L10n('MNat6')],
	['110101101010', L10n('MNat7')],
	['101101011001', L10n('mHar1')],
	['110101100110', L10n('mHar2')],
	['101011001101', L10n('mHar3')],
	['101100110110', L10n('mHar4')],
	['110011011010', L10n('mHar5')],
	['100110110101', L10n('mHar6')],
	['110110101100', L10n('mHar7')],
	['101101010101', L10n('mMel1')],
	['110101010110', L10n('mMel2')],
	['101010101101', L10n('mMel3')],
	['101010110110', L10n('mMel4')],
	['101011011010', L10n('mMel5')],
	['101101101010', L10n('mMel6')],
	['110110101010', L10n('mMel7')],
	['101011011101', L10n('MBB')],
	['101111010110', L10n('mBB')],
	['101011010111', L10n('dBB')],
	['101011011001', 'Harmonic major'],
	['101110010100', 'Blues major (1)'],
	['100101110010', 'Blues minor (1)'],
	['100101110100', 'Blues major (2)'],
	['100100101110', 'Blues minor (2)'],
	['100101110011', 'Blues (add M7)'],
	['100101100010', 'Blues Pentatonic'],
	['110110110110', 'Blues diminished (1)'],
	['100110110010', 'Blues diminished (2)'],
	['101010010010', L10n('Penta')+'- dominant'],
	['110100011000', L10n('Penta')+'- balinese'],
	['101100010100', L10n('Penta')+'- japanese'],
	['110001010010', L10n('Penta')+'- kokinjoshi'],
	['101010011000', L10n('Penta')+'- harmonic'],
	['110001011000', L10n('Penta')+'- nippon'],
	['110100010010', L10n('Penta')+'- pelog'],
	['100011010001', L10n('Penta')+'- mauritanian'],
	['101100101000', L10n('Penta')+'- locrian (1)'],
	['110100101000', L10n('Penta')+'- locrian (2)'],
	['101010101010', 'Whole tone'],
	['100110011001', 'Augmented'],
	['101010100110', 'Prometheus'],
	['100011011010', 'Hindu'],
	['101101010010', 'Minor Hexatonic - Bahar'],
	['101010110100', 'Hexa. lydian'],
	['101101010100', 'Hexa. melodic'],
	['110101011000', 'Hexa. phrygian'],
	['100110010110', 'Hexa. binary tritonic (blues)'],
	['101100110100', 'Hexa. suspended diminished tritonic'],
	['101100101100', 'Hexa. diminished tritonic Yang'],
	['110100110100', 'Hexa. diminished tritonic Yin'],
	['110011101011','Enigmatic (Verdi)'],
	['110100101011','Enigmatic Minor (Verdi)'],
	['110011001011','Enigmatic Descending (Verdi)'],
	['110010101011','Enigmatic Ascending (Verdi)' ],
	['110011101010','Oriental (1)' ],
	['110011101100','Oriental (2)' ],
	['100111001101','Oriental (3)' ],
	['110011011001','Gypsy (1)' ],
	['110011010110','Gypsy (2)' ],
	['101011101010','Arabian' ],
	['101100111010','Hungarian gypsy' ],
	['100110110110','Hungarian major' ],
	['101100111001','Hungarian minor (algerian)' ],
	['110101010101','Neopolitan major' ],
	['110101011001','Neopolitan minor' ],
	['110011110010','Persian (1)' ],
	['110011101001','Persian (2)' ],
	['110011011010','Spanish (1)' ],
	['110111101010','Spanish (2)' ],
	['110111011010','Flamenco' ],
	['101101101101','Diminished' ],
	['110110110101','Half diminished' ],
	['101100110001','Semi-tonal chromatic minor' ],
	['100110110001','Semi-tonal chromatic major' ],
	['111111111111', L10n('Chrom')]
	]

;(function(){
	let o = {}
	
	Arpeggio.forEach( a => {
		o[ a[0]] = a
		})

	let n = 0
	let aIdee = [ L10n('PREMIER'), L10n('DEUXIEME'), L10n('TROISIEME'), L10n('QUATRIEME')]
	Arpeggio.forEach( ([ sMask, sName ]) => {
		let a = sMask.match(/(10*)/g) || []
		, tmp
		
		if( a.length < 5 ){
			for(var i=0, ni=a.length-1; i<ni; i++ ){
				a[a.length] = a[i]
				a[i] = ''
				sMask = a.join('')
				tmp = sName +' ('+ aIdee[i] +' '+ L10n('INVERSION') +')'
				if( ! o[ sMask ]){
					n++
					o[ sMask ] = Arpeggio.push( [sMask, tmp ])
					}
				else{ 
					o[ sMask ][2] = 
						o[ sMask ][2]
						? o[ sMask ][2]+'|'+ tmp
						: tmp
					}
				}
			}
		})
	})();
