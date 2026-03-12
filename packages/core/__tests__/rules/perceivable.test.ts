import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { imgAlt } from '../../src/rules/perceivable/img-alt.js';
import { colorContrast } from '../../src/rules/perceivable/color-contrast.js';
import { areaAlt } from '../../src/rules/perceivable/area-alt.js';
import { inputImageAlt } from '../../src/rules/perceivable/input-image-alt.js';
import { objectAlt } from '../../src/rules/perceivable/object-alt.js';
import { svgImgAlt } from '../../src/rules/perceivable/svg-img-alt.js';
import { videoCaption } from '../../src/rules/perceivable/video-caption.js';
import { metaViewport } from '../../src/rules/perceivable/meta-viewport.js';
import { headingOrder } from '../../src/rules/perceivable/heading-order.js';
import { listStructure } from '../../src/rules/perceivable/list-structure.js';
import { tdHeadersAttr } from '../../src/rules/perceivable/td-headers-attr.js';
import { autocompleteValid } from '../../src/rules/perceivable/autocomplete-valid.js';
import { meaningfulSequence } from '../../src/rules/perceivable/meaningful-sequence.js';
import { sensoryCharacteristics } from '../../src/rules/perceivable/sensory-characteristics.js';
import { imagesOfText } from '../../src/rules/perceivable/images-of-text.js';
import { reflow } from '../../src/rules/perceivable/reflow.js';
import { contentOnHoverFocus } from '../../src/rules/perceivable/content-on-hover-focus.js';
import { landmarkMain } from '../../src/rules/perceivable/landmark-main.js';
import { landmarkBannerTopLevel } from '../../src/rules/perceivable/landmark-banner-top-level.js';
import { landmarkContentinfoTopLevel } from '../../src/rules/perceivable/landmark-contentinfo-top-level.js';
import { landmarkComplementaryTopLevel } from '../../src/rules/perceivable/landmark-complementary-top-level.js';
import { landmarkUnique } from '../../src/rules/perceivable/landmark-unique.js';
import { pageHasHeadingOne } from '../../src/rules/perceivable/page-has-heading-one.js';
import { noAutoplayAudio } from '../../src/rules/perceivable/no-autoplay-audio.js';
import { scopeAttrValid } from '../../src/rules/perceivable/scope-attr-valid.js';
import { thHasDataCells } from '../../src/rules/perceivable/th-has-data-cells.js';
import { definitionList } from '../../src/rules/perceivable/definition-list.js';
import { dlitem } from '../../src/rules/perceivable/dlitem.js';
import { tableHasHeader } from '../../src/rules/perceivable/table-has-header.js';
import { tableDuplicateName } from '../../src/rules/perceivable/table-duplicate-name.js';
import { emptyHeading } from '../../src/rules/perceivable/empty-heading.js';
import { emptyTableHeader } from '../../src/rules/perceivable/empty-table-header.js';
import { imageRedundantAlt } from '../../src/rules/perceivable/image-redundant-alt.js';
import { landmarkNoDuplicateBanner } from '../../src/rules/perceivable/landmark-no-duplicate-banner.js';
import { landmarkNoDuplicateContentinfo } from '../../src/rules/perceivable/landmark-no-duplicate-contentinfo.js';
import { metaViewportLarge } from '../../src/rules/perceivable/meta-viewport-large.js';
import { region } from '../../src/rules/perceivable/region.js';
import { cssOrientationLock } from '../../src/rules/perceivable/css-orientation-lock.js';
import { hiddenContent } from '../../src/rules/perceivable/hidden-content.js';
import { pAsHeading } from '../../src/rules/perceivable/p-as-heading.js';
import { tableFakeCaption } from '../../src/rules/perceivable/table-fake-caption.js';
import { tdHasHeader } from '../../src/rules/perceivable/td-has-header.js';
import { linkInTextBlock } from '../../src/rules/perceivable/link-in-text-block.js';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  await page.close();
});

// ── img-alt ──────────────────────────────────────────────────────────

describe('img-alt', () => {
  it('passes when image has alt text', async () => {
    await page.setContent('<img src="x.png" alt="A photo">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when image has no alt', async () => {
    await page.setContent('<img src="x.png">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with aria-label', async () => {
    await page.setContent('<img src="x.png" aria-label="Photo">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with role="presentation"', async () => {
    await page.setContent('<img src="x.png" role="presentation">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with role="none"', async () => {
    await page.setContent('<img src="x.png" role="none">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with empty alt (decorative)', async () => {
    await page.setContent('<img src="x.png" alt="">');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('returns no results when no images', async () => {
    await page.setContent('<p>No images here</p>');
    const results = await imgAlt.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── color-contrast ───────────────────────────────────────────────────

describe('color-contrast', () => {
  it('passes with high contrast text', async () => {
    await page.setContent('<p style="color: #000; background-color: #fff;">Hello</p>');
    const results = await colorContrast.run(createRuleContext(page));
    const pResults = results.filter(r => r.ruleId === 'color-contrast');
    expect(pResults.some(r => r.type === 'pass')).toBe(true);
  });

  it('violates with low contrast text', async () => {
    await page.setContent('<p style="color: #777; background-color: #888;">Hello</p>');
    const results = await colorContrast.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('skips invisible elements', async () => {
    await page.setContent('<p style="display:none; color: #777; background-color: #888;">Hidden</p>');
    const results = await colorContrast.run(createRuleContext(page));
    expect(results.filter(r => r.type === 'violation')).toHaveLength(0);
  });
});

// ── area-alt ─────────────────────────────────────────────────────────

describe('area-alt', () => {
  it('passes when area has alt', async () => {
    await page.setContent(`
      <map name="test"><area href="#" alt="Region" shape="rect" coords="0,0,100,100"></map>
      <img src="x.png" usemap="#test" alt="map">
    `);
    const results = await areaAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when area lacks alt', async () => {
    await page.setContent(`
      <map name="test"><area href="#" shape="rect" coords="0,0,100,100"></map>
      <img src="x.png" usemap="#test" alt="map">
    `);
    const results = await areaAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with aria-label', async () => {
    await page.setContent(`
      <map name="test"><area href="#" aria-label="Region" shape="rect" coords="0,0,100,100"></map>
      <img src="x.png" usemap="#test" alt="map">
    `);
    const results = await areaAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── input-image-alt ──────────────────────────────────────────────────

describe('input-image-alt', () => {
  it('passes with alt text', async () => {
    await page.setContent('<input type="image" src="x.png" alt="Submit">');
    const results = await inputImageAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without alt', async () => {
    await page.setContent('<input type="image" src="x.png">');
    const results = await inputImageAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── object-alt ───────────────────────────────────────────────────────

describe('object-alt', () => {
  it('passes with aria-label', async () => {
    await page.setContent('<object data="x.swf" aria-label="Game"></object>');
    const results = await objectAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with inner text', async () => {
    await page.setContent('<object data="x.swf">Fallback text</object>');
    const results = await objectAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when empty', async () => {
    await page.setContent('<object data="x.swf"></object>');
    const results = await objectAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── svg-img-alt ──────────────────────────────────────────────────────

describe('svg-img-alt', () => {
  it('passes with aria-label', async () => {
    await page.setContent('<svg role="img" aria-label="Logo"></svg>');
    const results = await svgImgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with title element', async () => {
    await page.setContent('<svg role="img"><title>Logo</title></svg>');
    const results = await svgImgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without accessible name', async () => {
    await page.setContent('<svg role="img"></svg>');
    const results = await svgImgAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('ignores SVGs without role="img"', async () => {
    await page.setContent('<svg></svg>');
    const results = await svgImgAlt.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── video-caption ────────────────────────────────────────────────────

describe('video-caption', () => {
  it('passes with captions track', async () => {
    await page.setContent('<video><track kind="captions" src="c.vtt"></video>');
    const results = await videoCaption.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without captions', async () => {
    await page.setContent('<video src="v.mp4"></video>');
    const results = await videoCaption.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── meta-viewport ────────────────────────────────────────────────────

describe('meta-viewport', () => {
  it('passes with normal viewport', async () => {
    await page.setContent('<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>');
    const results = await metaViewport.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with user-scalable=no', async () => {
    await page.setContent('<html><head><meta name="viewport" content="user-scalable=no"></head><body></body></html>');
    const results = await metaViewport.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('violates with maximum-scale=1', async () => {
    await page.setContent('<html><head><meta name="viewport" content="maximum-scale=1"></head><body></body></html>');
    const results = await metaViewport.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── heading-order ────────────────────────────────────────────────────

describe('heading-order', () => {
  it('passes with sequential headings', async () => {
    await page.setContent('<h1>Title</h1><h2>Sub</h2><h3>Sub-sub</h3>');
    const results = await headingOrder.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates when skipping levels', async () => {
    await page.setContent('<h1>Title</h1><h3>Skipped</h3>');
    const results = await headingOrder.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('allows going back to higher level', async () => {
    await page.setContent('<h1>Title</h1><h2>Sub</h2><h1>Another</h1>');
    const results = await headingOrder.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });
});

// ── list-structure ───────────────────────────────────────────────────

describe('list-structure', () => {
  it('passes with valid list', async () => {
    await page.setContent('<ul><li>Item 1</li><li>Item 2</li></ul>');
    const results = await listStructure.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with invalid children', async () => {
    await page.setContent('<ul><div>Bad</div><li>OK</li></ul>');
    const results = await listStructure.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── td-headers-attr ──────────────────────────────────────────────────

describe('td-headers-attr', () => {
  it('passes with valid header references', async () => {
    await page.setContent(`
      <table>
        <tr><th id="h1">Name</th><th id="h2">Age</th></tr>
        <tr><td headers="h1">John</td><td headers="h2">30</td></tr>
      </table>
    `);
    const results = await tdHeadersAttr.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates with invalid header reference', async () => {
    await page.setContent(`
      <table>
        <tr><th id="h1">Name</th></tr>
        <tr><td headers="nonexistent">John</td></tr>
      </table>
    `);
    const results = await tdHeadersAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── autocomplete-valid ───────────────────────────────────────────────

describe('autocomplete-valid', () => {
  it('passes with valid autocomplete', async () => {
    await page.setContent('<input autocomplete="email">');
    const results = await autocompleteValid.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with invalid token', async () => {
    await page.setContent('<input autocomplete="foobar">');
    const results = await autocompleteValid.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with section- prefix', async () => {
    await page.setContent('<input autocomplete="section-billing street-address">');
    const results = await autocompleteValid.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with empty autocomplete', async () => {
    await page.setContent('<input autocomplete="">');
    const results = await autocompleteValid.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── meaningful-sequence ──────────────────────────────────────────────

describe('meaningful-sequence', () => {
  it('returns no warnings for normal flow', async () => {
    await page.setContent('<p>First</p><p>Second</p>');
    const results = await meaningfulSequence.run(createRuleContext(page));
    expect(results.filter(r => r.type === 'warning')).toHaveLength(0);
  });
});

// ── sensory-characteristics ──────────────────────────────────────────

describe('sensory-characteristics', () => {
  it('warns about sensory instructions', async () => {
    await page.setContent('<p>Click the round button to continue</p>');
    const results = await sensoryCharacteristics.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for non-sensory text', async () => {
    await page.setContent('<p>Click the Submit button to continue</p>');
    const results = await sensoryCharacteristics.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── images-of-text ───────────────────────────────────────────────────

describe('images-of-text', () => {
  it('warns about long alt text suggesting image of text', async () => {
    const longAlt = 'This is a very long alt text that exceeds fifty characters and suggests that this image contains text content';
    await page.setContent(`<img src="x.png" alt="${longAlt}">`);
    const results = await imagesOfText.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for short alt text', async () => {
    await page.setContent('<img src="x.png" alt="A cat">');
    const results = await imagesOfText.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('skips decorative images', async () => {
    await page.setContent('<img src="x.png" role="presentation">');
    const results = await imagesOfText.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── reflow ───────────────────────────────────────────────────────────

describe('reflow', () => {
  it('warns about fixed viewport width', async () => {
    await page.setContent('<html><head><meta name="viewport" content="width=1024"></head><body></body></html>');
    const results = await reflow.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning with device-width viewport', async () => {
    await page.setContent('<html><head><meta name="viewport" content="width=device-width"></head><body><p>OK</p></body></html>');
    const results = await reflow.run(createRuleContext(page));
    // Only viewport-related warnings, no fixed width
    const vpWarnings = results.filter(r => r.message.includes('fixed width'));
    expect(vpWarnings).toHaveLength(0);
  });
});

// ── content-on-hover-focus ───────────────────────────────────────────

describe('content-on-hover-focus', () => {
  it('warns about title on non-interactive element', async () => {
    await page.setContent('<span title="Tooltip text">Hover me</span>');
    const results = await contentOnHoverFocus.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('does not warn about title on interactive elements', async () => {
    await page.setContent('<a href="#" title="Go home">Home</a>');
    const results = await contentOnHoverFocus.run(createRuleContext(page));
    const titleWarnings = results.filter(r => r.message.includes('title attribute'));
    expect(titleWarnings).toHaveLength(0);
  });
});

// ── landmark-main ───────────────────────────────────────────────────

describe('landmark-main', () => {
  it('passes with one <main>', async () => {
    await page.setContent('<main>Content</main>');
    const results = await landmarkMain.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with no <main>', async () => {
    await page.setContent('<div>No main landmark</div>');
    const results = await landmarkMain.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('warns with multiple <main>', async () => {
    await page.setContent('<main>First</main><main>Second</main>');
    const results = await landmarkMain.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });
});

// ── landmark-banner-top-level ───────────────────────────────────────

describe('landmark-banner-top-level', () => {
  it('passes with <header> at top level', async () => {
    await page.setContent('<header>Site Header</header><main>Content</main>');
    const results = await landmarkBannerTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with <header> inside <article>', async () => {
    await page.setContent('<article><header>Article Header</header><p>Text</p></article>');
    const results = await landmarkBannerTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── landmark-contentinfo-top-level ──────────────────────────────────

describe('landmark-contentinfo-top-level', () => {
  it('passes with <footer> at top level', async () => {
    await page.setContent('<main>Content</main><footer>Site Footer</footer>');
    const results = await landmarkContentinfoTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with <footer> inside <section>', async () => {
    await page.setContent('<section><footer>Section Footer</footer></section>');
    const results = await landmarkContentinfoTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── landmark-complementary-top-level ────────────────────────────────

describe('landmark-complementary-top-level', () => {
  it('passes with <aside> at top level', async () => {
    await page.setContent('<main>Content</main><aside>Sidebar</aside>');
    const results = await landmarkComplementaryTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with <aside> inside <nav>', async () => {
    await page.setContent('<nav><aside>Nested aside</aside></nav>');
    const results = await landmarkComplementaryTopLevel.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── landmark-unique ─────────────────────────────────────────────────

describe('landmark-unique', () => {
  it('passes when landmarks have unique names', async () => {
    await page.setContent('<nav aria-label="Primary">Links</nav><nav aria-label="Footer">More</nav>');
    const results = await landmarkUnique.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates when duplicate landmarks lack unique names', async () => {
    await page.setContent('<nav>Links</nav><nav>More links</nav>');
    const results = await landmarkUnique.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── page-has-heading-one ────────────────────────────────────────────

describe('page-has-heading-one', () => {
  it('passes with h1', async () => {
    await page.setContent('<h1>Main Title</h1><p>Content</p>');
    const results = await pageHasHeadingOne.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without h1', async () => {
    await page.setContent('<h2>Subtitle</h2><p>Content</p>');
    const results = await pageHasHeadingOne.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── no-autoplay-audio ───────────────────────────────────────────────

describe('no-autoplay-audio', () => {
  it('passes without autoplay', async () => {
    await page.setContent('<audio src="sound.mp3"></audio>');
    const results = await noAutoplayAudio.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('violates with <audio autoplay>', async () => {
    await page.setContent('<audio autoplay src="sound.mp3"></audio>');
    const results = await noAutoplayAudio.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with <audio autoplay muted>', async () => {
    await page.setContent('<audio autoplay muted src="sound.mp3"></audio>');
    const results = await noAutoplayAudio.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── scope-attr-valid ────────────────────────────────────────────────

describe('scope-attr-valid', () => {
  it('passes with scope="col"', async () => {
    await page.setContent('<table><tr><th scope="col">Name</th></tr><tr><td>John</td></tr></table>');
    const results = await scopeAttrValid.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with scope="invalid"', async () => {
    await page.setContent('<table><tr><th scope="invalid">Name</th></tr><tr><td>John</td></tr></table>');
    const results = await scopeAttrValid.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── th-has-data-cells ───────────────────────────────────────────────

describe('th-has-data-cells', () => {
  it('passes when th has associated td', async () => {
    await page.setContent(`
      <table>
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>John</td><td>30</td></tr>
      </table>
    `);
    const results = await thHasDataCells.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates when th has no data cells', async () => {
    await page.setContent(`
      <table>
        <tr><th>Only Headers</th><th>No Data</th></tr>
      </table>
    `);
    const results = await thHasDataCells.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── definition-list ─────────────────────────────────────────────────

describe('definition-list', () => {
  it('passes with <dl><dt>...<dd>...', async () => {
    await page.setContent('<dl><dt>Term</dt><dd>Definition</dd></dl>');
    const results = await definitionList.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with <dl><span>...', async () => {
    await page.setContent('<dl><span>Invalid child</span></dl>');
    const results = await definitionList.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── dlitem ──────────────────────────────────────────────────────────

describe('dlitem', () => {
  it('passes when dt/dd inside dl', async () => {
    await page.setContent('<dl><dt>Term</dt><dd>Definition</dd></dl>');
    const results = await dlitem.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates when dt outside dl', async () => {
    await page.setContent('<div><dt>Orphaned term</dt></div>');
    const results = await dlitem.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── table-has-header ────────────────────────────────────────────────

describe('table-has-header', () => {
  it('passes with th', async () => {
    await page.setContent(`
      <table>
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>John</td><td>30</td></tr>
      </table>
    `);
    const results = await tableHasHeader.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without th in data table', async () => {
    await page.setContent(`
      <table>
        <tr><td>John</td><td>30</td></tr>
        <tr><td>Jane</td><td>25</td></tr>
      </table>
    `);
    const results = await tableHasHeader.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── table-duplicate-name ────────────────────────────────────────────

describe('table-duplicate-name', () => {
  it('passes when summary differs from caption', async () => {
    await page.setContent(`
      <table summary="Summary of data">
        <caption>Table Caption</caption>
        <tr><th>Name</th></tr>
        <tr><td>John</td></tr>
      </table>
    `);
    const results = await tableDuplicateName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when summary and caption are identical', async () => {
    await page.setContent(`
      <table summary="User Data">
        <caption>User Data</caption>
        <tr><th>Name</th></tr>
        <tr><td>John</td></tr>
      </table>
    `);
    const results = await tableDuplicateName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── empty-heading ────────────────────────────────────────────────────

describe('empty-heading', () => {
  it('passes with text content', async () => {
    await page.setContent('<h1>Title</h1>');
    const results = await emptyHeading.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with empty heading', async () => {
    await page.setContent('<h1></h1>');
    const results = await emptyHeading.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── empty-table-header ───────────────────────────────────────────────

describe('empty-table-header', () => {
  it('passes with text content', async () => {
    await page.setContent('<table><tr><th>Header</th></tr></table>');
    const results = await emptyTableHeader.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with empty th', async () => {
    await page.setContent('<table><tr><th></th></tr></table>');
    const results = await emptyTableHeader.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── image-redundant-alt ──────────────────────────────────────────────

describe('image-redundant-alt', () => {
  it('passes when alt differs from surrounding text', async () => {
    await page.setContent('<a href="#"><img src="logo.png" alt="logo"> Home</a>');
    const results = await imageRedundantAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when alt duplicates surrounding text', async () => {
    await page.setContent('<a href="#"><img src="home.png" alt="Home"> Home</a>');
    const results = await imageRedundantAlt.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── landmark-no-duplicate-banner ─────────────────────────────────────

describe('landmark-no-duplicate-banner', () => {
  it('passes with one header', async () => {
    await page.setContent('<header>Site Header</header><main>Content</main>');
    const results = await landmarkNoDuplicateBanner.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with two top-level headers', async () => {
    await page.setContent('<header>First</header><header>Second</header><main>Content</main>');
    const results = await landmarkNoDuplicateBanner.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── landmark-no-duplicate-contentinfo ────────────────────────────────

describe('landmark-no-duplicate-contentinfo', () => {
  it('passes with one footer', async () => {
    await page.setContent('<main>Content</main><footer>Site Footer</footer>');
    const results = await landmarkNoDuplicateContentinfo.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with two top-level footers', async () => {
    await page.setContent('<footer>First</footer><footer>Second</footer>');
    const results = await landmarkNoDuplicateContentinfo.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── meta-viewport-large ──────────────────────────────────────────────

describe('meta-viewport-large', () => {
  it('passes without max-scale restriction', async () => {
    await page.setContent('<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>');
    const results = await metaViewportLarge.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with maximum-scale=2', async () => {
    await page.setContent('<html><head><meta name="viewport" content="width=device-width, maximum-scale=2"></head><body></body></html>');
    const results = await metaViewportLarge.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── region ───────────────────────────────────────────────────────────

describe('region', () => {
  it('passes when content is inside landmark', async () => {
    await page.setContent('<main>Content here</main>');
    const results = await region.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when orphan div is direct child of body', async () => {
    await page.setContent('<div>Orphan content</div>');
    const results = await region.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── css-orientation-lock ─────────────────────────────────────────────

describe('css-orientation-lock', () => {
  it('returns no results without orientation CSS', async () => {
    await page.setContent('<p>Normal content</p>');
    const results = await cssOrientationLock.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('violates with orientation media query containing display:none', async () => {
    await page.setContent('<style>@media (orientation: portrait) { .content { display: none } }</style><div class="content">Text</div>');
    const results = await cssOrientationLock.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── hidden-content ───────────────────────────────────────────────────

describe('hidden-content', () => {
  it('reports incomplete for hidden content with text', async () => {
    await page.setContent('<div style="display:none">Important text</div>');
    const results = await hiddenContent.run(createRuleContext(page));
    expect(results.some(r => r.type === 'incomplete')).toBe(true);
  });

  it('returns no results for empty hidden element', async () => {
    await page.setContent('<div style="display:none"></div>');
    const results = await hiddenContent.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── p-as-heading ─────────────────────────────────────────────────────

describe('p-as-heading', () => {
  it('no results for normal paragraph', async () => {
    await page.setContent('<p>Normal paragraph text that is long enough to not be a heading</p>');
    const results = await pAsHeading.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('violates with styled paragraph that looks like a heading', async () => {
    await page.setContent('<p style="font-size:32px;font-weight:bold">Title</p>');
    const results = await pAsHeading.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── table-fake-caption ───────────────────────────────────────────────

describe('table-fake-caption', () => {
  it('no results for table with proper caption', async () => {
    await page.setContent(`
      <table>
        <caption>My Table</caption>
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>John</td><td>30</td></tr>
      </table>
    `);
    const results = await tableFakeCaption.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('violates when first row has single cell spanning all columns', async () => {
    await page.setContent(`
      <table>
        <tr><td colspan="3">Table Title</td></tr>
        <tr><td>A</td><td>B</td><td>C</td></tr>
        <tr><td>1</td><td>2</td><td>3</td></tr>
      </table>
    `);
    const results = await tableFakeCaption.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── td-has-header ────────────────────────────────────────────────────

describe('td-has-header (large table)', () => {
  it('passes when large table has th elements', async () => {
    await page.setContent(`
      <table>
        <tr><th>Name</th><th>Age</th><th>City</th></tr>
        <tr><td>John</td><td>30</td><td>NYC</td></tr>
        <tr><td>Jane</td><td>25</td><td>LA</td></tr>
      </table>
    `);
    const results = await tdHasHeader.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates when 3x3 table has no headers', async () => {
    await page.setContent(`
      <table>
        <tr><td>A</td><td>B</td><td>C</td></tr>
        <tr><td>D</td><td>E</td><td>F</td></tr>
        <tr><td>G</td><td>H</td><td>I</td></tr>
      </table>
    `);
    const results = await tdHasHeader.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── link-in-text-block ───────────────────────────────────────────────

describe('link-in-text-block', () => {
  it('passes with underlined link in paragraph', async () => {
    await page.setContent('<p>Some text with <a href="#">a link</a> inside.</p>');
    const results = await linkInTextBlock.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with non-underlined link in paragraph', async () => {
    await page.setContent('<p>Some text with <a href="#" style="text-decoration:none;border:none;font-weight:normal;outline:none">a link</a> inside.</p>');
    const results = await linkInTextBlock.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});
