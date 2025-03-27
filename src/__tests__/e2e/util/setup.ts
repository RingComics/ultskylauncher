import {
  createDirectoryStructure,
  getMockAPPDATALocal,
  mockModpack,
} from "./generate-modpack-files";
import { config } from "./config";
import fs from "fs/promises";
import { _electron as electron, Page, test as Test } from "@playwright/test";
import type { ElectronApplication } from "playwright";
import { randomBytes } from "crypto";
import { removeUserPreferences } from "./user-preferences";

type WindowWithCoverage = Page & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __coverage__: Record<string, unknown>;
};

type GlobalWithCoverage = NodeJS.Global & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __coverage__: Record<string, unknown>;
};

const UUID = (): string => {
  return randomBytes(16).toString("hex");
};

/**
 * Create mock files for the launcher to use.
 * - userPreferences.json
 * - wabbajack install settings
 * - mock modpack install
 */
export const createMockFiles = async (test: typeof Test) => {
  // Create an area for the Electron app to store config/files.
  const mockFiles = `${config().paths.mockFiles}/${
    test.info().titlePath[1]
  }/${UUID()}`;
  await fs.mkdir(mockFiles, { recursive: true });
  const mockModpackInstall = `${mockFiles}/mock-modpack-install`;
  createDirectoryStructure(mockModpack, mockModpackInstall);
  createDirectoryStructure(
    getMockAPPDATALocal(mockModpackInstall),
    `${mockFiles}/local`
  );

  return mockFiles;
};

export interface StartTestAppOptions {}

export interface StartTestAppReturn {
  mockFiles: string;
  window: Page;
  electronApp: ElectronApplication;
  closeTestApp: () => Promise<void>;
}

export const startTestApp = async (
  test: typeof Test,
  options: StartTestAppOptions = {}
): Promise<StartTestAppReturn> => {
  const mockFiles = await createMockFiles(test);

  // Launch Electron app.
  const electronApp = await electron.launch({
    args: [`${config().paths.instrumented}/main.js`],
    env: {
      CONFIG_PATH: `${mockFiles}/config`,
      APPDATA: `${mockFiles}/APPDATA`,
      MULTIPLE_INSTANCE: "true",
      // Disable this to open dev tools by default
      IS_TEST: "true",
    },
    // recordVideo: { dir: "test-results" },
  });

  // Attach the electron logs to the current process.
  if (process.env["DEBUG"]) {
    electronApp.on("console", console.log);
  }

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();

  if (process.env["DEBUG"]) {
    // Direct Electron Renderer console to Node terminal.
    window.on("console", console.log);
  }

  // Move the window slightly in a random direction by 150 pixels for e2e tests,
  // this allows all windows to be visible when using multiple workers
  // eslint-disable-next-line @typescript-eslint/naming-convention
  await electronApp.evaluate(({ BrowserWindow }) => {
    const offset = 200;
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      const [x, y] = win.getPosition();
      // Generate random direction: up, down, left, right, or diagonal
      const randomX = Math.random() > 0.5 ? offset : -offset;
      const randomY = Math.random() > 0.5 ? offset : -offset;
      win.setPosition(x + randomX, y + randomY);
    }
  });

  const closeTestApp = async () => {
    await saveCoverage(
      window,
      "renderer",
      () => (window as WindowWithCoverage).__coverage__
    );

    await saveCoverage(
      electronApp,
      "main",
      () => (global as GlobalWithCoverage).__coverage__
    );

    await electronApp.close();
  };

  return { mockFiles, window, electronApp, closeTestApp };
};

const saveCoverage = async (
  page: Page | ElectronApplication,
  preface: "main" | "renderer",
  coverageCallback: () => Record<string, unknown>
) => {
  await fs.mkdir(config().paths.coverage, {
    recursive: true,
  });

  const coverage = await page.evaluate(coverageCallback);

  await fs.writeFile(
    `${config().paths.coverage}/${preface}-${UUID()}.json`,
    JSON.stringify(coverage, null, 2)
  );
};

export const screenshot = async (
  window: Page,
  test: typeof Test,
  name: string
) => {
  return window.screenshot({
    path: `${config().paths.screenshots}/${test.name}/${name}.png`,
    fullPage: true,
  });
};

export const waitForAppLoaded = async (window: Page): Promise<void> => {
  await window.getByTestId("launch-game").waitFor({ state: "visible" });
};

/**
 * Waits for the preload to complete by checking if the current URL is the auto-update URL.
 * If it is, waits until it changes before proceeding.
 *
 * This method is useful to ensure it's safe to reload the page, as reloading while
 * the URL is the update URL can cause issues with the application loading process.
 *
 * @param window The Playwright page object
 */
export const waitForPreloadComplete = async (window: Page): Promise<void> => {
  const autoUpdateUrl = "auto-update";
  if (window.url().toString().includes(autoUpdateUrl)) {
    await window.waitForURL((url) => !url.toString().includes(autoUpdateUrl));
  }

  // Wait until the page is ready before continuing
  await window.waitForLoadState("load");
};

/**
 * Resets the window for initial mod selection tests by:
 * 1. Removing user preferences
 * 2. Reloading the window
 * 3. Waiting for the mod directory selection to be available
 *
 * This is different from the standard resetWindow function because
 * we need to ensure the mod directory is not set before testing
 * the initial mod selection screen.
 *
 * @param window The Playwright page object
 * @param mockFiles The path to the mock files directory
 */
export const resetWindowWithoutModSelection = async (
  window: Page,
  mockFiles: string
): Promise<void> => {
  // Remove user preferences
  await removeUserPreferences(mockFiles);

  // Wait for preload to complete before reloading
  await waitForPreloadComplete(window);

  // Reload the window
  await window.reload();

  // Wait for the mod directory selection to be available
  await window.getByTestId("mod-directory-select").waitFor({
    state: "visible",
  });
};

/**
 * Reset the window by:
 * 1. Resetting user preferences
 * 2. Setting the modpack
 * 3. Reloading the window
 * 4. Waiting for the launch button to be visible (this is only visible when the app has finished loading)
 *
 * This function should be called in the beforeEach hook of every e2e test
 * to ensure that the context for each test is fully reset.
 */
export const resetWindow = async (
  window: Page,
  mockFiles: string
): Promise<void> => {
  // Reset user preferences and set the modpack
  const mockModpackInstall = `${mockFiles}/mock-modpack-install`;
  await fs.mkdir(`${mockFiles}/config`, { recursive: true });
  await fs.writeFile(
    `${mockFiles}/config/userPreferences.json`,
    JSON.stringify({
      MOD_DIRECTORY: `${mockModpackInstall}`,
    })
  );

  // Wait for preload to complete before reloading
  await waitForPreloadComplete(window);

  // Reload the window reload to reset the context (useful between tests)
  await window.reload();

  // Wait for the app to load again after the refresh
  await waitForAppLoaded(window);
};
