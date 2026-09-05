/** Copy rendered selections without the unrevealed or assistive-only text.
 * A document listener also handles selections starting outside a Typewriter. */
export function copyVisibleText(event: ClipboardEvent) {
  if (event.defaultPrevented || !event.clipboardData) return;
  const document = event.currentTarget as Document;
  const target = event.target as Element | null;
  if (target?.closest?.('input, textarea, [contenteditable="true"]')) return;
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return;
  const original = Array.from({ length: selection.rangeCount }, (_, i) =>
    selection.getRangeAt(i).cloneRange(),
  );
  let parts = original.map((range) => range.cloneRange());
  let changed = false;
  const compare = (a: Range, endA: boolean, b: Range, endB: boolean) => {
    const left = a.cloneRange();
    const right = b.cloneRange();
    left.collapse(!endA);
    right.collapse(!endB);
    return left.compareBoundaryPoints(0, right);
  };
  const exclude = (hidden: Range) => {
    if (hidden.collapsed) return;
    parts = parts.flatMap((part) => {
      if (compare(part, true, hidden, false) <= 0 || compare(part, false, hidden, true) >= 0)
        return [part];
      changed = true;
      const remaining: Range[] = [];
      if (compare(part, false, hidden, false) < 0) {
        const before = part.cloneRange();
        before.setEnd(hidden.startContainer, hidden.startOffset);
        remaining.push(before);
      }
      if (compare(part, true, hidden, true) > 0) {
        const after = part.cloneRange();
        after.setStart(hidden.endContainer, hidden.endOffset);
        remaining.push(after);
      }
      return remaining;
    });
  };
  for (const root of document.querySelectorAll('.fukidashi-typewriter')) {
    for (const element of root.querySelectorAll('.fukidashi-sr-only, .fukidashi-cursor')) {
      const range = document.createRange();
      range.selectNode(element);
      exclude(range);
    }
    const node = root.querySelector('.fukidashi-typewriter-visible')?.firstChild;
    if (root.getAttribute('data-reserve-space') === 'true' && node?.nodeType === 3) {
      const range = document.createRange();
      range.setStart(node, Number(root.getAttribute('data-visible-length')));
      range.setEnd(node, node.textContent!.length);
      exclude(range);
    }
  }
  if (!changed) return;
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  try {
    // Selection.toString preserves browser whitespace/block separators, unlike
    // Range.toString. Restore the user's selection synchronously, without DOM edits.
    const text = parts
      .map((part) => {
        selection.removeAllRanges();
        selection.addRange(part);
        return selection.toString();
      })
      .join('');
    event.clipboardData.clearData();
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
  } finally {
    selection.removeAllRanges();
    if (original.length === 1 && anchorNode && focusNode) {
      selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    } else {
      original.forEach((range) => selection.addRange(range));
    }
  }
}

const documents = new WeakMap<Document, number>();
export function observeCopy(document: Document) {
  const count = documents.get(document) ?? 0;
  if (!count) document.addEventListener('copy', copyVisibleText);
  documents.set(document, count + 1);
  return () => {
    const remaining = (documents.get(document) ?? 1) - 1;
    if (remaining) documents.set(document, remaining);
    else {
      documents.delete(document);
      document.removeEventListener('copy', copyVisibleText);
    }
  };
}
