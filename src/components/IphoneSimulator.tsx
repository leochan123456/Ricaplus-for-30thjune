import React, { useState, useEffect, useRef } from 'react';
import { 
  Clipboard, Send, Copy, AlertCircle, Bot, MessageSquare, ThumbsUp, ThumbsDown,
  Mic, Settings, Globe, ShieldAlert, Image, Camera, Paperclip, Check, Play,
  Share2, ChevronRight, X, Sparkles, RefreshCw, AlertTriangle, FileText
} from 'lucide-react';
import { TRUE_PRICE_DATABASE } from '../presets';

interface IphoneSimulatorProps {
  activePresetId: number;
  onPresetChange: (presetId: number) => void;
  triggerGlobalNotification: (title: string, message: string, icon: string, type: 'info' | 'success' | 'error') => void;
}

const SIMULATED_VOICE_TRANSCRIPTS = [
  "堅尼地城 嘉輝花園 C座, 2房, 實用310呎, 業主急走減價, 叫1.3萬, 5分鐘到地鐵站, 物業編號: AH2023101",
  "啟德 地鐵站旁優質收租盤, 實用480呎, 租金回報高, 叫租1.95萬, 景觀開揚, 物業編號: KT-1122-RE",
  "北角 城市花園 高層海景, 3房, 實用810呎, 業主求售, 叫價1020萬, 鄰近地鐵站, 物業編號: NP202606"
];

// Sample uploaded files/photos
interface MediaFile {
  id: string;
  type: 'photo' | 'document' | 'video';
  name: string;
  url?: string;
}

export default function IphoneSimulator({ 
  activePresetId, 
  onPresetChange, 
  triggerGlobalNotification 
}: IphoneSimulatorProps) {
  
  // Conversational state
  const [chaosInput, setChaosInput] = useState<string>(
    "堅尼地城 嘉輝花園 C座, 2房, 實用310呎, 業主急走減價, 叫1.3萬, 5分鐘地鐵C出口, 物業編號: AH2023101"
  );
  
  // Microphone recording simulation state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceIndex, setVoiceIndex] = useState<number>(0);

  // Parsed and generated states
  const [parsedPrice, setParsedPrice] = useState<number>(13000);
  const [parsedArea, setParsedArea] = useState<number>(310);
  const [parsedPropID, setParsedPropID] = useState<string>("AH2023101");
  const [parsedLandmark, setParsedLandmark] = useState<string>("堅尼地城");
  const [selectedLanguage, setSelectedLanguage] = useState<'zh-Hant-HK' | 'zh-Hans'>('zh-Hant-HK');
  const [hasMediaFiles, setHasMediaFiles] = useState<boolean>(true);

  // Media upload state
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([
    { id: '1', type: 'photo', name: '客廳實景.jpg', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&auto=format&fit=crop&q=60' }
  ]);

  // Video Generator simulation
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [generatedVideoScript, setGeneratedVideoScript] = useState<string>("");

  // Direct Telegram Connection API state (Stored in localStorage)
  const [telegramBotToken, setTelegramBotToken] = useState<string>(() => {
    return localStorage.getItem('rica_tg_bot_token') || '789123456:AAFlk_ExampleTokenHere_1234';
  });
  const [telegramChatId, setTelegramChatId] = useState<string>(() => {
    return localStorage.getItem('rica_tg_chat_id') || '-10022334455';
  });
  const [showTgConfig, setShowTgConfig] = useState<boolean>(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);

  // Chat message thread simulation to act like an AI Agent / Chatbot
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'assistant',
      text: "您好！我是您的 Rica+ 智能合規中介助理。請在下方輸入或用語音說出房源資料。我會自動為您檢測、過濾引流敏感詞，並產生 100% 符合地監局（EAA）守則的推廣文案！",
      timestamp: '19:27',
      selectedDraft: 'A',
      drafts: {
        A: "您好！我是您的 Rica+ 智能合規中介助理。請在下方輸入或用語音說出房源資料。我會自動為您檢測、過濾引流敏感詞，並產生 100% 符合地監局（EAA）守則的推廣文案！",
        B: "哈囉！Rica+ 安全助理在線。無論是住宅還是商鋪，輸入幾句原始筆記，即刻產出合規高流量文案。支援 40% 的房源成交偏差防護喔！"
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save Telegram config to local storage
  const handleSaveTgConfig = () => {
    localStorage.setItem('rica_tg_bot_token', telegramBotToken);
    localStorage.setItem('rica_tg_chat_id', telegramChatId);
    setShowTgConfig(false);
    triggerGlobalNotification(
      "設定已儲存",
      "Telegram Bot API 設定已安全儲存於本地！",
      "check",
      "success"
    );
  };

  // Auto-parse raw listings when input changes
  useEffect(() => {
    if (!chaosInput.trim()) return;

    // 1. Extract Price
    let price = 13000;
    const tenKMatch = chaosInput.match(/(\d+(?:\.\d+)?)\s*萬/);
    const rawNumMatch = chaosInput.match(/(?:叫|租|售|價|意向|h|hkd)\s*[:：\s]*(\d{4,9})/i);
    const anyBigNumMatch = chaosInput.match(/(\d{4,9})/);
    
    if (tenKMatch) {
      price = parseFloat(tenKMatch[1]) * 10000;
    } else if (rawNumMatch) {
      price = parseFloat(rawNumMatch[1]);
    } else if (anyBigNumMatch) {
      price = parseFloat(anyBigNumMatch[1]);
    } else {
      const shortMatch = chaosInput.match(/(\d+(?:\.\d+)?)/);
      if (shortMatch) {
        const val = parseFloat(shortMatch[1]);
        if (val < 1000) {
          price = val * 10000;
        }
      }
    }
    setParsedPrice(price);

    // 2. Extract Area
    let area = 310;
    const areaMatch = chaosInput.match(/(\d+)\s*(?:呎|sqft|平方)/i);
    if (areaMatch) {
      area = parseInt(areaMatch[1], 10);
    }
    setParsedArea(area);

    // 3. Extract Property ID
    let propID = "AH2023101";
    const propMatch = chaosInput.match(/([A-Z]{2,3}[0-9\-]{4,9}|[A-Z]{2}\-[0-9]{4}\-[A-Z]{2})/i);
    if (propMatch) {
      propID = propMatch[1].toUpperCase();
    }
    setParsedPropID(propID);

    // 4. Extract Landmark
    let landmark = "堅尼地城";
    const landmarks = ["堅尼地城", "啟德", "太古城", "日出康城", "東涌", "奧運站", "北角"];
    for (const lm of landmarks) {
      if (chaosInput.includes(lm)) {
        landmark = lm;
        break;
      }
    }
    setParsedLandmark(landmark);

  }, [chaosInput]);

  // Compute compliance and output based on parsed states (Deviation threshold updated to 40%)
  const computeCompliance = (draftVersion: 'A' | 'B' = 'A') => {
    let marketAvg = 18000;
    const matchedKey = Object.keys(TRUE_PRICE_DATABASE).find(key => 
      key.includes(parsedLandmark)
    );
    if (matchedKey) {
      marketAvg = TRUE_PRICE_DATABASE[matchedKey].avgPrice;
    }

    let deviation = 0;
    let deviationViolation = false;
    if (parsedPrice > 0 && marketAvg > 0) {
      deviation = Math.abs(parsedPrice - marketAvg) / marketAvg;
      if (deviation > 0.40) { // Safety deviation limit changed from 20% to 40% as requested!
        deviationViolation = true;
      }
    }

    let filteredText = chaosInput;
    const filteredWords: string[] = [];
    const wechatRegex = /(微信|vx|vx_|微訊號|微訊|v信|v❤️|wechat|wechatid|v:)\s*[:：\-\s]*[a-zA-Z0-9_\-]{4,25}/ig;
    const phoneRegex = /(電話|手機|手提|聯絡|whatsapp|whats|tel|phone|contact)\s*[:：\-\s]*\+?[0-9\-\s]{8,15}/ig;

    if (wechatRegex.test(filteredText)) {
      filteredWords.push("WeChat ID Handle");
      filteredText = filteredText.replace(wechatRegex, "【點擊頭像私信我】");
    }
    if (phoneRegex.test(filteredText)) {
      filteredWords.push("Phone / WhatsApp Contact");
      filteredText = filteredText.replace(phoneRegex, "【點擊主頁瞬間打卡諮詢】");
    }

    const today = new Date().toISOString().split('T')[0];
    const legalPreamble = `利嘉閣地產有限公司（牌照號碼：C-001702）\n廣告發布日期：${today}\n`;
    
    let copywriting = "";
    if (deviationViolation) {
      copywriting = `⚠️ 【合規阻斷：價格偏差過大】\n系統偵測到您申報的意向租金/售價 (HK$ ${parsedPrice.toLocaleString()}) 與市場成交均價 (HK$ ${marketAvg.toLocaleString()}) 偏差高達 ${(deviation * 100).toFixed(1)}%（已大於 40% 法定上限）。\n\n根據地產代理監管局 (EAA) 執業通告 18-02(CR) 規限，此文案已自動鎖死，請立刻核對並輸入真實售價。`;
    } else {
      const formattedPrice = parsedPrice >= 100000 ? `意向售價：HK$ ${(parsedPrice / 10000).toFixed(0)} 萬` : `意向月租：HK$ ${parsedPrice.toLocaleString()} /月`;
      const formattedArea = parsedArea > 0 ? `實用面積：約 ${parsedArea} 平方呎` : "";
      const formattedPropID = `物業編號：${parsedPropID}`;

      if (selectedLanguage === 'zh-Hant-HK') {
        if (draftVersion === 'A') {
          copywriting = `🏡 【Rica+ 100% 真盤源精選 - 專業版】\n\n🎯 專屬地標：鄰近 ${parsedLandmark} 交通網配套，極速開單爆數首選！\n📈 物業優勢：呢個單位間隔實用，通風採光極佳，生活配套非常便利，不容錯過啦喔！\n\n📌 核心物業詳情：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n`;
        } else {
          copywriting = `🔥 【${parsedLandmark} 限時爆款盤！業主急讓】\n\n⚡️ 震撼放盤：鄰近地鐵，交通超方便！間隔見使，企理裝修，即租即住！\n💰 超值筍盤詳情：\n💥 ${formattedPrice}\n📐 ${formattedArea}\n🔢 ${formattedPropID}\n\n`;
        }
      } else {
        if (draftVersion === 'A') {
          copywriting = `🎓 【Rica+ 港漂专才/新生租房精选 - 舒适版】\n\n🎯 地标指引：下楼即达 ${parsedLandmark}，步行或地铁轻松直达！配套完善，生活商圈尽在咫尺。\n📈 房源看点：高层采光极佳，全新极简装修风格，支持拎包入住！和小伙伴合租首选，无中介费真盘源！\n\n📌 核心房源详情：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n`;
        } else {
          copywriting = `🌟 【港漂看过来！${parsedLandmark} 优质两房首发】\n\n🚇 交通极便，学区生活商圈覆盖！业主非常nice，可随时约看。\n📌 独家详情：\n👉 ${formattedPrice}\n👉 ${formattedArea}\n👉 ${formattedPropID}\n\n`;
        }
      }

      if (!hasMediaFiles) {
        copywriting += `🛠️ 【專業驗樓及規劃避坑指南】\n1. 門框腳發黑：睇樓時注意浴室門框腳，若發黑代表防水層失效，地台已滲水！\n2. 防煙門底隙：必須符合法定 4mm 限制，需配備膨脹膠條！\n\n`;
      }

      copywriting += `💬 ${filteredText}\n\n`;
      copywriting += `---\n${legalPreamble}`;
    }

    return {
      copywriting,
      passed: !deviationViolation,
      priceDeviation: Math.round(deviation * 100),
      priceDeviationViolation: deviationViolation,
      redirectFiltered: filteredWords.length > 0,
      filteredWords,
      marketAvg
    };
  };

  const compliance = computeCompliance('A');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulated Media upload triggers
  const triggerPhotoUpload = () => {
    const newFile: MediaFile = {
      id: Date.now().toString(),
      type: 'photo',
      name: `室內相片_${uploadedFiles.length + 1}.png`,
      url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=150&auto=format&fit=crop&q=60'
    };
    setUploadedFiles(prev => [...prev, newFile]);
    triggerGlobalNotification("相片上傳成功", "AI已自動調整對比度並嵌入「利嘉閣 100% 真盤源」水印防護！", "image", "success");
  };

  const triggerCamera = () => {
    const newFile: MediaFile = {
      id: Date.now().toString(),
      type: 'photo',
      name: `現場實拍_${uploadedFiles.length + 1}.png`,
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=60'
    };
    setUploadedFiles(prev => [...prev, newFile]);
    triggerGlobalNotification("現場拍照錄入", "實景照片加載成功，地產編號浮水印合成完畢！", "camera", "success");
  };

  const triggerDocument = () => {
    const newFile: MediaFile = {
      id: Date.now().toString(),
      type: 'document',
      name: `放盤授權書_AH2023.pdf`
    };
    setUploadedFiles(prev => [...prev, newFile]);
    triggerGlobalNotification("合規授權文件", "地監局書面放盤授權書（Form 3）已安全關聯！", "file-text", "success");
  };

  const deleteUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    triggerGlobalNotification("檔案已移除", "附件已取消關聯。", "info", "info");
  };

  const generateAIWalkthroughVideo = () => {
    const script = `🎬 【利嘉閣 Rica+ AI 智能短影音生成腳本】\n\n` +
      `[第0-3秒] 📌 黃金開頭：鏡頭展示 ${parsedLandmark} 景觀。配樂：輕快時尚。字幕：「${parsedLandmark} 罕有超高CP值真盤源，秒殺放租！」\n` +
      `[第3-8秒] 🏡 室內大特寫：展示 ${parsedArea} 平方呎極見使格局。旁白：「實用面積 ${parsedArea} 呎，大房大廳採光超正！」\n` +
      `[第8-12秒] 🚇 交通點：特寫地鐵站出口。旁白：「行路去港鐵站僅需 ${parsedLandmark === '堅尼地城' ? '5分鐘' : '數分鐘'}，返工返學交通極速！」\n` +
      `[第12-15秒] 💰 震撼叫價：大字特效。字幕：「意向租金：$${parsedPrice.toLocaleString()}/月！物業編號：${parsedPropID}，火速私聊預約看房！」`;

    setGeneratedVideoScript(script);
    setShowVideoModal(true);
    triggerGlobalNotification("短視頻腳本生成", "AI 智能帶看短片分鏡腳本生成完畢！", "sparkles", "success");
  };

  const handleSendListing = () => {
    if (!chaosInput.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chaosInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const resultsA = computeCompliance('A');
      const resultsB = computeCompliance('B');
      let assistantMsgText = "";

      if (resultsA.priceDeviationViolation) {
        assistantMsgText = `❌ 【合規阻斷：安全防護網攔截】\n\n偵測到申報價 HK$ ${parsedPrice.toLocaleString()} 與真實成交價 HK$ ${resultsA.marketAvg.toLocaleString()} 偏差高達 ${resultsA.priceDeviation}%！已觸發安全紅線。為保障交易安全，複製與發布已被鎖定。`;
      } else {
        assistantMsgText = `✅ 【EAA 合規審核通過 • 100% 真盤源】\n\n- 市場估值均價：HK$ ${resultsA.marketAvg.toLocaleString()}\n- 價格偏差比例：${resultsA.priceDeviation}% (安全範圍 ✅)\n- 已過濾站外引流字眼：${resultsA.redirectFiltered ? '已過濾聯絡資訊 ✅' : '未發現違規資訊 ✅'}\n- 地監局牌照資訊：已自動嵌入完畢 ✅\n\n您的宣傳文案已包裝完成，您可以使用下方 Draft 欄切換不同風格！`;
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: assistantMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        copywriting: resultsA.copywriting,
        passed: resultsA.passed,
        selectedDraft: 'A',
        drafts: {
          A: resultsA.copywriting,
          B: resultsB.copywriting
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      if (resultsA.passed) {
        triggerGlobalNotification("審查通過", "已產出最高發布級別之合規推廣草稿！", "check-circle", "success");
      } else {
        triggerGlobalNotification("合規阻斷", "叫價偏差大於 40%，已觸發安全鎖死機制。", "lock", "error");
      }
    }, 800);
  };

  const handleMicrophoneClick = () => {
    if (isRecording) return;

    setIsRecording(true);
    triggerGlobalNotification("正在錄音...", "Rica+ 正在聆聽您的語音放盤指令...", "mic", "info");

    setTimeout(() => {
      setIsRecording(false);
      const nextTranscript = SIMULATED_VOICE_TRANSCRIPTS[voiceIndex];
      setChaosInput(nextTranscript);
      setVoiceIndex((prev) => (prev + 1) % SIMULATED_VOICE_TRANSCRIPTS.length);
      
      triggerGlobalNotification("語音識別成功", "原始房源描述已成功錄入，正在進行合規審查...", "check-circle", "success");
    }, 2000);
  };

  const handleCopyClick = () => {
    if (compliance.priceDeviationViolation) {
      triggerGlobalNotification(
        "複製被拒",
        "由於叫價偏差異常，合規模組已阻斷剪貼簿寫入！",
        "lock",
        "error"
      );
      return;
    }

    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'assistant' && m.copywriting);
    const textToCopy = lastBotMessage 
      ? lastBotMessage.drafts[lastBotMessage.selectedDraft || 'A'] 
      : compliance.copywriting;

    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = textToCopy;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);

    triggerGlobalNotification(
      "文案已複製",
      "Rica+ 合規推廣草稿已成功寫入您的手機剪貼簿！",
      "clipboard-check",
      "success"
    );
  };

  // Direct Send to Telegram Bot via Real Bot API Fetch
  const handleDirectTelegramSend = async () => {
    const token = telegramBotToken.trim();
    const chatId = telegramChatId.trim();

    if (!token || !chatId || token.includes('ExampleTokenHere')) {
      setShowTgConfig(true);
      triggerGlobalNotification("設定未完成", "請先點擊右上角設定圖示配置您的 Telegram Bot Token 及 Chat ID", "lock", "error");
      return;
    }

    setIsSendingTelegram(true);
    try {
      const lastBotMessage = [...messages].reverse().find(m => m.sender === 'assistant' && m.copywriting);
      const textToCopy = lastBotMessage 
        ? lastBotMessage.drafts[lastBotMessage.selectedDraft || 'A'] 
        : compliance.copywriting;

      const textToSend = `<b>【Rica+ 經紀安全文案轉發】</b>\n\n${textToCopy}`;
      
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textToSend,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      if (data.ok) {
        triggerGlobalNotification(
          "TG 直接發送成功！", 
          "文案已藉由 Rica+ API 直達您的 Telegram 群組/頻道！", 
          "send", 
          "success"
        );
      } else {
        const fallbackResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: textToCopy
          })
        });
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.ok) {
          triggerGlobalNotification(
            "TG 純文字發送成功", 
            "格式已轉換並安全送達！", 
            "send", 
            "success"
          );
        } else {
          throw new Error(data.description || fallbackData.description || "API Error");
        }
      }
    } catch (error: any) {
      console.error(error);
      triggerGlobalNotification(
        "發送失敗", 
        `Telegram API 回報錯誤: ${error.message || error}`, 
        "alert-triangle", 
        "error"
      );
    } finally {
      setIsSendingTelegram(false);
    }
  };

  // Handle specific message copy
  const handleCopySpecificMessage = (text: string) => {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    triggerGlobalNotification("複製成功", "該段文字已成功複製！", "check", "success");
  };

  // Switch draft version for a specific message
  const handleSwitchDraft = (messageId: number, draftKey: 'A' | 'B') => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return { 
          ...m, 
          selectedDraft: draftKey,
          text: m.drafts[draftKey] 
        };
      }
      return m;
    }));
    triggerGlobalNotification("文案風格切換", `已切換至風格 ${draftKey === 'A' ? 'A (專業版)' : 'B (宣傳吸睛版)'}`, "sparkles", "success");
  };

  // Reply button simulator
  const handleReplyMessage = (quoteText: string) => {
    setChaosInput(`回覆關於："${quoteText.substring(0, 20)}..." `);
    triggerGlobalNotification("已引入回覆引用", "請在輸入框接續輸入您的指引", "message-square", "info");
  };

  return (
    <div className="w-full h-full sm:h-[820px] bg-white sm:border sm:border-slate-200 sm:rounded-3xl sm:shadow-xl flex flex-col overflow-hidden text-slate-800 relative">
      
      {/* Sticky App Header */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/60 shadow-xs shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">
            R+
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-950">Rica+ 智能合規中介助手</span>
              <span className="text-[9px] bg-amber-100 text-[#FF6600] px-1.5 py-0.5 rounded-sm font-bold">Bot v4.7</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">利嘉閣前線持牌代理協同終端</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowTgConfig(!showTgConfig)}
            className="p-1.5 hover:bg-slate-100 rounded-full transition"
            title="配置 Telegram 機器人"
          >
            <Settings className="w-5 h-5 text-slate-500 hover:text-[#FF6600]" />
          </button>
          <span className="text-[10px] font-extrabold text-[#006633] bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
            100% 真盤源
          </span>
        </div>
      </div>

      {/* Telegram Config Panel Overlay */}
      {showTgConfig && (
        <div className="absolute inset-x-3 top-16 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 animate-slide-in space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Bot className="w-4 h-4 text-sky-500" /> Telegram 直發 API 設定
            </span>
            <button onClick={() => setShowTgConfig(false)} className="text-[11px] text-slate-400 font-bold">關閉</button>
          </div>
          <div className="space-y-2.5 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Bot Token (從 @BotFather 取得)</label>
              <input 
                type="text"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="E.g. 789123456:AAFlk..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">頻道/群組 Chat ID (例如 -100...)</label>
              <input 
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="E.g. -10022334455"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <p className="text-[9px] text-slate-400 leading-normal">
              💡 <strong>提示：</strong>在 Telegram 搜尋 @BotFather 申請 Bot，並將您的 Bot 加入推廣群組為管理員，獲取群組 Chat ID 填入此處，即可實現在戶外直接安全一鍵分發！
            </p>
            <button 
              onClick={handleSaveTgConfig}
              className="w-full py-2 bg-[#FF6600] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              儲存設定
            </button>
          </div>
        </div>
      )}

      {/* 3. Conversational Chat Message Window */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4 bg-[#F2F2F7]">
        
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <span className="text-[9px] text-slate-400 px-1 font-semibold">
              {m.sender === 'assistant' ? '🤖 Rica+ AI 合規助理' : '📱 原始輸入'}
            </span>

            <div className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed font-medium shadow-xs text-left ${
              m.sender === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-xs' 
                : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-xs'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.copywriting && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded">
                    <span>📝 100% 地監局合規文案草稿</span>
                    <span className="text-emerald-600 font-bold">已通過 {compliance.priceDeviation}% 偏差審查 (上限40%)</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-mono text-[10px] text-slate-700 leading-normal select-text max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                    {m.copywriting}
                  </div>
                </div>
              )}
            </div>

            {/* Gemini-Inspired Interactive Toolbar under Bot's Response */}
            {m.sender === 'assistant' && (
              <div className="flex items-center justify-between w-full max-w-[92%] px-1 pt-0.5">
                {/* Alternative Draft Branch Switcher */}
                {m.drafts ? (
                  <div className="flex items-center space-x-1.5 bg-slate-200/60 p-0.5 rounded-md text-[9px] font-bold text-slate-600">
                    <button 
                      onClick={() => handleSwitchDraft(m.id, 'A')}
                      className={`px-1.5 py-0.5 rounded transition ${m.selectedDraft === 'A' ? 'bg-white text-slate-900 shadow-3xs' : 'hover:text-slate-900'}`}
                    >
                      風格 A (專業)
                    </button>
                    <button 
                      onClick={() => handleSwitchDraft(m.id, 'B')}
                      className={`px-1.5 py-0.5 rounded transition ${m.selectedDraft === 'B' ? 'bg-white text-slate-900 shadow-3xs' : 'hover:text-slate-900'}`}
                    >
                      風格 B (吸睛)
                    </button>
                  </div>
                ) : <div />}

                {/* Quick actions row */}
                <div className="flex items-center space-x-2 text-slate-400">
                  {/* Copy button */}
                  <button 
                    onClick={() => handleCopySpecificMessage(m.text)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition"
                    title="複製此回覆"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Reply Follow up */}
                  <button 
                    onClick={() => handleReplyMessage(m.text)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition flex items-center gap-0.5"
                    title="引用回覆"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold">引用</span>
                  </button>

                  {/* Thumbs Feedback */}
                  <button 
                    onClick={() => triggerGlobalNotification("感謝回饋", "Rica+ 學習模型已獲取您的正面標籤！", "thumbs-up", "success")}
                    className="p-1 hover:bg-slate-200 rounded hover:text-emerald-600 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => triggerGlobalNotification("感謝回饋", "Rica+ 學習模型已標記此生成瑕疵並提交修正！", "thumbs-down", "error")}
                    className="p-1 hover:bg-slate-200 rounded hover:text-rose-600 transition"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            
            <span className="text-[8px] text-slate-400 px-1 font-mono">{m.timestamp}</span>
          </div>
        ))}

        {/* Price deviation visual check box (Threshold is 40%) */}
        {compliance.priceDeviationViolation && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-rose-800 space-y-1 animate-pulse text-left">
            <div className="flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-[10px] font-bold">合規安全防線已觸發！</span>
            </div>
            <p className="text-[9px] text-rose-700 leading-normal">
              叫價 HK$ {parsedPrice.toLocaleString()} 與市場成交平均價 (HK$ {compliance.marketAvg.toLocaleString()}) 偏差高達 <strong>{compliance.priceDeviation}%</strong>，已突破 <strong>40%</strong> 法定安全上限！
            </p>
          </div>
        )}

        {/* Real-time media attachments display inside the chat thread */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white/80 border border-slate-200/60 rounded-2xl p-3 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                📎 已關聯房源媒體與合規附件 ({uploadedFiles.length})
              </span>
              <button 
                onClick={generateAIWalkthroughVideo}
                className="text-[9px] font-extrabold text-[#FF6600] bg-[#FF6600]/10 px-2 py-0.5 rounded hover:bg-[#FF6600]/20 flex items-center gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5" /> 生成 AI 短片帶看
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group bg-slate-100 border border-slate-200 p-1.5 rounded-lg flex items-center space-x-1.5">
                  {file.type === 'photo' && file.url ? (
                    <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#FF6600]" />
                  )}
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-slate-700 truncate max-w-[80px]">{file.name}</p>
                    <p className="text-[8px] text-slate-400 capitalize">{file.type === 'photo' ? '實景浮水印已加' : '合規授權文件'}</p>
                  </div>
                  <button 
                    onClick={() => deleteUploadedFile(file.id)}
                    className="p-0.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isRecording && (
          <div className="bg-[#FF6600]/5 border border-[#FF6600]/30 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 animate-pulse">
            <Mic className="w-6 h-6 text-[#FF6600] animate-bounce" />
            <span className="text-xs font-extrabold text-[#FF6600]">正在錄音並進行語音辨識...</span>
            <div className="flex space-x-1">
              <span className="w-1.5 h-3 bg-[#FF6600] rounded-full animate-pulse"></span>
              <span className="w-1.5 h-5 bg-[#FF6600] rounded-full animate-pulse delay-75"></span>
              <span className="w-1.5 h-4 bg-[#FF6600] rounded-full animate-pulse delay-150"></span>
              <span className="w-1.5 h-6 bg-[#FF6600] rounded-full animate-pulse delay-75"></span>
              <span className="w-1.5 h-3 bg-[#FF6600] rounded-full animate-pulse"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Walkthrough Video Modal Simulator */}
      {showVideoModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative text-left">
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center space-x-2 text-[#FF6600]">
              <Play className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-sm">利嘉閣 Rica+ AI 智能短片帶看劇本</h3>
            </div>
            <p className="text-[9px] text-slate-400">已自動擷取實景相片特徵與叫價，產出適合抖音/小紅書/Reels 帶貨發布腳本：</p>
            <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-3 rounded-xl max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {generatedVideoScript}
            </div>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => {
                  handleCopySpecificMessage(generatedVideoScript);
                  setShowVideoModal(false);
                }}
                className="flex-1 py-2 bg-[#FF6600] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs"
              >
                <Clipboard className="w-3.5 h-3.5" /> 複製影片劇本
              </button>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Input reminder zone */}
      <div className="bg-amber-50 border-t border-b border-amber-200/50 px-4 py-2 text-[10px] text-amber-900 leading-relaxed font-semibold text-left">
        💡 <strong>前線代理提示：</strong> 請輸入或用語音說出放盤資訊。
        例如：『西區 嘉輝花園、2房、實用310呎、叫租1.3萬、物業編號 AH2023101』
      </div>

      {/* 5. Conversational Bot Control Inputs (Gemini Inspired with Attachment options inside) */}
      <div className="bg-white p-3 border-t border-slate-200/60 space-y-2.5 shrink-0">
        
        {/* Attachment Options panel & Target languages */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Language selection toggles */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg flex-1">
            <button 
              onClick={() => {
                setSelectedLanguage('zh-Hant-HK');
                triggerGlobalNotification("語系切換", "已切換為本地廣東話(粵語)格式文案", "globe", "success");
              }}
              className={`flex-1 text-[9px] py-1 px-1 rounded-md font-extrabold transition-all ${
                selectedLanguage === 'zh-Hant-HK' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500'
              }`}
            >
              🇭🇰 廣東話推廣
            </button>
            <button 
              onClick={() => {
                setSelectedLanguage('zh-Hans');
                triggerGlobalNotification("語系切換", "已切換為港漂專才簡體格式文案", "globe", "success");
              }}
              className={`flex-1 text-[9px] py-1 px-1 rounded-md font-extrabold transition-all ${
                selectedLanguage === 'zh-Hans' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500'
              }`}
            >
              🇨🇳 港漂簡體
            </button>
          </div>

          {/* Media Attachments Action List */}
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={triggerCamera}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition"
              title="現場相機拍照"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600 hover:text-[#FF6600]" />
            </button>
            <button 
              onClick={triggerPhotoUpload}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition"
              title="上傳相片"
            >
              <Image className="w-3.5 h-3.5 text-slate-600 hover:text-[#FF6600]" />
            </button>
            <button 
              onClick={triggerDocument}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition"
              title="關聯授權文件"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-600 hover:text-[#FF6600]" />
            </button>
          </div>
        </div>

        {/* Unified Raw Listing / Chaos Text Input area with Voice Microphone integrated */}
        <div className="flex items-center space-x-2">
          {/* Simulated Voice Microphone Button */}
          <button 
            onClick={handleMicrophoneClick}
            disabled={isRecording}
            className={`p-3 rounded-xl flex items-center justify-center transition shrink-0 shadow-sm ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-[#FF6600]/10 hover:bg-[#FF6600]/20 text-[#FF6600]'
            }`}
            title="語音模擬錄入"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Main Chat message area */}
          <div className="flex-1 relative">
            <input 
              type="text"
              value={chaosInput}
              onChange={(e) => setChaosInput(e.target.value)}
              placeholder="在此輸入原始放盤描述（如：叫1.3萬）"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-16 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6600] placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendListing();
                }
              }}
            />
            
            {/* Direct TG send is styled very small and placed elegantly next to send inside input */}
            <div className="absolute right-1.5 top-1.5 flex items-center space-x-1">
              <button 
                onClick={handleDirectTelegramSend}
                disabled={isSendingTelegram}
                className="p-1 bg-sky-100 text-sky-600 rounded-md hover:bg-sky-200 transition"
                title="直發 TG"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleSendListing}
                className="p-1 bg-[#FF6600] text-white rounded-md hover:bg-[#e05300] transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dual Primary Action Buttons: Copy Draft + Share to iPhone */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button 
            onClick={handleCopyClick}
            disabled={compliance.priceDeviationViolation}
            className={`py-3 px-3 rounded-xl text-xs font-black text-white shadow-md transition duration-200 flex items-center justify-center space-x-1 ${
              compliance.priceDeviationViolation 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-[#FF6600] shadow-[#FF6600]/20 hover:bg-[#e05300] active:scale-[0.98]'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>一鍵複製文案</span>
          </button>

          <button 
            onClick={() => {
              if (compliance.priceDeviationViolation) {
                triggerGlobalNotification("分享被拒", "文案叫價偏差異常，已阻斷分享！", "lock", "error");
              } else {
                setShowShareSheet(true);
              }
            }}
            disabled={compliance.priceDeviationViolation}
            className={`py-3 px-3 rounded-xl text-xs font-black text-white shadow-md transition duration-200 flex items-center justify-center space-x-1 ${
              compliance.priceDeviationViolation 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>一鍵分享文案</span>
          </button>
        </div>

        {/* Small licensing compliance banner */}
        <div className="text-[8px] text-slate-400 text-center font-mono pt-0.5">
          EAA CIRCULAR 18-02(CR) • Rica+ COMPLIANCE SECURE SHIELD
        </div>

      </div>

      {/* 7. Sliding iOS Share Sheet Overlay */}
      {showShareSheet && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-end justify-center rounded-3xl" onClick={() => setShowShareSheet(false)}>
          <div 
            className="w-full bg-white/95 backdrop-blur-2xl rounded-t-3xl p-4 shadow-2xl space-y-4 animate-slide-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest">Rica+ 智能分享及分發 API</p>
              <p className="text-[9px] text-slate-500 font-bold">文案已安全校準。請選擇要發布的手機應用管道：</p>
            </div>

            {/* Share Channels */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 border-b border-slate-200/50">
              
              {/* Direct TG send with current active Draft content */}
              <button 
                onClick={() => {
                  setShowShareSheet(false);
                  handleDirectTelegramSend();
                }}
                className="flex flex-col items-center shrink-0 min-w-[75px] cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  TG API
                </div>
                <span className="text-[9px] text-slate-600 mt-1.5 font-bold">TG直發</span>
              </button>

              {/* Standard Telegram Share Link */}
              <a 
                href={`https://t.me/share/url?url=https://www.ricacorp.com&text=${encodeURIComponent(compliance.copywriting)}`}
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setShowShareSheet(false);
                  triggerGlobalNotification("Telegram 連結", "已開啟 Telegram 頻道轉發！", "send", "success");
                }}
                className="flex flex-col items-center shrink-0 min-w-[75px] cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-400 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  TG 分享
                </div>
                <span className="text-[9px] text-slate-600 mt-1.5 font-bold">TG 分享連結</span>
              </a>

              {/* Xiaohongshu copy-paste shortcut */}
              <div 
                onClick={() => {
                  setShowShareSheet(false);
                  triggerGlobalNotification("小紅書發布", "文案已安全寫入，打開小紅書即可粘貼推廣！", "sparkles", "success");
                }}
                className="flex flex-col items-center shrink-0 min-w-[75px] cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  RED
                </div>
                <span className="text-[9px] text-slate-600 mt-1.5 font-bold">小紅書</span>
              </div>

              {/* WhatsApp direct text API */}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(compliance.copywriting)}`}
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setShowShareSheet(false);
                  triggerGlobalNotification("WhatsApp", "已引導至 WhatsApp 對話分享！", "message-square", "success");
                }}
                className="flex flex-col items-center shrink-0 min-w-[75px] cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  WA
                </div>
                <span className="text-[9px] text-slate-600 mt-1.5 font-bold">WhatsApp</span>
              </a>

              {/* WeChat Moments helper */}
              <div 
                onClick={() => {
                  setShowShareSheet(false);
                  triggerGlobalNotification("微信分享", "文案已儲存。請打開微信並手動在朋友圈發布。", "check", "success");
                }}
                className="flex flex-col items-center shrink-0 min-w-[75px] cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  微信
                </div>
                <span className="text-[9px] text-slate-600 mt-1.5 font-bold">微信朋友圈</span>
              </div>

            </div>

            {/* Telegram Bot instruction */}
            <div className="bg-slate-50 rounded-xl p-2 text-[9px] text-slate-500 leading-normal border border-slate-100">
              💡 <strong>直發 API：</strong> 支援對接您配置的自定義 Bot 密鑰。可在右上角 ⚙️ 進行持久化設定，實現真正的自動化直傳發布。
            </div>

            <button 
              onClick={() => setShowShareSheet(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
