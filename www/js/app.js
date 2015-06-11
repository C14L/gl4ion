// Ionic Starter App

var URL_STONELIST = 'stonelist.json';
var DEFAULT_COLOR = 'blue';
var DEFAULT_CLASSIFICATION = 'Granite';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module( 'graniteland', ['ionic'] );

// --- run ---------------------------------------------------------------------

app.run( 
    [ '$rootScope', '$ionicPlatform', '$http', 
    function( $rootScope, $ionicPlatform, $http ){

    $ionicPlatform.ready( function(){
        console.log('>> $ionicPlatform is ready!');
        // Hide the accessory bar by default (remove this to show the 
        // accessory bar above the keyboard for form inputs)
        if ( window.cordova && window.cordova.plugins.Keyboard ) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if( window.StatusBar ) {
            StatusBar.styleDefault();
        }
    });

    // Load stone data from JSON file.
    $rootScope.stoneallPromise = $http.get( URL_STONELIST );

    $rootScope.stoneallPromise.then( function( response ){
        $rootScope.stoneall = response.data;

        // Find all existing colors.
        $rootScope.colorlist = [];
        for ( var i=0; i<$rootScope.stoneall.length; i++ ){
            if ( ! $rootScope.stoneall[i]['color_name'] ) continue;
            var x = $rootScope.stoneall[i]['color_name'].trim();
            if ( x !== '' && $rootScope.colorlist.indexOf( x ) < 0 )
                $rootScope.colorlist.push( x );
        }

        // Find all existing classifications.
        $rootScope.classificationlist = [];
        for ( var i=0; i<$rootScope.stoneall.length; i++ ){
            if ( ! $rootScope.stoneall[i]['classification_name'] ) continue;
            var x = $rootScope.stoneall[i]['classification_name'].trim();
            if ( x !== '' && $rootScope.classificationlist.indexOf( x ) < 0 )
                $rootScope.classificationlist.push( x );
        }

        $rootScope.colorlist = $rootScope.colorlist.sort();
        $rootScope.classificationlist = $rootScope.classificationlist.sort();
    });
    
    // Restore IDs of stones the user likes.
    $rootScope.favlist = angular.fromJson( window.localStorage.getItem( 'graniteland.favlist' ) || '[]' );

    // Restore filter settings, if any.
    $rootScope.filterByColor = window.localStorage.getItem( 'graniteland.filterByColor' ) || window.DEFAULT_COLOR;
    $rootScope.filterByClassification = window.localStorage.getItem( 'graniteland.filterByClassification' ) || window.DEFAULT_CLASSIFICATION;
    $rootScope.filterByClassificationLabel = '';
}]);

// --- global values -----------------------------------------------------------

app.value( 'settings', { 
    'appname': 'Graniteland', 
    'appslogan': 'The Search Engine for Marble and Granite.',
});

// --- controllers -------------------------------------------------------------

app.controller( 'StonelistController',
    [ '$scope', '$timeout', '$ionicModal', '$ionicPopover', 'settings',
        function( $scope, $timeout, $ionicModal, $ionicPopover, settings ){

            $scope.setColorFilter = function( ){
                $scope.filterByColor = this['color'];
                window.localStorage.setItem( 'graniteland.filterByColor', $scope.filterByColor );
                $scope.filterStonelist();
                $scope.closePopover();
                $scope.setClassificationLabel(); // Update classification list.
            }
            $scope.setClassificationFilter = function( ){ 
                // We get the label here. Find the matching classification name first.
                $scope.filterByClassificationLabel = this['classification'];
                var idx = $scope.classificationLabelList.indexOf( $scope.filterByClassificationLabel );
                $scope.filterByClassification = $scope.classificationlist[idx];
                window.localStorage.setItem( 'graniteland.filterByClassification', $scope.filterByClassification );
                $scope.filterStonelist();
                $scope.closePopover();
            }
            $scope.filterStonelist = function(){
                // Runs the currently set filter over stoneall and generates
                // a new stonelist to display.
                $scope.stonelist = [];
                for ( var i=0; i<$scope.stoneall.length; i++){
                    if ( $scope.filterByColor == $scope.stoneall[i]['color_name']
                    && $scope.filterByClassification == $scope.stoneall[i]['classification_name'] ){
                        // Check if the stone is in favlist.
                        $scope.stoneall[i]['isFav'] = !($scope.getFavlistIndex( $scope.stoneall[i] ) < 0);
                        $scope.stonelist.push( $scope.stoneall[i] );
                    }
                }
            }
            $scope.setClassificationLabel = function(){
                // The classification list should include the currently selected
                // color name, e.g. "green marble" and not just "marble", as well
                // as the number of stones that fit that combination, e.g.
                // "green marble (27)" and not just "green marble".
                $scope.classificationLabelList = [];
                for ( var i=0; i<$scope.classificationlist.length; i++ ){
                    // Count the number of stones with that combination.
                    var c = 0;
                    for ( var j=0; j<$scope.stoneall.length; j++){
                        if ( $scope.filterByColor == $scope.stoneall[j]['color_name']
                        && $scope.classificationlist[i] == $scope.stoneall[j]['classification_name'] ){
                            c++;
                        }
                    }

                    // Make the label string.
                    var x = $scope.filterByColor + ' ' + $scope.classificationlist[i] + ' (' + c + ')';

                    // Append this label to the label list.
                    $scope.classificationLabelList.push( x );

                    // Set currently selected.
                    if ( $scope.filterByClassification === $scope.classificationlist[i] )
                        $scope.filterByClassificationLabel = x;
                }
            }

            // Run the filter onload.
            $scope.stoneallPromise.then( function(){
                $scope.filterStonelist();
                $scope.setClassificationLabel();
            });

            // --- favlist -----------------------------------------------------

            $scope.getFavlistIndex = function(item){
                // Returns the index number of an item in the favlist, or 
                // returns false if the item is not in the favlist.
                for ( i=0; i<$scope.favlist.length; i++ ){
                    if ( $scope.favlist[i]['id'] == item['id'] ) return i;
                }
                return (-1);
            }

            $scope.addOrRemoveItemOnFavlist = function(){
                console.log('>> addOrRemoveItemOnFavlist: ' + this.item['name']);
                console.log(this);

                if ( this.item.isFav ){
                    console.log('>>>> REMOVE ITEM...');
                    // Remove item from favlist.
                    this.item.isFav = false;
                    
                    // FIXME: When clicked te [x] button on the favlist, this
                    // does not set isFav on the same item in the stonelist, 
                    // because it refers to "this" elem on the favlist. We need
                    // to find the item on stonelist and remove it there, same
                    // as below we cycle through favlist when we remove the item
                    // from a stonelist click.

                    var i = $scope.getFavlistIndex(this.item);
                    if ( i>=0 ) $scope.favlist.splice( i, 1 );
                    window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
                } else {
                    console.log('>>>> ADD ITEM...');
                    // Add a new item to the favlist.
                    this.item.isFav = true;
                    var i = $scope.getFavlistIndex(this.item);
                    if (i >= 0) $scope.favlist.splice( i, 1 );
                    $scope.favlist.unshift(this.item);
                    window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
                }
            }

            $scope.addItemToFavlist = function(){
                console.log('>> addItemToFavlist: ' + this.item['name']);
                console.log(this);

                this.item.isFav = true;
                var i = $scope.getFavlistIndex(this.item);
                if (i >= 0) $scope.favlist.splice( i, 1 );
                $scope.favlist.unshift(this.item);
                window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
            };
            $scope.removeItemFromFavlist = function(){
                console.log('>> removeItemFromFavlist: ' + this.item['name']);
                console.log(this);

                this.item.isFav = false;
                var i = $scope.getFavlistIndex(this.item);
                if ( i>=0 ) $scope.favlist.splice( i, 1 );
                window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
            }

            // --- item modal --------------------------------------------------

            $ionicModal.fromTemplateUrl('stone-item.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
            });

            $scope.showItem = function() {
                console.log('>> showItem: ' + this.item['name']);
                console.log(this);
                $scope.item = this.item;
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
                //$scope.item = null;
            };
            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function() {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function() {
                // Execute action
            });
            
            // --- navbar popovers ---------------------------------------------

            $ionicPopover.fromTemplateUrl( 'popover-color-select.html', {
                scope: $scope
            }).then( function( popover ){
                $scope.popoverColor = popover;
            });
            $scope.openPopoverColorSelect = function($event) {
                $scope.popoverColor.show($event);
            };

            $ionicPopover.fromTemplateUrl( 'popover-classification-select.html', {
                scope: $scope
            }).then( function( popover ){
                $scope.popoverClassification = popover;
            });
            $scope.openPopoverClassificationSelect = function($event) {
                $scope.popoverClassification.show($event);
            };

            $scope.closePopover = function(){
                $scope.popoverColor.hide();
                $scope.popoverClassification.hide();
            };
            // Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function(){
                $scope.popoverColor.remove();
                $scope.popoverClassification.remove();
            });
            // Execute action on hide popover
            $scope.$on('popover.hidden', function(){ });
            // Execute action on remove popover
            $scope.$on('popover.removed', function(){ });

        }
    ]
);

// --- services ----------------------------------------------------------------

/* app.factory( 'Stonelist', 
    [ '$q', '$rootScope', 
        function StonelistFactory( $q, $rootScope ){
            // Return a list of stones that match the current search parameters.
            
            var filterArr = {}; // Remember set filter values.
            function setFilter( key, val ){ filterArr[key] = val; }
            function getFilter( key ){ return filterArr[key]; }
            function removeFilter( key ){ setFilter( key, null ); }

            function filter(){
                // TODO: Use the filterArr filter array to return only the 
                // matching stones.
                var li = graniteland.STONE_DB;

                // Attach isFav property if in the user's favlist.
                for ( var i=0; i<li.length; i++)
                    for ( var j=0; j<$rootScope.favlist.length; j++ )
                        if ( li[i]['id'] == $rootScope.favlist[j]['id'] )
                            li[i]['isFav'] = true; // Found one!

                // Return the filtered list.
                return li;
            }

            this.setFilter = setFilter;
            this.getFilter = getFilter;
            this.removeFilter = removeFilter;
            this.filter = filter;
            return this;
        }
    ]
); */

// -----------------------------------------------------------------------------