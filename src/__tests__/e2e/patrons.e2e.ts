import { Page, test, expect } from "@playwright/test";
import { startTestApp, StartTestAppReturn } from "./util/setup";

test.describe("Patrons", () => {
  let window: Page;
  let closeTestApp: StartTestAppReturn["closeTestApp"];

  // Mock data for tests
  const mockPatrons = [
    {
      name: "Test Super Patron 1",
      tier: "Super Patron",
    },
    {
      name: "Test Super Patron 2",
      tier: "Super Patron",
    },
    {
      name: "Test Patron 1",
      tier: "Patron",
    },
    {
      name: "Test Patron 2",
      tier: "Patron",
    },
  ];

  test.beforeAll(async () => {
    ({ window, closeTestApp } = await startTestApp(test, {
      setModpack: true,
      waitForPreload: true,
    }));
  });

  test.beforeEach(async () => {
    // Mock the API responses
    await window.route("**/api/patreon", (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ patrons: mockPatrons }),
      });
    });

    // Clear localStorage before each test to ensure a clean state
    await window.evaluate(() => {
      localStorage.clear();
    });
  });

  test.afterEach(async () => {
    // Reset all mocked routes
    await window.unroute("**");
  });

  test.afterAll(async () => {
    await closeTestApp();
  });

  test("should fetch and display patrons on first load with no cache", async () => {
    // Reload the page (with cleared localStorage from beforeEach)
    await window.reload();

    // Wait for the patrons container to be visible
    await window.getByTestId("patrons-container").waitFor({ state: "visible" });

    // Check that the super patrons list is displayed
    await expect(window.getByTestId("super-patrons-list")).toBeVisible();

    // Check that the patrons list is displayed
    await expect(window.getByTestId("patrons-list")).toBeVisible();

    // Verify that the cache was created
    const cache = await window.evaluate(() => {
      return localStorage.getItem("patreon.patrons");
    });

    expect(cache).not.toBeNull();
    const parsedCache = JSON.parse(cache as string);

    // Sort the expected patrons and cached patrons lists
    const sortedExpectedPatrons = [...mockPatrons].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedCachedPatrons = [...parsedCache.content].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Check that the cache age is a valid number
    expect(parsedCache.age).toEqual(expect.any(Number));
    // Check that the sorted lists are identical
    expect(sortedCachedPatrons).toEqual(sortedExpectedPatrons);
  });

  test("should use cached data when available", async () => {
    // First load to populate the cache with a recent timestamp
    const cachedPatrons = [
      {
        name: "Cached Super Patron",
        tier: "Super Patron",
      },
      {
        name: "Cached Patron",
        tier: "Patron",
      },
    ];

    // Set the cache with a very recent timestamp to ensure it's used
    await window.evaluate((patrons) => {
      localStorage.setItem(
        "patreon.patrons",
        JSON.stringify({
          age: Date.now(),
          content: patrons,
        })
      );
    }, cachedPatrons);

    // Mock the patreon endpoint to return an error
    await window.route("**/api/patreon", (route) => {
      return route.fulfill({
        status: 500,
        body: "Internal Server Error",
      });
    });

    // Reload the page
    await window.reload();

    // Wait for the patrons container to be visible
    await window.getByTestId("patrons-container").waitFor({ state: "visible" });

    // Check that the cached patrons are displayed
    // We can't check for specific patron names since they're just rendered as list items
    await expect(window.getByTestId("super-patrons-list")).toBeVisible();
    await expect(window.getByTestId("patrons-list")).toBeVisible();

    // Error message should not be visible since we're using cached data
    await expect(window.getByTestId("patrons-error")).not.toBeVisible();
  });

  test("should show error message when patreon API fails", async () => {
    // Mock the patreon API to return an error
    await window.route("**/api/patreon", (route) => {
      return route.fulfill({
        status: 500,
        body: "Internal Server Error",
      });
    });

    // Reload the page
    await window.reload();

    // Check that the error message is displayed
    await window.getByTestId("patrons-error").waitFor({ state: "visible" });
    await expect(window.getByTestId("patrons-error")).toHaveText(
      "Unable to retrieve Patron list."
    );
  });

  test("should use cached data when API fails", async () => {
    // First load to populate the cache
    const cachedPatrons = [
      {
        name: "Cached Super Patron For Error",
        tier: "Super Patron",
      },
      {
        name: "Cached Patron For Error",
        tier: "Patron",
      },
    ];

    await window.evaluate((patrons) => {
      localStorage.setItem(
        "patreon.patrons",
        JSON.stringify({
          age: Date.now(),
          content: patrons,
        })
      );
    }, cachedPatrons);

    // Mock the patreon API to return an error
    await window.route("**/api/patreon", (route) => {
      return route.fulfill({
        status: 500,
        body: "Internal Server Error",
      });
    });

    // Reload the page
    await window.reload();

    // The patrons container and lists should be visible since we're using cached data
    await window.getByTestId("patrons-container").waitFor({ state: "visible" });
    await expect(window.getByTestId("super-patrons-list")).toBeVisible();
    await expect(window.getByTestId("patrons-list")).toBeVisible();

    // Error message should not be visible since we're using cached data
    await expect(window.getByTestId("patrons-error")).not.toBeVisible();
  });

  test("should handle cache invalidation correctly", async () => {
    // Set up a very old cache
    const oldPatrons = [
      {
        name: "Old Super Patron",
        tier: "Super Patron",
      },
      {
        name: "Old Patron",
        tier: "Patron",
      },
    ];

    await window.evaluate((patrons) => {
      const oldTime = Date.now() - 86400000; // 24 hours ago in ms
      localStorage.setItem(
        "patreon.patrons",
        JSON.stringify({
          age: oldTime,
          content: patrons,
        })
      );
    }, oldPatrons);

    // Set up new patrons to be fetched
    const newPatrons = [
      {
        name: "New Super Patron",
        tier: "Super Patron",
      },
      {
        name: "New Patron",
        tier: "Patron",
      },
    ];

    // Mock the patreon API to return the new patrons
    await window.route("**/api/patreon", (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ patrons: newPatrons }),
      });
    });

    // Reload the page
    await window.reload();

    // The patrons container and lists should be visible
    await window.getByTestId("patrons-container").waitFor({ state: "visible" });
    await expect(window.getByTestId("super-patrons-list")).toBeVisible();
    await expect(window.getByTestId("patrons-list")).toBeVisible();

    // Verify that the cache was updated
    const cache = await window.evaluate(() => {
      return localStorage.getItem("patreon.patrons");
    });

    expect(cache).not.toBeNull();
    const parsedCache = JSON.parse(cache as string);

    // The PatreonService shuffles the patrons, so sort the cache and the expected patrons
    const sortedNewPatrons = [...newPatrons].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedCachedContent = [...parsedCache.content].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Check that the cache age is a valid number
    expect(parsedCache.age).toEqual(expect.any(Number));
    // Check that the sorted cache matches the sorted new patrons exactly
    expect(sortedCachedContent).toEqual(sortedNewPatrons);
  });
});
