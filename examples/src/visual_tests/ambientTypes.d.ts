// https://github.com/puppeteer/puppeteer/issues/6214#issuecomment-693728720
declare global {
  export interface Page {
    waitForTimeout(duration: number): Promise<void>;
  }
}

declare module 'jest-retries' {
  export default function(...args: any[]): any;
}
