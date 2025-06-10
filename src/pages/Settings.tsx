
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Globe, 
  User, 
  Crown,
  Star,
  Loader2
} from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Estados das configurações
  const [notifications, setNotifications] = useState({
    transactions: true,
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false
  });
  
  const [preferences, setPreferences] = useState({
    currency: 'BRL',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
  });
  
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  });

  const [subscriptionData, setSubscriptionData] = useState({
    subscribed: false,
    subscription_tier: null as string | null,
    subscription_end: null as string | null,
  });

  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erro ao verificar assinatura",
        description: "Não foi possível verificar o status da assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro ao abrir portal",
        description: "Não foi possível abrir o portal de gerenciamento.",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const saveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas preferências e conta</p>
          </div>
          {subscriptionData.subscribed && (
            <Badge className="bg-[#EEB3E7] text-[#000000]">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Perfil do Usuário */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <User className="w-5 h-5 mr-2" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">Nome</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-background border-border text-muted-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificações
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure quando você quer ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Transações</Label>
                <p className="text-sm text-muted-foreground">Notificações de novas transações</p>
              </div>
              <Switch
                checked={notifications.transactions}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, transactions: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Alertas de Orçamento</Label>
                <p className="text-sm text-muted-foreground">Avisos quando ultrapassar limites</p>
              </div>
              <Switch
                checked={notifications.budgetAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, budgetAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Lembretes de Metas</Label>
                <p className="text-sm text-muted-foreground">Progresso das suas metas</p>
              </div>
              <Switch
                checked={notifications.goalReminders}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, goalReminders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">Resumo semanal das finanças</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, weeklyReports: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Preferências
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Personalize sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Moeda</Label>
                <Select value={preferences.currency} onValueChange={(value) => 
                  setPreferences({ ...preferences, currency: value })
                }>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="BRL" className="text-popover-foreground">Real (R$)</SelectItem>
                    <SelectItem value="USD" className="text-popover-foreground">Dólar ($)</SelectItem>
                    <SelectItem value="EUR" className="text-popover-foreground">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Idioma</Label>
                <Select value={preferences.language} onValueChange={(value) => 
                  setPreferences({ ...preferences, language: value })
                }>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="pt-BR" className="text-popover-foreground">Português</SelectItem>
                    <SelectItem value="en-US" className="text-popover-foreground">English</SelectItem>
                    <SelectItem value="es-ES" className="text-popover-foreground">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Formato de Data</Label>
                <Select value={preferences.dateFormat} onValueChange={(value) => 
                  setPreferences({ ...preferences, dateFormat: value })
                }>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="DD/MM/YYYY" className="text-popover-foreground">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/DD/YYYY" className="text-popover-foreground">MM/DD/AAAA</SelectItem>
                    <SelectItem value="YYYY-MM-DD" className="text-popover-foreground">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="dark" className="text-popover-foreground">Escuro</SelectItem>
                    <SelectItem value="light" className="text-popover-foreground">Claro</SelectItem>
                    <SelectItem value="auto" className="text-popover-foreground">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plano Premium */}
        <Card className="bg-gradient-to-r from-[#EEB3E7]/10 to-[#EEB3E7]/5 border-[#EEB3E7]">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Crown className="w-5 h-5 mr-2 text-[#EEB3E7]" />
              Plano Premium
              {loadingSubscription && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Desbloqueie recursos avançados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!subscriptionData.subscribed ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center text-card-foreground">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Relatórios avançados e análises detalhadas
                  </div>
                  <div className="flex items-center text-card-foreground">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Metas ilimitadas e categorias personalizadas
                  </div>
                  <div className="flex items-center text-card-foreground">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Exportação de dados em múltiplos formatos
                  </div>
                  <div className="flex items-center text-card-foreground">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Suporte prioritário
                  </div>
                </div>
                <Button 
                  onClick={handleUpgrade}
                  disabled={loadingCheckout}
                  className="w-full bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
                >
                  {loadingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Fazer Upgrade - R$ 9,90/mês'
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-card-foreground mb-2">🎉 Você já é Premium!</p>
                <p className="text-muted-foreground text-sm">Obrigado por apoiar o DOMUS</p>
                {subscriptionData.subscription_end && (
                  <p className="text-muted-foreground text-xs mt-1">
                    Renova em: {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="mt-4 border-[#EEB3E7] text-[#EEB3E7]"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Gerenciar Assinatura'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={saveSettings}
            className="flex-1 bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
          >
            Salvar Configurações
          </Button>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="flex-1 border-border text-foreground hover:bg-muted"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
