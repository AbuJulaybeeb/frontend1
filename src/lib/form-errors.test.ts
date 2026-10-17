import { describe, expect, it } from 'vitest';
import { getFieldErrorProps, getFriendlyErrorMessage } from './form-errors';

describe('getFriendlyErrorMessage', () => {
  it('keeps the schema constraint and adds an actionable instruction', () => {
    expect(getFriendlyErrorMessage('email', 'Invalid email address')).toBe(
      'Invalid email address. Enter it in the format name@example.com.'
    );
    expect(getFriendlyErrorMessage('name', 'Name must be at least 2 characters')).toBe(
      'Name must be at least 2 characters. Enter the name supporters should see.'
    );
    expect(getFriendlyErrorMessage('password', 'Password must be at least 8 characters')).toBe(
      'Password must be at least 8 characters. Use 8 or more characters for your new password.'
    );
  });

  it('matches messages regardless of case, padding and trailing punctuation', () => {
    expect(getFriendlyErrorMessage('password', '  password must be at least 6 characters. ')).toBe(
      'Password must be at least 6 characters. Re-enter your existing password.'
    );
  });

  it("explains a mismatched password confirmation", () => {
    expect(getFriendlyErrorMessage('confirmPassword', "Passwords don't match")).toContain(
      "Passwords don't match"
    );
    expect(getFriendlyErrorMessage('confirmPassword', "Passwords don't match")).toContain(
      'matches your new password'
    );
  });

  it("replaces Zod's bare 'Required' with a field-scoped instruction", () => {
    expect(getFriendlyErrorMessage('email', 'Required')).toBe(
      'Email is required. Enter the address you use to sign in.'
    );
    expect(getFriendlyErrorMessage('confirmPassword', 'Required')).toBe(
      'Password confirmation is required. Re-type the password you just created.'
    );
  });

  it('falls back to the field label when a required message is not registered', () => {
    expect(getFriendlyErrorMessage('walletId', 'Required')).toBe('Wallet id is required.');
  });

  it('translates Zod string-length defaults into field-scoped wording', () => {
    expect(getFriendlyErrorMessage('name', 'String must contain at least 2 character(s)')).toBe(
      'Full name must be at least 2 characters.'
    );
    expect(getFriendlyErrorMessage('name', 'String must contain at most 100 character(s)')).toBe(
      'Full name cannot be longer than 100 characters.'
    );
  });

  it('treats an absent message as a required field', () => {
    expect(getFriendlyErrorMessage('password')).toBe(
      'Password is required. Enter your password to continue.'
    );
    expect(getFriendlyErrorMessage('password', '   ')).toBe(
      'Password is required. Enter your password to continue.'
    );
  });

  it('preserves unknown messages but normalizes them into a sentence', () => {
    expect(getFriendlyErrorMessage('email', 'that account already exists')).toBe(
      'That account already exists.'
    );
    expect(getFriendlyErrorMessage('email', 'Try again later.')).toBe('Try again later.');
  });

  it('humanizes unknown field names', () => {
    expect(getFriendlyErrorMessage('displayName', 'Required')).toBe('Display name is required.');
  });
});

describe('getFieldErrorProps', () => {
  it('marks a valid field as not invalid and links nothing', () => {
    const props = getFieldErrorProps('email');

    expect(props.message).toBeUndefined();
    expect(props.aria['aria-invalid']).toBe(false);
    expect(props.aria['aria-describedby']).toBeUndefined();
  });

  it('links the invalid field to the id of its inline message', () => {
    const props = getFieldErrorProps('email', 'Invalid email address');

    expect(props.errorId).toBe('field-error-email');
    expect(props.aria).toEqual({
      'aria-invalid': true,
      'aria-describedby': 'field-error-email',
    });
    expect(props.message).toBe(
      'Invalid email address. Enter it in the format name@example.com.'
    );
  });

  it('derives a stable id for every field so describedby never dangles', () => {
    expect(getFieldErrorProps('confirmPassword').errorId).toBe('field-error-confirmPassword');
    expect(getFieldErrorProps('confirmPassword', 'Required').aria['aria-describedby']).toBe(
      'field-error-confirmPassword'
    );
  });
});