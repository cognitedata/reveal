const favoriteToComments = `favorite to show comments, ${Date.now()}`;
const savedSearch = `saved ${Date.now()}`;
const commentText = `comment text, ${Date.now()}`;
const feedbackText = `feedback text, ${Date.now()}`;

describe('Comments', () => {
  const checkIfCommentsBarIsShowing = () => {
    cy.findByTestId('comments-root').then(($subject) => {
      cy.wrap($subject).findByTestId('editable-area').should('be.visible');
    });
  };

  const goToFavoritesPage = () => {
    cy.log('Go to Favorites page');
    cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
    cy.url().should('include', '/favorites');
  };

  const goToSavedSearches = () => {
    cy.log('Go to Saved Searches tab');
    cy.findByRole('tab', { name: 'Saved Searches' }).click();
    cy.url().should('include', '/saved-searches');
  };

  const openCommentBar = () => {
    cy.log('Open the comment bar');
    cy.findByTestId(`favorite-card-${favoriteToComments}`)
      .findByLabelText('Comment')
      .click();
  };

  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.loginAsAdmin();
    cy.deleteAllFavorites();
    //cy.deleteAllSavedSearches(true);
    cy.log('Create Favorite');
    cy.createFavorite(
      {
        name: favoriteToComments,
      },
      true
    );
    /*
    cy.log('Create Feedback');
    cy.createFeedback({
      payload: {
        comment: feedbackText,
        screenshotB64: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        deleted: false,
        status: 1,
      },
    }, true);*/
    cy.log('Create a savedsearch');
    cy.createSavedSearch(savedSearch, true);
  });

  it('Should show comments on the SavedSearch page', () => {
    goToFavoritesPage();
    goToSavedSearches();
    cy.log('Find the search on the saved searches page');
    cy.findByTitle(savedSearch)
      .parents("[role='row']")
      .then(($row) => {
        //cy.wrap($row).should("be.visible");
        cy.wrap($row).trigger('mouseenter', { force: true });
        cy.log('Go to the comment button');
        cy.wrap($row).findByLabelText('Comment').click({ force: true });
        cy.log('Open the comments on the panel');
        checkIfCommentsBarIsShowing();
      });
  });

  it('Should show comments on the favorite page', () => {
    goToFavoritesPage();
    openCommentBar();
    cy.wait(1000);
    cy.log('Check if the comments section is visible');
    cy.findByTestId('comments-root').then(($subject) => {
      cy.wrap($subject).findByTestId('editable-area').should('be.visible');
    });
  });

  it('Should be able to post comments', () => {
    openCommentBar();
    cy.log('Post a comment');
    cy.findByTestId('comments-root').then(($subject) => {
      cy.wrap($subject).findByTestId('editable-area').type(commentText);
      cy.wrap($subject).findByText('Send').click();
      cy.wait(1500);
      cy.wrap($subject).findByText(commentText).should('be.visible');
    });
  });

  it('Should be able to edit comments', () => {
    openCommentBar();
    cy.findByTestId('comments-root').then(($subject) => {
      cy.wrap($subject).findByText(commentText);
      cy.log('Click the edit comment button');
      cy.wrap($subject).findByLabelText('Edit message').click({ force: true });
      cy.log('Modify the existing comment');
      cy.wrap($subject)
        .findByText(commentText)
        .closest("[data-testid='editable-area']")
        .type('modified');
      cy.log('Save the modified comment');
      cy.findByText('Edit').click({ force: true });
      cy.wrap($subject)
        .findByText(commentText + 'modified')
        .should('be.visible');
    });
  });

  it('Should be able to remove comments', () => {
    cy.findByTestId('comments-root').then(($subject) => {
      cy.wrap($subject)
        .findByText(commentText + 'modified')
        .should('be.visible');
      cy.log('Clicking on the delete button');
      cy.wrap($subject)
        .findByLabelText('Delete message')
        .click({ force: true });
      cy.log('Checking if the comment no longer exists');
      cy.wrap($subject)
        .findByText(commentText + 'modified')
        .should('not.exist');
    });
  });

  after(() => {
    cy.deleteAllFavorites(true);
    cy.deleteAllSavedSearches(true);
  });
});
