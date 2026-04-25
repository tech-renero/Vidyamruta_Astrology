import { createClient } from '@/utils/supabase/client';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('Supabase Client Utils', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls createBrowserClient with environment variables', () => {
    createClient();
    expect(createBrowserClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'anon-key'
    );
  });
});
