/**
 * Accessibility checks for the auth forms' inline validation (#162).
 *
 * The unit tests cover the mapping and the ARIA attributes in happy-dom; these
 * confirm in a real browser that a failed submit actually surfaces the message
 * beside the field, that each input points at it, and that focus moves to the
 * first field that needs fixing.
 */

import { expect, test } from '@playwright/test';

test.describe('auth form inline validation (#162)', () => {
  test('signin reports each invalid field and describes the input', async ({ page }) => {
    await page.goto('/auth/signin');

    const email = page.getByLabel('Email');
    await expect(email).toHaveAttribute('aria-invalid', 'false');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const emailErrorId = await email.getAttribute('aria-describedby');
    expect(emailErrorId).toBe('field-error-email');

    const emailError = page.locator(`#${emailErrorId}`);
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveAttribute('role', 'alert');
    await expect(emailError).toHaveText('Invalid email address. Enter it in the format name@example.com.');

    const password = page.getByLabel('Password');
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#field-error-password')).toHaveText(
      'Password must be at least 6 characters. Re-enter your existing password.'
    );
  });

  test('signup moves focus to the first field that needs fixing', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByLabel('Full Name', { exact: true })).toBeFocused();

    await expect(page.locator('#field-error-name')).toHaveText(
      'Name must be at least 2 characters. Enter the name supporters should see.'
    );
    await expect(page.locator('#field-error-email')).toHaveText(
      'Invalid email address. Enter it in the format name@example.com.'
    );
    await expect(page.locator('#field-error-password')).toHaveText(
      'Password must be at least 8 characters. Use 8 or more characters for your new password.'
    );
  });

  test('signup explains a confirmation password that does not match', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByLabel('Full Name', { exact: true }).fill('Ada Lovelace');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Str0ngPassphrase');
    await page.getByLabel('Confirm Password', { exact: true }).fill('DifferentPassphrase');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.locator('#field-error-confirmPassword')).toHaveText(
      "Passwords don't match. Re-type the confirmation so it matches your new password exactly."
    );
    await expect(page.getByLabel('Confirm Password', { exact: true })).toBeFocused();
  });

  test('the browser does not short-circuit submit with its own tooltip', async ({ page }) => {
    await page.goto('/auth/signup');

    // noValidate on the form: validity comes from the inline Zod messages, so
    // an empty required-by-Zod field must not be blocked by the native UI.
    await expect(page.locator('form')).toHaveAttribute('novalidate', '');

    await page.getByLabel('Email', { exact: true }).fill('not-an-email');
    await page.getByLabel('Full Name', { exact: true }).fill('Ada Lovelace');
    await page.getByLabel('Password', { exact: true }).fill('Str0ngPassphrase');
    await page.getByLabel('Confirm Password', { exact: true }).fill('Str0ngPassphrase');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.locator('#field-error-email')).toHaveText(
      'Invalid email address. Enter it in the format name@example.com.'
    );
    await expect(page.getByLabel('Email', { exact: true })).toBeFocused();
  });

  test('an inline error clears once the value satisfies the schema', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('#field-error-email')).toBeVisible();

    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');

    await expect(page.locator('#field-error-email')).toHaveCount(0);
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });
});