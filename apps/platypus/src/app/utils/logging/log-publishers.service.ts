import { LogPublisher } from '@platypus/platypus-core';

import { LogConsole } from './log-console';

export class LogPublishersService {
  constructor() {
    // Build publishers arrays
    this.buildPublishers();
  }

  // Public properties
  publishers: LogPublisher[] = [];

  // Build publishers array
  buildPublishers(): void {
    // Create instance of LogConsole Class
    this.publishers.push(new LogConsole());
  }
}
