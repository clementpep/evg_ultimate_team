import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Card } from '@components/common/Card';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, isAdmin, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-5xl sm:text-6xl font-black text-center mb-3 uppercase tracking-wider text-gradient-psg">
          EVG ULTIMATE TEAM
        </h1>
        <p className="text-center text-text-secondary mb-8 font-semibold">EVG Paul CHAUVIN 2026</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom d'utilisateur"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Entrez votre nom"
            required
          />

          {isAdmin && (
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              required
            />
          )}

          {error && (
            <div className="bg-psg-red/20 border border-psg-red rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Connexion...' : isAdmin ? 'Connexion Admin' : 'Connexion'}
          </Button>

          <button
            type="button"
            onClick={() => setIsAdmin(!isAdmin)}
            className="text-sm text-gray-400 hover:text-white w-full text-center"
          >
            {isAdmin ? 'Connexion participant' : 'Connexion admin'}
          </button>
        </form>
      </Card>
    </div>
  );
};
