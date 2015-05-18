/*
 * ng-gplaces-autocomplete
 *
 * Copyright (c) 2015 David Vuong
 * Licensed under the MIT license.
 * https://github.com/davidvuong/ng-gplaces-autocomplete/blob/master/LICENSE
 */
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-karma');

    var userConfig = require('./build.config.js');
    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner: '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
                ' */\n'
        },

        bump: {
            options: {
                files: [
                    'package.json',
                    'bower.json'
                ],
                commit: true,
                commitMessage: 'chore(release): v%VERSION% release',
                commitFiles: [
                    'package.json',
                    'bower.json'
                ],
                createTag: false,
                push: false
            }
        },

        clean: [
            '<%= build_dir %>',
            '<%= compile_dir %>'
        ],

        copy: {
            build_appjs: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            }
        },

        concat: {
            build_css: {
                src: [
                    '<%= autoprefixer.build.files[0].dest %>'
                ],
                dest: '<%= autoprefixer.build.files[0].dest %>'
            },
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [ '<%= build_dir %>/annotated/**/*.js' ],
                dest: '<%= compile_dir %>/autocomplete.js'
            }
        },

        ngAnnotate: {
            compile: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        dest: '<%= build_dir %>/annotated',
                        expand: true
                    }
                ]
            }
        },

        uglify: {
            compile: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= compile_dir %>/autocomplete.min.js': '<%= concat.compile_js.dest %>'
                }
            }
        },

        less: {
            build: {
                files: {
                    '<%= build_dir %>/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.less %>'
                }
            }
        },

        autoprefixer: {
            options: ['last 2 version', 'ie 8', 'ie 9'],
            build: {
                files: [
                    {
                        expand: false,
                        src: '<%= build_dir %>/<%= pkg.name %>-<%= pkg.version %>.css',
                        dest: '<%= compile_dir %>/autocomplete.css'
                    }
                ]
            }
        },

        jshint: {
            src: [
                '<%= app_files.js %>',
                '<%= app_files.jshint_ignore %>'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                debug: true
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.registerTask('default', [ 'build', 'compile' ]);

    grunt.registerTask('build', [
        'clean', 'jshint', 'less:build', 'autoprefixer:build', 'ngAnnotate',
        'concat:build_css', 'copy:build_appjs'
    ]);

    grunt.registerTask('compile', [
        'autoprefixer:build', 'concat:compile_js', 'uglify'
    ]);

    grunt.registerTask('test', [ 'karma' ]);
};
