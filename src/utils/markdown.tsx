/**
 * Shared markdown renderer for Coach chat, Agent summary, and Portfolio Review.
 * Handles: **bold**, inline numbered lists (1. 2. 3.), blank-line paragraphs,
 * and strips em/en dashes from GPT output.
 */
import React from 'react';

function inlineHtml(text: string): string {
  return text
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Splits inline numbered lists like "1. Foo: bar 2. Baz: qux" into proper items.
 * Returns the items array if the block looks like an inline list, otherwise null.
 */
function splitInlineList(block: string): string[] | null {
  // Must have at least "1. " and "2. "
  if (!/\b1\.\s/.test(block) || !/\b2\.\s/.test(block)) return null;
  const items = block.split(/(?=\b\d+\.\s)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  return items.length >= 2 ? items : null;
}

export function renderMarkdown(text: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  const blocks = text.split(/\n\n+/);

  blocks.forEach((raw, bi) => {
    const block = raw.trim();
    if (!block) return;

    // Newline-separated numbered list
    if (/^\d+\.\s/.test(block) && block.includes('\n')) {
      const items = block.split('\n').filter(Boolean);
      elements.push(
        <ol key={bi} className="list-decimal list-inside space-y-1 mb-2 text-sm leading-relaxed">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: inlineHtml(item.replace(/^\d+\.\s*/, '')) }} />
          ))}
        </ol>
      );
      return;
    }

    // Inline numbered list (GPT often puts "1. Foo 2. Bar" in one paragraph)
    const inlineItems = splitInlineList(block);
    if (inlineItems) {
      elements.push(
        <ol key={bi} className="list-decimal list-inside space-y-1.5 mb-2 text-sm leading-relaxed">
          {inlineItems.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
          ))}
        </ol>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={bi} className="text-sm leading-relaxed mb-1"
         dangerouslySetInnerHTML={{ __html: inlineHtml(block) }} />
    );
  });

  return elements;
}
