/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration options for the RequestThrottler
 */
export interface RequestThrottlerOptions {
  /** Maximum number of concurrent requests */
  maxConcurrent?: number;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Initial delay in ms for exponential backoff */
  initialRetryDelay?: number;
  /** Maximum delay in ms for exponential backoff */
  maxRetryDelay?: number;
}

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  retries: number;
}

/**
 * RequestThrottler manages concurrent API requests with rate limiting and retry logic.
 * This is particularly useful for preventing 429 (Too Many Requests) errors when
 * making many API calls simultaneously.
 */
export class RequestThrottler {
  private readonly maxConcurrent: number;
  private readonly maxRetries: number;
  private readonly initialRetryDelay: number;
  private readonly maxRetryDelay: number;
  private activeRequests: number = 0;
  private readonly queue: Array<QueuedRequest<any>> = [];

  constructor(options: RequestThrottlerOptions = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 10;
    this.maxRetries = options.maxRetries ?? 3;
    this.initialRetryDelay = options.initialRetryDelay ?? 1000;
    this.maxRetryDelay = options.maxRetryDelay ?? 10000;
  }

  /**
   * Add a request to the queue. Returns a promise that resolves when the request completes.
   * Automatically retries on failure with exponential backoff.
   */
  public async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        execute: request,
        resolve,
        reject,
        retries: 0
      });
      this.processQueue();
    });
  }

  /**
   * Execute multiple requests with throttling. Similar to Promise.all but with rate limiting.
   */
  public async addAll<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map(request => this.add(request)));
  }

  /**
   * Get the current number of queued requests
   */
  public get queueSize(): number {
    return this.queue.length;
  }

  /**
   * Get the current number of active requests
   */
  public get activeCount(): number {
    return this.activeRequests;
  }

  private processQueue(): void {
    while (this.activeRequests < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        this.executeRequest(request);
      }
    }
  }

  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    this.activeRequests++;

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error: any) {
      const shouldRetry = this.shouldRetry(error, request.retries);

      if (shouldRetry && request.retries < this.maxRetries) {
        // Retry with exponential backoff
        const delay = this.calculateRetryDelay(request.retries, error);
        request.retries++;

        await this.sleep(delay);

        // Re-queue the request
        this.queue.unshift(request);
      } else {
        request.reject(error);
      }
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private shouldRetry(error: any, retries: number): boolean {
    if (retries >= this.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (error.name === 'NetworkError' || error.name === 'TypeError') {
      return true;
    }

    // Retry on rate limiting (429) and server errors (5xx)
    if (error.response?.status === 429 || (error.response?.status >= 500 && error.response?.status < 600)) {
      return true;
    }

    // Retry if status is 429 in error object
    if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(retryCount: number, error: any): number {
    // Check for Retry-After header (for 429 responses)
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      const retryAfterMs = parseInt(retryAfter) * 1000;
      if (!isNaN(retryAfterMs)) {
        return Math.min(retryAfterMs, this.maxRetryDelay);
      }
    }

    // Exponential backoff with jitter
    const exponentialDelay = this.initialRetryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
    const delay = exponentialDelay + jitter;

    return Math.min(delay, this.maxRetryDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global instance for network requests.
 */
let globalImage360Throttler: RequestThrottler | undefined;

export function getGlobalImage360Throttler(options?: RequestThrottlerOptions): RequestThrottler {
  if (!globalImage360Throttler) {
    globalImage360Throttler = new RequestThrottler({
      maxConcurrent: 20, // Limit to 20 concurrent requests
      maxRetries: 3,
      initialRetryDelay: 1000,
      maxRetryDelay: 30000,
      ...options
    });
  }
  return globalImage360Throttler;
}
