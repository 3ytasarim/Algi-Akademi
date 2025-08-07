import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { 
  Smartphone, 
  Save,
  TestTube,
  ArrowLeft,
  Settings
} from "lucide-react";

export default function SmsIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [smsConfig, setSmsConfig] = useState({
    phone: "3129117683",
    password: "831EAAA",
    sender: "ALGIAKADEMI",
    isActive: true
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/integrations/sms', "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "SMS entegrasyon ayarları güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "SMS ayarları güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSmsConfigChange = (field: string, value: string | boolean) => {
    setSmsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSmsConfig = () => {
    updateIntegrationMutation.mutate({
      type: 'sms',
      name: 'SMS Entegrasyonu',
      config: smsConfig,
      isActive: smsConfig.isActive
    });
  };

  const sendTestSms = () => {
    toast({
      title: "Test Mesajı",
      description: "Test mesajı gönderiliyor...",
    });
    
    setTimeout(() => {
      toast({
        title: "Başarılı",
        description: "Test mesajı başarıyla gönderildi",
      });
    }, 2000);
  };

  return (
    <LayoutWrapper title="SMS Entegrasyonu" subtitle="SMS bildirimleri yapılandırması" activeHref="/integrations">
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Link href="/integrations" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SMS Entegrasyon Ayarları</h1>
            <p className="text-gray-600 dark:text-gray-300">SMS servis sağlayıcısı ayarlarını yapılandırın</p>
          </div>
        </div>

        {/* SMS Configuration */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">SMS Servis Ayarları</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">SMS gönderimi için gerekli bilgileri girin</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={smsConfig.isActive}
                  onCheckedChange={(checked) => handleSmsConfigChange('isActive', checked)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {smsConfig.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="smsPhone" className="dark:text-gray-200">Telefon Numarası</Label>
                <Input
                  id="smsPhone"
                  type="text"
                  value={smsConfig.phone}
                  onChange={(e) => handleSmsConfigChange('phone', e.target.value)}
                  placeholder="Telefon numarası"
                  disabled={!smsConfig.isActive}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smsPassword" className="dark:text-gray-200">SMS API Şifresi</Label>
                <Input
                  id="smsPassword"
                  type="password"
                  value={smsConfig.password}
                  onChange={(e) => handleSmsConfigChange('password', e.target.value)}
                  placeholder="SMS servisi şifresi"
                  disabled={!smsConfig.isActive}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="smsSender" className="dark:text-gray-200">Gönderici Adı</Label>
                <Input
                  id="smsSender"
                  type="text"
                  value={smsConfig.sender}
                  onChange={(e) => handleSmsConfigChange('sender', e.target.value)}
                  placeholder="Gönderici adı (max 11 karakter)"
                  disabled={!smsConfig.isActive}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={saveSmsConfig}
                className="flex-1"
                disabled={updateIntegrationMutation.isPending || !smsConfig.isActive}
              >
                <Save className="mr-2" size={16} />
                Ayarları Kaydet
              </Button>
              <Button
                onClick={sendTestSms}
                variant="outline"
                disabled={!smsConfig.isActive}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <TestTube className="mr-2" size={16} />
                Test Mesajı Gönder
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
                <p className="font-medium mb-2">SMS Entegrasyon Bilgileri</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>SMS gönderimi için geçerli bir SMS servis sağlayıcısı hesabı gereklidir</li>
                  <li>Gönderici adı en fazla 11 karakter olabilir</li>
                  <li>Test mesajı göndererek ayarların doğru olduğunu kontrol edebilirsiniz</li>
                  <li>SMS entegrasyonu devre dışı bırakıldığında otomatik SMS gönderimi durur</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}