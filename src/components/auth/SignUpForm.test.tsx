/**
 * Unit tests for SignUpForm component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from './SignUpForm';

const mockSignUp = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/^Cellphone/iu), { target: { value: '5551234567' } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Password', { selector: '#register-password' }), {
    target: { value: 'password123' },
  });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
}

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<SignUpForm />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Cellphone/iu)).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: '#register-password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows validation error for empty first name', async () => {
    render(<SignUpForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: '' } });
    const form = screen.getByRole('button', { name: 'Create Account' }).closest('form');
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText(/please enter your first name/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when cellphone is missing', async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password', { selector: '#register-password' }), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText(/please enter your cellphone/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(<SignUpForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(<SignUpForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Password', { selector: '#register-password' }), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('calls signUp and shows error on failure', async () => {
    mockSignUp.mockResolvedValue({ error: 'Email already registered' });
    render(<SignUpForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'existing@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'existing@example.com',
        'password123',
        'John',
        'Doe',
        '5551234567',
        undefined,
        'author',
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('shows server field error on cellphone field', async () => {
    mockSignUp.mockResolvedValue({
      error: 'Cellphone: Invalid.',
      fieldErrors: { phone: 'This phone number is invalid.' },
    });
    render(<SignUpForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => {
      expect(screen.getByText('This phone number is invalid.')).toBeInTheDocument();
    });
  });
});
