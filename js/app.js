$(function(){function e(){var e=this;if(e.currentNeighborhood=ko.observable(""),e.neighborhoodLat=ko.observable(37.4),e.neighborhoodLng=ko.observable(-121.9),e.placeSearchTerm=ko.observable(""),e.places=ko.observableArray([]),e.previousPlaceSelection={exists:!1,marker:null,infoWindow:null,element:null},e.neighborhoodOptions=ko.observableArray([]),e.selectedNeighborhood=ko.observable(),e.selectedNeighborhood.subscribe(function(o){void 0!==o&&(e.neighborhoodSearchTerm(o.displayName),e.neighborhoodLat(o.lat),e.neighborhoodLng(o.lng),e.neighborhoodOptions.removeAll())}),e.hideModalCloseBtn=ko.observable(!0),e.hideModalSpinner=ko.observable(!0),e.neighborhoodSearchTerm=ko.observable("").extend({rateLimit:{method:"notifyWhenChangesStop",timeout:500}}),e.minSearchTermLength=3,e.hideNeighborhoodOptions=ko.computed(function(){return 0===this.neighborhoodOptions().length},e),e.onHamburgerClick=function(){var e=$(".places-section");e.toggleClass("open-places-section")},e.onSearchBarClick=function(){var e=$('input[type="text"].filterInput');e.focus()},e.onSearchBarKeyUp=function(){var o=e.places(),n=new RegExp(e.placeSearchTerm().trim(),"i");o.forEach(function(e){e.name.match(n)?e.visible(!0):e.visible(!1)}),e.places(o)},e.placeItemClicked=function(o,n){var r=n.currentTarget,a=$.data(r,"marker"),i=$.data(r,"infoWindow");i.getMap()?e.clearPreviousPlaceSelection():(n.clickedMarker===!0?r.scrollIntoView():e.map.panTo(a.getPosition()),$(r).css("background-color","#00FF72"),i.open(e.map,a),a.setIcon("img/green-dot.png"),e.previousPlaceSelection.exists&&(e.previousPlaceSelection.marker.setIcon(null),e.previousPlaceSelection.infoWindow.close(),$(e.previousPlaceSelection.element).css("background-color","")),e.setPreviousPlaceSelection(a,i,r))},e.clearPreviousPlaceSelection=function(){e.previousPlaceSelection.infoWindow.close(),e.previousPlaceSelection.marker.setIcon(null),$(e.previousPlaceSelection.element).css("background-color",""),e.previousPlaceSelection.exists=!1,e.previousPlaceSelection.marker=null,e.previousPlaceSelection.infoWindow=null,e.previousPlaceSelection.element=null},e.setPreviousPlaceSelection=function(o,n,r){e.previousPlaceSelection.exists=!0,e.previousPlaceSelection.marker=o,e.previousPlaceSelection.infoWindow=n,e.previousPlaceSelection.element=r},e.getInfoWindowDivId=function(e){return"y"+e},e.onNeighborhoodSearchKeyUp=function(){$.ajax({url:"http://api.geonames.org/searchJSON",data:{userName:"otori23",name_startsWith:e.neighborhoodSearchTerm,featureClass:"P",style:"medium",maxRows:3,countryBias:"US"},beforeSend:function(){return e.neighborhoodSearchTerm().length<e.minSearchTermLength?(e.neighborhoodOptions.removeAll(),!1):void e.hideModalSpinner(!1)},success:function(o){var n=$.map(o.geonames,function(e){return e.displayName=e.name+", "+e.adminCode1+", "+e.countryName,e});e.neighborhoodOptions(n)},error:function(e,o,n){var r="Ooops, geonames server returned: textStatus= "+o+" Error= "+n;console.log(r)},complete:function(){e.hideModalSpinner(!0)}})},e.searchForNeighborhood=function(o,n){$.ajax({url:"https://maps.googleapis.com/maps/api/js",dataType:"jsonp",data:{key:"AIzaSyDPw0yXOiBKXu1E7fDxNjg6BD0ANIXiSv0"},beforeSend:function(){return void 0!==e.map?(e.hood=new google.maps.LatLng(e.neighborhoodLat(),e.neighborhoodLng()),e.map.setCenter(e.hood),e.loadRecyclingData(),!1):void e.hideModalSpinner(!1)},success:function(o){e.hood=new google.maps.LatLng(e.neighborhoodLat(),e.neighborhoodLng()),e.map=new google.maps.Map(document.getElementById("map"),{center:e.hood,zoom:10,disableDefaultUI:!0}),e.hideModalCloseBtn(!1),e.loadRecyclingData()},error:function(e,o,n){localStorage.ycGeoname=null;var r="Ooops, google maps server returned: textStatus= "+o+" Error= "+n;console.log(r),alert(r)},complete:function(){e.hideModalSpinner(!0)}})},e.loadRecyclingData=function(){var o=e.neighborhoodLat()+","+e.neighborhoodLng();$.ajax({url:"https://api.foursquare.com/v2/venues/search",data:{client_id:"XOVHNWG4KKKESGADD0HOE3SWYTXVWYAPWHSQFC4CO4FHE4R5",client_secret:"FHXKIUQOFHCJUXQYECAVH3DYE50JEJZ1N1AKONXHHEMWVLZR",v:"20130815",ll:o,query:"recycle"},beforeSend:function(){e.hideModalSpinner(!1)},success:function(o,n,r){var a=$.map(o.response.venues,function(e){return e.visible=ko.observable(!0),e});a.sort(function(e,o){return e.name.localeCompare(o.name)}),e.places(a),e.currentNeighborhood(e.neighborhoodSearchTerm()),e.placeSearchTerm(""),e.closeModalWindow(),0===a.length&&alert("No recycling facilities were found in "+e.currentNeighborhood()+".");var i={};i.lat=e.neighborhoodLat(),i.lng=e.neighborhoodLng(),i.neighborhoodSearchTerm=e.currentNeighborhood(),localStorage.ycGeoname=JSON.stringify(i)},error:function(e,o,n){localStorage.ycGeoname=null;var r="Ooops, foursquare returned: textStatus="+o+" Error= "+n;console.log(r),alert(r)},complete:function(){e.hideModalSpinner(!0)}})},e.closeModalWindow=function(){e.neighborhoodSearchTerm(""),e.neighborhoodOptions.removeAll(),$(".modalDialog").removeClass("open")},e.openModalWindow=function(){$(".modalDialog").addClass("open")},e.onNeighborhoodSelected=function(){e.selectedNeighborhood(this)},localStorage.ycGeoname){var o=JSON.parse(localStorage.ycGeoname);e.neighborhoodLat(o.lat),e.neighborhoodLng(o.lng),e.neighborhoodSearchTerm(o.neighborhoodSearchTerm),e.searchForNeighborhood(),$(".modalDialog").removeClass("open")}}ko.bindingHandlers.drawMarker={init:function(e,o,n,r,a){var i=a.$data,t=(a.$parent.map,$("#y"+i.id).html()),l=new google.maps.InfoWindow({content:t,maxWidth:225}),c=new google.maps.Marker({position:{lat:i.location.lat,lng:i.location.lng},title:i.name});l.addListener("closeclick",function(){a.$parent.clearPreviousPlaceSelection()}),c.addListener("click",function(){a.$parent.placeItemClicked(i,{currentTarget:e,clickedMarker:!0})}),$.data(e,"marker",c),$.data(e,"infoWindow",l),ko.utils.domNodeDisposal.addDisposeCallback(e,function(){c.setMap(null),c=null,l.setMap(null),l=null})},update:function(e,o,n,r,a){var i=a.$data,t=a.$parent.map,l=$.data(e,"marker");$.data(e,"infoWindow");i.visible()?l.setMap(t):(l===a.$parent.previousPlaceSelection.marker&&a.$parent.clearPreviousPlaceSelection(),l.setMap(null))}},ko.bindingHandlers.hidden={update:function(e,o,n,r,a){ko.unwrap(o())?e.style.visibility="hidden":e.style.visibility="initial"}},ko.applyBindings(new e)});