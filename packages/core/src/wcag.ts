import type { WcagCriterion } from './types.js';

export const WCAG_CRITERIA: Record<string, WcagCriterion> = {
  '1.1.1': { id: '1.1.1', name: 'Non-text Content', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.2.1': { id: '1.2.1', name: 'Audio-only and Video-only', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.2.2': { id: '1.2.2', name: 'Captions (Prerecorded)', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.2.3': { id: '1.2.3', name: 'Audio Description or Media Alternative', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.2.4': { id: '1.2.4', name: 'Captions (Live)', level: 'AA', version: '2.0', principle: 'perceivable' },
  '1.2.5': { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'AA', version: '2.0', principle: 'perceivable' },
  '1.3.1': { id: '1.3.1', name: 'Info and Relationships', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.3.2': { id: '1.3.2', name: 'Meaningful Sequence', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.3.3': { id: '1.3.3', name: 'Sensory Characteristics', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.3.4': { id: '1.3.4', name: 'Orientation', level: 'AA', version: '2.1', principle: 'perceivable' },
  '1.3.5': { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA', version: '2.1', principle: 'perceivable' },
  '1.4.1': { id: '1.4.1', name: 'Use of Color', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.4.2': { id: '1.4.2', name: 'Audio Control', level: 'A', version: '2.0', principle: 'perceivable' },
  '1.4.3': { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', version: '2.0', principle: 'perceivable' },
  '1.4.4': { id: '1.4.4', name: 'Resize Text', level: 'AA', version: '2.0', principle: 'perceivable' },
  '1.4.5': { id: '1.4.5', name: 'Images of Text', level: 'AA', version: '2.0', principle: 'perceivable' },
  '1.4.10': { id: '1.4.10', name: 'Reflow', level: 'AA', version: '2.1', principle: 'perceivable' },
  '1.4.11': { id: '1.4.11', name: 'Non-text Contrast', level: 'AA', version: '2.1', principle: 'perceivable' },
  '1.4.12': { id: '1.4.12', name: 'Text Spacing', level: 'AA', version: '2.1', principle: 'perceivable' },
  '1.4.13': { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA', version: '2.1', principle: 'perceivable' },

  '2.1.1': { id: '2.1.1', name: 'Keyboard', level: 'A', version: '2.0', principle: 'operable' },
  '2.1.2': { id: '2.1.2', name: 'No Keyboard Trap', level: 'A', version: '2.0', principle: 'operable' },
  '2.1.4': { id: '2.1.4', name: 'Character Key Shortcuts', level: 'A', version: '2.1', principle: 'operable' },
  '2.2.1': { id: '2.2.1', name: 'Timing Adjustable', level: 'A', version: '2.0', principle: 'operable' },
  '2.2.2': { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A', version: '2.0', principle: 'operable' },
  '2.3.1': { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'A', version: '2.0', principle: 'operable' },
  '2.4.1': { id: '2.4.1', name: 'Bypass Blocks', level: 'A', version: '2.0', principle: 'operable' },
  '2.4.2': { id: '2.4.2', name: 'Page Titled', level: 'A', version: '2.0', principle: 'operable' },
  '2.4.3': { id: '2.4.3', name: 'Focus Order', level: 'A', version: '2.0', principle: 'operable' },
  '2.4.4': { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A', version: '2.0', principle: 'operable' },
  '2.4.5': { id: '2.4.5', name: 'Multiple Ways', level: 'AA', version: '2.0', principle: 'operable' },
  '2.4.6': { id: '2.4.6', name: 'Headings and Labels', level: 'AA', version: '2.0', principle: 'operable' },
  '2.4.7': { id: '2.4.7', name: 'Focus Visible', level: 'AA', version: '2.0', principle: 'operable' },
  '2.4.11': { id: '2.4.11', name: 'Focus Not Obscured (Minimum)', level: 'AA', version: '2.2', principle: 'operable' },
  '2.4.13': { id: '2.4.13', name: 'Focus Appearance', level: 'AAA', version: '2.2', principle: 'operable' },
  '2.5.1': { id: '2.5.1', name: 'Pointer Gestures', level: 'A', version: '2.1', principle: 'operable' },
  '2.5.2': { id: '2.5.2', name: 'Pointer Cancellation', level: 'A', version: '2.1', principle: 'operable' },
  '2.5.3': { id: '2.5.3', name: 'Label in Name', level: 'A', version: '2.1', principle: 'operable' },
  '2.5.4': { id: '2.5.4', name: 'Motion Actuation', level: 'A', version: '2.1', principle: 'operable' },
  '2.5.7': { id: '2.5.7', name: 'Dragging Movements', level: 'AA', version: '2.2', principle: 'operable' },
  '2.5.8': { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA', version: '2.2', principle: 'operable' },

  '3.1.1': { id: '3.1.1', name: 'Language of Page', level: 'A', version: '2.0', principle: 'understandable' },
  '3.1.2': { id: '3.1.2', name: 'Language of Parts', level: 'AA', version: '2.0', principle: 'understandable' },
  '3.2.1': { id: '3.2.1', name: 'On Focus', level: 'A', version: '2.0', principle: 'understandable' },
  '3.2.2': { id: '3.2.2', name: 'On Input', level: 'A', version: '2.0', principle: 'understandable' },
  '3.2.3': { id: '3.2.3', name: 'Consistent Navigation', level: 'AA', version: '2.0', principle: 'understandable' },
  '3.2.4': { id: '3.2.4', name: 'Consistent Identification', level: 'AA', version: '2.0', principle: 'understandable' },
  '3.2.6': { id: '3.2.6', name: 'Consistent Help', level: 'A', version: '2.2', principle: 'understandable' },
  '3.3.1': { id: '3.3.1', name: 'Error Identification', level: 'A', version: '2.0', principle: 'understandable' },
  '3.3.2': { id: '3.3.2', name: 'Labels or Instructions', level: 'A', version: '2.0', principle: 'understandable' },
  '3.3.3': { id: '3.3.3', name: 'Error Suggestion', level: 'AA', version: '2.0', principle: 'understandable' },
  '3.3.4': { id: '3.3.4', name: 'Error Prevention (Legal, Financial, Data)', level: 'AA', version: '2.0', principle: 'understandable' },
  '3.3.7': { id: '3.3.7', name: 'Redundant Entry', level: 'A', version: '2.2', principle: 'understandable' },
  '3.3.8': { id: '3.3.8', name: 'Accessible Authentication (Minimum)', level: 'AA', version: '2.2', principle: 'understandable' },

  '4.1.1': { id: '4.1.1', name: 'Parsing', level: 'A', version: '2.0', principle: 'robust' },
  '4.1.2': { id: '4.1.2', name: 'Name, Role, Value', level: 'A', version: '2.0', principle: 'robust' },
  '4.1.3': { id: '4.1.3', name: 'Status Messages', level: 'AA', version: '2.1', principle: 'robust' },
};

export function getCriterion(id: string): WcagCriterion | undefined {
  return WCAG_CRITERIA[id];
}

export function getCriteriaForLevel(level: 'A' | 'AA' | 'AAA'): WcagCriterion[] {
  const levels: Set<string> = new Set(['A']);
  if (level === 'AA' || level === 'AAA') levels.add('AA');
  if (level === 'AAA') levels.add('AAA');
  return Object.values(WCAG_CRITERIA).filter(c => levels.has(c.level));
}
