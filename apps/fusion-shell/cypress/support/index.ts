/// <reference types="cypress" />
// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensurePageFinishedLoading(): void;
    createLink(navigateTo: string): string;
    navigate(navigateTo: string): void;
    getBySel<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    getBySelLike<E extends Node = HTMLElement>(
      selector: string
    ): Chainable<JQuery<E>>;
    setup(): void;
  }
}
