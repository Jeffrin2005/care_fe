class PatientInvestigation {
  clickAddInvestigation() {
    cy.verifyAndClickElement("#investigation", "Add Investigation");
  }

  clickInvestigationTab() {
    cy.get("#consultation_tab_nav")
      .should("exist")
      .and("be.visible")
      .contains("Investigations")
      .click();
    cy.wait(2000);
  }

  selectInvestigation(investigation: string) {
    cy.get("#search-patient-investigation").type(investigation);
    cy.verifyAndClickElement("#investigation-group", investigation);
    cy.verifyAndClickElement("#investigation", "Investigation No. 1");
  }

  clickInvestigationCheckbox() {
    cy.get("#investigation-checkbox").click();
  }

  selectInvestigationOption(options: string[]) {
    cy.get("body").then(($body) => {
      if ($body.find("#investigation-select").length > 0) {
        cy.clickAndMultiSelectOption("#investigation-select", options);
      } else {
        cy.wait(2000);
        cy.clickAndMultiSelectOption("#investigation-select", options);
      }
    });
  }

  clickLogLabResults() {
    cy.get("body").then(($body) => {
      if ($body.find("#log-lab-results").length > 0) {
        cy.get("#log-lab-results")
          .should("exist")
          .and("be.visible")
          .contains("Log Lab Results")
          .click({ force: true });
      } else {
        cy.wait(2000);
        cy.get("#log-lab-results")
          .should("exist")
          .and("be.visible")
          .contains("Log Lab Results")
          .click({ force: true });
      }
    });
  }

  selectInvestigationFrequency(frequency: string) {
    cy.get("#investigation-frequency").click();
    cy.contains("button", frequency).should("be.visible").click();
  }
}
export default PatientInvestigation;
