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
  Mail, MessageSquare, Bell, Plus, Send, Settings, Users, 
  Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Filter,
  Search, Download, Upload, Target, Smartphone
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    type: "email",
    title: "",
    message: "",
    recipients: "",
    templateId: "",
    scheduledFor: "",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
    variables: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Fetch notification templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/notification-templates"],
  });

  // Fetch notification settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/notification-settings"],
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/notifications`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsCreateDialogOpen(false);
      setNotificationForm({
        type: "email",
        title: "",
        message: "",
        recipients: "",
        templateId: "",
        scheduledFor: "",
      });
      toast({
        title: "Başarılı",
        description: "Bildirim başarıyla gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Bildirim gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/notification-templates`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-templates"] });
      setIsTemplateDialogOpen(false);
      setTemplateForm({
        name: "",
        type: "email",
        subject: "",
        content: "",
        variables: "",
      });
      toast({
        title: "Başarılı",
        description: "Şablon başarıyla oluşturuldu.",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/notification-settings`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla güncellendi.",
      });
    },
  });

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    createNotificationMutation.mutate(notificationForm);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const variables = templateForm.variables ? templateForm.variables.split(',').map(v => v.trim()) : [];
    createTemplateMutation.mutate({
      ...templateForm,
      variables
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Gönderildi</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Başarısız</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" /> Beklemede</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <Badge className="bg-blue-100 text-blue-800"><Mail size={12} className="mr-1" /> E-posta</Badge>;
      case 'sms':
        return <Badge className="bg-purple-100 text-purple-800"><Smartphone size={12} className="mr-1" /> SMS</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Bell size={12} className="mr-1" /> Sistem</Badge>;
    }
  };

  const filteredNotifications = notifications?.filter((notification: any) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus;
    const matchesType = filterType === "all" || notification.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bildirim Sistemi</h1>
            <p className="text-gray-500 mt-2">E-posta ve SMS bildirimlerini yönetin</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings size={16} />
                  Ayarlar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bildirim Ayarları</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">E-posta Ayarları</h3>
                      <div className="flex items-center justify-between">
                        <Label>E-posta bildirimleri</Label>
                        <Switch defaultChecked={settings?.emailEnabled} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Pazarlama e-postaları</Label>
                        <Switch defaultChecked={settings?.marketingEmails} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">SMS Ayarları</h3>
                      <div className="flex items-center justify-between">
                        <Label>SMS bildirimleri</Label>
                        <Switch defaultChecked={settings?.smsEnabled} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Sınav hatırlatmaları</Label>
                        <Switch defaultChecked={settings?.examNotifications} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Sistem Ayarları</h3>
                    <div className="flex items-center justify-between">
                      <Label>Sistem güncellemeleri</Label>
                      <Switch defaultChecked={settings?.systemUpdates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Kurs hatırlatmaları</Label>
                      <Switch defaultChecked={settings?.courseReminders} />
                    </div>
                  </div>
                  <Button 
                    onClick={() => updateSettingsMutation.mutate(settings)}
                    className="w-full"
                    disabled={updateSettingsMutation.isPending}
                  >
                    Ayarları Kaydet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus size={16} />
                  Şablon Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Bildirim Şablonu Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Şablon Adı</Label>
                      <Input
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Şablon adı"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tip</Label>
                      <Select 
                        value={templateForm.type}
                        onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">E-posta</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {templateForm.type === 'email' && (
                    <div className="space-y-2">
                      <Label>Konu</Label>
                      <Input
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="E-posta konusu"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>İçerik</Label>
                    <Textarea
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Şablon içeriği ({{değişken}} formatında değişkenler kullanabilirsiniz)"
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Değişkenler</Label>
                    <Input
                      value={templateForm.variables}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, variables: e.target.value }))}
                      placeholder="userName, courseName, examDate (virgülle ayırın)"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createTemplateMutation.isPending}
                  >
                    Şablon Oluştur
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Send size={16} />
                  Bildirim Gönder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Yeni Bildirim Gönder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNotification} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bildirim Tipi</Label>
                      <Select 
                        value={notificationForm.type}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">E-posta</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="system">Sistem Bildirimi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Şablon (Opsiyonel)</Label>
                      <Select 
                        value={notificationForm.templateId}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, templateId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Şablon seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates?.filter((t: any) => t.type === notificationForm.type).map((template: any) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Bildirim başlığı"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mesaj</Label>
                    <Textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Bildirim mesajı"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Alıcılar</Label>
                    <Input
                      value={notificationForm.recipients}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, recipients: e.target.value }))}
                      placeholder="E-posta adresleri veya telefon numaraları (virgülle ayırın)"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createNotificationMutation.isPending}
                  >
                    Bildirim Gönder
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Bildirim</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Gönderilen</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notifications?.filter((n: any) => n.status === 'sent').length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Beklemede</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {notifications?.filter((n: any) => n.status === 'pending').length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Başarısız</p>
                  <p className="text-2xl font-bold text-red-600">
                    {notifications?.filter((n: any) => n.status === 'failed').length || 0}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bildirim Geçmişi</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Bildirim ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="email">E-posta</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Gönderim Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">Bildirim bulunamadı</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications?.map((notification: any) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(notification.type)}</TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        {notification.sentAt ? 
                          format(new Date(notification.sentAt), "dd MMM yyyy HH:mm", { locale: tr }) :
                          format(new Date(notification.createdAt), "dd MMM yyyy HH:mm", { locale: tr })
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}