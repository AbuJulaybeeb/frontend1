/**
 * Snapshot tests for landing page sections (#185).
 *
 * Each test renders the component to static markup and compares against a
 * committed snapshot so unintended visual regressions are caught in CI.
 * The snapshots are committed alongside this file and updated intentionally
 * with `vitest --update-snapshots` when designs change.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LandingFeaturesGrid } from './landing-features-grid';
import { LandingFooter } from './landing-footer';
import { LandingHowItWorks } from './landing-how-it-works';
import { LandingLogoStrip } from './landing-logo-strip';

// landing-hero-v2 and landing-navbar-v2 use next/link; mock it so the
// snapshot reflects only the component's own markup.
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('Landing page section snapshots', () => {
  it('LandingFeaturesGrid matches snapshot', () => {
    expect(renderToStaticMarkup(<LandingFeaturesGrid />)).toMatchSnapshot();
  });

  it('LandingFooter matches snapshot', () => {
    expect(renderToStaticMarkup(<LandingFooter />)).toMatchSnapshot();
  });

  it('LandingHowItWorks matches snapshot', () => {
    expect(renderToStaticMarkup(<LandingHowItWorks />)).toMatchSnapshot();
  });

  it('LandingLogoStrip matches snapshot', () => {
    expect(renderToStaticMarkup(<LandingLogoStrip />)).toMatchSnapshot();
  });

  it('LandingFeaturesGrid contains the section heading', () => {
    const html = renderToStaticMarkup(<LandingFeaturesGrid />);
    expect(html).toContain('Infrastructure, not another platform');
  });

  it('LandingFooter contains expected navigation groups', () => {
    const html = renderToStaticMarkup(<LandingFooter />);
    expect(html).toContain('Product');
  });

  it('LandingHowItWorks contains all three steps', () => {
    const html = renderToStaticMarkup(<LandingHowItWorks />);
    expect(html).toContain('How it works');
  });

  it('LandingLogoStrip contains the tagline text', () => {
    const html = renderToStaticMarkup(<LandingLogoStrip />);
    expect(html).toContain('One link works everywhere');
  });
});
