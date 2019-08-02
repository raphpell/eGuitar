/*--------------------------------------------------------------*/
// HTML TABLE SORTER
// OBJECT ORIENTED JAVASCRIPT IMPLEMENTATION OF QUICKSORT
// @author	Terrill Dent 
// @source	http://www.terrill.ca
// @date	August 28th, 2006
/*--------------------------------------------------------------*/
function TSorter(){
	var table = Object;
	var trs = Array;
	var ths = Array;
	var nCurSortCol = Object;
	var nPrevSortCol = -1;
	var sortType = Object;
	var sortDirection = Object;

	function get(){}

	function getCell(index){
		return trs[index].cells[nCurSortCol] 
		}

	/*----------------------INIT------------------------------------*/
	// Initialize the variable
	// @param tableName - the name of the table to be sorted
	/*--------------------------------------------------------------*/
	this.init =function( tableName ){
		table = document.getElementById(tableName);
		ths = table.getElementsByTagName("th");
		for(var i = 0; i < ths.length ; i++)
			ths[i].onclick = function(){ sort(this); }
		this.cols = ths
		return true;
		};
		
	this.sort =function( nCol, sOrder ){
		sort( this.cols[nCol], sOrder )
		}	
		
	this.getSort =function(){
		return [nPrevSortCol, sortDirection ]
		}
	
	/*----------------------SORT------------------------------------*/
	// Sorts a particular column. If it has been sorted then call reverse
	// if not, then use quicksort to get it sorted.
	// Sets the arrow direction in the headers.
	// @param oTH - the table header cell (<th>) object that is clicked
	/*--------------------------------------------------------------*/
	function sort( oTH, sOrder ){
		if( oTH == undefined ) return;
		nCurSortCol = oTH.cellIndex;
		sortType = oTH.abbr;
		
		trs = table.tBodies[0].getElementsByTagName("tr");

		//set the get function
		setGet(sortType)

		// if already sorted just reverse
		if( nPrevSortCol == nCurSortCol ){
			if( sOrder && sOrder==oTH.className ) return ;
			if( ! oTH.className ) oTH.className = ( sOrder != 'ASC' ? 'ASC' : 'DESC' )
			sortDirection = oTH.className = ( oTH.className != 'ASC' ? 'ASC' : 'DESC' );
			reverseTable();
			}
		// not sorted - call quicksort
		else{
			sortDirection = oTH.className = sOrder || 'ASC';
			quicksort(0, trs.length);
			if( sOrder && sOrder == "DESC" ) reverseTable();
			}
		if( sOrder && sOrder!=oTH.className ) reverseTable();
		
		nPrevSortCol = nCurSortCol;
		}
	
	/*--------------------------------------------------------------*/
	// Sets the GET function so that it doesnt need to be 
	// decided on each call to get() a value.
	// @param: colNum - the column number to be sorted
	/*--------------------------------------------------------------*/
	function setGet(sortType){
		switch(sortType){   
			case "number":
				get = function(index){ return new Number( getCell(index).firstChild.nodeValue ); };
				break;
			case "link_column":
				get = function(index){ return getCell(index).firstChild.firstChild.nodeValue; };
				break;
			case 'arpege':
				get = function(index){
					var e = getCell(index)
					e = e && e.firstChild
					var s = e && e.getAttribute('arpege') 
					return s || '' 
					};
				break;
			default:
				get = function(index){
					var e = getCell(index)
					e = e && e.firstChild
					return e ? e.nodeValue : null ;
					};
				break;
			};	
		}

	/*-----------------------EXCHANGE-------------------------------*/
	//  A complicated way of exchanging two rows in a table.
	//  Exchanges rows at index i and j
	/*--------------------------------------------------------------*/
	function exchange(i, j){
		if(i == j+1){
			table.tBodies[0].insertBefore(trs[i], trs[j]);
			}
		else if(j == i+1) {
			table.tBodies[0].insertBefore(trs[j], trs[i]);
			}
		else {
			var tmpNode = table.tBodies[0].replaceChild(trs[i], trs[j]);
			if(typeof(trs[i]) == "undefined") table.appendChild(tmpNode);
			else table.tBodies[0].insertBefore(tmpNode, trs[i]);
			}
		}
	
	/*----------------------REVERSE TABLE----------------------------*/
	//  Reverses a table ordering
	/*--------------------------------------------------------------*/
	function reverseTable(){
		for(var i = 1; i<trs.length; i++)
			table.tBodies[0].insertBefore(trs[i], trs[0]);
		}

	/*----------------------QUICKSORT-------------------------------*/
	// This quicksort implementation is a modified version of this tutorial: 
	// http://www.the-art-of-web.com/javascript/quicksort/
	// @param: lo - the low index of the array to sort
	// @param: hi - the high index of the array to sort
	/*--------------------------------------------------------------*/
	function quicksort(lo, hi){
		if(hi <= lo+1) return;
		 
		if((hi - lo) == 2){
			if(get(hi-1) > get(lo)) exchange(hi-1, lo);
			return;
			}
		
		var i = lo + 1;
		var j = hi - 1;
		
		if(get(lo) > get(i)) exchange(i, lo);
		if(get(j) > get(lo)) exchange(lo, j);
		if(get(lo) > get(i)) exchange(i, lo);
		
		var pivot = get(lo);
		
		while(true) {
			j--;
			while(pivot > get(j)) j--;
			i++;
			while(get(i) > pivot) i++;
			if(j <= i) break;
			exchange(i, j);
			}
		exchange(lo, j);
		
		if((j-lo) < (hi-j)) {
			quicksort(lo, j);
			quicksort(j+1, hi);
			}
		else {
			quicksort(j+1, hi);
			quicksort(lo, j);
			}
		}
	}
