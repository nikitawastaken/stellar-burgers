/// <reference types="cypress" />
import { order as orderData } from '../fixtures/order.json';

context('Burger Builder Application - E2E Suite', () => {
  const API_INGREDIENTS = 'GET|api/ingredients';
  const API_CURRENT_USER = 'GET|api/auth/user';
  const API_CREATE_ORDER = 'POST|api/orders';

  beforeEach(() => {
    cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as('loadIngredients');
    cy.visit('http://localhost:4000');
    cy.wait('@loadIngredients');
  });

  it('renders ingredient sections correctly', () => {
    cy.get('[data-cy=bun]').should('exist').and('have.length.gte', 1);
    cy.get('[data-cy=main], [data-cy=sauce]').its('length').should('be.gte', 1);
  });

  describe('Ingredient Detail Modal Operations', () => {
    beforeEach(() => {
      cy.get('[data-cy=bun]').first().as('firstBun');
    });

    it('opens modal on click', () => {
      cy.get('@firstBun').click();
      cy.get('#modals').children().should('have.length', 2);
    });

    it('persists modal on reload', () => {
      cy.get('@firstBun').click();
      cy.reload(true);
      cy.get('#modals > div').should('have.length', 2);
    });

    context('closing the modal', () => {
      beforeEach(() => {
        cy.get('@firstBun').click();
      });

      it('via close button', () => {
        cy.get('#modals button').first().click();
        cy.get('#modals').should('be.empty');
      });

      it('by clicking overlay', () => {
        cy.get('#modals').within(() => {
          cy.get('div').eq(1).click({ force: true });
        });
        cy.get('#modals').children().should('have.length', 0);
      });

      it('using ESC key', () => {
        cy.get('body').type('{esc}');
        cy.get('#modals').children().should('have.length', 0);
      });
    });
  });

  describe('Order Checkout Workflow', () => {
    beforeEach(() => {
      cy.setCookie('accessToken', 'EXAMPLE_ACCESS_TOKEN');
      window.localStorage.setItem('refreshToken', 'EXAMPLE_REFRESH_TOKEN');

      cy.intercept('/api/auth/user', { fixture: 'user.json' }).as('getUser');
      cy.intercept('/api/orders', { fixture: 'order.json' }).as('postOrder');
      cy.intercept('/api/ingredients', { fixture: 'ingredients.json' }).as('reloadIngredients');

      cy.visit('http://localhost:4000');
      cy.wait(['@getUser', '@reloadIngredients']);
    });

    it('builds and submits an order successfully', () => {
      const placeOrder = () => cy.get('[data-cy=order-button]');

      placeOrder().should('be.disabled');

      cy.get('[data-cy=bun]').first().find('button').click();
      placeOrder().should('be.disabled');

      cy.get('[data-cy=main]').first().find('button').click();
      placeOrder().should('be.enabled');

      placeOrder().click();

      cy.get('#modals').children().should('have.length', 2);
      cy.get('#modals h2').first().should('contain.text', orderData.number);

      placeOrder().should('be.disabled');
    });

    afterEach(() => {
      cy.clearCookie('accessToken');
      window.localStorage.removeItem('refreshToken');
    });
  });
});
