import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineFormError } from '@/components/shared/inline-form-error';
import type { InputProps } from '@/components/ui/input';

export interface FormFieldProps extends InputProps {
  /** Visible label text rendered above the input. */
  label: string;
  /** The `id` shared between the Label's `htmlFor` and the Input's `id`. */
  id: string;
  /** Actionable validation message; omit or pass `undefined` when the field is valid. */
  errorMessage?: string;
  /** Element id for the error paragraph, referenced by `aria-describedby`. */
  errorId?: string;
  /** Optional content rendered in the label row to the right of the label text. */
  labelAddon?: React.ReactNode;
}

/**
 * Reusable wrapper combining Label + Input + InlineFormError with consistent
 * spacing, replacing the repeated `<div className="space-y-2">…</div>` block
 * found in signup-form, signin-form, and settings forms.
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, errorMessage, errorId, labelAddon, ...inputProps }, ref) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        {labelAddon}
      </div>
      <Input id={id} ref={ref} {...inputProps} />
      <InlineFormError id={errorId} message={errorMessage} />
    </div>
  )
);

FormField.displayName = 'FormField';
