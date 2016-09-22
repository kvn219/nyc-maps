// set up graph
var container = d3.select( '#chart' );
var legend = d3.select( '#legend' );
var vizcontrol = d3.select( '#controls' );
var viztable = vizcontrol.append( 'table' )
    .attr( 'align', 'left' );

var row1 = viztable.append( 'tr' )
    .append( 'td' )
    .attr( 'align', 'left' );
row1.append( 'input' )
    .attr( 'name', 'dataset' )
    .attr( 'id', 'coordinates' )
    .attr( 'type', 'radio' )
    .attr( 'value', 'coordinates' )
    .attr( 'checked', 'checked' );
row1.append( 'label' )
    .html( '&nbsp; Latitude and Longitude' )
    .attr( 'id', 'coordinates_label' );
document.getElementById( "coordinates" )
    .addEventListener( "change", function () {
        displayCoordinates();
        sp.update();
    } );

var row2 = viztable.append( 'tr' )
    .append( 'td' )
    .attr( 'align', 'left' );
row2.append( 'input' )
    .attr( 'name', 'dataset' )
    .attr( 'id', 'poverty' )
    .attr( 'type', 'radio' )
    .attr( 'value', 'poverty' );
row2.append( 'label' )
    .html( '&nbsp; Poverty and ELA' )
    .attr( 'id', 'poverty_label' );
document.getElementById( "poverty" )
    .addEventListener( "change", function () {
        displayPoverty();
        sp.update();
    } );

var row3 = viztable.append( 'tr' )
    .append( 'td' )
    .attr( 'align', 'left' );
row3.append( 'input' )
    .attr( 'name', 'dataset' )
    .attr( 'id', 'relational' )
    .attr( 'type', 'radio' )
    .attr( 'value', 'relational' );
row3.append( 'label' )
    .html( '&nbsp; Diversity and ELA' )
    .attr( 'id', 'relational_label' );
document.getElementById( "relational" )
    .addEventListener( "change", function () {
        displayRelational();
        sp.update();
    } );

var row4 = viztable.append( 'tr' )
    .append( 'td' )
    .attr( 'align', 'left' );
row4.append( 'input' )
    .attr( 'name', 'dataset' )
    .attr( 'id', 'disabilities' )
    .attr( 'type', 'radio' )
    .attr( 'value', 'disabilities' );
row4.append( 'label' )
    .html( '&nbsp; Disabilities and ELA' )
    .attr( 'id', 'disabilities_label' );
document.getElementById( "disabilities" )
    .addEventListener( "change", function () {
        displayDisabilities();
        sp.update();
    } );

var row5 = viztable.append( 'tr' )
    .append( 'td' )
    .attr( 'align', 'left' );
row5.append( 'input' )
    .attr( 'name', 'dataset' )
    .attr( 'id', 'Limited English Proficiency' )
    .attr( 'type', 'radio' )
    .attr( 'value', 'Limited English Proficiency' );
row5.append( 'label' )
    .html( '&nbsp; English Proficiency and ELA' )
    .attr( 'id', 'Limited English Proficiency_label' );
document.getElementById( "Limited English Proficiency" )
    .addEventListener( "change", function () {
        displayenglishProficiency();
        sp.update();
    } );

viztable.append( 'input' )
    .attr( 'autocomplete', 'on' )
    .attr( 'name', 'highlight' )
    .attr( 'class', 'valid' )
    .attr( 'type', 'text' )
    .attr( 'value', '' )
    .attr( 'id', 'highlight' )
    .attr( 'placeholder', 'School Name' )
    .attr( 'tabindex', '3' )
    .attr( 'spellcheck', 'false' )
    .attr( 'autofocus' );

highlight.addEventListener( "keyup", function ( event ) {
    if ( !highlight.value ) sp.highlight( undefined );
    if ( event.keyCode == 13 ) {
        sp.highlight( highlight.value );

    }

} );

function init() {
    sp.options( {
        id: 'first',

        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'longitude',
            y: 'latitude'
        },

        axes: {
            x: {
                label: 'Longitude'
            },
            y: {
                label: 'Latitude'
            }
        },

        datapoints: {
            radius: {
                default: [ 2, 4 ],
                mobile: [ 1, 1 ]
            }
        },

        legend: {
            dom_element: legend,
            title: 'Blau Levels of Diversity (Reset)',
            text: '<strong>Hover</strong> over the legend to a highlight group.<br><strong>Click</strong> legend to subset a group.<br><strong>Click</strong> the legend title to reset.',
        },

        display: {
            reset: '#legend',
            zoom: true,
            bubble_legend: false,
            highlight: {
                radius: 12,
                fill: undefined,
            }
        }
    } );

    sp.events( {
        'element': {
            'click': highlightSchool
        }
    } );

    sp.colors( {
        "School Blau = Low, Census Tract Blau = Low": "#8B4F23",
        "School Blau = Low, Census Tract Blau = High": "#B94E66",
        "School Blau = High, Census Tract Blau = Low": "#94BA3C",
        "School Blau = High, Census Tract Blau = High": "#635484",
    } );

    sp.duration( 1000 );
}

function displayCoordinates() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'DIVERSITY_INDEX',
            x: 'longitude',
            y: 'latitude'
        },
        axes: {
            x: {
                label: 'Longitude'
            },
            y: {
                label: 'Latitude'
            }
        }
    } );
}

function displayPoverty() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'ECDIS',
            y: 'ELA'
        },

        axes: {
            x: {
                label: '% of Economically Disadvantaged Students Living Poverty'
            },
            y: {
                label: 'ELA Proficiency Rates'
            }
        }
    } );
}

function displayRelational() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'DIVERSITY_INDEX',
            y: 'ELA'
        },

        axes: {
            x: {
                label: 'Relational Diversity Index (RDI)'
            },
            y: {
                label: 'ELA Proficiency Rates'
            }
        }
    } );
}


function displayNonWhite() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'SWD',
            y: 'ELA'
        },

        axes: {
            x: {
                label: '% non-white census tract'
            },
            y: {
                label: 'ELA Proficiency Rates'
            }
        }
    } );
}

function displayDisabilities() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'SWD',
            y: 'ELA'
        },

        axes: {
            x: {
                label: '% of Students with Disabilities'
            },
            y: {
                label: 'ELA Proficiency Rates'
            }
        }
    } );
}

function displayenglishProficiency() {
    sp.options( {
        data: {
            identifier: 'NAME',
            abbreviation: 'LABEL',
            group: 'LABEL',
            sub_group: 'DISTRICT_CD',
            r_scale: 'NUM_ENROLL',
            x: 'LEP',
            y: 'ELA'
        },

        axes: {
            x: {
                label: '% of Students with Limited English Proficiency'
            },
            y: {
                label: 'ELA Proficiency Rates'
            }
        }
    } );
}

sp = scatterPlot();
init();

// To load the file successfully, you have to change the end dl=0 to dl=1 and replace www.dropbox.com with dl.dropboxusercontent.com
var url = "https://dl.dropboxusercontent.com/s/bn7pw52eipl18xe/data.json?dl=1";

d3.json( url, function ( err, data ) {
    console.log( data );

    sp.data( data );
    container.call( sp );
    sp.update();
} );

function highlightSchool( d, i, element ) {
    var group = [];
    d3.selectAll( 'circle' )

    .each( function () {
        var set = d3.select( this );
        if ( set.attr( 'sub_group' ) == d.DISTRICT_CD ) {
            set.attr( 'r', 5 );
            set.style( 'opacity', 1.0 );
            set.style( "stroke", "black" );
            set.style( "stroke-width", 1.0 );
            group.push( [ set.attr( 'cx' ), set.attr( 'cy' ) ] );
        } else {
            set.attr( 'r', 5 );
            set.style( 'opacity', 0.1 );
            set.style( "stroke", undefined );
            set.style( "stroke-width", undefined );
        }
    } );
}
