import { expect, test } from "@playwright/test";
import { startTestApp } from "./util/setup";

test.describe("Application Actions", () => {
  test("Minimize the app", async () => {
    // Start a fresh app for this test
    const { electronApp, closeTestApp, window } = await startTestApp(test, {
      setModpack: true,
      waitForPreload: true,
    });

    // Find the minimize button by its data-testid
    const minimizeButton = window.getByTestId("minimize-button");
    await minimizeButton.waitFor({ state: "visible" });

    // Click the minimize button
    await minimizeButton.click();

    // Verify the window is minimized using Electron API
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await new Promise((resolve) => setTimeout(resolve, 500)); // Add a small delay
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const isMinimized = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows()[0].isMinimized();
    });

    expect(isMinimized).toBe(true);

    // Close the app after minimizing
    await closeTestApp();
  });

  test("Close the app", async () => {
    // Start a fresh app for this test
    const { electronApp, window } = await startTestApp(test, {
      setModpack: true,
      waitForPreload: true,
    });

    // Find the close button by its data-testid
    const closeButton = window.getByTestId("close-button");
    await closeButton.waitFor({ state: "visible" });

    // Wait for the "close" event before clicking the close button
    const closeEventPromise = electronApp.waitForEvent("close", {
      timeout: 5000,
    });

    // Click the close button
    await closeButton.click();

    // Wait for the app process to emit the "close" event
    await expect(closeEventPromise).resolves.not.toThrow(); // Verify the app closed successfully
  });
});
