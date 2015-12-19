$(function() {	
	function YottaCycleAppViewModel() {
		// Data
		var self = this;

		// default neighborhood = San Jose, CA, US
	    self.neighborhoodLat = ko.observable(37.4);
	    self.neighborhoodLng = ko.observable(-121.9);

		// Data: Main Page
		self.searchValue = "";
	    self.places = ko.observableArray([]);
	    self.lastSelection = {
	    	exists: false,
	    	marker: null,
	    	infoWindow: null,
	    	element: null
	    };

		// Data: Modal Page
	    self.hoodOptions = ko.observableArray([]);
	    self.selectedHood = ko.observable();
	    self.selectedHood.subscribe(function (geoname) {
	    	if(geoname !== undefined){
	    		self.hoodSearchTerm(geoname.displayName);
	    		self.neighborhoodLat(geoname.lat);
	    		self.neighborhoodLng(geoname.lng);
	    		self.hoodOptions.removeAll();
	    	}	
    	});
	    self.hideModalCloseBtn = ko.observable(true);
	    self.hideModalSpinner = ko.observable(true);
	    self.hoodSearchTerm = ko.observable("")
	    						.extend({ 
	    							rateLimit: { method: "notifyWhenChangesStop", timeout: 500 } 
	    						});
	    self.minSearchTermLength = 3;
	    self.hideHoodOptions = ko.computed(function() {
	    	return this.hoodOptions().length === 0;
	    }, self);
	    
	    // Event Handlers
	    self.onHamburgerClick = function() {
      		var $placesSection = $(".places-section");
      		$placesSection.toggleClass('open-places-section');
	    };

	    self.onSearchBarClick = function() {
      		var $textBox = $('input[type="text"].filterInput');
        	$textBox.focus();
        };

        self.onSearchBarKeyUp = function () {
        	var places = self.places();
        	var re = new RegExp(self.searchValue.trim(), "i");
        	places.forEach(function(place) {
        		if(place.name.match(re)) {
        			place.visible(true);
        		}
        		else {
        			place.visible(false);
        		}
        	});
        	self.places(places);
        };

        self.placeItemClicked = function(place, event) {
        	var element = event.currentTarget;
        	var marker = $.data(element, "marker");
			var infoWindow = $.data(element, "infoWindow");

			if (!infoWindow.getMap()) {
				
				if(event.clickedMarker === true) { // clicked on marker
					element.scrollIntoView();
				}
				else { // clicked on list view item
					self.map.panTo(marker.getPosition());
				}
				$(element).css('background-color', '#00FF72');	
				infoWindow.open(self.map, marker);
				marker.setIcon('img/green-dot.png');

				if(self.lastSelection.exists) {
					self.lastSelection.marker.setIcon(null);
					self.lastSelection.infoWindow.close();
					$(self.lastSelection.element).css('background-color', '');
				}
				self.setLastSelection(marker, infoWindow, element);
			}
			else {
				self.clearLastSelection();
			}
        };

        self.clearLastSelection = function() {
        	self.lastSelection.infoWindow.close(); 
			self.lastSelection.marker.setIcon(null); 
			$(self.lastSelection.element).css('background-color', '');

			self.lastSelection.exists = false;
			self.lastSelection.marker = null;
			self.lastSelection.infoWindow = null;
			self.lastSelection.element = null;
        };

        self.setLastSelection = function(marker, infoWindow, element) {
        	self.lastSelection.exists = true;
			self.lastSelection.marker = marker;
			self.lastSelection.infoWindow = infoWindow;
			self.lastSelection.element = element;
        };

        self.getInfoWindowDivId = function(id) {
        	return 'y'+id;
        };

        self.onNeighborhoodSearchKeyUp = function() {
        	$.ajax({
            	url: "http://api.geonames.org/searchJSON",
            	
            	data: {
            		userName: "otori23",
            		name_startsWith: self.hoodSearchTerm,
            		featureClass: "P",
            		style: "medium",
            		maxRows: 3,
            		countryBias: "US"
            	},

            	beforeSend: function() {
            		if(self.hoodSearchTerm().length < self.minSearchTermLength) {
        				self.hoodOptions.removeAll();
        				return false;
        			}
            		self.hideModalSpinner(false);
            	},

            	success: function(data) {
  					var geonames = $.map(data.geonames, function(geoname) { 
  						geoname.displayName = geoname.name + ', ' + geoname.adminCode1 + ', ' + geoname.countryCode;
  						return geoname; 
  					});
  					self.hoodOptions(geonames);
            	},
            	
            	error: function (xhr, textStatus, errorThrown) {
              		alert("Ooops, geonames server returned: textStatus= " + textStatus + " Error= " + errorThrown);
            	},

            	complete: function() {
            		self.hideModalSpinner(true);
            	}
        	});
        };

        self.searchForNeighborhood = function(model, event){
        	$.ajax({
            	url: "https://maps.googleapis.com/maps/api/js",
            	
            	dataType: "jsonp", 

            	data: {
            		key: "AIzaSyDPw0yXOiBKXu1E7fDxNjg6BD0ANIXiSv0"
            	},

            	beforeSend: function() {
            		if(self.map !== undefined) {
        				self.hood = new google.maps.LatLng(self.neighborhoodLat(), self.neighborhoodLng());
						self.map.setCenter(self.hood);
						self.loadRecyclingData();
        				return false;
        			}
            		self.hideModalSpinner(false);
            	},

            	success: function(data) {
        			self.hood = new google.maps.LatLng(self.neighborhoodLat(), self.neighborhoodLng());
    				self.map = new google.maps.Map(document.getElementById('map'), {
        				center: self.hood,
        				zoom: 10,
        				disableDefaultUI: true
    				});
    				self.hideModalCloseBtn(false);
    				self.loadRecyclingData();
            	},
            	
            	error: function (xhr, textStatus, errorThrown) {
            		self.hideModalSpinner(true);
              		alert("Ooops, google maps server returned: textStatus= " + textStatus + " Error= " + errorThrown);
            	}
        	})
        };

        self.loadRecyclingData = function() {
        	var latlng = self.neighborhoodLat() + "," + self.neighborhoodLng();
        	$.ajax({
  				url: "https://api.foursquare.com/v2/venues/search",

  				data: {
  					client_id: "XOVHNWG4KKKESGADD0HOE3SWYTXVWYAPWHSQFC4CO4FHE4R5",
  					client_secret: "FHXKIUQOFHCJUXQYECAVH3DYE50JEJZ1N1AKONXHHEMWVLZR",
  					v: "20130815",
  					ll: latlng,
  					query: "recycle"
  				},

  				beforeSend: function() {
            		self.hideModalSpinner(false);
            	},

  				success: function(data, textStatus, jqXHR) {
  					var venues = $.map(data.response.venues, function(venue) { 
  						venue.visible = ko.observable(true); 
  						return venue; 
  					});
  					venues.sort(function(a, b){ return a.name.localeCompare(b.name); });
  					self.places(venues);
    				self.closeModalWindow();
  				},

  				error: function(jqXHR, textStatus, errorThrown) {
  					alert("Ooops, foursquare returned: textStatus=" + textStatus + " Error= " + errorThrown);
  				},

  				complete: function() {
            		self.hideModalSpinner(true);
            	}
			});
        };

        self.closeModalWindow = function() {
        	document.querySelector('.close').click();
        }; 

        self.openModalWindow = function() {
        	document.querySelector('.open').click();
        }; 

		self.openModalWindow();
	}

	ko.bindingHandlers.drawMarker = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var place = bindingContext.$data;
	        var map = bindingContext.$parent.map;
	        var content = $("#y" + place.id).html();

	        var infoWindow = new google.maps.InfoWindow({
    			content: content 
  			});

	        var marker = new google.maps.Marker({
			    position: {lat: place.location.lat, lng: place.location.lng},
			    title: place.name
			});

	        infoWindow.addListener('closeclick',function(){
				bindingContext.$parent.clearLastSelection();
			});

	        marker.addListener('click', function() {
    			bindingContext.$parent.placeItemClicked(place, {currentTarget: element, clickedMarker: true});
  			});

			$.data(element, "marker", marker);
			$.data(element, "infoWindow", infoWindow);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				// delete associated marker data
            	marker.setMap(null);
            	marker = null;

            	// delete associated infoWindow data
            	infoWindow.setMap(null);
            	infoWindow = null;
        	});
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var place = bindingContext.$data;
	        var map = bindingContext.$parent.map;

	        var marker = $.data(element, "marker");
	        var infoWindow = $.data(element, "infoWindow");
	        if(place.visible()) {
	        	marker.setMap(map);
	        }
	        else {
	        	if(marker === bindingContext.$parent.lastSelection.marker) {
	        		bindingContext.$parent.clearLastSelection();
	        	}
	        	marker.setMap(null);
	        }
	    }
	};

	ko.bindingHandlers.hidden = {
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			if(ko.unwrap(valueAccessor())){
				element.style.visibility = 'hidden';
			}
			else{
				element.style.visibility = 'initial';
			}
		}
	};

	ko.applyBindings(new YottaCycleAppViewModel());
});