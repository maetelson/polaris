/**
 * Shared utilities for the SVG → React component generators
 * (`build-icons`, `build-file-icons`, `build-logos`, `build-ribbon-icons`).
 */

/**
 * Rewrite every `id="..."` definition and corresponding reference
 * (`url(#...)` / `href="#..."` / `xlink:href="#..."`) in an SVG body
 * so they're scoped under `prefix__`.
 *
 * **Why:** Figma exports include sequential auto-named IDs like
 * `clip0_0_31035`, `Mask`, `Group_2`. When two icons render on the
 * same page, the browser resolves `url(#clip0_0_31035)` to whichever
 * definition appears first in the DOM — the second icon ends up
 * referencing the first icon's clipPath/mask, visibly breaking.
 *
 * Slug-prefixing makes IDs globally unique across icons. Two
 * instances of the *same* icon still share IDs but with identical
 * content, so they render correctly (browser uses first definition,
 * both have the same shape).
 *
 * **Sanitization:** Figma layer names can contain spaces, Korean
 * characters, and other tokens that aren't valid in URL fragments.
 * We sanitize each ID to `[A-Za-z0-9_-]` and de-duplicate via a
 * counter when sanitization causes collisions (e.g. `Path 6` and
 * `Path  6` both → `Path_6`).
 *
 * **What it covers:**
 *   - `id="X"` definitions
 *   - `url(#X)` (in attributes like `fill`, `stroke`, `mask`,
 *     `clip-path`, `filter`)
 *   - `href="#X"`, `xlink:href="#X"` (`<use>` references)
 *
 * Does NOT cover refs inside `style="..."` strings (e.g.
 * `style="fill:url(#gradient)"`). None of the current Figma exports
 * use that form — if a future export does, extend here.
 */
export function prefixSvgIds(inner: string, prefix: string): string {
  // Collect every id="X" declaration.
  const originalIds = new Set<string>();
  for (const m of inner.matchAll(/\bid="([^"]+)"/g)) {
    originalIds.add(m[1]);
  }
  if (originalIds.size === 0) return inner;

  // Build the original → prefixed mapping.
  const sanitize = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, '_');
  const used = new Set<string>();
  const remap = new Map<string, string>();
  let counter = 0;
  for (const id of originalIds) {
    let candidate = `${prefix}__${sanitize(id)}`;
    while (used.has(candidate)) candidate = `${prefix}__${sanitize(id)}_${++counter}`;
    used.add(candidate);
    remap.set(id, candidate);
  }

  // Apply rewrites. Iterate longest-first so e.g. `clip0_0_31035`
  // doesn't get partially-replaced if a shorter id `clip0` also exists.
  const sortedIds = [...remap.keys()].sort((a, b) => b.length - a.length);
  let out = inner;
  for (const orig of sortedIds) {
    const replaced = remap.get(orig)!;
    const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // `id="orig"`
    out = out.replace(new RegExp(`\\bid="${escaped}"`, 'g'), `id="${replaced}"`);
    // `url(#orig)`
    out = out.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${replaced})`);
    // `href="#orig"` / `xlink:href="#orig"`
    out = out.replace(
      new RegExp(`(\\b(?:xlink:)?href)="#${escaped}"`, 'g'),
      `$1="#${replaced}"`
    );
  }
  return out;
}
