import { useState, useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { InputArea } from "@/components/chat/InputArea";
import { QuickActions } from "@/components/chat/QuickActions";
import { getBotResponse, getSmartBotResponse, getLocalBotResponse, INTRO_MESSAGE, UserProfile, LoggedMeal } from "@/lib/bot-logic";
import { Activity, Settings2, Sparkles, Zap } from "lucide-react";
import { COACH_PERSONA } from "@shared/config/prompt";

// Feature Components
import { WeeklyPlan } from "@/components/features/WeeklyPlan";
import { GroceryList } from "@/components/features/GroceryList";
import { Tracker } from "@/components/features/Tracker";
import { RamadanToggle } from "@/components/features/RamadanToggle";
import { GamificationStats } from "@/components/features/GamificationStats";
import { PredictiveInsights } from "@/components/features/PredictiveInsights";
import { VoiceControls } from "@/components/features/VoiceControls";
import { ProModal } from "@/components/features/ProModal";
import { FoodRewards } from "@/components/features/FoodRewards";
import { MealScanner } from "@/components/features/MealScanner";
import { ProfileSettings } from "@/components/features/ProfileSettings";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Hooks
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Home() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ isSmartMode: true });
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  
  // Modals/Views State
  const [showPlan, setShowPlan] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showFoodRewards, setShowFoodRewards] = useState(false);
  const [showMealScanner, setShowMealScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Voice State (Mock)
  const [isListening, setIsListening] = useState(false);

  // Load history on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("health-chat-history");
    const savedProfile = localStorage.getItem("health-user-profile");
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile({ isSmartMode: true, ...parsed });
    }

    if (savedChat) {
      const parsed = JSON.parse(savedChat).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      setMessages(parsed);
    } else {
      setMessages([{
        id: "intro",
        text: INTRO_MESSAGE,
        sender: "bot",
        timestamp: new Date()
      }]);
    }
  }, []);

  // Save history on update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("health-chat-history", JSON.stringify(messages));
    }
    localStorage.setItem("health-user-profile", JSON.stringify(userProfile));
  }, [messages, userProfile]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setCurrentOptions([]); 
    
    // Add Points & XP Logic (Simple)
    if (userMsg.sender === "user") {
        const newPoints = (userProfile.points || 0) + 10;
        const newFoodXp = (userProfile.foodXp || 0) + 5;
        setUserProfile(prev => ({ ...prev, points: newPoints, foodXp: newFoodXp }));
    }

    // Close any open modals when chatting
    setShowPlan(false);
    setShowGrocery(false);
    setShowGamification(false);
    setShowInsights(false);
    setShowFoodRewards(false);
    setShowMealScanner(false);

    try {
      let response;
      
      // Check if Smart Mode is active
      if (userProfile.isSmartMode) {
        // Prepare context
        const historyContext = messages.slice(-5);
        response = await getSmartBotResponse(text, userProfile, historyContext);
      } else {
        // Use Local Logic (Simulate delay)
        await new Promise(r => setTimeout(r, 1200));
        response = getLocalBotResponse(text, userProfile);
      }
      
      // Handle Updates from Response
      if (response.updatedProfile) {
        setUserProfile(response.updatedProfile);
      }

      // Handle Actions
      if (response.action === "show_weekly_plan") setShowPlan(true);
      if (response.action === "show_grocery") setShowGrocery(true);
      if (response.action === "show_tracker") setShowTracker(true);
      if (response.action === "show_gamification") setShowGamification(true);
      if (response.action === "show_insights") setShowInsights(true);
      if (response.action === "show_pro_modal") setShowProModal(true);
      if (response.action === "show_food_rewards") setShowFoodRewards(true);
      if (response.action === "show_meal_scanner") setShowMealScanner(true);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setCurrentOptions(response.options || []);
      
      // Voice Output Simulation
      if (userProfile.isVoiceEnabled) {
          console.log("Speaking: " + response.text);
      }

    } catch (error) {
      console.error("Bot Error:", error);
      // Fallback message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "آسف، صار خطأ بسيط. حاول مرة ثانية.",
        sender: "bot",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (confirm("أكيد تبي تمسح كل شي وتبدأ من جديد؟")) {
      localStorage.removeItem("health-chat-history");
      localStorage.removeItem("health-user-profile");
      setUserProfile({});
      setMessages([{
        id: Date.now().toString(),
        text: INTRO_MESSAGE,
        sender: "bot",
        timestamp: new Date()
      }]);
      setCurrentOptions([]);
    }
  };

  const handleRamadanToggle = (val: boolean) => {
    const newProfile = { ...userProfile, isRamadan: val };
    setUserProfile(newProfile);
    handleSend(val ? "وضع رمضان" : "إلغاء وضع رمضان");
  };

  const handleSmartModeToggle = () => {
    const newState = !userProfile.isSmartMode;
    setUserProfile(prev => ({ ...prev, isSmartMode: newState }));
    toast({
      title: newState ? "🧠 وضع الذكاء مفعل" : "⚡ الوضع السريع مفعل",
      description: newState ? "الكوتش الحين يفهم عليك أكثر!" : "ردود سريعة ومباشرة.",
      className: newState ? "bg-purple-50 border-purple-200 text-purple-800" : "bg-zinc-50 border-zinc-200",
    });
  };

  const handleMealSave = (meal: LoggedMeal) => {
    const newPoints = (userProfile.points || 0) + 50;
    const newFoodXp = (userProfile.foodXp || 0) + 100;
    
    setUserProfile(prev => ({
      ...prev,
      points: newPoints,
      foodXp: newFoodXp,
      loggedMeals: [...(prev.loggedMeals || []), meal]
    }));

    toast({
      title: "كفو عليك! 📸",
      description: `سجلت ${meal.calories} سعرة. جاك 50 نقطة!`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-800 font-sans",
    });

    // Bot response
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: `عافية! 😋 سجلت لك **${meal.name}** (${meal.calories} سعرة).`,
      sender: "bot",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto md:max-w-full relative overflow-hidden bg-zinc-50 text-right font-sans" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="glass px-4 py-3 flex items-center justify-between z-10 sticky top-0 border-b border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setShowSettings(true)}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white shadow-sm p-0.5">
               <Avatar className="w-full h-full">
                  <AvatarImage src="/user-avatar.png" alt="User" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {userProfile.name ? userProfile.name.charAt(0) : "ح"}
                  </AvatarFallback>
               </Avatar>
            </div>
          </div>
          <div className="relative cursor-pointer" onClick={() => setShowGamification(true)}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-white shadow-sm p-0.5">
              <img src="/health-avatar.png" alt="Coach" className="w-full h-full object-cover rounded-full" />
            </div>
            {userProfile.isPro && <span className="absolute -top-1 -right-1 text-xs drop-shadow-md">👑</span>}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-zinc-800 text-md leading-tight">
                {COACH_PERSONA.name}
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-md shadow-sm" title="يستخدم اللهجة السعودية الأصلية">
                SA
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium">
              <Activity size={10} className="text-emerald-500" />
              {userProfile.coachTone === "strict" ? "صارم 🔥" : userProfile.coachTone === "kind" ? "لطيف 🌸" : "مساعدك الشخصي"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Smart Mode Toggle */}
          <button 
            onClick={handleSmartModeToggle}
            className={`p-2 rounded-full transition-all ${userProfile.isSmartMode ? 'text-purple-600 bg-purple-100' : 'text-zinc-400 hover:bg-zinc-100'}`}
            title={userProfile.isSmartMode ? "وضع الذكاء مفعل" : "تفعيل الذكاء"}
          >
            {userProfile.isSmartMode ? <Sparkles size={18} /> : <Zap size={18} />}
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
            title="تغيير الأسلوب"
          >
            <Settings2 size={18} />
          </button>
          
          <VoiceControls 
            isEnabled={!!userProfile.isVoiceEnabled} 
            onToggle={() => handleSend("تغيير وضع الصوت")} 
            isListening={isListening}
            onListenToggle={() => setIsListening(!isListening)}
          />
          <RamadanToggle isRamadan={userProfile.isRamadan} onToggle={handleRamadanToggle} />
          
          <button 
            onClick={handleClear}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="مسح المحادثة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </header>

      {/* Feature Views */}
      {showPlan && <WeeklyPlan userProfile={userProfile} onClose={() => setShowPlan(false)} />}
      {showGrocery && <GroceryList userProfile={userProfile} onClose={() => setShowGrocery(false)} />}
      {showGamification && <GamificationStats points={userProfile.points || 0} streak={userProfile.weeklyStreak || 3} onClose={() => setShowGamification(false)} />}
      {showInsights && <PredictiveInsights userProfile={userProfile} onClose={() => setShowInsights(false)} />}
      {showFoodRewards && (
        <FoodRewards 
          currentXP={userProfile.foodXp || 0} 
          unlockedMeals={userProfile.unlockedMeals || []} 
          onClose={() => setShowFoodRewards(false)}
          onUnlock={(mealId) => setUserProfile(prev => ({ ...prev, unlockedMeals: [...(prev.unlockedMeals || []), mealId] }))}
        />
      )}
      {showMealScanner && <MealScanner onClose={() => setShowMealScanner(false)} onSave={handleMealSave} />}
      <ProModal isOpen={showProModal} onClose={() => setShowProModal(false)} onUpgrade={() => setUserProfile(p => ({...p, isPro: true}))} isPro={!!userProfile.isPro} />
      <ProfileSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        userProfile={userProfile} 
        onUpdate={setUserProfile} 
      />

      {/* Chat Area */}
      <MessageList messages={messages} isTyping={isTyping} />

      {/* Footer Area */}
      <div className="w-full z-10 space-y-2 mb-2">
        {showTracker && (
          <div className="px-4 mb-2">
            <Tracker />
          </div>
        )}
        <QuickActions onSelect={handleSend} options={currentOptions.length ? currentOptions : ["صوّر وجبتك", "مكافآتي الغذائية", "توقعات الأسبوع", "تحدي الأسبوع", "ملفي الصحي"]} />
        <InputArea onSend={handleSend} onCameraClick={() => setShowMealScanner(true)} disabled={isTyping} />
      </div>
    </div>
  );
}