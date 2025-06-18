
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthForm } from '@/hooks/useAuthForm';
import { AuthHeader } from '@/components/Auth/AuthHeader';
import { AuthForm } from '@/components/Auth/AuthForm';

export default function Auth() {
  const { user } = useAuth();
  const {
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
  } = useAuthForm();

  if (user && !isResetPassword) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#000000] border-[#7C7C7C]">
        <AuthHeader 
          isLogin={isLogin}
          isForgotPassword={isForgotPassword}
          isResetPassword={isResetPassword}
        />
        
        <AuthForm
          isLogin={isLogin}
          isForgotPassword={isForgotPassword}
          isResetPassword={isResetPassword}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          fullName={fullName}
          setFullName={setFullName}
          loading={loading}
          onSubmit={handleSubmit}
          onToggleMode={handleToggleMode}
          onForgotPassword={handleForgotPassword}
          onBackToLogin={handleBackToLogin}
        />
      </Card>
    </div>
  );
}
