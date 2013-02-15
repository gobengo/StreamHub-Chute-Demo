Packages = undefined;
// Require.js Config
require.config({
    packages: [{
        name: 'streamhub-backbone',
        location: 'components/streamhub-backbone'
    },{
        name: 'streamhub-isotope',
        location: 'components/streamhub-isotope'
    }],
    paths: {
        jquery: 'components/jquery/jquery',
        underscore: 'components/underscore/underscore',
        backbone: 'components/backbone/backbone',
        mustache: 'components/mustache/mustache',
        text: 'components/requirejs-text/text',
        fyre: 'http://zor.t402.livefyre.com/wjs/v3.0.sdk/javascripts/livefyre',
        mediachooser: '//cdn.getchute.com/media-chooser.min',
        isotope: 'components/isotope/jquery.isotope',
    },
    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        fyre: {
            exports: 'fyre'
        },
        mediachooser: {
            exports: 'Chute'
        },
        isotope: {
            deps: ['jquery']
        },
    }
});