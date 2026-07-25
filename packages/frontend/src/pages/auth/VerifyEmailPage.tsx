import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Logo } from '../../components/ui/Logo';

export default function VerifyEmailPage() {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || '';
  const [token, setToken] = useState('');
  const [email, setEmail] = useState(stateEmail);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await authApi.verifyEmail(token); setSuccess(true); } catch (err: any) { setError(err.message || 'Verification failed.'); } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo size="md" /></div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
            <svg className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Verify your email</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Enter the verification code sent to{email && <strong> {email}</strong>}</p>
        </div>
        {error && <div className="mt-6"><Alert variant="error">{error}</Alert></div>}
        {success ? (
          <div className="mt-6 space-y-4">
            <Alert variant="success" title="Email verified!">Your email has been verified. You can now use all features.</Alert>
            <Link to="/login"><Button variant="primary" className="w-full" size="lg">Sign in</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 space-y-4">
            <Input label="Verification code" placeholder="Enter the code from your email" value={token} onChange={(e) => setToken(e.target.value)} required autoFocus />
            <Button type="submit" loading={loading} className="w-full" size="lg">Verify email</Button>
          </form>
        )}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
