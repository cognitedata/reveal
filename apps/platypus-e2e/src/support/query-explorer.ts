/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    assertQueryExplorerResult(expectedResult: any, timeout?: number): void;
    clickQueryExplorerExecuteQuery(): void;
    setQueryExplorerQuery(query: string): void;
  }
}

/*
Taken from https://github.com/graphql/graphiql/blob/main/packages/graphiql/cypress/support/commands.ts#L116
*/
Cypress.Commands.add('assertQueryExplorerResult', (expectedResult) => {
  cy.get('section.result-window').should((element) => {
    expect(normalizeWhitespace(element.get(0).innerText)).to.equal(
      JSON.stringify(expectedResult, null, 2)
    );
  });
});

function normalizeWhitespace(str: string) {
  return str.replace(/\u00a0/g, ' ');
}

Cypress.Commands.add('clickQueryExplorerExecuteQuery', () => {
  return cy.get('.graphiql-execute-button').click();
});

Cypress.Commands.add('setQueryExplorerQuery', (query: string) => {
  cy.get('.graphiql-query-editor textarea').type(query, {
    force: true,
    parseSpecialCharSequences: false,
  });
});
