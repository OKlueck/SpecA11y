import type { Rule, CheckConfig, WcagLevel } from './types.js';
import { WCAG_CRITERIA } from './wcag.js';

const rules: Map<string, Rule> = new Map();

export function registerRule(rule: Rule): void {
  // If a rule with the same ID exists, we just overwrite it.
  // This is safer in environments where modules might be reloaded.
  rules.set(rule.meta.id, rule);
}

export function getRule(id: string): Rule | undefined {
  return rules.get(id);
}

export function getAllRules(): Rule[] {
  return [...rules.values()];
}

export function clearRegistry(): void {
  rules.clear();
}

const LEVEL_HIERARCHY: Record<WcagLevel, Set<WcagLevel>> = {
  A: new Set(['A']),
  AA: new Set(['A', 'AA']),
  AAA: new Set(['A', 'AA', 'AAA']),
};

export function filterRules(config: CheckConfig): Rule[] {
  const allRules = getAllRules();
  const disabledSet = new Set(config.disableRules ?? []);
  const enabledSet = config.enableRules ? new Set(config.enableRules) : null;
  const allowedLevels = LEVEL_HIERARCHY[config.level];
  const versionSet = new Set(config.versions);

  const tagSet = config.tags ? new Set(config.tags) : null;

  return allRules.filter(rule => {
    if (disabledSet.has(rule.meta.id)) return false;

    // Rules with no WCAG criteria (e.g. WCAG 3.0 draft) are only included via tags or enableRules
    if (rule.meta.wcagCriteria.length === 0) {
      if (enabledSet?.has(rule.meta.id)) return true;
      if (tagSet && rule.meta.tags?.some(t => tagSet.has(t))) return true;
      return false;
    }

    if (enabledSet && !enabledSet.has(rule.meta.id)) return true; // enableRules adds, doesn't restrict

    // Check if at least one criterion matches the level & version filter
    const matchesCriteria = rule.meta.wcagCriteria.some(critId => {
      const criterion = WCAG_CRITERIA[critId];
      if (!criterion) return false;
      return allowedLevels.has(criterion.level) && versionSet.has(criterion.version);
    });

    return matchesCriteria;
  });
}
