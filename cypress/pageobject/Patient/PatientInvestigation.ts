class PatientInvestigation {
  clickAddInvestigation() {
    cy.get("#investigation")
      .should("exist")
      .and("be.visible")
      .contains("Add Investigation")
      .click();
  }

  clickInvestigationTab() {
    cy.intercept("GET", "**/investigations/**").as("investigationsLoad");

    cy.get("#consultation_tab_nav")
      .should("exist")
      .and("be.visible")
      .contains("Investigations")
      .click();

    cy.wait("@investigationsLoad", { timeout: 10000 });

    cy.get("#investigations").should("exist").and("be.visible");
  }

  selectInvestigation(investigation: string) {
    cy.get("#search-patient-investigation")
      .should("exist")
      .and("be.visible")
      .clear()
      .type(investigation, { delay: 100 });

    cy.get("#investigation-group")
      .should("exist")
      .and("be.visible")
      .contains(investigation)
      .click();

    cy.get("#investigation")
      .should("exist")
      .and("be.visible")
      .contains("Investigation No. 1")
      .click();
  }

  clickInvestigationCheckbox() {
    cy.get("#investigation-checkbox").should("exist").and("be.visible").click();
  }

  selectInvestigationOption(options: string[]) {
    cy.get("#investigations")
      .should("exist")
      .and("be.visible")
      .then(() => {
        cy.clickAndMultiSelectOption("#investigations", options);
      });
  }

  clickLogLabResults() {
    cy.get("#log-lab-results")
      .should("exist")
      .and("be.visible")
      .contains("Log Lab Results")
      .click();
  }

  selectInvestigationFrequency(frequency: string) {
    cy.get("#investigation-frequency")
      .should("exist")
      .and("be.visible")
      .click();

    cy.contains("button", frequency).should("exist").and("be.visible").click();
  }

  verifyPageLoaded() {
    return cy.get("#investigations").should("exist").and("be.visible");
  }
}

export default PatientInvestigation;
