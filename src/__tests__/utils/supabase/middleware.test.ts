import { createClient } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockImplementation((opts) => ({
      ...opts,
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}));

describe('Supabase Middleware Utils', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls createServerClient and returns NextResponse', () => {
    const mockRequest = {
      headers: new Headers(),
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
    } as unknown as NextRequest;

    const response = createClient(mockRequest);

    expect(createServerClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toBeDefined();
  });
});
