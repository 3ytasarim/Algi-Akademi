import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import type { SmsTemplate } from "@shared/schema";

interface SendSmsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export default function SendSmsDialog({ isOpen, onClose, student }: SendSmsDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch SMS templates
  const { data: templates = [] } = useQuery<SmsTemplate[]>({
    queryKey: ["/api/sms-templates"],
    enabled: isOpen,
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Update message when template or variables change
  useEffect(() => {
    if (selectedTemplate) {
      let content = selectedTemplate.content;
      
      // Auto-fill student variables
      const autoVars: Record<string, string> = {
        isim: student?.firstName || student?.adı || '',
        tc: student?.tcKimlikNo || '',
        sifre: student?.password || '',
        link: 'https://algi-akademi.replit.app',
      };
      
      // Merge with manual variables
      const allVars = { ...autoVars, ...variables };
      
      // Replace variables in content
      Object.entries(allVars).forEach(([key, value]) => {
        // Escape special regex characters in the key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Only replace if value is not empty
        if (value) {
          content = content.replace(new RegExp(`\\{${escapedKey}\\}`, 'g'), value);
        }
      });
      
      setMessage(content);
    }
  }, [selectedTemplate, variables, student]);

  // Send SMS mutation
  const sendSmsMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; message: string }) => {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let errorMessage = 'SMS gönderilemedi';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          // JSON parse error - use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "SMS başarıyla gönderildi.",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "SMS gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!student?.telefon) {
      toast({
        title: "Hata",
        description: "Öğrencinin telefon numarası bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir mesaj yazın.",
        variant: "destructive",
      });
      return;
    }

    sendSmsMutation.mutate({
      phoneNumber: student.telefon,
      message: message,
    });
  };

  const handleClose = () => {
    setSelectedTemplateId("");
    setMessage("");
    setVariables({});
    onClose();
  };

  // Get variables that need manual input (not auto-filled)
  const manualVariables = selectedTemplate?.variables?.filter((v: string) => 
    !['isim', 'tc', 'sifre', 'link'].includes(v)
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            SMS Gönder - {student?.firstName || student?.adı} {student?.lastName || student?.soyadı}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label>Telefon Numarası</Label>
            <Input 
              value={student?.telefon || ''} 
              disabled 
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Şablon Seç</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="SMS şablonu seçin..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template: any) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Variables */}
          {manualVariables.length > 0 && (
            <div className="space-y-2">
              <Label>Değişkenler</Label>
              {manualVariables.map((variable: string) => (
                <div key={variable} className="flex items-center gap-2">
                  <Label className="w-24 text-sm capitalize">{variable}:</Label>
                  <Input
                    placeholder={`{${variable}} değerini girin`}
                    value={variables[variable] || ''}
                    onChange={(e) => setVariables({ ...variables, [variable]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Message Preview */}
          <div className="space-y-2">
            <Label>Mesaj Önizleme</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="Şablon seçin veya mesajınızı buraya yazın..."
            />
            <p className="text-xs text-gray-500">
              Karakter sayısı: {message.length} / 160 ({Math.ceil(message.length / 160)} SMS)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={sendSmsMutation.isPending}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || sendSmsMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {sendSmsMutation.isPending ? (
              <>Gönderiliyor...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                SMS Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
