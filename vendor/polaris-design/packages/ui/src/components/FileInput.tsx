import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { Upload, X } from 'lucide-react';
import { ErrorIcon } from '../icons';
import { Button } from './Button';
import { cn } from '../lib/cn';

/* ================================================================== *
 * FileInput — minimal file picker (no drop zone)              v0.7.5
 * ================================================================== *
 *
 * Native `<input type="file">` is hidden; a polaris `<Button>` triggers
 * it via a label + ref. Selected file names render below.
 *
 * For drag-and-drop support, use `<FileDropZone>` instead (richer UI).
 * Both share the same selection callback shape so you can swap them.
 *
 * @example
 * ```tsx
 * <FileInput
 *   label="첨부 파일"
 *   accept=".pdf,.docx"
 *   multiple
 *   onFilesChange={setFiles}
 *   error={errors.files?.message}
 * />
 * ```
 */

export interface FileInputProps
  // `onChange` is replaced with `onFilesChange` (FileList → File[]) — omit
  // the native handler so the type-level signature is unambiguous.
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  /** Visible label rendered above the trigger. */
  label?: ReactNode;
  /** Helper text below the trigger. */
  helperText?: ReactNode;
  /** Error message — shows ⚠ icon + state-error border (mirrors `Input`). */
  error?: ReactNode;
  /** Trigger button label. Default: "파일 선택". */
  buttonLabel?: ReactNode;
  /** Hide the selected-files list. Useful when the parent renders its own. */
  hideSelectedFiles?: boolean;
  /** Class for the outer container. */
  containerClassName?: string;
  /** Fires whenever the selection changes (after browser dialog confirm). */
  onFilesChange?: (files: File[]) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      id: providedId,
      label,
      helperText,
      error,
      buttonLabel = '파일 선택',
      hideSelectedFiles,
      containerClassName,
      className,
      onFilesChange,
      multiple,
      accept,
      disabled,
      ...inputProps
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);
    const localRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLInputElement);
    const [files, setFiles] = useState<File[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      const arr = list ? Array.from(list) : [];
      setFiles(arr);
      onFilesChange?.(arr);
    };

    const removeAt = (idx: number) => {
      const next = files.filter((_, i) => i !== idx);
      setFiles(next);
      onFilesChange?.(next);
      // Reset native input so re-selecting the same file fires onChange.
      if (localRef.current) localRef.current.value = '';
    };

    return (
      <div className={cn('flex flex-col gap-polaris-2xs font-polaris', containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-polaris-body3 text-label-neutral">
            {label}
          </label>
        )}

        <div className={cn('flex items-center gap-polaris-2xs', className)}>
          <Button
            type="button"
            variant="tertiary"
            size="md"
            disabled={disabled}
            onClick={() => localRef.current?.click()}
            aria-describedby={messageId}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {buttonLabel}
          </Button>
          <span className="text-polaris-body3 text-label-alternative truncate">
            {files[0] === undefined
              ? '선택된 파일 없음'
              : files.length === 1
              ? files[0].name
              : `${files[0].name} 외 ${files.length - 1}개`}
          </span>
        </div>

        <input
          ref={localRef}
          id={id}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          onChange={handleChange}
          className="sr-only"
          {...inputProps}
        />

        {!hideSelectedFiles && files.length > 1 && (
          <ul className="flex flex-col gap-polaris-3xs">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-polaris-2xs rounded-polaris-sm bg-fill-neutral px-polaris-2xs py-polaris-3xs"
              >
                <span className="truncate text-polaris-body3 text-label-normal">{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`${f.name} 제거`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-interaction-hover focus-visible:outline-none focus-visible:shadow-polaris-focus"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error"
          >
            <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-polaris-helper text-label-alternative">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
FileInput.displayName = 'FileInput';

/* ================================================================== *
 * FileDropZone — drag & drop + click to pick                  v0.7.5
 * ================================================================== *
 *
 * Larger drop target with full drag-over visual + accessibility:
 *   - keyboard: Tab focuses, Enter/Space opens file picker
 *   - hover/drag-over: surface tint + brand border
 *   - error/disabled states styled via tokens
 *
 * The zone is its own `<div>` (drag target) plus a hidden
 * `<input type="file">`. Clicking anywhere on the zone delegates to
 * the input's `click()`.
 *
 * @example
 * ```tsx
 * <FileDropZone
 *   accept=".pdf,.docx"
 *   multiple
 *   maxSize={10 * 1024 * 1024}            // 10 MB
 *   onFilesChange={(files) => upload(files)}
 *   onReject={(rejections) => toast({ variant: 'destructive', title: rejections[0].reason })}
 * />
 * ```
 */

export interface FileRejection {
  file: File;
  /** Human-readable reason — typically rendered in a toast or under the zone. */
  reason: string;
  code: 'file-too-large' | 'file-invalid-type';
}

export interface FileDropZoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** `accept` attribute forwarded to the native input (e.g. `".pdf,.docx,image/*"`). */
  accept?: string;
  /** Allow multiple files. */
  multiple?: boolean;
  /** Max file size in bytes. Files over this size go to `onReject`. */
  maxSize?: number;
  /** Disable the zone — no clicks, no drops, dimmed visual. */
  disabled?: boolean;
  /** Error string — displayed below the zone with the standard error treatment. */
  error?: ReactNode;
  /** Hint string — displayed below the zone in helper text style. */
  helperText?: ReactNode;
  /** ID forwarded to the underlying input (label `htmlFor` target). */
  id?: string;
  /** Hint shown inside the zone. Default: built-in Korean copy. */
  prompt?: ReactNode;
  /** Fires after files are accepted (after `accept`/`maxSize` filtering). */
  onFilesChange?: (files: File[]) => void;
  /** Fires when files are rejected (size/type). */
  onReject?: (rejections: FileRejection[]) => void;
}

function bytesToReadable(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function matchAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((tok) => {
    if (tok.startsWith('.')) return name.endsWith(tok);
    if (tok.endsWith('/*')) return type.startsWith(tok.slice(0, -1));
    return type === tok;
  });
}

export const FileDropZone = forwardRef<HTMLInputElement, FileDropZoneProps>(
  (
    {
      accept,
      multiple,
      maxSize,
      disabled,
      error,
      helperText,
      prompt,
      id: providedId,
      className,
      onFilesChange,
      onReject,
      ...divProps
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);
    const [dragOver, setDragOver] = useState(false);

    const processFiles = useCallback(
      (list: FileList | File[]) => {
        // Native `<input type="file">` enforces `multiple={false}` on its
        // own picker, but the drag-and-drop path doesn't — the OS hands us
        // every file the user dropped. Trim BEFORE accept/size checks so
        // we don't accidentally reject a valid second file when the
        // consumer only wanted the first one anyway.
        const arr = multiple ? Array.from(list) : Array.from(list).slice(0, 1);
        const accepted: File[] = [];
        const rejected: FileRejection[] = [];
        for (const f of arr) {
          if (!matchAccept(f, accept)) {
            rejected.push({
              file: f,
              code: 'file-invalid-type',
              reason: `허용되지 않는 형식: ${f.name}`,
            });
            continue;
          }
          if (maxSize !== undefined && f.size > maxSize) {
            rejected.push({
              file: f,
              code: 'file-too-large',
              reason: `${f.name} 은(는) ${bytesToReadable(maxSize)} 를 초과합니다.`,
            });
            continue;
          }
          accepted.push(f);
        }
        if (accepted.length > 0) onFilesChange?.(accepted);
        if (rejected.length > 0) onReject?.(rejected);
      },
      [accept, maxSize, multiple, onFilesChange, onReject]
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      // Reset so re-selecting the same file fires onChange again.
      e.target.value = '';
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      // Only flip off when leaving the zone itself, not its children.
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setDragOver(false);
    };

    const onZoneActivate = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    // Compose our internal handlers with whatever the consumer passes
    // through `divProps`. Pulling them out before the spread lets us:
    //   1. fire the consumer's handler first (e.g. analytics logging)
    //   2. honor `event.defaultPrevented` so opt-out works
    //   3. still run our drag/drop / picker activation logic afterwards
    // Without this composition, a consumer's `onClick` would silently
    // overwrite our picker activation handler when spread last.
    const {
      onClick: consumerOnClick,
      onKeyDown: consumerOnKeyDown,
      onDragOver: consumerOnDragOver,
      onDragLeave: consumerOnDragLeave,
      onDrop: consumerOnDrop,
      ...restDivProps
    } = divProps;

    return (
      <div className="flex flex-col gap-polaris-2xs font-polaris">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-describedby={messageId}
          {...restDivProps}
          onClick={(e) => {
            consumerOnClick?.(e);
            if (!e.defaultPrevented) onZoneActivate();
          }}
          onKeyDown={(e) => {
            consumerOnKeyDown?.(e);
            if (e.defaultPrevented) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onZoneActivate();
            }
          }}
          onDragOver={(e) => {
            consumerOnDragOver?.(e);
            if (!e.defaultPrevented) handleDragOver(e);
          }}
          onDragLeave={(e) => {
            consumerOnDragLeave?.(e);
            if (!e.defaultPrevented) handleDragLeave(e);
          }}
          onDrop={(e) => {
            consumerOnDrop?.(e);
            if (!e.defaultPrevented) handleDrop(e);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-polaris-2xs',
            'rounded-polaris-md border-2 border-dashed px-polaris-md py-polaris-lg text-center',
            'cursor-pointer transition-colors',
            'focus-visible:outline-none focus-visible:shadow-polaris-focus',
            dragOver
              ? 'border-accent-brand-normal bg-accent-brand-normal-subtle'
              : 'border-line-normal bg-fill-neutral',
            isError && 'border-state-error',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <Upload className="h-6 w-6 text-label-alternative" aria-hidden="true" />
          <p className="text-polaris-body2 text-label-normal">
            {prompt ?? <>파일을 끌어 놓거나 <span className="text-accent-brand-normal underline">클릭하여 선택</span></>}
          </p>
          {(accept || maxSize) && (
            <p className="text-polaris-helper text-label-alternative">
              {accept && <span>지원 형식: {accept}</span>}
              {accept && maxSize && <span> · </span>}
              {maxSize && <span>최대 {bytesToReadable(maxSize)}</span>}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          onChange={handleChange}
          className="sr-only"
        />

        {error ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error"
          >
            <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-polaris-helper text-label-alternative">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
FileDropZone.displayName = 'FileDropZone';
