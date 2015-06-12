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
    
    $rootScope.colorlist = [];
    $rootScope.classificationlist = [];
    $rootScope.classificationLabelList = [];
    $rootScope.filterByClassificationLabel = '';
    $rootScope.filterByColor = '';
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

        $scope.classificationlist = Stones.getClassificationLabelList();
        $scope.filterByColor = Stones.getFilterByColor();
        $scope.filterByClassificationLabel = Stones.getFilterByClassificationLabel();

        $scope.classificationLabelList = Stones.getClassificationLabelList();
        $scope.colorlist = Stones.getColorList();

        $scope.stonelist = Stones.getStonelist();
        if ( DEBUG ) console.log( 'Stonelist loaded with ' + $scope.stonelist.length + ' items.' );
    });

    $scope.setColorFilter = function(){
        if ( DEBUG ) console.log( this );
        Stones.setFilterByColor( this.color );
        $scope.stonelist = Stones.getStonelist();
        $scope.closePopover();
        $scope.classificationLabelList = Stones.getClassificationLabelList();
        $scope.colorlist = Stones.getColorList();
        $scope.filterByColor = Stones.getFilterByColor();
        $scope.filterByClassificationLabel = Stones.getFilterByClassificationLabel();
    }
    $scope.setClassificationFilter = function(){
        if ( DEBUG ) console.log( this );
        Stones.setFilterByClassificationLabel( this.classification );
        $scope.stonelist = Stones.getStonelist();
        $scope.closePopover();
        $scope.classificationLabelList = Stones.getClassificationLabelList();
        $scope.colorlist = Stones.getColorList();
        $scope.filterByClassificationLabel = Stones.getFilterByClassificationLabel();
    }

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

    var stoneall = []; // List of all stones.
    var stonelist = []; // Stones after filters applied.
    var colorlist = []; // All colors from all stones.
    var classificationlist = []; // All stone classifications.

    var filterByColor = window.localStorage.getItem( 'graniteland.filterByColor' ) || DEFAULT_COLOR;
    var filterByClassification = window.localStorage.getItem( 'graniteland.filterByClassification' ) || DEFAULT_CLASSIFICATION;
    var filterByClassificationLabel = filterByColor + ' ' + filterByClassification + ' (?)';

    // --- fetch stonelist -----------------------------------------------------

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

    function getColorList(){
        return colorlist;
    }
    function getClassificationList(){
        return classificationlist;
    }
    function getClassificationLabelList(){
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
            if ( filterByClassification === classificationlist[i] ) 
                filterByClassificationLabel = x;
        }
        return classificationLabelList;
    }

    function getStonelist(){
        // Runs the currently set filter over stoneall and generates
        // a new stonelist to display.
        if ( DEBUG ) console.log( 'Stone.getStonelist() called, filterByColor=="'+filterByColor+'" and filterByClassification=="'+filterByClassification+'".' );
        stonelist = [];
        for ( var i=0; i<stoneall.length; i++){
            if ( filterByColor == stoneall[i]['color_name']
            && filterByClassification == stoneall[i]['classification_name'] ){
                stonelist.push( stoneall[i] );
            }
        }
        if ( DEBUG ) console.log( 'Stone.getStonelist() found stonelist with "'+stonelist.length+'" items out of stoneall with "'+stoneall.length+'" items.' );
        return stonelist;
    }

    // --- set filter ----------------------------------------------------------

    function setFilterByColor( color_name ){
        filterByColor = color_name;
        window.localStorage.setItem( 'graniteland.filterByColor', filterByColor );
    }
    function getFilterByColor(){
        return filterByColor;
    }
    
    function setFilterByClassificationLabel( classification_label ){
        // We get the label here. Find the matching classification name first.
        filterByClassificationLabel = classification_label;
        if ( DEBUG ) console.log( 'Stone.setFilterByClassificationLabel() called with classification_label=="' + classification_label + '".' );
        if ( classificationLabelList.length < 1 ) getClassificationLabelList();
        var idx = classificationLabelList.indexOf( filterByClassificationLabel );
        if ( DEBUG ) console.log( 'Stone.setFilterByClassificationLabel() found at index "' + idx + '" of classificationLabelList with "' + classificationLabelList.length + '" items.' );
        setFilterByClassification( classificationlist[idx] );
    }
    function getFilterByClassificationLabel(){
        return filterByClassificationLabel;
    }

    function setFilterByClassification( classification ){ 
        if ( DEBUG ) console.log( 'Stone.setFilterByClassification() called with classification=="' + classification + '".' );
        filterByClassification = classification;
        window.localStorage.setItem( 'graniteland.filterByClassification', filterByClassification );
    }
    function getFilterByClassification(){ 
        return filterByClassification
    }

    // --- publish methods -----------------------------------------------------

    this.loadStones = loadStones;
    
    this.setFilterByColor = setFilterByColor;
    this.getFilterByColor = getFilterByColor;
    
    this.setFilterByClassification = setFilterByClassification;
    this.getFilterByClassification = getFilterByClassification;
    this.setFilterByClassificationLabel = setFilterByClassificationLabel;
    this.getFilterByClassificationLabel = getFilterByClassificationLabel;
    
    this.getColorList = getColorList;
    this.getClassificationList = getClassificationList;
    this.getClassificationLabelList = getClassificationLabelList;
    this.getStonelist = getStonelist;
    return this;
}]);

// -----------------------------------------------------------------------------
