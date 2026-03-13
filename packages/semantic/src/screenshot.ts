/** Safely take an element screenshot, returning base64 PNG or undefined */
export async function takeElementScreenshot(
  page: { locator: (sel: string) => { screenshot: (opts: { type: 'png' }) => Promise<Buffer> } },
  selector: string,
): Promise<string | undefined> {
  try {
    // Handle iframe prefix selectors (e.g. "iframe[src='...'] >>> .element")
    const actualSelector = selector.includes(' >>> ')
      ? selector.split(' >>> ').pop()!
      : selector;

    const buffer = await page.locator(actualSelector).screenshot({ type: 'png' });
    return buffer.toString('base64');
  } catch {
    return undefined;
  }
}
