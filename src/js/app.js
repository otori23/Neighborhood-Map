$(function() {	
	function YottaCycleAppViewModel() {
		// Data
	    var self = this;
	    self.places = ko.observableArray([]);
	    self.filteredPlaces = ko.computed(function() {
	        return ko.utils.arrayFilter(self.places(), function(place) { return !place._destroy; });
	    });

	    // Event Handlers
	    self.onHamburgerClick = function() {
      		var $placesSection = $(".places-section");
      		$placesSection.toggleClass('open-places-section');
	    };

	    self.onSearchBarClick = function() {
      		var $textBox = $('input[type="text"]');
        	$textBox.focus();
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
  				var venues = $.map(data.response.venues, function(venue) { venue._destroy = false; return venue; });
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
	        var place = valueAccessor();
	        var unwrappedPlace = ko.unwrap(place);
	        var marker = new google.maps.Marker({
			    position: {lat: unwrappedPlace.location.lat, lng: unwrappedPlace.location.lng},
			    title: unwrappedPlace.name
			});

			$.data(element, "marker", marker);
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var place = valueAccessor();
	        var unwrappedPlace = ko.unwrap(place);
	        var marker = $.data(element, "marker");
	        if(!unwrappedPlace._destroy) {
	        	marker.setMap(allBindings.get('markerMap'));
	        }
	        else {
	        	marker.setMap(null);
	        }
	    }
	};

	ko.applyBindings(new YottaCycleAppViewModel());
});