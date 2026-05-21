import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { FileIcon, type FileType } from './FileIcon';

export interface FileCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** File type — drives the FileIcon color (file.docx, file.xlsx, etc.). */
  type: FileType;
  /** File name shown as the primary label. */
  name: string;
  /** Optional meta line (date, size, etc.) shown below the name. */
  meta?: React.ReactNode;
  /** Optional trailing slot at the right edge (badge, button, etc.). */
  trailing?: React.ReactNode;
  /** Force <a> rendering even without href. */
  asLink?: boolean;
  /** When provided, renders as an <a> with this href. */
  href?: string;
}

export const FileCard = forwardRef<HTMLElement, FileCardProps>(
  ({ className, type, name, meta, trailing, asLink, href, onClick, ...props }, ref) => {
    const interactive = Boolean(asLink || href || onClick);
    const renderLink = Boolean(asLink || href);
    const Comp = renderLink ? 'a' : 'div';
    const linkProps = renderLink ? { href } : {};

    return (
      <Comp
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        {...linkProps}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-polaris-md bg-background-base border border-line-neutral p-3',
          interactive &&
            'hover:bg-accent-brand-normal-subtle hover:border-line-normal transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand-normal',
          className
        )}
        {...props}
      >
        <FileIcon type={type} size={40} />
        <div className="flex-1 min-w-0">
          <div className="text-polaris-body2 font-medium text-label-normal truncate">{name}</div>
          {meta && (
            <div className="text-polaris-caption1 text-label-alternative truncate mt-0.5">{meta}</div>
          )}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </Comp>
    );
  }
);
FileCard.displayName = 'FileCard';
