/**
 * `@polaris/ui/ribbon` — toolbar pattern for editor-style products.
 *
 * Subpath export — root `@polaris/ui` consumers don't pay the
 * `@radix-ui/react-toggle-group` dep cost. Import only when building an
 * editor surface (Office docs, MD editor, spreadsheet, presentation, PDF
 * tools).
 *
 * ```tsx
 * import {
 *   Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
 *   RibbonGroup, RibbonSeparator,
 *   RibbonButton, RibbonSplitButton,
 *   RibbonToggleGroup, RibbonToggleItem,
 * } from '@polaris/ui/ribbon';
 * ```
 */
export * from './Ribbon';
