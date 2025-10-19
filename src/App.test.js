import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});

test('renders theme toggle button', async () => {
  render(<App />);

  // Wait for service initialization
  await waitFor(() => {
    const themeButton = screen.getByText(/☀️ Light|🌙 Dark/i);
    expect(themeButton).toBeInTheDocument();
  }, { timeout: 5000 });
});
