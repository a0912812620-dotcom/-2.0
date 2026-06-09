/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OnboardingProfile, EmergencyContact } from './types';
import WelcomeOnboarding from './components/WelcomeOnboarding';
import CameraModule from './components/CameraModule';
import ChatroomModule from './components/ChatroomModule';
import MedicationModule from './components/MedicationModule';
import { Heart, User, ShieldAlert, Bell, Camera, ChevronRight, Activity, Smile, RefreshCw, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Layout navigation states
  const [activeTab, setActiveTab] = useState<'camera' | 'medication'>('camera');
  const [showChatroom, setShowChatroom] = useState(false);

  // Alarms ringing state
  const [ringingAlarmMsg, setRingingAlarmMsg] = useState<string | null>(null);

  // Read saved profiles on mount
  useEffect(() => {
    const cachedProfile = localStorage.getItem('care2_user_profile');
    const cachedContact = localStorage.getItem('care2_user_contact');
    if (cachedProfile && cachedContact) {
      try {
        setProfile(JSON.parse(cachedProfile));
        setContact(JSON.parse(cachedContact));
        setIsRegistered(true);
      } catch (e) {
        console.warn("Could not load registration cache", e);
      }
    }
  }, []);

  const handleRegistrationComplete = (profData: OnboardingProfile, contData: EmergencyContact) => {
    setProfile(profData);
    setContact(contData);
    setIsRegistered(true);
    localStorage.setItem('care2_user_profile', JSON.stringify(profData));
    localStorage.setItem('care2_user_contact', JSON.stringify(contData));
  };

  const handleClearRegistration = () => {
    if (window.confirm("確定要重設註冊資料並返回迎賓畫面嗎？")) {
      localStorage.removeItem('care2_user_profile');
      localStorage.removeItem('care2_user_contact');
      localStorage.removeItem('care2_medication_reminders');
      setProfile(null);
      setContact(null);
      setIsRegistered(false);
      setShowChatroom(false);
      setRingingAlarmMsg(null);
    }
  };

  const handleTriggerAlarm = (msg: string) => {
    setRingingAlarmMsg(msg);
  };

  const handleStopAlarm = () => {
    setRingingAlarmMsg(null);
  };

  // If not registered yet, display step-by-step registration
  if (!isRegistered) {
    return <WelcomeOnboarding onComplete={handleRegistrationComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] selection:bg-natural-sand text-[#2c2c2c] font-sans" id="main-app-container">
      
      {/* 1. Alarm Global Trigger Modal Backdrop */}
      <AnimatePresence>
        {ringingAlarmMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2c2c2c]/80 backdrop-blur-sm flex items-center justify-center p-4"
            id="alarm-trigger-popup-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[40px] p-8 max-w-lg w-full text-center shadow-2xl border-2 border-[#8a6d3b] relative overflow-hidden"
              id="alarm-trigger-popup-card"
            >
              {/* Pulsing alarm ring background */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#8a6d3b] animate-pulse" />
              
              <div className="w-16 h-16 bg-[#f5f5f0] text-[#8a6d3b] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#e5e4de]">
                <Bell size={32} className="animate-bounce" />
              </div>

              {/* Exact alarm title pattern as requested */}
              <h3 className="text-xl font-serif font-extrabold text-[#3d3d2e] tracking-tight leading-snug">
                {ringingAlarmMsg}
              </h3>

              <p className="text-xs text-[#8e8d82] mt-4 max-w-sm mx-auto leading-relaxed">
                這是關懷2.0 系統服藥提示，您可以配合溫開水與處方箋安全服藥。若已完成，請點擊下方按鈕以停止安全響鈴。
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  id="modal-stop-alarm-btn"
                  onClick={handleStopAlarm}
                  className="w-full bg-[#8a6d3b] hover:bg-[#725a31] text-white py-3.5 rounded-full font-bold transition shadow flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  <Volume2 size={18} />
                  <span>我已服用完畢 (停止響鈴)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Sticky Top Bar with left-to-right controls as requested */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e4de] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo Brand / User Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white font-serif font-semibold text-lg shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-semibold text-[#3d3d2e] tracking-tight">
                  關懷 2.0 
                  <span className="text-sm font-sans font-normal opacity-60 ml-2 italic text-[#8e8d82]">Care Dashboard</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Left-to-right Buttons Header exactly as requested (攝像鏡頭, 用藥提醒) */}
          <div className="flex items-center gap-2 p-1 bg-[#f5f5f0] rounded-full self-start sm:self-center" id="top-nav-buttons-header">
            
            <button
              id="top-nav-camera-btn"
              onClick={() => {
                setActiveTab('camera');
                setShowChatroom(false);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'camera' && !showChatroom
                  ? 'bg-[#5A5A40] text-white'
                  : 'text-[#8e8d82] hover:text-[#3d3d2e]'
              }`}
            >
              <Camera size={14} />
              <span>攝像鏡頭</span>
            </button>

            <button
              id="top-nav-medication-btn"
              onClick={() => {
                setActiveTab('medication');
                setShowChatroom(false);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'medication' && !showChatroom
                  ? 'bg-[#5A5A40] text-white'
                  : 'text-[#8e8d82] hover:text-[#3d3d2e]'
              }`}
            >
              <Bell size={14} />
              <span>用藥提醒</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main app Grid Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 4 COLS: User Profile & Emergency Contact */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-[32px] p-6 border border-[#e5e4de] shadow-sm space-y-5" id="user-info-sidebar">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#8e8d82] font-bold mb-4">個人健康檔案</h3>
              </div>

              <div className="space-y-4 text-sm" id="sidebar-data-details">
                <div className="flex justify-between border-b border-[#f5f5f0] pb-2">
                  <span className="text-[#8e8d82]">性別</span>
                  <span className="font-semibold text-[#2c2c2c]">
                    {profile?.gender === 'male' && '男性'}
                    {profile?.gender === 'female' && '女性'}
                    {profile?.gender === 'private' && '不公開 🔒'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-[#f5f5f0] pb-2">
                  <span className="text-[#8e8d82]">年齡</span>
                  <span className="font-semibold text-[#2c2c2c]">{profile?.age} 歲</span>
                </div>

                <div className="flex justify-between border-b border-[#f5f5f0] pb-2">
                  <span className="text-[#8e8d82]">血型</span>
                  <span className="font-semibold text-[#2c2c2c]">{profile?.bloodType} 型</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-[#8e8d82] text-xs font-semibold">慢性病史</span>
                  <div className="flex flex-wrap gap-2">
                    {profile?.hasChronic ? (
                      (profile.chronicType || '').split(/[、,，\s]+/).map((disease, idx) => (
                        disease.trim() && (
                          <span key={idx} className="bg-[#f5f5f0] text-[#5A5A40] px-3.5 py-1.5 rounded-full text-xs font-medium">
                            {disease.trim()}
                          </span>
                        )
                      ))
                    ) : (
                      <span className="bg-[#f5f5f0] text-[#8e8d82] px-3.5 py-1.5 rounded-full text-xs font-medium">
                        無已知慢性病
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset Registration Button */}
              <div className="border-t border-[#f5f5f0] pt-4">
                <button
                  type="button"
                  id="reset-registration-btn"
                  onClick={handleClearRegistration}
                  className="w-full text-xs text-[#8e8d82] hover:text-[#8a6d3b] hover:bg-[#f5f5f0] border border-[#e5e4de] py-2.5 rounded-full transition duration-150 cursor-pointer text-center font-medium block"
                >
                  重設健康檔案與緊急聯絡人
                </button>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-[#fff0f0] rounded-[32px] p-6 border border-red-200 shadow-sm" id="emergency-contact-panel">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                <h3 className="text-xs uppercase tracking-widest text-red-700 font-bold">緊急聯絡人通道</h3>
              </div>
              <div className="space-y-4">
                <p className="text-lg font-serif italic text-red-950 font-bold">
                  {contact?.contactName} <span className="text-sm font-sans opacity-70 not-italic text-red-800">({contact?.relationship})</span>
                </p>
                
                <button
                  type="button"
                  id="direct-call-action-btn"
                  onClick={() => {
                    if (contact?.contactPhone) {
                      try {
                        // Multi-layer fallback to launch the system dialer even within sandbox configurations
                        window.top!.location.href = `tel:${contact.contactPhone}`;
                      } catch (e) {
                        try {
                          window.location.href = `tel:${contact.contactPhone}`;
                        } catch (err) {
                          window.open(`tel:${contact.contactPhone}`, '_top');
                        }
                      }
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>撥號電話：{contact?.contactPhone}</span>
                </button>
                <p className="text-[10px] text-red-500 text-center text-semibold leading-normal">
                  * 點擊直接開啟親友通話熱線
                </p>
              </div>
            </div>

          </section>

          {/* RIGHT 8 COLS: Main Tab Display & Interactive Hub */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            <AnimatePresence mode="wait">
              
              {/* Dynamic View Toggles */}
              {showChatroom ? (
                
                // Conversational module override when chatroom is launched
                <motion.div
                  key="chatroom-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChatroomModule onBackToApp={() => setShowChatroom(false)} />
                </motion.div>

              ) : (

                // Primary camera facial scan / alarm control tabs
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 flex flex-col"
                >
                  {/* TAB 1: Camera scanner */}
                  {activeTab === 'camera' && (
                    <div id="camera-tab-view" className="space-y-8 flex flex-col">
                      
                      {/* Interactive status card layout */}
                      <div className="bg-white rounded-[40px] border border-[#e5e4de] p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6">
                        <div className="relative z-10 flex-1">
                          <h2 className="text-3xl font-serif text-[#3d3d2e] leading-snug">
                            目前的氣色看起來<br/>
                            <span className="text-[#8a6d3b] underline underline-offset-8">有一點點憂鬱呢</span>
                          </h2>
                          <p className="mt-4 text-[#8e8d82] text-sm leading-relaxed">
                            您是否需要我陪伴聊天，分享您的心情科學解憂？
                          </p>
                          <button 
                            type="button"
                            id="manual-open-chat-guide-btn"
                            onClick={() => setShowChatroom(true)}
                            className="mt-6 px-6 py-3 bg-[#8a6d3b] hover:bg-[#725a31] text-white rounded-full text-xs font-semibold shadow-md transition-colors"
                          >
                            立即開啟陪伴聊天室
                          </button>
                        </div>
                        <div className="w-36 h-36 rounded-full border-8 border-[#f5f5f0] flex items-center justify-center overflow-hidden shrink-0">
                          <div className="w-full h-full bg-gradient-to-tr from-[#e5e4de] to-[#fdfcf8] flex items-center justify-center text-4xl">
                            😟
                          </div>
                        </div>
                        {/* Decorative Organic Shape */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#f5f5f0] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                      </div>

                      <CameraModule onStartChat={() => setShowChatroom(true)} />
                      
                    </div>
                  )}

                  {/* TAB 2: Medication alarm remind setter */}
                  {activeTab === 'medication' && (
                    <div id="medication-tab-view">
                      <MedicationModule
                        onAlarmTriggered={handleTriggerAlarm}
                        onStopAlarm={handleStopAlarm}
                        isAlarmRinging={!!ringingAlarmMsg}
                      />
                    </div>
                  )}

                </motion.div>
              )}

            </AnimatePresence>
          </section>

        </div>
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-[#e5e4de] mt-16 py-8 bg-white text-center text-xs text-[#8e8d82]">
        <p className="font-sans font-medium">關懷 2.0 貼心長輩健康守護系統 · 智慧科技整合</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10px]">
          <span>© 2026 Care Dashboard. All Rights Reserved.</span>
        </p>
      </footer>

    </div>
  );
}
