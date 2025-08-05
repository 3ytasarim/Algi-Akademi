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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { 
  Mail, Settings, Plus, Send, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Clock, AlertCircle, Key, 
  Server, Globe, Shield, Test
} from "lucide-react";

export default function EmailIntegrationPage() {
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  const [emailSettings, setEmailSettings] = useState({
    provider: "sendgrid",
    apiKey: "",
    fromEmail: "noreply@algiacademy.com",
    fromName: "Algı Akademi",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    useTls: true,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/integrations/email"],
  });

  // Update email settings mutation
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/integrations/email`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/email"] });
      toast({
        title: "Başarılı",
        description: "E-posta ayarları başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "E-posta ayarları güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest(`/api/integrations/email/test`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      setIsTestDialogOpen(false);
      setTestEmail("");
      toast({
        title: "Test E-postası Gönderildi",
        description: "Test e-postası başarıyla gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Başarısız",
        description: "Test e-postası gönderilemedi. Ayarları kontrol edin.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSettingsMutation.mutate(emailSettings);
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    testEmailMutation.mutate(testEmail);
  };

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-posta Entegrasyonu</h1>
            <p className="text-gray-500 mt-2">SendGrid e-posta servis ayarlarını yönetin</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Send size={16} />
                  Test E-postası
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test E-postası Gönder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTestEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-posta Adresi</Label>
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={testEmailMutation.isPending}
                  >
                    {testEmailMutation.isPending ? "Gönderiliyor..." : "Test E-postası Gönder"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                    {settings?.isActive ? 'Bağlantı Aktif' : 'Bağlantı Pasif'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {settings?.provider === 'sendgrid' ? 'SendGrid' : 'SMTP'} servisi kullanılıyor
                  </p>
                </div>
              </div>
              <Badge className={settings?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {settings?.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Tabs defaultValue="sendgrid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
            <TabsTrigger value="smtp">SMTP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sendgrid" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  SendGrid Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>API Anahtarı *</Label>
                      <Input
                        type="password"
                        value={emailSettings.apiKey}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="SG.xxxxxxxxxxxxxxxxxxxxx"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        SendGrid hesabınızdan API anahtarını alın
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Gönderen E-posta *</Label>
                      <Input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="noreply@algiacademy.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gönderen Adı</Label>
                    <Input
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      placeholder="Algı Akademi"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Entegrasyonu Aktifleştir</Label>
                      <p className="text-sm text-gray-500">E-posta gönderimi için SendGrid kullanılsın</p>
                    </div>
                    <Switch 
                      checked={emailSettings.isActive}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateEmailSettingsMutation.isPending}
                  >
                    {updateEmailSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smtp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  SMTP Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Sunucu *</Label>
                      <Input
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port *</Label>
                      <Input
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                        placeholder="587"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kullanıcı Adı *</Label>
                      <Input
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        placeholder="your-email@gmail.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Şifre *</Label>
                      <Input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gönderen E-posta *</Label>
                      <Input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="noreply@algiacademy.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gönderen Adı</Label>
                      <Input
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                        placeholder="Algı Akademi"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>TLS Kullan</Label>
                      <p className="text-sm text-gray-500">Güvenli bağlantı için TLS şifrelemesi</p>
                    </div>
                    <Switch 
                      checked={emailSettings.useTls}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, useTls: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Entegrasyonu Aktifleştir</Label>
                      <p className="text-sm text-gray-500">E-posta gönderimi için SMTP kullanılsın</p>
                    </div>
                    <Switch 
                      checked={emailSettings.isActive}
                      onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateEmailSettingsMutation.isPending}
                  >
                    {updateEmailSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-posta Şablonları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Hoş Geldiniz E-postası</h3>
                <p className="text-sm text-gray-500 mb-3">Yeni kayıt olan öğrenciler için</p>
                <Button size="sm" variant="outline">
                  <Edit size={14} className="mr-2" />
                  Düzenle
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Kurs Kayıt Onayı</h3>
                <p className="text-sm text-gray-500 mb-3">Kurs kaydı tamamlandığında</p>
                <Button size="sm" variant="outline">
                  <Edit size={14} className="mr-2" />
                  Düzenle
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Sınav Hatırlatması</h3>
                <p className="text-sm text-gray-500 mb-3">Sınav öncesi gönderilir</p>
                <Button size="sm" variant="outline">
                  <Edit size={14} className="mr-2" />
                  Düzenle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Email Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Gönderilen E-postalar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alıcı</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Gönderim Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-gray-500">Henüz e-posta gönderilmedi</div>
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