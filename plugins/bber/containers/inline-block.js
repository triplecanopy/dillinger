"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable */

/*!

Needs work!!
Based on: markdown-it-container 2.0.0 https://github.com//markdown-it/markdown-it-container @license MIT */

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : (0, _typeof3.default)(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.markdownitContainer = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {

      // Process block-level custom containers
      //
      'use strict';

      module.exports = function container_plugin(md, name, options) {

        function validateDefault(params) {
          return params.trim().split(' ', 2)[0] === name;
        }

        function renderDefault(tokens, idx, _options, env, self) {

          // add a class to the opening tag
          if (tokens[idx].nesting === 1) {
            tokens[idx].attrPush(['class', name]);
          }

          return self.renderToken(tokens, idx, _options, env, self);
        }

        options = options || {};

        var min_markers = options.minMarkers || 3,
            marker_str = options.marker || ':',
            marker_char = marker_str.charCodeAt(0),
            marker_len = marker_str.length,
            callback = options.callback || null,
            validate = options.validate || validateDefault,
            render = options.render || renderDefault;

        function container(state, startLine, endLine, silent) {
          var pos,
              nextLine,
              marker_count,
              markup,
              params,
              token,
              old_parent,
              old_line_max,
              auto_closed = false,
              start = state.bMarks[startLine] + state.tShift[startLine],
              max = state.eMarks[startLine];

          // Check out the first character quickly,
          // this should filter out most of non-containers
          //
          if (marker_char !== state.src.charCodeAt(start)) {
            return false;
          }

          // Check out the rest of the marker string
          //
          for (pos = start + 1; pos <= max; pos++) {
            if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
              break;
            }
          }

          marker_count = Math.floor((pos - start) / marker_len);
          if (marker_count < min_markers) {
            return false;
          }
          pos -= (pos - start) % marker_len;

          markup = state.src.slice(start, pos);
          params = state.src.slice(pos, max);
          if (!validate(params)) {
            return false;
          }

          // Since start is found, we can report success here in validation mode
          //
          if (silent) {
            return true;
          }

          // Search for the end of the block
          //
          nextLine = startLine;
          auto_closed = true;

          old_parent = state.parentType;
          old_line_max = state.lineMax;
          state.parentType = 'container';

          // this will prevent lazy continuations from ever going past our end marker
          state.lineMax = nextLine;

          token = state.push('container_' + name + '_open', 'div', 1);
          token.markup = markup;
          token.block = true;
          token.info = params;
          token.map = [startLine, nextLine];

          // state.md.block.tokenize(state, startLine + 1, nextLine);

          // token        = state.push('container_' + name + '_close', 'div', -1);
          // token.markup = state.src.slice(start, pos);
          // token.block  = true;

          // state.parentType = old_parent;
          // state.lineMax = old_line_max;
          state.line = nextLine + 1;

          if (callback && typeof callback === 'function') {
            callback.call(this);
          }

          return true;
        }

        md.block.ruler.before('fence', 'container_' + name, container, {
          alt: ['paragraph', 'reference', 'blockquote', 'list']
        });
        md.renderer.rules['container_' + name + '_open'] = render;
        // md.renderer.rules['container_' + name + '_close'] = render;
      };
    }, {}] }, {}, [1])(1);
});
