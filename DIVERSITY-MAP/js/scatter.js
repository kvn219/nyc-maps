var formatPercent = d3.format( "2%" );

function scatterPlot() {

    // options which should be accessible via ACCESSORS
    var data_set = []
    var _data_set = [];

    var chosen_group;
    var highlight;
    var animate;

    var options = {

        id: '',
        class: 'scatterplot',

        data: {
            identifier: 'identifier',
            abbreviation: 'abbr',
            group: 'group',
            sub_group: 'group',
            r_scale: 'r_scale',
            x: 'x',
            y: 'y'
        },

        resize: true,

        width: window.innerWidth,
        height: window.innerHeight,

        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 30
        },

        legend: {
            dom_element: undefined,
            title: '',
            text: '',
            margins: {
                top: 10,
                right: 5,
                bottom: 10,
                left: 5
            },
            width: 300,
            height: 100,
            rectSize: 15, //dimensions of the colored square
            rowHeight: 20, //height of a row in the legend
            maxWidth: 144, //widht of each row

            bubble: {
                title: '',
                prefix: '',
                suffix: '',
                sizes: [ 0, 0, 0 ]
            }
        },

        axes: {
            x: {
                label: '',
                ticks: 10,
                scale: 'linear',
                nice: true,
                tickFormat: undefined,
                domain: undefined
            },
            y: {
                label: '',
                ticks: 10,
                scale: 'linear',
                nice: true,
                tickFormat: undefined,
                domain: undefined
            }
        },

        datapoints: {
            radius: {
                default: [ 2, 16 ],
                mobile: [ 1, 10 ]
            }
        },

        display: {
            reset: 'body', // element id for reset click
            zoom: false,
            voroni: false,
            legend: true,
            bubble_legend: true,
            highlight: {
                radius: undefined,
                fill: undefined
            }
        },

        opacityCircles: 0.5,
        mobileScreenMax: 500

    };

    var mobileScreen = ( $( window )
        .innerWidth() < options.mobileScreenMax ? true : false );

    var colors = {};
    var dom_parent;

    // functions which should be accessible via ACCESSORS
    var update;

    // programmatic
    var transition_time = 0;

    // DEFINABLE EVENTS
    // Define with ACCESSOR function chart.events()
    var events = {
        'element': {
            'click': null,
            'mouseover': null,
            'mouseout': null
        },
        'update': {
            'begin': null,
            'end': null
        },
        'voroni': {
            'mouseover': showTooltip,
            'mouseout': removeTooltip
        }
    };

    var color = d3.scale.category20();

    function chart( selection ) {
        selection.each( function () {

            dom_parent = d3.select( this );
            // must be something better than this!
            if ( dom_parent.attr( 'id' ) ) {
                options.width = Math.min( $( '#' + dom_parent.attr( 'id' ) )
                    .width(), 1000 ) - options.margins.left - options.margins.right;
                options.height = options.width * 2 / 3;
            }

            // append svg
            var root = dom_parent.append( 'svg' )
                .attr( 'class', 'svg-class' )
                .attr( 'width', ( options.width + options.margins.left + options.margins.right ) )
                .attr( 'height', ( options.height + options.margins.top + options.margins.bottom ) );

            // append children g
            var chartWrapper = root.append( "g" )
                .attr( "class", "chartWrapper" )
                .attr( 'id', 'chartWrapper' + options.id )
                .attr( "transform", "translate(" + options.margins.left + "," + options.margins.top + ")" );
            var circleGroup = chartWrapper.append( "g" )
                .attr( "class", "circleWrapper" );
            var voronoiGroup = chartWrapper.append( "g" )
                .attr( "class", "voronoiWrapper" );

            if ( options.display.legend && options.legend.dom_element ) {
                var legendTitle = options.legend.dom_element.append( 'div' )
                    .attr( 'class', 'legendTitle' );
                var legendText = options.legend.dom_element.append( 'div' )
                    .attr( 'class', 'legendText' );
                var svgLegend = options.legend.dom_element.append( "svg" )
                    .attr( "width", ( options.legend.width + options.legend.margins.left + options.legend.margins.right ) )
                    .attr( "height", ( options.legend.height + options.legend.margins.top + options.legend.margins.bottom ) );
                var legendWrapper = svgLegend.append( "g" )
                    .attr( "class", "legendWrapper" )
                    .attr( "transform", "translate(" + options.legend.margins.left + "," + options.legend.margins.top + ")" );
            }


            mobileScreen = ( $( window )
                .innerWidth() < options.mobileScreenMax ? true : false );
            d3.select( options.display.reset )
                .on( "click", resetClick );

            update = function ( resize ) {
                // boolean resize used to disable transitions during resize operation
                if ( options.axes.x.scale == 'log' ) {
                    var xScale = d3.scale.log()
                        .range( [ 0, options.width ] );
                } else {
                    var xScale = d3.scale.linear()
                        .range( [ 0, options.width ] );
                }
                if ( options.axes.x.domain ) {
                    xScale.domain( options.axes.x.domain );
                } else {
                    xScale.domain( d3.extent( _data_set, function ( d ) {
                        return +d[ options.data.x ];
                    } ) );
                }
                if ( options.axes.x.nice ) {
                    xScale.nice();
                }

                var xAxis = d3.svg.axis()
                    .orient( "bottom" )
                    .ticks( options.axes.x.ticks )
                    .scale( xScale );

                if ( options.axes.x.tickFormat ) {
                    xAxis
                        .tickFormat( function ( d ) {
                            return xScale.tickFormat( ( mobileScreen ? 4 : 8 ), function ( d ) {
                                var prefix = d3.formatPrefix( d );
                                return options.axes.x.tickFormat + prefix.scale( d ) + prefix.symbol;
                                return d;
                            } )( d );
                        } );
                }

                if ( options.axes.y.scale == 'log' ) {
                    var yScale = d3.scale.log()
                        .range( [ options.height, 0 ] );
                } else {
                    var yScale = d3.scale.linear()
                        .range( [ options.height, 0 ] );
                }
                if ( options.axes.y.domain ) {
                    yScale.domain( options.axes.y.domain );
                } else {
                    yScale.domain( d3.extent( _data_set, function ( d ) {
                        return +d[ options.data.y ];
                    } ) );
                }
                if ( options.axes.y.nice ) {
                    yScale.nice();
                }

                var yAxis = d3.svg.axis()
                    .orient( "left" )
                    .ticks( options.axes.y.ticks )
                    .scale( yScale );

                var rScale = d3.scale.sqrt()
                    .range( [ mobileScreen ? options.datapoints.radius.mobile[ 0 ] : options.datapoints.radius.default[ 0 ],
                            mobileScreen ? options.datapoints.radius.mobile[ 1 ] : options.datapoints.radius.default[ 1 ] ] )
                    .domain( d3.extent( _data_set, function ( d ) {
                        return +d[ options.data.r_scale ];
                    } ) );

                var update_xAxis = chartWrapper.selectAll( '.xAxis' )
                    .data( [ 0 ] ); // data not important

                update_xAxis.enter()
                    .append( "g" )
                    .attr( "class", "xAxis" );

                update_xAxis.exit()
                    .remove();

                update_xAxis
                    .attr( "transform", "translate(" + 0 + "," + options.height + ")" )
                    .call( xAxis );

                var update_yAxis = chartWrapper.selectAll( '.yAxis' )
                    .data( [ 0 ] ); // data not important

                update_yAxis.enter()
                    .append( "g" )
                    .attr( "class", "yAxis" );

                update_yAxis.exit()
                    .remove();

                update_yAxis
                    .attr( "transform", "translate(" + 0 + "," + 0 + ")" )
                    .call( yAxis );

                var update_circleGroups = circleGroup.selectAll( ".data_rows" + options.id )
                    .data( _data_set );

                /***** Scatterplot Circles *****/
                update_circleGroups.enter()
                    .append( "circle" )
                    .attr( "r", function () {
                        if ( animate ) return 10;
                    } )
                    .attr( "sub_group", function ( d ) {
                        return d[ options.data.sub_group ];
                    } );

                update_circleGroups.exit()
                    .attr( "r", function () {
                        if ( animate ) return 10;
                    } )
                    .transition()
                    .duration( animate ? transition_time : 0 )
                    .attr( "r", 0 )
                    .remove();

                update_circleGroups
                    .attr( "class", function ( d, i ) {
                        return "data_rows" + options.id + " A" + i;
                    } )
                    .style( "opacity", options.opacityCircles )
                    .style( "fill", function ( d ) {
                        return colors[ d[ options.data.group ] ];
                    } )
                    .transition()
                    .duration( transition_time )
                    .attr( "cx", function ( d ) {
                        return xScale( d[ options.data.x ] );
                    } )
                    .attr( "cy", function ( d ) {
                        return yScale( d[ options.data.y ] );
                    } )
                    .attr( "r", function ( d ) {
                        if ( highlight &&
                            d[ options.data.identifier ].toLowerCase()
                            .indexOf( highlight.toLowerCase() ) >= 0 &&
                            options.display.highlight.radius ) {
                            return options.display.highlight.radius;
                        } else {
                            return rScale( d[ options.data.r_scale ] );
                        }
                    } );

                /***** voroni Hover Areas *****/
                var voronoi = d3.geom.voronoi()
                    .x( function ( d ) {
                        return xScale( d[ options.data.x ] );
                    } )
                    .y( function ( d ) {
                        return yScale( d[ options.data.y ] );
                    } )
                    .clipExtent( [ [ 0, 0 ], [ options.width, options.height ] ] );

                voronoiGroup.selectAll( ".voroni" + options.id )
                    .remove();

                voronoiGroup.selectAll( ".voroni" + options.id )
                    .data( voronoi( _data_set ) )
                    .enter()
                    .append( "path" )
                    .attr( "id", function ( d, i ) {
                        return "voroni" + options.id + i;
                    } )
                    .attr( 'gen', function ( d, i ) {
                        return genPath( d, i );
                    } );

                function genPath( d, i ) {
                    if ( !d ) return;
                    d3.select( '#voroni' + options.id + i )
                        .datum( d )
                        .style( "stroke", function ( f ) {
                            return options.display.voroni ? "#2074A0" : undefined;
                        } )
                        .attr( "class", function ( d ) {
                            return "voroni" + options.id + " A" + i;
                        } )
                        .style( "fill", "none" )
                        .style( "pointer-events", "all" )
                        .on( 'mouseover', function ( d ) {
                            if ( !chosen_group || d.point[ options.data.group ] == chosen_group ) {
                                if ( events.voroni.mouseover ) {
                                    var target = d3.select( ".A" + i );
                                    events.voroni.mouseover( d.point, i, target );
                                }
                                showCrossHairs( d.point, i );
                            }
                        } )
                        .on( 'mouseout', function ( d ) {
                            hideCrossHairs( d.point, i );
                            if ( events.voroni.mouseout ) {
                                var target = d3.select( ".A" + i );
                                events.voroni.mouseout( d.point, i, target );
                            }
                        } )
                        .on( 'click', function ( d, i ) {
                            if ( events.element.click ) {
                                events.element.click( d.point, i, this );
                            }
                        } )
                        .attr( "d", function ( d, i ) {
                            return "M" + d.join( "L" ) + "Z";
                        } );

                    return;
                }

                /****** update labels *******/
                chartWrapper.selectAll( '.label' + options.id )
                    .remove();

                //Set up X axis label
                chartWrapper.append( "g" )
                    .append( "text" )
                    .attr( "class", "title " + 'label' + options.id )
                    .attr( "text-anchor", "end" )
                    .style( "font-size", ( mobileScreen ? 8 : 12 ) + "px" )
                    .attr( "transform", "translate(" + options.width + "," + ( options.height - 10 ) + ")" )
                    .text( options.axes.x.label );

                //Set up y axis label
                chartWrapper.append( "g" )
                    .append( "text" )
                    .attr( "class", "title " + 'label' + options.id )
                    .attr( "text-anchor", "end" )
                    .style( "font-size", ( mobileScreen ? 8 : 12 ) + "px" )
                    .attr( "transform", "translate(18, 0) rotate(-90)" )
                    .text( options.axes.y.label );

                if ( !mobileScreen && options.display.legend && options.legend.dom_element ) {
                    legendTitle
                        .attr( 'class', 'legendTitle' )
                        .style( 'font-size', '1.5em' )
                        .text( options.legend.title );

                    legendText
                        .attr( 'class', 'legendText' )
                        .style( 'font-size', '1.0em' )
                        .style( 'color', '#777' )
                        .html( options.legend.text );

                    legendWrapper.selectAll( '.legendSquare' )
                        .remove();

                    var legend = legendWrapper.selectAll( '.legendSquare' )
                        .data( Object.keys( colors )
                            .map( function ( key ) {
                                return colors[ key ];
                            } ) );

                    legend.enter()
                        .append( 'g' )
                        .attr( 'class', 'legendSquare' )
                        .attr( "transform", function ( d, i ) {
                            return "translate(" + 0 + "," + ( i * options.legend.rowHeight ) + ")";
                        } )
                        .style( "cursor", "pointer" )
                        .on( "mouseover", selectLegend( 0.02 ) )
                        .on( "mouseout", selectLegend( options.opacityCircles ) )
                        .on( "click", clickLegend );

                    legend.append( 'rect' )
                        .attr( 'width', options.legend.maxWidth )
                        .attr( 'height', options.legend.rowHeight )
                        .style( 'fill', "white" );
                    legend.append( 'rect' )
                        .attr( 'width', options.legend.rectSize )
                        .attr( 'height', options.legend.rectSize )
                        .style( 'fill', function ( d ) {
                            return d;
                        } );
                    legend.append( 'text' )
                        .attr( 'transform', 'translate(' + 22 + ',' + ( options.legend.rectSize / 2 ) + ')' )
                        .attr( "class", "legendText" )
                        .style( "font-size", "10px" )
                        .attr( "dy", ".35em" )
                        .text( function ( d, i ) {
                            return Object.keys( colors )[ i ];
                        } );

                    legendWrapper.selectAll( '.bubbleLegend' )
                        .remove();

                    bubbleSizeLegend = legendWrapper.append( "g" )
                        .attr( 'class', 'bubbleLegend' )
                        .attr( "transform", "translate(" + ( options.legend.width / 2 - 30 ) + "," + ( Object.keys( colors )
                            .length * options.legend.rowHeight + 20 ) + ")" );

                    if ( options.display.bubble_legend ) {
                        bubbleLegend( bubbleSizeLegend, rScale );
                    }
                } else {
                    // mobile device
                    if ( options.legend.dom_element ) {
                        options.legend.dom_element.style( "display", "none" );
                    }
                }

            }; // end update()

            function showCrossHairs( d, i ) {
                var element = d3.select( ".A" + i );
                if ( !element.length ) return;

                element.style( "opacity", 1 );

                chartWrapper.append( "g" )
                    .attr( "class", "guide" )
                    .append( "line" )
                    .attr( "x1", element.attr( "cx" ) )
                    .attr( "x2", element.attr( "cx" ) )
                    .attr( "y1", +element.attr( "cy" ) )
                    .attr( "y2", ( options.height ) )
                    .style( "stroke", element.style( "fill" ) )
                    .style( "opacity", 0 )
                    .style( "pointer-events", "none" )
                    .transition()
                    .duration( 200 )
                    .style( "opacity", 0.5 );

                chartWrapper.append( "g" )
                    .attr( "class", "guide" )
                    .append( "line" )
                    .attr( "x1", +element.attr( "cx" ) )
                    .attr( "x2", 0 )
                    .attr( "y1", element.attr( "cy" ) )
                    .attr( "y2", element.attr( "cy" ) )
                    .style( "stroke", element.style( "fill" ) )
                    .style( "opacity", 0 )
                    .style( "pointer-events", "none" )
                    .transition()
                    .duration( 200 )
                    .style( "opacity", 0.5 );
            }

            function hideCrossHairs( d, i ) {
                if ( d && i ) {
                    var element = d3.select( ".data_rows" + options.id + ".A" + i );
                    if ( !element.length ) return;
                    element.style( "opacity", options.opacityCircles );
                }

                chartWrapper.selectAll( ".guide" )
                    .transition()
                    .duration( 200 )
                    .style( "opacity", 0 )
                    .remove();
            }

            function selectLegend( opacity ) {
                return function ( d, i ) {
                    var chosen = Object.keys( colors )[ i ];

                    chartWrapper.selectAll( ".data_rows" + options.id )
                        .filter( function ( d ) {
                            return d[ options.data.group ] != chosen;
                        } )
                        .transition()
                        .style( "opacity", opacity );
                };
            }

            function clickLegend( d, i ) {
                event.stopPropagation();

                // wait until other transitions have completed
                setTimeout( function () {
                    click();
                }, transition_time / 2 );


                function click() {
                    //Chosen legend item
                    chosen_group = Object.keys( colors )[ i ];

                    //Only show the circles of the chosen sector
                    if ( options.display.zoom ) {
                        _data_set = [];
                        data_set.forEach( function ( r ) {
                            if ( r[ options.data.group ] == chosen_group ) _data_set.push( r );
                        } );
                        update();
                    } else {
                        chartWrapper.selectAll( ".data_rows" + options.id )
                            .style( "opacity", options.opacityCircles )
                            .style( "visibility", function ( d ) {
                                if ( d[ options.data.group ] != chosen_group ) return "hidden";
                                else return "visible";
                            } );
                    }

                    //deactivate the mouse over and mouse out events
                    d3.selectAll( ".legendSquare" )
                        .on( "mouseover", null )
                        .on( "mouseout", null );
                }
            }

            function resetClick() {
                chosen_group = undefined;
                hideCrossHairs();
                if ( events.voroni.mouseout ) {
                    events.voroni.mouseout();
                }

                d3.selectAll( ".legendSquare" )
                    .on( "mouseover", selectLegend( 0.02 ) )
                    .on( "mouseout", selectLegend( options.opacityCircles ) );

                if ( options.display.zoom ) {
                    _data_set = JSON.parse( JSON.stringify( data_set ) );
                    update();
                } else {
                    chartWrapper.selectAll( ".data_rows" + options.id )
                        .style( "opacity", options.opacityCircles )
                        .style( "visibility", "visible" );
                }
            }

            function bubbleLegend( wrapperVar, scale ) {

                var legendSize1 = options.legend.bubble.sizes[ 0 ],
                    legendSize2 = options.legend.bubble.sizes[ 1 ],
                    legendSize3 = options.legend.bubble.sizes[ 2 ],
                    legendCenter = 0,
                    legendBottom = 50,
                    legendLineLength = 25,
                    textPadding = 5,
                    numFormat = d3.format( "," );

                wrapperVar.append( "text" )
                    .attr( "class", "legendTitle" )
                    .attr( "transform", "translate(" + legendCenter + "," + 0 + ")" )
                    .attr( "x", 0 + "px" )
                    .attr( "y", 0 + "px" )
                    .attr( "dy", "1em" )
                    .text( options.legend.bubble.title );

                wrapperVar.append( "circle" )
                    .attr( 'r', scale( legendSize1 ) )
                    .attr( 'class', "legendCircle" )
                    .attr( 'cx', legendCenter )
                    .attr( 'cy', ( legendBottom - scale( legendSize1 ) ) );
                wrapperVar.append( "circle" )
                    .attr( 'r', scale( legendSize2 ) )
                    .attr( 'class', "legendCircle" )
                    .attr( 'cx', legendCenter )
                    .attr( 'cy', ( legendBottom - scale( legendSize2 ) ) );
                wrapperVar.append( "circle" )
                    .attr( 'r', scale( legendSize3 ) )
                    .attr( 'class', "legendCircle" )
                    .attr( 'cx', legendCenter )
                    .attr( 'cy', ( legendBottom - scale( legendSize3 ) ) );

                wrapperVar.append( "line" )
                    .attr( 'class', "legendLine" )
                    .attr( 'x1', legendCenter )
                    .attr( 'y1', ( legendBottom - 2 * scale( legendSize1 ) ) )
                    .attr( 'x2', ( legendCenter + legendLineLength ) )
                    .attr( 'y2', ( legendBottom - 2 * scale( legendSize1 ) ) );
                wrapperVar.append( "line" )
                    .attr( 'class', "legendLine" )
                    .attr( 'x1', legendCenter )
                    .attr( 'y1', ( legendBottom - 2 * scale( legendSize2 ) ) )
                    .attr( 'x2', ( legendCenter + legendLineLength ) )
                    .attr( 'y2', ( legendBottom - 2 * scale( legendSize2 ) ) );
                wrapperVar.append( "line" )
                    .attr( 'class', "legendLine" )
                    .attr( 'x1', legendCenter )
                    .attr( 'y1', ( legendBottom - 2 * scale( legendSize3 ) ) )
                    .attr( 'x2', ( legendCenter + legendLineLength ) )
                    .attr( 'y2', ( legendBottom - 2 * scale( legendSize3 ) ) );

                wrapperVar.append( "text" )
                    .attr( 'class', "legendText" )
                    .attr( 'x', ( legendCenter + legendLineLength + textPadding ) )
                    .attr( 'y', ( legendBottom - 2 * scale( legendSize1 ) ) )
                    .attr( 'dy', '0.25em' )
                    .text( options.legend.bubble.prefix + numFormat( Math.round( legendSize1 / 1e9 ) ) + options.legend.bubble.suffix );
                wrapperVar.append( "text" )
                    .attr( 'class', "legendText" )
                    .attr( 'x', ( legendCenter + legendLineLength + textPadding ) )
                    .attr( 'y', ( legendBottom - 2 * scale( legendSize2 ) ) )
                    .attr( 'dy', '0.25em' )
                    .text( options.legend.bubble.prefix + numFormat( Math.round( legendSize2 / 1e9 ) ) + options.legend.bubble.suffix );
                wrapperVar.append( "text" )
                    .attr( 'class', "legendText" )
                    .attr( 'x', ( legendCenter + legendLineLength + textPadding ) )
                    .attr( 'y', ( legendBottom - 2 * scale( legendSize3 ) ) )
                    .attr( 'dy', '0.25em' )
                    .text( options.legend.bubble.prefix + numFormat( Math.round( legendSize3 / 1e9 ) ) + options.legend.bubble.suffix );

            } //bubbleLegend

        } );
    }

    // ACCESSORS

    // chart.options() allows updating individual options and suboptions
    // while preserving state of other options
    chart.options = function ( values ) {
        if ( !arguments.length ) return options;
        keyWalk( values, options );
        return chart;
    };

    function keyWalk( valuesObject, optionsObject ) {
        if ( !valuesObject || !optionsObject ) return;
        var vKeys = Object.keys( valuesObject );
        var oKeys = Object.keys( optionsObject );
        for ( var k = 0; k < vKeys.length; k++ ) {
            if ( oKeys.indexOf( vKeys[ k ] ) >= 0 ) {
                var oo = optionsObject[ vKeys[ k ] ];
                var vo = valuesObject[ vKeys[ k ] ];
                if ( typeof oo == 'object' && typeof vo !== 'function' ) {
                    keyWalk( valuesObject[ vKeys[ k ] ], optionsObject[ vKeys[ k ] ] );
                } else {
                    optionsObject[ vKeys[ k ] ] = valuesObject[ vKeys[ k ] ];
                }
            }
        }
    }

    chart.events = function ( functions ) {
        if ( !arguments.length ) return events;
        keyWalk( functions, events );
        return chart;
    };

    chart.colors = function ( color3s ) {
        if ( !arguments.length ) return colors;
        colors = color3s;
        return chart;
    };

    chart.width = function ( value ) {
        if ( !arguments.length ) return options.width;
        options.width = value;
        return chart;
    };

    chart.height = function ( value ) {
        if ( !arguments.length ) return options.height;
        options.height = value;
        return chart;
    };

    chart.data = function ( value ) {
        if ( !arguments.length ) return data_set;
        data_set = JSON.parse( JSON.stringify( value ) );
        data_set.sort( function ( a, b ) {
            return b[ options.data.r_scale ] > a[ options.data.r_scale ];
        } );
        _data_set = JSON.parse( JSON.stringify( data_set ) );
        highlight = undefined;
        return chart;
    };

    chart.push = function ( value ) {
        var _value = JSON.parse( JSON.stringify( value ) );
        if ( !arguments.length ) return false;
        if ( _value.constructor === Array ) {
            for ( var i = 0; i < _value.length; i++ ) {
                data_set.push( _value[ i ] );
                _data_set.push( _value[ i ] );
            }
        } else {
            data_set.push( _value );
            _data_set.push( _value );
        }
        update();
        return true;
    };

    chart.pop = function () {
        if ( !data_set.length ) return;
        var count = data_set.length;
        _data_set.pop();
        update();
        return data_set.pop();
    };

    chart.highlight = function ( highlight_string ) {
        if ( !highlight_string ) {
            highlight = undefined;
            update();
            return;
        }
        highlight = highlight_string;
        update();
    };

    chart.update = function ( resize ) {
        if ( events.update.begin ) events.update.begin();
        if ( typeof update === 'function' ) update( resize );
        setTimeout( function () {
            if ( events.update.end ) events.update.end();
        }, transition_time );
    };

    chart.duration = function ( value ) {
        if ( !arguments.length ) return transition_time;
        transition_time = value;
        return chart;
    };
    // END ACCESSORS

    // default Tooltip -- requires bootstrap
    function removeTooltip( d, i, element ) {
        if ( !$( element )
            .popover ) return;
        $( '.popover' )
            .each( function () {
                $( this )
                    .remove();
            } );
    }

    function showTooltip( d, i, element ) {
        if ( !$( element )
            .popover ) return;
        $( element )
            .popover( {
                placement: 'auto top',
                container: '#' + dom_parent.attr( 'id' ),
                trigger: 'manual',
                html: true,
                content: function () {
                    return "<span style='font-size: 11px; text-align: center;'>" + "School Information:<br>" + d[ options.data.identifier ] + "<br>County: " + d.COUNTY_NAME + "<br>District CD: " + d.DISTRICT_CD + "<br>Number enrolled: " + d.NUM_ENROLL + "<br>School Blau Index: " + d.SCHOOL_INDEX + "<br>Teacher Turnover Rate: " + formatPercent( d.TEACH_TURNOVER ) + "<br>Black: " + formatPercent( d.BLACK ) + "<br>Hispanic: " + formatPercent( d.HISP ) + "<br>Asian: " + formatPercent( d.ASIAN ) + "<br>White: " + formatPercent( d.WHITE ) + "</span>";
                }
            } );
        $( element )
            .popover( 'show' );
    }

    return chart;
}
