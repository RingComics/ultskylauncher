import { expect, Page, test } from "@playwright/test";
import {
  startTestApp,
  StartTestAppReturn,
  resetWindowWithoutModSelection,
} from "./util/setup";
import { getUserPreferences } from "./util/user-preferences";
import fs from "fs";

test.describe("Mod Selection", () => {
  let window: Page;
  let closeTestApp: StartTestAppReturn["closeTestApp"];
  let mockFiles: string;
  let electronApp: StartTestAppReturn["electronApp"];

  test.beforeAll(async () => {
    ({ window, closeTestApp, mockFiles, electronApp } = await startTestApp(
      test
    ));
  });

  test.afterAll(async () => {
    await closeTestApp();
  });

  test.describe("Initial Mod Selection", () => {
    test.beforeEach(async () => {
      // For initial mod selection tests, we need to remove user preferences
      // to ensure the mod directory selection screen is shown
      await resetWindowWithoutModSelection(window, mockFiles);
    });

    test("should show the initial mod selection screen", async () => {
      const modDirectory = window.getByTestId("mod-directory");

      // Verify the mod directory selection is visible
      await expect(modDirectory).toBeVisible();

      // Verify the welcome text is shown
      const welcomeText = await modDirectory
        .getByTestId("input-label")
        .textContent();
      expect(welcomeText).toBe(
        "To get started, select your Wildlander installation directory:"
      );
    });

    test("should select a mod directory from the initial selection", async () => {
      const modDirectorySelectTestId = "mod-directory-select";

      // Get the mod directory path from the first option
      await window.getByTestId(modDirectorySelectTestId).click();
      const firstOption = window
        .getByTestId(modDirectorySelectTestId)
        .getByTestId("dropdown-options-0");

      const modDirectoryPath = await firstOption.textContent();

      // Select the first option
      await firstOption.click();

      // Verify we're redirected to the home page after selection
      await expect(window.getByTestId("page-home")).toBeVisible();

      // Get the user preferences
      const userPreferences = await getUserPreferences(mockFiles);

      // Verify the mod directory is set correctly
      expect(userPreferences.MOD_DIRECTORY).toBe(modDirectoryPath);
    });

    test("should show an error when selecting an invalid mod directory", async () => {
      // Attempt to select an invalid mod directory
      const modDirectorySelectTestId = "mod-directory-select";

      // Ensure the dropdown is visible
      await window.getByTestId(modDirectorySelectTestId).waitFor({
        state: "visible",
      });

      // Open the dropdown
      await window.getByTestId(modDirectorySelectTestId).click();

      // Select the option with the text `/invalid/path`
      const invalidOption = window.getByText("/invalid/path");

      const getDialogArgs = await electronApp.evaluateHandle(({ dialog }) => {
        let title = "";
        let content = "";
        let dialogShown = false;

        // Override showErrorBox method to capture dialog arguments
        dialog.showErrorBox = (dialogTitle, dialogContent) => {
          title = dialogTitle;
          content = dialogContent;
          dialogShown = true;
        };

        // Return a function to retrieve the captured dialog arguments later
        return () => ({ title, content, dialogShown });
      });

      await invalidOption.click();

      await getDialogArgs.evaluate(
        async (
          fn: () => { title: string; content: string; dialogShown: boolean }
        ) => {
          while (!fn().dialogShown) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      );

      const { title, content } = await getDialogArgs.evaluate(
        (fn: () => { title: string; content: string; dialogShown: boolean }) =>
          fn()
      );

      expect({ title, content }).toEqual({
        title: "Invalid modpack directory selected",
        content:
          'Please ensure this is a valid modpack installation directory. Remember, this is NOT the Skyrim directory, it is the mod\'s installation directory. Missing files/directories: "ModOrganizer.exe","profiles","launcher"',
      });

      // Assert the mod directory selection is still visible
      await expect(window.getByTestId(modDirectorySelectTestId)).toBeVisible();

      // Verify the user preferences file is still an empty object
      const userPreferencesPath = `${mockFiles}/config/userPreferences.json`;
      const fileContents = fs.readFileSync(userPreferencesPath, "utf-8");
      expect(JSON.parse(fileContents)).toEqual({});
    });
  });
});
