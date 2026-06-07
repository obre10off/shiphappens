/**
 * App feature flags / config.
 *
 * Single source of truth for toggling UI surfaces and behavior without code
 * surgery at the call site. Flip a flag here and rebuild.
 */
export const featureFlags = {
  /**
   * Show the "Agent tool calls" visualization (`ToolCallStream`) while a
   * screening is running. Disabled by default — the agent's tool-calling loop
   * still runs exactly the same; only its visual surface in the UI is gated.
   */
  showAgentToolCalls: false,
} as const;

export type FeatureFlags = typeof featureFlags;
