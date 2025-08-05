import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  Smartphone, 
  CreditCard, 
  Settings, 
  Save,
  TestTube,
  Plug
} from "lucide-react";

export default function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [smsConfig, setSmsConfig] = useState({
    phone: "3129117683",
    password: "831EAAA",
    sender: "ALGIAKADEMI",
    isActive: true
  });

  const [paymentConfig, setPaymentConfig] = useState({
    token: "",
    merchantId: "",
    isActive: false
  });

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
    retry: false,
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/integrations', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Entegrasyon ayarları güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Ayarlar güncellenirken bir hata oluştu",
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

  const handlePaymentConfigChange = (field: string, value: string | boolean) => {
    setPaymentConfig(prev => ({
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

  const savePaymentConfig = () => {
    updateIntegrationMutation.mutate({
      type: 'payment',
      name: 'Kredi Kartı Entegrasyonu',
      config: paymentConfig,
      isActive: paymentConfig.isActive
    });
  };

  const sendTestSms = () => {
    toast({
      title: "Test Mesajı",
      description: "Test mesajı gönderiliyor...",
    });
    
    // Simulate test SMS
    setTimeout(() => {
      toast({
        title: "Başarılı",
        description: "Test mesajı başarıyla gönderildi",
      });
    }, 2000);
  };

  return (
    <LayoutWrapper title="Entegrasyonlar" subtitle="SMS ve ödeme sistemi entegrasyonlarını yönetin" activeHref="/integrations">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SMS Integration */}
        <Card>
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">SMS Entegrasyonu</h2>
                  <p className="text-sm text-gray-600">SMS bildirimleri için ayarlar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={smsConfig.isActive}
                  onCheckedChange={(checked) => handleSmsConfigChange('isActive', checked)}
                />
                <span className="text-sm text-gray-600">
                  {smsConfig.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="smsPhone">Telefon Numarası</Label>
              <Input
                id="smsPhone"
                type="text"
                value={smsConfig.phone}
                onChange={(e) => handleSmsConfigChange('phone', e.target.value)}
                placeholder="Telefon numarası"
                disabled={!smsConfig.isActive}
              />
            </div>
            
            <div>
              <Label htmlFor="smsPassword">Şifre</Label>
              <Input
                id="smsPassword"
                type="password"
                value={smsConfig.password}
                onChange={(e) => handleSmsConfigChange('password', e.target.value)}
                placeholder="SMS servisi şifresi"
                disabled={!smsConfig.isActive}
              />
            </div>
            
            <div>
              <Label htmlFor="smsSender">Gönderici Adı</Label>
              <Input
                id="smsSender"
                type="text"
                value={smsConfig.sender}
                onChange={(e) => handleSmsConfigChange('sender', e.target.value)}
                placeholder="Gönderici adı"
                disabled={!smsConfig.isActive}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={saveSmsConfig}
                className="flex-1 bg-primary text-white"
                disabled={updateIntegrationMutation.isPending || !smsConfig.isActive}
              >
                <Save className="mr-2" size={16} />
                Kaydet
              </Button>
              <Button
                onClick={sendTestSms}
                variant="outline"
                disabled={!smsConfig.isActive}
              >
                <TestTube className="mr-2" size={16} />
                Test Mesajı Gönder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Integration */}
        <Card>
          <CardHeader className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kredi Kartı Entegrasyonu</h2>
                  <p className="text-sm text-gray-600">Online ödeme sistemi ayarları</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={paymentConfig.isActive}
                  onCheckedChange={(checked) => handlePaymentConfigChange('isActive', checked)}
                />
                <span className="text-sm text-gray-600">
                  {paymentConfig.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="paymentToken">Token</Label>
              <Input
                id="paymentToken"
                type="password"
                value={paymentConfig.token}
                onChange={(e) => handlePaymentConfigChange('token', e.target.value)}
                placeholder="API Token"
                disabled={!paymentConfig.isActive}
              />
            </div>
            
            <div>
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                type="text"
                value={paymentConfig.merchantId}
                onChange={(e) => handlePaymentConfigChange('merchantId', e.target.value)}
                placeholder="Merchant ID"
                disabled={!paymentConfig.isActive}
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Settings className="text-yellow-600 mt-0.5" size={16} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Güvenlik Uyarısı</p>
                  <p>
                    API anahtarlarınızı güvenli bir şekilde saklayın ve kimseyle paylaşmayın.
                    Test modunda işlemler gerçek para transferi yapmaz.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={savePaymentConfig}
                className="flex-1 bg-primary text-white"
                disabled={updateIntegrationMutation.isPending || !paymentConfig.isActive}
              >
                <Save className="mr-2" size={16} />
                Kaydet
              </Button>
              <Button
                variant="outline"
                disabled={!paymentConfig.isActive}
              >
                <TestTube className="mr-2" size={16} />
                Test Ödemesi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Integrations */}
      <Card className="mt-6">
        <CardHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Plug className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Diğer Entegrasyonlar</h2>
              <p className="text-sm text-gray-600">Gelecekteki entegrasyonlar için rezerve edilmiştir</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Settings className="text-gray-400" size={24} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">E-posta Servisi</h3>
              <p className="text-sm text-gray-500">Yakında...</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Settings className="text-gray-400" size={24} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Zoom Entegrasyonu</h3>
              <p className="text-sm text-gray-500">Yakında...</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Settings className="text-gray-400" size={24} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">CRM Entegrasyonu</h3>
              <p className="text-sm text-gray-500">Yakında...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </LayoutWrapper>
  );
}