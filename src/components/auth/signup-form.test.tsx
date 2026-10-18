import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SignUpForm from './signup-form';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderForm(): { form: HTMLFormElement } {
  const { container } = render(<SignUpForm />);
  return { form: container.querySelector('form') as HTMLFormElement };
}

async function submit(form: HTMLFormElement): Promise<void> {
  await act(async () => {
    fireEvent.submit(form);
  });
}

function fillSignupForm(overrides: { password?: string; confirmPassword?: string } = {}): void {
  const values: Array<[string, string]> = [
    ['Full Name', 'Ada Lovelace'],
    ['Email', 'ada@example.com'],
    ['Password', overrides.password ?? 'Str0ngPassphrase'],
    ['Confirm Password', overrides.confirmPassword ?? overrides.password ?? 'Str0ngPassphrase'],
  ];

  for (const [label, value] of values) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

describe('SignUpForm inline validation (#162)', () => {
  it('starts with no errors and marks every input as valid', () => {
    renderForm();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    for (const label of ['Full Name', 'Email', 'Password', 'Confirm Password']) {
      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(label)).not.toHaveAttribute('aria-describedby');
    }
  });

  it('defers validity to the inline messages instead of the browser tooltips', () => {
    const { form } = renderForm();

    expect(form).toHaveAttribute('novalidate');
  });

  it('renders an actionable message for every invalid field on submit', async () => {
    const { form } = renderForm();

    await submit(form);

    // `confirmPassword` is a bare `z.string()`, and an empty string already
    // satisfies it, so only the three constrained fields report a failure.
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
    expect(alerts[0]).toHaveTextContent(
      'Name must be at least 2 characters. Enter the name supporters should see.'
    );
    expect(alerts[1]).toHaveTextContent(
      'Invalid email address. Enter it in the format name@example.com.'
    );
    expect(alerts[2]).toHaveTextContent(
      'Password must be at least 8 characters. Use 8 or more characters for your new password.'
    );
    expect(screen.queryByText(/password confirmation is required/i)).not.toBeInTheDocument();
  });

  it('points each invalid input at its own message via aria-describedby', async () => {
    const { form } = renderForm();

    await submit(form);

    const expected: Array<[string, string]> = [
      ['Full Name', 'field-error-name'],
      ['Email', 'field-error-email'],
      ['Password', 'field-error-password'],
    ];

    for (const [label, errorId] of expected) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', errorId);
      expect(document.getElementById(errorId)).toHaveAttribute('role', 'alert');
    }

    // A field without a failure must not reference a message that is not rendered.
    const confirmPassword = screen.getByLabelText('Confirm Password');
    expect(confirmPassword).toHaveAttribute('aria-invalid', 'false');
    expect(confirmPassword).not.toHaveAttribute('aria-describedby');
  });

  it('moves focus to the first invalid field after a failed submit', async () => {
    const { form } = renderForm();

    await submit(form);

    expect(screen.getByLabelText('Full Name')).toHaveFocus();
  });

  it('explains a password confirmation that does not match', async () => {
    const { form } = renderForm();

    await act(async () => {
      fillSignupForm({ password: 'Str0ngPassphrase', confirmPassword: 'DifferentPassphrase' });
    });

    await submit(form);

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Passwords don't match. Re-type the confirmation so it matches your new password exactly."
    );
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Confirm Password')).toHaveFocus();
  });

  it('rejects a password shorter than the schema requires', async () => {
    const { form } = renderForm();

    await act(async () => {
      fillSignupForm({ password: 'short1', confirmPassword: 'short1' });
    });

    await submit(form);

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 8 characters. Use 8 or more characters for your new password.'
    );
  });

  it('submits without showing errors once the form is valid', async () => {
    const { form } = renderForm();

    await act(async () => {
      fillSignupForm();
    });

    await submit(form);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});