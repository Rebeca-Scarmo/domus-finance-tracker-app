
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthHeaderProps {
  isLogin: boolean;
  isForgotPassword: boolean;
  isResetPassword: boolean;
}

export function AuthHeader({ isLogin, isForgotPassword, isResetPassword }: AuthHeaderProps) {
  const getTitle = () => {
    if (isResetPassword) return 'Redefinir Senha';
    if (isForgotPassword) return 'Recuperar Senha';
    return isLogin ? 'Entrar' : 'Criar Conta';
  };

  const getDescription = () => {
    if (isResetPassword) return 'Digite sua nova senha';
    if (isForgotPassword) return 'Digite seu email para receber as instruções de recuperação';
    return isLogin 
      ? 'Entre na sua conta para continuar' 
      : 'Crie sua conta para começar a organizar suas finanças';
  };

  return (
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <img 
          src="/lovable-uploads/aed0458b-5540-4810-abe5-3bc5ac443873.png" 
          alt="DOMUS Logo" 
          className="w-16 h-16"
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
      <h1 className="text-3xl font-bold text-[#EEB3E7] mb-2">DOMUS</h1>
      <CardTitle className="text-[#DDDDDD]">
        {getTitle()}
      </CardTitle>
      <CardDescription className="text-[#7C7C7C]">
        {getDescription()}
      </CardDescription>
    </CardHeader>
  );
}
