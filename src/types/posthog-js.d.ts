declare module 'posthog-js' {
  interface PostHog {
    init(apiKey: string, options?: any): void;
    track(event: string, properties?: any): void;
    identify(userId: string, properties?: any): void;
    reset(): void;
    capture(event: string, properties?: any): void;
    alias(userId: string): void;
    setPersonProperties(properties: any): void;
    [key: string]: any;
  }

  const posthog: PostHog;
  export default posthog;
  export { PostHog };
}
