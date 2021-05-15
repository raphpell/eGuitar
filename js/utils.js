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
Tag =function( sName, sClasses, sId ){
	var e = document.createElement( sName )
	if( sClasses ) e.className = sClasses
	if( sId ) e.id = sId
	return e
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
