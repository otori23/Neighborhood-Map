(function() {	
	function YottaCycleAppViewModel() {
		// Data
	    var self = this;
	    self.places = ko.observableArray([]);
	    self.filteredPlaces = ko.computed(function() {
	        return ko.utils.arrayFilter(self.places(), function(place) { return true; });
	    });

	    // Operations
	    self.onHamburgerClick = function() {
      		var placesSection = document.querySelector(".places-section");
      		placesSection.classList.toggle('open-places-section');
	    };

	    self.onSearchBarClick = function() {
      		var textBox = document.querySelector('input[type="text"]');
        	textBox.focus();
        };
	}

	ko.applyBindings(new YottaCycleAppViewModel());
})();