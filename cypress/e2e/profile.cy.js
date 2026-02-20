/// <reference types="cypress" />

describe('Profile', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/profile');
  });

  it('shows profile when logged in', () => {
    cy.get('[data-cy="profile-content"]', { timeout: 10000 }).should('be.visible');
  });

  it('displays profile form fields', () => {
    cy.get('[data-cy="profile-content"]', { timeout: 10000 }).within(() => {
      cy.get('input, select, textarea').should('exist');
    });
  });
});
