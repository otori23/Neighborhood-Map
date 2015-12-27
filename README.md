#YottaCycle
[YottaCycle](http://otori23.github.io/YottaCycle/ "The YottaCycle App") is a single page web application featuring a map showing the locations of recycling facilities in a selected geographic area.

##User Guide

Go to Live Site: [YottaCycle](http://otori23.github.io/YottaCycle/ "The YottaCycle App")

- Enter a location in the input textbox on the welcome screen
- As you type, a list of suggested locations will appear underneath the textbox based on your partial entry
- Select your desired location from the list of suggestions and click the search button
- A list of recycling facilities around your specified location will be displayed on a map
- Click on the map markers or list items to display more detailed information for a recycling facility
- To enter a new location, click on the location name in the header bar to navigate back to the welcome screen

###For Mobile Users

- Use the hamburger icon in the header of the maps screen to hide/show list of recycle facilities
- To enter a new location click on the location name in the header of the list of recycle facilities

##Application Features

###Welcome Screen

- Contains [Knockout.js](http://knockoutjs.com/ "knockout.js") + [GeoNames](http://www.geonames.org/export/geonames-search.html "geonames search api") based auto-complete widget for names of geographical locations
- Geocoding of location names provided by [GeoNames](http://www.geonames.org/export/geonames-search.html "geonames search api")

###Main Maps Screen

- Uses [Foursquare](https://developer.foursquare.com/start "foursquare api") to find recycle facilities in the selected location
- Uses [Google Maps](https://developers.google.com/maps/documentation/javascript/ "google maps api") and map markers to show recycle facilities near/around a specified location 
- Displays a list of the names of the recycle facilities
- Contains a search bar that can be used to filter the list of names and map markers of the recycle facilities

###Recycle Facility Details

- Open an Info-window to view more information on a recycle facility by clicking on a map marker or its name in the list view
- The marker for the selected recycle facility and its name in the list are highlighted in green
- Close the Info-window by clicking on the map marker or the list name of the already selected recycle facility

###Change Location

- The currently selected location is displayed as a link on the main maps screen
- Click on this link to open the welcome screen again
- Use the auto-complete widget to select a new location

###Application Data Persistence

The application uses localStorage to persist the last searched location. So, subsequent loading of the application will immediately display recycle facilities near/around the last searched location.

##Build

The build system is based on [Node.js](https://nodejs.org/en/ "Node.js") and [Gulp](http://gulpjs.com/ "gulp.js").

Clone this repository
	
	git clone https://github.com/otori23/YottaCycle.git

Get the node modules used in the build process using npm

	npm install

Build the application using gulp

	gulp --environment production

The build process

- Optimizes the image files
- Lints the javascript source files
- Minifies the html, css, and javascript source files

The build outputs are placed in the root directory of the repository. They are:

- index.html
- css/
- img/
- js/

Open index.html in a web browser to start using the application.

Resources
--------

- [Knockout MVVM Organizational Library](http://knockoutjs.com/ "knockout.js")
- [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/ "google maps api")
- [Foursquare API](https://developer.foursquare.com/start "foursquare api")
- [GeoNames Search Webservice](http://www.geonames.org/export/geonames-search.html "geonames search api")
