// =============================================================================
// Simple structured logger
// =============================================================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

export const logger = {
  /**
   * Logs an informational message to stdout.
   */
  info(message: string, ...args: unknown[]): void {
    console.log(formatMessage('INFO', message), ...args);
  },

  /**
   * Logs a warning message to stdout.
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(formatMessage('WARN', message), ...args);
  },

  /**
   * Logs an error message to stderr.
   */
  error(message: string, ...args: unknown[]): void {
    console.error(formatMessage('ERROR', message), ...args);
  },
};
