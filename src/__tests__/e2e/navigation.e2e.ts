import { Page, test, expect } from "@playwright/test";
import { startTestApp, StartTestAppReturn, resetWindow } from "./util/setup";
import path from "path";
import fs from "fs/promises";

test.describe("Navigation", () => {
  let window: Page;
  let closeTestApp: StartTestAppReturn["closeTestApp"];
  let mockFiles: string;

  test.beforeAll(async () => {
    ({ window, closeTestApp, mockFiles } = await startTestApp(test));
  });

  test.afterAll(async () => {
    await closeTestApp();
  });

  test.beforeEach(async () => {
    await resetWindow(window, mockFiles);
  });

  test("Should display the correct modpack version", async () => {
    // Get the expected modpack version from the mock files
    const wabbajackSettingsPath = path.join(
      mockFiles,
      "local",
      "Wabbajack",
      "saved_settings",
      "install-settings-1234567890123456.json"
    );

    const wabbajackSettings = JSON.parse(
      await fs.readFile(wabbajackSettingsPath, "utf-8")
    );

    const expectedModpackVersion = wabbajackSettings.Metadata.version;

    // Wait for the navigation to be visible
    await window.getByTestId("launcher-info").waitFor({ state: "visible" });

    // Get the modpack version from the navigation
    const modpackVersionText = await window
      .getByTestId("modpack-version")
      .textContent();

    // Verify that it starts with "Modpack version: "
    expect(modpackVersionText).toContain("Modpack version:");

    // Verify that it has the correct version number
    const versionPart = modpackVersionText
      ?.replace("Modpack version:", "")
      .trim();
    expect(versionPart).toBe(expectedModpackVersion);
  });

  test("Should display the correct launcher version", async () => {
    // In the test environment, the launcher version is coming from Electron's app.getVersion()
    // which returns the Electron version (16.0.5) rather than the application version
    const expectedLauncherVersion = "16.0.5";

    // Wait for the navigation to be visible
    await window.getByTestId("launcher-info").waitFor({ state: "visible" });

    // Get the launcher version from the navigation
    const launcherVersionText = await window
      .getByTestId("launcher-version")
      .textContent();

    // Verify that it starts with "Launcher Version: "
    expect(launcherVersionText).toContain("Launcher Version:");

    // Verify that it has the correct version number
    const versionPart = launcherVersionText
      ?.replace("Launcher Version:", "")
      .trim();
    expect(versionPart).toBe(expectedLauncherVersion);
  });

  test("Should have the correct contribute link", async () => {
    // Wait for the navigation to be visible
    await window.getByTestId("launcher-info").waitFor({ state: "visible" });

    // Get the contribute link from the navigation
    const contributeLink = window.getByTestId("contribute-link");

    // Verify that it has the correct href
    await expect(contributeLink).toHaveAttribute(
      "href",
      "https://github.com/Wildlander-mod/Launcher"
    );

    // Verify that it has the correct text
    const contributeLinkText = await contributeLink.textContent();
    expect(contributeLinkText?.trim()).toBe("Help contribute");
  });
});
