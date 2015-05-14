ng-gplaces-autocomplete
=======================

Angular directive for the Google Places Autocomplete component.

Installation
------------

Install via bower:

```bash
bower install git@github.com:davidvuong/ng-gplaces-autocomplete.git --save
```

Add the script into your asset pipeline (or in a script tag). Make sure that the Google Places API is loaded first:

```html
<script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
<script src="/bower_components/ng-gplaces-autocomplete/dist/ng-gplaces-autocomplete-{version}.js"></script>
```

You'll probably also want the styles:

```html
<link rel="stylesheet" href="/bower_components/ng-gplaces-autocomplete/dist/ng-gplaces-autocomplete-{version}.css">
```

Usage
-----

First add the dependency to your app:

```javascript
angular.module('myApp', ['google.places']);
```

Then you can use the directive on text inputs like so:

```html
<input type="text" g-places-autocomplete ng-model="location" />
```

The directive also supports the following _optional_ attributes:

* forceSelection &mdash; forces the user to select from the dropdown. Defaults to `false`.
* options &mdash; See [google.maps.places.AutocompleteRequest object specification](https://developers.google.com/maps/documentation/javascript/reference#AutocompletionRequest).
