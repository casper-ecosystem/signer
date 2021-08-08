describe('My First Test', () => {
  it('Go to account screen', () => {
    cy.visit('testnet.cspr.live', { timeout: 5000 });

    // Open menu
    cy.get(
      '#root > div > div > div:nth-child(1) > div > div > ul.page-header__NavBarContainer-sc-1rhvfog-1.eRFKAT > div > svg'
    ).click();

    // Click on Wallet nav item
    cy.get(
      '#root > div > div > div:nth-child(1) > div > div > ul.page-header__NavBarContainer-sc-1rhvfog-1.eRFKAT > ul > li:nth-child(6) > div > a > span'
    ).click();

    //
    cy.get(
      '#root > div > div > div:nth-child(1) > div > div > ul.page-header__NavBarContainer-sc-1rhvfog-1.eRFKAT > ul > li:nth-child(6) > ul > li:nth-child(1) > a'
    ).click();
  });
});
