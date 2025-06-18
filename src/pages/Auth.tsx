
import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, resetPassword, updatePassword } = useAuth();

  useEffect(() => {
    // Verificar se é um link de redefinição de senha
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      setIsResetPassword(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [searchParams]);

  if (user && !isResetPassword) {
    return <Navigate to="/" replace />;
  }

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
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#000000] border-[#7C7C7C]">
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

        <form onSubmit={handleSubmit}>
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
              {loading ? 'Carregando...' : (
                isResetPassword ? 'Redefinir Senha' :
                isForgotPassword ? 'Enviar Email' : 
                (isLogin ? 'Entrar' : 'Criar Conta')
              )}
            </Button>

            {isLogin && !isForgotPassword && !isResetPassword && (
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
            ) : !isResetPassword && (
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
