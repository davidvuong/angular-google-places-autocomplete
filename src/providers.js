(function (app) {
    'use strict';

    /** @ngInject */
    function googlePlacesAPI($window) {
        if (!$window.google) {
            throw 'Global `google` var missing. Did you forget to include the places API script?';
        }
        return $window.google;
    }

    app
        .factory('googlePlacesAPI', googlePlacesAPI);

})(angular.module('google.places.providers', []));
