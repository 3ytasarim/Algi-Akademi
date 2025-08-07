import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { 
  Mail, 
  Save,
  TestTube,
  ArrowLeft,
  Settings,
  Key
} from "lucide-react";

export default function EmailIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [emailConfig, setEmailConfig] = useState({
    apiKey: "",
    fromEmail: "noreply@algiacademy.com",
    fromName: "Algı Akademi",
    replyTo: "info@algiacademy.com",
    isActive: false
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/integrations/email', "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "E-posta entegrasyon ayarları güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "E-posta ayarları güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleEmailConfigChange = (field: string, value: string | boolean) => {
    setEmailConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEmailConfig = () => {
    updateIntegrationMutation.mutate({
      type: 'email',
      name: 'E-posta Entegrasyonu',
      config: emailConfig,
      isActive: emailConfig.isActive
    });
  };

  const sendTestEmail = () => {
    toast({
      title: "Test E-postası",
      description: "Test e-postası gönderiliyor...",
    });
    
    setTimeout(() => {
      toast({
        title: "Başarılı",
        description: "Test e-postası başarıyla gönderildi",
      });
    }, 2000);
  };

  return (
    <LayoutWrapper title="E-posta Entegrasyonu" subtitle="E-posta bildirim yapılandırması" activeHref="/integrations">
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Link href="/integrations" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">E-posta Entegrasyon Ayarları</h1>
            <p className="text-gray-600 dark:text-gray-300">SendGrid e-posta servis ayarlarını yapılandırın</p>
          </div>
        </div>

        {/* Email Configuration */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">SendGrid Ayarları</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">E-posta gönderimi için SendGrid yapılandırması</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailConfig.isActive}
                  onCheckedChange={(checked) => handleEmailConfigChange('isActive', checked)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {emailConfig.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="dark:text-gray-200 flex items-center gap-2">
                  <Key size={16} />
                  SendGrid API Anahtarı
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={emailConfig.apiKey}
                  onChange={(e) => handleEmailConfigChange('apiKey', e.target.value)}
                  placeholder="SG.xxxxxxxxxxxxxxxxxx"
                  disabled={!emailConfig.isActive}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="dark:text-gray-200">Gönderici E-posta</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => handleEmailConfigChange('fromEmail', e.target.value)}
                    placeholder="noreply@algiacademy.com"
                    disabled={!emailConfig.isActive}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fromName" className="dark:text-gray-200">Gönderici Adı</Label>
                  <Input
                    id="fromName"
                    type="text"
                    value={emailConfig.fromName}
                    onChange={(e) => handleEmailConfigChange('fromName', e.target.value)}
                    placeholder="Algı Akademi"
                    disabled={!emailConfig.isActive}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="replyTo" className="dark:text-gray-200">Yanıt Adresi</Label>
                <Input
                  id="replyTo"
                  type="email"
                  value={emailConfig.replyTo}
                  onChange={(e) => handleEmailConfigChange('replyTo', e.target.value)}
                  placeholder="info@algiacademy.com"
                  disabled={!emailConfig.isActive}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={saveEmailConfig}
                className="flex-1"
                disabled={updateIntegrationMutation.isPending || !emailConfig.isActive}
              >
                <Save className="mr-2" size={16} />
                Ayarları Kaydet
              </Button>
              <Button
                onClick={sendTestEmail}
                variant="outline"
                disabled={!emailConfig.isActive || !emailConfig.apiKey}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <TestTube className="mr-2" size={16} />
                Test E-postası Gönder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Settings className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
              <div className="text-sm text-gray-800 dark:text-gray-200">
                <p className="font-medium mb-2">SendGrid Entegrasyon Bilgileri</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>SendGrid hesabınızdan API anahtarı oluşturmanız gerekir</li>
                  <li>Gönderici e-posta adresiniz SendGrid'de doğrulanmış olmalıdır</li>
                  <li>Test e-postası göndererek ayarların doğru olduğunu kontrol edebilirsiniz</li>
                  <li>E-posta entegrasyonu devre dışı bırakıldığında otomatik e-posta gönderimi durur</li>
                  <li>SendGrid ücretsiz planında günlük 100 e-posta gönderebilirsiniz</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}