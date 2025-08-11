import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Download
} from "lucide-react";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function Consultants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<any>(null);
  const [formData, setFormData] = useState({
    tcNo: "",
    firstName: "",
    lastName: "",
    title: "Danışman",
    email: "",
    phone: ""
  });

  // Fetch consultants
  const { data: consultants, isLoading } = useQuery({
    queryKey: ["/api/consultants"],
    retry: false,
  });

  // Use real consultant data
  const displayConsultants = consultants || [];

  const createConsultantMutation = useMutation({
    mutationFn: async (data: any) => {
      // Map frontend fields to backend schema
      const backendData = {
        tc_no: data.tcNo,
        first_name: data.firstName,
        last_name: data.lastName,
        title: data.title,
        email: data.email,
        phone: data.phone
      };
      return await apiRequest('/api/consultants', 'POST', backendData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Yeni personel başarıyla eklendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateConsultantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      // Map frontend fields to backend schema
      const backendData = {
        tc_no: data.tcNo,
        first_name: data.firstName,
        last_name: data.lastName,
        title: data.title,
        email: data.email,
        phone: data.phone
      };
      return await apiRequest(`/api/consultants/${id}`, 'PUT', backendData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
      setIsEditDialogOpen(false);
      setEditingConsultant(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const deleteConsultantMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/consultants/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Personel silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      tcNo: "",
      firstName: "",
      lastName: "",
      title: "Danışman",
      email: "",
      phone: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.tcNo) {
      toast({
        title: "Eksik Bilgi",
        description: "T.C. No, ad ve soyad alanları zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (editingConsultant) {
      updateConsultantMutation.mutate({ id: editingConsultant.id, data: formData });
    } else {
      createConsultantMutation.mutate(formData);
    }
  };

  const handleEdit = (consultant: any) => {
    setEditingConsultant(consultant);
    setFormData({
      tcNo: consultant.tcNo || consultant.tc_no || "",
      firstName: consultant.firstName || consultant.first_name || "",
      lastName: consultant.lastName || consultant.last_name || "",
      title: consultant.title || "Danışman",
      email: consultant.email || "",
      phone: consultant.phone || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number | string, name: string) => {
    if (window.confirm(`${name} adlı personeli silmek istediğinizden emin misiniz?`)) {
      deleteConsultantMutation.mutate(String(id));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredConsultants = displayConsultants.filter((consultant: any) =>
    (consultant.firstName || consultant.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consultant.lastName || consultant.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (consultant.tcNo || consultant.tc_no || '').includes(searchTerm)
  );

  return (
    <LayoutWrapper>
      <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danışmanlar</h1>
          <p className="text-gray-600 dark:text-gray-300">Personel yönetimi ve kayıtları</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <UserPlus className="mr-2" size={16} />
              Yeni Personel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Personel Kaydı</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tcNo">T.C. Kimlik No *</Label>
                <Input
                  id="tcNo"
                  type="text"
                  placeholder="T.C. Kimlik No"
                  value={formData.tcNo}
                  onChange={(e) => handleInputChange('tcNo', e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="firstName">Adı *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Adı"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Soyadı *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Soyadı"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="title">Ünvanı</Label>
                <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ünvan Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Danışman">Danışman</SelectItem>
                    <SelectItem value="Uzman">Uzman</SelectItem>
                    <SelectItem value="Koordinatör">Koordinatör</SelectItem>
                    <SelectItem value="Müdür">Müdür</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-posta adresi"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Telefon numarası"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                İlk şifre <strong>112233</strong> olarak tanımlanacaktır.
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={createConsultantMutation.isPending}
                >
                  {createConsultantMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Personel Düzenle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="editTcNo">T.C. Kimlik No *</Label>
                <Input
                  id="editTcNo"
                  type="text"
                  placeholder="T.C. Kimlik No"
                  value={formData.tcNo}
                  onChange={(e) => handleInputChange('tcNo', e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="editFirstName">Ad *</Label>
                <Input
                  id="editFirstName"
                  type="text"
                  placeholder="Adı"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="editLastName">Soyad *</Label>
                <Input
                  id="editLastName"
                  type="text"
                  placeholder="Soyadı"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="editTitle">Ünvan</Label>
                <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ünvan seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Danışman">Danışman</SelectItem>
                    <SelectItem value="Uzman">Uzman</SelectItem>
                    <SelectItem value="Koordinatör">Koordinatör</SelectItem>
                    <SelectItem value="Müdür">Müdür</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editEmail">E-posta</Label>
                <Input
                  id="editEmail"
                  type="email"
                  placeholder="E-posta adresi"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="editPhone">Telefon</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  placeholder="Telefon numarası"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingConsultant(null);
                    resetForm();
                  }}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={updateConsultantMutation.isPending}
                >
                  {updateConsultantMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Excel İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Table */}
      <Card>
        <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="text-primary" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personel Listesi</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Toplam {filteredConsultants.length} personel
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    T.C. Kimlik No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Adı Soyadı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ünvan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Yükleniyor...</div>
                    </td>
                  </tr>
                ) : filteredConsultants.length > 0 ? (
                  filteredConsultants.map((consultant) => (
                    <tr key={consultant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {consultant.tcNo || consultant.tc_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {consultant.firstName || consultant.first_name} {consultant.lastName || consultant.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {consultant.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        <div>{consultant.email}</div>
                        <div className="text-gray-500 dark:text-gray-400">{consultant.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-secondary p-1">
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-gray-600 p-1"
                            onClick={() => handleEdit(consultant)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-600 p-1"
                            onClick={() => handleDelete(consultant.id, `${consultant.firstName || consultant.first_name} ${consultant.lastName || consultant.last_name}`)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Users size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p>Henüz personel kaydı bulunmuyor</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </LayoutWrapper>
  );
}