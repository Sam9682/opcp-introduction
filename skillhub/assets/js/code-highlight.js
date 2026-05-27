/**
 * SkillHub — Code Block Manager
 *
 * Enhances <pre><code> blocks with CSS-based syntax highlighting,
 * copy-to-clipboard buttons, language labels, and line numbers.
 * Shared via the window.SkillHub namespace (no build tools).
 * Also exports functions for testing.
 */

var KEYWORDS = [
  'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
  'return', 'import', 'export', 'class', 'new', 'this', 'try', 'catch',
  'throw', 'async', 'await', 'switch', 'case', 'break', 'continue',
  'default', 'do', 'in', 'of', 'typeof', 'instanceof', 'void', 'delete',
  'yield', 'from', 'extends', 'super', 'static', 'true', 'false', 'null',
  'undefined', 'with', 'finally', 'debugger'
];

/**
 * Tokenizes source code into typed tokens.
 * @param {string} code - Source code string
 * @returns {Array<{type: string, value: string}>}
 */
export function tokenize(code) {
  var tokens = [];
  var i = 0;
  while (i < code.length) {
    // Multi-line comments
    if (code[i] === '/' && code[i + 1] === '*') {
      var end = code.indexOf('*/', i + 2);
      var closeIdx = end === -1 ? code.length : end + 2;
      tokens.push({ type: 'comment', value: code.slice(i, closeIdx) });
      i = closeIdx;
      continue;
    }
    // Single-line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      var lineEnd = code.indexOf('\n', i);
      var commentEnd = lineEnd === -1 ? code.length : lineEnd;
      tokens.push({ type: 'comment', value: code.slice(i, commentEnd) });
      i = commentEnd;
      continue;
    }
    // Template literals
    if (code[i] === '`') {
      var j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '`') { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Strings
    if (code[i] === '"' || code[i] === "'") {
      var quote = code[i];
      var k = i + 1;
      while (k < code.length) {
        if (code[k] === '\\') { k += 2; continue; }
        if (code[k] === quote) { k++; break; }
        if (code[k] === '\n') { break; }
        k++;
      }
      tokens.push({ type: 'string', value: code.slice(i, k) });
      i = k;
      continue;
    }
    // Numbers
    if (/[0-9]/.test(code[i])) {
      var n = i;
      while (n < code.length && /[0-9.]/.test(code[n])) { n++; }
      tokens.push({ type: 'number', value: code.slice(i, n) });
      i = n;
      continue;
    }
    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      var m = i;
      while (m < code.length && /[a-zA-Z0-9_$]/.test(code[m])) { m++; }
      var word = code.slice(i, m);
      tokens.push({ type: KEYWORDS.indexOf(word) !== -1 ? 'keyword' : 'text', value: word });
      i = m;
      continue;
    }
    // Other characters
    tokens.push({ type: 'text', value: code[i] });
    i++;
  }
  return tokens;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Converts tokens to HTML with syntax highlighting spans.
 * @param {Array<{type: string, value: string}>} tokens
 * @returns {string}
 */
export function tokensToHtml(tokens) {
  var html = '';
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    var escaped = escapeHtml(t.value);
    if (t.type === 'text') {
      html += escaped;
    } else {
      html += '<span class="code-' + t.type + '">' + escaped + '</span>';
    }
  }
  return html;
}

/**
 * Highlights a code block element by tokenizing and replacing innerHTML.
 * @param {object|null} block - DOM element or mock with textContent/innerHTML
 */
export function highlightBlock(block) {
  if (!block) { return; }
  var code = block.textContent;
  if (!code) { block.innerHTML = ''; return; }
  var tokens = tokenize(code);
  block.innerHTML = tokensToHtml(tokens);
}

/**
 * Copies text from a code block to clipboard.
 * @param {object|null} block - DOM element or mock with textContent
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(block) {
  if (!block) { return false; }
  var text = block.textContent || '';

  // Try Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) { /* fall through to fallback */ }
  }

  // Fallback: execCommand
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (e) { return false; }
  }

  return false;
}

/**
 * Initializes code blocks on the page (no-op without DOM).
 */
export function init() {
  if (typeof document === 'undefined') { return; }
  initializeCodeBlocks();
}

// ============================================================
// Browser-specific code block initialization
// ============================================================

function extractLanguage(className) {
  if (!className) { return null; }
  var match = className.match(/(?:language|lang)-(\w+)/);
  return match ? match[1].toLowerCase() : null;
}

function countLines(text) {
  if (!text) { return 0; }
  var lines = text.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') { return lines.length - 1; }
  return lines.length;
}

// Language-specific highlighting rules for browser use
var PYTHON_RULES = [
  { pattern: /(#[^\n]*)/g, className: 'token-comment' },
  { pattern: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, className: 'token-string' },
  { pattern: /(@\w+)/g, className: 'token-decorator' },
  { pattern: /\b(self)\b/g, className: 'token-self' },
  { pattern: /\b(def|class|import|from|if|elif|else|return|for|while|try|except|finally|with|as|raise|pass|break|continue|and|or|not|in|is|lambda|yield|global|nonlocal|assert|del|async|await)\b/g, className: 'token-keyword' },
  { pattern: /\b(True|False|None)\b/g, className: 'token-boolean' },
  { pattern: /\b(print|len|range|int|str|float|list|dict|set|tuple|type|isinstance|open|super|property|staticmethod|classmethod|enumerate|zip|map|filter|sorted|reversed|any|all|min|max|sum|abs|round|input|format|hasattr|getattr|setattr)\b/g, className: 'token-builtin' },
  { pattern: /\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, className: 'token-number' }
];

var BASH_RULES = [
  { pattern: /(#[^\n]*)/g, className: 'token-comment' },
  { pattern: /("(?:\\.|[^"\\])*"|'[^']*')/g, className: 'token-string' },
  { pattern: /(\$\{?\w+\}?)/g, className: 'token-env' },
  { pattern: /(--[\w][\w-]*|-[a-zA-Z])\b/g, className: 'token-flag' },
  { pattern: /([|]|>{1,2}|<)/g, className: 'token-redirect' },
  { pattern: /\b(sudo|cd|ls|cat|echo|grep|awk|sed|curl|wget|pip|python|python3|export|source|chmod|chown|mkdir|rm|cp|mv|ssh|scp|docker|git|npm|apt|yum|dnf|systemctl|openstack|terraform|ansible)\b/g, className: 'token-command' },
  { pattern: /\b(\d+\.?\d*)\b/g, className: 'token-number' }
];

var JSON_RULES = [
  { pattern: /("(?:\\.|[^"\\])*")(\s*:)/g, className: 'token-key', groupReplace: true },
  { pattern: /:\s*("(?:\\.|[^"\\])*")/g, className: 'token-string', groupIndex: 1 },
  { pattern: /\b(true|false)\b/g, className: 'token-boolean' },
  { pattern: /\b(null)\b/g, className: 'token-boolean' },
  { pattern: /\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/g, className: 'token-number' }
];

var LANGUAGE_RULES = {
  python: PYTHON_RULES,
  bash: BASH_RULES,
  sh: BASH_RULES,
  shell: BASH_RULES,
  json: JSON_RULES
};

function highlightSyntaxAdvanced(element, language) {
  var rules = LANGUAGE_RULES[language];
  if (!rules) { return; }
  var pre = element.parentElement;
  if (pre && pre.tagName === 'PRE') { pre.classList.add('lang-' + language); }
  var code = element.textContent;
  var escaped = escapeHtml(code);
  var tokens = [];
  for (var r = 0; r < rules.length; r++) {
    var rule = rules[r];
    rule.pattern.lastIndex = 0;
    var match;
    while ((match = rule.pattern.exec(escaped)) !== null) {
      var matchText, matchStart;
      if (rule.groupReplace) { matchText = match[1]; matchStart = match.index; }
      else if (rule.groupIndex) { matchText = match[rule.groupIndex]; matchStart = match.index + match[0].indexOf(match[rule.groupIndex]); }
      else { matchText = match[1] || match[0]; matchStart = match.index + match[0].indexOf(matchText); }
      var matchEnd = matchStart + matchText.length;
      var overlaps = false;
      for (var t = 0; t < tokens.length; t++) {
        if (matchStart < tokens[t].end && matchEnd > tokens[t].start) { overlaps = true; break; }
      }
      if (!overlaps) { tokens.push({ start: matchStart, end: matchEnd, text: matchText, className: rule.className }); }
    }
  }
  tokens.sort(function (a, b) { return b.start - a.start; });
  var result = escaped;
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i];
    result = result.substring(0, tok.start) + '<span class="' + tok.className + '">' + tok.text + '</span>' + result.substring(tok.end);
  }
  element.innerHTML = result;
}

function browserCopyToClipboard(codeBlockId) {
  var element = document.getElementById(codeBlockId);
  if (!element) { return; }
  var text = element.textContent;
  var wrapper = element.closest('.code-block-wrapper');
  var button = wrapper ? wrapper.querySelector('.copy-btn') : null;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      if (button) {
        var orig = button.textContent;
        button.textContent = '\u2713 Copied!'; button.classList.add('copied');
        setTimeout(function () { button.textContent = orig; button.classList.remove('copied'); }, 2000);
      }
    }).catch(function () { fallbackSelect(element, button); });
  } else { fallbackSelect(element, button); }
}

function fallbackSelect(element, button) {
  var sel = window.getSelection(); var range = document.createRange();
  range.selectNodeContents(element); sel.removeAllRanges(); sel.addRange(range);
  if (button) {
    var orig = button.textContent;
    button.textContent = 'Select + Ctrl+C'; button.classList.add('copied');
    setTimeout(function () { button.textContent = orig; button.classList.remove('copied'); }, 2000);
  }
}

var codeBlockCounter = 0;

function initializeCodeBlocks() {
  if (typeof document === 'undefined') { return; }
  var codeBlocks = document.querySelectorAll('pre > code');
  for (var i = 0; i < codeBlocks.length; i++) {
    var codeEl = codeBlocks[i]; var preEl = codeEl.parentElement;
    if (preEl.hasAttribute('data-highlighted')) { continue; }
    preEl.setAttribute('data-highlighted', 'true');
    if (!codeEl.id) { codeEl.id = 'code-block-' + codeBlockCounter++; }
    var language = extractLanguage(codeEl.className);
    if (language) { highlightSyntaxAdvanced(codeEl, language); }
    var wrapper = document.createElement('div'); wrapper.className = 'code-block-wrapper';
    preEl.parentNode.insertBefore(wrapper, preEl); wrapper.appendChild(preEl);
    if (language) {
      var label = document.createElement('span'); label.className = 'code-lang-label';
      label.textContent = language; wrapper.insertBefore(label, preEl);
    }
    var copyBtn = document.createElement('button'); copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy'; copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.setAttribute('type', 'button');
    var blockId = codeEl.id;
    copyBtn.addEventListener('click', (function (id) { return function () { browserCopyToClipboard(id); }; })(blockId));
    wrapper.appendChild(copyBtn);
    if (countLines(codeEl.textContent) > 5) { addLineNumbers(codeEl); }
  }
}

function addLineNumbers(codeEl) {
  codeEl.classList.add('line-numbers');
  var html = codeEl.innerHTML; var lines = html.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') { lines.pop(); }
  var numbered = '';
  for (var i = 0; i < lines.length; i++) { numbered += '<span class="line">' + lines[i] + '</span>\n'; }
  codeEl.innerHTML = numbered;
}

// Browser global namespace
if (typeof window !== 'undefined') {
  window.SkillHub = window.SkillHub || {};
  window.SkillHub.codeHighlight = {
    initializeCodeBlocks: initializeCodeBlocks,
    copyToClipboard: browserCopyToClipboard,
    highlightSyntax: highlightSyntaxAdvanced
  };
}
