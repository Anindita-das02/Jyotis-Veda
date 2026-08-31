import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Moon, Sun, MapPin, X, ArrowRightLeft } from 'lucide-react';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

const BENGALI_MONTHS = ["Baisakh", "Jaistha", "Ashar", "Sraban", "Bhadra", "Aswin", "Kartik", "Agrahayan", "Poush", "Magh", "Falgun", "Chaitra"];
const HINDI_MONTHS = ["Chaitra", "Vaisakha", "Jyaistha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
const TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
const PAKSHAS = ["Shukla", "Krishna"];
const LOCATIONS = [
  { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Dhaka, Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 }
];

const PanjikaCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Location
  const [location, setLocation] = useState(LOCATIONS[0]);
  
  // Converter State
  const [convertFrom, setConvertFrom] = useState<'english'|'bengali'|'hindi'>('english');
  const [convertTo, setConvertTo] = useState<'english'|'bengali'|'hindi'>('bengali');
  
  const [engDate, setEngDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [benDay, setBenDay] = useState('1');
  const [benMonth, setBenMonth] = useState('Baisakh');
  const [benYear, setBenYear] = useState('1433');
  
  const [hinTithi, setHinTithi] = useState('Pratipada');
  const [hinPaksha, setHinPaksha] = useState('Shukla');
  const [hinMonth, setHinMonth] = useState('Chaitra');
  const [hinYear, setHinYear] = useState('2083');

  const [conversionLoading, setConversionLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  
  // Modal State
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [fullPanjika, setFullPanjika] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate, location]);

  const fetchMonthData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await api.post<any>(API_ENDPOINTS.CALENDAR.MONTH, { year, month, lat: location.lat, lon: location.lon });
      setCalendarData(res);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFullPanjika = async (date: string) => {
    setModalLoading(true);
    try {
       const res = await api.post<any>(API_ENDPOINTS.CALENDAR.FULL_PANJIKA, { date, lat: location.lat, lon: location.lon });
       setFullPanjika(res);
    } catch (error) {
       console.error('Error fetching full panjika:', error);
    } finally {
       setModalLoading(false);
    }
  };

  const handleConvert = async () => {
    setConversionLoading(true);
    let payload: any = { from_type: convertFrom, lat: location.lat, lon: location.lon };
    
    if (convertFrom === 'english') payload.date = engDate;
    else if (convertFrom === 'bengali') {
      payload.day = benDay; payload.month = benMonth; payload.year = benYear;
    }
    else if (convertFrom === 'hindi') {
      payload.tithi = hinTithi; payload.paksha = hinPaksha; payload.month = hinMonth; payload.year = hinYear;
    }

    try {
      const res = await api.post<any>(API_ENDPOINTS.CALENDAR.CONVERT, payload);
      setConversionResult(res);
    } catch (error) {
      console.error('Error converting date:', error);
      setConversionResult({ error: 'Date not found or invalid calculation.' });
    } finally {
      setConversionLoading(false);
    }
  };

  useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convertFrom, convertTo, engDate, benDay, benMonth, benYear, hinTithi, hinPaksha, hinMonth, hinYear, location]);

  const openDayModal = (dayData: any) => {
    setSelectedDay(dayData);
    setFullPanjika(null);
    fetchFullPanjika(dayData.english_date);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className=" bg-[#F0ECE1]  text-[#0D0D0F]  p-4 lg:p-6 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-4">
        
        {/* Header & Location */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[#E5E1D8]  pb-6 gap-6 transition-colors">
          <div>
            <div className="flex items-center space-x-3 text-[#C9A050] mb-2">
              <Calendar className="w-6 h-6" />
              <span className="uppercase tracking-widest text-sm font-semibold">Universal Chronology</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[#0D0D0F]  font-serif transition-colors">
              Panjika & <span className="text-[#C9A050]">Cosmic Calendar</span>
            </h1>
            <p className="text-gray-600  mt-3 max-w-2xl font-light transition-colors text-sm sm:text-base">
              Precise 6-way date conversion and detailed Panjika Engine based on Drik Siddhanta calculations.
            </p>
          </div>
          
          <div className="flex items-center bg-[#F9F7F1]  border border-[#E5E1D8]  rounded-xl px-4 py-2 transition-colors">
            <MapPin className="w-5 h-5 text-[#C9A050] mr-3" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Calculation Location</span>
              <select 
                value={location.name}
                onChange={(e) => setLocation(LOCATIONS.find(l => l.name === e.target.value) || LOCATIONS[0])}
                className="bg-transparent text-sm font-medium outline-none text-[#0D0D0F]  cursor-pointer"
              >
                {LOCATIONS.map(loc => <option key={loc.name} value={loc.name} className="bg-white ">{loc.name}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* Horizontal Date Converter */}
        <div className="bg-[#F9F7F1]  border border-[#E5E1D8]  p-4 rounded-xl transition-colors shadow-sm">
           <div className="flex items-center space-x-2 text-[#C9A050] mb-4">
              <ArrowRightLeft className="w-5 h-5" />
              <h3 className="text-lg font-serif text-[#0D0D0F] ">6-Way Date Converter</h3>
           </div>
           
           <div className="flex flex-col lg:flex-row items-end gap-6 lg:gap-8">
             {/* FROM */}
             <div className="flex-1 space-y-3">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Convert From</label>
               <div className="flex flex-col sm:flex-row gap-4">
                 <select 
                   value={convertFrom}
                   onChange={e => setConvertFrom(e.target.value as any)}
                   className="w-full sm:w-1/3 bg-[#F0ECE1]  border border-[#D4CFC4]  text-[#0D0D0F]  p-3 rounded-lg focus:outline-none focus:border-[#C9A050] transition-colors"
                 >
                   <option value="english">Gregorian</option>
                   <option value="bengali">Bangabda</option>
                   <option value="hindi">Vikram Samvat</option>
                 </select>

                 {/* Inputs based on selection */}
                 {convertFrom === 'english' && (
                   <input type="date" value={engDate} onChange={e => setEngDate(e.target.value)} className="w-full sm:w-2/3 bg-[#F0ECE1]  border border-[#D4CFC4]  text-[#0D0D0F]  p-3 rounded-lg focus:outline-none focus:border-[#C9A050]" />
                 )}
                 {convertFrom === 'bengali' && (
                   <div className="w-full sm:w-2/3 grid grid-cols-3 gap-3">
                     <input type="number" placeholder="Day" value={benDay} onChange={e=>setBenDay(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  text-center p-3 rounded-lg text-sm" />
                     <select value={benMonth} onChange={e=>setBenMonth(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  text-center p-3 rounded-lg text-sm truncate">
                       {BENGALI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                     <input type="number" placeholder="Year" value={benYear} onChange={e=>setBenYear(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  text-center p-3 rounded-lg text-sm" />
                   </div>
                 )}
                 {convertFrom === 'hindi' && (
                   <div className="w-full sm:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                     <select value={hinTithi} onChange={e=>setHinTithi(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  p-3 rounded-lg text-xs truncate">
                       {TITHIS.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <select value={hinPaksha} onChange={e=>setHinPaksha(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  p-3 rounded-lg text-xs">
                       {PAKSHAS.map(p => <option key={p} value={p}>{p} Paksha</option>)}
                     </select>
                     <select value={hinMonth} onChange={e=>setHinMonth(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  p-3 rounded-lg text-xs">
                       {HINDI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                     <input type="number" placeholder="Year" value={hinYear} onChange={e=>setHinYear(e.target.value)} className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  text-center p-3 rounded-lg text-xs" />
                   </div>
                 )}
               </div>
             </div>

             <div className="hidden lg:flex flex-shrink-0 items-center justify-center pb-3 px-2">
               <ArrowRightLeft className="w-6 h-6 text-[#C9A050]" />
             </div>

             {/* TO */}
             <div className="w-full lg:w-1/4 space-y-3">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Convert To</label>
               <select 
                 value={convertTo}
                 onChange={e => setConvertTo(e.target.value as any)}
                 className="w-full bg-[#F0ECE1]  border border-[#D4CFC4]  text-[#0D0D0F]  p-3 rounded-lg focus:outline-none focus:border-[#C9A050] transition-colors"
               >
                 <option value="english">Gregorian (English)</option>
                 <option value="bengali">Bangabda (Bengali)</option>
                 <option value="hindi">Vikram Samvat (Hindi)</option>
               </select>
             </div>
           </div>

           {/* Output */}
           {conversionResult && !conversionResult.error && (
             <div className="mt-8 p-5 bg-[#C9A050]/10 border border-[#C9A050]/30 rounded-xl flex flex-col sm:flex-row items-center justify-between animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A050]/10  rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="text-xs text-[#C9A050] font-bold uppercase tracking-widest mb-1 sm:mb-0 relative z-10 flex items-center">
                   {conversionLoading && <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />} 
                   Result ({convertTo})
                </div>
                <div className="text-xl sm:text-2xl font-serif text-[#0D0D0F]  relative z-10">
                  {convertTo === 'english' && conversionResult.english}
                  {convertTo === 'bengali' && conversionResult.bengali}
                  {convertTo === 'hindi' && conversionResult.hindi}
                </div>
             </div>
           )}
           {conversionResult?.error && (
             <div className="mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-sm text-red-600 ">
                {conversionResult.error}
             </div>
           )}
        </div>

        <div className={`grid grid-cols-1 ${selectedDay ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8 transition-all duration-300`}>
          
          {/* Main Calendar Area */}
          <div className={`${selectedDay ? 'lg:col-span-2' : 'lg:col-span-1'} space-y-6 transition-all duration-300`}>
            <div className="bg-[#F9F7F1]  border border-[#E5E1D8]  p-4 rounded-xl relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A050]/10  rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
                <div className="flex items-center space-x-1 bg-[#F0ECE1]  px-2 py-1.5 rounded-xl border border-[#D4CFC4]  shadow-inner focus-within:border-[#C9A050] transition-all duration-300">
                  <div className="relative group">
                    <select 
                      value={currentDate.getMonth()} 
                      onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                      className="appearance-none bg-transparent text-[#0D0D0F]  py-2 pl-3 pr-8 rounded-lg outline-none font-serif text-lg cursor-pointer hover:text-[#C9A050] transition-colors"
                    >
                      {monthNames.map((m, i) => <option key={m} value={i} className="bg-white  text-base font-sans">{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#C9A050] opacity-70" />
                  </div>
                  <div className="w-px h-6 bg-[#D4CFC4]  mx-1"></div>
                  <div className="relative group">
                    <select
                      value={currentDate.getFullYear()}
                      onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                      className="appearance-none bg-transparent text-[#0D0D0F]  py-2 pl-3 pr-8 rounded-lg outline-none font-serif text-lg cursor-pointer hover:text-[#C9A050] transition-colors"
                    >
                      {Array.from({ length: 201 }, (_, i) => 1900 + i).map(year => <option key={year} value={year} className="bg-white  text-base font-sans">{year}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#C9A050] opacity-70" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={prevMonth} className="p-2 bg-[#F0ECE1]  hover:bg-[#E5E1D8]  border border-[#D4CFC4]  rounded-full transition-all text-gray-500 hover:text-[#C9A050]">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} className="p-2 bg-[#F0ECE1]  hover:bg-[#E5E1D8]  border border-[#D4CFC4]  rounded-full transition-all text-gray-500 hover:text-[#C9A050]">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#C9A050] animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 pb-2">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 lg:h-20 rounded-lg bg-transparent"></div>
                  ))}

                  {calendarData?.days?.map((dayData: any) => (
                    <div 
                      key={dayData.day} 
                      onClick={() => openDayModal(dayData)}
                      className={`h-16 lg:h-20 p-1.5 sm:p-2 border rounded-lg transition-colors flex flex-col justify-between group/day cursor-pointer ${
                        selectedDay?.day === dayData.day 
                          ? 'bg-[#E5E1D8]  border-[#C9A050] shadow-[0_0_15px_rgba(201,160,80,0.15)]' 
                          : 'bg-[#F0ECE1]  border-[#E5E1D8]  hover:border-[#C9A050]/50 '
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm sm:text-base font-medium transition-colors ${selectedDay?.day === dayData.day ? 'text-[#C9A050]' : 'text-gray-700  group-hover/day:text-[#C9A050]'}`}>{dayData.day}</span>
                        <div className="flex flex-col items-end opacity-60 group-hover/day:opacity-100 transition-opacity">
                           {dayData.paksha === 'Shukla' ? <Moon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${selectedDay?.day === dayData.day ? 'text-[#0D0D0F] ' : 'text-[#0D0D0F] '}`} /> : <Moon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${selectedDay?.day === dayData.day ? 'text-[#0D0D0F] ' : 'text-gray-400 '}`} />}
                        </div>
                      </div>
                      <div className="text-[8px] sm:text-[9px] space-y-0.5 leading-tight">
                        <div className={`truncate ${selectedDay?.day === dayData.day ? 'text-[#C9A050]' : 'text-[#A6823C] '}`}>{dayData.bengali_date.split(' ').slice(0,2).join(' ')}</div>
                        <div className={`truncate ${selectedDay?.day === dayData.day ? 'text-[#3B82F6]' : 'text-[#3B82F6] '}`}>{dayData.hindi_date.split(', ')[0].split(' ')[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Sidebar (Only visible when a day is selected) */}
          {selectedDay && (
            <div className="lg:col-span-1 bg-[#F9F7F1]  border border-[#E5E1D8]  p-6 rounded-xl relative overflow-hidden transition-colors h-fit animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif text-[#0D0D0F] ">Daily Panjika</h3>
                  <p className="text-[#C9A050] text-xs font-semibold mt-1 uppercase tracking-wider">{selectedDay.english_date}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-2 bg-[#F0ECE1]  hover:bg-[#E5E1D8]  border border-[#D4CFC4]  rounded-full transition-colors text-gray-500 hover:text-[#C9A050]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalLoading || !fullPanjika ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[#C9A050] animate-spin" />
                  <p className="text-sm text-gray-500">Calculating Celestial Positions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Bengali</div>
                      <div className="text-[#0D0D0F]  font-serif text-sm">{selectedDay.bengali_date}</div>
                    </div>
                    <div className="p-3 bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Hindi</div>
                      <div className="text-[#0D0D0F]  font-serif text-sm">{selectedDay.hindi_date}</div>
                    </div>
                  </div>

                  {/* Panchang Core */}
                  <div>
                    <h3 className="text-xs font-semibold text-[#C9A050] uppercase tracking-wider mb-3 flex items-center">
                      <Moon className="w-3.5 h-3.5 mr-2" /> Panchang
                    </h3>
                    <div className="bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl divide-y divide-[#D4CFC4]  text-sm">
                      {[
                        { label: "Tithi", value: `${fullPanjika.tithi} (${fullPanjika.paksha})` },
                        { label: "Nakshatra", value: fullPanjika.nakshatra },
                        { label: "Yoga", value: fullPanjika.yoga },
                        { label: "Karana", value: fullPanjika.karana },
                        { label: "Rashi", value: fullPanjika.rashi },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3">
                          <span className="text-gray-600  text-xs">{item.label}</span>
                          <span className="text-[#0D0D0F]  font-medium text-right text-xs max-w-[60%] leading-tight">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Celestial Times */}
                  <div>
                    <h3 className="text-xs font-semibold text-[#C9A050] uppercase tracking-wider mb-3 flex items-center">
                      <Sun className="w-3.5 h-3.5 mr-2" /> Transit Times
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Sunrise</span>
                        <span className="font-mono text-[#0D0D0F]  text-xs">{fullPanjika.sunrise}</span>
                      </div>
                      <div className="bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Sunset</span>
                        <span className="font-mono text-[#0D0D0F]  text-xs">{fullPanjika.sunset}</span>
                      </div>
                      <div className="bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Moonrise</span>
                        <span className="font-mono text-[#0D0D0F]  text-xs">{fullPanjika.moonrise}</span>
                      </div>
                      <div className="bg-[#F0ECE1]  border border-[#D4CFC4]  rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Moonset</span>
                        <span className="font-mono text-[#0D0D0F]  text-xs">{fullPanjika.moonset}</span>
                      </div>
                    </div>
                  </div>

                  {/* Festivals */}
                  {fullPanjika.festivals && fullPanjika.festivals.length > 0 && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <h4 className="text-[10px] font-bold text-orange-600  uppercase tracking-widest mb-1.5">Auspicious & Festivals</h4>
                      <ul className="list-disc list-inside text-xs text-[#0D0D0F]  space-y-1">
                        {fullPanjika.festivals.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanjikaCalendarView;
