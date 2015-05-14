ng-gplaces-autocomplete
=======================

Angular directive for the Google Places Autocomplete component.

Installation
------------

Install via bower:

```bash
bower install git@github.com:Tapestry/ng-gplaces-autocomplete.git --save
```

Then add the script to your page (be sure to include the Google Places API as well):

```html
<script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
<script src="/bower_components/ng-gplaces-autocomplete/dist/ng-gplaces-autocomplete.js"></script>
```

You'll probably also want the styles:

```html
<link rel="stylesheet" href="/bower_components/ng-gplaces-autocomplete/dist/ng-gplaces-autocomplete.css">
```

Usage
-----

First add the dependency to your app:

```javascript
angular.module('myApp', ['google.places']);
```

Then you can use the directive on text inputs like so:

```html
<input type="text" g-places-autocomplete ng-model="myScopeVar" />
```

The directive also supports the following _optional_ attributes:

* forceSelection &mdash; forces the user to select from the dropdown. Defaults to `false`.
* options &mdash; See [google.maps.places.AutocompleteRequest object specification](https://developers.google.com/maps/documentation/javascript/reference#AutocompletionRequest).

Setup and compile from source
----------

Clone the repository

```bash
git clone git@github.com:davidvuong/ng-gplaces-autocomplete.git
```

Install dependencies and compile

```bash
sudo npm -g install grunt-cli
npm install

grunt
```

Testing
-------

```bash
grunt test
```

Contributing
------------

Issue a pull request including any relevant testing and updated any documentation if required.
