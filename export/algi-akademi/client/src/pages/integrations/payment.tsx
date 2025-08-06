import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  CreditCard, Settings, Shield, Globe, Key, 
  CheckCircle, XCircle, DollarSign, Lock,
  Building, Phone, Mail, MapPin
} from "lucide-react";

export default function PaymentIntegrationPage() {
  const [paymentSettings, setPaymentSettings] = useState({
    // PayTR ayarları
    paytrMerchantId: "",
    paytrMerchantKey: "",
    paytrMerchantSalt: "",
    paytrIsActive: false,
    
    // Iyzico ayarları
    iyzicoApiKey: "",
    iyzicoSecretKey: "",
    iyzicoBaseUrl: "https://sandbox-api.iyzipay.com", // sandbox veya api
    iyzicoIsActive: false,
    
    // Genel ayarlar
    currency: "TRY",
    testMode: true,
    autoCapture: true,
    webhookUrl: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/integrations/payment"],
  });

  // Update payment settings mutation
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/integrations/payment`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/payment"] });
      toast({
        title: "Başarılı",
        description: "Ödeme ayarları başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Ödeme ayarları güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettingsMutation.mutate(paymentSettings);
  };

  return (
    <LayoutWrapper title="Ödeme Sistemi Entegrasyonu" subtitle="PayTR ve Iyzico ödeme servis ayarlarını yönetin" activeHref="/integrations/payment">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-end">
        </div>

        {/* Payment Provider Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PT</span>
                </div>
                PayTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Durum</span>
                  <Badge className={settings?.paytrIsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {settings?.paytrIsActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mod</span>
                  <Badge variant="outline">
                    {settings?.testMode ? 'Test' : 'Canlı'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Türkiye'nin lider ödeme kuruluşu
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IY</span>
                </div>
                Iyzico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Durum</span>
                  <Badge className={settings?.iyzicoIsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {settings?.iyzicoIsActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mod</span>
                  <Badge variant="outline">
                    {settings?.testMode ? 'Sandbox' : 'Production'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Gelişmiş ödeme çözümleri
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Settings */}
        <Tabs defaultValue="paytr" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paytr">PayTR</TabsTrigger>
            <TabsTrigger value="iyzico">Iyzico</TabsTrigger>
            <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paytr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  PayTR API Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Merchant ID *</Label>
                    <Input
                      value={paymentSettings.paytrMerchantId}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paytrMerchantId: e.target.value }))}
                      placeholder="PayTR Merchant ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Merchant Key *</Label>
                    <Input
                      type="password"
                      value={paymentSettings.paytrMerchantKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paytrMerchantKey: e.target.value }))}
                      placeholder="PayTR Merchant Key"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Merchant Salt *</Label>
                    <Input
                      type="password"
                      value={paymentSettings.paytrMerchantSalt}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paytrMerchantSalt: e.target.value }))}
                      placeholder="PayTR Merchant Salt"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label>PayTR Entegrasyonunu Aktifleştir</Label>
                      <p className="text-sm text-gray-500">PayTR üzerinden ödeme alımı yapılsın</p>
                    </div>
                    <Switch 
                      checked={paymentSettings.paytrIsActive}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paytrIsActive: checked }))}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Güvenlik Uyarısı</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          API anahtarlarınızı güvenli tutun. Bu bilgiler ödeme işlemleriniz için kritik öneme sahiptir.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updatePaymentSettingsMutation.isPending}
                  >
                    PayTR Ayarlarını Kaydet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iyzico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Iyzico API Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-2">
                    <Label>API Key *</Label>
                    <Input
                      value={paymentSettings.iyzicoApiKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, iyzicoApiKey: e.target.value }))}
                      placeholder="Iyzico API Key"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Secret Key *</Label>
                    <Input
                      type="password"
                      value={paymentSettings.iyzicoSecretKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, iyzicoSecretKey: e.target.value }))}
                      placeholder="Iyzico Secret Key"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Select 
                      value={paymentSettings.iyzicoBaseUrl}
                      onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, iyzicoBaseUrl: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="https://sandbox-api.iyzipay.com">Sandbox (Test)</SelectItem>
                        <SelectItem value="https://api.iyzipay.com">Production (Canlı)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <Label>Iyzico Entegrasyonunu Aktifleştir</Label>
                      <p className="text-sm text-gray-500">Iyzico üzerinden ödeme alımı yapılsın</p>
                    </div>
                    <Switch 
                      checked={paymentSettings.iyzicoIsActive}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, iyzicoIsActive: checked }))}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Webhook URL</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Iyzico panelinde webhook URL olarak şu adresi ekleyin:
                        </p>
                        <code className="block mt-2 p-2 bg-white rounded text-sm">
                          https://yourdomain.com/api/webhooks/iyzico
                        </code>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updatePaymentSettingsMutation.isPending}
                  >
                    Iyzico Ayarlarını Kaydet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Genel Ödeme Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Para Birimi</Label>
                      <Select 
                        value={paymentSettings.currency}
                        onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">Türk Lirası (TRY)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={paymentSettings.webhookUrl}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://yourdomain.com/api/webhooks"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Test Modu</Label>
                        <p className="text-sm text-gray-500">Gerçek para transferi yapılmaz</p>
                      </div>
                      <Switch 
                        checked={paymentSettings.testMode}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, testMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Otomatik Tahsilat</Label>
                        <p className="text-sm text-gray-500">Ödeme onayı sonrası otomatik tahsil edilsin</p>
                      </div>
                      <Switch 
                        checked={paymentSettings.autoCapture}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, autoCapture: checked }))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updatePaymentSettingsMutation.isPending}
                  >
                    Genel Ayarları Kaydet
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Supported Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Desteklenen Ödeme Yöntemleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Kredi Kartı</p>
                <p className="text-xs text-gray-500">Visa, MasterCard</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Banka Kartı</p>
                <p className="text-xs text-gray-500">Debit Card</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Phone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Mobil Ödeme</p>
                <p className="text-xs text-gray-500">Hızlı ve güvenli</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">Havale/EFT</p>
                <p className="text-xs text-gray-500">Banka transferi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Ödeme İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₺45,230</div>
                <div className="text-sm text-gray-500">Bu Ay Toplam</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-sm text-gray-500">Başarılı İşlem</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-gray-500">Başarısız İşlem</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">%97.7</div>
                <div className="text-sm text-gray-500">Başarı Oranı</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}