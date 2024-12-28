import { PatientPage } from "pageobject/Patient/PatientCreation";
import PatientInvestigation from "pageobject/Patient/PatientInvestigation";

import LoginPage from "../../pageobject/Login/LoginPage";

describe("Patient Investigation Creation from Patient consultation page", () => {
  const loginPage = new LoginPage();
  const patientPage = new PatientPage();
  const patientInvestigation = new PatientInvestigation();
  const patientName = "Dummy Patient Thirteen";

  before(() => {
    loginPage.loginByRole("districtAdmin");
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.clearLocalStorage(/filters--.+/);
    cy.awaitUrl("/patients");
  });

  it("Create a investigation for a patient and verify its reflection", () => {
    // Visit patient and wait for page load
    patientPage.visitPatient(patientName);
    cy.url().should("include", "/patient");
    cy.wait(2000); // Wait for page to fully load

    // Ensure we're on the right page before proceeding
    cy.get("body").should("contain", patientName);

    // Click investigation tab with retry
    cy.get("body").then(($body) => {
      if ($body.find("#consultation_tab_nav").length > 0) {
        patientInvestigation.clickInvestigationTab();
      } else {
        cy.wait(2000);
        patientInvestigation.clickInvestigationTab();
      }
    });

    // Click log lab results with retry
    cy.get("body").then(($body) => {
      if ($body.find("#log-lab-results").length > 0) {
        patientInvestigation.clickLogLabResults();
      } else {
        cy.wait(2000);
        patientInvestigation.clickLogLabResults();
      }
    });

    // Select investigation options
    patientInvestigation.selectInvestigationOption([
      "Haematology",
      "Urine Test",
    ]);

    // Try to save without entering values
    cy.get("button")
      .contains("Save Investigation")
      .should("be.visible")
      .click({ force: true });

    // Verify notification
    cy.verifyNotification("Please Enter at least one value");
    cy.closeNotification();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
});
