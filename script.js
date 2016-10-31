//**** Application to search LCBO product database and display basic information about returned results

//Global Variables 
var $searchUrl;
var $nextProdPageUrl;
var $prevProdPageUrl;
var $nextStorePageUrl;
var $prevStorePageUrl;
var $currentProdPage;
var $userAddress = "100 Queen St W";
var $userCity = "Toronto";
var $userLocation = $userAddress + ", " + $userCity + ", ON"; //using Nathan Phillips Square @ City Hall as default

//Clears currently displayed search results and hides pager buttons

function clearResults() {
	$( "#locationWrapper" ).hide();
	$( "#resultsWrapper div" ).remove();
	$( "#suggestion" ).remove();
	$( "#prevPage, #nextPage" ).hide().removeClass();
	$( "#prodNameStoreList" ).empty().hide();
}


//*** USER LOCATION FUNCTION ***//

$( "#locationWrapper" ).one( "click", function() {
	$( "#location" ).slideToggle();
	$( "#test" ).slideToggle();
} );
$( "#location" ).submit( function( evt ) {
	evt.preventDefault();
	$userAddress = $( "#userAddress" ).val();
	$userCity = $( "#userCity" ).val();
	$userLocation = $userAddress + ', ' + $userCity + ', ON';
	$( "#locationWrapper" ).slideToggle();
} );
$( "#resultsWrapper" ).on( "click", ".storeEntry", function() {
	//Capture store address & city
	var storeAddress = $( this ).children( ".store2" ).html();
	var storeCity = $( this ).children( ".store4" ).html();
	// Generate URL
	var mapURL = 'https://www.google.ca/maps/dir/' + $userAddress + ',+' + $userCity + ',+ON/' + storeAddress + ',+' + storeCity + ',+ON';
	window.open( mapURL );
} );


//***** GET PRODUCT RESULTS FUNCTION ******//
function resultsGet( url ) {
	clearResults();
	//Declare callback function, to process & display results
	function $callBack( data ) {
		//Log results for reference (testing purposes) 
		console.log( data );
		//Store results in variable
		$results = data.result;
		$currentProdPage = data.pager.current_page_path;
		//If no results, display suggestion from LCBO
		if ( $results.length == 0 ) {
			var errorHTML = '<h3 id="suggestion">Did you mean <b>' + data.suggestion + '</b>?</h3>';
			$( "#resultsWrapper" ).append( errorHTML );
		} else {
			//Loop to create .resultEntry div for each product found
			$.each( $results, function( i, value ) {
				//capture relevant  product details
				var thumbnail;
				// If no product thumbnail available, insert placeholder
				if ( value.image_thumb_url == null ) {
					thumbnail = '<img src="../img/product_thumb_placeholder.png" alt="Product Thumbnail" class="productThumb">'
				} else {
					thumbnail = '<img src="' + value.image_thumb_url + '" alt="Product Thumbnail" class="productThumb">'
				};
				var name = value.name;
				var priceInCents = value.price_in_cents / 100;
				var price = priceInCents.toFixed( 2 );
				var primaryCategory = value.primary_category;
				var varietal = value.secondary_category + ', ' + value.varietal;
				var style = value.style;
				var producerName = value.producer_name;
				var packageAndAlcohol = value.package + ", " + value.alcohol_content / 100 + '% ABV';
				var productID = value.id;
				var resultHTML = '<div class="resultEntry" id="' + productID + '" >';
				//Add thumbnail to .resultEntry div 
				resultHTML += thumbnail
					//Store details in an array
				var productDetails = [ name, price, primaryCategory, varietal, style, producerName, packageAndAlcohol ];
				//Loop through array to enclose details in <span> tags, append to resultHTML
				$.each( productDetails, function( i, value ) {
					//Assign classes for Primary Category Icons
					if ( value == "Beer" ) {
						resultHTML += '<span class="prod2 beer">' + value + '</span>';
					} else if ( value == "Wine" ) {
						resultHTML += '<span class="prod2 wine">' + value + '</span>';
					} else if ( value == "Spirits" ) {
						resultHTML += '<span class="prod2 spirits">' + value + '</span>';
					} else if ( value == "Ready-to-Drink/Coolers" ) {
						resultHTML += '<span class="prod2 coolers">' + value + '</span>';
					} else if ( value == "Ciders" ) {
						resultHTML += '<span class="prod2 ciders">' + value + '</span>';
					} else {
						resultHTML += '<span class="prod' + i + '">' + value + '</span>';
					};
				} );
				resultHTML += '</div>';
				//Append resultHTML to #resultsWrapper div  
				$( "#resultsWrapper" ).append( resultHTML );
			} ); //END Each Loop
		};
		//Show/Hide page links as needed
		$pager = data.pager;
		if ( $pager.is_final_page == false ) {
			$( "#nextPage" ).toggle().addClass( "prodNext" );
		};
		if ( $pager.is_first_page == false ) {
			$( "#prevPage" ).toggle().addClass( "prodPrev" );
		};
		$nextProdPageUrl = $pager.next_page_path;
		$prevProdPageUrl = $pager.previous_page_path;
	} //END $callBack
	//AJAX GET request 
	$( function() {
		$.ajax( {
			url: 'http://proxy.hackeryou.com', //Request needs to be sent through a proxy, until on final domain
			dataType: 'json',
			method: 'get',
			data: {
				reqUrl: 'http://lcboapi.com' + url,
				xmlToJSON: false
			}
		} ).then( $callBack );
	} ); // END AJAX Request
}; //END resultsGet function

//*** GET STORES LIST FUNCTION ***//

function storesGet( id ) {
	//Clear current displayed results & pager links
	clearResults();
	$( "#prodNameStoreList" ).show();
	//Declare callback function, to process & display results
	function $callBack( data ) {
		//Log results for reference (testing purposes) 
		console.log( data );
		//Store results in variable
		$results = data.result;
		//Capture name of product, display on store results page
		$productNameStoreList = data.product.name;
		var prodNameHtml = '<h3>Stores with ' + $productNameStoreList + ' in stock.</h3><p>Sorted by closest to ' + $userLocation + '</p><p>Click here to return to search results</p>';
		$( "#prodNameStoreList" ).append( prodNameHtml );
		//Sort results, removing stores with no product in stock
		$hasProduct = [];
		$.each( $results, function( i, value ) {
			if ( value.quantity != 0 ) {
				$hasProduct.push( this );
			}
		} ); //END Each loop
		//capture relevant store details
		$.each( $hasProduct, function( i, value ) {
			var name = value.name;
			var quantity = "Number in stock: " + value.quantity;
			var address1 = value.address_line_1;
			var address2 = " ";
			if ( value.address_line_2 != null ) {
				address2 = value.address_line_2;
			};
			var city = value.city;
			var telephone = value.telephone;
			var latitude = value.latitude;
			var longitude = value.longitude;
			var storeID = value.id;
			//Store results in array
			var storeDetails = [ name, quantity, address1, address2, city, telephone ];
			var resultHTML = '<div class="storeEntry" id="' + storeID + '" >'
				////Loop through array to enclose details in <span> tags, append to resultHTML
			$.each( storeDetails, function( i, value ) {
				resultHTML += '<span class="store' + i + '">' + value + '</span>';
			} );
			resultHTML += '</div>';
			//Append resultHTML to #resultsWrapper div  
			$( "#resultsWrapper" ).append( resultHTML );
		} );
		//Show/Hide page links as needed
		$pager = data.pager;
		if ( $pager.is_final_page == false ) {
			$( "#nextPage" ).toggle().addClass( "storeNext" );
		};
		if ( $pager.is_first_page == false ) {
			$( "#prevPage" ).toggle().addClass( "storePrev" );
		};
		$nextStorePageUrl = $pager.next_page_path;
		$prevStorePageUrl = $pager.previous_page_path;
	} //END $callBack
	//AJAX GET request 
	$( function() {
		$.ajax( {
			url: 'http://proxy.hackeryou.com', //Request needs to be sent through a proxy, until on final domain
			dataType: 'json',
			method: 'get',
			data: {
				reqUrl: 'http://lcboapi.com/stores?geo=' + $userLocation + '&product_id=' + id,
				xmlToJSON: false
			}
		} ).then( $callBack );
	} ); // END AJAX Request
}; //END storesGet function



//*** BUTTON BEHAVIOURS **///

$( "#pageLinks" ).on( "click", ".prodPrev", function() {
	resultsGet( $prevProdPageUrl )
} );
$( "#pageLinks" ).on( "click", ".prodNext", function() {
	resultsGet( $nextProdPageUrl )
} );
$( '#search' ).submit( function( evt ) {
	evt.preventDefault();
	//Capture user input
	searchQuery = $( '#query' ).val();
	//If no input after submit, show no results
	if ( searchQuery == "" ) {
		clearResults();
	} else {
		$searchUrl = "/products?key=MDoyZWVmOTI4Mi04YmVmLTExZTYtYTA3ZS03YmFiYzVlYmNkMDM6enNZUDZnM0lwY0hWS3dVcmVHNUVBY3F4MVJDa2RIU1hyZUVo&per_page=10&q=" + searchQuery + "&xmlToJSON=false";
		resultsGet( $searchUrl );
	}
} );
$( "#resultsWrapper" ).on( "click", ".resultEntry", function() {
	var prodID = $( this ).attr( 'id' );
	storesGet( prodID );
} );
$( "#pageLinks" ).on( "click", ".storePrev", function() {
	storesGet( $prevStorePageUrl )
} );
$( "#pageLinks" ).on( "click", ".storeNext", function() {
	storesGet( $nextStorePageUrl )
} );
$( "#prodNameStoreList" ).on( "click", function() {
	resultsGet( $currentProdPage )
} );
