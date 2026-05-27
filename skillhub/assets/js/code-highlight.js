// OPCP Introduction Skillhub - Code Syntax Highlighting
// Handles code block highlighting and copy-to-clipboard

/**
 * List of JavaScript/general keywords to highlight.
 */
const KEYWORDS = [
  'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
  'return', 'import', 'export', 'class', 'new', 'this', 'try', 'catch',
  'throw', 'async', 'await', 'switch', 'case', 'break', 'continue',
  'default', 'do', 'in', 'of', 'typeof', 'instanceof', 'void', 'delete',
  'yield', 'from', 'extends', 'super', 'static', 'true', 'false', 'null',
  'undefined', 'with', 'finally', 'debugger'
];

/**
 * Tokenizes source code into typed segments for highlighting.
 * Token types: keyword, string, comment, number, text
 * @param {string} code - Raw source code text
 * @returns {Array<{type: string, value: string}>} - Array of tokens
 */
export function tokenize(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    // Multi-line comments: /* ... */
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const closeIdx = end === -1 ? code.length : end + 2;
      tokens.push({ type: 'comment', value: code.slice(i, closeIdx) });
      i = closeIdx;
      continue;
    }

    // Single-line comments: // ...
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const closeIdx = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', value: code.slice(i, closeIdx) });
      i = closeIdx;
      continue;
    }

    // Template literals: `...`
    if (code[i] === '`') {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === '`') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Strings: single or double quoted
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j++;
          break;
        }
        if (code[j] === '\n') {
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers: integer and decimal literals
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && i + 1 < code.length && /[0-9]/.test(code[i + 1]))) {
      let j = i;
      // Check for hex
      if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F]/.test(code[j])) {
          j++;
        }
      } else {
        while (j < code.length && /[0-9]/.test(code[j])) {
          j++;
        }
        if (j < code.length && code[j] === '.') {
          j++;
          while (j < code.length && /[0-9]/.test(code[j])) {
            j++;
          }
        }
      }
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Words (potential keywords or identifiers)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);
      if (KEYWORDS.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      i = j;
      continue;
    }

    // Any other character (operators, punctuation, whitespace)
    tokens.push({ type: 'text', value: code[i] });
    i++;
  }

  return tokens;
}

/**
 * Escapes HTML special characters in a string.
 * @param {string} text - Raw text
 * @returns {string} - HTML-safe text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Converts tokens into highlighted HTML.
 * @param {Array<{type: string, value: string}>} tokens - Tokenized code
 * @returns {string} - HTML string with span elements for token types
 */
export function tokensToHtml(tokens) {
  return tokens.map((token) => {
    const escaped = escapeHtml(token.value);
    if (token.type === 'text') {
      return escaped;
    }
    return `<span class="code-${token.type}">${escaped}</span>`;
  }).join('');
}

/**
 * Highlights a specific code block element.
 * Tokenizes the text content and replaces innerHTML with highlighted HTML.
 * @param {HTMLElement} block - The <code> element inside a <pre>
 */
export function highlightBlock(block) {
  if (!block || !block.textContent) {
    return;
  }

  const code = block.textContent;
  const tokens = tokenize(code);
  const html = tokensToHtml(tokens);
  block.innerHTML = html;
}

/**
 * Copies code block content to clipboard.
 * Uses navigator.clipboard.writeText() with fallback to document.execCommand('copy').
 * @param {HTMLElement} block - The code block element
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(block) {
  if (!block) {
    return false;
  }

  const text = block.textContent || '';

  // Try modern Clipboard API first
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: document.execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        return true;
      }
    } catch {
      // Fall through to failure
    }
  }

  // Both methods failed
  return false;
}

/**
 * Shows a temporary notification message near a code block.
 * @param {HTMLElement} container - The container element (pre wrapper)
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(container, message, type, duration) {
  if (!container || typeof document === 'undefined') {
    return;
  }

  // Remove any existing notification in this container
  const existing = container.querySelector('.code-copy-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('span');
  notification.className = `code-copy-notification code-copy-notification--${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  container.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}

/**
 * Creates and attaches a "Copy" button to a code block container.
 * @param {HTMLElement} pre - The <pre> element wrapping the code block
 * @param {HTMLElement} codeEl - The <code> element inside the <pre>
 */
function addCopyButton(pre, codeEl) {
  if (!pre || !codeEl || typeof document === 'undefined') {
    return;
  }

  // Ensure the pre has relative positioning for button placement
  pre.style.position = 'relative';

  const button = document.createElement('button');
  button.className = 'code-copy-btn';
  button.textContent = 'Copy';
  button.type = 'button';
  button.setAttribute('aria-label', 'Copy code to clipboard');

  button.addEventListener('click', async () => {
    const success = await copyToClipboard(codeEl);
    if (success) {
      showNotification(pre, 'Copied!', 'success', 2000);
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    } else {
      showNotification(pre, 'Copy failed. Please select and copy manually.', 'error', 3000);
    }
  });

  pre.appendChild(button);
}

/**
 * Scans page for all <pre><code> elements and applies highlighting + copy buttons.
 */
export function init() {
  if (typeof document === 'undefined') {
    return;
  }

  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;

    // Apply syntax highlighting
    highlightBlock(codeEl);

    // Add copy button
    addCopyButton(pre, codeEl);
  });
}

const CodeHighlight = {
  init,
  highlightBlock,
  copyToClipboard
};

export default CodeHighlight;
