/**
 * Inline Form Error
 * Renders a single field's validation failure directly beneath its control.
 *
 * The wrapper carries `role="alert"` so the message is announced as soon as it
 * is inserted into the DOM after a failed submit. The message is the element's
 * only text node, which keeps it a single, unambiguous accessible announcement
 * rather than a nested label/value pair. See
 * `src/lib/form-errors.ts` for the message copy and the id wiring.
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InlineFormErrorProps {
  /** Element id referenced by the field's `aria-describedby`. */
  id?: string;
  /** Actionable message. Nothing renders when it is empty. */
  message?: string | null;
  className?: string;
}

export function InlineFormError({
  id,
  message,
  className,
}: InlineFormErrorProps): JSX.Element | null {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn('flex items-start gap-1.5 text-xs font-medium text-destructive', className)}
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}