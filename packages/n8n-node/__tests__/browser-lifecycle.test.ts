import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WcagCheck } from '../src/index.js';

const pageClose = vi.fn(async () => undefined);
const setContent = vi.fn(async () => undefined);
const newPage = vi.fn(async () => ({
  setContent,
  close: pageClose,
}));
const browserClose = vi.fn(async () => undefined);
const launch = vi.fn(async () => ({
  newPage,
  close: browserClose,
}));
const check = vi.fn(async () => ({ ok: true }));

vi.mock('playwright', () => ({
  chromium: { launch },
}));

vi.mock('@speca11y/core', () => ({
  check,
}));

describe('WcagCheck browser lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reuses one browser while isolating each input item on its own page', async () => {
    const node = new WcagCheck();
    const parameters = [
      { operation: 'checkHtml', html: '<main>first</main>', level: 'AA', includePasses: false, disableRules: '', enableSemantic: false },
      { operation: 'checkHtml', html: '<main>second</main>', level: 'AA', includePasses: false, disableRules: '', enableSemantic: false },
    ];
    const context = {
      getInputData: () => [{ json: {} }, { json: {} }],
      getNodeParameter: (name: string, itemIndex: number, defaultValue?: unknown) => {
        return parameters[itemIndex][name as keyof typeof parameters[number]] ?? defaultValue;
      },
    };

    await expect(node.execute.call(context as never)).resolves.toEqual([
      [{ json: { ok: true } }, { json: { ok: true } }],
    ]);

    expect(launch).toHaveBeenCalledTimes(1);
    expect(newPage).toHaveBeenCalledTimes(2);
    expect(setContent).toHaveBeenCalledTimes(2);
    expect(pageClose).toHaveBeenCalledTimes(2);
    expect(browserClose).toHaveBeenCalledTimes(1);
  });
});
