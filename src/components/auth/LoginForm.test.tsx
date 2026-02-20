/**
 * Unit tests for LoginForm component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

const mockSignIn = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    render(<LoginForm />);
    const form = screen.getByRole('button', { name: 'Sign In' }).closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    }
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  it('shows error when username is too short', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('calls signIn and shows error on failure', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });
    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('testuser', 'wrongpass');
    });
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls onSuccess when login succeeds', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
