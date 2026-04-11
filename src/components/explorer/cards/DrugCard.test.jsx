import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrugCard } from './DrugCard';

const tStub = (key) => key;
const translateDrugClass = (c) => c;

const drug = {
  id: 'cisplatin-platinum-based-drugs',
  name: 'Cisplatin',
  commercial: 'Platinol',
  class: 'Platinum based drugs',
  category: 'chemotherapy',
  halfLife: '30min to 2h',
  normofractionatedRT: '0',
  palliativeRT: '0',
  stereotacticRT: '0',
  intracranialRT: '0',
};

const baseProps = {
  drug,
  isDarkMode: false,
  onDrugClick: () => {},
  isFavorite: false,
  onToggleFavorite: () => {},
  t: tStub,
  translateDrugClass,
  CATEGORY_COLORS: { light: {}, dark: {} },
};

describe('DrugCard', () => {
  test('renders the drug name and commercial label', () => {
    render(<DrugCard {...baseProps} />);
    expect(screen.getByText('Cisplatin')).toBeInTheDocument();
    expect(screen.getByText('Platinol')).toBeInTheDocument();
  });

  test('clicking the drug name calls onDrugClick with the drug', () => {
    const onDrugClick = vi.fn();
    render(<DrugCard {...baseProps} onDrugClick={onDrugClick} />);
    fireEvent.click(screen.getByText('Cisplatin'));
    expect(onDrugClick).toHaveBeenCalledWith(drug);
  });

  test('favorite button uses drug.id (not name) when toggling', () => {
    const onToggleFavorite = vi.fn();
    render(<DrugCard {...baseProps} onToggleFavorite={onToggleFavorite} />);
    const favBtn = screen.getByLabelText('buttons.addToFavorites');
    fireEvent.click(favBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith(drug.id);
  });

  test('aria-label reflects the favorite state', () => {
    const { rerender } = render(<DrugCard {...baseProps} isFavorite={false} />);
    expect(screen.getByLabelText('buttons.addToFavorites')).toBeInTheDocument();
    rerender(<DrugCard {...baseProps} isFavorite={true} />);
    expect(screen.getByLabelText('buttons.removeFromFavorites')).toBeInTheDocument();
  });
});
