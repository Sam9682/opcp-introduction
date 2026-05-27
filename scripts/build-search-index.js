/**
 * Build script to generate search-index.json from HTML lesson pages.
 * Reads all lesson pages in skillhub/en/ and skillhub/fr/ directories,
 * extracts titles, headings (h2/h3), and body text (first 500 chars),
 * and outputs a JSON search index at skillhub/assets/search-index.json.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const skillhubDir = join(projectRoot, 'skillhub');

/**
 * Recursively find all HTML files in a directory.
 */
function findHtmlFiles(dir) {
  const results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Decode common HTML entities in text.
 */
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&times;/g, '×')
    .replace(/&#9776;/g, '☰')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/&icirc;/g, 'î')
    .replace(/&acirc;/g, 'â')
    .replace(/&euml;/g, 'ë')
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026");
}

/**
 * Extract the page title from HTML content.
 * Looks for <title> tag and strips the suffix " - ... - OPCP Skillhub".
 */
function extractTitle(html) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  if (!match) return '';
  // Return the full title text from the <title> tag, with entities decoded
  return decodeEntities(match[1].trim());
}

/**
 * Extract all h2 and h3 heading text from HTML content.
 */
function extractHeadings(html) {
  const headings = [];
  const regex = /<h[23][^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    // Strip any inner HTML tags from heading content and decode entities
    const text = decodeEntities(match[1].replace(/<[^>]+>/g, '').trim());
    if (text) {
      headings.push(text);
    }
  }
  return headings;
}

/**
 * Extract body text from the main content area, stripped of HTML tags.
 * Returns the first 500 characters.
 */
function extractBody(html) {
  // Extract content from <main> element
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return '';

  let content = mainMatch[1];

  // Remove script and style tags and their content
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Remove SVG elements (diagrams)
  content = content.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // Remove all HTML tags
  content = content.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  content = decodeEntities(content);

  // Collapse whitespace
  content = content.replace(/\s+/g, ' ').trim();

  // Return first 500 characters
  return content.substring(0, 500);
}

/**
 * Build a search index entry from an HTML file.
 */
function buildEntry(filePath) {
  const html = readFileSync(filePath, 'utf-8');
  const relativePath = relative(skillhubDir, filePath).replace(/\\/g, '/');

  // ID is the path without .html extension
  const id = relativePath.replace(/\.html$/, '');

  // Path is the relative URL path (with .html)
  const path = relativePath;

  const title = extractTitle(html);
  const headings = extractHeadings(html);
  const body = extractBody(html);

  return { id, title, headings, body, path };
}

// Main execution
const languages = ['en', 'fr'];
const searchIndex = [];

for (const lang of languages) {
  const langDir = join(skillhubDir, lang);
  const htmlFiles = findHtmlFiles(langDir);

  for (const filePath of htmlFiles) {
    // Skip glossary pages - they are reference, not lesson content
    const relativePath = relative(skillhubDir, filePath).replace(/\\/g, '/');
    if (relativePath.endsWith('glossary.html')) {
      continue;
    }

    const entry = buildEntry(filePath);
    searchIndex.push(entry);
  }
}

// Sort entries by id for consistent output
searchIndex.sort((a, b) => a.id.localeCompare(b.id));

// Write the search index
const outputPath = join(skillhubDir, 'assets', 'search-index.json');
writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), 'utf-8');

console.log(`Search index generated with ${searchIndex.length} entries at:`);
console.log(outputPath);
