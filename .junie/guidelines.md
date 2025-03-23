# Junie Guidelines

## Code style

- Always prioritise clean well readable maintainable code.
- Use TypeScript strict settings based on the project configuration
- Only suggest upgrading libraries when absolutely necessary

## Test Validation Process

The tests consist of e2e tests and unit tests. These are defined as tasks in the IDE.

When generating code with Junie, follow these validation steps to ensure quality and compatibility:

1. After code generation is complete, automatically validate your code by running both unit and e2e tasks in the IDE `test:unit` and `test:e2e`
   If the tasks are not defined, just use the npm commands:
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

3. Repeat this test-fix-validate cycle until all tests pass successfully.

## Code generation

- Always remove any output or script files used purely by junie, including any from previous steps.

## E2E tests

- Always use data-testids and `window.getByTestId` when selecting elements
