// # Livefyre StreamHub + Chute
// StreamHub hosts Collections of Content.
// StreamHub-Backbone helps you render them nicely.
// Chute is a great source of media Content.
// Now you can use them all together. Hooray!

// Load config, which tells RequireJS where dependencies are
require(['./config'], function () {

var mediaCollection;

// ## Display the Collection of Content
// This is what the user will see

// First, get the required dependencies
require([
    'fyre',
    'streamhub-backbone',
    'streamhub-backbone/views/FeedView',
    'streamhub-isotope',
    'mustache',
    'jquery'],
function(fyre, Hub, FeedView, IsotopeView, Mustache, $){
    
    mediaCollection = new Hub.Collection();

    // Load a StreamHub SDK
    fyre.conv.load({
        network: "labs-t402.fyre.co"
    }, [{app: 'sdk'}],
    function loadApp (sdk) {
        var feedView = new FeedView({
                el: document.getElementById('example-feed'),
                collection: mediaCollection,
                contentViewOptions: {
                    template: photoAnchorTemplate
                }
            }),
            isotopeView = new IsotopeView({
                el: document.getElementById('example-wall'),
                collection: mediaCollection,
                contentViewOptions: {
                    template: photoAnchorTemplate
                }
            });
        mediaCollection.setRemote({
            sdk: sdk,
            siteId: "303827",
            articleId: "chute_0"
        });
        // Use the same Livefyre Auth Token for all uploads.
        // This is just a demo user.
        var userToken = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGFicy10NDAyLmZ5cmUuY28iLCAiZXhwaXJlcyI6IDEzNjY0OTE0NjkuNjU0NjU4LCAidXNlcl9pZCI6ICJ1c2VyXzAifQ.MSGGgu67OrS2C2ENro5NR6YVF5f7wJeoKuR3IzNqHZ4';
        // The JS SDK must be told what token to use
        mediaCollection._sdkCollection.setUserToken(userToken);
    });

    // ### Rendering chosen media
    // StreamHub does not quite yet support attaching images
    // via API. It will soon, but until then, Chute links
    // will be submitted just as links, and this template will
    // parse them out and turn them into attached Media. Sneaky.
    
    // Compile the default Content Mustache template.
    var contentTemplate = Mustache.compile('<article data-hub-content-id="{{ id }}">\n\t<div class="hub-heading">\n\t\t{{#author.avatar}}\n\t\t<a class="hub-avatar"><img src="{{ author.avatar }}" /></a>\n\t\t{{/author.avatar}}\n\t\t<p class="hub-byline"><span class="hub-author">{{ author.displayName }}</span><a class="hub-timestamp">{{formattedCreatedAt}}</a></p>\n\t</div>\n\t<div class="hub-body">\n\t\t<div class="hub-body-html">\n\t\t{{{ bodyHtml }}}\n\t\t</div>\n\t\t<div class="hub-attachments">\n\t\t{{ #attachments }}\n\t\t\t<div class="hub-attachment hub-attachment-photo">\n\t\t\t\t<img onerror="this.parentNode.removeChild(this)" src="{{ url }}" />\n\t\t\t</div>\n\t\t{{ /attachments }}\n\t\t</div>\n\t</div>\n</article>');
    // This is the custom template function. Template functions
    // take in Content JSON and output HTML
    function photoAnchorTemplate (data) {
        // Look in the bodyHtml for links that contain getchute
        var bodyHtml = data.bodyHtml,
            $html = $(bodyHtml),
            $anchors = $html.find('a'),
            $hrefAnchors = $anchors.filter('a[href]'),
            attachments = [];
        if ($hrefAnchors.length > 0) {
            // If there's chute links, add an attachment for each
            $hrefAnchors.each(function (index, element) {
                // Attachments are oEmbed JSON Objects
                attachments.push({
                    version: '1.0',
                    type: 'photo',
                    provider: 'chute',
                    url: element.innerText
                });
            });
            data.attachments = attachments;
            // Remove the actual links from the bodyHtml
            // since they're now rich attachments
            $hrefAnchors.remove();
            data.bodyHtml = outerHtml($html);
            // Change the display name to the heroic UploaderDude
            data.author.displayName = 'UploaderDude';
        }
        return contentTemplate(data);
    }
    // Returns the full HTML representation of an $element
    function outerHtml ($el) {
        return $("<p>").append($el.eq(0).clone()).html();
    }
});

// ## The Media Chooser button
// When a user clicks the button, help them choose media through
// Chute Media Chooser. Then post it to the StreamHub Collection

// First, load the dependencies
require([
    'mediachooser',
    'jquery'],
function (Chute, $) {
    // configure Chute app
    Chute.setApp('50f085cd018d16498100072f');

    var postUrl = 'http://quill.labs-t402.fyre.co/api/v3.0/collection/10667505/post/';

    // Bind a click handler to the upload button so that it
    // lets you choose media when you click it
    $('.upload-button').click(function (e) {
        e.preventDefault();

        chooseMedia(postMedia);
    });

    // ### Use Chute to MediaChoose
    function chooseMedia (cb) {
        Chute.MediaChooser.choose(function mediaChooseSuccess (urls, data) {
            cb(urls, data);
        });
    }
    function errorChoosing (error) {
        console.log("Error picking", error);
    }
    
    // ### Post the Media into StreamHub
    // Posted Content will come down from the Collection's stream
    function postMedia (urls, data) {
        var assets = data && data.assets;
        if ( ! urls || ! assets.length ) {
            return console.log("There is no media to post", urls, data);
        }
        
        // Use the raw JS SDK to post Content to the Collection
        mediaCollection._sdkCollection.postContent({
            // The Content bodyHtml will just be a link
            // to the chosen media, We'll parse it out on render
            bodyHtml: urls.join(' ')
        }, onPostSuccess, onPostError);
        function onPostSuccess () {
            console.log("Successful posting to StreamHub");
        }
        function onPostError () {
            console.log("Error posting to StreamHub");
        }
    }
});

console.log('main loaded');
});