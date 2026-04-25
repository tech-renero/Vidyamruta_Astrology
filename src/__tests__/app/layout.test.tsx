import { render } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock the Geist fonts since they are imported from next/font/google
jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'mock-geist-sans' }),
  Geist_Mono: () => ({ variable: 'mock-geist-mono' }),
}));

describe('RootLayout', () => {
  let originalError: typeof console.error;

  beforeAll(() => {
    originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('cannot be a child of')
      ) {
        return;
      }
      originalError(...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children inside body', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
