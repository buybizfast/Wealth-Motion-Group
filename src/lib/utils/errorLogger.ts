type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userId?: string;
  severity: ErrorSeverity;
  metadata?: Record<string, any>;
}

/**
 * Logger for application errors that can integrate with monitoring services
 * in production environments
 */
class ErrorLogger {
  // Configurable log level threshold
  private logLevel: ErrorSeverity = 'info';
  
  // For development, just log to console
  // In production, this would send to a logging service
  logError({
    message,
    stack,
    componentStack,
    url = typeof window !== 'undefined' ? window.location.href : '',
    userId,
    severity = 'error',
    metadata = {}
  }: ErrorLogData): void {
    // Only log if severity meets or exceeds the threshold
    const severityLevels: Record<ErrorSeverity, number> = {
      'info': 0,
      'warning': 1,
      'error': 2,
      'critical': 3
    };
    
    if (severityLevels[severity] < severityLevels[this.logLevel]) {
      return;
    }
    
    const errorData = {
      timestamp: new Date().toISOString(),
      message,
      stack,
      componentStack,
      url,
      userId,
      severity,
      metadata,
      environment: process.env.NODE_ENV || 'development'
    };
    
    // In development, just log to console
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${severity.toUpperCase()}]`, errorData);
      return;
    }
    
    // In production, this would send to a logging service
    // For example, using Firebase Analytics or a third-party service
    try {
      // Example integration with Firebase Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: message,
          fatal: severity === 'critical'
        });
      }
      
      // You could also implement other logging services here
      // e.g., Sentry, LogRocket, etc.
    } catch (e) {
      // Fallback if the logging service fails
      console.error('Failed to log error to service:', e);
    }
  }
  
  // Set the minimum severity level to log
  setLogLevel(level: ErrorSeverity): void {
    this.logLevel = level;
  }
}

// Export a singleton instance
export const errorLogger = new ErrorLogger(); 