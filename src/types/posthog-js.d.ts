declare module 'posthog-js' {
  type EventProperties = Record<string, string | number | boolean | null | undefined>;
  type InitOptions = Record<string, string | number | boolean | null | undefined>;
  type PostHogConfig = Record<string, unknown>;

  interface PostHog {
    init(apiKey: string, options?: InitOptions): void;
    track(event: string, properties?: EventProperties): void;
    identify(userId: string, properties?: EventProperties): void;
    reset(): void;
    capture(event: string, properties?: EventProperties): void;
    alias(userId: string): void;
    setPersonProperties(properties: EventProperties): void;
    onFeatureFlags(callback: () => void): void;
    getFeatureFlag(key: string): string | boolean | undefined;
    __loaded?: boolean;
    [key: string]: unknown;
  }

  const posthog: PostHog;
  export default posthog;
  export { PostHog };
}
