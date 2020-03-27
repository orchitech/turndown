import { isBlock, isVoid, hasVoid } from './utilities'

export default function Node (node, options) {
  node.isBlock = isBlock(node)
  node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode
  node.isBlank = isBlank(node)
  node.flankingWhitespace = flankingWhitespace(node, options)
  return node
}

function isBlank (node) {
  return (
    ['A', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IFRAME', 'SCRIPT', 'AUDIO', 'VIDEO'].indexOf(node.nodeName) === -1 &&
    /^\s*$/i.test(node.textContent) &&
    !isVoid(node) &&
    !hasVoid(node)
  )
}

function flankingWhitespace (node, options) {
  var leading = ''
  var trailing = ''

  if (!node.isBlock && !(node.isCode && options.preformattedCode)) {
    var edges = node.textContent.match(/^(\s*)[\s\S]*?(\s*)$/)
    if (!edges) {
      console.log(node)
      console.log('textContent: \'' + node.textContent + '\'')
      console.log(new Error().stack)
    }
    var blankWithSpaces = node.isBlank && edges[1] && edges[2]

    if (edges[1] && !isFlankedByWhitespace('left', node, options)) {
      leading = edges[1]
    }

    if (!blankWithSpaces && edges[2] && !isFlankedByWhitespace('right', node, options)) {
      trailing = edges[2]
    }
  }

  return { leading: leading, trailing: trailing }
}

function isFlankedByWhitespace (side, node, options) {
  var sibling
  var regExp
  var isFlanked

  if (side === 'left') {
    sibling = node.previousSibling
    regExp = / $/
  } else {
    sibling = node.nextSibling
    regExp = /^ /
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue)
    } else if (sibling.nodeName === 'CODE' && options.preformattedCode) {
      isFlanked = false
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}
