export interface AriaRoleDefinition {
  type: 'widget' | 'document' | 'landmark' | 'window' | 'abstract';
  requiredAttrs: string[];
  supportedAttrs: string[];
  requiredChildren: string[];
  requiredParent: string[];
  nameRequired: boolean;
  nameFromContents: boolean;
  implicit: string[];
}

const globalAttrs = [
  'aria-atomic',
  'aria-busy',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-details',
  'aria-disabled',
  'aria-dropeffect',
  'aria-errormessage',
  'aria-flowto',
  'aria-grabbed',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-keyshortcuts',
  'aria-label',
  'aria-labelledby',
  'aria-live',
  'aria-owns',
  'aria-relevant',
  'aria-roledescription',
];

export const ARIA_ROLES: Record<string, AriaRoleDefinition> = {
  // --- Abstract roles ---
  command: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  composite: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-disabled'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  input: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-disabled'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  landmark: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  range: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  roletype: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  section: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  sectionhead: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: [],
  },
  select: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-orientation'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  structure: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  widget: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  window: {
    type: 'abstract',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-modal'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },

  // --- Widget roles ---
  alert: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  alertdialog: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-modal'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  button: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-pressed'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['button', 'input[type="button"]', 'input[type="image"]', 'input[type="reset"]', 'input[type="submit"]', 'summary'],
  },
  checkbox: {
    type: 'widget',
    requiredAttrs: ['aria-checked'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-expanded', 'aria-readonly', 'aria-required'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['input[type="checkbox"]'],
  },
  combobox: {
    type: 'widget',
    requiredAttrs: ['aria-controls', 'aria-expanded'],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-autocomplete', 'aria-controls',
      'aria-expanded', 'aria-readonly', 'aria-required',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['select[size="1"]', 'select:not([size])'],
  },
  dialog: {
    type: 'window',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-modal'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['dialog'],
  },
  gridcell: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-colspan', 'aria-colindex', 'aria-expanded',
      'aria-readonly', 'aria-required', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
    ],
    requiredChildren: [],
    requiredParent: ['row'],
    nameRequired: false,
    nameFromContents: true,
    implicit: [],
  },
  link: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['a[href]', 'area[href]'],
  },
  listbox: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-expanded', 'aria-multiselectable',
      'aria-orientation', 'aria-readonly', 'aria-required',
    ],
    requiredChildren: ['option'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['select[multiple]', 'select[size]'],
  },
  menu: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-orientation'],
    requiredChildren: ['group', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  menubar: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-orientation'],
    requiredChildren: ['group', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  menuitem: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['group', 'menu', 'menubar'],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },
  menuitemcheckbox: {
    type: 'widget',
    requiredAttrs: ['aria-checked'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-expanded', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['group', 'menu', 'menubar'],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },
  menuitemradio: {
    type: 'widget',
    requiredAttrs: ['aria-checked'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-expanded', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['group', 'menu', 'menubar'],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },
  option: {
    type: 'widget',
    requiredAttrs: ['aria-selected'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-posinset', 'aria-selected', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['group', 'listbox'],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['option'],
  },
  progressbar: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['progress'],
  },
  radio: {
    type: 'widget',
    requiredAttrs: ['aria-checked'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['input[type="radio"]'],
  },
  radiogroup: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-orientation', 'aria-readonly', 'aria-required'],
    requiredChildren: ['radio'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  scrollbar: {
    type: 'widget',
    requiredAttrs: ['aria-controls', 'aria-valuenow'],
    supportedAttrs: [
      ...globalAttrs, 'aria-controls', 'aria-orientation',
      'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  searchbox: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-autocomplete',
      'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['input[type="search"]'],
  },
  separator: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-orientation', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['hr'],
  },
  slider: {
    type: 'widget',
    requiredAttrs: ['aria-valuenow'],
    supportedAttrs: [
      ...globalAttrs, 'aria-orientation', 'aria-readonly',
      'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['input[type="range"]'],
  },
  spinbutton: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-readonly', 'aria-required',
      'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['input[type="number"]'],
  },
  switch: {
    type: 'widget',
    requiredAttrs: ['aria-checked'],
    supportedAttrs: [...globalAttrs, 'aria-checked', 'aria-readonly'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },
  tab: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-posinset', 'aria-selected', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['tablist'],
    nameRequired: false,
    nameFromContents: true,
    implicit: [],
  },
  tabpanel: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  textbox: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-autocomplete',
      'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required',
    ],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['input[type="text"]', 'input[type="email"]', 'input[type="tel"]', 'input[type="url"]', 'input:not([type])', 'textarea'],
  },
  toolbar: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-orientation'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  tooltip: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },
  tree: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-multiselectable', 'aria-orientation', 'aria-required'],
    requiredChildren: ['group', 'treeitem'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  treegrid: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-colcount',
      'aria-multiselectable', 'aria-orientation', 'aria-readonly', 'aria-required', 'aria-rowcount',
    ],
    requiredChildren: ['row', 'rowgroup'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  treeitem: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-checked', 'aria-expanded', 'aria-level',
      'aria-posinset', 'aria-selected', 'aria-setsize',
    ],
    requiredChildren: [],
    requiredParent: ['group', 'tree'],
    nameRequired: true,
    nameFromContents: true,
    implicit: [],
  },

  // --- Document structure roles ---
  application: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  article: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['article'],
  },
  blockquote: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['blockquote'],
  },
  caption: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: ['figure', 'grid', 'table', 'treegrid'],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['caption', 'figcaption'],
  },
  cell: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan'],
    requiredChildren: [],
    requiredParent: ['row'],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['td'],
  },
  code: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['code'],
  },
  columnheader: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-colindex', 'aria-colspan', 'aria-expanded',
      'aria-readonly', 'aria-required', 'aria-rowindex', 'aria-rowspan', 'aria-selected', 'aria-sort',
    ],
    requiredChildren: [],
    requiredParent: ['row'],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['th[scope="col"]', 'th'],
  },
  comment: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  definition: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['dd'],
  },
  deletion: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['del', 's'],
  },
  directory: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  document: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['body'],
  },
  emphasis: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['em'],
  },
  feed: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: ['article'],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  figure: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['figure'],
  },
  generic: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['div', 'span'],
  },
  grid: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-colcount', 'aria-expanded',
      'aria-level', 'aria-multiselectable', 'aria-readonly', 'aria-rowcount',
    ],
    requiredChildren: ['row', 'rowgroup'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  group: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['details', 'fieldset'],
  },
  heading: {
    type: 'document',
    requiredAttrs: ['aria-level'],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-level'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  },
  img: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['img'],
  },
  insertion: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['ins'],
  },
  list: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: ['listitem'],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['ul', 'ol'],
  },
  listitem: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize'],
    requiredChildren: [],
    requiredParent: ['group', 'list'],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['li'],
  },
  log: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  mark: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['mark'],
  },
  marquee: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: [],
  },
  math: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['math'],
  },
  meter: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['meter'],
  },
  none: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  note: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  paragraph: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['p'],
  },
  presentation: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  row: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-activedescendant', 'aria-colindex', 'aria-expanded',
      'aria-level', 'aria-rowindex', 'aria-selected',
    ],
    requiredChildren: ['cell', 'columnheader', 'gridcell', 'rowheader'],
    requiredParent: ['grid', 'rowgroup', 'table', 'treegrid'],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['tr'],
  },
  rowgroup: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: ['row'],
    requiredParent: ['grid', 'table', 'treegrid'],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['tbody', 'tfoot', 'thead'],
  },
  rowheader: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [
      ...globalAttrs, 'aria-colindex', 'aria-colspan', 'aria-expanded',
      'aria-readonly', 'aria-required', 'aria-rowindex', 'aria-rowspan', 'aria-selected', 'aria-sort',
    ],
    requiredChildren: [],
    requiredParent: ['row'],
    nameRequired: true,
    nameFromContents: true,
    implicit: ['th[scope="row"]'],
  },
  status: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['output'],
  },
  strong: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['strong'],
  },
  subscript: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['sub'],
  },
  superscript: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['sup'],
  },
  table: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-colcount', 'aria-expanded', 'aria-rowcount'],
    requiredChildren: ['row', 'rowgroup'],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['table'],
  },
  tablist: {
    type: 'widget',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-activedescendant', 'aria-multiselectable', 'aria-orientation'],
    requiredChildren: ['tab'],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
  term: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['dfn', 'dt'],
  },
  time: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: true,
    implicit: ['time'],
  },
  timer: {
    type: 'document',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },

  // --- Landmark roles ---
  banner: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['header'],
  },
  complementary: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['aside'],
  },
  contentinfo: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['footer'],
  },
  form: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['form'],
  },
  main: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['main'],
  },
  navigation: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: ['nav'],
  },
  region: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: true,
    nameFromContents: false,
    implicit: ['section'],
  },
  search: {
    type: 'landmark',
    requiredAttrs: [],
    supportedAttrs: [...globalAttrs, 'aria-expanded'],
    requiredChildren: [],
    requiredParent: [],
    nameRequired: false,
    nameFromContents: false,
    implicit: [],
  },
};

/**
 * Native HTML elements that implicitly satisfy certain required ARIA attributes.
 * Maps tagName (or tagName + type) to the set of ARIA attrs they implicitly provide.
 */
const IMPLICIT_ARIA_ATTRS: Record<string, string[]> = {
  'input[type="checkbox"]': ['aria-checked'],
  'input[type="radio"]': ['aria-checked'],
  'input[type="range"]': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  'input[type="number"]': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  'option': ['aria-selected'],
  'select': ['aria-expanded'],
  'h1': ['aria-level'],
  'h2': ['aria-level'],
  'h3': ['aria-level'],
  'h4': ['aria-level'],
  'h5': ['aria-level'],
  'h6': ['aria-level'],
  'meter': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  'progress': ['aria-valuenow'],
};

/**
 * Returns the list of ARIA attrs that are implicitly satisfied by native HTML
 * semantics for a given tag name and optional type attribute.
 */
export function getImplicitAriaAttrs(tagName: string, type?: string): string[] {
  const tag = tagName.toLowerCase();
  const key = type ? `${tag}[type="${type.toLowerCase()}"]` : tag;
  return IMPLICIT_ARIA_ATTRS[key] ?? IMPLICIT_ARIA_ATTRS[tag] ?? [];
}

export const VALID_ARIA_ATTRS: Set<string> = new Set([
  'aria-activedescendant',
  'aria-atomic',
  'aria-autocomplete',
  'aria-braillelabel',
  'aria-brailleroledescription',
  'aria-busy',
  'aria-checked',
  'aria-colcount',
  'aria-colindex',
  'aria-colindextext',
  'aria-colspan',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-description',
  'aria-details',
  'aria-disabled',
  'aria-dropeffect',
  'aria-errormessage',
  'aria-expanded',
  'aria-flowto',
  'aria-grabbed',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-keyshortcuts',
  'aria-label',
  'aria-labelledby',
  'aria-level',
  'aria-live',
  'aria-modal',
  'aria-multiline',
  'aria-multiselectable',
  'aria-orientation',
  'aria-owns',
  'aria-placeholder',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-relevant',
  'aria-required',
  'aria-roledescription',
  'aria-rowcount',
  'aria-rowindex',
  'aria-rowindextext',
  'aria-rowspan',
  'aria-selected',
  'aria-setsize',
  'aria-sort',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
  'aria-valuetext',
]);

export function isValidRole(role: string): boolean {
  return role in ARIA_ROLES;
}

export function isAbstractRole(role: string): boolean {
  const def = ARIA_ROLES[role];
  return def !== undefined && def.type === 'abstract';
}

export function getRequiredAttrs(role: string): string[] {
  return ARIA_ROLES[role]?.requiredAttrs ?? [];
}

export function getSupportedAttrs(role: string): string[] {
  return ARIA_ROLES[role]?.supportedAttrs ?? [];
}

export function getRequiredChildren(role: string): string[] {
  return ARIA_ROLES[role]?.requiredChildren ?? [];
}

export function getRequiredParent(role: string): string[] {
  return ARIA_ROLES[role]?.requiredParent ?? [];
}

export function isValidAriaAttr(attr: string): boolean {
  return VALID_ARIA_ATTRS.has(attr);
}

export function getImplicitRole(
  tagName: string,
  attributes: Record<string, string> = {},
): string | null {
  const tag = tagName.toLowerCase();
  const type = attributes.type?.toLowerCase();
  const hasAccessibleName =
    'aria-label' in attributes ||
    'aria-labelledby' in attributes ||
    ('title' in attributes && attributes.title !== '');

  switch (tag) {
    case 'a':
    case 'area':
      return 'href' in attributes ? 'link' : null;

    case 'article':
      return 'article';

    case 'aside':
      return 'complementary';

    case 'blockquote':
      return 'blockquote';

    case 'body':
      return 'document';

    case 'button':
      return 'button';

    case 'caption':
    case 'figcaption':
      return 'caption';

    case 'code':
      return 'code';

    case 'datalist':
      return 'listbox';

    case 'dd':
      return 'definition';

    case 'del':
    case 's':
      return 'deletion';

    case 'details':
      return 'group';

    case 'dfn':
    case 'dt':
      return 'term';

    case 'dialog':
      return 'dialog';

    case 'em':
      return 'emphasis';

    case 'fieldset':
      return 'group';

    case 'figure':
      return 'figure';

    case 'footer':
      // 'contentinfo' only when not scoped to article/section/etc.
      // Without DOM context we return 'contentinfo' as the top-level default.
      return 'contentinfo';

    case 'form':
      return hasAccessibleName ? 'form' : null;

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';

    case 'header':
      // 'banner' only when not scoped to article/section/etc.
      return 'banner';

    case 'hr':
      return 'separator';

    case 'img':
      if ('alt' in attributes && attributes.alt === '') {
        return 'presentation';
      }
      return 'img';

    case 'input': {
      switch (type) {
        case 'button':
        case 'image':
        case 'reset':
        case 'submit':
          return 'button';
        case 'checkbox':
          return 'checkbox';
        case 'radio':
          return 'radio';
        case 'range':
          return 'slider';
        case 'number':
          return 'spinbutton';
        case 'search':
          return 'searchbox';
        case 'email':
        case 'tel':
        case 'url':
        case 'text':
        case undefined:
          return 'textbox';
        default:
          return 'textbox';
      }
    }

    case 'ins':
      return 'insertion';

    case 'li':
      return 'listitem';

    case 'main':
      return 'main';

    case 'mark':
      return 'mark';

    case 'math':
      return 'math';

    case 'menu':
      return 'list';

    case 'meter':
      return 'meter';

    case 'nav':
      return 'navigation';

    case 'ol':
    case 'ul':
      return 'list';

    case 'optgroup':
      return 'group';

    case 'option':
      return 'option';

    case 'output':
      return 'status';

    case 'p':
      return 'paragraph';

    case 'progress':
      return 'progressbar';

    case 'section':
      return hasAccessibleName ? 'region' : null;

    case 'select': {
      const size = attributes.size !== undefined ? parseInt(attributes.size, 10) : undefined;
      const multiple = 'multiple' in attributes;
      if (multiple || (size !== undefined && size > 1)) {
        return 'listbox';
      }
      return 'combobox';
    }

    case 'strong':
      return 'strong';

    case 'sub':
      return 'subscript';

    case 'summary':
      return null; // no corresponding ARIA role per spec

    case 'sup':
      return 'superscript';

    case 'table':
      return 'table';

    case 'tbody':
    case 'tfoot':
    case 'thead':
      return 'rowgroup';

    case 'td':
      return 'cell';

    case 'textarea':
      return 'textbox';

    case 'th': {
      const scope = attributes.scope?.toLowerCase();
      if (scope === 'row') return 'rowheader';
      return 'columnheader';
    }

    case 'time':
      return 'time';

    case 'tr':
      return 'row';

    default:
      return null;
  }
}
