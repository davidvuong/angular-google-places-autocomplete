(function () {
    'use strict';

    angular.module('google.places.directives', []);
    angular.module('google.places.filters', []);

    var app = angular.module('google.places', [
        'google.places.directives',
        'google.places.filters'
    ]);

    /** @ngInject */
    function google($window) {
        if (!$window.google) {
            throw 'Global `google` var missing. Did you forget to include the places API script?';
        }
        return $window.google;
    }

    app
        .factory('google', google);

})();
