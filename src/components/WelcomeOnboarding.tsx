import React, { useState } from 'react';
import { OnboardingProfile, EmergencyContact } from '../types';
import { Heart, ShieldAlert, ArrowRight, CheckCircle2, User, Activity, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeOnboardingProps {
  onComplete: (profile: OnboardingProfile, contact: EmergencyContact) => void;
}

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'disclaimer' | 'contact' | 'splash'>('welcome');

  // Step 1 State: Profile
  const [profile, setProfile] = useState<OnboardingProfile>({
    gender: '',
    age: '',
    bloodType: '',
    hasChronic: false,
    chronicType: '',
  });

  // Step 2 State: Contact info
  const [contact, setContact] = useState<EmergencyContact>({
    contactName: '',
    relationship: '',
    contactPhone: '',
  });

  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  // Validate step 1
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!profile.gender) errors.push("請選擇性別！");
    if (!profile.age.trim()) {
      errors.push("請輸入年齡！");
    } else {
      const ageNum = parseInt(profile.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 130) {
        errors.push("請輸入合理的年齡數值！");
      }
    }
    if (!profile.bloodType) errors.push("請選擇血型！");
    if (profile.hasChronic && !profile.chronicType.trim()) {
      errors.push("請填寫您的慢性病！");
    }

    if (errors.length > 0) {
      setProfileErrors(errors);
      return;
    }
    setProfileErrors([]);

    // If step is successful, go to disclaimer
    setStep('disclaimer');
  };

  // Validate emergency contact step
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!contact.contactName.trim()) errors.push("請填寫緊急聯絡人姓名！");
    if (!contact.relationship.trim()) errors.push("請填寫與聯絡人的關係！");
    if (!contact.contactPhone.trim()) {
      errors.push("請填寫聯絡人電話！");
    } else {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
      if (!phoneRegex.test(contact.contactPhone.trim())) {
        errors.push("請填寫合理的電話格式！");
      }
    }

    if (errors.length > 0) {
      setContactErrors(errors);
      return;
    }
    setContactErrors([]);
    setStep('splash');
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-4 selection:bg-natural-sand">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-sm border border-natural-border overflow-hidden" id="onboarding-card">
        
        {/* Progress header or brand bar */}
        <div className="bg-natural-primary text-white p-6 relative overflow-hidden flex items-center justify-between">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-4">
            <Heart size={200} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-700/50 rounded-full">
              <Heart className="animate-pulse text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif tracking-wide">關懷 2.0</h1>
              <p className="text-xs text-natural-sand opacity-80">高齡健康守護與安心智慧伴侶</p>
            </div>
          </div>
          <div className="text-right text-xs bg-black/10 px-3 py-1.5 rounded-full font-mono text-natural-sand">
            {step === 'welcome' && '步驟 1/3：基本資料'}
            {step === 'disclaimer' && '步驟 2/3：免責同意'}
            {step === 'contact' && '步驟 3/3：緊急聯絡人'}
            {step === 'splash' && '完成註冊'}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Basic profile */}
            {step === 'welcome' && (
              <motion.form
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleProfileSubmit}
                className="space-y-6"
              >
                <div id="welcome-title-sec">
                  <h2 className="text-2xl font-bold font-serif text-natural-dark tracking-tight">歡迎使用 關懷2.0</h2>
                  <p className="text-sm text-natural-muted mt-1">請配合填寫建立您的健康檔案，讓我們能提供最貼心的日常智慧輔助。</p>
                </div>

                {profileErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl space-y-1 text-sm flex items-start gap-2">
                    <AlertCircle className="shrink-0 mt-0.5 text-rose-500" size={16} />
                    <div>
                      {profileErrors.map((err, idx) => (
                        <div key={idx} className="font-semibold text-rose-900">{err}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gender selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-natural-dark">選擇性別</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: '🚹 男性' },
                      { value: 'female', label: '🚺 女性' },
                      { value: 'private', label: '🔒 不公開' }
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        id={`gender-btn-${g.value}`}
                        onClick={() => setProfile({ ...profile, gender: g.value as any })}
                        className={`py-3.5 px-4 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                          profile.gender === g.value
                            ? 'border-natural-primary bg-natural-sand text-natural-primary ring-2 ring-natural-primary/20 shadow-sm font-bold'
                            : 'border-natural-border bg-white hover:bg-natural-sand text-natural-muted hover:border-natural-border'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-natural-dark" htmlFor="profile-age">年齡 (手動輸入)</label>
                  <div className="relative">
                    <input
                      type="number"
                      id="profile-age"
                      name="age"
                      placeholder="請輸入您的歲數 (例如：72)"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/20 text-natural-body transition-all font-sans text-base"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-natural-muted font-medium">歲</span>
                  </div>
                </div>

                {/* Blood Type selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-natural-dark">血型</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A型', 'B型', 'O型', 'AB型'].map((type) => {
                      const value = type.replace('型', '');
                      return (
                        <button
                          key={type}
                          type="button"
                          id={`blood-btn-${value}`}
                          onClick={() => setProfile({ ...profile, bloodType: value as any })}
                          className={`py-3 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                            profile.bloodType === value
                              ? 'border-natural-primary bg-natural-sand text-natural-primary ring-2 ring-natural-primary/20 shadow-sm font-bold'
                              : 'border-natural-border bg-white hover:bg-natural-sand text-natural-muted'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chronic Condition selector */}
                <div className="space-y-3 bg-natural-sand/60 p-4 rounded-2xl border border-natural-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-natural-dark">有無慢性病</span>
                      <p className="text-xs text-natural-muted">幫助隨行小秘書與服藥提示精準度</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        id="chronic-no-btn"
                        onClick={() => setProfile({ ...profile, hasChronic: false, chronicType: '' })}
                        className={`px-4 py-2 border text-xs font-semibold rounded-full transition-all cursor-pointer ${
                          !profile.hasChronic
                            ? 'bg-natural-primary text-white border-natural-primary shadow-sm'
                            : 'bg-white hover:bg-natural-sand text-natural-muted border-natural-border'
                        }`}
                      >
                        無
                      </button>
                      <button
                        type="button"
                        id="chronic-yes-btn"
                        onClick={() => setProfile({ ...profile, hasChronic: true })}
                        className={`px-4 py-2 border text-xs font-semibold rounded-full transition-all cursor-pointer ${
                          profile.hasChronic
                            ? 'bg-natural-accent text-white border-natural-accent shadow-sm'
                            : 'bg-white hover:bg-natural-sand text-natural-muted border-natural-border'
                        }`}
                      >
                        有
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {profile.hasChronic && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-1.5"
                      >
                        <label className="block text-xs font-semibold text-natural-muted mt-2">請手動輸入具體的慢性病（如：糖尿病、高血壓）</label>
                        <input
                          type="text"
                          id="chronic-details-input"
                          placeholder="例如：高血壓、心律不整"
                          value={profile.chronicType}
                          onChange={(e) => setProfile({ ...profile, chronicType: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-primary text-xs text-natural-body transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="profile-next-btn"
                    className="w-full bg-natural-primary hover:bg-natural-primary-hover text-white py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-base"
                  >
                    進入下一步
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: Disclaimer Consent */}
            {step === 'disclaimer' && (
              <motion.div
                key="disclaimer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 py-2"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-natural-sand rounded-full flex items-center justify-center mx-auto mb-4 border border-natural-border text-natural-accent">
                    <ShieldAlert size={36} className="animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-natural-dark">重要安全說明與保障</h3>
                </div>

                {/* Required text as specified */}
                <div className="bg-[#f5f5f0] border border-natural-border rounded-2xl p-6 text-natural-body space-y-4 shadow-sm" id="disclaimer-text-card">
                  <p className="text-base leading-relaxed font-serif italic text-[#3d3d2e] text-center md:text-left">
                    ”填寫緊急連絡人是為了避免發生危險時無人知曉，僅有在發生事故時才會通知緊急聯絡人。若同意以上通知，請按下一步”
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    id="disclaimer-prev-btn"
                    onClick={() => setStep('welcome')}
                    className="flex-1 border border-natural-border text-natural-muted hover:bg-natural-sand py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
                  >
                    返回修改
                  </button>
                  <button
                    type="button"
                    id="disclaimer-agree-btn"
                    onClick={() => setStep('contact')}
                    className="flex-1 bg-natural-primary hover:bg-natural-primary-hover text-white py-3.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>我同意並按下一步</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Emergency Contact Info */}
            {step === 'contact' && (
              <motion.form
                key="contact"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleContactSubmit}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold font-serif text-natural-dark">設定您的緊急聯絡人</h3>
                  <p className="text-sm text-natural-muted mt-1">請確實填寫正確資訊，以便在感測到異常或事故時能在第一時間提供通知防護。</p>
                </div>

                {contactErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl space-y-1 text-sm flex items-start gap-2">
                    <AlertCircle className="shrink-0 mt-0.5 text-rose-500" size={16} />
                    <div>
                      {contactErrors.map((err, idx) => (
                        <div key={idx} className="font-semibold text-rose-900">{err}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-natural-dark" htmlFor="contact-name">聯絡人姓名 (手動輸入)</label>
                    <input
                      type="text"
                      id="contact-name"
                      placeholder="請輸入緊急聯絡人姓名"
                      value={contact.contactName}
                      onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/20 text-natural-body transition-all font-sans"
                    />
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-natural-dark" htmlFor="contact-relation">與使用者關係 (手動輸入)</label>
                    <input
                      type="text"
                      id="contact-relation"
                      placeholder="例如：長子、女兒、配偶、摯友"
                      value={contact.relationship}
                      onChange={(e) => setContact({ ...contact, relationship: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/20 text-natural-body transition-all font-sans"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-natural-dark" htmlFor="contact-phone">緊急連絡人電話 (手動輸入)</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      placeholder="請輸入聯絡人電話，如：0912345678"
                      value={contact.contactPhone}
                      onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-natural-border rounded-xl focus:outline-none focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/20 text-natural-body transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    id="contact-back-btn"
                    onClick={() => setStep('disclaimer')}
                    className="flex-1 border border-natural-border text-natural-muted hover:bg-natural-sand py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
                  >
                    回上一頁
                  </button>
                  <button
                    type="submit"
                    id="contact-submit-btn"
                    className="flex-1 bg-natural-primary hover:bg-natural-primary-hover text-white py-3.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>確認送出</span>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* SPLASH STEP: Congratulations */}
            {step === 'splash' && (
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-20 h-20 bg-natural-sand text-natural-primary rounded-full flex items-center justify-center mx-auto border border-natural-border">
                  <CheckCircle2 size={48} className="animate-pulse" />
                </div>

                <div className="space-y-3" id="registration-text-display">
                  <p className="text-xl font-bold font-serif text-natural-dark leading-relaxed">
                    ”感謝您的註冊，歡迎使用關懷2.0！”
                  </p>
                  <p className="text-sm text-natural-muted max-w-sm mx-auto leading-relaxed">
                    您的守護檔案與通知清單已安全建立。我們接下來將為您開啟健康助理之門。
                  </p>
                </div>

                <div className="bg-natural-sand/80 rounded-2xl p-4 max-w-sm mx-auto border border-natural-border text-natural-body text-left space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="font-semibold text-natural-muted">註冊者年齡:</span> <span>{profile.age} 歲</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-natural-muted">血型型態:</span> <span>{profile.bloodType} 型</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-natural-muted">常規慢性病:</span> <span>{profile.hasChronic ? profile.chronicType : '無'}</span></div>
                  <div className="flex justify-between border-t border-natural-border mt-2 pt-2"><span className="font-semibold text-natural-muted">緊急聯絡人:</span> <span className="font-bold text-natural-dark">{contact.contactName} ({contact.relationship})</span></div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    id="enter-main-app-btn"
                    onClick={() => onComplete(profile, contact)}
                    className="w-full bg-natural-primary hover:bg-natural-primary-hover text-white py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-base"
                  >
                    進入關懷首頁
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
