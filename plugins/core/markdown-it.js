'use strict';

var
  mdImages = require('../bber/directives/images'),
  hljs = require('highlight.js'),
  md = require('markdown-it')({
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, str).value;
      } else {
        return str.value;
      }
    }
  });

md
  .use(require('markdown-it-toc'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-checkbox'))
  .use(mdImages.plugin, mdImages.name, mdImages.renderer(md))
  .use(require('markdown-it-front-matter'), function frontmatter(data) {
    console.log(data);
  });

md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
  var token = tokens[idx];
  token.attrPush(['class', 'table table-striped table-bordered']);

  return self.renderToken(tokens, idx, options);
};

exports.md = md
