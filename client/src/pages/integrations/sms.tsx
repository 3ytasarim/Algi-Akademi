import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  MessageSquare, Settings, Plus, Send, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Clock, AlertCircle, Key, 
  Smartphone, Globe, Shield, Test, Phone
} from "lucide-react";

export default function SMSIntegrationPage() {
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Bu bir test mesajıdır - Algı Akademi");
  
  const [smsSettings, setSmsSettings] = useState({
    username: "",
    password: "",
    header: "ALGIACADEMY",
    isActive: true,
    language: "TR",
    encoding: "UTF-8",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMS settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/integrations/sms"],
  });

  // Update SMS settings mutation
  const updateSMSSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/integrations/sms`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/sms"] });
      toast({
        title: "Başarılı",
        description: "NetGSM SMS ayarları başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "SMS ayarları güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Test SMS mutation
  const testSMSMutation = useMutation({
    mutationFn: async (data: { phone: string; message: string }) => {
      await apiRequest(`/api/integrations/sms/test`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsTestDialogOpen(false);
      setTestPhone("");
      toast({
        title: "Test SMS Gönderildi",
        description: "Test SMS'i başarıyla gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Başarısız",
        description: "Test SMS'i gönderilemedi. Ayarları kontrol edin.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSMSSettingsMutation.mutate(smsSettings);
  };

  const handleTestSMS = (e: React.FormEvent) => {
    e.preventDefault();
    testSMSMutation.mutate({ phone: testPhone, message: testMessage });
  };

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NetGSM SMS Entegrasyonu</h1>
            <p className="text-gray-500 mt-2">NetGSM SMS servis ayarlarını yönetin</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Send size={16} />
                  Test SMS
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test SMS Gönder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTestSMS} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Telefon Numarası</Label>
                    <Input
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="905xxxxxxxxx"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Ülke kodu ile birlikte girin (örn: 905551234567)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mesaj</Label>
                    <Textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Test mesajı"
                      rows={3}
                      maxLength={160}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {testMessage.length}/160 karakter
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={testSMSMutation.isPending}
                  >
                    {testSMSMutation.isPending ? "Gönderiliyor..." : "Test SMS Gönder"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              onClick={() => window.open("https://www.netgsm.com.tr", "_blank")}
              className="flex items-center gap-2"
            >
              <Globe size={16} />
              NetGSM Hesabı
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bağlantı Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">
                    {settings?.isActive ? 'NetGSM Bağlantı Aktif' : 'NetGSM Bağlantı Pasif'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Header: {settings?.header || 'Belirlenmemiş'}
                  </p>
                </div>
              </div>
              <Badge className={settings?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {settings?.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* SMS Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              SMS Bakiyesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1,250</div>
                <div className="text-sm text-gray-500">Kalan SMS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">340</div>
                <div className="text-sm text-gray-500">Bu Ay Gönderilen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₺127.50</div>
                <div className="text-sm text-gray-500">Bu Ay Harcanan</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NetGSM Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              NetGSM API Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kullanıcı Adı *</Label>
                  <Input
                    value={smsSettings.username}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="NetGSM kullanıcı adınız"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Şifre *</Label>
                  <Input
                    type="password"
                    value={smsSettings.password}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="NetGSM şifreniz"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMS Başlığı (Header)</Label>
                  <Input
                    value={smsSettings.header}
                    onChange={(e) => setSmsSettings(prev => ({ ...prev, header: e.target.value }))}
                    placeholder="ALGIACADEMY"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500">
                    SMS'lerin kimden geldiğini gösteren başlık (max 11 karakter)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Dil Kodu</Label>
                  <Select 
                    value={smsSettings.language}
                    onValueChange={(value) => setSmsSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TR">Türkçe (TR)</SelectItem>
                      <SelectItem value="EN">English (EN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Karakter Kodlaması</Label>
                <Select 
                  value={smsSettings.encoding}
                  onValueChange={(value) => setSmsSettings(prev => ({ ...prev, encoding: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF-8">UTF-8 (Türkçe karakter desteği)</SelectItem>
                    <SelectItem value="ASCII">ASCII (Sadece İngilizce)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>SMS Entegrasyonunu Aktifleştir</Label>
                  <p className="text-sm text-gray-500">NetGSM üzerinden SMS gönderimi yapılsın</p>
                </div>
                <Switch 
                  checked={smsSettings.isActive}
                  onCheckedChange={(checked) => setSmsSettings(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={updateSMSSettingsMutation.isPending}
              >
                {updateSMSSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* SMS Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Şablonları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Kurs Kayıt Onayı</h3>
                <p className="text-sm text-gray-500 mb-3">
                  "Sayın {{ogrenci_adi}}, {{kurs_adi}} kursuna kaydınız tamamlanmıştır. İyi öğrenmeler! - Algı Akademi"
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-2" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send size={14} className="mr-2" />
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Sınav Hatırlatması</h3>
                <p className="text-sm text-gray-500 mb-3">
                  "{{ogrenci_adi}}, {{sinav_adi}} sınavınız {{tarih}} tarihinde saat {{saat}}'de başlayacak. Başarılar! - Algı Akademi"
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-2" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send size={14} className="mr-2" />
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Ödeme Hatırlatması</h3>
                <p className="text-sm text-gray-500 mb-3">
                  "{{ogrenci_adi}}, {{kurs_adi}} kursu için {{tutar}} TL ödemeniz {{tarih}} tarihinde vadesi dolacak. - Algı Akademi"
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-2" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send size={14} className="mr-2" />
                    Test
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Genel Duyuru</h3>
                <p className="text-sm text-gray-500 mb-3">
                  "{{ogrenci_adi}}, {{duyuru_metni}} Detaylar için web sitemizi ziyaret edin. - Algı Akademi"
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-2" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send size={14} className="mr-2" />
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent SMS Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Gönderilen SMS'ler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alıcı</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Gönderim Tarihi</TableHead>
                  <TableHead>Maliyet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-gray-500">Henüz SMS gönderilmedi</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}