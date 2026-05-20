/// <reference types="cypress" />

describe('Register', () => {
  beforeEach(() => {
    cy.visit('/features');
  });

  it('navigates to full-page registration when Sign Up as User is clicked', () => {
    cy.get('[data-cy="signup-user-button"]').click();
    cy.url().should('include', '/register');
    cy.get('[data-cy="register-first-name"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-last-name"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-phone"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-email"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-password"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-password-confirm"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="register-submit"]').scrollIntoView().should('be.visible');
  });

  it('shows password mismatch error when passwords do not match', () => {
    cy.get('[data-cy="signup-user-button"]').click();
    cy.get('[data-cy="register-first-name"]').type('Test');
    cy.get('[data-cy="register-last-name"]').type('User');
    cy.get('[data-cy="register-phone"]').type('5551234567');
    cy.get('[data-cy="register-email"]').type('test@example.com');
    cy.get('[data-cy="register-password"]').type('password123');
    cy.get('[data-cy="register-password-confirm"]').type('different');
    cy.get('[data-cy="register-submit"]').click();
    cy.contains(/passwords do not match|Passwords do not match/i).should('be.visible');
  });

  it('leaves /register after successful submit (profile or verification flow)', () => {
    const uniqueEmail = `cypress-${Date.now()}@example.com`;
    cy.get('[data-cy="signup-user-button"]').click();
    cy.get('[data-cy="register-first-name"]').type('Cypress');
    cy.get('[data-cy="register-last-name"]').type('Test');
    cy.get('[data-cy="register-phone"]').type('5551234567');
    cy.get('[data-cy="register-email"]').type(uniqueEmail);
    cy.get('[data-cy="register-password"]').type('testpass123');
    cy.get('[data-cy="register-password-confirm"]').type('testpass123');
    cy.get('[data-cy="register-submit"]').click();
    cy.url({ timeout: 20000 }).should('not.include', '/register');
  });
});
