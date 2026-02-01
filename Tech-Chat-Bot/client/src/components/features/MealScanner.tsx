import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, CheckCircle, X, Edit2, Loader2, Info, ShieldCheck, Scale } from "lucide-react";
import { useState, useRef } from "react";
import { analyzeFoodImage, LoggedMeal } from "@/lib/bot-logic";
import confetti from "canvas-confetti";

interface MealScannerProps {
  onClose: () => void;
  onSave: (meal: LoggedMeal) => void;
}

export function MealScanner({ onClose, onSave }: MealScannerProps) {
  const [step, setStep] = useState<"capture" | "analyzing" | "result">("capture");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<LoggedMeal | null>(null);
  const [portion, setPortion] = useState(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setStep("analyzing");
        analyzeImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imgUri: string) => {
    try {
      const detectedMeal = await analyzeFoodImage(imgUri);
      setResult(detectedMeal);
      setStep("result");
    } catch (error) {
      console.error("Analysis failed", error);
      // Fallback/Error state could go here
    }
  };

  const handleSave = () => {
    if (result) {
      // Adjust result based on portion
      const finalMeal = {
        ...result,
        calories: Math.round(result.calories * portion),
        protein: Math.round(result.protein * portion),
        carbs: Math.round(result.carbs * portion),
        fats: Math.round(result.fats * portion),
        portion: portion
      };
      
      onSave(finalMeal);
      
      // Celebration effect
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B']
      });
      
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-50"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100 bg-white shadow-sm">
        <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
          <Camera className="text-primary" /> تحليل الوجبة الذكي
        </h2>
        <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <X size={20} className="text-zinc-500" />
        </button>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Step 1: Capture */}
        {step === "capture" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="relative">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-zinc-50">
                <Camera size={64} className="text-primary opacity-80" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                AI Vision ⚡
              </div>
            </div>
            
            <div className="max-w-xs">
              <h3 className="text-2xl font-black text-zinc-800 mb-3">وش تاكل اليوم؟</h3>
              <p className="text-zinc-500 leading-relaxed">
                صور وجبتك وخلي الذكاء الاصطناعي يتعرف عليها، يحسب سعراتها، ويعطيك نصائح سعودية!
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95"
              >
                <Camera size={24} />
                التقاط صورة
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mt-2">
                <ShieldCheck size={12} />
                <span>نحمي خصوصيتك: الصور تحلل لحظياً ولا يتم حفظها.</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 bg-black/90">
             <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
               {image && <img src={image} alt="Meal" className="w-full h-full object-cover opacity-60" />}
               
               {/* Scanning Overlay */}
               <motion.div 
                 className="absolute inset-0 border-t-4 border-primary shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                 animate={{ top: ["0%", "100%", "0%"] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 size={48} className="text-white animate-spin drop-shadow-lg" />
               </div>
             </div>
             
             <div className="text-center space-y-2">
               <h3 className="text-xl font-bold text-white">جاري تحليل المكونات...</h3>
               <p className="text-white/50 text-sm">نبحث عن الكبسة، الشاورما، والمزيد 👀</p>
             </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === "result" && result && (
          <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto pb-4">
            {/* Image Header */}
            <div className="relative h-72 w-full flex-shrink-0">
              {image && <img src={image} alt="Detected Meal" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                        ثقة {Math.round((result.confidence || 0) * 100)}%
                      </span>
                      {result.isSaudi && (
                        <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          🇸🇦 طبق سعودي
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-white leading-tight">{result.name}</h3>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors text-white">
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 px-4 -mt-4 relative z-10 space-y-4">
              
              {/* Macros Card */}
              <div className="bg-white rounded-3xl p-5 shadow-xl shadow-zinc-200/50">
                <div className="grid grid-cols-4 gap-2 text-center divide-x divide-x-reverse divide-zinc-100">
                   <div>
                     <p className="text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">سعرات</p>
                     <p className="text-xl font-black text-zinc-800">{Math.round(result.calories * portion)}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-wider">بروتين</p>
                     <p className="text-xl font-black text-blue-600">{Math.round(result.protein * portion)}g</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-wider">كارب</p>
                     <p className="text-xl font-black text-purple-600">{Math.round(result.carbs * portion)}g</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-yellow-400 font-bold mb-1 uppercase tracking-wider">دهون</p>
                     <p className="text-xl font-black text-yellow-600">{Math.round(result.fats * portion)}g</p>
                   </div>
                </div>
              </div>

              {/* Saudi Tip */}
              {result.healthTip && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
                  <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-blue-900 leading-relaxed font-medium">
                    {result.healthTip}
                  </p>
                </div>
              )}

              {/* Portion Slider */}
              <div className="bg-white rounded-2xl p-4 border border-zinc-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-zinc-700 flex items-center gap-2">
                    <Scale size={18} className="text-zinc-400" /> حجم الحصة
                  </span>
                  <span className="bg-zinc-100 text-zinc-800 font-bold px-2 py-1 rounded-lg text-sm">
                    {portion}x ({portion === 1 ? "حصّة عادية" : portion > 1 ? "حصّة كبيرة" : "حصّة صغيرة"})
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.5" 
                  value={portion}
                  onChange={(e) => setPortion(parseFloat(e.target.value))}
                  className="w-full accent-primary h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-2 px-1">
                  <span>نصف حصة</span>
                  <span>عادية</span>
                  <span>دبل</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3 pb-6">
                 <button 
                   onClick={handleSave}
                   className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95"
                 >
                   <CheckCircle size={20} />
                   اعتماد الوجبة (+50 XP)
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}