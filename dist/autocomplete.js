/**
 * ng-gplaces-autocomplete - v0.2.7, 2015-05-18 6:51:09 PM
 * https://github.com/davidvuong/ng-gplaces-autocomplete
 *
 * Copyright (c) 2015 David Vuong <david.vuong256@gmail.com>
 * Licensed MIT <https://raw.githubusercontent.com/davidvuong/ng-gplaces-autocomplete/master/LICENSE>
 */
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
    google.$inject = ["$window"];

    app
        .factory('google', google);

})();

(function (app) {
    'use strict';

    /** @ngInject */
    function gPlacesAutocomplete($compile, google) {
        return {
            restrict: 'A',
            require: '^ngModel',
            scope: {
                model: '=ngModel',
                options: '=?',
                forceSelection: '=?',
                customPlaces: '=?'
            },
            controller: ['$scope', function ($scope) {}],
            link: function ($scope, element, attrs, controller) {
                var keymap = {
                    tab: 9, enter: 13, esc: 27, up: 38, down: 40
                };
                var hotkeys = _.values(keymap);
                var autocompleteService = new google.maps.places.AutocompleteService();
                var placesService = new google.maps.places.PlacesService(element[0]);

                (function init() {
                    $scope.query = '';
                    $scope.predictions = [];
                    $scope.input = element;
                    $scope.options = $scope.options || {};

                    initAutocompleteDrawer();
                    initEvents();
                    initNgModelController();
                }());

                function initEvents() {
                    element.bind('keydown', onKeydown);
                    element.bind('blur', onBlur);
                    element.bind('submit', onBlur);

                    $scope.$watch('selected', select);
                }

                function initAutocompleteDrawer() {
                    // Drawer element used to display predictions
                    var drawerElement = angular.element('<div g-places-autocomplete-drawer></div>');
                    drawerElement.attr({
                        input: 'input',
                        query: 'query',
                        predictions: 'predictions',
                        active: 'active',
                        selected: 'selected'
                    });

                    var $drawer = $compile(drawerElement)($scope);
                    element.after($drawer);
                }

                function initNgModelController() {
                    controller.$parsers.push(parse);
                    controller.$formatters.push(format);
                    controller.$render = render;
                }

                function onKeydown(event) {
                    if ($scope.predictions.length === 0 || indexOf(hotkeys, event.which) === -1) {
                        return;
                    }
                    event.preventDefault();

                    if (event.which === keymap.down) {
                        $scope.active = ($scope.active + 1) % $scope.predictions.length;
                        $scope.$digest();
                    } else if (event.which === keymap.up) {
                        $scope.active = ($scope.active ? $scope.active : $scope.predictions.length) - 1;
                        $scope.$digest();
                    } else if (event.which === 13 || event.which === 9) {
                        if ($scope.forceSelection) {
                            $scope.active = ($scope.active === -1) ? 0 : $scope.active;
                        }
                        $scope.$apply(function () {
                            $scope.selected = $scope.active;

                            if ($scope.selected === -1) {
                                clearPredictions();
                            }
                        });
                    } else if (event.which === 27) {
                        event.stopPropagation();
                        clearPredictions();
                        $scope.$digest();
                    }
                }

                function onBlur(event) {
                    if ($scope.predictions.length === 0) {
                        if ($scope.forceSelection) {
                            var fn = function () { $scope.model = ''; };

                            var phase = $scope.$root.$$phase;
                            if (phase == '$apply' || phase == '$digest') {
                                fn();
                            } else {
                                $scope.$apply(fn);
                            }
                        }
                        return;
                    }

                    if ($scope.forceSelection) {
                        $scope.selected = ($scope.selected === -1) ? 0 : $scope.selected;
                    }

                    $scope.$digest();
                    $scope.$apply(function () {
                        if ($scope.selected === -1) {
                            clearPredictions();
                        }
                    });
                }

                function select() {
                    var prediction;

                    prediction = $scope.predictions[$scope.selected];
                    if (!prediction) { return; }

                    if (prediction.is_custom) {
                        $scope.model = prediction.place;
                        $scope.$emit('g-places-autocomplete:select', prediction.place);
                    } else {
                        placesService.getDetails({ placeId: prediction.place_id }, function (place, status) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                $scope.$apply(function () {
                                    $scope.model = place;
                                    $scope.$emit('g-places-autocomplete:select', place);
                                });
                            }
                        });
                    }
                    clearPredictions();
                }

                function parse(viewValue) {
                    var request;

                    if (!(viewValue && _.isString(viewValue))) { return viewValue; }

                    $scope.query = viewValue;
                    request = angular.extend({ input: viewValue }, $scope.options);
                    autocompleteService.getPlacePredictions(request, function (predictions, status) {
                        $scope.$apply(function () {
                            var customPlacePredictions;

                            clearPredictions();
                            if ($scope.customPlaces) {
                                customPlacePredictions = getCustomPlacePredictions($scope.query);
                                $scope.predictions.push.apply($scope.predictions, customPlacePredictions);
                            }

                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                $scope.predictions.push.apply($scope.predictions, predictions);
                            }

                            if ($scope.predictions.length > 5) {
                                $scope.predictions.length = 5;  // trim predictions down to size
                            }
                        });
                    });

                    return viewValue;
                }

                function format(modelValue) {
                    var viewValue = "";

                    if (_.isString(modelValue)) {
                        viewValue = modelValue;
                    } else if (_.isObject(modelValue)) {
                        viewValue = modelValue.formatted_address;
                    }

                    return viewValue;
                }

                function render() {
                    return element.val(controller.$viewValue);
                }

                function clearPredictions() {
                    $scope.active = -1;
                    $scope.selected = -1;
                    $scope.predictions.length = 0;
                }

                function getCustomPlacePredictions(query) {
                    var predictions = [],
                        place, match, i;

                    for (i = 0; i < $scope.customPlaces.length; i++) {
                        place = $scope.customPlaces[i];

                        match = getCustomPlaceMatches(query, place);
                        if (match.matched_substrings.length > 0) {
                            predictions.push({
                                is_custom: true,

                                // required by https://developers.google.com/maps/terms § 10.1.1 (d)
                                custom_prediction_label: place.custom_prediction_label || '(Custom Non-Google Result)',
                                description: place.formatted_address,
                                place: place,
                                matched_substrings: match.matched_substrings,
                                terms: match.terms
                            });
                        }
                    }

                    return predictions;
                }

                function getCustomPlaceMatches(query, place) {
                    var q = query + '',  // make a copy so we don't interfere with subsequent matches
                        terms = [],
                        matched_substrings = [],
                        fragment,
                        termFragments,
                        i;

                    termFragments = place.formatted_address.split(',');
                    for (i = 0; i < termFragments.length; i++) {
                        fragment = termFragments[i].trim();

                        if (q.length > 0) {
                            if (fragment.length >= q.length) {
                                if (startsWith(fragment, q)) {
                                    matched_substrings.push({ length: q.length, offset: i });
                                }
                                q = '';  // no more matching to do
                            } else {
                                if (startsWith(q, fragment)) {
                                    matched_substrings.push({ length: fragment.length, offset: i });
                                    q = q.replace(fragment, '').trim();
                                } else {
                                    q = '';  // no more matching to do
                                }
                            }
                        }

                        terms.push({
                            value: fragment,
                            offset: place.formatted_address.indexOf(fragment)
                        });
                    }

                    return {
                        matched_substrings: matched_substrings,
                        terms: terms
                    };
                }

                function indexOf(array, item) {
                    var i, length;
                    if (array == null) { return -1; }

                    length = array.length;
                    for (i = 0; i < length; i++) {
                        if (array[i] === item) { return i; }
                    }
                    return -1;
                }

                function startsWith(string1, string2) {
                    return toLower(string1).lastIndexOf(toLower(string2), 0) === 0;
                }

                function toLower(string) {
                    return (string == null) ? "" : string.toLowerCase();
                }
            }
        };
    }
    gPlacesAutocomplete.$inject = ["$compile", "google"];

    app
        .directive('gPlacesAutocomplete', gPlacesAutocomplete);

    /** @ngInject */
    function gPlacesAutocompleteDrawer($window, $document) {
        var TEMPLATE = [
            '<div class="pac-container" ng-style="{ width: position.width+\'px\' }"',
                  'ng-if="isOpen()" role="listbox" aria-hidden="{{ !isOpen() }}">',
                '<div class="pac-item" g-places-autocomplete-prediction index="$index"',
                      'prediction="prediction" query="query" ng-repeat="prediction in predictions track by $index"',
                      'ng-class="{\'pac-item-selected\': isActive($index) }"',
                      'ng-mouseenter="selectActive($index)" ng-click="selectPrediction($index)"',
                      'role="option" id="{{prediction.id}}">',
                '</div>',
            '</div>'
        ];

        return {
            restrict: 'A',
            scope:{
                input: '=', query: '=', predictions: '=', active: '=', selected: '='
            },
            template: TEMPLATE.join(''),
            link: function ($scope, element) {
                element.bind('mousedown', function (event) {
                    event.preventDefault();  // prevent blur event from firing when clicking selection
                });

                $scope.isOpen = function () {
                    return $scope.predictions.length > 0;
                };

                $scope.isActive = function (index) {
                    return $scope.active === index;
                };

                $scope.selectActive = function (index) {
                    $scope.active = index;
                };

                $scope.selectPrediction = function (index) {
                    $scope.selected = index;
                };

                $scope.$watch('predictions', function () {
                    $scope.position = getDrawerPosition($scope.input);
                }, true);

                function getDrawerPosition(element) {
                    var domEl = element[0],
                        rect = domEl.getBoundingClientRect(),
                        docEl = $document[0].documentElement,
                        body = $document[0].body,
                        scrollTop = $window.pageYOffset || docEl.scrollTop || body.scrollTop,
                        scrollLeft = $window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

                    return {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top + rect.height + scrollTop,
                        left: rect.left + scrollLeft
                    };
                }
            }
        };
    }
    gPlacesAutocompleteDrawer.$inject = ["$window", "$document"];

    app
        .directive('gPlacesAutocompleteDrawer', gPlacesAutocompleteDrawer);

    /** @ngInject */
    function gPlacesAutocompletePrediction() {
        var TEMPLATE = [
            '<span class="pac-icon pac-icon-marker"></span>',
            '<span class="pac-item-query" ng-bind-html="prediction | highlightMatched"></span>',
            '<span ng-repeat="term in prediction.terms | unmatchedTermsOnly:prediction">',
                '{{term.value | trailingComma:!$last}}&nbsp;',
            '</span>',
            '<span class="custom-prediction-label" ng-if="prediction.is_custom">',
                '&nbsp;{{prediction.custom_prediction_label}}',
            '</span>'
        ];

        return {
            restrict: 'A',
            scope:{
                index:'=', prediction:'=', query:'='
            },
            template: TEMPLATE.join('')
        };
    }

    app
        .directive('gPlacesAutocompletePrediction', gPlacesAutocompletePrediction);

})(angular.module('google.places.directives'));

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
    highlightMatched.$inject = ["$sce"];

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

})(angular.module('google.places.filters'));
