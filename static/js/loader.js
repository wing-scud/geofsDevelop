window.eventdone = {};

window.loadAsyncScript = function(url, onLoadFunction) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    document.body.appendChild(script);
    script.onload = onLoadFunction;
    script.src = url;
};

window.executeOnEventDone = function(eventName, callback) {
    if (window.eventdone[eventName]) {
        try {
            callback();
        }
        catch(e) {
            console.log(e);
        }
    }
    else {
        window.addEventListener(eventName, callback);
    }
};

window.fireBasicEvent = function(eventName) {

    if (typeof(Event) === 'function') {
        var event = new Event(eventName);
    }
    else{
        // IE compatibility
        var event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    }

    window.eventdone[eventName] = true;
    window.dispatchEvent(event);
};

window.orderedListeners = {};
window.addOrderedEventListener = function(event, handler) {

    if (!window.orderedListeners[event]) {
        window.orderedListeners[event] = [];
        window.executeOnEventDone(event, function(e) {
            window.orderedListeners[event].forEach(function(handler) {
                try {
                    handler(e);
                }
                catch(e) {
                    console.log(e);
                }
            });
        });
    }

    window.orderedListeners[event].push(handler);
};

window.addEventListener('load', function() {

    var scripts = document.getElementsByTagName('deferredscript');

    function loadDeferredScript(i) {

        if (i >= scripts.length) {
            window.fireBasicEvent('beforeDeferredload');
            window.fireBasicEvent('deferredload');
            window.fireBasicEvent('afterDeferredload');
            return;
        }

        var script = document.createElement('script');
        script.src = scripts[i].getAttribute("src");
        script.onload = script.onerror = function() {
            // load next deferred script
            loadDeferredScript(i + 1);
        };

        document.getElementsByTagName('head')[0].appendChild(script);
    }

    loadDeferredScript(0);
});