// =============================================================================
// Retry Utility
// =============================================================================

/**
 * Attempts to execute `fn` up to `maxRetries` times.
 *
 * On each failure (except the last), waits for the backoff duration at
 * `backoffMs[attemptIndex]`. If `attemptIndex >= backoffMs.length`, the last
 * element of `backoffMs` is used (clamped).
 *
 * If all attempts fail, the last error is rethrown.
 *
 * @param fn         - The async function to attempt
 * @param maxRetries - Maximum number of total attempts (must be >= 1)
 * @param backoffMs  - Array of wait durations in milliseconds between retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  backoffMs: number[],
): Promise<T> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const isLastAttempt = attempt === maxRetries - 1;
      if (!isLastAttempt) {
        const delayIndex = Math.min(attempt, backoffMs.length - 1);
        const delay = backoffMs[delayIndex] ?? 1000;
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Returns a Promise that resolves after `ms` milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
