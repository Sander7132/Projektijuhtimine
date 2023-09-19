describe("View signIn/signUp page", () => {
  it("Test viewing the signIn/signUp page", () => {
    cy.visit("http://localhost:3000");
    cy.get(".text-center > .row > :nth-child(1)").should("contain", "Sign Up");
    cy.get(".text-center > .row > :nth-child(2)").should("contain", "Sign In");
  });
});

describe("Pre-existed user login with invalid and valid credentials", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });
  it("should not login if email is incorrect", () => {
    cy.get(".text-center > .row > :nth-child(2)").contains("Sign In").click();
    cy.get("#signInEmail").type("admin.admin@gmail.com");
    cy.get("#signInPassword").type("admin123");
    cy.get(
      "#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary"
    ).click();
    cy.wait(500);
    cy.get(".text-center > .row > :nth-child(1)").should(
      "not.contain",
      "Sign Out"
    );
    cy.get(".text-center > .row > :nth-child(2)").should(
      "not.contain",
      "Add Recipe"
    );
  });

  it("should not login if password is incorrect", () => {
    cy.get(".text-center > .row > :nth-child(2)").contains("Sign In").click();
    cy.get("#signInEmail").type("admin");
    cy.get("#signInPassword").type("Passw0rd");
    cy.get(
      "#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary"
    ).click();
    cy.wait(500);
    cy.get(".text-center > .row > :nth-child(1)").should(
      "not.contain",
      "Sign Out"
    );
    cy.get(".text-center > .row > :nth-child(2)").should(
      "not.contain",
      "Add Recipe"
    );
  });

  it("should log in a user successfully with correct credentials", () => {
    cy.get(".text-center > .row > :nth-child(2)").contains("Sign In").click();
    cy.get("#signInEmail").type("admin");
    cy.get("#signInPassword").type("admin123");
    cy.get(
      "#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary"
    ).click();
    cy.wait(500);
    cy.get(".text-center > .row > :nth-child(1)").should("contain", "Sign Out");
    cy.get(".text-center > .row > :nth-child(2)").should(
      "contain",
      "Add Recipe"
    );
  });
});
