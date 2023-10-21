"use strict";
const WPFormsUtils =
  window.WPFormsUtils ||
  (function (r) {
    return {
      triggerEvent: function (n, t, e = []) {
        t = new r.Event(t);
        return n.trigger(t, e), t;
      },
      debounce: function (r, i, u) {
        var o;
        return function () {
          var n = this,
            t = arguments,
            e = u && !o;
          clearTimeout(o),
            (o = setTimeout(function () {
              (o = null), u || r.apply(n, t);
            }, i)),
            e && r.apply(n, t);
        };
      },
    };
  })((document, window, jQuery));
