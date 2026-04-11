import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnManagerModal } from './ColumnManagerModal';

const noop = () => {};
const tStub = (key) => key;
const formatColumnName = (col) => col;

describe('ColumnManagerModal', () => {
  const baseProps = {
    show: true,
    onClose: noop,
    visibleColumns: { name: true, commercial: false, halfLife: true },
    onChange: noop,
    isDarkMode: false,
    t: tStub,
    formatColumnName,
  };

  test('renders nothing when show is false', () => {
    const { container } = render(<ColumnManagerModal {...baseProps} show={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders one labelled checkbox per column', () => {
    render(<ColumnManagerModal {...baseProps} />);
    expect(screen.getByLabelText('name')).toBeChecked();
    expect(screen.getByLabelText('commercial')).not.toBeChecked();
    expect(screen.getByLabelText('halfLife')).toBeChecked();
  });

  test('toggling a checkbox calls onChange with the new value', () => {
    const onChange = vi.fn();
    render(<ColumnManagerModal {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('commercial'));
    expect(onChange).toHaveBeenCalledWith('commercial', true);
  });

  test('Done and Close buttons trigger onClose', () => {
    const onClose = vi.fn();
    render(<ColumnManagerModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('buttons.done'));
    fireEvent.click(screen.getByLabelText('buttons.close'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('clicking the backdrop closes the dialog', () => {
    const onClose = vi.fn();
    const { container } = render(<ColumnManagerModal {...baseProps} onClose={onClose} />);
    // The backdrop is the outermost div with the bg overlay
    const backdrop = container.firstChild;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
