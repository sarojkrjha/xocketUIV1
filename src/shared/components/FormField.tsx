import type { InputHTMLAttributes, ReactNode } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightSlot?: ReactNode;
};

export function FormField({ label, error, rightSlot, id, ...props }: FormFieldProps) {
  return (
    <div className="xocket-form-group">
      <label className="xocket-form-label" htmlFor={id}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input id={id} className="xocket-form-input" {...props} />
        {rightSlot ? (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        ) : null}
      </div>

      {error ? <div className="xocket-form-error">{error}</div> : null}
    </div>
  );
}
