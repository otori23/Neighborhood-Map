(function() {	
	function YottaCycleAppViewModel() {
		// Data
	    var self = this;
	    self.places = ko.observableArray([]);
	    self.filteredPlaces = ko.computed(function() {
	        return ko.utils.arrayFilter(self.places(), function(place) { return true; });
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
        var hood = new google.maps.LatLng(37.338141, -121.886366);
        var map = new google.maps.Map(document.getElementById('map'), {
            center: hood,
            zoom: 12,
            disableDefaultUI: true
        });

        // Load Data (From 4Square or LocalStorage)

        // Draw Markers on Map
	}

	ko.applyBindings(new YottaCycleAppViewModel());
})();