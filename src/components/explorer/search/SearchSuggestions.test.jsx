import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchSuggestions } from './SearchSuggestions';

const tStub = (key) => key;

const baseProps = {
  showSuggestions: true,
  selectedIndex: -1,
  onSelect: () => {},
  isDarkMode: false,
  t: tStub,
  suggestionsRef: { current: null },
  listboxId: 'test-listbox',
};

describe('SearchSuggestions', () => {
  test('renders nothing when not shown', () => {
    const { container } = render(
      <SearchSuggestions {...baseProps} suggestions={[]} showSuggestions={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing for an empty suggestion list', () => {
    const { container } = render(
      <SearchSuggestions {...baseProps} suggestions={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders suggestions with a listbox/option a11y structure', () => {
    const suggestions = [
      { type: 'drug', text: 'Cisplatin', highlight: 0 },
      { type: 'commercial', text: 'Platinol', highlight: 0 },
    ];
    render(<SearchSuggestions {...baseProps} suggestions={suggestions} />);
    const list = screen.getByRole('listbox');
    expect(list).toHaveAttribute('id', 'test-listbox');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Cisplatin');
    expect(options[1]).toHaveTextContent('Platinol');
  });

  test('marks the selected option with aria-selected', () => {
    const suggestions = [
      { type: 'drug', text: 'Cisplatin', highlight: 0 },
      { type: 'drug', text: 'Carboplatin', highlight: 0 },
    ];
    render(<SearchSuggestions {...baseProps} suggestions={suggestions} selectedIndex={1} />);
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking an option calls onSelect with the suggestion', () => {
    const onSelect = vi.fn();
    const suggestions = [{ type: 'drug', text: 'Cisplatin', highlight: 0 }];
    render(<SearchSuggestions {...baseProps} suggestions={suggestions} onSelect={onSelect} />);
    fireEvent.mouseDown(screen.getByText('Cisplatin'));
    expect(onSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  test('renders the "clear recent" footer only when all suggestions are recent', () => {
    const recent = [
      { type: 'recent', text: 'taxol', highlight: 0 },
      { type: 'recent', text: 'doxo', highlight: 0 },
    ];
    const onClearRecent = vi.fn();
    render(
      <SearchSuggestions
        {...baseProps}
        suggestions={recent}
        onClearRecent={onClearRecent}
      />
    );
    const clearBtn = screen.getByText('filtersMeta.clearRecent');
    fireEvent.mouseDown(clearBtn);
    expect(onClearRecent).toHaveBeenCalled();
  });

  test('does NOT render the clear footer for mixed suggestions', () => {
    const mixed = [
      { type: 'drug', text: 'Cisplatin', highlight: 0 },
      { type: 'recent', text: 'taxol', highlight: 0 },
    ];
    render(
      <SearchSuggestions {...baseProps} suggestions={mixed} onClearRecent={() => {}} />
    );
    expect(screen.queryByText('filtersMeta.clearRecent')).toBeNull();
  });
});
