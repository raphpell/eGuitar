let LA3 = Memoire.get('La3')||440

Manche.aAccordage =[
	["Mi,La,Ré,Sol,Si,Mi|0,0,0,0,0,0",'E'],
	["Ré,La,Ré,Sol,Si,Mi|-1,0,0,0,0,0",'Dropped D'],
	["Mi,La,Ré,Fa?Sol?,Si,Ré|0,0,0,-.5,0,-1",'Open de Luth'],
	["Ré,La,Ré,Fa?Sol?,La,Ré|-1,0,0,-.5,-1,-1",'Open de Ré'],
	["Ré,La,Ré,Sol,La,Ré|-1,0,0,0,-1,-1",'Open de Ré alternatif'],
	["Ré,Sol,Ré,Sol,Si,Ré|-1,-1,0,0,0,-1",'Open de Sol'],
	["Do,Sol,Do,Sol,Do,Mi|-2,-1,-1,0,0.5,0",'Open de Do'],
	["Do,La,Do,Sol,Do,Mi|-2,0,-1,0,.5,0",'Open de La m7'],
	["Do,Sol,Do,Sol,La,Mi|-2,-1,-1,0,-1,0",'Open de Do 6'],
	["Mi,Si,Mi,Sol,Si,Mi|0,1,1,0,0,0",'Open de Mi mineur'],
	["Mi,Si,Mi,Sol?La?,Si,Mi|0,1,1,.5,0,0",'Open de Mi'],
	["Fa,Sol?La?,Do,Fa,Sol?La?,Fa|1,-.5,-1,-1,1,1",'Open de Fa mineur'],
	["Ré,Sol,Ré,Sol,La?Si?,Ré|-1,-1,0,0,-.5,-1",'Open de Sol mineur'],
	["Ré,Sol,Ré,Sol,Si,Mi|-1,-1,0,0,0,0",'Open de Sol 6'],
	["Mi,La,Mi,La,Do?Ré?,Mi|0,0,1,1,1,0",'Open de La ("Spanish Tuning")'],
	["Ré,La,Ré,Fa?Sol?,La,Do?Ré?|-1,0,0,-.5,-1,-1.5",'Open de Ré 7M']
	]

Harmonie.aArpeges =[
	['100100010000','m'],
	['100010010000','M'],
	['100010001000','(aug)'],
	['100100100000','(dim)'],
	['110000010000','(susb2)'],
	['110000100000','(susb2 b5)'],
	['110000001000','(susb2 #5)'],
	['101000010000','(sus2)'],
	['101000100000','(sus2 b5)'],
	['101000001000','(sus2 #5)'],
	['100101010000','m(sus4)'],
	['100001010000','(sus4)'],
	['100001100000','(sus4 b5)'],
	['100011010000','(add4)'],
	['100101010000','m(add4)'],
	['100000110000','(sus#4)'],
	['100000101000','(sus#4 #5)'],
	['100000010000','5'],
	['100010100000','b5'],
	['100011010100','6(sus4)'],
	['100010010100','6'],
	['101010010100','6/9'],
	['100010010001','M7'],
	['100010100001','M7(b5)'],
	['110010010001','M7(b9)'],
	['100001010001','M7/4'],
	['101010010101','M769'],
	['100010010010','7'],
	['101000010010','7/2'],
	['100001010010','7/4'],
	['100010100010','7(b5)'],
	['100100100100','7(dim)'],
	['100010001010','7(aug)'],
	['110010001010','7aug(b9)'],
	['110010010010','7(b9)'],
	['110010100010','7(b9b5)'],
	['100110010010','7(#9)'],
	['100110100010','7(b5#9)'],
	['101010010001','M9'],
	['101010010000','(add9)'],
	['101010010010','9'],
	['101001010010','9/4'],
	['101010100010','9(b5)'],
	['101010001010','9(aug)'],
	['101010110010','9(#11)'],
	['101011010001','M11'],
	['101011010010','11'],
	['100010010110','13'],
	['101010010110','13add9'],
	['100100010100','m6'],
	['100100011000','m(b6)'],
	['101100010100','m6/9'],
	['100101011000','m6(sus4)'],
	['100100010001','m(M7) - m7b8'],
	['100100010010','m7'],
	['100100100010','m7(b5)'],
	['100100011010','m7(b9)'],
	['100101011010','m7(b6b9sus4)'],
	['110101010010','m7(b6sus4)'],
	['100101101010','m7(addb6b5sus4)'],
	['101100010010','m9'],
	['101100010001','m9(M7)'],
	['101101010010','m11 - m9(sus4)']
	]
Harmonie.aScales =[
	['100000000000',''],
	['100101110010','Blues Mineur'],
	['100101010010','Pentatonique Mineure'],
	['101010010100','Pentatonique Majeure'],
	['101011010101','Majeure naturelle - I Ionien'],
	['101101010110','Majeure naturelle - II Dorien'],
	['110101011010','Majeure naturelle - III Phrygien'],
	['101010110101','Majeure naturelle - IV Lydien'],
	['101011010110','Majeure naturelle - V Mixolydien'],
	['101101011010','Mineure naturelle - VI Eolien'],
	['110101101010','Majeure naturelle - VII Locrien'],
	['101101011001','Mineure Harmonique - I'],
	['110101100110','Mineure Harmonique - II locrien ♮13'],
	['101011001101','Mineure Harmonique - III ionien ♯5'],
	['101100110110','Mineure Harmonique - IV dorien ♯11'],
	['110011011010','Mineure Harmonique - V mixolydien ♭9♭13'],
	['100110110101','Mineure Harmonique - VI lydien ♯9'],
	['110110101100','Mineure Harmonique - VII altéré ♭♭7'],
	['101101010101','Mineure Mélodique - I'],
	['110101010110','Mineure Mélodique - II dorien ♭9'],
	['101010101101','Mineure Mélodique - III lydien ♯5'],
	['101010110110','Mineure Mélodique - IV lydien ♭7'],
	['101011011010','Mineure Mélodique - V mixolydien ♭13'],
	['101101101010','Mineure Mélodique - VI locrien ♮9'],
	['110110101010','Mineure Mélodique - VII altéré'],
	['101011011101','Bebop Majeur'],
	['101111010110','Bebop Mineur'],
	['101011010111','Bebop Dominant'],
	['111111111111','Chromatique'],
/* 	
	['100000000000',''],
	['101011010111',"Mixolydien+Ionien"],
	['101011110101',"Lydien+Ionien"],
	['101101011110',"Eolien+Dorien"],
	['101111010110',"Mixolydien+Dorien"],
	['110101111010',"Locrien+Phrygien"],
	['111101011010',"Eolien+Phrygien"],
	
	['101011110111',"Mixolydien+Lydien"],
	['101111010111',"Dorien+Ionien"],
	['101111011110',"Eolien+Mixolydien"],
	['111101011110',"Phrygien+Dorien"],
	['111101111010',"Locrien+Eolien"],
	
	['101111011111',"Eolien+Ionien"],
	['101111110111',"Lydien+Dorien"],
	['111101111110',"Locrien+Dorien"],
	['111111011110',"Mixolydien+Phrygien"],
	
	['101111111111',"Eolien+Lydien"],
	['111111011111',"Phrygien+Ionien"],
	['111111111110',"Locrien+Mixolydien"],
	
	['111111111111',"Locrien+Lydien"],
	
	['100000000000',''],
	
	['101101010010','Minor Hexatonic'],
	['101010111001','Pelog'],
	['110011101011','Enigmatic (Verdi)'],
	['110100101011','Enigmatic Minor (Verdi)'],
	['110011001011','Enigmatic Descending (Verdi)'],
	['110010101011','Enigmatic Ascending (Verdi)' ],
	['110010110010','Raga Indupriya (India)'],
	
	['110100011000','Balinaise'],
	['110100010010','Pelog(Balinaise)'],
	['110001011000','Japonaise'],
	['110001100010','Iwato(Japonaise)'],
	['101001010010','Egyptienne'],
	['100010110001','Chinoise'],
	['110110011010','Indien'],
	['101011011010','Hindou']
*/
	]
/* 
Harmonie.aChords =[
	['m',		{0:['022000','x02210']}],
	['M',		{0:['022100','x02220']}],
	['(sus2)',	{0:[]}],
	['(sus4)',	{0:[]}],
	['5',		{0:[]}],
	['(b5)',	{0:[]}],
	['(dim)',	{0:[]}],
	['(aug)',	{0:[]}],
	['m(aug)',	{0:[]}],
	['6',		{0:[]}],
	['6/9',		{0:[]}],
	['M7',		{0:[]}],
	['M7(b5)',	{0:[]}],
	['M7(b9)',	{0:[]}],
	['M7/4',	{0:[]}],
	['7',		{0:[]}],
	['7/2',		{0:[]}],
	['7/4',		{0:[]}],
	['7(b5)',	{0:[]}],
	['7(dim)',	{0:[]}],
	['7(aug)',	{0:[]}],
	['7aug(b9)',{0:[]}],
	['7(b9)',	{0:[]}],
	['7(b9b5)',	{0:[]}],
	['7(#9)',	{0:[]}],
	['7(b5#9)',	{0:[]}],
	['M9',		{0:[]}],
	['(add9)',	{0:[]}],
	['9',		{0:[]}],
	['9/4',		{0:[]}],
	['9(b5)',	{0:[]}],
	['9(aug)',	{0:[]}],
	['9(#11)',	{0:[]}],
	['M11',		{0:[]}],
	['11',		{0:[]}],
	['M13',		{0:[]}],
	['13',		{0:[]}],
	['13(b9)',	{0:[]}],
	['13(b9b5)',{0:[]}],
	['m6',		{0:[]}],
	['m6/9',	{0:[]}],
	['m(M7)',	{0:[]}],
	['m7',		{0:[]}],
	['m7(b5)',	{0:[]}],
	['m9',		{0:[]}],
	['m9(M7)',	{0:[]}],
	['m11',		{0:[]}],
	['m13',		{0:[]}]
	]
*/