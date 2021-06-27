/*=== Utilitaires ====*/
// LocalStorage
Memoire =(function( sBase ){
	let o = JSON.parse( localStorage.getItem( sBase )) || {}
	return {
		clear:function(){
			localStorage.removeItem( sBase )
			},
		set:function( sName, mValue ){
			if( o[ sName ] == mValue ) return false
			o[ sName ] = mValue
			localStorage.setItem( sBase, JSON.stringify( o ))
			return true
			},
		get:function( sName ){
			return o[ sName ]
			}
		}
	})( 'eGuitar' )

// Pattern Publishers/Subscribers
function Publishers (){
	let o = {}
	let oTopics = {}
	let nID = -1
	o.publish =function( sTopic, mArg ){
		if ( ! oTopics[ sTopic ]) return false
		let aSubscribers = oTopics[ sTopic ]
		, n = aSubscribers ? aSubscribers.length : 0
		let b = Publishers.fDebug( sTopic )
		if( b ) console.groupCollapsed( `%cpublish "${sTopic}" : %O` , 'color:yellow;', mArg )
		while( n-- ){
			if( b ) console.info( `${aSubscribers[n].title}` )
			aSubscribers[ n ].func( mArg )
			}
		if( b ) console.groupEnd()
		return this
		}
	o.subscribe =function( sTopic, fFunc, sTitle ){
		if( ! oTopics[ sTopic ]) oTopics[ sTopic ] = []
		let sToken = ( ++nID ).toString()
		let b = Publishers.fDebug( sTopic )
		if( b ) console.log( `%cPublisher "${sTopic}" new subscriber\n\t "${sTitle||''}" %O` , 'color:lightskyblue', fFunc, sToken )
		oTopics[ sTopic ].unshift({ token: sToken, func: fFunc, title:sTitle||'' })
		return sToken
		}
	o.unsubscribe =function( sToken ){
		for( let m in oTopics ){
			if( oTopics[ m ]){
				for( let i=0, ni=oTopics[m].length; i < ni; i++ ){
					if( oTopics[m][i].token === sToken ){
						oTopics[m].splice( i, 1 )
						return sToken
						}
					}
				}
			}
		return null
		}
	return o
	}
Publishers.fDebug = ( sTopic )=>{ return false }
// Publishers.fDebug = ( sTopic )=>{ return sTopic=='tonic' }

// HTML 
Tag =function( sName, m, sId ){ // m: object (augmentation) or css class
	let e = document.createElement( sName )
	if( m && m.constructor === String ){
		e.className = m
		if( sId ) e.id = sId
		return e
		}
	return m ? Object.assign( e, m ) : e
	}
Append =function(){
	let e, m 
	for(let i=arguments.length-1; i>0; i-- ){
		e = arguments[i-1]
		m = arguments[i]
		if( m.constructor === Array )
			for(let j=0, nj=m.length; j<nj; j++ )
				e.appendChild( m[j])
		else e.appendChild( m )
		}
	return arguments[0]
	}
Events ={
	element :function( m ){
		if(!m)return null
		if(m.nodeName)return m
		if(m.type){
			m=m?m:(window.event?window.event:null)
			return m.target?(m.target.nodeType==3?m.target.parentNode:m.target):m.srcElement
			}
		return false
		}
	}
Scripts={
	add :function( url, fOnload, fOnError ){
		document.head.appendChild( Tag('SCRIPT',{
			onerror: fOnError || Scripts.loadError,
			onload: fOnload,
			src: encodeURI( url )
			}))
		return this
		},
	loadError :function( oError ){
		throw new URIError("The script " + oError.target.src + " didn't load correctly.");
		}
	}