//**** Application to search LCBO product database and display basic information about returned results
//**** This is a test of using 
//Global Variables 

const lcboapp = {};

lcboapp.searchUrl = ' ';
lcboapp.nextProdPageUrl = ' ';
lcboapp.prevProdPageUrl = ' ';
lcboapp.nextStorePageUrl = ' ';
lcboapp.prevStorePageUrl = ' ';
lcboapp.currentProdPage = ' ';
lcboapp.userAddress = "100 Queen St W";
lcboapp.userCity = "Toronto";
lcboapp.userLocation = lcboapp.userAddress + ", " + lcboapp.userCity + ", ON"; //using Nathan Phillips Square @ City Hall as default

//Clears currently displayed search results and hides pager buttons

lcboapp.clearResults = () => {
	$("#locationWrapper").hide();
	$("#resultsWrapper div").remove();
	$("#suggestion").remove();
	$("#prevPage, #nextPage").hide().removeClass();
	$("#prodNameStoreList").empty().hide();
};


//*** USER LOCATION FUNCTION ***//
lcboapp.userLocationTool = () => {

	$("#locationWrapper").one("click", function() {
		$("#location").slideToggle();
		$("#test").slideToggle();
	});

	$("#location").submit(function(evt) {
		evt.preventDefault();
		lcboapp.userAddress = $("#userAddress").val();
		lcboapp.userCity = $("#userCity").val();
		lcboapp.userLocation = lcboapp.userAddress + ', ' + lcboapp.userCity + ', ON';
		$("#locationWrapper").slideToggle();
	});

	$("#resultsWrapper").on("click", ".storeEntry", function() {
		//Capture store address & city
		var storeAddress = $(this).children(".store2").html();
		var storeCity = $(this).children(".store4").html();
		// Generate URL
		var mapURL = 'https://www.google.ca/maps/dir/' + lcboapp.userAddress + ',+' + lcboapp.userCity + ',+ON/' + storeAddress + ',+' + storeCity + ',+ON';
		window.open(mapURL);
	});
};

//***** GET PRODUCT RESULTS FUNCTION ******//
lcboapp.products = {
	resultsGet: function(url) {
		lcboapp.clearResults();
		//Declare callback function, to process & display results
		function $callBack(data) {
			//Store results in variable
			$results = data.result;
			lcboapp.currentProdPage = data.pager.current_page_path;
			//If no results, display suggestion from LCBO
			if ($results.length == 0) {
				var errorHTML = '<h3 id="suggestion">Did you mean <b>' + data.suggestion + '</b>?</h3>';
				$("#resultsWrapper").append(errorHTML);
			}
			else {
				//Loop to create .resultEntry div for each product found
				$.each($results, function(i, value) {
					//capture relevant  product details
					var thumbnail;
					// If no product thumbnail available, insert placeholder
					if (value.image_thumb_url == null) {
						thumbnail = '<img src="../img/product_thumb_placeholder.png" alt="Product Thumbnail" class="productThumb">';
					}
					else {
						thumbnail = '<img src="' + value.image_thumb_url + '" alt="Product Thumbnail" class="productThumb">';
					}
					var name = value.name;
					var priceInCents = value.price_in_cents / 100;
					var price = priceInCents.toFixed(2);
					var primaryCategory = value.primary_category;
					var varietal = value.secondary_category + ', ' + value.varietal;
					var style = value.style;
					var producerName = value.producer_name;
					var packageAndAlcohol = value.package + ", " + value.alcohol_content / 100 + '% ABV';
					var productID = value.id;
					var resultHTML = '<div class="resultEntry" id="' + productID + '" >';
					//Add thumbnail to .resultEntry div 
					resultHTML += thumbnail;
					//Store details in an array
					var productDetails = [name, price, primaryCategory, varietal, style, producerName, packageAndAlcohol];
					//Loop through array to enclose details in <span> tags, append to resultHTML
					$.each(productDetails, function(i, value) {
						//Assign classes for Primary Category Icons
						if (value == "Beer") {
							resultHTML += '<span class="prod2 beer">' + value + '</span>';
						}
						else if (value == "Wine") {
							resultHTML += '<span class="prod2 wine">' + value + '</span>';
						}
						else if (value == "Spirits") {
							resultHTML += '<span class="prod2 spirits">' + value + '</span>';
						}
						else if (value == "Ready-to-Drink/Coolers") {
							resultHTML += '<span class="prod2 coolers">' + value + '</span>';
						}
						else if (value == "Ciders") {
							resultHTML += '<span class="prod2 ciders">' + value + '</span>';
						}
						else {
							resultHTML += '<span class="prod' + i + '">' + value + '</span>';
						}
					});
					resultHTML += '</div>';
					//Append resultHTML to #resultsWrapper div  
					$("#resultsWrapper").append(resultHTML);
				}); //END Each Loop
			}
			//Show/Hide page links as needed
			$pager = data.pager;
			if ($pager.is_final_page == false) {
				$("#nextPage").toggle().addClass("prodNext");
			}
			if ($pager.is_first_page == false) {
				$("#prevPage").toggle().addClass("prodPrev");
			}
			lcboapp.nextProdPageUrl = $pager.next_page_path;
			lcboapp.prevProdPageUrl = $pager.previous_page_path;
		} //END $callBack
		//AJAX GET request 
		$( function() {
			$.ajax( {
				url: 'https://lcboapi.com' + url, 
				dataType: 'json',
				method: 'get',
				xmlToJSON: false
				}).then( $callBack ).catch(function(e){
					console.log(e);
					$('#resultsWrapper').append("<div><h3>Something went wrong! Error code: " + e.statusText + ".</h3></div>")
				});
			} ); // END AJAX Request

		//TESTING TESTING ONE TWO THREE
		// $callBack(productPage);
	}, //END resultsGet method

	eventListeners: () => {

		$("#pageLinks").on("click", ".prodPrev", function() {
			lcboapp.products.resultsGet(lcboapp.prevProdPageUrl);
		});

		$("#pageLinks").on("click", ".prodNext", function() {
			lcboapp.products.resultsGet(lcboapp.nextProdPageUrl);
		});

		$('#search').submit(function(evt) {
			evt.preventDefault();
			//Capture user input
			searchQuery = $('#query').val();
			//If no input after submit, show no results
			if (searchQuery == "") {
				clearResults();
			}
			else {
				$searchUrl = "/products?access_key=REEEMOOOOVEMEEEEEMDo3MmM2MDczOC05ZmFhLTExZTYtOWExYS1kYjhlYzc1N2RmMmE6Y0J3VUM1eDlhWFFwUVNWMDdFUUQ4YmdxV2pNOUJFMUpOOUEw&per_page=10&q=" + searchQuery + "&xmlToJSON=false";
				lcboapp.products.resultsGet($searchUrl);
			}
		});

	},
};



lcboapp.stores = {
	storesGet: function(id) {
		//Clear current displayed results & pager links
		lcboapp.clearResults();
		$("#prodNameStoreList").show();
		//Declare callback function, to process & display results
		function $callBack(data) {
			//Log results for reference (testing purposes) 
			// console.log(data);
			//Store results in variable
			$results = data.result;
			//Capture name of product, display on store results page
			$productNameStoreList = data.product.name;
			var prodNameHtml = '<h3>Stores with ' + $productNameStoreList + ' in stock.</h3><p>Sorted by closest to ' + lcboapp.userLocation + '</p><p>Click here to return to search results</p>';
			$("#prodNameStoreList").append(prodNameHtml);
			//Sort results, removing stores with no product in stock
			$hasProduct = [];
			$.each($results, function(i, value) {
				if (value.quantity != 0) {
					$hasProduct.push(this);
				}
			}); //END Each loop
			//capture relevant store details
			$.each($hasProduct, function(i, value) {
				var name = value.name;
				var quantity = "Number in stock: " + value.quantity;
				var address1 = value.address_line_1;
				var address2 = " ";
				if (value.address_line_2 != null) {
					address2 = value.address_line_2;
				}
				var city = value.city;
				var telephone = value.telephone;
				var storeID = value.id;
				//Store results in array
				var storeDetails = [name, quantity, address1, address2, city, telephone];
				var resultHTML = '<div class="storeEntry" id="' + storeID + '" >';
				////Loop through array to enclose details in <span> tags, append to resultHTML
				$.each(storeDetails, function(i, value) {
					resultHTML += '<span class="store' + i + '">' + value + '</span>';
				});
				resultHTML += '</div>';
				//Append resultHTML to #resultsWrapper div  
				$("#resultsWrapper").append(resultHTML);
			});
			//Show/Hide page links as needed
			$pager = data.pager;
			if ($pager.is_final_page == false) {
				$("#nextPage").toggle().addClass("storeNext");
			}
			if ($pager.is_first_page == false) {
				$("#prevPage").toggle().addClass("storePrev");
			}
			lcboapp.nextStorePageUrl = $pager.next_page_path;
			lcboapp.prevStorePageUrl = $pager.previous_page_path;
		} //END $callBack
		//AJAX GET request 
		$( function() {
			$.ajax( {
				url: 'https://lcboapi.com/stores?access_key=MDo3MmM2MDczOC05ZmFhLTExZTYtOWExYS1kYjhlYzc1N2RmMmE6Y0J3VUM1eDlhWFFwUVNWMDdFUUQ4YmdxV2pNOUJFMUpOOUEw&geo=' + lcboapp.userLocation + '&product_id=' + id, 
				dataType: 'json',
				method: 'get',
				xmlToJSON: false
				}).then( $callBack );
			} ); // END AJAX Request

		// $callBack(storePage);

	}, //END storesGet function

	eventListeners: () => {

		$("#resultsWrapper").on("click", ".resultEntry", function() {
			var prodID = $(this).attr('id');
			lcboapp.stores.storesGet(prodID);
		});
		$("#pageLinks").on("click", ".storePrev", function() {
			lcboapp.stores.storesGet(lcboapp.prevStorePageUrl);
		});
		$("#pageLinks").on("click", ".storeNext", function() {
			lcboapp.stores.storesGet(lcboapp.nextStorePageUrl);
		});


		$("#prodNameStoreList").on("click", function() {
			lcboapp.products.resultsGet(lcboapp.currentProdPage);
		});
	}
};


lcboapp.init = () => {
	lcboapp.userLocationTool();
	lcboapp.products.eventListeners();
	lcboapp.stores.eventListeners();
};

lcboapp.init();