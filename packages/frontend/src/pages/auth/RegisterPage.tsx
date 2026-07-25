import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Logo } from '../../components/ui/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, organizationName: organizationName || undefined });
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <Logo size="lg" />
          <h2 className="mt-10 text-3xl font-bold leading-tight text-white xl:text-4xl">Start your<br /><span className="text-primary-200">free trial</span></h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-primary-100/80">Join thousands of businesses automating their accounting with FiscalFlow.</p>
          <div className="mt-12 grid grid-cols-2 gap-3">
            {[{ value: '10K+', label: 'Businesses' }, { value: '$2B+', label: 'Transactions' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Support' }].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-primary-200/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo size="md" /></div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Get started with FiscalFlow in minutes</p>

          {error && <div className="mt-6"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Full name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" autoFocus />
            <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input label="Organization name" placeholder="Acme Corp (optional)" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} hint="You can create one later" />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            <Button type="submit" loading={loading} className="w-full" size="lg">Create account</Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
