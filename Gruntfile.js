module.exports = function (grunt) {

    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        meta: {
            banner: "/*!\n * <%= pkg.name %>\n * <%= pkg.description %>\n " +
                "* @version <%= pkg.version %> - <%= grunt.template.today(\'yyyy-mm-dd\') %>\n " +
                "* @author <%= pkg.author.name %> <<%= pkg.author.url %>>\n */\n"
        },
        watch: {
            options: {
                livereload: true
            },
            files: ["app.js", "lib/*.js", "routes/*.js", "Gruntfile.js"],
            tasks: ["jshint"]
        },

        express: {
            all: {
                options: {
                    open: true,
                    server: "app.js",
                    port: 5000,
                    hostname: "localhost",
                    bases: ["app.js"],
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: ["lib/*.js", "routes/*.js"],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        }
    });

    // Load grunt tasks from npm packages.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-express");

    // Livereload task.
    grunt.registerTask("serve", ["express", "watch"]);

    // Default code quality task.
    grunt.registerTask("default", ["jshint"]);

};