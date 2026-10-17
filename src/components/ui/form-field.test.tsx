import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';

describe('FormField', () => {
  it('renders label and input linked by id', () => {
    render(<FormField id="email" label="Email" placeholder="you@example.com" />);

    const label = screen.getByText('Email');
    const input = screen.getByPlaceholderText('you@example.com');
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
    // Label must be associated with the input for accessibility
    expect(label).toHaveAttribute('for', 'email');
  });

  it('shows inline error message when errorMessage is provided', () => {
    render(
      <FormField
        id="password"
        label="Password"
        errorMessage="Password must be at least 8 characters."
        errorId="field-error-password"
      />
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Password must be at least 8 characters.');
    expect(error).toHaveAttribute('id', 'field-error-password');
  });

  it('omits the error element when errorMessage is absent', () => {
    render(<FormField id="name" label="Full Name" />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('forwards input props (type, disabled, placeholder)', () => {
    render(
      <FormField
        id="confirm"
        label="Confirm Password"
        type="password"
        disabled
        placeholder="••••••••"
      />
    );

    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toBeDisabled();
  });

  it('renders a labelAddon alongside the label', () => {
    render(
      <FormField
        id="pw"
        label="Password"
        labelAddon={<a href="/forgot">Forgot?</a>}
      />
    );

    expect(screen.getByRole('link', { name: 'Forgot?' })).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });
});
