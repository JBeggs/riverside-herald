// ***********************************************************
// Support file for E2E tests
// River Side Herald uses auth_token, refresh_token, company_id (separate keys)
// ***********************************************************

Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('testUser');
  const pass = password || Cypress.env('testPassword');
  const apiUrl = Cypress.env('apiUrl');
  const companySlug = Cypress.env('companySlug') || 'riverside-herald';

  cy.session([user, pass], () => {
    cy.request('POST', `${apiUrl}/auth/login/`, {
      username: user,
      password: pass,
      company_slug: companySlug,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const token = res.body.access;
      const refresh = res.body.refresh;
      const companyId = res.body.company?.id;
      // Visit first so setCookie uses correct domain (baseUrl)
      cy.visit('/');
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', token);
        win.localStorage.setItem('refresh_token', refresh || '');
        if (companyId) win.localStorage.setItem('company_id', companyId);
      });
      // Profile page reads auth from cookies (server-side); path required for Next.js
      cy.setCookie('auth_token', token, { path: '/' });
      if (refresh) cy.setCookie('refresh_token', refresh, { path: '/' });
      if (companyId) cy.setCookie('company_id', String(companyId), { path: '/' });
    });
  });
});
