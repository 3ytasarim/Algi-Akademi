import { useState } from "react";
import { useLocation } from "wouter";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Save, CheckCircle2 } from "lucide-react";
import type { Course } from "@shared/schema";

interface ExamQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  orderIndex: number;
}

export default function NewExam() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [maxScore, setMaxScore] = useState("100");
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      orderIndex: 1,
    },
  ]);

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return await apiRequest("/api/exams", "POST", examData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Sınav başarıyla oluşturuldu!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      navigate("/exams");
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Sınav oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        orderIndex: questions.length + 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      // Update order indices
      const updatedQuestions = newQuestions.map((q, i) => ({
        ...q,
        orderIndex: i + 1,
      }));
      setQuestions(updatedQuestions);
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof ExamQuestion,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    // Validation
    if (!examTitle.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen sınav adını giriniz",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourseId) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir kurs seçiniz",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast({
          title: "Uyarı",
          description: `${i + 1}. sorunun metnini giriniz`,
          variant: "destructive",
        });
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        toast({
          title: "Uyarı",
          description: `${i + 1}. sorunun tüm şıklarını doldurunuz`,
          variant: "destructive",
        });
        return;
      }
    }

    // Create exam
    createExamMutation.mutate({
      title: examTitle,
      description: examDescription,
      courseId: selectedCourseId,
      maxScore: parseInt(maxScore),
      questions: questions,
    });
  };

  return (
    <LayoutWrapper title="Sınav Ekle" subtitle="Yeni sınav oluştur ve sorular ekle" activeHref="/exams/new">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Exam Info Card */}
        <Card className="glass-effect border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-800/50 shadow-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
              <FileText className="mr-3 text-primary" size={28} />
              Sınav Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="examTitle" className="text-gray-700 dark:text-gray-300 font-semibold">
                  Sınav Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="examTitle"
                  data-testid="input-exam-title"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Örn: Temel Bilgiler Sınavı"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseSelect" className="text-gray-700 dark:text-gray-300 font-semibold">
                  Kurs <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger data-testid="select-course" className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Kurs seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <SelectItem value="loading">Yükleniyor...</SelectItem>
                    ) : courses.length === 0 ? (
                      <SelectItem value="empty">Henüz kurs yok</SelectItem>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxScore" className="text-gray-700 dark:text-gray-300 font-semibold">
                  Maksimum Puan
                </Label>
                <Input
                  id="maxScore"
                  data-testid="input-max-score"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="100"
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDescription" className="text-gray-700 dark:text-gray-300 font-semibold">
                Açıklama (Opsiyonel)
              </Label>
              <Textarea
                id="examDescription"
                data-testid="textarea-exam-description"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="Sınav hakkında kısa bir açıklama yazınız..."
                rows={3}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
              <CheckCircle2 className="mr-3 text-green-600" size={28} />
              Sorular ({questions.length})
            </h2>
            <Button
              onClick={addQuestion}
              data-testid="button-add-question"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Soru Ekle
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card
              key={index}
              className="glass-effect border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-900/60 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Soru {index + 1}
                  </CardTitle>
                  {questions.length > 1 && (
                    <Button
                      onClick={() => removeQuestion(index)}
                      variant="destructive"
                      size="sm"
                      data-testid={`button-remove-question-${index}`}
                      className="hover:scale-105 transition-transform"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Sil
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                    Soru Metni <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(index, "questionText", e.target.value)
                    }
                    data-testid={`textarea-question-${index}`}
                    placeholder="Sorunuzu buraya yazınız..."
                    rows={2}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 font-medium"
                  />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((option) => (
                    <div key={option} className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold mr-2 shadow-md">
                          {option}
                        </span>
                        Şık {option} <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        value={question[`option${option}` as keyof ExamQuestion] as string}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            `option${option}` as keyof ExamQuestion,
                            e.target.value
                          )
                        }
                        data-testid={`input-option-${option}-${index}`}
                        placeholder={`${option} şıkkını yazınız`}
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                    Doğru Cevap <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={question.correctAnswer}
                    onValueChange={(value) =>
                      updateQuestion(index, "correctAnswer", value)
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {["A", "B", "C", "D"].map((option) => (
                      <div
                        key={option}
                        className="flex items-center space-x-2 bg-white dark:bg-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`correct-${index}-${option}`}
                          data-testid={`radio-correct-${option}-${index}`}
                          className="text-green-600"
                        />
                        <Label
                          htmlFor={`correct-${index}-${option}`}
                          className="text-gray-900 dark:text-white font-semibold cursor-pointer select-none flex items-center"
                        >
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-sm mr-2">
                            {option}
                          </span>
                          {option} Şıkkı
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSubmit}
            disabled={createExamMutation.isPending}
            data-testid="button-submit-exam"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            {createExamMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={24} className="mr-3" />
                Sınavı Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
