export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: ProblemDetails;

  constructor(message: string, status?: number, details?: ProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  const maybeAxios = error as { response?: { status?: number; data?: ProblemDetails | string } };
  const status = maybeAxios.response?.status;
  const data = maybeAxios.response?.data;

  if (typeof data === 'object' && data !== null) {
    const message = data.detail ?? data.title ?? 'The server returned an error.';
    return new ApiError(message, status, data);
  }

  if (typeof data === 'string' && data.length > 0) {
    return new ApiError(data, status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, status);
  }

  return new ApiError('Unexpected API error.', status);
}
