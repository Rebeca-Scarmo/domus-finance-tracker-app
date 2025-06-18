
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
          src="/lovable-uploads/5e6b05e1-c4bc-43db-80a1-1687729d3257.png" 
          alt="DOMUS Logo" 
          className="w-16 h-16"
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
