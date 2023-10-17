describe('View signIn/signUp page', () => {
    it('Test viewing the signIn/signUp page', () => {
        cy.visit('http://localhost:3000');
        cy.get('.mt-5 > :nth-child(3) > :nth-child(1)').should('contain', 'Sign Up');
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').should('contain', 'Sign In');
    })
})
describe('Pre-existed user login with invalid and valid credentials', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });
    it('should not login if email is incorrect', () => {
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').contains('Sign In').click({force: true});
        cy.wait(1000);
        cy.get('#signInEmail').type('admin.admin@gmail.com');
        cy.wait(1000);
        cy.get('#signInPassword').type('admin123');
        cy.wait(1000);
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
        cy.wait(1000);
        cy.wait(500);
        cy.get('.mt-5 > :nth-child(3) > :nth-child(1)').should('not.contain', 'Sign Out');
        cy.wait(1000);
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').should('not.contain', 'Add Recipe');
    });

    it('should not login if password is incorrect', () => {
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').contains('Sign In').click({ force: true });
        cy.wait(1000);
        cy.get('#signInEmail').type('admin');
        cy.wait(1000);
        cy.get('#signInPassword').type('Passw0rd');
        cy.wait(1000);
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click({force: true});
        cy.wait(500);
        cy.get('.mt-5 > :nth-child(3) > :nth-child(1)').should('not.contain', 'Sign Out');
        cy.wait(1000);
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').should('not.contain', 'Add Recipe');
    });

    it("should log in a user successfully with correct credentials", () => {
        cy.get('.mt-5 > :nth-child(3) > :nth-child(2)').contains('Sign In').click({ force: true });
        cy.wait(1000);
        cy.get("#signInEmail").type("admin");
        cy.wait(1000);
        cy.get("#signInPassword").type("admin123");
        cy.wait(1000);
        cy.get(
            "#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary"
        ).click({force: true});
        cy.wait(500);
        cy.get('.mt-5 > :nth-child(3) > .btn').should('contain', 'Sign Out');
        cy.wait(1000);
        cy.get(':nth-child(4) > .btn-primary').should('contain', 'Add Recipe');
        cy.wait(1000);
        cy.get(':nth-child(4) > .btn-danger').should('contain', 'Delete All Recipes');
    });
});