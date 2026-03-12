import type { CheckConfig } from './types.js';

export const DEFAULT_CONFIG: CheckConfig = {
  level: 'AA',
  versions: ['2.0', '2.1', '2.2'],
  includePasses: false,
  ruleTimeout: 10_000,
};

export function resolveConfig(partial?: Partial<CheckConfig>): CheckConfig {
  return { ...DEFAULT_CONFIG, ...partial };
}
