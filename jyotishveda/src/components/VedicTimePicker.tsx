import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, Check, X, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VedicTimePickerProps {
  value: string; // Stored format: 'HH:mm' (24-hour) or ''
  onChange: (timeStr: string) => void;
  disabled?: boolean;
  theme?: 'light' | 'dark';
  placeholder?: string;
  className?: string;
  id?: string;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const TIME_PRESETS = [
  { label: 'Dawn (Brahma)', time: '05:30', period: 'AM', desc: '05:30 AM' },
  { label: 'Morning', time: '09:00', period: 'AM', desc: '09:00 AM' },
  { label: 'Noon (Madhyahna)', time: '12:00', period: 'PM', desc: '12:00 PM' },
  { label: 'Afternoon', time: '15:30', period: 'PM', desc: '03:30 PM' },
  { label: 'Dusk (Sandhya)', time: '18:00', period: 'PM', desc: '06:00 PM' },
  { label: 'Night (Ratri)', time: '21:00', period: 'PM', desc: '09:00 PM' },
];

// Helper: parse 'HH:mm' or flexible typed time into { hour12, minute, ampm, valid }
const parseTimeTo12Hr = (timeStr: string): { hour12: number; minute: number; ampm: 'AM' | 'PM'; valid: boolean } => {
  if (!timeStr || !timeStr.trim()) {
    return { hour12: 12, minute: 0, ampm: 'AM', valid: false };
  }

  const str = timeStr.trim().toLowerCase();

  // 1. Check for explicit am/pm in string (e.g. "2:30 pm", "10:15am")
  const match12 = str.match(/^([01]?[0-9]):([0-5][0-9])\s*(am|pm)?$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const suffix = match12[3];

    if (suffix) {
      const ampm = suffix === 'pm' ? 'PM' : 'AM';
      h = h % 12 || 12;
      return { hour12: h, minute: m, ampm, valid: true };
    }

    // If 24hr format without am/pm
    if (h >= 12 && h < 24) {
      return { hour12: h === 12 ? 12 : h - 12, minute: m, ampm: 'PM', valid: true };
    } else if (h < 12) {
      return { hour12: h === 0 ? 12 : h, minute: m, ampm: 'AM', valid: true };
    }
  }

  // 2. Just hour:minute with no seconds
  const simpleMatch = str.match(/^([0-9]{1,2}):([0-9]{1,2})$/);
  if (simpleMatch) {
    let h = parseInt(simpleMatch[1], 10);
    let m = parseInt(simpleMatch[2], 10);
    m = Math.min(59, Math.max(0, m));

    if (h >= 12 && h < 24) {
      return { hour12: h === 12 ? 12 : h - 12, minute: m, ampm: 'PM', valid: true };
    } else {
      h = Math.min(12, Math.max(1, h % 12 || 12));
      return { hour12: h, minute: m, ampm: 'AM', valid: true };
    }
  }

  return { hour12: 12, minute: 0, ampm: 'AM', valid: false };
};

// Helper: convert 12hr + ampm to 24hr 'HH:mm'
const to24HourString = (hour12: number, minute: number, ampm: 'AM' | 'PM'): string => {
  let h24 = hour12;
  if (ampm === 'PM' && hour12 < 12) h24 += 12;
  if (ampm === 'AM' && hour12 === 12) h24 = 0;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const VedicTimePicker: React.FC<VedicTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  theme = 'dark',
  placeholder = 'HH:MM (e.g. 10:30)',
  className = '',
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial 12hr state
  const parsed = parseTimeTo12Hr(value);
  const [selectedHour, setSelectedHour] = useState<number>(parsed.valid ? parsed.hour12 : 12);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed.valid ? parsed.minute : 0);
  const [ampm, setAmPm] = useState<'AM' | 'PM'>(parsed.valid ? parsed.ampm : 'AM');

  // Input typed text display (e.g. "10:30")
  const formatHourMinuteDisplay = () => {
    if (!value || !parsed.valid) return '';
    return `${String(parsed.hour12).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`;
  };

  const [typedText, setTypedText] = useState<string>(formatHourMinuteDisplay());

  // Sync state when `value` prop changes
  useEffect(() => {
    const p = parseTimeTo12Hr(value);
    if (p.valid) {
      setSelectedHour(p.hour12);
      setSelectedMinute(p.minute);
      setAmPm(p.ampm);
      setTypedText(`${String(p.hour12).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`);
    } else if (!value) {
      setTypedText('');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle direct manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTypedText(text);

    if (!text.trim()) {
      onChange('');
      return;
    }

    const p = parseTimeTo12Hr(text);
    if (p.valid) {
      setSelectedHour(p.hour12);
      setSelectedMinute(p.minute);
      // If user typed AM/PM explicitly in text, honor it, otherwise preserve current ampm state
      const hasAmPmInText = /am|pm/i.test(text);
      const newAmPm = hasAmPmInText ? p.ampm : ampm;
      setAmPm(newAmPm);
      const h24 = to24HourString(p.hour12, p.minute, newAmPm);
      onChange(h24);
    }
  };

  const handleInputBlur = () => {
    if (value) {
      const p = parseTimeTo12Hr(value);
      if (p.valid) {
        setTypedText(`${String(p.hour12).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`);
      }
    }
  };

  // Toggle AM / PM
  const handleAmPmToggle = (newPeriod: 'AM' | 'PM') => {
    if (disabled) return;
    setAmPm(newPeriod);
    const h24 = to24HourString(selectedHour, selectedMinute, newPeriod);
    onChange(h24);
  };

  // Pick Hour from Visual Popover
  const handleSelectHour = (h: number) => {
    setSelectedHour(h);
    const h24 = to24HourString(h, selectedMinute, ampm);
    onChange(h24);
    setTypedText(`${String(h).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`);
  };

  // Pick Minute from Visual Popover
  const handleSelectMinute = (m: number) => {
    setSelectedMinute(m);
    const h24 = to24HourString(selectedHour, m, ampm);
    onChange(h24);
    setTypedText(`${String(selectedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  // Pick Astrological Preset
  const handleSelectPreset = (preset: typeof TIME_PRESETS[0]) => {
    onChange(preset.time);
    const p = parseTimeTo12Hr(preset.time);
    if (p.valid) {
      setSelectedHour(p.hour12);
      setSelectedMinute(p.minute);
      setAmPm(p.ampm);
      setTypedText(`${String(p.hour12).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setTypedText('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      {/* Time Input Bar with Integrated AM/PM Toggle */}
      <div
        className={`w-full rounded-lg border flex items-center transition ${
          theme === 'dark'
            ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] focus-within:border-[#C9A050]'
            : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] focus-within:border-[#C9A050]'
        } ${isOpen ? 'border-[#C9A050] ring-1 ring-[#C9A050]/30' : ''} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {/* Clock Button to Toggle Visual Popover */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className="pl-3 pr-1.5 py-2 text-[#C9A050] hover:text-[#D4AF37] transition cursor-pointer flex items-center shrink-0"
          title="Open Visual Time Picker"
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Real Editable Input for Manual Typing */}
        <input
          type="text"
          disabled={disabled}
          value={typedText}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled && !isOpen) setIsOpen(true);
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full py-2 text-sm bg-transparent outline-none tracking-wide placeholder:opacity-40"
        />

        {/* AM / PM Quick Toggle Segmented Buttons */}
        <div className={`flex items-center space-x-0.5 p-0.5 rounded-lg border mr-1.5 shrink-0 select-none ${
          theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF2DA] border-[#DFC896]'
        }`}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAmPmToggle('AM')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider transition cursor-pointer ${
              ampm === 'AM'
                ? theme === 'dark'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm shadow-[#C9A050]/30 scale-105'
                  : 'bg-[#FDE68A] text-[#5C4505] border border-[#DECFA6] shadow-sm scale-105'
                : theme === 'dark'
                ? 'text-[#9E9A90] hover:text-[#C9A050]'
                : 'text-[#8A795D] hover:text-[#5C4505]'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAmPmToggle('PM')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider transition cursor-pointer ${
              ampm === 'PM'
                ? theme === 'dark'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm shadow-[#C9A050]/30 scale-105'
                  : 'bg-[#FDE68A] text-[#5C4505] border border-[#DECFA6] shadow-sm scale-105'
                : theme === 'dark'
                ? 'text-[#9E9A90] hover:text-[#C9A050]'
                : 'text-[#8A795D] hover:text-[#5C4505]'
            }`}
          >
            PM
          </button>
        </div>

        {/* Dropdown Chevron */}
        <div className="flex items-center pr-2.5 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) setIsOpen(!isOpen);
            }}
            className="p-1 text-gray-400 hover:text-[#C9A050] transition cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#C9A050]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Floating Vedic Astrological Time Picker Popover */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl border shadow-2xl p-4 overflow-hidden backdrop-blur-md ${
              theme === 'dark'
                ? 'bg-[#141418] border-[#C9A050]/40 shadow-black/80'
                : 'bg-gradient-to-b from-[#FAF4E4] to-[#F5EACB] border-[#DFC896] shadow-[#C9A050]/15 text-[#1E1B15]'
            }`}
          >
            {/* Header: Selected Time Display & Large AM/PM Switcher */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#C9A050]/20">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono tracking-wider text-[#C9A050]">
                  {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold font-serif opacity-80">
                  {ampm}
                </span>
              </div>

              {/* AM / PM Segmented Switcher in Popover */}
              <div className={`flex items-center p-0.5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF2DA] border-[#DFC896]'
              }`}>
                <button
                  type="button"
                  onClick={() => handleAmPmToggle('AM')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    ampm === 'AM'
                      ? theme === 'dark'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/30'
                        : 'bg-[#FDE68A] text-[#5C4505] border border-[#DFC896] shadow-sm'
                      : theme === 'dark'
                      ? 'text-[#9E9A90] hover:text-[#C9A050]'
                      : 'text-[#8A795D] hover:text-[#5C4505]'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>AM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAmPmToggle('PM')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    ampm === 'PM'
                      ? theme === 'dark'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/30'
                        : 'bg-[#FDE68A] text-[#5C4505] border border-[#DFC896] shadow-sm'
                      : theme === 'dark'
                      ? 'text-[#9E9A90] hover:text-[#C9A050]'
                      : 'text-[#8A795D] hover:text-[#5C4505]'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>PM</span>
                </button>
              </div>
            </div>

            {/* Hour Selector (1 - 12) */}
            <div className="mb-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A050] mb-1.5">
                Hour (12-Hour Cycle)
              </span>
              <div className="grid grid-cols-6 gap-1 text-center">
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={`py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer select-none ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/40 scale-105'
                            : 'bg-[#FDE68A] text-[#5C4505] font-bold border border-[#DECFA6] shadow-sm scale-105'
                          : theme === 'dark'
                          ? 'bg-[#1C1C22] border border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050] hover:text-[#C9A050]'
                          : 'bg-[#FFFDF7] border border-[#DECFA6] text-[#1E1B15] hover:border-[#C9A050] hover:bg-[#FAF1D6]'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Selector (Presets) */}
            <div className="mb-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A050] mb-1.5">
                Minute
              </span>
              <div className="grid grid-cols-6 gap-1 text-center">
                {MINUTE_PRESETS.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={`m-${m}`}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer select-none ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-[#C9A050] text-[#0D0D0F] font-bold shadow-md shadow-[#C9A050]/40 scale-105'
                            : 'bg-[#FDE68A] text-[#5C4505] font-bold border border-[#DECFA6] shadow-sm scale-105'
                          : theme === 'dark'
                          ? 'bg-[#1C1C22] border border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050] hover:text-[#C9A050]'
                          : 'bg-[#FFFDF7] border border-[#DECFA6] text-[#1E1B15] hover:border-[#C9A050] hover:bg-[#FAF1D6]'
                      }`}
                    >
                      :{String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Astrological Muhurat / Time Period Presets */}
            <div className="mb-3 pt-2 border-t border-[#C9A050]/20">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A050] mb-1.5">
                Quick Astrological Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold text-left transition cursor-pointer truncate ${
                      theme === 'dark'
                        ? 'bg-[#1C1C22] border border-[#2A2A2E] hover:border-[#C9A050] text-gray-300 hover:text-white'
                        : 'bg-[#FFFDF7] border border-[#DECFA6] hover:border-[#C9A050] text-[#423C32]'
                    }`}
                    title={`${p.label} (${p.desc})`}
                  >
                    <div className="font-bold text-[#C9A050]">{p.desc}</div>
                    <div className="opacity-70 truncate">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer / Done Button */}
            <div className="pt-2 border-t border-[#C9A050]/20 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const h = now.getHours();
                  const m = now.getMinutes();
                  const nowStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                  onChange(nowStr);
                  const p = parseTimeTo12Hr(nowStr);
                  if (p.valid) {
                    setSelectedHour(p.hour12);
                    setSelectedMinute(p.minute);
                    setAmPm(p.ampm);
                    setTypedText(`${String(p.hour12).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`);
                  }
                  setIsOpen(false);
                }}
                className="text-[#C9A050] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Current Time</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#222228] hover:bg-[#2A2A32] text-gray-300'
                    : 'bg-[#FAF1D6] hover:bg-[#F3E6C2] text-[#423C32] border border-[#DECFA6]'
                }`}
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
