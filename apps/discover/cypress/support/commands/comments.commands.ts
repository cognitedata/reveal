const COMMENT_TEXT = `comment text, ${Date.now()}`;
const COMMENT_EDIT = '-edit';
const COMMENT_TEXT_EDITED = `${COMMENT_TEXT}${COMMENT_EDIT}`;

const openCommentBar = () => {
  cy.log('Open the comment bar');
  cy.findAllByLabelText('Comment').first().click();
};

const postComment = () => {
  cy.log('Post a comment');

  cy.findByTestId('comments-root').then(($subject) => {
    cy.wrap($subject).findByTestId('editable-area').type(COMMENT_TEXT);
    cy.wrap($subject).findByText('Send').click();
    cy.wait(1500);
    cy.wrap($subject).findByText(COMMENT_TEXT).should('be.visible');
  });
};

const editComment = () => {
  cy.log('Edit a comment');

  cy.findByTestId('comments-root').then(($subject) => {
    cy.wrap($subject).findByText(COMMENT_TEXT);
    cy.log('Click the edit comment button');
    cy.wrap($subject).findByLabelText('Edit message').click({ force: true });
    cy.log('Modify the existing comment');
    cy.wrap($subject)
      .findByText(COMMENT_TEXT)
      .closest("[data-testid='editable-area']")
      .type(COMMENT_EDIT);
    cy.log('Save the modified comment');
    cy.findByText('Save').click({ force: true });
    cy.wrap($subject).findByText(COMMENT_TEXT_EDITED).should('be.visible');
  });
};

const deleteComment = () => {
  cy.log('Should be able to remove comments');
  cy.findByTestId('comments-root').then(($subject) => {
    cy.wrap($subject).findByText(COMMENT_TEXT_EDITED).should('be.visible');
    cy.log('Clicking on the delete button');
    cy.wrap($subject).findByLabelText('Delete message').click({ force: true });
    cy.log('Checking if the comment no longer exists');
    cy.wrap($subject).findByText(COMMENT_TEXT_EDITED).should('not.exist');
  });
};

Cypress.Commands.add('openCommentBar', openCommentBar);
Cypress.Commands.add('postComment', postComment);
Cypress.Commands.add('editComment', editComment);
Cypress.Commands.add('deleteComment', deleteComment);

export interface CommentCommands {
  openCommentBar(): void;
  postComment(): void;
  editComment(): void;
  deleteComment(): void;
}
