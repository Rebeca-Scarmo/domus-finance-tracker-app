
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';

interface AuthFormProps {
  isLogin: boolean;
  isForgotPassword: boolean;
  isResetPassword: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onBackToLogin: () => void;
}

export function AuthForm({
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
  onSubmit,
  onToggleMode,
  onForgotPassword,
  onBackToLogin,
}: AuthFormProps) {
  const getButtonText = () => {
    if (loading) return 'Carregando...';
    if (isResetPassword) return 'Redefinir Senha';
    if (isForgotPassword) return 'Enviar Email';
    return isLogin ? 'Entrar' : 'Criar Conta';
  };

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        {!isLogin && !isForgotPassword && !isResetPassword && (
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[#DDDDDD]">
              Nome Completo
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={!isLogin && !isForgotPassword && !isResetPassword}
              className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
              placeholder="Seu nome completo"
            />
          </div>
        )}

        {!isResetPassword && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#DDDDDD]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
              placeholder="seu@email.com"
            />
          </div>
        )}

        {!isForgotPassword && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#DDDDDD]">
              {isResetPassword ? 'Nova Senha' : 'Senha'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
              placeholder={isResetPassword ? "Sua nova senha" : "Sua senha"}
            />
          </div>
        )}

        {isResetPassword && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#DDDDDD]">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
              placeholder="Confirme sua nova senha"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
        >
          {getButtonText()}
        </Button>

        {isLogin && !isForgotPassword && !isResetPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={onForgotPassword}
            className="text-[#7C7C7C] hover:text-[#DDDDDD]"
          >
            Esqueceu a senha?
          </Button>
        )}

        {isForgotPassword ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToLogin}
            className="text-[#7C7C7C] hover:text-[#DDDDDD]"
          >
            Voltar para o login
          </Button>
        ) : !isResetPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleMode}
            className="text-[#7C7C7C] hover:text-[#DDDDDD]"
          >
            {isLogin 
              ? 'Não tem uma conta? Criar conta' 
              : 'Já tem uma conta? Entrar'
            }
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
