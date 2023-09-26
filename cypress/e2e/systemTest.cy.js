describe('Creating a user to be able to add books', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });
    it('should sign up user with valid credentials', () => {
        cy.get('button').contains('Sign Up').click();
        cy.get('#signUpEmail').type('test.test@gmail.com');
        cy.get('#signUpPassword').type('Passw0rd');
        cy.get('#signUpModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
    });
    it('should log in a user perform different tasks with recipes and sign out', () => {
        cy.get('button').contains('Sign In').click();
        cy.get('#signInEmail').type('test.test@gmail.com');
        cy.get('#signInPassword').type('Passw0rd');
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.wait(1500);
        cy.get('button').contains('Add Recipe').click();
        cy.get('#addRecipeTitle').type('New Recipe');
        cy.get('#addRecipeContent').type('Recipe content');
        cy.get('#addRecipeModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.wait(1500);
        cy.get('.recipe-card').should('contain', 'New Recipe');
        cy.wait(1500);
        cy.get(':nth-child(2) > .btn').click();
        cy.get('#editRecipeTitle').type('2');
        cy.get('#editRecipeContent').type('2');
        cy.get('#editRecipeModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.wait(1500);
        cy.get('.recipe-card').should('contain', 'New Recipe2');
        cy.get(':nth-child(2) > .btn-close').click();
        cy.wait(1500);
        cy.get('.recipe-card').should('not.contain', 'New Recipe2');
        cy.get('button').contains('Sign Out').click();
        cy.wait(1500);
    });
});