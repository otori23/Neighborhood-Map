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
      		var placesSection = document.querySelector(".places-section");
      		placesSection.classList.toggle('open-places-section');
	    };

	    self.onSearchBarClick = function() {
      		var textBox = document.querySelector('input[type="text"]');
        	textBox.focus();
        };

        // Operations
        var hood = new google.maps.LatLng(37.338141, -121.886366);
        var map = new google.maps.Map(document.getElementById('map'), {
            center: hood,
            zoom: 12,
            disableDefaultUI: true
        });
	}

	ko.applyBindings(new YottaCycleAppViewModel());
})();