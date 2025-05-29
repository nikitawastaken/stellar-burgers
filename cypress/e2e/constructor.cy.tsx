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

    it('opens modal and shows correct content', () => {
      cy.get('@firstBun').find('.text.text_type_main-default').invoke('text').then((bunTextBefore) => {
        cy.get('@firstBun').click();
        cy.get(modalsSel).should('exist');
        cy.get(`${modalsSel} .text.text_type_main-medium`).should('have.text', bunTextBefore);
      });
    });

    it('persists modal after reload', () => {
      cy.get('@firstBun').click();
      cy.reload(true);
      cy.get(modalsSel).should('exist');
    });

    context('closing modals', () => {
      beforeEach(() => cy.get('@firstBun').click());

      it('via close button', () => {
        cy.get(`${modalsSel} button`).first().click();
        cy.get(modalsSel).children().should('have.length', 0);
      });

      it('by clicking overlay', () => {
        cy.get(`${modalsSel} > div:nth-of-type(2)`).click({ force: true });
        cy.get(modalsSel).children().should('have.length', 0);
      });

      it('with ESC key', () => {
        cy.get('body').type('{esc}');
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

    it('builds and submits an order and clears constructor', () => {
      const placeOrder = () => cy.get(orderBtnSel);

      cy.get('.constructor-element').should('not.exist');
      placeOrder().should('be.disabled');

      cy.get(`${bunSel}:first-of-type button`).click();
      cy.get('.constructor-element').should('exist');
      placeOrder().should('be.disabled');

      cy.get(`${mainSel}:first-of-type button`).click();
      cy.get('.constructor-element').should('have.length.greaterThan', 1);
      placeOrder().should('be.enabled');

      placeOrder().click();
      cy.wait('@postOrder');
      cy.get(modalsSel).should('exist');
      cy.get(`${modalsSel} .text_type_digits-large`).should('have.text', orderData.order.number);

      cy.get('.constructor-element').should('not.exist');
    });

    afterEach(() => {
      cy.clearCookie('accessToken');
      window.localStorage.removeItem('refreshToken');
    });
  });
});
