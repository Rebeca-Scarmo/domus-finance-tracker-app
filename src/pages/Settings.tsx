
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Crown, Bell, Globe, DollarSign, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    email: '',
    currency: 'BRL',
    language: 'pt-BR',
    email_notifications: true,
    push_notifications: false,
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          currency: data.currency || 'BRL',
          language: data.language || 'pt-BR',
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? false,
        });
      } else {
        // Se não existe perfil, usar dados do auth
        setUserProfile(prev => ({
          ...prev,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
        }));
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...userProfile,
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Premium",
      description: "Funcionalidade de upgrade será implementada em breve!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-[#EEB3E7]" />
        <h1 className="text-3xl font-bold text-[#DDDDDD]">Configurações</h1>
      </div>

      {/* Perfil do Usuário */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#DDDDDD] mb-2">
                Nome Completo
              </label>
              <Input
                value={userProfile.full_name}
                onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#DDDDDD] mb-2">
                Email
              </label>
              <Input
                value={userProfile.email}
                onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD] placeholder:text-[#7C7C7C]"
                placeholder="seu@email.com"
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#DDDDDD] mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Moeda
              </label>
              <Select
                value={userProfile.currency}
                onValueChange={(value) => setUserProfile(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                  <SelectItem value="BRL" className="text-[#DDDDDD]">Real Brasileiro (BRL)</SelectItem>
                  <SelectItem value="USD" className="text-[#DDDDDD]">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR" className="text-[#DDDDDD]">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#DDDDDD] mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Idioma
              </label>
              <Select
                value={userProfile.language}
                onValueChange={(value) => setUserProfile(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="bg-[#000000] border-[#7C7C7C] text-[#DDDDDD]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#000000] border-[#7C7C7C]">
                  <SelectItem value="pt-BR" className="text-[#DDDDDD]">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US" className="text-[#DDDDDD]">English (US)</SelectItem>
                  <SelectItem value="es-ES" className="text-[#DDDDDD]">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card className="bg-[#000000] border-[#7C7C7C]">
        <CardHeader>
          <CardTitle className="text-[#DDDDDD] flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#DDDDDD] font-medium">Notificações por Email</p>
              <p className="text-[#7C7C7C] text-sm">Receba atualizações e lembretes por email</p>
            </div>
            <Switch
              checked={userProfile.email_notifications}
              onCheckedChange={(checked) => setUserProfile(prev => ({ ...prev, email_notifications: checked }))}
              className="data-[state=checked]:bg-[#EEB3E7]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#DDDDDD] font-medium">Notificações Push</p>
              <p className="text-[#7C7C7C] text-sm">Receba notificações no navegador</p>
            </div>
            <Switch
              checked={userProfile.push_notifications}
              onCheckedChange={(checked) => setUserProfile(prev => ({ ...prev, push_notifications: checked }))}
              className="data-[state=checked]:bg-[#EEB3E7]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Premium */}
      <Card className="bg-gradient-to-r from-[#EEB3E7]/10 to-[#EEB3E7]/5 border-[#EEB3E7]/50">
        <CardHeader>
          <CardTitle className="text-[#EEB3E7] flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Upgrade Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-[#DDDDDD]">
              Desbloqueie recursos premium e tenha acesso a funcionalidades avançadas:
            </p>
            <ul className="space-y-2 text-[#DDDDDD]">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#EEB3E7] rounded-full" />
                Relatórios avançados e análises detalhadas
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#EEB3E7] rounded-full" />
                Metas ilimitadas e orçamentos personalizados
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#EEB3E7] rounded-full" />
                Sincronização automática com bancos
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#EEB3E7] rounded-full" />
                Suporte prioritário
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 bg-[#EEB3E7] rounded-full" />
                Backup automático na nuvem
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1 p-4 border border-[#7C7C7C] rounded-lg">
              <h4 className="text-[#DDDDDD] font-semibold mb-2">Plano Mensal</h4>
              <p className="text-[#EEB3E7] text-2xl font-bold">R$ 19,90<span className="text-sm text-[#7C7C7C]">/mês</span></p>
              <Button
                onClick={handleUpgrade}
                className="w-full mt-3 bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
              >
                Assinar Mensal
              </Button>
            </div>
            
            <div className="flex-1 p-4 border-2 border-[#EEB3E7] rounded-lg bg-[#EEB3E7]/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#DDDDDD] font-semibold">Plano Anual</h4>
                <span className="bg-[#EEB3E7] text-[#000000] text-xs px-2 py-1 rounded-full font-medium">
                  Economize 20%
                </span>
              </div>
              <p className="text-[#EEB3E7] text-2xl font-bold">R$ 159,90<span className="text-sm text-[#7C7C7C]">/ano</span></p>
              <p className="text-[#7C7C7C] text-sm">Equivale a R$ 13,33/mês</p>
              <Button
                onClick={handleUpgrade}
                className="w-full mt-3 bg-[#EEB3E7] text-[#000000] hover:bg-[#EEB3E7]/90"
              >
                Assinar Anual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
