/// <reference types="cypress" />
import * as orderData from '../fixtures/order.json';

const testUrl = 'http://localhost:4000';
const [bunSel, mainSel, sauceSel] = ['[data-cy="bun"]', '[data-cy="main"]', '[data-cy="sauce"]'];
const orderBtnSel = '[data-cy="order-button"]';
const modalsSel = '#modals';

context('Burger Builder App E2E Suite', () => {
  const apiIngredients = '/api/ingredients';
  const apiCurrentUser = '/api/auth/user';
  const apiCreateOrder = '/api/orders';

  beforeEach(() => {
    cy.intercept('GET', apiIngredients, { fixture: 'ingredients.json' }).as('getIngredients');
    cy.visit(testUrl);
    cy.wait('@getIngredients');
  });

  it('displays ingredient lists', () => {
    cy.get(bunSel).should('have.length.at.least', 1);
    cy.get(`${mainSel}, ${sauceSel}`).should('have.length.at.least', 1);
  });

  describe('Ingredient Detail Modals', () => {
    beforeEach(() => {
      cy.get(bunSel).first().as('firstBun');
    });

    it('opens modal on card click', () => {
      cy.get('@firstBun').click();
      cy.get(modalsSel).children().should('have.length', 2);
    });

    it('persists modal after reload', () => {
      cy.get('@firstBun').click();
      cy.reload(true);
      cy.get(modalsSel).children().should('have.length', 2);
    });

    context('closing modals', () => {
      beforeEach(() => cy.get('@firstBun').click());

      it('via close button', () => {
        cy.get(`${modalsSel} button`).first().click();
        cy.wait(500);
        cy.get(modalsSel).children().should('have.length', 0);
      });

      it('by clicking overlay', () => {
        cy.get(`${modalsSel} > div:nth-of-type(2)`).click({ force: true });
        cy.wait(500);
        cy.get(modalsSel).children().should('have.length', 0);
      });

      it('with ESC key', () => {
        cy.get('body').type('{esc}');
        cy.wait(500);
        cy.get(modalsSel).children().should('have.length', 0);
      });
    });
  });

  describe('Order Checkout Flow', () => {
    beforeEach(() => {
      cy.setCookie('accessToken', 'EXAMPLE_ACCESS_TOKEN');
      window.localStorage.setItem('refreshToken', 'EXAMPLE_REFRESH_TOKEN');

      cy.intercept('GET', apiCurrentUser, { fixture: 'user.json' }).as('getUser');
      cy.intercept('POST', apiCreateOrder, { fixture: 'order.json' }).as('postOrder');
      cy.intercept('GET', apiIngredients, { fixture: 'ingredients.json' }).as('reloadIngredients');

      cy.visit(testUrl);
      cy.wait(['@getUser', '@reloadIngredients']);
    });

    it('builds and submits an order', () => {
      const placeOrder = () => cy.get(orderBtnSel);

      placeOrder().should('be.disabled');

      cy.get(`${bunSel}:first-of-type button`).click();
      placeOrder().should('be.disabled');

      cy.get(`${mainSel}:first-of-type button`).click();
      placeOrder().should('be.enabled');

      placeOrder().click();

      cy.get(modalsSel).children().should('have.length', 2);
      cy.get(`${modalsSel} h2:first-of-type`).should('have.text', orderData.order.number);
      placeOrder().should('be.disabled');
    });

    afterEach(() => {
      cy.clearCookie('accessToken');
      window.localStorage.removeItem('refreshToken');
    });
  });
});
