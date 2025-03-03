import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { BACKEND_API } from '@/utils/urls';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // TODO: shoud we keep this?
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${BACKEND_API}/users/@me`, { withCredentials: true });
        if (res.data.uid) {
          router.push(router.query.redirect_uri?.toString() || '/');
        }
      } catch (err) {}
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const body = { email, password };
  
    try {
        await axios.post(`${BACKEND_API}/auth/login`, body, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
       });
  
        // Redirect and force a full page reload
        const redirectUrl = router.query.redirect_uri
          ? decodeURIComponent(router.query.redirect_uri as string)
          : '/';
        window.location.href = redirectUrl;
    } catch (err: any) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || 'An unknown error occurred');
        }
    }
  };
  

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '1rem' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Login
        </button>
      </form>
    </div>
  );
}
