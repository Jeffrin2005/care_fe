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
    // Add retry-ability for network requests
    cy.intercept("GET", "**/patients/**").as("patientLoad");
    cy.intercept("GET", "**/investigations/**").as("investigationsLoad");

    // Visit patient and wait for page load
    patientPage.visitPatient(patientName);
    cy.wait("@patientLoad");

    // Add small delay to ensure page is stable
    cy.wait(1000);

    // Click investigation tab and verify content loads
    patientInvestigation.clickInvestigationTab();
    cy.wait("@investigationsLoad");

    // Verify investigation tab is active
    patientInvestigation.verifyPageLoaded();

    // Continue with test
    patientInvestigation.clickLogLabResults();

    // Add verification before selecting options
    cy.get("#investigations").should("exist").and("be.visible");

    patientInvestigation.selectInvestigationOption([
      "Haematology",
      "Urine Test",
    ]);

    // Verify save button exists before clicking
    cy.get("button")
      .contains("Save Investigation")
      .should("exist")
      .and("be.visible");

    cy.clickSubmitButton("Save Investigation");

    // Verify notification with timeout
    cy.verifyNotification("Please Enter at least one value", {
      timeout: 10000,
    });
    cy.closeNotification();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
});
