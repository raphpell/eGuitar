let L10n =function( sId ){
	var o = L10n[ L10n.sLanguage ] || L10n[ L10n.sDefaultLanguage ]
	return o && o[sId] || '<code>'+sId+'</code>'
	}
	
// 'CZ' || // pour traduction
L10n.sDefaultLanguage = 'FR'
L10n.sLanguage = navigator.language.substring(0,2).toUpperCase() || 'FR'

L10n.FR ={
	REGLAGE:	'Réglage manche',
	ACCORDAGE:	'Accordage',
	ABCDEFG:	'ABCDEFG',
	BEMOL:		'Bémol',
	GAUCHER:	'Gaucher',
	MIROIR:		'Miroir',
	OCTAVES:	'Octaves',
	NUMEROS:	'Numéros',
	TONIQUE:	'Tonique',
	GAMME:		'Gamme',
	ARPEGE:		'Arpège',
	ACCORDS:	'Accords',
	NOTES:		'Notes'
	}