import { Page, test, expect } from "@playwright/test";
import { startTestApp, StartTestAppReturn } from "./util/setup";

test.describe("Header links", () => {
  let window: Page;
  let closeTestApp: StartTestAppReturn["closeTestApp"];

  // Define test data for better organization and maintainability
  const links = [
    { name: "website", url: "https://www.wildlandermod.com" },
    { name: "wiki", url: "https://wiki.wildlandermod.com/" },
    { name: "roadmap", url: "https://airtable.com/shrvAxHcCeCqKfnGe" },
    { name: "patreon", url: "https://www.patreon.com/dylanbperry" },
  ];

  test.beforeAll(async () => {
    ({ window, closeTestApp } = await startTestApp(test, true));
  });

  test.afterAll(async () => {
    await closeTestApp();
  });

  // Use test.each to reduce repetition
  for (const { name, url } of links) {
    test(`Set the correct ${name} URL`, async () => {
      await window.getByTestId(`${name}-link`).waitFor({ state: "visible" });
      await expect(window.getByTestId(`${name}-link`)).toHaveAttribute(
        "href",
        url
      );
    });
  }
});
