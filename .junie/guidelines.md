# Junie Guidelines

## Test Validation

When generating code with Junie, the following validation steps must be followed:

1. After code generation, automatically run the test suite using:
   ```bash
   npm run test
   ```

2. This command will run both unit tests (`npm run test:unit`) and end-to-end tests (`npm run test:e2e`).

3. If any tests fail, Junie should:
   - Analyze the test failures
   - Remove any output files that it used for the tests (like `output.txt`)
   - Modify the generated code to fix the issues
   - Run the tests again

4. Continue this process until all tests pass successfully.

## Test Command Details

The test command runs:
- Unit tests using Mocha
- End-to-end tests using Playwright

Ensure that both types of tests pass before considering the code generation complete.

## Importance

Running and passing tests is critical to ensure that:
- The generated code maintains compatibility with the existing codebase
- All functionality works as expected
- No regressions are introduced

Always prioritize test validation before finalizing any code changes.