/*
 * ng-gplaces-autocomplete
 *
 * Copyright (c) 2015 David Vuong
 * Licensed under the MIT license.
 * https://github.com/davidvuong/ng-gplaces-autocomplete/blob/master/LICENSE
 */
'use strict';

module.exports = function (config) {
	config.set({
		basePath: '',
		frameworks: ['jasmine'],
		logLevel: 'INFO',
		browsers: ['PhantomJS'],
		autoWatch: true,
		reporters: ['progress', 'coverage'],
		files: [
			'src/**/*.js',
			'test/**/*.js'
		],
		preprocessors: {
			'src/**/*.js': 'coverage'
		},
		coverageReporter: {
			type: 'html',
			dir: 'coverage/'
		}
	});
};
