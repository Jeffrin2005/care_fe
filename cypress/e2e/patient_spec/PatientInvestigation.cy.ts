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
    patientPage.visitPatient(patientName);
    cy.url().should("include", "/patient");

    cy.log("Clicking investigation tab");
    patientInvestigation.clickInvestigationTab();
    cy.get("#consultation_tab_nav").should("be.visible").should("exist");

    cy.log("Attempting to click log lab results");
    cy.wait(2000);
    patientInvestigation.clickLogLabResults();

    cy.get("#log-lab-results", { timeout: 15000 })
      .should("be.visible")
      .should("exist");

    cy.log("Selecting investigation options");
    patientInvestigation.selectInvestigationOption([
      "Haematology",
      "Urine Test",
    ]);

    cy.get("button")
      .contains("Save Investigation")
      .should("be.visible")
      .click();

    cy.verifyNotification("Please Enter at least one value");
    cy.closeNotification();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
});
