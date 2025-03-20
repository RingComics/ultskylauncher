import { Page, test } from "@playwright/test";
import { startTestApp, StartTestAppReturn } from "../util/setup";

test.describe("Home #page", () => {
  let window: Page;
  let closeTestApp: StartTestAppReturn["closeTestApp"];

  test.beforeAll(async () => {
    ({ window, closeTestApp } = await startTestApp(test, true));
  });

  test.afterAll(async () => {
    await closeTestApp();
  });

  test("Set the correct website URL", async () => {
    const websiteTestId = "website-link";

    await window.getByTestId(websiteTestId).waitFor({
      state: "visible",
    });

    await test
      .expect(window.getByTestId(websiteTestId))
      .toHaveAttribute("href", "https://www.wildlandermod.com");
  });
});
