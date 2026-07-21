import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Logo } from '../../components/ui/Logo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950 px-4">
        <div className="w-full max-w-sm text-center">
          <Logo size="md" className="flex justify-center mb-8" />
          <Alert variant="error" title="Invalid link">
            This password reset link is invalid or missing a token.
          </Alert>
          <Link to="/forgot-password" className="mt-6 inline-block">
            <Button variant="secondary">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="text-center">
          <h1 className="text-display-lg text-gray-900 dark:text-white">Set new password</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mt-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-6">
            <Alert variant="success" title="Password updated!">
              Your password has been reset successfully. You can now sign in with your new password.
            </Alert>
            <Link to="/login" className="block">
              <Button variant="primary" className="w-full" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Reset password
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
