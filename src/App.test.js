import { render, screen } from '@testing-library/react';
import App from './App';

test('renders editor title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Architecture Diagram Editor/i);
  expect(titleElement).toBeInTheDocument();
});
