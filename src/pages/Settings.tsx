
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  User, 
  CreditCard, 
  Download, 
  Trash2,
  Crown,
  Star
} from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
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
    theme: 'dark'
  });
  
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  });

  const [isPremium] = useState(false); // Simulação de status premium

  const saveSettings = () => {
    // Aqui você salvaria as configurações no Supabase
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const exportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  const deleteAccount = () => {
    toast({
      title: "Confirmação necessária",
      description: "Esta ação não pode ser desfeita. Entre em contato com o suporte.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#DDDDDD]">Configurações</h1>
            <p className="text-[#7C7C7C] mt-1">Gerencie suas preferências e conta</p>
          </div>
          {isPremium && (
            <Badge className="bg-[#EEB3E7] text-[#000000]">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Perfil do Usuário */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center">
              <User className="w-5 h-5 mr-2" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription className="text-[#7C7C7C]">
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#DDDDDD]">Nome</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#DDDDDD]">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-[#000000] border-[#7C7C7C] text-[#7C7C7C]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificações
            </CardTitle>
            <CardDescription className="text-[#7C7C7C]">
              Configure quando você quer ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#DDDDDD]">Transações</Label>
                <p className="text-sm text-[#7C7C7C]">Notificações de novas transações</p>
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
                <Label className="text-[#DDDDDD]">Alertas de Orçamento</Label>
                <p className="text-sm text-[#7C7C7C]">Avisos quando ultrapassar limites</p>
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
                <Label className="text-[#DDDDDD]">Lembretes de Metas</Label>
                <p className="text-sm text-[#7C7C7C]">Progresso das suas metas</p>
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
                <Label className="text-[#DDDDDD]">Relatórios Semanais</Label>
                <p className="text-sm text-[#7C7C7C]">Resumo semanal das finanças</p>
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
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Preferências
            </CardTitle>
            <CardDescription className="text-[#7C7C7C]">
              Personalize sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#DDDDDD]">Moeda</Label>
                <Select value={preferences.currency} onValueChange={(value) => 
                  setPreferences({ ...preferences, currency: value })
                }>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="BRL" className="text-[#DDDDDD]">Real (R$)</SelectItem>
                    <SelectItem value="USD" className="text-[#DDDDDD]">Dólar ($)</SelectItem>
                    <SelectItem value="EUR" className="text-[#DDDDDD]">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#DDDDDD]">Idioma</Label>
                <Select value={preferences.language} onValueChange={(value) => 
                  setPreferences({ ...preferences, language: value })
                }>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="pt-BR" className="text-[#DDDDDD]">Português</SelectItem>
                    <SelectItem value="en-US" className="text-[#DDDDDD]">English</SelectItem>
                    <SelectItem value="es-ES" className="text-[#DDDDDD]">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#DDDDDD]">Formato de Data</Label>
                <Select value={preferences.dateFormat} onValueChange={(value) => 
                  setPreferences({ ...preferences, dateFormat: value })
                }>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="DD/MM/YYYY" className="text-[#DDDDDD]">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/DD/YYYY" className="text-[#DDDDDD]">MM/DD/AAAA</SelectItem>
                    <SelectItem value="YYYY-MM-DD" className="text-[#DDDDDD]">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#DDDDDD]">Tema</Label>
                <Select value={preferences.theme} onValueChange={(value) => 
                  setPreferences({ ...preferences, theme: value })
                }>
                  <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                    <SelectItem value="dark" className="text-[#DDDDDD]">Escuro</SelectItem>
                    <SelectItem value="light" className="text-[#DDDDDD]">Claro</SelectItem>
                    <SelectItem value="auto" className="text-[#DDDDDD]">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plano Premium */}
        <Card className="bg-gradient-to-r from-[#EEB3E7]/10 to-[#EEB3E7]/5 border-[#EEB3E7]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center">
              <Crown className="w-5 h-5 mr-2 text-[#EEB3E7]" />
              Plano Premium
            </CardTitle>
            <CardDescription className="text-[#7C7C7C]">
              Desbloqueie recursos avançados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPremium ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center text-[#DDDDDD]">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Relatórios avançados e análises detalhadas
                  </div>
                  <div className="flex items-center text-[#DDDDDD]">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Metas ilimitadas e categorias personalizadas
                  </div>
                  <div className="flex items-center text-[#DDDDDD]">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Exportação de dados em múltiplos formatos
                  </div>
                  <div className="flex items-center text-[#DDDDDD]">
                    <Star className="w-4 h-4 mr-2 text-[#EEB3E7]" />
                    Suporte prioritário
                  </div>
                </div>
                <Button className="w-full bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90">
                  Fazer Upgrade - R$ 9,90/mês
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-[#DDDDDD] mb-2">🎉 Você já é Premium!</p>
                <p className="text-[#7C7C7C] text-sm">Obrigado por apoiar o DOMUS</p>
                <Button variant="outline" className="mt-4 border-[#EEB3E7] text-[#EEB3E7]">
                  Gerenciar Assinatura
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segurança e Dados */}
        <Card className="bg-[#000000] border-[#7C7C7C]">
          <CardHeader>
            <CardTitle className="text-[#DDDDDD] flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Segurança e Dados
            </CardTitle>
            <CardDescription className="text-[#7C7C7C]">
              Gerencie seus dados e segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]/20"
              onClick={exportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            
            <Separator className="bg-[#7C7C7C]" />
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={deleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Conta
            </Button>
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
            className="flex-1 border-[#7C7C7C] text-[#DDDDDD] hover:bg-[#7C7C7C]/20"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
