import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import type { MessageKey } from '@/i18n/types';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** i18n key produced by the zod schema, or an already translated string. */
  error?: string;
  optional?: boolean;
  className?: string;
  /** A single input-like element; id and aria attributes are injected. */
  children: ReactElement;
}

/** Label + control + hint + error, wired for screen readers. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const { t } = useI18n();
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // t() returns unknown strings unchanged, so plain text errors pass through too.
  const message = error ? t(error as MessageKey) : undefined;
  // The error replaces the hint on screen, so it replaces it for screen readers too.
  const describedBy = message ? errorId : hint ? hintId : undefined;

  const ownId = isValidElement<Record<string, unknown>>(children) ? (children.props.id as string | undefined) : undefined;
  const controlId = ownId ?? id;
  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        id: controlId,
        'aria-invalid': message ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={controlId} className="field-label">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted-foreground">({t('common.optional')})</span>}
      </label>
      {control}
      {hint && !message && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {message && (
        <p id={errorId} className="field-error" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
