$(function() {
  /**
   * Yotta Cycle App View Model.
   */	
	function YottaCycleAppViewModel() {
		// Data
		var self = this;

		// default neighborhood == San Jose, CA, US
		self.currentNeighborhood = ko.observable("");
    self.neighborhoodLat = ko.observable(37.4);
    self.neighborhoodLng = ko.observable(-121.9);

		// Data: Main Page
		self.placeSearchTerm = ko.observable("");
    self.places = ko.observableArray([]);
    self.previousPlaceSelection = {
      exists: false,
	    marker: null,
	    infoWindow: null,
	    element: null
	   };

		// Data: Modal Page
    self.neighborhoodOptions = ko.observableArray([]);
    self.selectedNeighborhood = ko.observable();
    self.selectedNeighborhood.subscribe(function (geoname) {
    	if(geoname !== undefined){
    		self.neighborhoodSearchTerm(geoname.displayName);
    		self.neighborhoodLat(geoname.lat);
    		self.neighborhoodLng(geoname.lng);
    		self.neighborhoodOptions.removeAll();
    	}	
  	});
    self.hideModalCloseBtn = ko.observable(true);
    self.hideModalSpinner = ko.observable(true);
    self.neighborhoodSearchTerm = ko.observable("").extend({ 
      rateLimit: { method: "notifyWhenChangesStop", timeout: 500 } 
    });
    self.minSearchTermLength = 3;
    self.hideNeighborhoodOptions = ko.computed(function() {
    	return this.neighborhoodOptions().length === 0;
    }, self);

    // Event Handlers: Main Page
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
    	var re = new RegExp(self.placeSearchTerm().trim(), "i");
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

				if(self.previousPlaceSelection.exists) {
					self.previousPlaceSelection.marker.setIcon(null);
					self.previousPlaceSelection.infoWindow.close();
					$(self.previousPlaceSelection.element).css('background-color', '');
				}
				self.setPreviousPlaceSelection(marker, infoWindow, element);
			}
			else {
				self.clearPreviousPlaceSelection();
			}
    };

    self.clearPreviousPlaceSelection = function() {
    	self.previousPlaceSelection.infoWindow.close(); 
      self.previousPlaceSelection.marker.setIcon(null); 
      $(self.previousPlaceSelection.element).css('background-color', '');

      self.previousPlaceSelection.exists = false;
      self.previousPlaceSelection.marker = null;
      self.previousPlaceSelection.infoWindow = null;
      self.previousPlaceSelection.element = null;
    };

    self.setPreviousPlaceSelection = function(marker, infoWindow, element) {
      self.previousPlaceSelection.exists = true;
			self.previousPlaceSelection.marker = marker;
			self.previousPlaceSelection.infoWindow = infoWindow;
			self.previousPlaceSelection.element = element;
    };

    self.getInfoWindowDivId = function(id) {
    	return 'y'+id;
    };

    // Event Handlers: Modal Page

    /**
     * Send geonames query to get a list of suggested location names
     * based on user's entry in text box on modal page
     */
    self.onNeighborhoodSearchKeyUp = function() {
    	$.ajax({
        	url: "http://api.geonames.org/searchJSON",
        	
        	data: {
        		userName: "otori23",
        		name_startsWith: self.neighborhoodSearchTerm,
        		featureClass: "P",
        		style: "medium",
        		maxRows: 3,
        		countryBias: "US"
        	},

        	beforeSend: function() {
        		if(self.neighborhoodSearchTerm().length < self.minSearchTermLength) {
    				  self.neighborhoodOptions.removeAll();
    				  return false;
            }
        		self.hideModalSpinner(false);
        	},

        	success: function(data) {
				    var geonames = $.map(data.geonames, function(geoname) { 
              geoname.displayName = geoname.name + ', ' + geoname.adminCode1 + ', ' + geoname.countryName;
              return geoname; 
            });
            self.neighborhoodOptions(geonames);
        	},
        	
        	error: function (xhr, textStatus, errorThrown) {
            var msg = "Ooops, geonames server returned: textStatus= " + textStatus + " Error= " + errorThrown;
            console.log(msg);
        	},

        	complete: function() {
        		self.hideModalSpinner(true);
        	}
    	});
    };

    /**
     * Send google maps query based on location selected by user
     */
    self.searchForNeighborhood = function(vm, event){
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
          localStorage.ycGeoname = null;
          var msg = "Ooops, google maps server returned: textStatus= " + textStatus + " Error= " + errorThrown;
          console.log(msg);
        	alert(msg);
      	},

        complete: function() { 
          self.hideModalSpinner(true);
        }
    	});
    };

    /**
     * Send foursquare query to find recyle facilites near the location
     * selected by the user
     */
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
  				self.currentNeighborhood(self.neighborhoodSearchTerm());
  				self.placeSearchTerm(""); 
  				self.closeModalWindow();
  				
  				if(venues.length === 0){
  					alert("No recycling facilities were found in " + self.currentNeighborhood() + ".");
  				}

          // Persist Current Location
          var geoname = {};
          geoname.lat = self.neighborhoodLat();
          geoname.lng = self.neighborhoodLng();
          geoname.neighborhoodSearchTerm = self.currentNeighborhood();
          localStorage.ycGeoname = JSON.stringify(geoname); 
  			},

  			error: function(jqXHR, textStatus, errorThrown) {
          localStorage.ycGeoname = null;
          var msg = "Ooops, foursquare returned: textStatus=" + textStatus + " Error= " + errorThrown;
          console.log(msg);
          alert(msg);
  			},

  			complete: function() { 
          self.hideModalSpinner(true);
        }
	    });
    };

    self.closeModalWindow = function() {
    	self.neighborhoodSearchTerm("");
    	self.neighborhoodOptions.removeAll();
    	$('.modalDialog').removeClass('open');
    }; 

    self.openModalWindow = function() {
    	$('.modalDialog').addClass('open');
    };

    /**
     * Update vm when a user selects one of the suggested locations from geonames
     */
    self.onNeighborhoodSelected = function() {
      self.selectedNeighborhood(this);
    };

    /**
     * Use Persistent Data if it exists
     */
    if (localStorage.ycGeoname) {
      var geoname = JSON.parse(localStorage.ycGeoname);
      self.neighborhoodLat(geoname.lat);
      self.neighborhoodLng(geoname.lng);
      self.neighborhoodSearchTerm(geoname.neighborhoodSearchTerm);
      self.searchForNeighborhood();
      $('.modalDialog').removeClass('open');
    }
	}

  /**
   * Custom KO binding used to draw google map marker
   * it ties a map marker to a list element in the DOM
   */
	ko.bindingHandlers.drawMarker = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var place = bindingContext.$data;
      var map = bindingContext.$parent.map;
      var content = $("#y" + place.id).html();

      var infoWindow = new google.maps.InfoWindow({
        content: content,
        maxWidth: 225 
		  });

      var marker = new google.maps.Marker({
        position: {lat: place.location.lat, lng: place.location.lng},
        title: place.name
	    });

      infoWindow.addListener('closeclick',function(){
        bindingContext.$parent.clearPreviousPlaceSelection();
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
      	if(marker === bindingContext.$parent.previousPlaceSelection.marker) {
      		bindingContext.$parent.clearPreviousPlaceSelection();
      	}
      	marker.setMap(null);
      }
    }
	};

  /**
   * Custom KO binding used to mimic the visibility css property
   */
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