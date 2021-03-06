/*global reduk_change, reduk*/

/**
 * Typography
 * Dependencies:        google.com, jquery, select2
 * Feature added by:    Dovy Paukstys - http://simplerain.com/
 * Date:                06.14.2013
 *
 * Rewrite:             Kevin Provance (kprovance)
 * Date:                May 25, 2014
 */

(function( $ ) {
    "use strict";

    reduk.field_objects = reduk.field_objects || {};
    reduk.field_objects.typography = reduk.field_objects.typography || {};

    var selVals = [];
    var isSelecting = false;

    var default_params = {
        width: 'resolve',
        triggerChange: true,
        allowClear: true
    };

    $( document ).ready(
        function() {
            //reduk.field_objects.typography.init();
        }
    );

    reduk.field_objects.typography.init = function( selector, skipCheck ) {

        if ( !selector ) {
            selector = $( document ).find( ".reduk-group-tab:visible" ).find( '.reduk-container-typography:visible' );
        }

        $( selector ).each(
            function() {
                var el = $( this );
                var parent = el;

                if ( !el.hasClass( 'reduk-field-container' ) ) {
                    parent = el.parents( '.reduk-field-container:first' );
                }
                if ( parent.is( ":hidden" ) ) { // Skip hidden fields
                    return;
                }
                if ( parent.hasClass( 'reduk-field-init' ) ) {
                    parent.removeClass( 'reduk-field-init' );
                } else {
                    return;
                }

                var fontClear;

                el.each(
                    function() {
                        // init each typography field
                        $( this ).find( '.reduk-typography-container' ).each(
                            function() {
                                var family = $( this ).find( '.reduk-typography-family' );

                                if ( family.data( 'value' ) === undefined ) {
                                    family = $( this );
                                } else if ( family.data( 'value' ) !== "" ) {
                                    $( family ).val( family.data( 'value' ) );
                                }

                                var select2_handle = $( this ).find( '.select2_params' );
                                if ( select2_handle.size() > 0 ) {
                                    var select2_params = select2_handle.val();

                                    select2_params = JSON.parse( select2_params );
                                    default_params = $.extend( {}, default_params, select2_params );
                                }

                                fontClear = Boolean( $( this ).find( '.reduk-font-clear' ).val() );

                                reduk.field_objects.typography.select( family, true );

                                window.onbeforeunload = null;
                            }
                        );

                        //init when value is changed
                        $( this ).find( '.reduk-typography' ).on(
                            'change', function() {
                                reduk.field_objects.typography.select( $( this ) ); //.parents('.reduk-container-typography:first'));
                            }
                        );

                        //init when value is changed
                        $( this ).find( '.reduk-typography-size, .reduk-typography-height, .reduk-typography-word, .reduk-typography-letter, .reduk-typography-align, .reduk-typography-transform, .reduk-typography-font-variant, .reduk-typography-decoration' ).keyup(
                            function() {
                                reduk.field_objects.typography.select( $( this ).parents( '.reduk-container-typography:first' ) );
                            }
                        );

                        // Have to redeclare the wpColorPicker to get a callback function
                        $( this ).find( '.reduk-typography-color' ).wpColorPicker(
                            {
                                change: function( e, ui ) {
                                    $( this ).val( ui.color.toString() );
                                    reduk.field_objects.typography.select( $( this ).parents( '.reduk-container-typography:first' ) );
                                }
                            }
                        );

                        // Don't allow negative numbers for size field
                        $( this ).find( ".reduk-typography-size" ).numeric(
                            {
                                allowMinus: false
                            }
                        );

                        // Allow negative numbers for indicated fields
                        $( this ).find( ".reduk-typography-height, .reduk-typography-word, .reduk-typography-letter" ).numeric(
                            {
                                allowMinus: true
                            }
                        );

                        // select2 magic, to load font-family dynamically
                        var data = [{id: 'none', text: 'none'}];

                        $( this ).find( ".reduk-typography-family" ).select2(
                            {
                                matcher: function( term, text ) {
                                    return text.toUpperCase().indexOf( term.toUpperCase() ) === 0;
                                },

                                query: function( query ) {
                                    return window.Select2.query.local( data )( query );
                                },

                                initSelection: function( element, callback ) {
                                    var data = {id: element.val(), text: element.val()};
                                    callback( data );
                                },
                                allowClear: fontClear,
                                // when one clicks on the font-family select box
                            }
                        ).on(
                            "select2-opening", function( e ) {

                                // Get field ID
                                var thisID = $( this ).parents( '.reduk-container-typography:first' ).attr( 'data-id' );

                                // User included fonts?
                                var isUserFonts = $( '#' + thisID + ' .reduk-typography-font-family' ).data( 'user-fonts' );
                                isUserFonts = isUserFonts ? 1 : 0;

                                // Google font isn use?
                                var usingGoogleFonts = $( '#' + thisID + ' .reduk-typography-google' ).val();
                                usingGoogleFonts = usingGoogleFonts ? 1 : 0;

                                // Set up data array
                                var buildData = [];

                                // If custom fonts, push onto array
                                if ( reduk.customfonts !== undefined ) {
                                    buildData.push( reduk.customfonts );
                                }

                                // If standard fonts, push onto array
                                if ( reduk.stdfonts !== undefined && isUserFonts === 0 ) {
                                    buildData.push( reduk.stdfonts );
                                }

                                // If user fonts, pull from localize and push into array
                                if ( isUserFonts == 1 ) {
                                    var fontKids = [];

                                    // <option>
                                    for ( var key in reduk.typography[thisID] ) {
                                        var obj = reduk.typography[thisID].std_font;

                                        for ( var prop in obj ) {
                                            if ( obj.hasOwnProperty( prop ) ) {
                                                fontKids.push(
                                                    {
                                                        id: prop,
                                                        text: prop,
                                                        'data-google': 'false'
                                                    }
                                                );
                                            }
                                        }
                                    }

                                    // <optgroup>
                                    var fontData = {
                                        text: 'Standard Fonts',
                                        children: fontKids
                                    };

                                    buildData.push( fontData );
                                }

                                // If googfonts on and had data, push into array
                                if ( usingGoogleFonts == 1 || usingGoogleFonts === true && reduk.googlefonts !== undefined ) {
                                    buildData.push( reduk.googlefonts );
                                }

                                // output data to drop down
                                data = buildData;

                                // get placeholder
                                var selFamily = $( '#' + thisID + ' #' + thisID + '-family' ).attr( 'placeholder' );
                                if ( !selFamily ) {
                                    selFamily = null;
                                }

                                // select current font
                                $( '#' + thisID + " .reduk-typography-family" ).select2( 'val', selFamily );

                                // When selection is made.
                            }
                        ).on(
                            'select2-selecting', function( val, object ) {
                                var fontName = val.object.text;
                                var thisID = $( this ).parents( '.reduk-container-typography:first' ).attr( 'data-id' );

                                $( '#' + thisID + ' #' + thisID + '-family' ).data( 'value', fontName );
                                $( '#' + thisID + ' #' + thisID + '-family' ).attr( 'placeholder', fontName );

                                // option values
                                selVals = val;
                                isSelecting = true;

                                reduk.field_objects.typography.select( $( this ).parents( '.reduk-container-typography:first' ) );
                            }
                        ).on(
                            'select2-clearing', function( val, choice ) {
                                var thisID = $( this ).parents( '.reduk-container-typography:first' ).attr( 'data-id' );

                                $( '#' + thisID + ' #' + thisID + '-family' ).attr( 'data-value', '' );
                                $( '#' + thisID + ' #' + thisID + '-family' ).attr( 'placeholder', 'Font Family' );

                                $( '#' + thisID + ' #' + thisID + '-google-font' ).val( 'false' );

                                reduk.field_objects.typography.select( $( this ).parents( '.reduk-container-typography:first' ) );
                            }
                        );

                        var xx = el.find( ".reduk-typography-family" );
                        if ( !xx.hasClass( 'reduk-typography-family' ) ) {
                            el.find( ".reduk-typography-style" ).select2( default_params );
                        }

                        // Init select2 for indicated fields
                        el.find( ".reduk-typography-family-backup, .reduk-typography-align, .reduk-typography-transform, .reduk-typography-font-variant, .reduk-typography-decoration" ).select2( default_params );

                    }
                );
            }
        );
    };

    // Return font size
    reduk.field_objects.typography.size = function( obj ) {
        var size = 0,
            key;

        for ( key in obj ) {
            if ( obj.hasOwnProperty( key ) ) {
                size++;
            }
        }

        return size;
    };

    // Return proper bool value
    reduk.field_objects.typography.makeBool = function( val ) {
        if ( val == 'false' || val == '0' || val === false || val === 0 ) {
            return false;
        } else if ( val == 'true' || val == '1' || val === true || val == 1 ) {
            return true;
        }
    };

    reduk.field_objects.typography.change = function( container ) {
        var $data = {};
        jQuery( container ).find( '.reduk-typography-input' ).each(
            function() {
                if ( jQuery( this ).data( 'name' ) === undefined ) {
                    return;
                }
                $data[jQuery( this ).data( 'name' )] = jQuery( this ).val();
            }
        );
        var $input = jQuery( container ).find( '.typography-data-input:first-child' );
        $input.val( JSON.stringify( $data ) );
    };

    reduk.field_objects.typography.contrastColour = function( hexcolour ) {
        // default value is black.
        var retVal = '#444444';

        // In case - for some reason - a blank value is passed.
        // This should *not* happen.  If a function passing a value
        // is canceled, it should pass the current value instead of
        // a blank.  This is how the Windows Common Controls do it.  :P
        if ( hexcolour !== '' ) {

            // Replace the hash with a blank.
            hexcolour = hexcolour.replace( '#', '' );

            var r = parseInt( hexcolour.substr( 0, 2 ), 16 );
            var g = parseInt( hexcolour.substr( 2, 2 ), 16 );
            var b = parseInt( hexcolour.substr( 4, 2 ), 16 );
            var res = ((r * 299) + (g * 587) + (b * 114)) / 1000;

            // Instead of pure black, I opted to use WP 3.8 black, so it looks uniform.  :) - kp
            retVal = (res >= 128) ? '#444444' : '#ffffff';
        }

        return retVal;
    };


    //  Sync up font options
    reduk.field_objects.typography.select = function( selector, skipCheck ) {
        var mainID;

        // Main id for selected field
        mainID = $( selector ).parents( '.reduk-container-typography:first' ).attr( 'data-id' );
        if ( mainID === undefined ) {
            mainID = $( selector ).attr( 'data-id' );
        }

        var parent = $( selector ).parents( '.reduk-container-typography:first' );
        var data = [];
        //$.each(parent.find('.reduk-typography-field'), function() {
        //    console.log();
        //});
        //console.log( selector );
        // Set all the variables to be checked against
        var family = $( '#' + mainID + ' #' + mainID + '-family' ).val();

        if ( !family ) {
            family = null; //"inherit";
        }

        var familyBackup = $( '#' + mainID + ' select.reduk-typography-family-backup' ).val();
        var size = $( '#' + mainID + ' .reduk-typography-size' ).val();
        var height = $( '#' + mainID + ' .reduk-typography-height' ).val();
        var word = $( '#' + mainID + ' .reduk-typography-word' ).val();
        var letter = $( '#' + mainID + ' .reduk-typography-letter' ).val();
        var align = $( '#' + mainID + ' select.reduk-typography-align' ).val();
        var transform = $( '#' + mainID + ' select.reduk-typography-transform' ).val();
        var fontVariant = $( '#' + mainID + ' select.reduk-typography-font-variant' ).val();
        var decoration = $( '#' + mainID + ' select.reduk-typography-decoration' ).val();
        var style = $( '#' + mainID + ' select.reduk-typography-style' ).val();
        var script = $( '#' + mainID + ' select.reduk-typography-subsets' ).val();
        var color = $( '#' + mainID + ' .reduk-typography-color' ).val();
        var units = $( '#' + mainID ).data( 'units' );
        //console.log('here3');
        //console.log(color);

        //var output = family;

        // Is selected font a google font?
        var google;
        if ( isSelecting === true ) {
            google = reduk.field_objects.typography.makeBool( selVals.object['data-google'] );
            $( '#' + mainID + ' .reduk-typography-google-font' ).val( google );
        } else {
            google = reduk.field_objects.typography.makeBool( $( '#' + mainID + ' .reduk-typography-google-font' ).val() ); // Check if font is a google font
        }

        // Page load. Speeds things up memory wise to offload to client
        if ( !$( '#' + mainID ).hasClass( 'typography-initialized' ) ) {
            style = $( '#' + mainID + ' select.reduk-typography-style' ).data( 'value' );
            script = $( '#' + mainID + ' select.reduk-typography-subsets' ).data( 'value' );

            if ( style !== "" ) {
                style = String( style );
            }

            if ( typeof (script) !== undefined ) {
                script = String( script );
            }
        }

        // Something went wrong trying to read google fonts, so turn google off
        if ( reduk.fonts.google === undefined ) {
            google = false;
        }

        // Get font details
        var details = '';
        if ( google === true && ( family in reduk.fonts.google) ) {
            details = reduk.fonts.google[family];
        } else {
            details = {
                '400': 'Normal 400',
                '700': 'Bold 700',
                '400italic': 'Normal 400 Italic',
                '700italic': 'Bold 700 Italic'
            };
        }

        if ( $( selector ).hasClass( 'reduk-typography-subsets' ) ) {
            $( '#' + mainID + ' input.typography-subsets' ).val( script );
        }

        // If we changed the font
        if ( $( selector ).hasClass( 'reduk-typography-family' ) ) {
            var html = '<option value=""></option>';

            // Google specific stuff
            if ( google === true ) {

                // STYLES
                var selected = "";
                $.each(
                    details.variants, function( index, variant ) {
                        if ( variant.id === style || reduk.field_objects.typography.size( details.variants ) === 1 ) {
                            selected = ' selected="selected"';
                            style = variant.id;
                        } else {
                            selected = "";
                        }

                        html += '<option value="' + variant.id + '"' + selected + '>' + variant.name.replace(
                                /\+/g, " "
                            ) + '</option>';
                    }
                );

                // destroy select2
                $( '#' + mainID + ' .reduk-typography-style' ).select2( "destroy" );

                // Instert new HTML
                $( '#' + mainID + ' .reduk-typography-style' ).html( html );

                // Init select2
                $( '#' + mainID + ' .reduk-typography-style' ).select2( default_params );


                // SUBSETS
                selected = "";
                html = '<option value=""></option>';

                $.each(
                    details.subsets, function( index, subset ) {
                        if ( subset.id === script || reduk.field_objects.typography.size( details.subsets ) === 1 ) {
                            selected = ' selected="selected"';
                            script = subset.id;
                            $( '#' + mainID + ' input.typography-subsets' ).val( script );
                        } else {
                            selected = "";
                        }
                        html += '<option value="' + subset.id + '"' + selected + '>' + subset.name.replace(
                                /\+/g, " "
                            ) + '</option>';
                    }
                );

                //if (typeof (familyBackup) !== "undefined" && familyBackup !== "") {
                //    output += ', ' + familyBackup;
                //}

                // Destroy select2
                $( '#' + mainID + ' .reduk-typography-subsets' ).select2( "destroy" );

                // Inset new HTML
                $( '#' + mainID + ' .reduk-typography-subsets' ).html( html );

                // Init select2
                $( '#' + mainID + ' .reduk-typography-subsets' ).select2( default_params );

                $( '#' + mainID + ' .reduk-typography-subsets' ).parent().fadeIn( 'fast' );
                $( '#' + mainID + ' .typography-family-backup' ).fadeIn( 'fast' );
            } else {
                if ( details ) {
                    $.each(
                        details, function( index, value ) {
                            if ( index === style || index === "normal" ) {
                                selected = ' selected="selected"';
                                $( '#' + mainID + ' .typography-style .select2-chosen' ).text( value );
                            } else {
                                selected = "";
                            }

                            html += '<option value="' + index + '"' + selected + '>' + value.replace(
                                    '+', ' '
                                ) + '</option>';
                        }
                    );

                    // Destory select2
                    $( '#' + mainID + ' .reduk-typography-style' ).select2( "destroy" );

                    // Insert new HTML
                    $( '#' + mainID + ' .reduk-typography-style' ).html( html );

                    // Init select2
                    $( '#' + mainID + ' .reduk-typography-style' ).select2( default_params );

                    // Prettify things
                    $( '#' + mainID + ' .reduk-typography-subsets' ).parent().fadeOut( 'fast' );
                    $( '#' + mainID + ' .typography-family-backup' ).fadeOut( 'fast' );
                }
            }

            $( '#' + mainID + ' .reduk-typography-font-family' ).val( family );
        } else if ( $( selector ).hasClass( 'reduk-typography-family-backup' ) && familyBackup !== "" ) {
            $( '#' + mainID + ' .reduk-typography-font-family-backup' ).val( familyBackup );
        }

        // Check if the selected value exists. If not, empty it. Else, apply it.
        if ( $( '#' + mainID + " select.reduk-typography-style option[value='" + style + "']" ).length === 0 ) {
            style = "";
            $( '#' + mainID + ' select.reduk-typography-style' ).select2( 'val', '' );
        } else if ( style === "400" ) {
            $( '#' + mainID + ' select.reduk-typography-style' ).select2( 'val', style );
        }

        // Handle empty subset select
        if ( $( '#' + mainID + " select.reduk-typography-subsets option[value='" + script + "']" ).length === 0 ) {
            script = "";
            $( '#' + mainID + ' select.reduk-typography-subsets' ).select2( 'val', '' );
            $( '#' + mainID + ' input.typography-subsets' ).val( script );
        }

        var _linkclass = 'style_link_' + mainID;

        //remove other elements crested in <head>
        $( '.' + _linkclass ).remove();
        if ( family !== null && family !== "inherit" && $( '#' + mainID ).hasClass( 'typography-initialized' ) ) {

            //replace spaces with "+" sign
            var the_font = family.replace( /\s+/g, '+' );
            if ( google === true ) {

                //add reference to google font family
                var link = the_font;

                if ( style && style !== "" ) {
                    link += ':' + style.replace( /\-/g, " " );
                }

                if ( script && script !== "" ) {
                    link += '&subset=' + script;
                }

                if ( isSelecting === false ) {
                    if ( typeof (WebFont) !== "undefined" && WebFont ) {
                        WebFont.load( {google: {families: [link]}} );
                    }
                }
                $( '#' + mainID + ' .reduk-typography-google' ).val( true );
            } else {
                $( '#' + mainID + ' .reduk-typography-google' ).val( false );
            }
        }

        // Weight and italic
        if ( style.indexOf( "italic" ) !== -1 ) {
            $( '#' + mainID + ' .typography-preview' ).css( 'font-style', 'italic' );
            $( '#' + mainID + ' .typography-font-style' ).val( 'italic' );
            style = style.replace( 'italic', '' );
        } else {
            $( '#' + mainID + ' .typography-preview' ).css( 'font-style', "normal" );
            $( '#' + mainID + ' .typography-font-style' ).val( '' );
        }

        $( '#' + mainID + ' .typography-font-weight' ).val( style );

        if ( !height ) {
            height = size;
        }

        if ( size === '' || size === undefined ) {
            $( '#' + mainID + ' .typography-font-size' ).val( '' );
        } else {
            $( '#' + mainID + ' .typography-font-size' ).val( size + units );
        }

        if ( height === '' || height === undefined ) {
            $( '#' + mainID + ' .typography-line-height' ).val( '' );
        } else {
            $( '#' + mainID + ' .typography-line-height' ).val( height + units );
        }

        if ( word === '' || word === undefined ) {
            $( '#' + mainID + ' .typography-word-spacing' ).val( '' );
        } else {
            $( '#' + mainID + ' .typography-word-spacing' ).val( word + units );
        }

        if ( letter === '' || letter === undefined ) {
            $( '#' + mainID + ' .typography-letter-spacing' ).val( '' );
        } else {
            $( '#' + mainID + ' .typography-letter-spacing' ).val( letter + units );
        }

        // Show more preview stuff
        if ( $( '#' + mainID ).hasClass( 'typography-initialized' ) ) {
            //console.log('here2');
            var isPreviewSize = $( '#' + mainID + ' .typography-preview' ).data( 'preview-size' );

            if ( isPreviewSize == '0' ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'font-size', size + units );
            }

            $( '#' + mainID + ' .typography-preview' ).css( 'font-weight', style );

            //show in the preview box the font
            $( '#' + mainID + ' .typography-preview' ).css( 'font-family', family + ', sans-serif' );

            if ( family === 'none' && family === '' ) {
                //if selected is not a font remove style "font-family" at preview box
                $( '#' + mainID + ' .typography-preview' ).css( 'font-family', 'inherit' );
            }

            $( '#' + mainID + ' .typography-preview' ).css( 'line-height', height + units );
            $( '#' + mainID + ' .typography-preview' ).css( 'word-spacing', word + units );
            $( '#' + mainID + ' .typography-preview' ).css( 'letter-spacing', letter + units );

            if ( color ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'color', color );
                $( '#' + mainID + ' .typography-preview' ).css(
                    'background-color', reduk.field_objects.typography.contrastColour( color )
                );
            }

            $( '#' + mainID + ' .typography-style .select2-chosen' ).text( $( '#' + mainID + ' .reduk-typography-style option:selected' ).text() );
            $( '#' + mainID + ' .typography-script .select2-chosen' ).text( $( '#' + mainID + ' .reduk-typography-subsets option:selected' ).text() );

            if ( align ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'text-align', align );
            }

            if ( transform ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'text-transform', transform );
            }

            if ( fontVariant ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'font-variant', fontVariant );
            }

            if ( decoration ) {
                $( '#' + mainID + ' .typography-preview' ).css( 'text-decoration', decoration );
            }
            $( '#' + mainID + ' .typography-preview' ).slideDown();
        }
        // end preview stuff

        // if not preview showing, then set preview to show
        if ( !$( '#' + mainID ).hasClass( 'typography-initialized' ) ) {
            $( '#' + mainID ).addClass( 'typography-initialized' );
        }

        isSelecting = false;

        if ( !skipCheck ) {
            reduk_change( selector );
        }


    };
})( jQuery );