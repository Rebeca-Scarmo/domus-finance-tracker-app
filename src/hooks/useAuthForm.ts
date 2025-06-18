
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function useAuthForm() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();

  useEffect(() => {
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      setIsResetPassword(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetPassword) {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        await updatePassword(password);
        setIsResetPassword(false);
        setIsLogin(true);
      } else if (isForgotPassword) {
        await resetPassword(email);
        setIsForgotPassword(false);
      } else if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => setIsLogin(!isLogin);
  const handleForgotPassword = () => setIsForgotPassword(true);
  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
  };

  return {
    isLogin,
    isForgotPassword,
    isResetPassword,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    loading,
    handleSubmit,
    handleToggleMode,
    handleForgotPassword,
    handleBackToLogin,
  };
}
