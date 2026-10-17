/**
 * Mobile-first checks for the transaction surfaces (#168).
 *
 * CSS reflow cannot be proven in a jsdom/happy-dom unit test, so these run in
 * a real browser at the narrow reflow widths and either side of the `md`
 * boundary. Assertions are scoped to the components under test rather than to
 * the whole document, so an unrelated page-level overflow cannot mask or fake a
 * result here.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';

/** Below `md` the tables stack and the filter bar collapses. */
const NARROW_WIDTHS = [320, 375];
/** Either side of the `md` boundary used by `.responsive-table`. */
const AROUND_MD = [767, 768, 769];

const FILTER_LABELS = [
  'From',
  'To',
  'Min amount',
  'Max amount',
  'Message search',
  'Status',
  'Sort by',
  'Order',
];

const analyticsPayload = {
  range: '30d',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  summary: {
    totalEarnings: 1845.5,
    earningsThisMonth: 620.25,
    earningsThisWeek: 144.75,
    totalTips: 38,
  },
  earningsTrend: [
    { date: '2026-09-28', amount: 42.5 },
    { date: '2026-09-29', amount: 74 },
    { date: '2026-09-30', amount: 28.25 },
  ],
  sourceBreakdown: [
    { source: 'Profile page', amount: 420.25, count: 18 },
    { source: 'Shared link', amount: 200, count: 20 },
  ],
  topTippers: [
    {
      id: 'tipper-1',
      name: 'Maya Chen',
      totalAmount: 300,
      tipCount: 6,
      lastTipAt: '2026-09-30T00:00:00.000Z',
      latestMessage: 'Your September series changed my routine, thank you!',
    },
    {
      id: 'tipper-2',
      name: 'Jonas K.',
      totalAmount: 180,
      tipCount: 4,
      lastTipAt: '2026-09-29T00:00:00.000Z',
    },
  ],
};

async function mockCreatorAnalytics(page: Page): Promise<void> {
  await page.route('**/api/creators/*/analytics**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(analyticsPayload),
    });
  });
}

async function mockDashboardData(page: Page): Promise<void> {
  await page.route('**/api/v1/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith('/api/v1/wallet/list')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], timestamp: new Date().toISOString() }),
      });
      return;
    }

    if (pathname.includes('/transaction')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          transactions: [
            {
              id: 'tx-1',
              amount: 25,
              status: 'confirmed',
              createdAt: '2026-09-30T12:00:00.000Z',
              senderUsername: 'maya',
              message: 'A deliberately long thank you message that would overflow a narrow column.',
              transactionHash: 'abcdef1234567890',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      });
      return;
    }

    if (pathname.includes('/earning') || pathname.includes('/balance')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          totalEarnings: 1200,
          availableBalance: 940,
          pendingBalance: 45,
        }),
      });
      return;
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({}) });
  });
}

async function authenticateCreator(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'Dorisio-auth',
      JSON.stringify({
        state: {
          user: { id: 'u1', username: 'demo', role: 'creator' },
          isAuthenticated: true,
        },
        version: 0,
      })
    );
  });
}

/** How far the element's content spills outside its own box, in CSS pixels. */
async function overflowBy(locator: Locator): Promise<number> {
  return locator.evaluate((el) => el.scrollWidth - el.clientWidth);
}

/** The generated `content` of a cell's `::before` label. */
async function generatedLabel(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el, '::before').content);
}

test.describe('mobile-first transaction surfaces (#168)', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardData(page);
    await mockCreatorAnalytics(page);
    await authenticateCreator(page);
  });

  for (const width of [...NARROW_WIDTHS, ...AROUND_MD, 1024]) {
    test(`transaction filters stay inside the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/creators/demo/dashboard');

      const bar = page.getByTestId('transaction-filter-bar');
      await expect(bar).toBeVisible();
      expect(await overflowBy(bar), `filter bar overflows at ${width}px`).toBeLessThanOrEqual(1);

      for (const label of FILTER_LABELS) {
        const control = page.getByLabel(label, { exact: true });
        await expect(control, `${label} is not rendered at ${width}px`).toBeVisible();

        const box = await control.boundingBox();
        expect(box, `${label} has no box at ${width}px`).not.toBeNull();
        expect(box!.x, `${label} starts off-screen at ${width}px`).toBeGreaterThanOrEqual(0);
        expect(
          box!.x + box!.width,
          `${label} extends past the viewport at ${width}px`
        ).toBeLessThanOrEqual(width + 1);
      }

      // The primary actions stay reachable and fully on screen.
      const actions = [page.getByRole('button', { name: 'Reset' }), page.getByRole('button', { name: /export csv \(\d+\)/i })];
      for (const action of actions) {
        await expect(action).toBeVisible();
        const box = await action.boundingBox();
        expect(box!.x + box!.width, `action overflows at ${width}px`).toBeLessThanOrEqual(
          width + 1
        );
      }
    });
  }

  for (const width of NARROW_WIDTHS) {
    test(`transaction history reflows into stacked rows at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/creators/demo/dashboard');

      const table = page.locator('table.responsive-table');
      await expect(table).toBeVisible();

      // The stacked layout fits the viewport, so nothing scrolls sideways.
      expect(await overflowBy(table), `table overflows at ${width}px`).toBeLessThanOrEqual(1);
      // Column names move onto the cells, so the header row is not repeated.
      await expect(table.locator('thead')).toBeHidden();
    });
  }

  for (const width of AROUND_MD.filter((value) => value >= 768)) {
    test(`transaction history keeps its column header at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/creators/demo/dashboard');

      const table = page.locator('table.responsive-table');
      await expect(table).toBeVisible();
      await expect(table.locator('thead')).toBeVisible();
    });
  }

  for (const width of NARROW_WIDTHS) {
    test(`top tippers table names every column at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/creators/demo/analytics');

      const table = page.getByTestId('top-tippers-table').locator('table');
      await expect(table).toBeVisible();
      expect(await overflowBy(table), `table overflows at ${width}px`).toBeLessThanOrEqual(1);
      await expect(table.locator('thead')).toBeHidden();

      // The two values the issue calls out: total tipped and last tip date.
      const amount = table.locator('td[data-label="Total Tipped"]').first();
      const lastTip = table.locator('td[data-label="Last Tip"]').first();
      await expect(amount).toBeVisible();
      await expect(lastTip).toBeVisible();
      expect(await generatedLabel(amount)).toContain('Total Tipped');
      expect(await generatedLabel(lastTip)).toContain('Last Tip');
    });
  }

  for (const width of AROUND_MD.filter((value) => value >= 768)) {
    test(`top tippers table returns to normal table layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/creators/demo/analytics');

      const table = page.getByTestId('top-tippers-table').locator('table');
      await expect(table).toBeVisible();
      await expect(table.locator('thead')).toBeVisible();

      const amount = table.locator('td[data-label="Total Tipped"]').first();
      await expect(amount).toBeVisible();
      // No generated label once the header row is showing again.
      expect(await generatedLabel(amount)).not.toContain('Total Tipped');
    });
  }
});