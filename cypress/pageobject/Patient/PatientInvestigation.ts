class PatientInvestigation {
  clickAddInvestigation() {
    cy.get("#investigation")
      .should("exist")
      .and("be.visible")
      .contains("Add Investigation")
      .click();
  }

  clickInvestigationTab() {
    cy.get("#consultation_tab_nav")
      .should("exist")
      .and("be.visible")
      .contains("Investigations")
      .click()
      .then(() => {
        cy.log("Clicked investigations tab");
      });
  }

  selectInvestigation(investigation: string) {
    cy.get("#search-patient-investigation")
      .should("exist")
      .and("be.visible")
      .clear()
      .type(investigation);

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
        options.forEach((option) => {
          cy.get("#investigations")
            .contains(option)
            .should("exist")
            .and("be.visible")
            .click();
        });
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
}

export default PatientInvestigation;
