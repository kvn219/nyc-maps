var margin = {
	top: 10,
	right: 10,
	bottom: 10,
	left: 10
};

var poverty;

var width = window.innerWidth + margin.left - margin.right,
	height = window.innerHeight + margin.top - margin.bottom;


var svg = d3.select( "#map" )
	.append( "svg" )
	.attr( "width", width )
	.attr( "height", height );


var projection = d3.geo.conicEqualArea()
	.scale( 77423.06161113291 )
	.center( [ -73.92389357849065, 40.69483904240502 ] ) //projection center
	.parallels( [ 40.496133987610385, 40.91553277650213 ] ) //parallels for conic projection
	.rotate( [ 73.92389357849065 ] ) //rotation for conic projection
	.translate( [ -66755.26684646154, -29714.320463485623 ] ); //translate to center the map in view

//Generate paths based on projection
var path = d3.geo.path()
	.projection( projection );

queue()
	.defer( d3.json, "data/nyc_school_districts.geojson" )
	.await( ready );


function ready( error, districts ) {
	console.log( districts );
	svg.append( "g" )
		.selectAll( "path" )
		.data( districts.features )
		.enter()
		.append( "path" )
		.attr( "d", path )
		.attr( "class", "district" )
		.on( "mouseover", function ( d ) {
			d3.select( "h2" )
				.text( d.properties.district );
			d3.select( this )
				.attr( "class", "district hover" );
		} )
		.on( "mouseout", function ( d ) {
			d3.select( "h2" )
				.text( "" );
			d3.select( this )
				.attr( "class", "district" );
		} );
}

$( "svg" )
	.css( {
		top: 100,
		left: 200,
		right: 200,
		position: 'absolute'
	} );