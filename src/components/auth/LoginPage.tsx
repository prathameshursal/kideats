import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Phone, Loader2, ArrowLeft, ShieldCheck, Sparkles, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', dial: '1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dial: '44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', dial: '91', name: 'India', flag: '🇮🇳' },
  { code: 'CA', dial: '1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dial: '61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dial: '49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dial: '33', name: 'France', flag: '🇫🇷' },
  { code: 'ES', dial: '34', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', dial: '39', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', dial: '31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', dial: '46', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', dial: '47', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', dial: '45', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', dial: '358', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', dial: '41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', dial: '43', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', dial: '32', name: 'Belgium', flag: '🇧🇪' },
  { code: 'IE', dial: '353', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', dial: '351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', dial: '30', name: 'Greece', flag: '🇬🇷' },
  { code: 'PL', dial: '48', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', dial: '420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'RO', dial: '40', name: 'Romania', flag: '🇷🇴' },
  { code: 'HU', dial: '36', name: 'Hungary', flag: '🇭🇺' },
  { code: 'BG', dial: '359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', dial: '385', name: 'Croatia', flag: '🇭🇷' },
  { code: 'SK', dial: '421', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', dial: '386', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'LT', dial: '370', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LV', dial: '371', name: 'Latvia', flag: '🇱🇻' },
  { code: 'EE', dial: '372', name: 'Estonia', flag: '🇪🇪' },
  { code: 'IS', dial: '354', name: 'Iceland', flag: '🇮🇸' },
  { code: 'LU', dial: '352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', dial: '356', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', dial: '357', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'AE', dial: '971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', dial: '966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', dial: '974', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', dial: '965', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', dial: '973', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', dial: '968', name: 'Oman', flag: '🇴🇲' },
  { code: 'JO', dial: '962', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', dial: '961', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'IL', dial: '972', name: 'Israel', flag: '🇮🇱' },
  { code: 'TR', dial: '90', name: 'Turkey', flag: '🇹🇷' },
  { code: 'EG', dial: '20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'ZA', dial: '27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', dial: '234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', dial: '254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', dial: '233', name: 'Ghana', flag: '🇬🇭' },
  { code: 'MA', dial: '212', name: 'Morocco', flag: '🇲🇦' },
  { code: 'PK', dial: '92', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', dial: '880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'LK', dial: '94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', dial: '977', name: 'Nepal', flag: '🇳🇵' },
  { code: 'ID', dial: '62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', dial: '60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', dial: '65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', dial: '66', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', dial: '63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', dial: '84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'JP', dial: '81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', dial: '82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', dial: '86', name: 'China', flag: '🇨🇳' },
  { code: 'HK', dial: '852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', dial: '886', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'NZ', dial: '64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'BR', dial: '55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', dial: '52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', dial: '54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', dial: '56', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', dial: '57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', dial: '51', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', dial: '58', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'UY', dial: '598', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'RU', dial: '7', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', dial: '380', name: 'Ukraine', flag: '🇺🇦' },
];

function CountryCodePicker({
  selected,
  onSelect,
}: {
  selected: Country;
  onSelect: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="flex items-center gap-1.5 h-full px-3 bg-gray-50 border-r-2 border-gray-200 hover:bg-gray-100 transition-colors min-h-[52px] whitespace-nowrap"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="text-sm font-bold text-gray-700">+{selected.dial}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-transparent focus:border-teal-300"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">No countries found</p>
              )}
              {filtered.map(c => (
                <button
                  key={c.code + c.dial}
                  type="button"
                  onClick={() => { onSelect(c); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 transition-colors text-left ${
                    selected.code === c.code ? 'bg-teal-50/50' : ''
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">+{c.dial}</span>
                  {selected.code === c.code && <Check size={16} className="text-teal-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<'choose' | 'phone' | 'otp'>('choose');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState<'google' | 'phone' | 'otp' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fullPhoneNumber = `+${country.dial}${phone.replace(/\D/g, '')}`;

  const handleGoogle = async () => {
    setLoading('google');
    setError(null);
    setInfo(null);

    const redirectTo = window.location.origin;
    // Google blocks its sign-in page inside iframes (e.g. the editor preview), so open it in a new tab there.
    const inIframe = window.self !== window.top;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: inIframe },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not enabled') || msg.includes('unsupported provider')) {
        setError('Google sign-in isn\'t turned on yet. Enable it in your project\'s Authentication settings.');
      } else {
        setError(error.message);
      }
      setLoading(null);
      return;
    }

    if (inIframe && data?.url) {
      const win = window.open(data.url, '_blank', 'noopener');
      setLoading(null);
      if (!win) {
        setError('Your browser blocked the Google sign-in window. Allow pop-ups, or open the published site directly.');
      } else {
        setInfo('Google sign-in opened in a new tab. Finish signing in there.');
      }
    }
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter a valid phone number (at least 7 digits)');
      return;
    }
    setLoading('phone');
    setError(null);
    setInfo(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
      options: { channel: 'sms' },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('sms') || msg.includes('phone') || msg.includes('provider')) {
        setError('Phone sign-in isn\'t configured yet. An SMS provider (like Twilio) must be set up in your Supabase project\'s Auth settings.');
      } else if (msg.includes('rate') || msg.includes('limit')) {
        setError('Too many attempts. Please wait a minute before trying again.');
      } else {
        setError(error.message);
      }
      setLoading(null);
    } else {
      setMode('otp');
      setLoading(null);
      setInfo(`Code sent to ${fullPhoneNumber}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading('otp');
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('code')) {
        setError('Invalid or expired code. Please request a new one.');
      } else if (msg.includes('attempts')) {
        setError('Too many wrong attempts. Go back and request a new code.');
      } else {
        setError(error.message);
      }
      setLoading(null);
    }
    // On success, onAuthStateChange fires — no need to clear loading
  };

  const handleResendCode = async () => {
    setLoading('phone');
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
      options: { channel: 'sms' },
    });
    if (error) {
      setError(error.message);
    } else {
      setInfo('New code sent!');
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg mb-4"
            >
              <Leaf size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">KidEats</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">Healthy meals, fun choices, happy kids</p>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'choose' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <button
                  onClick={handleGoogle}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 rounded-2xl font-semibold text-gray-700 transition-all min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading === 'google' ? (
                    <Loader2 size={20} className="animate-spin text-teal-500" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  onClick={() => { setMode('phone'); setError(null); setInfo(null); }}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-2xl font-semibold text-white transition-all shadow-lg shadow-teal-500/20 min-h-[52px] disabled:opacity-60"
                >
                  <Phone size={20} />
                  Continue with Phone
                </button>

                {info && (
                  <p className="text-center text-sm text-teal-600 font-medium flex items-center justify-center gap-1 pt-2">
                    <Check size={14} /> {info}
                  </p>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 pt-2 px-3 py-2 bg-red-50 rounded-xl"
                  >
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-4 pt-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ShieldCheck size={14} /> Secure</span>
                  <span className="flex items-center gap-1"><Sparkles size={14} /> Fun for kids</span>
                </div>
              </motion.div>
            )}

            {mode === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => { setMode('choose'); setError(null); setInfo(null); }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="flex items-stretch bg-white border-2 border-gray-200 focus-within:border-teal-400 rounded-2xl overflow-hidden transition-colors">
                    <CountryCodePicker selected={country} onSelect={setCountry} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                      placeholder="555 123 4567"
                      className="flex-1 py-3.5 px-4 bg-white text-gray-800 outline-none min-h-[52px]"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Phone size={11} />
                    We'll text a 6-digit code to <span className="font-semibold text-gray-500">{fullPhoneNumber}</span>
                  </p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading !== null || phone.replace(/\D/g, '').length < 7}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-2xl font-semibold text-white transition-all shadow-lg shadow-teal-500/20 min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading === 'phone' ? <Loader2 size={20} className="animate-spin" /> : <Phone size={20} />}
                  Send Code
                </button>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}
              </motion.div>
            )}

            {mode === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => { setMode('phone'); setError(null); setInfo(null); setOtp(''); }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3.5 px-4 bg-white border-2 border-gray-200 focus:border-teal-400 rounded-2xl text-gray-800 text-center text-2xl tracking-[0.5em] outline-none transition-colors min-h-[52px]"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Code sent to <span className="font-semibold text-gray-500">{fullPhoneNumber}</span>
                  </p>
                </div>

                {info && (
                  <p className="text-center text-sm text-teal-600 font-medium flex items-center justify-center gap-1">
                    <Check size={14} /> {info}
                  </p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading !== null || otp.length < 6}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-2xl font-semibold text-white transition-all shadow-lg shadow-teal-500/20 min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading === 'otp' ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                  Verify & Sign In
                </button>

                <button
                  onClick={handleResendCode}
                  disabled={loading !== null}
                  className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-1"
                >
                  Didn't get it? Resend code
                </button>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to KidEats' terms and privacy policy.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
