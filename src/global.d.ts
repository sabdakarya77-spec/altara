/**
 * Ambient module declarations for non-code assets.
 *
 * Next.js ships declarations for `*.module.css` only. Plain global stylesheets
 * (e.g. `./globals.css`) are imported for their side effects, so TypeScript
 * needs a matching ambient module to resolve the import.
 *
 * This is required by TypeScript 5.6+ when `noUncheckedSideEffectImports` is
 * enabled (the default in TypeScript 6 / the VS Code language server), which
 * otherwise reports TS2882 / TS2307 for side-effect CSS imports.
 */

declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
