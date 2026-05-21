import { forwardRef } from 'react';
import { FILE_ICON_REGISTRY, type FileIconType } from '../file-icons';

/**
 * FileIcon — dispatches to the correct file-type SVG from the design
 * team's icon set. v0.7-rc.2 replaces rc.1's "colored square + text
 * label" approach with the real artwork.
 *
 *   <FileIcon type="docx" />              // 32×32 (default master size)
 *   <FileIcon type="folder-team" size={48} />
 *
 * 29 supported types — see `FileIconType` for the full list. For
 * direct named imports (better tree-shaking when the type is known
 * at build time), use `@polaris/ui/file-icons`:
 *
 *   import { DocxIcon } from '@polaris/ui/file-icons';
 *
 * Colors are baked into the SVGs per the design — `text-{token}` /
 * `color` props don't recolor file icons (unlike the monochrome UI
 * icons). Use `aria-label` to override the default accessibility name.
 */
export type FileType = FileIconType;

export interface FileIconProps extends React.SVGAttributes<SVGSVGElement> {
  /** File type. 29 supported — docx / hwp / xlsx / pptx / pdf / folder /
   *  image / video / zip / etc. See `FileIconType` for the full list. */
  type: FileIconType;
  /** Pixel size; default 32 (the design master). Scales uniformly. */
  size?: number;
}

export const FileIcon = forwardRef<SVGSVGElement, FileIconProps>(
  ({ type, size = 32, 'aria-label': ariaLabel, ...props }, ref) => {
    const Icon = FILE_ICON_REGISTRY[type];
    if (!Icon) {
      // Unknown type — fall back to the `unknown` file icon. Should be
      // unreachable because TypeScript narrows `type` to `FileIconType`.
      const Fallback = FILE_ICON_REGISTRY['unknown'];
      return (
        <Fallback
          ref={ref}
          size={size}
          aria-label={ariaLabel ?? `${type} file`}
          {...props}
        />
      );
    }
    return (
      <Icon
        ref={ref}
        size={size}
        aria-label={ariaLabel ?? `${type} file`}
        {...props}
      />
    );
  }
);
FileIcon.displayName = 'FileIcon';
