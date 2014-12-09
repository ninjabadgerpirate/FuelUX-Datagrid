// Configure loading modules from the script directory,
// except for 'app' ones, which are in a sibling
// directory.  Do not include .js extension
var requireConfig = {
    shim: {
        "bootstrap": { "deps": ['jquery'] }
    },
    paths: {
        "jquery": "/Scripts/jquery-1.10.2.min",
        "underscore": '/Scripts/underscore.min',
        "bootstrap": "/Scripts/bootstrap.min",
        "moment": '/Scripts/moment.min'
    }
};

requirejs.config(requireConfig);

// Start loading the main app file.
requirejs(['App/Index']);