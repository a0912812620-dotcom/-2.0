import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Smile, Meh, Frown, Video, VideoOff, MessageCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraModuleProps {
  onStartChat: () => void;
}

export default function CameraModule({ onStartChat }: CameraModuleProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up helper for stream
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setScanProgress(0);
    setHasStarted(true);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.warn("Video play interrupted", err));
      }

      // Simulate a 3-second scan with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        if (progress >= 100) {
          clearInterval(interval);
          setScanProgress(100);
          setTimeout(() => {
            setIsScanning(false);
            // Default to 'sad' (不開心) as requested, but allow manual simulation toggling later
            setScanResult('sad');
            stopCameraStream();
          }, 400);
        } else {
          setScanProgress(progress);
        }
      }, 120);

    } catch (err: any) {
      console.error("Camera access failed:", err);
      setIsScanning(false);
      // Give a graceful mock fallback in case of no hardware camera in testing sandbox
      setCameraError("未偵測到實體鏡頭。系統正啟用「護理智慧感測模擬鏡頭」...");
      
      // Still show progress and outcome under simulation mode
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        if (progress >= 100) {
          clearInterval(interval);
          setScanProgress(100);
          setTimeout(() => {
            setIsScanning(false);
            setScanResult('sad');
          }, 400);
        } else {
          setScanProgress(progress);
        }
      }, 100);
    }
  };

  const handleManualReset = () => {
    stopCameraStream();
    setHasStarted(false);
    setIsScanning(false);
    setScanResult(null);
    setCameraError(null);
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#e5e4de] shadow-sm">
      {/* Module Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#f5f5f0] text-[#5A5A40] rounded-full">
          <Camera size={22} />
        </div>
        <div>
          <h2 className="text-lg font-serif font-bold text-[#3d3d2e]">攝像鏡頭面相情緒掃描</h2>
          <p className="text-xs text-[#8e8d82]">開啟偵測功能，協助追蹤您的微笑程度與日常情緒健康</p>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-[#fdfcf8] rounded-[24px] overflow-hidden border border-[#e5e4de] flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
        
        {/* Video feed block */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 rounded-[24px] ${
            hasStarted && !scanResult && !cameraError ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Dynamic Scan Interface overlays */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 space-y-4"
              id="camera-ready-prompt"
            >
              <div className="w-16 h-16 bg-[#e5e4de] rounded-full flex items-center justify-center mx-auto text-[#5A5A40]">
                <Video size={32} />
              </div>
              <div className="max-w-xs">
                <span className="text-[#3d3d2e] text-base font-serif font-bold block">臉部情緒偵測鏡頭已就緒</span>
                <span className="text-[#8e8d82] text-xs block mt-1">點擊下方按鈕，系統將開啟鏡頭拍攝您 3 秒分析氣色與面相</span>
              </div>
              <button
                type="button"
                id="camera-scan-trigger-btn"
                onClick={handleStartCamera}
                className="bg-[#5A5A40] hover:bg-[#4a4a35] text-white font-medium py-2 px-5 rounded-full text-sm transition-all cursor-pointer shadow-sm"
              >
                開啟攝像鏡頭進行掃描
              </button>
            </motion.div>
          )}

          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-[#fdfcf8]/90 z-20 flex flex-col items-center justify-center p-6">
              {/* Animated scan bar */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5A5A40] to-transparent animate-[bounce_1.5s_infinite]" />

              <div className="space-y-4 text-center max-w-xs">
                {/* Circular indicator */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-[#e5e4de] fill-none"
                      strokeWidth="4"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-[#5A5A40] fill-none transition-all duration-100"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - scanProgress / 100)}
                    />
                  </svg>
                  <span className="absolute text-[#3d3d2e] font-mono font-bold text-sm">{scanProgress}%</span>
                </div>

                <div>
                  <h4 className="text-[#3d3d2e] text-sm font-bold animate-pulse">分析中，請面向鏡頭...</h4>
                  <p className="text-[#8e8d82] text-xs mt-1">正在透過嘴角弧度與眼部肌肉特特征判讀表情情緒...</p>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Mock Message */}
          {hasStarted && cameraError && !scanResult && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-[#8a6d3b] text-white p-3 rounded-xl text-xs flex items-center gap-2 font-medium shadow-sm">
              <AlertCircle size={14} className="shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Results Outcome Displays */}
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 space-y-4 p-5 bg-white rounded-2xl max-w-sm border border-[#e5e4de]"
              id="camera-scan-result-card"
            >
              <div>
                <span className="text-[#8e8d82] text-[11px] uppercase tracking-wider font-semibold block">面相與神經元情緒偵測結果</span>
                <span className="text-[#3d3d2e] text-base font-bold mt-1 block">目前狀態：
                  {scanResult === 'happy' && (
                    <span className="text-emerald-700 font-serif font-extrabold flex items-center justify-center gap-1.5 mt-2">
                      <Smile size={24} /> 開心面容
                    </span>
                  )}
                  {scanResult === 'neutral' && (
                    <span className="text-neutral-700 font-serif font-extrabold flex items-center justify-center gap-1.5 mt-2">
                      <Meh size={24} /> 平靜沉穩
                    </span>
                  )}
                  {scanResult === 'sad' && (
                    <span className="text-[#8a6d3b] font-serif font-extrabold flex items-center justify-center gap-1.5 mt-2" id="sad-status-result">
                      <Frown size={24} /> 不開心
                    </span>
                  )}
                </span>
              </div>

              {scanResult === 'sad' && (
                <div className="bg-[#f5f5f0] border border-[#e5e4de] text-[#2c2c2c] p-4 rounded-xl text-xs space-y-3" id="unhappy-action-card">
                  <p className="font-serif font-bold text-sm leading-relaxed text-[#3d3d2e] inline-block">
                    是否需要陪伴聊天？
                  </p>
                  <button
                    type="button"
                    id="trigger-chat-btn"
                    onClick={onStartChat}
                    className="w-full bg-[#8a6d3b] hover:bg-[#725a31] text-white py-2 px-4 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
                  >
                    <MessageCircle size={14} />
                    <span>即刻進入陪伴聊天室</span>
                  </button>
                </div>
              )}

              {scanResult === 'happy' && (
                <div className="bg-[#f5f5f0] border border-[#e5e4de] text-[#2c2c2c] p-4 rounded-xl text-xs space-y-3" id="happy-action-card">
                  <p className="font-serif font-bold text-sm leading-relaxed text-emerald-800 inline-block">
                    有開心的事物要跟我一起分享嗎！
                  </p>
                  <button
                    type="button"
                    id="trigger-chat-btn-happy"
                    onClick={onStartChat}
                    className="w-full bg-[#5A5A40] hover:bg-[#4a4a35] text-white py-2 px-4 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
                  >
                    <MessageCircle size={14} />
                    <span>分享喜悅、進入對話</span>
                  </button>
                </div>
              )}

              {scanResult === 'neutral' && (
                <div className="bg-[#f5f5f0] border border-[#e5e4de] text-neutral-700 p-4 rounded-xl text-xs space-y-3">
                  <p className="font-serif font-medium text-xs text-[#3d3d2e]">
                    氣色很平靜沉穩！有需要的話也可以隨時找我聊天。
                  </p>
                  <button
                    type="button"
                    onClick={onStartChat}
                    className="w-full bg-[#5A5A40] hover:bg-[#4a4a35] text-white py-2 px-4 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>開啟陪伴聊天室</span>
                  </button>
                </div>
              )}

              {/* Demo Override Panel to allow reviewers/user to test other states */}
              <div className="pt-2.5 border-t border-[#e5e4de] space-y-1.5">
                <span className="text-[10px] text-[#8e8d82] block">模擬特定表情結果測試：</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScanResult('happy')}
                    className={`py-1 px-2 rounded-full text-[10px] font-medium transition cursor-pointer ${
                      scanResult === 'happy' ? 'bg-[#5A5A40] text-white' : 'bg-[#f5f5f0] text-[#8e8d82] hover:bg-[#e5e4de]'
                    }`}
                  >
                    😊 開心
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanResult('neutral')}
                    className={`py-1 px-2 rounded-full text-[10px] font-medium transition cursor-pointer ${
                      scanResult === 'neutral' ? 'bg-[#5A5A40] text-white' : 'bg-[#f5f5f0] text-[#8e8d82] hover:bg-[#e5e4de]'
                    }`}
                  >
                    😐 平靜
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanResult('sad')}
                    className={`py-1 px-2 rounded-full text-[10px] font-medium transition cursor-pointer ${
                      scanResult === 'sad' ? 'bg-[#8a6d3b] text-white' : 'bg-[#f5f5f0] text-[#8e8d82] hover:bg-[#e5e4de]'
                    }`}
                  >
                    😢 不開心
                  </button>
                </div>
              </div>

              <button
                type="button"
                id="camera-re-scan-btn"
                onClick={handleStartCamera}
                className="text-[#8e8d82] hover:text-[#5A5A40] text-xs font-semibold flex items-center justify-center gap-1 mx-auto mt-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                <span>重新掃描分析</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasStarted && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            id="camera-turnoff-btn"
            onClick={handleManualReset}
            className="text-xs text-[#8e8d82] hover:text-[#8a6d3b] transition-colors flex items-center gap-1 py-1 px-2 hover:bg-[#f5f5f0] rounded-full cursor-pointer"
          >
            <VideoOff size={13} />
            <span>關閉偵測介面</span>
          </button>
        </div>
      )}
    </div>
  );
}
