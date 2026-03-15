import { AlertTriangle, AlertCircle, CheckCircle, InfoIcon } from 'lucide-react';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Inline error alert component
 */
export function ErrorAlert({
  title = 'Error',
  message,
  details,
  type = 'error',
  onDismiss,
  action,
}: ErrorDisplayProps) {
  const config = {
    error: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      titleColor: 'text-red-900',
      accentColor: 'text-red-600',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      titleColor: 'text-yellow-900',
      accentColor: 'text-yellow-600',
    },
    info: {
      icon: InfoIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-900',
      accentColor: 'text-blue-600',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      titleColor: 'text-green-900',
      accentColor: 'text-green-600',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-5 w-5 ${config.accentColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
          {details && (
            <p className={`text-xs ${config.textColor} opacity-75 mt-2 font-mono`}>
              {details}
            </p>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className={`text-sm font-medium ${config.accentColor} hover:underline mt-3`}
            >
              {action.label}
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.accentColor} hover:opacity-70`}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Error form field message
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

/**
 * Error utilities
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromResponse(error: any): AppError {
    if (error.response?.data) {
      const data = error.response.data;
      return new AppError(
        data.message || 'An error occurred',
        data.code || 'UNKNOWN_ERROR',
        error.response.status,
        data.errors
      );
    }

    if (error instanceof AppError) {
      return error;
    }

    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR';
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'AUTH_ERROR';
  }

  isForbiddenError(): boolean {
    return this.statusCode === 403 || this.code === 'FORBIDDEN';
  }
}

/**
 * Safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Safe error code extractor
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Retry on server errors and specific client errors
    return (
      error.isServerError() ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  return false;
}

/**
 * Convert form errors to field errors
 */
export function parseFormErrors(
  errors: any
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!errors) return fieldErrors;

  // Handle Zod validation errors
  if (errors.fieldErrors) {
    Object.entries(errors.fieldErrors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0];
      }
    });
  }

  // Handle API validation errors
  if (errors.details && typeof errors.details === 'object') {
    Object.entries(errors.details).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = messages[0];
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    });
  }

  return fieldErrors;
}
