import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', {
      name: /Your Cosmic Blueprint Awaits/i,
    });

    expect(heading).toBeInTheDocument();
  });
  
  it('renders generation buttons', () => {
    render(<Home />);
    const button = screen.getByText(/Generate Free Kundli/i);
    expect(button).toBeInTheDocument();
  });
});
