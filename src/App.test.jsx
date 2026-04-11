import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Radiosync title', async () => {
  render(<App />);
  // The loading fallback is rendered briefly; the header should follow.
  const title = await screen.findByRole(
    'heading',
    { name: /radiosync|drug.*radiotherapy/i },
    { timeout: 2000 }
  );
  expect(title).toBeInTheDocument();
});
