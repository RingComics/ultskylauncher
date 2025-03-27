import fs from "fs/promises";
import { config } from "./config";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";
import SourceMaps from "nyc/lib/source-maps";

async function displayCoverage(): Promise<void> {
  const files = await fs.readdir(config().paths.coverage);

  // Check if there are any .json files (coverage files)
  const hasCoverage = files.some((file) => file.endsWith(".json"));

  if (!hasCoverage) {
    console.warn("No coverage data found.");
    return;
  }

  // The electron main process coverage data needs to have the source map remapped so store it separately
  const mainCoverageMap = libCoverage.createCoverageMap({});
  const additionalCoverageMap = libCoverage.createCoverageMap({});

  for (const file of files) {
    if (file.endsWith(".json")) {
      const coverageData = await fs.readFile(
        `${config().paths.coverage}/${file}`,
        "utf8"
      );
      if (file.startsWith("main-")) {
        mainCoverageMap.merge(JSON.parse(coverageData));
      } else {
        additionalCoverageMap.merge(JSON.parse(coverageData));
      }
    }
  }

  const sourceMap = new SourceMaps({
    cache: false,
    cacheDir: `${config().paths.coverage}/cache`,
  });
  // Remap the electron main process coverage data to ensure sourcemaps are respected
  mainCoverageMap.data = await sourceMap.remapCoverage(mainCoverageMap.data);

  // Combine the main coverage map and the additional coverage map
  mainCoverageMap.merge(additionalCoverageMap.toJSON());

  // create a context for report generation
  const context = libReport.createContext({
    dir: `${config().paths.coverage}/html-report`,
    defaultSummarizer: "nested",
    coverageMap: mainCoverageMap,
  });

  // create the text report
  const textReport = reports.create("text", {
    skipEmpty: false,
    skipFull: false,
  });
  textReport.execute(context);

  // create the HTML report
  const htmlReport = reports.create("html", {});
  htmlReport.execute(context);
}

const clearMockFiles = async () => {
  if (process.env["CLEAR_MOCK_FILES"] !== "false") {
    await fs.rm(`${config().paths.mockFiles}`, {
      recursive: true,
      force: true,
    });
  }
};

async function globalTeardown() {
  if (process.env["COVERAGE"] !== "false") {
    try {
      await displayCoverage();
    } catch (error) {
      console.error("Failed to display coverage:", error);
    }
  }

  await clearMockFiles();
}

export default globalTeardown;
