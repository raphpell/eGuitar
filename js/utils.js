/*=== Utilitaires ====*/
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
Tag =function( sName, m, sId ){ // m: object (augmentation) or css class
	var e = document.createElement( sName )
	if( m && m.constructor === String ){
		e.className = m
		if( sId ) e.id = sId
		return e
		}
	return m ? Object.assign( e, m ) : e
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
