
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await handleForgotPassword();
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

  const handleForgotPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      // Mostrar mensagem de sucesso usando toast
      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha.",
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Recuperar Senha';
    return isLogin ? 'Entrar' : 'Criar Conta';
  };

  const getDescription = () => {
    if (isForgotPassword) return 'Digite seu email para receber as instruções de recuperação';
    return isLogin 
      ? 'Entre na sua conta para continuar' 
      : 'Crie sua conta para começar a organizar suas finanças';
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#000000] border-[#7C7C7C]">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-[#EEB3E7] mb-2">DOMUS</h1>
          <CardTitle className="text-[#DDDDDD]">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-[#7C7C7C]">
            {getDescription()}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#DDDDDD]">
                  Nome Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin && !isForgotPassword}
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

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

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#DDDDDD]">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] focus:border-[#EEB3E7]"
                  placeholder="Sua senha"
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
              {loading ? 'Carregando...' : (
                isForgotPassword ? 'Enviar Email' : (isLogin ? 'Entrar' : 'Criar Conta')
              )}
            </Button>

            {isLogin && !isForgotPassword && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsForgotPassword(true)}
                className="text-[#7C7C7C] hover:text-[#DDDDDD]"
              >
                Esqueceu a senha?
              </Button>
            )}

            {isForgotPassword ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsLogin(true);
                }}
                className="text-[#7C7C7C] hover:text-[#DDDDDD]"
              >
                Voltar para o login
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
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
      </Card>
    </div>
  );
}
