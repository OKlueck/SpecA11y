import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class WcagCheck implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WCAG Check',
    name: 'wcagCheck',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Run automated WCAG accessibility checks on web pages',
    defaults: {
      name: 'WCAG Check',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Check URL', value: 'checkUrl', description: 'Check a live URL for accessibility issues' },
          { name: 'Check HTML', value: 'checkHtml', description: 'Check raw HTML content for accessibility issues' },
        ],
        default: 'checkUrl',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'https://example.com',
        description: 'The URL to check for accessibility issues',
        displayOptions: {
          show: { operation: ['checkUrl'] },
        },
        required: true,
      },
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        typeOptions: { rows: 10 },
        default: '',
        placeholder: '<!DOCTYPE html><html>...</html>',
        description: 'The HTML content to check for accessibility issues',
        displayOptions: {
          show: { operation: ['checkHtml'] },
        },
        required: true,
      },
      {
        displayName: 'WCAG Level',
        name: 'level',
        type: 'options',
        options: [
          { name: 'A', value: 'A' },
          { name: 'AA', value: 'AA' },
          { name: 'AAA', value: 'AAA' },
        ],
        default: 'AA',
        description: 'Minimum WCAG conformance level to check',
      },
      {
        displayName: 'Include Passes',
        name: 'includePasses',
        type: 'boolean',
        default: false,
        description: 'Whether to include passing rules in the report',
      },
      {
        displayName: 'Disable Rules',
        name: 'disableRules',
        type: 'string',
        default: '',
        placeholder: 'color-contrast, img-alt',
        description: 'Comma-separated list of rule IDs to disable',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;
      const level = this.getNodeParameter('level', i) as 'A' | 'AA' | 'AAA';
      const includePasses = this.getNodeParameter('includePasses', i) as boolean;
      const disableRulesStr = this.getNodeParameter('disableRules', i, '') as string;
      const disableRules = disableRulesStr
        ? disableRulesStr.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        if (operation === 'checkUrl') {
          const url = this.getNodeParameter('url', i) as string;
          await page.goto(url, { waitUntil: 'networkidle' });
        } else {
          const html = this.getNodeParameter('html', i) as string;
          await page.setContent(html, { waitUntil: 'networkidle' });
        }

        const { check } = await import('@speca11y/core');
        const report = await check(page, {
          level,
          includePasses,
          disableRules,
        });

        returnData.push({ json: report as unknown as INodeExecutionData['json'] });
      } finally {
        await browser.close();
      }
    }

    return [returnData];
  }
}
