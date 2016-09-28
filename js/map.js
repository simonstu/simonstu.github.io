// global variables
var map;
var markers = [];
var bounds;
var largeInfowindow;

// initializes the map and adds the markers to it
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        scrollwheel: false,
        zoom: 8
    });

    bounds = new google.maps.LatLngBounds();
    largeInfowindow = new google.maps.InfoWindow();

    markers.forEach(function(marker) {
        marker.setMap(map);
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
    });
    // show all marker
    map.fitBounds(bounds);
}

// show the infowindow for the marker
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>'+ marker.title +'</div>' +
            '<div>Address: '+ marker.listElement.address +'</div>' +
            '<div> <i class="fa fa-foursquare" aria-hidden="true"></i> Check-Ins: '+ marker.listElement.checkins +'</div>');
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
}

// sets appearance if a marker is selected
function selectMarker(marker) {
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
    marker.setAnimation(google.maps.Animation.BOUNCE);
}