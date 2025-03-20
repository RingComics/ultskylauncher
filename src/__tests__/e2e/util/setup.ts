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
export const createMockFiles = async (
  test: typeof Test,
  setModpack: boolean
) => {
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

  if (setModpack) {
    await fs.mkdir(`${mockFiles}/config`, { recursive: true });
    await fs.writeFile(
      `${mockFiles}/config/userPreferences.json`,
      JSON.stringify({
        MOD_DIRECTORY: `${mockModpackInstall}`,
      })
    );
  }

  return mockFiles;
};

export interface StartTestAppOptions {
  setModpack?: boolean;
  waitForPreload?: boolean;
}

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
  const { setModpack = false, waitForPreload = false } = options;
  const mockFiles = await createMockFiles(test, setModpack);

  // Launch Electron app.
  const electronApp = await electron.launch({
    args: [`${config().paths.instrumented}/main.js`],
    env: {
      CONFIG_PATH: `${mockFiles}/config`,
      APPDATA: `${mockFiles}/APPDATA`,
      MULTIPLE_INSTANCE: "true",
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

  // If waitForPreload is true, wait for the "launch-game" button to be visible.
  // The navigation only becomes visible once all preload checks have completed (e.g. auto update, setting modpack, etc.)
  if (waitForPreload) {
    await window.getByTestId("launch-game").waitFor({ state: "visible" });
  }

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
