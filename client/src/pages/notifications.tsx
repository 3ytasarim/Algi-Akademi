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
  Bell, Plus, Send, Eye, Edit, Trash2, Mail, MessageSquare,
  CheckCircle, XCircle, Clock, AlertCircle, Users, Target,
  Calendar, Filter, Download, Settings
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function NotificationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "email",
    targetAudience: "all",
    scheduleType: "immediate",
    scheduleDate: "",
    scheduleTime: "",
    recipients: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Fetch notification templates
  const { data: templates } = useQuery({
    queryKey: ["/api/notification-templates"],
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
      resetForm();
      toast({
        title: "Başarılı",
        description: "Bildirim başarıyla oluşturuldu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Bildirim oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNotificationForm({
      title: "",
      message: "",
      type: "email",
      targetAudience: "all",
      scheduleType: "immediate",
      scheduleDate: "",
      scheduleTime: "",
      recipients: "",
    });
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    let scheduledAt = null;
    if (notificationForm.scheduleType === "scheduled" && notificationForm.scheduleDate && notificationForm.scheduleTime) {
      scheduledAt = new Date(`${notificationForm.scheduleDate}T${notificationForm.scheduleTime}`);
    }

    const notificationData = {
      ...notificationForm,
      scheduledAt,
      status: notificationForm.scheduleType === "immediate" ? "sent" : "scheduled",
    };
    
    createNotificationMutation.mutate(notificationData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Gönderildi</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Zamanlandı</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Başarısız</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Taslak</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Bilinmeyen</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'email':
        return <Badge variant="outline" className="text-blue-600"><Mail size={12} className="mr-1" />E-posta</Badge>;
      case 'sms':
        return <Badge variant="outline" className="text-green-600"><MessageSquare size={12} className="mr-1" />SMS</Badge>;
      case 'both':
        return <Badge variant="outline" className="text-purple-600">E-posta + SMS</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const filteredNotifications = notifications?.filter((notification: any) => {
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <LayoutWrapper title="Bildirim Yönetimi" subtitle="E-posta ve SMS bildirimleri yönetin" activeHref="/notifications">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Yeni Bildirim
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNotification} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Başlık *</Label>
                      <Input
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Bildirim başlığı"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bildirim Türü *</Label>
                      <Select 
                        value={notificationForm.type}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Sadece E-posta</SelectItem>
                          <SelectItem value="sms">Sadece SMS</SelectItem>
                          <SelectItem value="both">E-posta + SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mesaj *</Label>
                    <Textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Bildirim mesajı"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      SMS için max 160 karakter önerilir. Şu an: {notificationForm.message.length} karakter
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hedef Kitle</Label>
                      <Select 
                        value={notificationForm.targetAudience}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                          <SelectItem value="students">Sadece Öğrenciler</SelectItem>
                          <SelectItem value="instructors">Sadece Eğitmenler</SelectItem>
                          <SelectItem value="custom">Belirli Kişiler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gönderim Zamanı</Label>
                      <Select 
                        value={notificationForm.scheduleType}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, scheduleType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Hemen Gönder</SelectItem>
                          <SelectItem value="scheduled">Zamanla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {notificationForm.scheduleType === "scheduled" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tarih</Label>
                        <Input
                          type="date"
                          value={notificationForm.scheduleDate}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          required={notificationForm.scheduleType === "scheduled"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Saat</Label>
                        <Input
                          type="time"
                          value={notificationForm.scheduleTime}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                          required={notificationForm.scheduleType === "scheduled"}
                        />
                      </div>
                    </div>
                  )}

                  {notificationForm.targetAudience === "custom" && (
                    <div className="space-y-2">
                      <Label>Alıcılar</Label>
                      <Textarea
                        value={notificationForm.recipients}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, recipients: e.target.value }))}
                        placeholder="E-posta adreslerini veya telefon numaralarını virgülle ayırarak girin"
                        rows={3}
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createNotificationMutation.isPending}
                  >
                    {createNotificationMutation.isPending ? "Oluşturuluyor..." : 
                     notificationForm.scheduleType === "immediate" ? "Hemen Gönder" : "Zamanla"}
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
                  <p className="text-sm font-medium text-gray-500">Zamanlanmış</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {notifications?.filter((n: any) => n.status === 'scheduled').length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
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

        {/* Filters and Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bildirim Geçmişi</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    placeholder="Bildirim ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="email">E-posta</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="sent">Gönderildi</SelectItem>
                    <SelectItem value="scheduled">Zamanlandı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
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
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Hedef</TableHead>
                  <TableHead>Gönderim Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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
                        <Badge variant="outline">
                          {notification.targetAudience === 'all' ? 'Tümü' :
                           notification.targetAudience === 'students' ? 'Öğrenciler' :
                           notification.targetAudience === 'instructors' ? 'Eğitmenler' : 'Özel'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.sentAt ? 
                          format(new Date(notification.sentAt), "dd MMM yyyy HH:mm", { locale: tr }) :
                          notification.scheduledAt ?
                          format(new Date(notification.scheduledAt), "dd MMM yyyy HH:mm", { locale: tr }) :
                          '-'
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
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

        {/* Notification Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Bildirim Şablonları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Kurs Kayıt Onayı</h3>
                <p className="text-sm text-gray-500 mb-3">Öğrenci kurs kaydı tamamlandığında</p>
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
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Ödeme Hatırlatması</h3>
                <p className="text-sm text-gray-500 mb-3">Vadesi yaklaşan ödemeler için</p>
                <Button size="sm" variant="outline">
                  <Edit size={14} className="mr-2" />
                  Düzenle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}