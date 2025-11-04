/**
 * Triggers haptic feedback on supported devices.
 * @param pattern A number or an array of numbers representing the vibration pattern.
 * A single number is a simple vibration for that many milliseconds.
 * An array represents alternating vibration and pause durations.
 */
export const triggerHaptic = (pattern: number | number[] = 10): void => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Haptic feedback failed. This can happen in sandboxed iframes or if permissions are denied.");
    }
  }
};
