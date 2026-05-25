import {
  createElement,
  useId,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes
} from 'react';

type PolarisButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export function PolarisButton({ type = 'button', children, ...props }: PolarisButtonProps) {
  return createElement('button', { type, ...props }, children);
}

type PolarisInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

export function PolarisInput({ id, label, helperText, className, ...props }: PolarisInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label className="field-control" htmlFor={inputId}>
      <span>{label}</span>
      {createElement('input', {
        id: inputId,
        className: `text-field ${className ?? ''}`,
        ...props
      })}
      {helperText && <small>{helperText}</small>}
    </label>
  );
}

type PolarisTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helperText?: string;
};

export function PolarisTextarea({ id, label, helperText, className, ...props }: PolarisTextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <label className="field-control" htmlFor={textareaId}>
      <span>{label}</span>
      {createElement('textarea', {
        id: textareaId,
        className: `text-field textarea-field ${className ?? ''}`,
        ...props
      })}
      {helperText && <small>{helperText}</small>}
    </label>
  );
}

type PolarisFileDropProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label: string;
  description: string;
  fileName?: string;
  onFileSelect?: (fileName: string) => void;
  onFilesSelect?: (fileNames: string[]) => void;
};

export function PolarisFileDrop({
  id,
  label,
  description,
  fileName,
  onFileSelect,
  onFilesSelect,
  accept,
  className,
  ...props
}: PolarisFileDropProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileNames = Array.from(event.target.files ?? []).map((file) => file.name);
    if (fileNames.length > 0) {
      onFilesSelect?.(fileNames);
      onFileSelect?.(fileNames[0]);
    }
    event.target.value = '';
  };

  return (
    <label className={`file-drop ${className ?? ''}`} htmlFor={inputId}>
      {createElement('input', {
        id: inputId,
        type: 'file',
        accept,
        onChange: handleChange,
        ...props
      })}
      <span className="file-drop-copy">
        <strong>{label}</strong>
        <span>{fileName || description}</span>
      </span>
    </label>
  );
}
