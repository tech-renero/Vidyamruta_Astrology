import { createClient } from '@/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

describe('Supabase Server Utils', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls createServerClient with correct parameters', () => {
    const mockCookieStore: any = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn(),
    };

    createClient(mockCookieStore);

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
  });
});
