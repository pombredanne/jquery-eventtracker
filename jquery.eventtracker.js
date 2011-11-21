(function($){

  $.fn.trackEvents = function(params) {
    var tracker = $.fn.trackEvents;

    $.fn.trackEvents.params = $.extend({
      delay: 250,
      cssClassForDefaultEvent: "defaultEnable"
    }, params);

    params = $.fn.trackEvents.params;

    if (!window._gaq) {
      $.fn.trackEvents.disabled = true;
      return;
    }

    return this.each (function() {
      var element = $(this);
      var data = element.data();
      var events = tracker.getDataEvents(data);

      _.each(events, function(event) {
        if (element.get(0).tagName == "A") {
          element.click(tracker.link.generateStrategy(element, event));
        }
      });
    });
  }

  // Link Strategy

  $.fn.trackEvents.link = {};

  $.fn.trackEvents.link.generateStrategy = function(element, event) {
    var tracker = $.fn.trackEvents;
    var params = tracker.params;

    var strategy = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      tracker.notifyAnalytics(event);
      element.addClass(params.cssClassForDefaultEvent);
      element.off("click", strategy);

      setTimeout(function() { tracker.link.callback(element); }, params.delay);
    }

    return strategy;
  }

  $.fn.trackEvents.link.callback = function(element) {
    var tracker = $.fn.trackEvents;

    if (!tracker.link.hasDefaultAction(element)) {
      element.click(tracker.link.defaultAction);
    }

    element.trigger("click");
  }

  $.fn.trackEvents.link.defaultAction = function() {
    if ($.fn.trackEvents.hasDefaultEvent($(this))) {
      document.location.href = $(this).attr("href");
    }
  }

  $.fn.trackEvents.link.defaultAction.action = "defaultAction";

  $.fn.trackEvents.link.hasDefaultAction = function(element) {
    var events = element.data("events");
    if (events) {
      return _.any(events.click, function(click) { return click.handler.action == "defaultAction"; });
    }
    return false;
  }

  // Common code

  $.fn.trackEvents.hasDefaultEvent = function(element) {
    var params = $.fn.trackEvents.params;
    return element.hasClass(params.cssClassForDefaultEvent);
  }

  $.fn.trackEvents.notifyAnalytics = function(event) {
    window._gaq.push(['_trackEvent', event.category, event.action, event.content]);
  }

  $.fn.trackEvents.getDataEvents = function(data) {
    var tracker = $.fn.trackEvents;
    var events = _.filter(_.keys(data), function(key) { return !!key.match(/^event/); });
    return _.map(events, function(eventName) {
      var elements = eventName.split(/[aA]ction/);
      var category = tracker.whitespace(elements[0].replace(/^event/, ''));
      var action = tracker.whitespace(elements[1]);
      return {
        key: eventName,
        category: category,
        action: action,
        content: data[eventName]
      };
    });
  }

  $.fn.trackEvents.whitespace = function(string) {
    return string.replace(/([A-Z])/g, " $1").replace(/^\s+/, '').replace(/\s+$/, '');
  }

})(jQuery);
