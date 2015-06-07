// Ionic Starter App

window.URL_STONELIST = 'stonelist.json'; // 'http://cur.graniteland.com/api/stonelist.json';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module( 'graniteland', ['ionic'] );

// --- run ---------------------------------------------------------------------

app.run(
    [ '$rootScope', '$ionicPlatform', '$http',
        function( $rootScope, $ionicPlatform, $http ){
    console.log('Starting up...');

    $ionicPlatform.ready( function() {
        console.log('>> $ionicPlatform is ready!');
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if ( window.cordova && window.cordova.plugins.Keyboard ) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if( window.StatusBar ) {
            StatusBar.styleDefault();
        }
    });

    // Remember IDs of stones the user likes.
    $rootScope.favlist = angular.fromJson( 
        window.localStorage.getItem( 'graniteland.favlist' ) || '[]' );
}]);

// --- global values -----------------------------------------------------------

app.value( 'settings', { 
    'appname': 'Graniteland', 
    'appslogan': 'The Search Engine for Marble and Granite.',
});

// --- controllers -------------------------------------------------------------

app.controller( 'StonelistController',
    [ '$scope', '$timeout', '$ionicModal', 'Stonelist', 'settings',
        function( $scope, $timeout, $ionicModal, Stonelist, settings ){

            $scope.stonelist = Stonelist.filter();
            $scope.favlist = angular.fromJson( window.localStorage.getItem( 'graniteland.favlist' ) || '[]' );

            console.log('>> StonelistController loaded stonelist with "' + $scope.stonelist.length + '" items.');

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
                $scope.item = null;
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
        }
    ]
);

// --- services ----------------------------------------------------------------

app.factory( 'Stonelist', 
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
);

// -----------------------------------------------------------------------------