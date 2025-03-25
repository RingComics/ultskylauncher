# Junie Guidelines

## Code style

- Always prioritise clean well readable maintainable code.
- Use TypeScript strict settings based on the project configuration
- Only suggest upgrading libraries when absolutely necessary
- Do not use `any` as a TypeScript type
- Always declare variables at the lower scope possible to prevent polluting the outer scope unless strictly necessary
- Prefer `const` over `let` where possible

## Test Validation Process

The tests consist of e2e tests and unit tests. These are defined as tasks in the IDE.

When generating code with Junie, follow these validation steps to ensure quality and compatibility:

1. After code generation is complete, automatically validate your code by running both unit and e2e tasks in the IDE 

2. If any tests fail, take these corrective actions:
   - Carefully analyze the test failure messages to identify the root causes
   - Make targeted modifications to the generated code to address the specific issues
   - Re-run only the failing test suite (unit or e2e) to verify your fixes
     - For more detailed debugging information with e2e tests, use: `DEBUG=true npm run test:e2e`
   - Once the failing tests pass, run the other test suite to ensure complete validation

3. Repeat this test-fix-validate cycle until all tests pass successfully.

If writing tests that are due to cover all paths, the coverage information that comes from e2e and units tests can be used to discovered untested lines.
If these lines were expected to be covered by the action under test, add further more specific tests to cover these lines.

## Commands

- Lint - `npm run lint`
- Fix lint issues - `npm run lint:fix`
- All tests - `npm run test`
- Unit tests - `npm run test:unit`
- E2E tests - `npm run test:e2e`

If any of these commands exist in the IDE, run them directly from the IDE.

## Test style

- Focus on clear concise tests that test functionality and not specifically implementation
- Each test should be specific and attempt to contain only a single specific assertion

## Code generation

- Always remove any output or script files used purely by junie, including any from previous steps.
- When iterating on changes, ensure that old unused implementations are removed
- When renaming files, remove the old unused one
- After each generation, run the lint command to confirm there are no errors or warnings. If there are, fix them before continuing.

## E2E tests

- Always use data-testids and `window.getByTestId` when selecting elements unless the test is specifically testing a user action like clicking some text, then it is okay to use that text explicitly.
- If a data-testid does not exist and is needed, add it to the relevant file.
- Tests are written with playwright. A configuration is defined in the IDE to run all tests. 
