(function (app) {
    'use strict';

    /** @ngInject */
    function highlightMatched($sce) {
        return function (prediction) {
            var matchedPortion = '';
            var unmatchedPortion = '';
            var matched;

            if (prediction.matched_substrings.length > 0 && prediction.terms.length > 0) {
                matched = prediction.matched_substrings[0];
                matchedPortion = prediction.terms[0].value.substr(matched.offset, matched.length);
                unmatchedPortion = prediction.terms[0].value.substr(matched.offset + matched.length);
            }
            return $sce.trustAsHtml(
                '<span class="pac-matched">' + matchedPortion + '</span>' + unmatchedPortion
            );
        };
    }

    app
        .filter('highlightMatched', highlightMatched);

    /** @ngInject */
    function unmatchedTermsOnly() {
        return function (terms, prediction) {
            var i, term, filtered = [];
            for (i = 0; i < terms.length; i++) {
                term = terms[i];

                var matched_substrings = prediction.matched_substrings;
                if (matched_substrings.length > 0 && term.offset > matched_substrings[0].length) {
                    filtered.push(term);
                }
            }
            return filtered;
        };
    }

    app
        .filter('unmatchedTermsOnly', unmatchedTermsOnly);

    /** @ngInject */
    function trailingComma() {
        return function (input, condition) {
            return (condition) ? input + ',' : input;
        };
    }

    app
        .filter('trailingComma', trailingComma);

})(angular.module('google.places.filters', []));
