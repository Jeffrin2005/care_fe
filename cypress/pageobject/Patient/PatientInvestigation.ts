class PatientInvestigation {
  clickAddInvestigation() {
    cy.verifyAndClickElement("#investigation", "Add Investigation");
  }

  clickInvestigationTab() {
    cy.verifyAndClickElement("#consultation_tab_nav", "Investigations");
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
    // Wait for the investigation select to be ready
    cy.get("#investigation-select", { timeout: 20000 })
      .should("exist")
      .and("be.visible")
      .then(() => {
        cy.clickAndMultiSelectOption("#investigation-select", options);
      });
  }

  clickLogLabResults() {
    cy.verifyAndClickElement("#log-lab-results", "Log Lab Results");
  }

  selectInvestigationFrequency(frequency: string) {
    cy.get("#investigation-frequency").click();
    cy.contains("button", frequency).should("be.visible").click();
  }
}
export default PatientInvestigation;
