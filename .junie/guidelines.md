# Junie Guidelines

## Test Validation

When generating code with Junie, the following validation steps must be followed:

1. After code generation, automatically run the unit tests and e2e tests using:
   ```bash
   npm run test:unit
   ```
   ```bash
   npm run test:e2e
   ```
   
2. If any tests fail, Junie should:
   - Analyze the test failures
   - Modify the generated code to fix the issues
   - Run the tests again but only the failing one (unit or e2e) (if more debug information is needed then `DEBUG=true` can preface the e2e tests for more information)
   - Proceed to run the other test suite to ensure both have passed with the latest changes
   - Remove any output files that are used for the tests and junie specifically (like `output.txt`)

3. Continue this process until all tests pass successfully.

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