describe('Adding recipes as existing user', () => {
  it('should log in a user and create a new book successfully', () => {
    cy.visit('http://localhost:3000');
    cy.get('button').contains('Sign In').click({ force: true });
    cy.wait(1000);
    cy.get('#signInEmail').type('admin');
    cy.wait(1000);
    cy.get('#signInPassword').type('admin123');
    cy.wait(1000);
    cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({ force: true });
    cy.wait(2000);
    cy.get('button').contains('Add Recipe').click({ force: true });
    cy.wait(1000);
    cy.get('#addRecipeTitle').type('New Recipe');
    cy.wait(1000);
    cy.get('#addRecipeContent').type('Recipe content');
    cy.wait(1000);
    cy.get('#addRecipeModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({ force: true });
    cy.wait(2000);
    cy.get('.recipe-card').should('contain', 'New Recipe');
  });
});
