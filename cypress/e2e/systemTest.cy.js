describe('Creating a user to be able to add books', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });
    it('should sign up user with valid credentials', () => {
        cy.get('button').contains('Sign Up').click({force: true});
        cy.wait(1000);
        cy.get('#signUpUsername').type('Test');
        cy.wait(1000);
        cy.get('#signUpEmail').type('test.test@gmail.com');
        cy.wait(1000);
        cy.get('#signUpPassword').type('Passw0rd');
        cy.wait(1000);
        cy.get('#signUpModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
    });
    it('should log in a user perform different tasks with recipes and sign out', () => {
        cy.get('button').contains('Sign In').click({force: true});
        cy.wait(1000);
        cy.get('#signInEmail').type('test.test@gmail.com');
        cy.wait(1000);
        cy.get('#signInPassword').type('Passw0rd');
        cy.wait(1000);
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
        cy.wait(1500);
        cy.get('button').contains('Add Recipe').click({force: true});
        cy.wait(1000);
        cy.get('#addRecipeTitle').type('New Recipe');
        cy.wait(1000);
        cy.get('#addRecipeContent').type('Recipe content');
        cy.wait(1000);
        cy.get('#addRecipeModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
        cy.wait(1500);
        cy.get('.recipe-card').should('contain', 'New Recipe');
        cy.wait(1500);
        cy.get('#recipe-list > :nth-child(2) > .row > [data-bs-toggle="modal"]').click({ force: true });
        cy.get('#editRecipeTitle').type('2');
        cy.wait(1000);
        cy.get('#editRecipeContent').type('2');
        cy.wait(1000);
        cy.get('#editRecipeModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
        cy.wait(1500);
        cy.get('.recipe-card').should('contain', 'New Recipe2');
        cy.wait(1000);
        cy.get('#recipe-list > :nth-child(2) > .row > :nth-child(1)').click({ force: true });
        cy.get('.recipe-card').should('not.contain', 'New Recipe2');
        cy.wait(1000);
        cy.get('button').contains('Sign Out').click({force: true});
    });
});