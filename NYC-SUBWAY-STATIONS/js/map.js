var basemapUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
var attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
//initialize map
var nycSubwayMap = L.map( 'map', {
    scrollWheelZoom: false,
    center: [ 40.706864, -73.937817 ],
    zoom: 11,
    minZoom: 13,
} );
// CartoDB Basemap
L.tileLayer( basemapUrl, {
        attribution: attribution,
        unloadInvisibleTiles: true,
        detectRetina: true,
    } )
    .addTo( nycSubwayMap );
// use custom marker options
var customMarker = {
    radius: 4,
    fillColor: 'red',
    fillOpacity: 0.3,
    color: "red",
    weight: 1.25,
};
// add name to circles
function onEachFeature( feature, layer ) {
    if ( feature.properties && feature.properties.name ) {
        layer.bindPopup( feature.properties.name );
    }
}
// on page load, geolocate the user
function onLocationFound( e ) {
    var radius = e.accuracy / 2;
    L.marker( e.latlng, {
            icon: L.AwesomeMarkers.icon( {
                icon: 'hand-peace-o',
                prefix: 'fa',
                markerColor: 'red',
                spin: false,
                maxWidth: 500,
            } )
        } )
        .addTo( nycSubwayMap )
        .bindPopup( "You must be " + radius + " meters from this point." )
        .openPopup();
    L.circle( e.latlng, radius + 50 )
        .addTo( nycSubwayMap );
}
// throw error if geolocation cannot be loaded
function onLocationError( e ) {
    alert( e.message );
}
//load subway data
$.getJSON( 'data/ny_subway_stations.geojson', function ( data ) {
    // add popup content
    L.geoJson( data, {
            pointToLayer: function ( feature, latlng ) {
                return L.circleMarker( latlng, customMarker )
                    .bindPopup( feature.properties.name + "<br /> Subway line(s): " + feature.properties.line );
            }
        } )
        .addTo( nycSubwayMap );
} );
var geocoder = L.Control.geocoder( {
        collapsed: false,
        position: 'topright',
        text: 'Search',
        showResultIcons: true,
        class: "custom",
    } )
    .addTo( nycSubwayMap );
nycSubwayMap.locate( {
    setView: true,
    maxZoom: 14,
} );
nycSubwayMap.on( 'locationfound', onLocationFound );
nycSubwayMap.on( 'locationerror', onLocationError );