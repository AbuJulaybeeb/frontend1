import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InlineFormError } from './inline-form-error';

describe('InlineFormError', () => {
  it('renders the message in an alert region so it is announced', () => {
    render(<InlineFormError message="Password is required." />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Password is required.');
  });

  it('renders nothing when there is no message', () => {
    const { container } = render(<InlineFormError message={undefined} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders nothing for a blank message', () => {
    const { container } = render(<InlineFormError message="   " />);

    expect(container).toBeEmptyDOMElement();
  });

  it('exposes the id that the field points at with aria-describedby', () => {
    render(<InlineFormError id="field-error-email" message="Invalid email address." />);

    expect(screen.getByRole('alert')).toHaveAttribute('id', 'field-error-email');
  });

  it('hides the decorative icon from assistive technology', () => {
    const { container } = render(<InlineFormError message="Invalid email address." />);

    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges a caller supplied class name', () => {
    render(<InlineFormError message="Invalid email address." className="mt-2" />);

    expect(screen.getByRole('alert').className).toContain('mt-2');
  });
});