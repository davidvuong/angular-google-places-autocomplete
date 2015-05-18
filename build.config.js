/*
 * ng-gplaces-autocomplete
 *
 * Copyright (c) 2015 David Vuong
 * Licensed under the MIT license.
 * https://github.com/davidvuong/ng-gplaces-autocomplete/blob/master/LICENSE
 */
module.exports = {
    compile_dir: 'dist',
    build_dir: 'build',
    src_dir: 'src',

    app_files: {
        js: [ 'src/app.js', 'src/directives.js', 'src/filters.js',
              '!src/**/*.spec.js', '!src/assets/**/*.js' ],
        jshint_ignore: [],
        less: 'src/less/autocomplete.less'
    }
};
