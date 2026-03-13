import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { imgAltQuality } from '../../src/rules/perceivable/img-alt-quality.js';
import { videoCaptionQuality } from '../../src/rules/perceivable/video-caption-quality.js';
import { linkNameQuality } from '../../src/rules/operable/link-name-quality.js';
import { focusVisibleContrast } from '../../src/rules/operable/focus-visible-contrast.js';
import { labelQuality } from '../../src/rules/understandable/label-quality.js';
import { langMismatch } from '../../src/rules/understandable/lang-mismatch.js';

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

// ── img-alt-quality ─────────────────────────────────────────────────

describe('img-alt-quality', () => {
  it('passes when image has meaningful alt text', async () => {
    await page.setContent('<img src="x.png" alt="A golden retriever playing in the park">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns on generic alt text "image"', async () => {
    await page.setContent('<img src="x.png" alt="image">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('generic');
  });

  it('warns on generic alt text "Bild"', async () => {
    await page.setContent('<img src="x.png" alt="Bild">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on file name alt text', async () => {
    await page.setContent('<img src="x.png" alt="IMG_1234.jpg">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('file name');
  });

  it('warns on file name with extension pattern', async () => {
    await page.setContent('<img src="x.png" alt="hero-banner.webp">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('file name');
  });

  it('warns on single character alt text', async () => {
    await page.setContent('<img src="x.png" alt="x">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('one character');
  });

  it('warns on very long alt text', async () => {
    const longAlt = 'A '.repeat(100);
    await page.setContent(`<img src="x.png" alt="${longAlt}">`);
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('very long');
  });

  it('skips decorative images (empty alt)', async () => {
    await page.setContent('<img src="x.png" alt="">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('skips images with role="presentation"', async () => {
    await page.setContent('<img src="x.png" alt="image" role="presentation">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('skips images without alt attribute', async () => {
    await page.setContent('<img src="x.png">');
    const results = await imgAltQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── link-name-quality ───────────────────────────────────────────────

describe('link-name-quality', () => {
  it('passes when link has descriptive text', async () => {
    await page.setContent('<a href="/privacy">Read our privacy policy</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns on "click here"', async () => {
    await page.setContent('<a href="/page">click here</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('generic');
  });

  it('warns on "hier klicken" (German)', async () => {
    await page.setContent('<a href="/page">hier klicken</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on "more"', async () => {
    await page.setContent('<a href="/page">more</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on "read more"', async () => {
    await page.setContent('<a href="/page">Read More</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on "weiterlesen" (German)', async () => {
    await page.setContent('<a href="/page">weiterlesen</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on single character link text', async () => {
    await page.setContent('<a href="/page">x</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('one character');
  });

  it('passes on single digit link text (pagination)', async () => {
    await page.setContent('<a href="/page/2">2</a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('skips links without accessible name', async () => {
    await page.setContent('<a href="/page"></a>');
    const results = await linkNameQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── label-quality ───────────────────────────────────────────────────

describe('label-quality', () => {
  it('passes when label is descriptive', async () => {
    await page.setContent('<label for="email">Email address</label><input id="email" type="text">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns on generic label "field"', async () => {
    await page.setContent('<input type="text" aria-label="field">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('generic');
  });

  it('warns on generic label "input"', async () => {
    await page.setContent('<input type="text" aria-label="input">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on generic label "Eingabe" (German)', async () => {
    await page.setContent('<input type="text" aria-label="Eingabe">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });

  it('warns on single character label', async () => {
    await page.setContent('<input type="text" aria-label="x">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('one character');
  });

  it('skips inputs without label', async () => {
    await page.setContent('<input type="text">');
    const results = await labelQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── lang-mismatch ───────────────────────────────────────────────────

describe('lang-mismatch', () => {
  it('passes when lang matches content', async () => {
    await page.setContent(`<html lang="en"><body>
      <p>The quick brown fox jumps over the lazy dog. This is a paragraph with enough English text
      to allow reliable language detection. We need at least fifty characters of meaningful content.</p>
    </body></html>`);
    const results = await langMismatch.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns when declared lang does not match content', async () => {
    await page.setContent(`<html lang="en"><body>
      <p>Dies ist ein deutscher Text mit genug Inhalt, um die Spracherkennung zuverlässig durchzuführen.
      Der schnelle braune Fuchs springt über den faulen Hund. Die Sprache der Seite sollte Deutsch sein,
      aber das lang-Attribut sagt Englisch. Das ist ein Problem für die Barrierefreiheit und Screenreader.</p>
    </body></html>`);
    const results = await langMismatch.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('de');
  });

  it('passes when not enough text for detection', async () => {
    await page.setContent('<html lang="en"><body><p>Hello</p></body></html>');
    const results = await langMismatch.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
    expect(results[0].message).toContain('Not enough text');
  });

  it('skips when no lang attribute', async () => {
    await page.setContent('<html><body><p>Some text</p></body></html>');
    const results = await langMismatch.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('detects German content correctly', async () => {
    await page.setContent(`<html lang="de"><body>
      <p>Dies ist ein umfangreicher deutscher Text mit vielen Wörtern und Sätzen,
      die eine zuverlässige Spracherkennung ermöglichen. Wir brauchen genügend
      Text, damit die Trigramm-Analyse korrekt funktioniert.</p>
    </body></html>`);
    const results = await langMismatch.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
    expect(results[0].message).toContain('matches');
  });
});

// ── focus-visible-contrast ──────────────────────────────────────────

describe('focus-visible-contrast', () => {
  it('passes when outline has sufficient contrast', async () => {
    await page.setContent(`
      <style>button { outline: 2px solid #000000 !important; background-color: #ffffff; }</style>
      <button>Click me</button>
    `);
    const results = await focusVisibleContrast.run(createRuleContext(page));
    const btnResult = results.find((r) => r.element?.selector?.includes('button'));
    expect(btnResult?.type).toBe('pass');
  });

  it('warns on transparent outline', async () => {
    await page.setContent(`
      <style>button { outline: 2px solid transparent !important; background-color: #ffffff; }</style>
      <button>Click me</button>
    `);
    const results = await focusVisibleContrast.run(createRuleContext(page));
    const btnResult = results.find((r) => r.element?.selector?.includes('button'));
    expect(btnResult?.type).toBe('warning');
    expect(btnResult?.message).toContain('transparent');
  });

  it('warns on low-contrast outline', async () => {
    await page.setContent(`
      <style>button { outline: 2px solid #f0f0f0 !important; background-color: #ffffff !important; }</style>
      <button>Click me</button>
    `);
    const results = await focusVisibleContrast.run(createRuleContext(page));
    const btnResult = results.find((r) => r.element?.selector?.includes('button'));
    expect(btnResult?.type).toBe('warning');
    expect(btnResult?.message).toContain('contrast ratio');
  });
});

// ── video-caption-quality ───────────────────────────────────────────

describe('video-caption-quality', () => {
  it('warns when caption track has empty src', async () => {
    await page.setContent(`
      <video>
        <track kind="captions" src="">
      </video>
    `);
    const results = await videoCaptionQuality.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
    expect(results[0].message).toContain('empty src');
  });

  it('skips videos without caption tracks', async () => {
    await page.setContent('<video src="video.mp4"></video>');
    const results = await videoCaptionQuality.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});
