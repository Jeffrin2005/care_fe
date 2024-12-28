class PatientInvestigation {
  private elements = {
    addInvestigation: () => cy.get("#investigation"),
    investigationTab: () => cy.get("#consultation_tab_nav"),
    searchPatientInvestigation: () => cy.get("#search-patient-investigation"),
    investigationGroup: () => cy.get("#investigation-group"),
    investigationCheckbox: () => cy.get("#investigation-checkbox"),
    investigationSelect: () => cy.get("#investigation-select"),
    logLabResults: () => cy.get("#log-lab-results"),
    investigationFrequency: () => cy.get("#investigation-frequency"),
  };

  clickAddInvestigation() {
    cy.log("Clicking Add Investigation");
    this.elements
      .addInvestigation()
      .should("be.visible")
      .contains("Add Investigation")
      .click();
    cy.wait(1000);
  }

  clickInvestigationTab() {
    cy.log("Clicking Investigation Tab");
    this.elements
      .investigationTab()
      .should("be.visible")
      .contains("Investigations")
      .click();
    cy.wait(2000);
  }

  selectInvestigation(investigation: string) {
    cy.log(`Selecting Investigation: ${investigation}`);

    this.elements
      .searchPatientInvestigation()
      .should("be.visible")
      .clear()
      .type(investigation, { delay: 100 });

    this.elements
      .investigationGroup()
      .contains(investigation)
      .should("be.visible")
      .click();

    this.elements
      .addInvestigation()
      .contains("Investigation No. 1")
      .should("be.visible")
      .click();
  }

  clickInvestigationCheckbox() {
    cy.log("Clicking Investigation Checkbox");
    this.elements
      .investigationCheckbox()
      .should("be.visible")
      .should("be.enabled")
      .click();
  }

  selectInvestigationOption(options: string[]) {
    cy.log("Selecting Investigation Options:", options);

    this.elements
      .investigationSelect()
      .should("exist")
      .should("be.visible")
      .click();

    options.forEach((option) => {
      cy.get("[role='option']")
        .contains(option)
        .should("be.visible")
        .then(($el) => {
          if ($el.length > 0) {
            cy.wrap($el).click();
          } else {
            throw new Error(`Option "${option}" not found in dropdown`);
          }
        });
    });

    cy.get("body").click(0, 0);
    cy.wait(500);
  }

  clickLogLabResults() {
    cy.log("Clicking Log Lab Results");

    this.elements.logLabResults().scrollIntoView().should("be.visible");

    cy.wait(1000);

    this.elements
      .logLabResults()
      .contains("Log Lab Results")
      .should("be.visible")
      .should("be.enabled")
      .click();

    cy.wait(2000);
  }

  selectInvestigationFrequency(frequency: string) {
    cy.log(`Selecting Investigation Frequency: ${frequency}`);

    this.elements.investigationFrequency().should("be.visible").click();

    cy.contains("button", frequency).should("be.visible").click();

    cy.wait(500);
  }

  verifyElementPresent(selector: string, timeout = 10000) {
    return cy.get(selector, { timeout }).should("exist").should("be.visible");
  }

  waitForLoading() {
    cy.get("#loading-indicator", { timeout: 10000 }).should("not.exist");
  }
}

export default PatientInvestigation;
