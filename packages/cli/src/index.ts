import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { formatText } from './formatters/text.js';
import { formatJson } from './formatters/json.js';
import { formatSarif } from './formatters/sarif.js';

const program = new Command();

program
  .name('speca11y')
  .description('SpecA11y — automated WCAG accessibility checker')
  .version('0.1.0')
  .argument('<url-or-file>', 'URL or local HTML file to check')
  .option('-l, --level <level>', 'WCAG level: A, AA, or AAA', 'AA')
  .option('-f, --format <format>', 'Output format: text, json, or sarif', 'text')
  .option('--include-passes', 'Include passing rules in output', false)
  .option('--disable-rules <ids>', 'Comma-separated rule IDs to disable')
  .option('-o, --output <file>', 'Write output to file instead of stdout')
  .action(async (target: string, options) => {
    const { check } = await import('@speca11y/core');
    const { chromium } = await import('playwright');

    const level = options.level as 'A' | 'AA' | 'AAA';
    const format = options.format as 'text' | 'json' | 'sarif';
    const includePasses = options.includePasses as boolean;
    const disableRules = options.disableRules
      ? (options.disableRules as string).split(',').map((s: string) => s.trim())
      : undefined;

    // Determine URL
    let url: string;
    if (/^https?:\/\//i.test(target)) {
      url = target;
    } else {
      const absPath = resolve(target);
      url = pathToFileURL(absPath).href;
    }

    let browser;
    try {
      browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const report = await check(page, {
        level,
        includePasses,
        disableRules,
      });

      await page.close();

      let output: string;
      switch (format) {
        case 'json':
          output = formatJson(report);
          break;
        case 'sarif':
          output = formatSarif(report);
          break;
        default:
          output = formatText(report, includePasses);
      }

      if (options.output) {
        writeFileSync(options.output as string, output, 'utf-8');
        process.stderr.write(`Report written to ${options.output}\n`);
      } else {
        process.stdout.write(output + '\n');
      }

      const exitCode = report.summary.counts.violations > 0 ? 1 : 0;
      process.exit(exitCode);
    } catch (err) {
      process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
      process.exit(2);
    } finally {
      await browser?.close();
    }
  });

program.parse();
