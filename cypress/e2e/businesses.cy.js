/// <reference types="cypress" />

describe('Businesses', () => {
  beforeEach(() => {
    cy.visit('/businesses');
  });

  it('loads businesses page', () => {
    cy.url().should('include', '/businesses');
  });

  it('shows businesses list when businesses exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="businesses-list"]').length > 0) {
        cy.get('[data-cy="businesses-list"]').should('be.visible');
      }
    });
  });

  it('navigates to business detail when business link is clicked', () => {
    cy.get('body').then(($body) => {
      const businessLink = $body.find('a[href^="/businesses/"]').first();
      if (businessLink.length > 0) {
        const href = businessLink.attr('href');
        cy.get(`a[href="${href}"]`).first().click();
        cy.url({ timeout: 10000 }).should('include', '/businesses/');
      }
    });
  });
});
