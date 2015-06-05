// Ionic Starter App

window.URL_STONELIST = 'stonelist.json'; // 'http://cur.graniteland.com/api/stonelist.json';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module( 'graniteland', ['ionic'] );

// --- run ---------------------------------------------------------------------

app.run(
    [ '$rootScope', '$ionicPlatform', 'DownloadFromServer',
        function( $rootScope, $ionicPlatform, DownloadFromServer ){

    $ionicPlatform.ready( function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if ( window.cordova && window.cordova.plugins.Keyboard ) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if( window.StatusBar ) {
            StatusBar.styleDefault();
        }
    });

    // Check if the stone list is in localStorage. If not, then show a modal to
    // inform the user that the app is downloading data.
    console.log('app.run: tryng to find stonelist in localStorage...');
    var stonelist = window.localStorage.getItem('graniteland.stonelist');
    if (stonelist == null){
        // Load stone data from server into $rootScope.stones and store 
        // permanently in localStorage.
        console.log('app.run: not found in localStorage! attempting to load from server...');
        DownloadFromServer.getStonelist().then( function( data ) {
            console.log('app.run: received data from server! safe to localStorage and rootScope.');
            window.localStorage.setItem('graniteland.stonelist', angular.toJson(data));
            $rootScope.stonelist = data;
        } );

    } else {
        console.log('app.run: success! stonelist loaded from localStorage.');
        $rootScope.stonelist = angular.fromJson(stonelist);
    }

    // Remember IDs of stones the user likes.
    $rootScope.favlist = [];

}]);

// --- global values -----------------------------------------------------------

app.value( 'settings', { 
    'appname': 'Graniteland', 
    'appslogan': 'The Search Engine for Marble and Granite.',
});

// --- controllers -------------------------------------------------------------

app.controller( 'StonelistController',
    [ '$scope', 'Stonelist', 'settings',
        function( $scope, Stonelist, settings ){
            console.log('StonelistController: beginning to render stonelist...');
            Stonelist.filter({}).then( function( data ) {
                console.log('StonelistController: stonelist filter finished, hand data to template...');
                $scope.stonelist = data;
                $scope.favlist = angular.fromJson(window.localStorage.getItem('graniteland.favlist')||'[]');
                console.log('StonelistController: done.');
            });

            $scope.onTap = function(obj){
                console.log('THAT WAS A TAP:');
                console.log(obj);

                // TODO: Animation to move the stone thumb to a large pic on 
                // page top and show the stone name overlayed, and stone data
                // below the large stone pic.
            };
            $scope.onDoubleTap = function(obj){
                $scope.favlist.unshift(obj.item);
                window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));

                // TODO: Add some animation to indicate that the stone was 
                // added to the favlist.
            };

        }
    ]
);

// --- services ----------------------------------------------------------------

app.factory( 'DownloadFromServer', 
    [ '$q', '$http',
        function DownloadFromServerFactory( $q, $http ){
            // Downloads data from the server. This should only happen on newly
            // installed apps. Once downloaded, everything should be in locally
            // cached in localStorage.

            function getStonelist(){
                var deferred = $q.defer();
            
                $http.get( window.URL_STONELIST ).success( function( data ){
                    deferred.resolve( data );
                } ).error( function( err ){
                    deferred.reject( 'Could not load Stonelist from server.' );
                } );

                return deferred.promise;
            }

            this.getStonelist = getStonelist;
            return this;
        }
    ]
);

app.factory( 'Stonelist', 
    [ '$q', '$rootScope', 
        function StonelistFactory( $q, $rootScope ){
            // Return a list of stones that match the current search parameters.
            
            var filterArr = {}; // Remember set filter values.
            function setFilter( key, val ){ filterArr[key] = val; }
            function getFilter( key ){ return filterArr[key]; }
            function removeFilter( key ){ setFilter( key, null ); }

            function filter(){
                // Use the filterArr filter array to return only the matching
                // stones.
                var deferred = $q.defer();

                setTimeout(function(){
                    stones = $rootScope.stonelist;
                    deferred.resolve(stones);
                }, 100);

                return deferred.promise;
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