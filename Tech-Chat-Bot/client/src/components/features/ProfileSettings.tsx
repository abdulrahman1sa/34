import { useState } from "react";
import { UserProfile, calculateCalories } from "@/lib/bot-logic";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { COACH_PERSONA, SYSTEM_PROMPT } from "@shared/config/prompt";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileSettings({ isOpen, onClose, userProfile, onUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [, setLocation] = useLocation();

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  const handleResetProfile = () => {
    if (confirm("هل أنت متأكد أنك تريد إعادة تعيين ملفك الشخصي؟ ستفقد جميع البيانات.")) {
      localStorage.removeItem("health-user-profile");
      localStorage.removeItem("health-chat-history");
      setLocation("/onboarding");
      window.location.reload(); // Force reload to clear state
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (field: "medicalConditions" | "injuries", value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(i => i !== value) : [...current, value]
      };
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[2rem] p-0 bg-zinc-50 border-t-0 font-sans" dir="rtl">
        <SheetHeader className="px-6 pt-6 pb-2 text-right">
          <SheetTitle>إعدادات الملف الشخصي</SheetTitle>
          <SheetDescription>عدل بياناتك عشان نضبط لك الحسابات صح</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full px-6 pb-20">
          <div className="space-y-8 py-4">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
                المعلومات الأساسية
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input 
                    value={formData.name || ""} 
                    onChange={(e) => updateField("name", e.target.value)}
                    className="bg-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الجنس</Label>
                  <div className="flex bg-white rounded-xl p-1 border border-input">
                    <button
                      onClick={() => updateField("gender", "male")}
                      className={`flex-1 rounded-lg text-sm py-1.5 transition-all ${formData.gender === 'male' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
                    >
                      ذكر
                    </button>
                    <button
                      onClick={() => updateField("gender", "female")}
                      className={`flex-1 rounded-lg text-sm py-1.5 transition-all ${formData.gender === 'female' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
                    >
                      أنثى
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>العمر</Label>
                <Input 
                  type="number"
                  value={formData.age || ""} 
                  onChange={(e) => updateField("age", Number(e.target.value))}
                  className="bg-white rounded-xl"
                />
              </div>
            </div>

            {/* Body Stats */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                القياسات
              </h3>

              <div className="bg-white p-4 rounded-2xl border border-zinc-100 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>الطول</Label>
                    <span className="font-bold text-emerald-600">{formData.height} سم</span>
                  </div>
                  <Slider 
                    value={[formData.height || 170]} 
                    min={140} max={220} step={1} 
                    onValueChange={(v) => updateField("height", v[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>الوزن</Label>
                    <span className="font-bold text-emerald-600">{formData.weight} كجم</span>
                  </div>
                  <Slider 
                    value={[formData.weight || 70]} 
                    min={40} max={150} step={0.5} 
                    onValueChange={(v) => updateField("weight", v[0])}
                  />
                </div>
              </div>
            </div>

            {/* Goals & Activity */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</span>
                الهدف والنشاط
              </h3>

              <RadioGroup value={formData.goal} onValueChange={(v) => updateField("goal", v)} className="grid grid-cols-1 gap-3">
                {[
                  { value: "weight_loss", label: "تنشيف (خسارة وزن)" },
                  { value: "muscle_gain", label: "تضخيم (بناء عضل)" },
                  { value: "maintenance", label: "محافظة" }
                ].map((opt) => (
                  <Label 
                    key={opt.value}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.goal === opt.value ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                  >
                    <span>{opt.label}</span>
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    {formData.goal === opt.value && <span className="text-emerald-400">✓</span>}
                  </Label>
                ))}
              </RadioGroup>

              <div className="space-y-2 pt-2">
                <Label>مستوى النشاط</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["sedentary", "moderate", "active"].map((level) => (
                    <div 
                      key={level}
                      onClick={() => updateField("activityLevel", level)}
                      className={`p-3 rounded-xl border text-center cursor-pointer text-xs transition-all ${formData.activityLevel === level ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      {level === "sedentary" && "خامل"}
                      {level === "moderate" && "متوسط"}
                      {level === "active" && "عالي"}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI API Key */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">4</span>
                الذكاء الاصطناعي
              </h3>
              
              <div className="space-y-3">
                <Label>مفتاح OpenAI (اختياري)</Label>
                <Input 
                  type="password"
                  value={formData.apiKey || ""} 
                  onChange={(e) => updateField("apiKey", e.target.value)}
                  placeholder="sk-..."
                  className="bg-white rounded-xl font-mono"
                  dir="ltr"
                />
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  💡 فعّل زر "الذكاء ✨" بعد إضافة المفتاح. يُحفظ محلياً في متصفحك فقط.
                </p>
              </div>
            </div>

            {/* AI Persona Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">5</span>
                شخصية الذكاء الاصطناعي
              </h3>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">الاسم</p>
                    <p className="text-lg font-bold text-zinc-900">{COACH_PERSONA.name}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                    💪
                  </div>
                </div>
                <p className="text-sm text-zinc-600">{COACH_PERSONA.description}</p>
                
                <details className="group">
                  <summary className="cursor-pointer text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 select-none">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    عرض تعليمات النظام (System Prompt)
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded-lg border border-purple-100">
                    <pre className="text-[10px] text-zinc-600 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                      {SYSTEM_PROMPT}
                    </pre>
                  </div>
                </details>
              </div>
            </div>

            {/* Coach Tone */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">6</span>
                نبرة الكوتش
              </h3>
              
              <div className="space-y-2">
                <Label>اختر الأسلوب المفضل</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "kind", label: "لطيف 🌸" },
                    { value: "balanced", label: "متوازن ⚖️" },
                    { value: "strict", label: "صارم 🔥" },
                  ].map((tone) => (
                    <div 
                        key={tone.value}
                        onClick={() => updateField("coachTone", tone.value)}
                        className={`p-3 rounded-xl border text-center cursor-pointer text-sm transition-all ${formData.coachTone === tone.value ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                      >
                        {tone.label}
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Injuries */}
            <div className="space-y-4">
              <Label>الإصابات</Label>
              <div className="flex flex-wrap gap-2">
                {["ركبة", "ظهر", "كتف", "كاحل"].map((injury) => (
                  <Badge
                    key={injury}
                    variant={formData.injuries?.includes(injury) ? "default" : "outline"}
                    className={`px-3 py-1.5 cursor-pointer ${formData.injuries?.includes(injury) ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : 'hover:bg-zinc-100 text-zinc-600'}`}
                    onClick={() => toggleSelection("injuries", injury)}
                  >
                    {injury}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
              <span className="text-emerald-800 font-medium">السعرات المقترحة الجديدة:</span>
              <span className="text-xl font-bold text-emerald-600">{calculateCalories(formData)}</span>
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full h-12 text-lg rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              حفظ التغييرات
            </Button>

            <Button 
              onClick={handleResetProfile} 
              variant="ghost"
              className="w-full h-12 text-lg rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              إعادة تعيين الملف الشخصي
            </Button>
            
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
