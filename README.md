# Neighborhood Map - Cafés in Montevideo
Download or clone this repository and open _index.html_ in your favorite browser or go to [https://simonstu.github.io/](https://simonstu.github.io/) to see the map in action.

# Specifications

## Interface
List of locations can be shown/hide on smaller screens

## App Functionality
Locations can be filtered by name. Markers are animated when clicked and further information (address and foursquare check-ins) are displayed in an info window

## App Architecture
Knockout is used to create the location list and for filtering it

## Asynchronous Data Usage
Google Maps and the foursquare API are loaded asynchronously. If the foursquare request fails hard-coded locations are loaded.

## Location Details Functionality
Locations are requested through the foursquare API.

## Documentation
You are reading the README :) and the js-files are commented. No build tools were used.