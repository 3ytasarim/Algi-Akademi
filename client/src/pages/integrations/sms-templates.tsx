import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Link } from "wouter";
import { 
  MessageSquare, 
  Save,
  ArrowLeft,
  Info,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface SmsTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'welcome' | 'password_reset' | 'notification' | 'custom';
}

export default function SmsTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [templates, setTemplates] = useState<SmsTemplate[]>([
    {
      id: '1',
      name: 'Kursiyer Hoşgeldin SMS',
      subject: 'Algı Akademi Üyelik',
      content: 'Merhaba {isim}, Algı Akademi\'ye hoş geldiniz! Giriş bilgileriniz - TC: {tc}, Şifre: {sifre} - Link: {link}',
      variables: ['isim', 'tc', 'sifre', 'link'],
      type: 'welcome'
    },
    {
      id: '2', 
      name: 'Şifre Sıfırlama SMS',
      subject: 'Şifre Sıfırlama',
      content: 'Merhaba {isim}, şifre sıfırlama kodunuz: {kod}. Bu kod 10 dakika geçerlidir.',
      variables: ['isim', 'kod'],
      type: 'password_reset'
    },
    {
      id: '3',
      name: 'Kurs Başlangıç Bildirimi',
      subject: 'Kurs Başlangıcı',
      content: '{isim}, {kurs_adi} kursunuz {tarih} tarihinde başlayacaktır. Hazır olun!',
      variables: ['isim', 'kurs_adi', 'tarih'],
      type: 'notification'
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'custom' as SmsTemplate['type']
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (template: SmsTemplate) => {
      return await apiRequest('/api/sms-templates', "POST", template);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "SMS şablonu güncellendi",
      });
      setEditingTemplate(null);
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/sms-templates"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "SMS şablonu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveTemplate = () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Hata",
        description: "Şablon adı ve içeriği zorunludur",
        variant: "destructive",
      });
      return;
    }

    // Extract variables from content (words between {})
    const variables: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(formData.content)) !== null) {
      variables.push(match[1]);
    }

    const template: SmsTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      variables: variables,
      type: formData.type
    };

    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      // Add new template
      setTemplates(prev => [...prev, template]);
    }

    updateTemplateMutation.mutate(template);
  };

  const startEditing = (template: SmsTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type
    });
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: 'custom'
    });
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Başarılı",
      description: "SMS şablonu silindi",
    });
  };

  const getTemplateTypeLabel = (type: SmsTemplate['type']) => {
    switch (type) {
      case 'welcome': return 'Hoşgeldin';
      case 'password_reset': return 'Şifre Sıfırlama';
      case 'notification': return 'Bildirim';
      case 'custom': return 'Özel';
      default: return 'Diğer';
    }
  };

  return (
    <LayoutWrapper title="SMS Şablonları" subtitle="Otomatik SMS içeriklerini yönetin" activeHref="/integrations">
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/integrations/sms" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SMS Şablonları</h1>
              <p className="text-gray-600 dark:text-gray-300">Otomatik gönderilecek SMS içeriklerini düzenleyin</p>
            </div>
          </div>
          <Button onClick={startCreating} className="flex items-center gap-2">
            <Plus size={16} />
            Yeni Şablon
          </Button>
        </div>

        {/* Template Form */}
        {(editingTemplate || isCreating) && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="p-6">
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {editingTemplate ? 'Şablon Düzenle' : 'Yeni Şablon Oluştur'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName" className="dark:text-gray-200">Şablon Adı</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Örn: Kursiyer Hoşgeldin SMS"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateSubject" className="dark:text-gray-200">SMS Başlığı</Label>
                  <Input
                    id="templateSubject"
                    value={formData.subject}
                    onChange={(e) => handleFormChange('subject', e.target.value)}
                    placeholder="Örn: Algı Akademi Üyelik"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateContent" className="dark:text-gray-200">SMS İçeriği</Label>
                <Textarea
                  id="templateContent"
                  value={formData.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  placeholder="Merhaba {isim}, Algı Akademi'ye hoş geldiniz! TC: {tc}, Şifre: {sifre}"
                  rows={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Değişkenler için süslü parantez kullanın: {"{isim}"}, {"{tc}"}, {"{sifre}"}, {"{link}"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveTemplate} disabled={updateTemplateMutation.isPending}>
                  <Save className="mr-2" size={16} />
                  {editingTemplate ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button onClick={cancelEditing} variant="outline">
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="text-blue-600 dark:text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {getTemplateTypeLabel(template.type)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      <strong>Başlık:</strong> {template.subject}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {template.content}
                      </p>
                    </div>
                    
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Değişkenler:</span>
                        {template.variables.map((variable) => (
                          <span 
                            key={variable}
                            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                          >
                            {"{" + variable + "}"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      onClick={() => startEditing(template)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      onClick={() => deleteTemplate(template.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
              <div className="text-sm text-gray-800 dark:text-gray-200">
                <p className="font-medium mb-2">SMS Şablonu Kullanım Bilgileri</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Değişkenler süslü parantez içinde yazılır: {"{isim}"}, {"{tc}"}, {"{sifre}"}</li>
                  <li>Kursiyer tanımlama sırasında "Hoşgeldin" tipindeki şablon otomatik gönderilir</li>
                  <li>SMS uzunluğu Türkçe karakter kullanımına göre değişir (70/160 karakter)</li>
                  <li>Şablonlar NetGSM ayarları aktif olduğunda çalışır</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}