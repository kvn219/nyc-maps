var basemapUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
var attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

//initialize map of city_council
var map1 = L.map( 'map1', {
	scrollWheelZoom: false
} ).setView( [ 40.767802, -73.953266 ], 9 );

//CartoDB Basemap
L.tileLayer( basemapUrl, {
	attribution: attribution
} ).addTo( map1 );


$.getJSON( 'data/city_council.geojson', function ( city_council_data ) {
	L.geoJson( city_council_data ).addTo( map1 );
} )


//initialize map2
var map2 = L.map( 'map2', {
	scrollWheelZoom: false
} ).setView( [ 40.767802, -73.953266 ], 8 );

//CartoDB Basemap
L.tileLayer( basemapUrl, {
	attribution: attribution
} ).addTo( map2 );

var geojson;

//this function takes a value and returns a color based on which bucket the value falls between
function getColor( d ) {
	return d > 700000 ? '#0000cc' :
		d > 600000 ? '#BD0026' :
		d > 500000 ? '#E31A1C' :
		d > 350000 ? '#FC4E2A' :
		d > 300000 ? '#FD8D3C' :
		d > 250000 ? '#FEB24C' :
		d > 200000 ? '#FED976' :
		'#FFEDA0';
}

//this function returns a style object, but dynamically sets fillColor based on the data
function style( feature ) {
	return {
		fillColor: getColor( feature.properties.SUM_HH_pop ),
		weight: 1,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

//this function is set to run when a user mouses over any polygon
function mouseoverFunction( e ) {
	var layer = e.target;

	layer.setStyle( {
		weight: 1,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	} );

	if ( !L.Browser.ie && !L.Browser.opera ) {
		layer.bringToFront();
	}

	//update the text in the infowindow with whatever was in the data
	console.log( layer.feature.properties.SUM_HH_pop );
	$( '#infoWindow' ).text( 'Total Household Population: ' + layer.feature.properties.SUM_HH_pop );

}

function resetHighlight( e ) {
	geojson.resetStyle( e.target );
}

function onEachFeature( feature, layer ) {
	layer.on( {
		mouseover: mouseoverFunction,
		mouseout: resetHighlight
			//click: zoomToFeature
	} );
}

$.getJSON( 'data/ny_county.geojson', function ( state_data ) {
	geojson = L.geoJson( state_data, {
		style: style,
		onEachFeature: onEachFeature
	} ).addTo( map2 );
} );