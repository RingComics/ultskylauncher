# Junie Guidelines

## Test Validation Process

When generating code with Junie, follow these validation steps to ensure quality and compatibility:

1. After code generation is complete, automatically validate your code by running both unit tests and end-to-end tests:
   ```bash
   npm run test:unit
   ```
   ```bash
   npm run test:e2e
   ```

2. If any tests fail, take these corrective actions:
   - Carefully analyze the test failure messages to identify the root causes
   - Make targeted modifications to the generated code to address the specific issues
   - Re-run only the failing test suite (unit or e2e) to verify your fixes
     - For more detailed debugging information with e2e tests, use: `DEBUG=true npm run test:e2e`
   - Once the failing tests pass, run the other test suite to ensure complete validation
   - Clean up by removing any temporary files created during testing (such as `output.txt` or other Junie-specific outputs)

3. Repeat this test-fix-validate cycle until all tests pass successfully.

## Test Framework Information

The testing infrastructure consists of:
- Unit tests: Implemented with Mocha framework to test individual components
- End-to-end tests: Implemented with Playwright to test complete user workflows

Both test suites must pass successfully before considering the code generation process complete.

## Why Testing Matters

Thorough test validation is essential because it:
- Ensures your generated code integrates seamlessly with the existing codebase
- Verifies that all functionality works correctly across different scenarios
- Prevents the introduction of regressions or new bugs

Always prioritize test validation before finalizing any code changes to maintain the integrity and reliability of the application.
