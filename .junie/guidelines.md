# Junie Guidelines

This document provides guidelines for working with Junie AI, divided into generic best practices and project-specific instructions.
Junie should follow all the practices mentioned in this document to ensure code quality and maintainability.
Junie should also follow the project-specific guidelines to ensure consistency with the project's codebase and workflow.

# Generic Guidelines

## Code Quality Principles

- Always prioritize clean, readable, and maintainable code when working with Junie AI
- Prefer `const` over `let` where possible to ensure immutability
- Always declare variables at the lowest scope possible to prevent polluting the outer scope
- Only suggest upgrading libraries when absolutely necessary for functionality

## TypeScript Best Practices

- Adhere to TypeScript strict settings as configured in the project
- Avoid using `any` type to maintain type safety and code quality

## Code Generation with Junie

- Remove any output or script files used solely by Junie, including those from previous steps
- When iterating on changes, ensure old unused implementations are properly removed
- When renaming files, remove the old unused versions to maintain a clean codebase
- After each code generation, validate your code with the appropriate linting tools
- Avoid inserting code between a comment and the method or section it is referencing

## Testing Principles

- Focus on clear, concise tests that verify functionality rather than implementation details
- Design each test to be specific with a single, focused assertion when possible
- Always use descriptive test names that clearly communicate the test's purpose
- Avoid testing implementation details that may change frequently and lead to brittle tests
- When writing tests, consider edge cases, boundary conditions, and error scenarios
- Always run all tests before submitting code changes to ensure no regressions
- Ensure that tests always focus on the behaviour of the code being tested
- Do not use divs when adding test IDs, use span or other inline elements that do not impact styling instead

## Validation Workflow

- After generating code with Junie, always validate your changes by running appropriate tests
- When tests fail:
  - Analyze failure messages carefully to identify root causes
  - Make targeted modifications to address specific issues
  - Re-run failing tests to verify your fixes
  - Once fixed, run all tests to ensure complete validation
- Repeat the test-fix-validate cycle until all tests pass successfully

# Project-Specific Guidelines

## Test Environment

- The project uses both e2e tests and unit tests, defined as tasks in the IDE
- For detailed debugging with e2e tests, use: `DEBUG=true npm run test:e2e`
- Test coverage information from e2e and unit tests helps identify untested code paths
- When expected code paths aren't covered, add specific tests to improve coverage

## Project Commands

- Lint - `npm run lint`
- Fix lint issues - `npm run lint:fix`
- All tests - `npm run test`
- Unit tests - `npm run test:unit`
- E2E tests - `npm run test:e2e`
- Always run these commands directly from the IDE when available

## E2E Testing Standards

- Tests are implemented with Playwright, configured in the IDE
- Always use data-testids and `window.getByTestId` when selecting elements
- Exception: When testing user actions like clicking text, you may use that text explicitly
- If a needed data-testid doesn't exist, add it to the relevant file
- If a test times out trying to load http://localhost:8080/#/auto-update it means that the page has reloaded too quick before it loaded the application.

## Project concepts

The main and renderer process communicate via the ipc handler. All events are defined in .events files.
If a renderer method calls the service with an event name, that name can be used to find the associated controller in the main process. 
