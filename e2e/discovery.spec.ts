import { expect, test } from '@playwright/test';

const creators = [
  {
    id: 'creator-maya',
    userId: 'user-maya',
    username: 'maya-chen',
    displayName: 'Maya Chen',
    bio: 'Independent painter sharing studio notes and new work.',
    verified: true,
    isPublic: true,
    totalEarnings: 1240,
    pendingBalance: 35,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'creator-noah',
    userId: 'user-noah',
    username: 'noah-rivera',
    displayName: 'Noah Rivera',
    bio: 'Music producer and sound designer.',
    verified: false,
    isPublic: true,
    totalEarnings: 860,
    pendingBalance: 20,
    createdAt: '2026-02-10T00:00:00.000Z',
  },
];

const mayaProfile = {
  ...creators[0],
  category: 'Art',
};

test('searches creators by name and opens the matching profile', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'Dorisio-auth',
      JSON.stringify({
        state: {
          user: { id: 'user-supporter', username: 'supporter', role: 'fan' },
          token: 'playwright-test-token',
          isAuthenticated: true,
        },
        version: 0,
      })
    );
  });

  await page.route('**/api/v1/**', async (route) => {
    const { pathname } = new URL(route.request().url());

    if (route.request().method() === 'GET' && pathname.endsWith('/creators/profile/maya-chen')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mayaProfile }),
      });
      return;
    }

    if (route.request().method() === 'GET' && pathname.endsWith('/creators')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { creators, total: creators.length, page: 1, pageSize: 20 },
        }),
      });
      return;
    }

    if (pathname.includes('/transactions')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { transactions: [], total: 0, page: 1, pageSize: 20 },
        }),
      });
      return;
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
  });

  await page.goto('/creators');
  await expect(page.getByRole('heading', { name: 'Discover Creators' })).toBeVisible();

  await page.getByRole('combobox', { name: 'Search creators' }).fill('Maya Chen');

  const mayaResult = page.locator('a[href="/creators/maya-chen"]');
  const noahResult = page.locator('a[href="/creators/noah-rivera"]');
  await expect(mayaResult).toBeVisible();
  await expect(noahResult).toHaveCount(0);
  await expect(page.getByText('Showing 1 creator')).toBeVisible();

  await mayaResult.click();

  await expect(page).toHaveURL(/\/creators\/maya-chen$/);
  await expect(page.getByRole('heading', { name: 'Maya Chen', level: 1 })).toBeVisible();
  await expect(page.getByText('@maya-chen', { exact: true })).toBeVisible();
  await expect(page.getByText(mayaProfile.bio, { exact: true })).toBeVisible();
});