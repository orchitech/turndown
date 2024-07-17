import GfmEscape from 'gfm-escape';


const gfmEscaper = new GfmEscape();
export function escapeGfm (content) {
  return gfmEscaper.escape(content);
}

var ESCAPE_PATTERNS = {
  before: /([\\*`[\]_]|(?:^[-+>=])|(?:^~~~)|(?:^#{1-6}))/,
  after: /((?:^\s*\d+)(?=\.))/
}
var escapePattern = new RegExp(
  '(?:' + ESCAPE_PATTERNS.before.source + '|' + ESCAPE_PATTERNS.after.source + ')',
  'gm'
)

export function escapeSingle (content) {
  return content.replace(escapePattern, '$2\\$1')
}
escapeSingle.description = 'single pattern with non-capturing groups and look-ahead'

var MARKDOWN_ESCAPES = [
  [/\\/g, '\\\\'],
  [/\*/g, '\\*'],
  [/^-/gm, '\\-'],
  [/^\+ /gm, '\\+ '],
  [/^(=+)/gm, '\\$1'],
  [/^(#{1,6}) /gm, '\\$1 '],
  [/`/g, '\\`'],
  [/^~~~/gm, '\\~~~'],
  [/\[/g, '\\['],
  [/\]/g, '\\]'],
  [/^>/gm, '\\>'],
  [/_/g, '\\_'],
  [/^(\s*\d+)\. /gm, '$1\\. ']
]

export function escapeMulti (string) {
  return MARKDOWN_ESCAPES.reduce(function (accumulator, escape) {
    return accumulator.replace(escape[0], escape[1])
  }, string)
}
escapeMulti.description = 'one pattern per escaped control sequence (fixed turndown.js)'

const SMART_PATTERNS = [
  /(?=[\\*`[\]_])/,
  /^(?=-|\+|=+|#{1,6}|~~~|>)/,
  /(?<=^\s*\d+)(?=\.)/
]
var smartPatter = new RegExp(
  '(?:' + SMART_PATTERNS.map(i => i.source).join('|') + ')',
  'gm'
)

export function escapeSmart (content) {
  return content.replace(smartPatter, '\\')
}
escapeSmart.description = 'one pattern with look-ahead and look-behind and no capturing group'

const REPLACER_PATTERNS = [
  /([\\*`[\]_])/,
  /^(-|\+|=+|#{1,6}|~~~|>)/,
  /^(\s*\d+)\./
]
var replacerPatter = new RegExp(
  '(' + REPLACER_PATTERNS.map(i => i.source).join('|') + ')',
  'gm'
)

export function escapeReplacer (content) {
  return content.replace(replacerPatter, function (match, drop, before, before2, item) {
    if (before) {
      return '\\' + before;
    } else if (before2) {
      return '\\' + before2;
    } else {
      return item + '\\.';
    }
  })
}
escapeReplacer.description = 'one pattern composed of limited number of "optimized" patterns and replacer function'

const CRUDE_PATTERNS = [
  /[\\*`[\]_]/g,
  /^(?:-|\+|=+|#{1,6}|~~~|>)/gm,
  /^(\s*\d+)\./gm
]

export function escapeCrude (content) {
  let result = content.replace(CRUDE_PATTERNS[0], '\\$&')
  result = result.replace(CRUDE_PATTERNS[1], '\\$&')
  return result.replace(CRUDE_PATTERNS[2], '$1\\.')
}
escapeCrude.description = 'limited number of "optimized" patterns run separately (big-O should stay the same)'

const NAMED_PATTERNS = [
  /(?<suffix>[\\*`[\]_]|^(?:-|\+|=+|#{1,6}|~~~|>))/g,
  /(?<prefix>^(\s*\d+)(?=\.))/gm
]
const namedPattern = new RegExp('(' + NAMED_PATTERNS.map(it => it.source).join('|') + ')', 'gm')

export function escapeNamed (content) {
  return content.replace(namedPattern, '$<prefix>\\$<suffix>')
}

escapeNamed.description = 'single pattern with named capturing groups and no non-capturing groups'
