import React, { useState, useEffect, useRef } from 'react';
import { MedicationReminder } from '../types';
import { Bell, Plus, Trash2, Clock, Volume2, VolumeX, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MedicationModuleProps {
  onAlarmTriggered: (message: string) => void;
  onStopAlarm?: () => void;
  isAlarmRinging: boolean;
}

export default function MedicationModule({ onAlarmTriggered, onStopAlarm, isAlarmRinging }: MedicationModuleProps) {
  // Purely in-memory medication reminders sequence - resets reliably on every page reload
  const [reminders, setReminders] = useState<MedicationReminder[]>([
    { id: 'rem_1', title: '日常綜合維他命', time: '08:30', isActive: true, isTriggered: false },
    { id: 'rem_2', title: '血脂/血壓藥', time: '20:15', isActive: true, isTriggered: false },
  ]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<any>(null);

  // Update clock every second & check for reminders
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentHHMM = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      // Check real-time alarms
      setReminders((prev) => {
        let updated = false;
        const nextReminders = prev.map((rem) => {
          if (rem.isActive && rem.time === currentHHMM && !rem.isTriggered) {
            updated = true;
            // sound alarm
            onAlarmTriggered(`服用藥物時間已到，請在時間內服用完畢。`);
            return { ...rem, isTriggered: true };
          }
          return rem;
        });

        const cleanedReminders = nextReminders.map(r => {
          if (r.isTriggered && r.time !== currentHHMM) {
            updated = true;
            return { ...r, isTriggered: false }; // re-arm for next day
          }
          return r;
        });

        if (updated) {
          return cleanedReminders;
        }
        return prev;
      });

      // Handle custom countdown test-timers
      setReminders((prev) => {
        let changed = false;
        const next = prev.map((rem) => {
          if (rem.isActive && rem.triggerTimeSec !== undefined && rem.triggerTimeSec > 0) {
            changed = true;
            const nextSec = rem.triggerTimeSec - 1;
            if (nextSec === 0) {
              onAlarmTriggered(`服用藥物時間已到，請在時間內服用完畢。`);
              return { ...rem, triggerTimeSec: undefined, isTriggered: true };
            }
            return { ...rem, triggerTimeSec: nextSec };
          }
          return rem;
        });
        if (changed) {
          return next;
        }
        return prev;
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [onAlarmTriggered]);

  // Synthesis Audio chime sound
  const playBeep = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Beautiful dual-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.4); // C6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.4); // E6

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Failed to generate synthesize audio alert:", err);
    }
  };

  // Sound triggering looping effect
  useEffect(() => {
    if (isAlarmRinging) {
      // Beep every 1.2s
      playBeep();
      beepIntervalRef.current = setInterval(() => {
        playBeep();
      }, 1200);
    } else {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    }

    return () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
      }
    };
  }, [isAlarmRinging, isMuted]);

  // Form submission: Save alarm
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    const newRem: MedicationReminder = {
      id: `rem_${Date.now()}`,
      title: title.trim(),
      time: time,
      isActive: true,
      isTriggered: false,
    };

    const nextReminders = [...reminders, newRem];
    setReminders(nextReminders);

    setTitle('');
    setTime('');
  };

  const handleDeleteReminder = (id: string) => {
    const nextReminders = reminders.filter((r) => r.id !== id);
    setReminders(nextReminders);
  };

  const handleToggleReminder = (id: string) => {
    const nextReminders = reminders.map((r) => {
      if (r.id === id) {
        return { ...r, isActive: !r.isActive, isTriggered: false, triggerTimeSec: undefined };
      }
      return r;
    });
    setReminders(nextReminders);
  };

  // Add a 5 sec countdown testing reminder
  const handleStartQuickTestSec = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          // Trigger a 5 seconds test countdown
          return { ...r, isActive: true, triggerTimeSec: 5, isTriggered: false };
        }
        return r;
      })
    );
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#e5e4de] shadow-sm">
      
      {/* Module Title */}
      <div className="flex items-center justify-between mb-6 border-b border-[#f5f5f0] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f5f5f0] text-[#5A5A40] rounded-full">
            <Bell size={22} className={isAlarmRinging ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#3d3d2e]">健康用藥提醒鬧鐘</h2>
            <p className="text-xs text-[#8e8d82]">設定服藥班表與響鈴提示，不再漏服任何保健藥物</p>
          </div>
        </div>

        {/* Audio Mute controller */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-full border transition cursor-pointer ${
            isMuted 
              ? 'bg-[#8a6d3b]/10 text-[#8a6d3b] border-[#e5e4de]' 
              : 'bg-[#f5f5f0] text-[#8e8d82] border-[#e5e4de] hover:bg-[#e5e4de] hover:text-[#5A5A40]'
          }`}
          title={isMuted ? '開啟測試音量' : '靜音模擬'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Clock display */}
      <div className="mb-6 p-4 bg-[#f5f5f0] rounded-[24px] border border-[#e5e4de] flex items-center justify-between" id="medication-clock-display">
        <div className="flex items-center gap-2">
          <Clock className="text-[#5A5A40]" size={18} />
          <span className="text-xs font-bold text-[#8e8d82]">系統時間偵側中：</span>
        </div>
        <div className="text-xl font-mono font-bold text-[#3d3d2e] tracking-wider">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Alarm active layout warning */}
      {isAlarmRinging && (
        <div className="mb-6 p-4 bg-[#8a6d3b]/10 border border-[#8a6d3b] rounded-[24px] text-[#8a6d3b]" id="alarm-ringing-card">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#8a6d3b] text-white flex items-center justify-center animate-bounce shrink-0 text-lg">
                📢
              </div>
              <div>
                <span className="font-serif font-extrabold text-sm block text-[#3d3d2e]">💊 服藥鬧鐘大聲響鈴中！</span>
                <span className="text-xs block text-[#8e8d82] mt-0.5">服用藥物時間已到，請在時間內服用完畢。</span>
              </div>
            </div>
            {onStopAlarm && (
              <button
                type="button"
                id="alarm-dismiss-confirm-btn"
                onClick={onStopAlarm}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#8a6d3b] hover:bg-[#725a31] text-white font-bold rounded-full text-xs transition duration-150 cursor-pointer shadow-sm"
              >
                我已服藥 (關閉鬧鐘)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleAddReminder} className="bg-[#f5f5f0]/50 p-4 rounded-[24px] border border-[#e5e4de] space-y-3 mb-6">
        <span className="text-xs font-bold text-[#3d3d2e] block">➕ 新增常規用藥鬧鐘</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Title input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8e8d82] block" htmlFor="alarm-title">用藥或藥物名稱</label>
            <input
              type="text"
              id="alarm-title"
              placeholder="例如：飯後血壓藥、維他命"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3/5 py-2 bg-white border border-[#e5e4de] rounded-xl focus:outline-none focus:border-[#5A5A40] text-xs text-[#2c2c2c] transition"
              required
            />
          </div>

          {/* Time input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8e8d82] block" htmlFor="alarm-time">設定每日提醒時間</label>
            <input
              type="time"
              id="alarm-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#e5e4de] rounded-xl focus:outline-none focus:border-[#5A5A40] text-xs text-[#2c2c2c] font-mono transition"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          id="alarm-add-submit-btn"
          className="w-full bg-[#5A5A40] hover:bg-[#4a4a35] text-white py-2.5 rounded-full font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus size={14} />
          <span>儲存並啟用此用藥提示</span>
        </button>
      </form>

      {/* Reminders List */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-[#3d3d2e] block">📅 目前服藥日程清單</span>
        
        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-[#f5f5f0]/30 rounded-[24px] border border-dashed border-[#e5e4de] text-[#8e8d82] text-xs">
            目前未設定任何服藥時鐘。立即填表以啟用保護。
          </div>
        ) : (
          <div className="space-y-2 relative" style={{ contentVisibility: 'auto' }}>
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-3.5 rounded-[20px] border transition-all flex items-center justify-between ${
                  rem.isActive
                    ? 'border-[#5A5A40]/20 bg-[#fbfbfa]'
                    : 'border-[#e5e4de] bg-[#f5f5f0]/30 text-[#8e8d82]'
                }`}
                id={`med-item-${rem.id}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition ${
                      rem.isActive
                        ? 'bg-[#5A5A40] text-white shadow-sm'
                        : 'bg-[#e5e4de] text-[#8e8d82]'
                    }`}
                    title={rem.isActive ? '點擊關閉此提醒' : '點擊啟用此提醒'}
                  >
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${rem.isActive ? 'text-[#3d3d2e]' : 'text-[#8e8d82] line-through'}`}>
                      {rem.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#f5f5f0] px-1.5 py-0.5 rounded">
                        ⌛ {rem.time}
                      </span>
                      {rem.triggerTimeSec !== undefined && (
                        <span className="text-[10px] font-mono text-[#8a6d3b] bg-[#f5f5f0] px-1.5 py-0.5 rounded animate-pulse">
                          測試倒數：{rem.triggerTimeSec}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Immediate 5s Test Alarm button */}
                  {rem.isActive && (
                    <button
                      type="button"
                      id={`alarm-tester-btn-${rem.id}`}
                      onClick={() => handleStartQuickTestSec(rem.id)}
                      className="text-[10px] font-bold text-[#5A5A40] hover:text-white bg-[#f5f5f0] hover:bg-[#5A5A40] border border-[#e5e4de] hover:border-[#5A5A40] px-3 py-1.5 rounded-full transition cursor-pointer"
                      title="快速倒數 5 秒測試鬧鐘與其通知語句"
                    >
                      5秒測試
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-2 text-[#8e8d82] hover:text-rose-700 hover:bg-[#f5f5f0] rounded-full transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
