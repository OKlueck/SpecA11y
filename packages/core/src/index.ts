// Public API
export { check } from './runner.js';
export { resolveConfig, DEFAULT_CONFIG } from './config.js';
export { registerRule, getRule, getAllRules, filterRules, clearRegistry } from './registry.js';
export { createRuleContext } from './context.js';
export type { ContextOptions } from './context.js';
export { CachedRuleContext } from './cache.js';
export { buildReport } from './reporter.js';
export { buildSarifReport } from './reporter-sarif.js';
export type { SarifLog } from './reporter-sarif.js';
export { WCAG_CRITERIA, getCriterion, getCriteriaForLevel } from './wcag.js';

// Types
export type {
  WcagVersion,
  WcagLevel,
  WcagPrinciple,
  WcagCriterion,
  Severity,
  Confidence,
  ResultType,
  RuleType,
  RuleMeta,
  ElementTarget,
  RuleResult,
  Rule,
  RuleContext,
  ElementHandle,
  CheckConfig,
  ReportSummary,
  ReportEntry,
  Report,
} from './types.js';

// Utils
export { parseColor, parseColorWithAlpha, alphaComposite, getEffectiveBackgroundColor, relativeLuminance, contrastRatio } from './utils/index.js';
export type { RGB, RGBA } from './utils/index.js';

// Built-in rules — import for side-effect of registration
import { registerRule } from './registry.js';
// Perceivable
import { imgAlt } from './rules/perceivable/img-alt.js';
import { colorContrast } from './rules/perceivable/color-contrast.js';
import { useOfColor } from './rules/perceivable/use-of-color.js';
import { nonTextContrast } from './rules/perceivable/non-text-contrast.js';
import { textSpacing } from './rules/perceivable/text-spacing.js';
import { areaAlt } from './rules/perceivable/area-alt.js';
import { inputImageAlt } from './rules/perceivable/input-image-alt.js';
import { objectAlt } from './rules/perceivable/object-alt.js';
import { svgImgAlt } from './rules/perceivable/svg-img-alt.js';
import { videoCaption } from './rules/perceivable/video-caption.js';
import { metaViewport } from './rules/perceivable/meta-viewport.js';
import { headingOrder } from './rules/perceivable/heading-order.js';
import { listStructure } from './rules/perceivable/list-structure.js';
import { tdHeadersAttr } from './rules/perceivable/td-headers-attr.js';
import { autocompleteValid } from './rules/perceivable/autocomplete-valid.js';
import { meaningfulSequence } from './rules/perceivable/meaningful-sequence.js';
import { sensoryCharacteristics } from './rules/perceivable/sensory-characteristics.js';
import { imagesOfText } from './rules/perceivable/images-of-text.js';
import { reflow } from './rules/perceivable/reflow.js';
import { contentOnHoverFocus } from './rules/perceivable/content-on-hover-focus.js';
import { landmarkMain } from './rules/perceivable/landmark-main.js';
import { landmarkBannerTopLevel } from './rules/perceivable/landmark-banner-top-level.js';
import { landmarkContentinfoTopLevel } from './rules/perceivable/landmark-contentinfo-top-level.js';
import { landmarkComplementaryTopLevel } from './rules/perceivable/landmark-complementary-top-level.js';
import { landmarkUnique } from './rules/perceivable/landmark-unique.js';
import { pageHasHeadingOne } from './rules/perceivable/page-has-heading-one.js';
import { noAutoplayAudio } from './rules/perceivable/no-autoplay-audio.js';
import { scopeAttrValid } from './rules/perceivable/scope-attr-valid.js';
import { thHasDataCells } from './rules/perceivable/th-has-data-cells.js';
import { definitionList } from './rules/perceivable/definition-list.js';
import { dlitem } from './rules/perceivable/dlitem.js';
import { tableHasHeader } from './rules/perceivable/table-has-header.js';
import { tableDuplicateName } from './rules/perceivable/table-duplicate-name.js';
import { emptyHeading } from './rules/perceivable/empty-heading.js';
import { emptyTableHeader } from './rules/perceivable/empty-table-header.js';
import { imageRedundantAlt } from './rules/perceivable/image-redundant-alt.js';
import { landmarkNoDuplicateBanner } from './rules/perceivable/landmark-no-duplicate-banner.js';
import { landmarkNoDuplicateContentinfo } from './rules/perceivable/landmark-no-duplicate-contentinfo.js';
import { metaViewportLarge } from './rules/perceivable/meta-viewport-large.js';
import { region } from './rules/perceivable/region.js';
import { cssOrientationLock } from './rules/perceivable/css-orientation-lock.js';
import { hiddenContent } from './rules/perceivable/hidden-content.js';
import { pAsHeading } from './rules/perceivable/p-as-heading.js';
import { tableFakeCaption } from './rules/perceivable/table-fake-caption.js';
import { tdHasHeader } from './rules/perceivable/td-has-header.js';
import { linkInTextBlock } from './rules/perceivable/link-in-text-block.js';
// Operable
import { documentTitle } from './rules/operable/document-title.js';
import { linkName } from './rules/operable/link-name.js';
import { bypass } from './rules/operable/bypass.js';
import { frameTitle } from './rules/operable/frame-title.js';
import { tabindex } from './rules/operable/tabindex.js';
import { accesskeys } from './rules/operable/accesskeys.js';
import { metaRefresh } from './rules/operable/meta-refresh.js';
import { marquee } from './rules/operable/marquee.js';
import { blink } from './rules/operable/blink.js';
import { serverSideImageMap } from './rules/operable/server-side-image-map.js';
import { focusVisible } from './rules/operable/focus-visible.js';
import { targetSize } from './rules/operable/target-size.js';
import { characterKeyShortcuts } from './rules/operable/character-key-shortcuts.js';
import { timingAdjustable } from './rules/operable/timing-adjustable.js';
import { focusOrder } from './rules/operable/focus-order.js';
import { multipleWays } from './rules/operable/multiple-ways.js';
import { focusNotObscured } from './rules/operable/focus-not-obscured.js';
import { focusAppearanceEnhanced } from './rules/operable/focus-appearance-enhanced.js';
import { noKeyboardTrap } from './rules/operable/no-keyboard-trap.js';
import { pointerCancellation } from './rules/operable/pointer-cancellation.js';
import { draggingMovements } from './rules/operable/dragging-movements.js';
import { nestedInteractive } from './rules/operable/nested-interactive.js';
import { skipLink } from './rules/operable/skip-link.js';
import { scrollableRegionFocusable } from './rules/operable/scrollable-region-focusable.js';
import { noEmptyLinks } from './rules/operable/no-empty-links.js';
// Understandable
import { htmlHasLang } from './rules/understandable/html-has-lang.js';
import { validLang } from './rules/understandable/valid-lang.js';
import { label } from './rules/understandable/label.js';
import { selectName } from './rules/understandable/select-name.js';
import { buttonName } from './rules/understandable/button-name.js';
import { formFieldMultipleLabels } from './rules/understandable/form-field-multiple-labels.js';
import { onFocus } from './rules/understandable/on-focus.js';
import { consistentNavigation } from './rules/understandable/consistent-navigation.js';
import { consistentIdentification } from './rules/understandable/consistent-identification.js';
import { consistentHelp } from './rules/understandable/consistent-help.js';
import { errorIdentification } from './rules/understandable/error-identification.js';
import { errorSuggestion } from './rules/understandable/error-suggestion.js';
import { errorPrevention } from './rules/understandable/error-prevention.js';
import { redundantEntry } from './rules/understandable/redundant-entry.js';
import { accessibleAuth } from './rules/understandable/accessible-auth.js';
import { labelTitleOnly } from './rules/understandable/label-title-only.js';
import { labelContentNameMismatch } from './rules/understandable/label-content-name-mismatch.js';
// Robust
import { ariaAllowedAttr } from './rules/robust/aria-allowed-attr.js';
import { ariaRequiredAttr } from './rules/robust/aria-required-attr.js';
import { ariaValidAttr } from './rules/robust/aria-valid-attr.js';
import { ariaValidAttrValue } from './rules/robust/aria-valid-attr-value.js';
import { ariaRoles } from './rules/robust/aria-roles.js';
import { ariaHiddenBody } from './rules/robust/aria-hidden-body.js';
import { duplicateId } from './rules/robust/duplicate-id.js';
import { ariaRequiredChildren } from './rules/robust/aria-required-children.js';
import { ariaRequiredParent } from './rules/robust/aria-required-parent.js';
import { ariaInputFieldName } from './rules/robust/aria-input-field-name.js';
import { ariaToggleFieldName } from './rules/robust/aria-toggle-field-name.js';
import { ariaAllowedRole } from './rules/robust/aria-allowed-role.js';
import { ariaDialogName } from './rules/robust/aria-dialog-name.js';
import { ariaText } from './rules/robust/aria-text.js';
import { ariaTreeitemName } from './rules/robust/aria-treeitem-name.js';
import { presentationRoleConflict } from './rules/robust/presentation-role-conflict.js';
// WCAG 3.0 Draft
import { textCustomization } from './rules/wcag3/text-customization.js';
import { reducedMotionRespect } from './rules/wcag3/reduced-motion-respect.js';
import { cognitiveLoadDeceptive } from './rules/wcag3/cognitive-load-deceptive.js';

const builtinRules = [
  // Perceivable
  imgAlt, colorContrast, useOfColor, nonTextContrast, textSpacing, areaAlt, inputImageAlt, objectAlt, svgImgAlt,
  videoCaption, metaViewport, headingOrder, listStructure, tdHeadersAttr, autocompleteValid,
  meaningfulSequence, sensoryCharacteristics, imagesOfText, reflow, contentOnHoverFocus,
  landmarkMain, landmarkBannerTopLevel, landmarkContentinfoTopLevel, landmarkComplementaryTopLevel,
  landmarkUnique, pageHasHeadingOne, noAutoplayAudio,
  scopeAttrValid, thHasDataCells, definitionList, dlitem, tableHasHeader, tableDuplicateName,
  emptyHeading, emptyTableHeader, imageRedundantAlt,
  landmarkNoDuplicateBanner, landmarkNoDuplicateContentinfo,
  metaViewportLarge, region, cssOrientationLock, hiddenContent,
  pAsHeading, tableFakeCaption, tdHasHeader, linkInTextBlock,
  // Operable
  documentTitle, linkName, bypass, frameTitle, tabindex, accesskeys,
  metaRefresh, marquee, blink, serverSideImageMap, focusVisible, targetSize,
  characterKeyShortcuts, timingAdjustable, focusOrder, multipleWays,
  focusNotObscured, focusAppearanceEnhanced, noKeyboardTrap, pointerCancellation, draggingMovements,
  nestedInteractive, skipLink, scrollableRegionFocusable, noEmptyLinks,
  // Understandable
  htmlHasLang, validLang, label, selectName, buttonName, formFieldMultipleLabels,
  onFocus, consistentNavigation, consistentIdentification, consistentHelp,
  errorIdentification, errorSuggestion, errorPrevention, redundantEntry, accessibleAuth,
  labelTitleOnly, labelContentNameMismatch,
  // Robust
  ariaAllowedAttr, ariaRequiredAttr, ariaValidAttr, ariaValidAttrValue, ariaRoles, ariaHiddenBody, duplicateId,
  ariaRequiredChildren, ariaRequiredParent, ariaInputFieldName, ariaToggleFieldName,
  ariaAllowedRole, ariaDialogName, ariaText, ariaTreeitemName, presentationRoleConflict,
  // WCAG 3.0 Draft
  textCustomization, reducedMotionRespect, cognitiveLoadDeceptive,
];

for (const rule of builtinRules) {
  registerRule(rule);
}
