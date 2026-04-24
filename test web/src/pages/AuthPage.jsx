import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Sprout, ShoppingBag, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, lang } = useApp();
  const navigate = useNavigate();

  const [mode, setMode]         = useState('login');   // 'login' | 'signup'
  const [role, setRole]         = useState('consumer'); // 'consumer' | 'farmer'
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { session: newSession } = await signUp(email, password, role, fullName);
        // If email confirmation is disabled, session is returned immediately
        if (newSession) {
          navigate(role === 'farmer' ? '/farmer' : '/shop');
        } else {
          // Email confirmation required — show message
          setSuccess(lang === 'en'
            ? '✅ Account created! Check your email to confirm, then log in here.'
            : '✅ खाता बना! ईमेल कन्फर्म करें, फिर लॉगिन करें।');
          setMode('login');
        }
      } else {
        const data = await signIn(email, password);
        // Read role from actual Supabase profile (not the UI toggle)
        const actualRole = data?.user?.user_metadata?.role || role;
        navigate(actualRole === 'farmer' ? '/farmer' : '/shop');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🌿</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)' }}>FarmDirect</div>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '.9rem' }}>
            {lang === 'en' ? 'Farm se Direct, Freshness Guaranteed' : 'खेत से सीधे, ताज़गी की गारंटी'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 28, gap: 4 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 'calc(var(--radius-sm) - 2px)',
                  fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'all .2s',
                  background: mode === m ? 'var(--surface-solid)' : 'transparent',
                  color: mode === m ? 'var(--green)' : 'var(--text-secondary)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                }}>
                {m === 'login' ? (lang === 'en' ? 'Login' : 'लॉगिन') : (lang === 'en' ? 'Sign Up' : 'साइन अप')}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { val: 'consumer', icon: <ShoppingBag size={22} />, label: lang === 'en' ? 'Consumer' : 'ग्राहक', sub: lang === 'en' ? 'Buy fresh produce' : 'ताज़ी उपज खरीदें' },
              { val: 'farmer',   icon: <Sprout size={22} />,      label: lang === 'en' ? 'Farmer' : 'किसान',    sub: lang === 'en' ? 'Sell your produce' : 'अपनी उपज बेचें' },
            ].map(r => (
              <button key={r.val} onClick={() => setRole(r.val)} id={`role-${r.val}`}
                style={{
                  padding: '16px 12px', border: '2px solid', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  borderColor: role === r.val ? 'var(--green)' : 'var(--border-color)',
                  background: role === r.val ? 'var(--green-light)' : 'var(--surface-solid)',
                  textAlign: 'center', transition: 'all .2s',
                }}>
                <div style={{ color: role === r.val ? 'var(--green)' : 'var(--text-secondary)', marginBottom: 6 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: role === r.val ? 'var(--green)' : 'var(--text-primary)' }}>{r.label}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{r.sub}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full name — signup only */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  {lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input id="signup-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    placeholder={lang === 'en' ? 'Ramesh Patel' : 'रमेश पटेल'}
                    style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-sm)', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                {lang === 'en' ? 'Email' : 'ईमेल'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-sm)', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                {lang === 'en' ? 'Password' : 'पासवर्ड'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input id="auth-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder={lang === 'en' ? 'Min 6 characters' : 'न्यूनतम 6 अक्षर'}
                  style={{ width: '100%', padding: '12px 44px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: 'var(--radius-sm)', fontSize: '.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: '.875rem' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', color: '#16A34A', fontSize: '.875rem' }}>
                {success}
              </div>
            )}

            <button type="submit" id="auth-submit" disabled={loading}
              style={{
                padding: '14px', background: loading ? '#9CA3AF' : 'var(--green)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'all .2s', fontFamily: 'inherit',
              }}>
              {loading ? (lang === 'en' ? 'Please wait...' : 'कृपया प्रतीक्षा करें...') : (
                <>
                  {mode === 'login' ? (lang === 'en' ? 'Login' : 'लॉगिन') : (lang === 'en' ? 'Create Account' : 'खाता बनाएं')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.875rem', color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? (lang === 'en' ? "Don't have an account? " : "खाता नहीं है? ")
              : (lang === 'en' ? 'Already have an account? ' : 'पहले से खाता है? ')
            }
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem' }}>
              {mode === 'login' ? (lang === 'en' ? 'Sign Up' : 'साइन अप') : (lang === 'en' ? 'Login' : 'लॉगिन')}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
