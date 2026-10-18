import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SignInForm from './signin-form';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderForm(): { form: HTMLFormElement } {
  const { container } = render(<SignInForm />);
  return { form: container.querySelector('form') as HTMLFormElement };
}

async function submit(form: HTMLFormElement): Promise<void> {
  await act(async () => {
    fireEvent.submit(form);
  });
}

describe('SignInForm inline validation (#162)', () => {
  it('starts with no errors and marks both inputs as valid', () => {
    renderForm();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-describedby');
  });

  it('defers validity to the inline messages instead of the browser tooltips', () => {
    const { form } = renderForm();

    expect(form).toHaveAttribute('novalidate');
  });

  it('renders an actionable message for every invalid field on submit', async () => {
    const { form } = renderForm();

    await submit(form);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent(
      'Invalid email address. Enter it in the format name@example.com.'
    );
    expect(alerts[1]).toHaveTextContent(
      'Password must be at least 6 characters. Re-enter your existing password.'
    );
  });

  it('points each invalid input at its own message via aria-describedby', async () => {
    const { form } = renderForm();

    await submit(form);

    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', 'field-error-email');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAttribute('aria-describedby', 'field-error-password');

    // The referenced element really exists and is the alert region.
    expect(document.getElementById(email.getAttribute('aria-describedby') as string)).toHaveAttribute(
      'role',
      'alert'
    );
  });

  it('moves focus to the first invalid field after a failed submit', async () => {
    const { form } = renderForm();

    await submit(form);

    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('clears a field error as soon as the value becomes valid', async () => {
    const { form } = renderForm();
    await submit(form);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'user@example.com' },
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
    });
    expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
    // The untouched password keeps its own message.
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('submits without showing errors once both fields are valid', async () => {
    const { form } = renderForm();

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    });

    await submit(form);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});