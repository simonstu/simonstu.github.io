// create the ViewModel and apply it when google maps is fully loaded
// allows showing/hiding of the location list if screen size makes this necessary
function initApp() {
    // Location object
    var Location = function(data) {
        this.title = data.title;
        this.id = data.id;
        this.highlight = ko.observable(false);
        this.selected = ko.observable(false);
        if (data.address) {
            this.address = data.address;
        } else {
            this.address = 'n.a.';
        }
        if (data.checkins) {
            this.checkins = data.checkins;
        } else {
            this.checkins = 'n.a.';
        }
    }

    var locationsArray = [];

    // ajax request  on the foursquare api to get cafes in montevideo
    $.ajax( "https://api.foursquare.com/v2/venues/search?client_id=5TFBPAPOBQ5ZXL1Y2PTN1PPIGWNQ21ZJNVFQMSVZCVLKQCM5&client_secret=S2K4KQB43WOPEVEQXY3XYII0SA2QXTX2KJH1RJYBRHIPUR2S&v=20130815&ll=-34.901113,-56.164531&query=cafe%20brasilero" )
    .done(function(data) {
        data.response.venues.forEach(function(venue, index) {
            var location = {
                title: venue.name,
                id: index,
                location: {lat: venue.location.lat, lng: venue.location.lng},
                address: venue.location.address,
                checkins: venue.stats.checkinsCount
            }
            locationsArray.push(location);
        });
        ko.applyBindings(new ViewModel());
    })
    .fail(function() {
        // query to foursquare was not successful -> use hardcoded locations
        locationsArray = hardCodedLocations;
        alert( "Foursquare has failed to load. Please refresh the page or try again later." );
    })

    var ViewModel = function() {
        var self= this;

        // fixed list with all hard coded locattions
        self.locationList = [];
        // value for the input filter field
        self.inputValue = ko.observable('');
        // selected location
        self.selectedLocation;
        // ko computed list, that is displayed dependent on the filter input field
        self.filteredLocationList = ko.computed(function() {
            return filterLocationList(self.inputValue(), self.locationList);
        });

        // fills the list with locations and creates the marker for the map
        for (var i = locationsArray.length - 1; i >= 0; i--) {
            // fill list of location for the ko list
            var location = new Location(locationsArray[i]);
            self.locationList.push(location);
            // create marker
            var position = locationsArray[i].location;
            var title = locationsArray[i].title;
            var id = locationsArray[i].id;
            var marker = createMarker(position, title, id, location);
            // adds a link to the fitting marker
            location.marker = marker;
        };
        map.fitBounds(bounds);

        // highlights the fitting marker on the map, when the mouse is over a list item
        self.hightlightMarker = function(item) {
            if (!item.selected()) item.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            populateInfoWindow(item.marker, largeInfowindow);
        }

        // removes the highlighting of a marker on the map, when the mouse of out of a list item
        self.diminishMarker = function(item) {
            if (!item.selected()) {
                item.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                largeInfowindow.marker = null
                largeInfowindow.close();
            }
        }

        // item in the list was clicked
        self.selectLocationFromList = function(item) {
            selectLocation(item);
        }

    };

    function createMarker(position, title, id, location) {
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: id,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            listElement: location
        });
        bounds.extend(marker.position);

        // show infowindow and highlight marker as well as list item if marker is clicked
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            selectLocation(this.listElement);
        });
        // highlight list item and change marker color by mouse over the marker
        marker.addListener('mouseover', function() {
            this.listElement.highlight(true);
            if (!this.listElement.selected()) this.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        });
        // resets highlight if mouse moves out from the marker
        marker.addListener('mouseout', function() {
            this.listElement.highlight(false);
            if (!this.listElement.selected()) this.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        });
        markers.push(marker);
        return marker;
    }

    // gives back an array of locations based on the input field
    function filterLocationList(filterText, list) {
        var filteredList = [];
        // no filter -> show complete list and add all markers to the map
        if (filterText === '') {
            list.forEach(function(item) {
                item.marker.setMap(map);
            });
            return list;
        }
        for (var i = 0; i<list.length; i++) {
            // add locations with the input text in the title to the list and add them to the map
            if (list[i].title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0) {
                filteredList.push(list[i]);
                list[i].marker.setMap(map);
            }
            // remove locations from the map
            else {
                list[i].marker.setMap(null);
            }
        }
        return filteredList;
    }

    // add listener to show the menu if necessary
    $('#menu-btn').click(hideMainMenu);
    $('#hideMenu-btn-Container').click(hideMainMenu);

    function hideMainMenu() {
        $menuDiv = $('#menu-container');
        if ($menuDiv.css('display') === 'none') {
            $menuDiv.css('display', 'block');
        } else {
            $menuDiv.css('display', '');
        }
        // make sure all markers are visible
        if (map) map.fitBounds(bounds);
    }
}

/* highlights the item in the list and the marker according to the location
reset a previous selected item/marker */
function selectLocation(location) {
    if (!(self.selectedLocation === location)) {
        // reset the old selected location if necessary
        if (self.selectedLocation) {
            self.selectedLocation.selected(false);
            self.selectedLocation.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
            self.selectedLocation.marker.setAnimation(null);
        }
        self.selectedLocation = location;
        selectMarker(location.marker);
        location.selected(true);
    }
}