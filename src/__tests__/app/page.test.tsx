import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders a heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', {
      name: /To get started, edit the page\.tsx file\./i,
    });

    expect(heading).toBeInTheDocument();
  });
  
  it('renders Next.js logo', () => {
    render(<Home />);
    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });
});
