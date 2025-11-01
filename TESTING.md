# Testing Guide

## Setup

Tests use Jest and React Testing Library.

```bash
npm install
npm run test
```

## Test Files

### `__tests__/auth.test.ts`

Tests for authentication:
- Email validation
- Session management
- Login flow

Run:
```bash
npm run test -- auth.test.ts
```

### `__tests__/stripe.test.ts`

Tests for Stripe integration:
- Price formatting
- Yearly savings calculation
- Pricing tier structure
- Price ID mapping

Run:
```bash
npm run test -- stripe.test.ts
```

### `__tests__/pricing.test.tsx`

Tests for pricing page:
- Billing period toggle
- Subscription handling
- Checkout flow
- Error handling

Run:
```bash
npm run test -- pricing.test.tsx
```

### `__tests__/database.test.ts`

Tests for database schema:
- Profiles table structure
- Subscriptions table structure
- Enum validation
- Table relationships

Run:
```bash
npm run test -- database.test.ts
```

## Running Tests

### Watch Mode (Development)

```bash
npm run test
```

Automatically reruns tests when files change.

### CI Mode (Production)

```bash
npm run test:ci
```

Runs all tests once and exits. Used in CI/CD pipelines.

### Specific Test

```bash
npm run test -- auth.test.ts
```

### Specific Test Suite

```bash
npm run test -- --testNamePattern="Email validation"
```

### Coverage Report

```bash
npm run test -- --coverage
```

## Writing Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = processInput(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Testing Async Code

```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Testing React Components

```typescript
import { render, screen } from '@testing-library/react';

it('should render button', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

## Best Practices

1. **Test Behavior, Not Implementation** – Focus on what the code does, not how it does it
2. **Use Descriptive Names** – Test names should clearly describe what's being tested
3. **Keep Tests Small** – Each test should test one thing
4. **Use Setup/Teardown** – Use `beforeEach` and `afterEach` for common setup
5. **Mock External Dependencies** – Mock API calls, database queries, etc.

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled daily runs

Configure in `.github/workflows/test.yml` (if using GitHub Actions).

## Debugging Tests

### Print Debug Info

```typescript
import { render, screen } from '@testing-library/react';

it('should render', () => {
  const { debug } = render(<Component />);
  debug(); // Prints DOM to console
});
```

### Run Single Test

```bash
npm run test -- --testNamePattern="specific test name"
```

### Run Tests in Node Debugger

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Check coverage:
```bash
npm run test -- --coverage
```

## Troubleshooting

### Tests Won't Run

1. Check Node.js version (18+)
2. Reinstall dependencies: `npm install`
3. Clear Jest cache: `npm run test -- --clearCache`

### Tests Fail After Changes

1. Update snapshots: `npm run test -- -u`
2. Check for console errors
3. Verify mocks are correct

### Slow Tests

1. Use `jest.useFakeTimers()` for time-based tests
2. Mock expensive operations
3. Run tests in parallel (default)

## Next Steps

- Add E2E tests with Playwright
- Add performance tests
- Add visual regression tests
- Setup test coverage reports
