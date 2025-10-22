import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Exam, ExamQuestion } from "@shared/schema";

interface ExamWithQuestions extends Exam {
  questions: ExamQuestion[];
  courseName: string | null;
}

export default function StudentExam() {
  const { examId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Fetch exam details
  const { data: exam, isLoading } = useQuery<ExamWithQuestions>({
    queryKey: ['/api/student/exams', examId],
    enabled: !!examId,
  });

  // Initialize timer when exam starts
  useEffect(() => {
    if (started && exam && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit(true); // Auto-submit when timer expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [started, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (exam?.duration) {
      setTimeRemaining(exam.duration * 60); // Convert minutes to seconds
      setStarted(true);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: { examId: string; answers: Record<string, string> }) => {
      return apiRequest('/api/student/exam-submit', 'POST', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Sınav Tamamlandı",
        description: "Cevaplarınız kaydedildi.",
      });
      
      setTimeout(() => {
        setLocation('/student-dashboard');
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Sınav gönderilirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (isAutoSubmit = false) => {
    if (!examId) return;
    
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions.length || 0;
    
    // Only show confirmation dialog if manually submitting with unanswered questions
    if (!isAutoSubmit && answeredCount < totalQuestions) {
      const confirmed = window.confirm(
        `${totalQuestions - answeredCount} soru cevaplanmadı. Yine de göndermek istiyor musunuz?`
      );
      if (!confirmed) return;
    }

    submitMutation.mutate({ examId, answers });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sınav Bulunamadı</h2>
              <Button onClick={() => setLocation('/student-dashboard')}>
                Ana Sayfaya Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Sınav Tamamlandı!</h2>
              <p className="text-gray-600 mb-4">Cevaplarınız başarıyla kaydedildi.</p>
              <p className="text-sm text-gray-500">Ana sayfaya yönlendiriliyorsunuz...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            {exam.courseName && (
              <div className="text-sm text-gray-600 mt-2">
                Kurs: {exam.courseName}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {exam.description && (
              <p className="text-gray-700">{exam.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Soru Sayısı</div>
                <div className="text-2xl font-bold">{exam.questions.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Süre</div>
                <div className="text-2xl font-bold">{exam.duration} dakika</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Maksimum Puan</div>
                <div className="text-2xl font-bold">{exam.maxScore}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Her Soru</div>
                <div className="text-2xl font-bold">
                  {((exam.maxScore || 100) / exam.questions.length).toFixed(1)} puan
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-yellow-800">Önemli Notlar:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                <li>Sınav başladıktan sonra geri dönemezsiniz</li>
                <li>Süre dolduğunda sınav otomatik olarak sonlanır</li>
                <li>Tüm soruları cevaplamanız önerilir</li>
                <li>Cevaplarınızı gönderdikten sonra değişiklik yapamazsınız</li>
              </ul>
            </div>

            <Button 
              onClick={handleStart} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              data-testid="button-start-exam"
            >
              Sınava Başla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Timer Header - Fixed at top */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{exam.title}</h1>
              {exam.courseName && (
                <p className="text-sm text-gray-400">{exam.courseName}</p>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Cevaplanan</div>
                <div className="text-lg font-semibold text-white">
                  {Object.keys(answers).length} / {exam.questions.length}
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-600' : 'bg-blue-600'
              }`}>
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <div className="text-xs text-white/80">Kalan Süre</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {exam.questions.map((question, index) => (
          <Card key={question.id} className="bg-white" data-testid={`card-question-${question.id}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1">{question.questionText}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionKey = `option${option}` as keyof ExamQuestion;
                    const optionText = question[optionKey] as string;
                    
                    return (
                      <div
                        key={option}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-blue-50 ${
                          answers[question.id] === option
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleAnswerChange(question.id, option)}
                      >
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label
                          htmlFor={`${question.id}-${option}`}
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-semibold mr-2">{option})</span>
                          {optionText}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {/* Submit Button */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white sticky bottom-4">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {Object.keys(answers).length === exam.questions.length
                    ? "Tüm sorular cevaplandı!"
                    : `${exam.questions.length - Object.keys(answers).length} soru cevapsız`}
                </div>
                <div className="text-sm text-white/80">
                  Sınavı tamamlamak için butona tıklayın
                </div>
              </div>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={submitMutation.isPending}
                size="lg"
                className="bg-white text-green-700 hover:bg-gray-100"
                data-testid="button-submit-exam"
              >
                {submitMutation.isPending ? "Gönderiliyor..." : "Sınavı Bitir"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
