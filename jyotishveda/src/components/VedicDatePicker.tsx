import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VedicDatePickerProps {
  value: string; // ISO format 'YYYY-MM-DD' or empty string
  onChange: (dateStr: string) => void;
  disabled?: boolean;
  theme?: 'light' | 'dark';
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  className?: string;
  id?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Flexible date parser for manual input
const parseFlexibleDate = (input: string): { year: number; month: number; day: number } | null => {
  if (!input) return null;
  const str = input.trim();

  // 1. ISO: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return { year: y, month: m, day: d };
    }
  }

  // 2. Standard Indian/European: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return { year: y, month: m, day: d };
    }
  }

  // 3. Named month: e.g. "15 Aug 1998" or "15 August 1998"
  const namedMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (namedMatch) {
    const d = parseInt(namedMatch[1], 10);
    const mName = namedMatch[2].toLowerCase();
    const y = parseInt(namedMatch[3], 10);
    const m = MONTHS.findIndex((mo) => mo.toLowerCase().startsWith(mName.slice(0, 3)));
    if (m !== -1 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return { year: y, month: m, day: d };
    }
  }

  return null;
};

export const VedicDatePicker: React.FC<VedicDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  theme = 'dark',
  placeholder = 'DD-MM-YYYY',
  minYear = 1920,
  maxYear = 2035,
  className = '',
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Format initial display text from ISO value
  const formatIsoToDisplay = (isoStr: string) => {
    if (!isoStr) return '';
    const parsed = parseFlexibleDate(isoStr);
    if (!parsed) return isoStr;
    const mStr = String(parsed.month + 1).padStart(2, '0');
    const dStr = String(parsed.day).padStart(2, '0');
    return `${dStr}-${mStr}-${parsed.year}`;
  };

  const [typedText, setTypedText] = useState<string>(formatIsoToDisplay(value));

  // Parse current value for calendar highlight
  const parsedDate = parseFlexibleDate(value);

  // Current view year and month in calendar
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(parsedDate?.year || 1998);
  const [viewMonth, setViewMonth] = useState<number>(parsedDate !== null ? parsedDate.month : 0);
  const [decadeStart, setDecadeStart] = useState<number>(Math.floor((parsedDate?.year || 1998) / 12) * 12);

  // Sync typedText and view when `value` prop changes
  useEffect(() => {
    setTypedText(formatIsoToDisplay(value));
    if (parsedDate) {
      setViewYear(parsedDate.year);
      setViewMonth(parsedDate.month);
      setDecadeStart(Math.floor(parsedDate.year / 12) * 12);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
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

    const parsed = parseFlexibleDate(text);
    if (parsed) {
      const mStr = String(parsed.month + 1).padStart(2, '0');
      const dStr = String(parsed.day).padStart(2, '0');
      const iso = `${parsed.year}-${mStr}-${dStr}`;
      onChange(iso);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setDecadeStart(Math.floor(parsed.year / 12) * 12);
    }
  };

  const handleInputBlur = () => {
    if (value) {
      setTypedText(formatIsoToDisplay(value));
    }
  };

  // Calendar calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (viewMode === 'years') {
      setDecadeStart(decadeStart - 12);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (viewMode === 'years') {
      setDecadeStart(decadeStart + 12);
    }
  };

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const isoDate = `${viewYear}-${mStr}-${dStr}`;
    onChange(isoDate);
    setTypedText(`${dStr}-${mStr}-${viewYear}`);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIdx: number) => {
    setViewMonth(monthIdx);
    setViewMode('days');
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    setViewMode('months');
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${d}`;
    onChange(isoDate);
    setTypedText(`${d}-${m}-${y}`);
    setViewYear(y);
    setViewMonth(today.getMonth());
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
      {/* Input Field: Supports direct typing AND clicking calendar */}
      <div
        className={`w-full rounded-lg border flex items-center transition ${
          theme === 'dark'
            ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] focus-within:border-[#C9A050]'
            : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15] focus-within:border-[#C9A050]'
        } ${isOpen ? 'border-[#C9A050] ring-1 ring-[#C9A050]/30' : ''} ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {/* Calendar Icon (Click to toggle picker) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className="pl-3 pr-1.5 py-2 text-[#C9A050] hover:text-[#D4AF37] transition cursor-pointer flex items-center shrink-0"
          title="Open Calendar Picker"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        {/* Real Editable Input Box */}
        <input
          ref={inputRef}
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

      {/* Floating Vedic Astrological Datepicker Popover */}
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
            {/* Header: Month / Year / Navigators */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#C9A050]/20">
              <div className="flex items-center space-x-1.5">
                {viewMode === 'days' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewMode('months')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-serif transition flex items-center space-x-1 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-[#1F1F24] hover:bg-[#C9A050]/20 text-[#F0ECE1]'
                          : 'bg-[#FFFDF7] hover:bg-[#C9A050]/20 text-[#1E1B15] border border-[#DECFA6]'
                      }`}
                    >
                      <span>{MONTHS[viewMonth]}</span>
                      <ChevronDown className="w-3 h-3 text-[#C9A050]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDecadeStart(Math.floor(viewYear / 12) * 12);
                        setViewMode('years');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center space-x-1 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-[#1F1F24] hover:bg-[#C9A050]/20 text-[#F0ECE1]'
                          : 'bg-[#FFFDF7] hover:bg-[#C9A050]/20 text-[#1E1B15] border border-[#DECFA6]'
                      }`}
                    >
                      <span>{viewYear}</span>
                      <ChevronDown className="w-3 h-3 text-[#C9A050]" />
                    </button>
                  </>
                )}

                {viewMode === 'months' && (
                  <span className="text-xs font-bold text-[#C9A050] uppercase tracking-wider px-2">
                    Select Month ({viewYear})
                  </span>
                )}

                {viewMode === 'years' && (
                  <span className="text-xs font-bold text-[#C9A050] uppercase tracking-wider px-2">
                    {decadeStart} – {decadeStart + 11}
                  </span>
                )}
              </div>

              {/* Prev / Next Chevrons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1A1A1E] border-[#2A2A2E] text-gray-300 hover:text-[#C9A050] hover:border-[#C9A050]/50'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#423C32] hover:text-[#1E1B15] hover:border-[#C9A050]'
                  }`}
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1A1A1E] border-[#2A2A2E] text-gray-300 hover:text-[#C9A050] hover:border-[#C9A050]/50'
                      : 'bg-[#FFFDF7] border-[#DECFA6] text-[#423C32] hover:text-[#1E1B15] hover:border-[#C9A050]'
                  }`}
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode: Days Grid */}
            {viewMode === 'days' && (
              <div>
                {/* Weekday Names Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {DAYS_OF_WEEK.map((d, idx) => (
                    <span
                      key={d}
                      className={`text-[11px] font-bold py-1 ${
                        idx === 0 || idx === 6 ? 'text-[#C9A050]' : theme === 'dark' ? 'text-gray-400' : 'text-[#6E6452]'
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* Days Matrix */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Previous month padding days */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => {
                    const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
                    return (
                      <span
                        key={`prev-${i}`}
                        className={`text-xs py-1.5 rounded-lg opacity-30 cursor-default select-none ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        {prevDay}
                      </span>
                    );
                  })}

                  {/* Current month days */}
                  {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected =
                      parsedDate &&
                      parsedDate.year === viewYear &&
                      parsedDate.month === viewMonth &&
                      parsedDate.day === dayNum;

                    const isToday =
                      today.getFullYear() === viewYear &&
                      today.getMonth() === viewMonth &&
                      today.getDate() === dayNum;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => handleSelectDay(dayNum)}
                        className={`text-xs py-1.5 rounded-lg font-medium transition cursor-pointer select-none ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-[#C9A050] text-[#0D0D0F] font-bold shadow-md shadow-[#C9A050]/40 scale-105'
                            : 'bg-[#FDE68A] text-[#5C4505] font-bold border border-[#DFC896] shadow-sm scale-105'
                          : isToday
                          ? 'border border-[#C9A050] text-[#C9A050] font-bold hover:bg-[#C9A050]/20'
                          : theme === 'dark'
                          ? 'text-[#F0ECE1] hover:bg-[#C9A050]/20 hover:text-[#C9A050]'
                          : 'text-[#1E1B15] hover:bg-[#C9A050]/25 hover:text-[#1E1B15]'
                      }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Mode: Months Selector Grid */}
            {viewMode === 'months' && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {MONTHS_SHORT.map((mName, idx) => {
                  const isCurrentMonth = viewMonth === idx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => handleSelectMonth(idx)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isCurrentMonth
                        ? theme === 'dark'
                          ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/30'
                          : 'bg-[#FDE68A] text-[#5C4505] border border-[#DFC896] shadow-sm'
                        : theme === 'dark'
                        ? 'bg-[#1C1C22] border border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050] hover:text-[#C9A050]'
                        : 'bg-[#FFFDF7] border border-[#DECFA6] text-[#1E1B15] hover:border-[#C9A050] hover:bg-[#FAF1D6]'
                    }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View Mode: Years Selector Grid */}
            {viewMode === 'years' && (
              <div>
                <div className="grid grid-cols-3 gap-2 py-2">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const yearNum = decadeStart + idx;
                    if (yearNum < minYear || yearNum > maxYear) return null;
                    const isCurrentYear = viewYear === yearNum;
                    return (
                      <button
                        key={yearNum}
                        type="button"
                        onClick={() => handleSelectYear(yearNum)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        isCurrentYear
                          ? theme === 'dark'
                            ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/30'
                            : 'bg-[#FDE68A] text-[#5C4505] border border-[#DFC896] shadow-sm'
                          : theme === 'dark'
                          ? 'bg-[#1C1C22] border border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050] hover:text-[#C9A050]'
                          : 'bg-[#FFFDF7] border border-[#DECFA6] text-[#1E1B15] hover:border-[#C9A050] hover:bg-[#FAF1D6]'
                      }`}
                      >
                        {yearNum}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Decades Navigation Bar */}
                <div className="mt-2 pt-2 border-t border-[#C9A050]/20 flex items-center justify-between text-[10px] text-[#C9A050] font-bold">
                  {[1970, 1980, 1990, 2000, 2010].map((dec) => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => {
                        setDecadeStart(dec);
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-[#C9A050]/20 cursor-pointer"
                    >
                      {dec}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer / Quick Actions */}
            <div className="mt-3 pt-2.5 border-t border-[#C9A050]/20 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[#C9A050] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setViewMode('days');
                }}
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
