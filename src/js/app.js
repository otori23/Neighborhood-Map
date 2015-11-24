$(function() {	
	function YottaCycleAppViewModel() {
		// Data
	    var self = this;
	    self.searchValue = "";
	    self.places = ko.observableArray([]);

	    // Event Handlers
	    self.onHamburgerClick = function() {
      		var $placesSection = $(".places-section");
      		$placesSection.toggleClass('open-places-section');
	    };

	    self.onSearchBarClick = function() {
      		var $textBox = $('input[type="text"]');
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
				infoWindow.open(self.map, marker);
			}
			else {
				infoWindow.close();
			}
        };

        // Operations

        // Draw Map
        //self.hood = new google.maps.LatLng(37.338141, -121.886366);
        self.hood = new google.maps.LatLng(37.4, -121.886366);
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: self.hood,
            zoom: 10,
            disableDefaultUI: true
        });

        // Load Data (From 4Square or LocalStorage)
        $.ajax({
  			url: "https://api.foursquare.com/v2/venues/search?client_id=XOVHNWG4KKKESGADD0HOE3SWYTXVWYAPWHSQFC4CO4FHE4R5&client_secret=FHXKIUQOFHCJUXQYECAVH3DYE50JEJZ1N1AKONXHHEMWVLZR&v=20130815&ll=37.338141,-121.886366&query=recycle",

  			success: function(data, textStatus, jqXHR) {
  				var venues = $.map(data.response.venues, function(venue) { 
  					venue.visible = ko.observable(true); 
  					return venue; 
  				});
  				venues.sort(function(a, b){ return a.name.localeCompare(b.name); });
  				self.places(venues);
  			},

  			error: function(jqXHR, textStatus, errorThrown) {
  				// Do something sensible here
  				alert("Error Loading Recycling Data");
  			}
		});
	}

	ko.bindingHandlers.drawMarker = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var place = bindingContext.$data;
	        var map = bindingContext.$parent.map;

	        var infoWindow = new google.maps.InfoWindow({
    			content: place.name
  			});

	        var marker = new google.maps.Marker({
			    position: {lat: place.location.lat, lng: place.location.lng},
			    title: place.name
			});

	        marker.addListener('click', function() {
    			bindingContext.$parent.placeItemClicked(place, {currentTarget: element});
  			});

			$.data(element, "marker", marker);
			$.data(element, "infoWindow", infoWindow);
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
	        	infoWindow.close();
	        	marker.setMap(null);
	        }
	    }
	};

	ko.applyBindings(new YottaCycleAppViewModel());
});