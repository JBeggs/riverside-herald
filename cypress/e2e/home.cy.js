/// <reference types="cypress" />

describe('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads home page with hero section', () => {
    cy.get('[data-cy="home-featured"]').should('be.visible');
  });

  it('shows featured articles when available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="article-list"]').length > 0) {
        cy.get('[data-cy="article-list"]').should('be.visible');
      }
    });
  });

  it('shows featured businesses when available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="business-list"]').length > 0) {
        cy.get('[data-cy="business-list"]').should('be.visible');
      }
    });
  });

  it('nav links work', () => {
    cy.get('a[href="/articles"]').first().click();
    cy.url().should('include', '/articles');
    cy.visit('/');
    cy.get('a[href="/businesses"]').first().click();
    cy.url().should('include', '/businesses');
  });
});
