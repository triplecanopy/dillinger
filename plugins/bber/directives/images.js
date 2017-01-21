
/*

@type: img
@usage: + image url "image.jpg" alt "My Image" caption "What a nice image"
@output: <figure><img src=" ... " alt=" ... " /></figure>

*/

var mdInline = require('../containers/inline-block')
var elemRe = /^image\s\w{3,}\s"["\w]+/
var attrRe = /(?:(url|alt|caption)\s["]([^"]+)["])/g
var seq = 0

module.exports = {
  plugin: mdInline,
  name: 'image',
  renderer: function(instance) {
    return {
      marker: '+',
      minMarkers: 1,
      validate: function(params) {
        return params.trim().match(elemRe)
      },
      render: function(tokens, idx) {
        seq += 1

        var id = '_' + Math.random().toString(36).substr(0, 5)
        var page = 'loi-' + seq + 1000 + '.xhtml'
        var attrs = { id: id, page: page, url: '', alt: '' }
        var escapeHtml = instance.utils.escapeHtml

        var matches
        while ((matches = attrRe.exec(tokens[idx].info.trim())) !== null) { attrs[matches[1]] = matches[2] }

        return '<div class="figure-sm">\
          <figure id="ref' + id + '">\
            <a href="' + page + '#' + id + '">\
              <img src="/_book/_images/' + escapeHtml(attrs.url) + '" alt="' + attrs.alt + '"/>\
            </a>\
          </figure>\
        </div>'
      }
    }
  }
}
