/// <reference types="cypress" />

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders login form', () => {
    cy.get('[data-cy="login-username"]').should('be.visible');
    cy.get('[data-cy="login-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });

  it('submits credentials and redirects on success', () => {
    const username = Cypress.env('testUser') || 'testuser';
    const password = Cypress.env('testPassword') || 'testpass';

    cy.intercept('POST', '**/auth/login/').as('loginRequest');
    cy.get('[data-cy="login-username"]').should('be.visible').type(username);
    cy.get('[data-cy="login-password"]').should('be.visible').type(password);
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    // Wait for redirect - login sets token then router.push('/profile')
    cy.url({ timeout: 20000 }).should('include', '/profile');
  });
});
