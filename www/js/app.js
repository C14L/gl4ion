// Ionic Starter App

var DEBUG = true;
var URL_STONELIST = 'stonelist.json';
var DEFAULT_COLOR = 'blue';
var DEFAULT_CLASSIFICATION = 'Granite';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module( 'graniteland', ['ionic'] );

// --- config ------------------------------------------------------------------

app.config( function( $stateProvider, $urlRouterProvider ){
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'menu.html',
        controller: 'AppController'
    })

    .state('app.lists', {
        url: '/lists',
        views: {
            'menuContent': {
                templateUrl: 'stonelist.html',
                controller: 'StonelistController',
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/lists');
});

// --- run ---------------------------------------------------------------------

app.run([ '$rootScope', '$ionicPlatform', '$http', 'Stones',
        function( $rootScope, $ionicPlatform, $http, Stones ){

    $ionicPlatform.ready( function(){
        if ( DEBUG ) console.log('>> $ionicPlatform is ready!');
        // Hide the accessory bar by default (remove this to show the 
        // accessory bar above the keyboard for form inputs)
        if ( window.cordova && window.cordova.plugins.Keyboard ) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if( window.StatusBar ) {
            StatusBar.styleDefault();
        }
    });

    // Wait for stones to load.
    $rootScope.stonelistPromise = Stones.loadStones();

    // Restore IDs of stones the user likes.
    $rootScope.favlist = angular.fromJson( window.localStorage.getItem( 'graniteland.favlist' ) || '[]' );

}]);

// --- global values -----------------------------------------------------------

app.value( 'settings', { 
    'appname': 'Graniteland', 
    'appslogan': 'The Search Engine for Marble and Granite.',
});

// --- controllers -------------------------------------------------------------

app.controller( 'AppController',
        [ '$scope', 'Stones', '$ionicModal', '$ionicPopover', 'settings',
        function( $scope, Stones, $ionicModal, $ionicPopover, settings ){

    $scope.stonelistPromise.then( function( result ){
        $scope.stonelist = Stones.getStonelist();

        Stones.setClassificationLabel();
    });

    // --- navbar popovers -----------------------------------------------------

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

}]);

app.controller( 'StonelistController',
        [ '$scope', 'Stones', '$ionicModal', '$ionicPopover', 'settings',
        function( $scope, Stones, $ionicModal, $ionicPopover, settings ){

    // --- favlist -------------------------------------------------------------

    $scope.getFavlistIndex = function(item){
        // Returns the index number of an item in the favlist, or 
        // returns false if the item is not in the favlist.
        for ( i=0; i<$scope.favlist.length; i++ ){
            if ( $scope.favlist[i]['id'] == item['id'] ) return i;
        }
        return (-1);
    }

    $scope.addOrRemoveItemOnFavlist = function(){
        if ( DEBUG ) console.log('>> addOrRemoveItemOnFavlist: ' + this.item['name']);
        if ( DEBUG ) console.log(this);
        if ( this.item.isFav ){
            if ( DEBUG ) console.log('>>>> REMOVE ITEM...');
            // Remove item from favlist.
            this.item.isFav = false;
            var i = $scope.getFavlistIndex(this.item);
            if ( i>=0 ) $scope.favlist.splice( i, 1 );
            window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
        } else {
            if ( DEBUG ) console.log('>>>> ADD ITEM...');
            // Add a new item to the favlist.
            this.item.isFav = true;
            var i = $scope.getFavlistIndex(this.item);
            if (i >= 0) $scope.favlist.splice( i, 1 );
            $scope.favlist.unshift(this.item);
            window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
        }
    }

    $scope.addItemToFavlist = function(){
        if ( DEBUG ) console.log('>> addItemToFavlist: ' + this.item['name']);
        if ( DEBUG ) console.log(this);

        this.item.isFav = true;
        var i = $scope.getFavlistIndex(this.item);
        if (i >= 0) $scope.favlist.splice( i, 1 );
        $scope.favlist.unshift(this.item);
        window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
    };
    $scope.removeItemFromFavlist = function(){
        if ( DEBUG ) console.log('>> removeItemFromFavlist: ' + this.item['name']);
        if ( DEBUG ) console.log(this);

        this.item.isFav = false;
        var i = $scope.getFavlistIndex(this.item);
        if ( i>=0 ) $scope.favlist.splice( i, 1 );
        window.localStorage.setItem('graniteland.favlist', angular.toJson($scope.favlist));
    }

    // --- item modal ----------------------------------------------------------

    $ionicModal.fromTemplateUrl('stone-item.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.showItem = function() {
        if ( DEBUG ) console.log('>> showItem: ' + this.item['name']);
        if ( DEBUG ) console.log(this);
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
    
}]);

// --- services ----------------------------------------------------------------

app.factory( 'Stones', 
        [ '$q', '$rootScope', '$http',
        function StonesFactory( $q, $rootScope, $http ){

    // --- fetch stonelist -----------------------------------------------------

    var stoneall = []; // List of all stones.
    var stonelist = []; // Stones after filters applied.
    var colorlist = []; // All colors from all stones.
    var classificationlist = []; // All stone classifications.

    function loadStones(){
        var deferred = $q.defer();

        $http.get( URL_STONELIST ).success( function( data ){
            stoneall = data;

            // Find all existing colors.
            for ( var i=0; i<stoneall.length; i++ ){
                if ( ! stoneall[i]['color_name'] ) continue;
                var x = stoneall[i]['color_name'].trim();
                if ( x !== '' && colorlist.indexOf( x ) < 0 )
                    colorlist.push( x );
            }
            colorlist = colorlist.sort();

            // Find all existing classifications.
            for ( var i=0; i<stoneall.length; i++ ){
                if ( ! stoneall[i]['classification_name'] ) continue;
                var x = stoneall[i]['classification_name'].trim();
                if ( x !== '' && classificationlist.indexOf( x ) < 0 )
                    classificationlist.push( x );
            }
            classificationlist = classificationlist.sort();

            deferred.resolve( true );
        }).error( function( ){
            deferred.reject( 'Error loading stone data.' );
        });

        return deferred.promise;
    }

    // --- set filter ----------------------------------------------------------

    var filterByColor = window.localStorage.getItem( 'graniteland.filterByColor' ) || window.DEFAULT_COLOR;
    var filterByClassification = window.localStorage.getItem( 'graniteland.filterByClassification' ) || window.DEFAULT_CLASSIFICATION;
    var filterByClassificationLabel = '';

    function setColorFilter( color_name ){
        filterByColor = color_name;
        window.localStorage.setItem( 'graniteland.filterByColor', filterByColor );
        setClassificationLabel(); // Update classification list.
    }
    function getColorFilter(){
        return filterByColor;
    }
    function setClassificationFilter( classification_label ){ 
        // We get the label here. Find the matching classification name first.
        filterByClassificationLabel = classification_label;
        var idx = classificationLabelList.indexOf( filterByClassificationLabel );
        filterByClassification = classificationlist[idx];
        window.localStorage.setItem( 'graniteland.filterByClassification', $scope.filterByClassification );
        $scope.filterStonelist();
        $scope.closePopover();
    }
    function getClassificationFilter(){ 
        return filterByClassification
    }

    function getStonelist(){
        // Runs the currently set filter over stoneall and generates
        // a new stonelist to display.
        stonelist = [];
        for ( var i=0; i<stoneall.length; i++){
            if ( filterByColor == stoneall[i]['color_name']
            && filterByClassification == stoneall[i]['classification_name'] ){
                stonelist.push( stoneall[i] );
            }
        }
    }
    function setClassificationLabel(){
        // The classification list should include the currently selected
        // color name, e.g. "green marble" and not just "marble", as well
        // as the number of stones that fit that combination, e.g.
        // "green marble (27)" and not just "green marble".
        classificationLabelList = [];
        for ( var i=0; i<classificationlist.length; i++ ){
            // Count the number of stones with that combination.
            var c = 0;
            for ( var j=0; j<stoneall.length; j++){
                if ( filterByColor == stoneall[j]['color_name']
                && classificationlist[i] == stoneall[j]['classification_name'] ){
                    c++;
                }
            }
            // Make the label string.
            var x = filterByColor + ' ' + classificationlist[i] + ' (' + c + ')';
            // Append this label to the label list.
            classificationLabelList.push( x );
            // Set currently selected.
            if ( filterByClassification === classificationlist[i] ) filterByClassificationLabel = x;
        }
    }

    // --- publish methods -----------------------------------------------------

    this.loadStones = loadStones;
    this.setColorFilter = setColorFilter;
    this.getColorFilter = getColorFilter;
    this.setClassificationFilter = setClassificationFilter;
    this.getClassificationFilter = getClassificationFilter;
    this.setClassificationLabel = setClassificationLabel;
    this.getStonelist = getStonelist;
    return this;
}]);

// -----------------------------------------------------------------------------
