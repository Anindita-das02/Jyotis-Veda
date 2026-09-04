import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Sparkles, Check, User, Target, Globe, Compass, Star } from 'lucide-react';
import { UserProfile } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { VedicDatePicker } from './VedicDatePicker';
import { VedicTimePicker } from './VedicTimePicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  theme?: 'dark' | 'light';
}

export const PRESET_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'Varanasi, India', lat: 25.3176, lng: 82.9739, tz: 5.5 },
  { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Ahmedabad, India', lat: 23.0225, lng: 72.5714, tz: 5.5 },
  { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873, tz: 5.5 },
  { name: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, tz: 0 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -5 },
  { name: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, tz: -8 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4 },
];

const FOCUS_AREA_OPTIONS = [
  'Career & Executive Leadership',
  'Wealth, Investments & Business',
  'Marriage, Love & Kundli Milan',
  'Health, Vitality & Longevity',
  'Spiritual Dharma & Moksha',
  'Foreign Settlement & Travel',
  'Property & Real Estate',
  'Competitive Exams & Education',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialProfile?.gender || 'male');
  const [birthDate, setBirthDate] = useState(initialProfile?.birthDate || '1995-06-15');
  const [birthTime, setBirthTime] = useState(initialProfile?.birthTime || '');
  const [birthPlace, setBirthPlace] = useState(initialProfile?.birthPlace || 'New Delhi, India');
  const [latitude, setLatitude] = useState(initialProfile?.latitude || 28.6139);
  const [longitude, setLongitude] = useState(initialProfile?.longitude || 77.2090);
  const [focusAreas, setFocusAreas] = useState<string[]>(
    initialProfile?.focusAreas || ['Career & Executive Leadership', 'Wealth, Investments & Business']
  );
  const [horoscopeSystem, setHoroscopeSystem] = useState<'vedic' | 'western'>(
    initialProfile?.horoscopeSystem || 'vedic'
  );
  const [notes, setNotes] = useState(initialProfile?.notes || '');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialProfile) {
      setFullName(initialProfile.fullName);
      setGender(initialProfile.gender);
      setBirthDate(initialProfile.birthDate);
      setBirthTime(initialProfile.birthTime);
      setBirthPlace(initialProfile.birthPlace);
      setLatitude(initialProfile.latitude);
      setLongitude(initialProfile.longitude);
      setFocusAreas(initialProfile.focusAreas);
      setHoroscopeSystem(initialProfile.horoscopeSystem || 'vedic');
      setNotes(initialProfile.notes || '');
    }
  }, [isOpen, initialProfile]);

  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
      } else {
        alert("Location not found. Please try adding more details (e.g., 'Nandigram, West Bengal').");
      }
    } catch (err) {
      console.error('Failed to fetch location coordinates', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleCitySelect = (city: typeof PRESET_CITIES[0]) => {
    setBirthPlace(city.name);
    setLatitude(city.lat);
    setLongitude(city.lng);
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const profile: UserProfile = {
      id: initialProfile?.id || `profile-${Date.now()}`,
      fullName: fullName.trim(),
      gender,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      timezone: 5.5,
      focusAreas,
      notes,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      isPremium: initialProfile?.isPremium || false,
      horoscopeSystem,
    };

    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`backdrop-blur-2xl border rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto font-sans transition-colors ${
          theme === 'light'
            ? 'bg-[#FAF7F0] border-[#E2DBD0] text-[#1A1816]'
            : 'bg-[#141418]/95 border-[#2A2A2E]/80 text-[#E5E1D8] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg border transition cursor-pointer ${
            theme === 'light'
              ? 'bg-[#EFE9DC] border-[#DDD5C7] text-[#5C574F] hover:bg-[#E5DDCD] hover:text-[#1A1816]'
              : 'bg-[#1A1A1E] border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] hover:bg-[#2A2A2E]'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={`flex items-center space-x-3 mb-6 pb-4 border-b ${theme === 'light' ? 'border-[#E2DBD0]' : 'border-[#2A2A2E]'}`}>
          <AncientTraditionLogo size="md" isLight={theme === 'light'} />
          <div>
            <h2 className={`text-xl font-serif font-bold ${theme === 'light' ? 'text-[#1A1816]' : 'text-[#F0ECE1]'}`}>
              {initialProfile ? 'Edit Astrological Profile' : 'New Astrological & Numerology Profile'}
            </h2>
            <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>
              Accurate birth date, time, coordinates, and calculation system ensure mathematically exact Ascendant, houses, and forecasts.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Horoscope Generation System Selection */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${theme === 'light' ? 'bg-[#F2ECE0] border-[#E2DBD0]' : 'bg-[#08080A] border-[#2A2A2E]'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center space-x-1.5 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
                <Compass className="w-3.5 h-3.5" />
                <span>Type of Horoscope Generation</span>
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                theme === 'light'
                  ? 'bg-[#EAE3D2] text-[#6E685E] border-[#DDD5C7]'
                  : 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]'
              }`}>
                {horoscopeSystem === 'vedic' ? 'Sidereal Nirayana (~24° Lahiri)' : 'Tropical Sayana (Seasonal Equinox)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Vedic Option */}
              <div
                onClick={() => setHoroscopeSystem('vedic')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  horoscopeSystem === 'vedic'
                    ? theme === 'light'
                      ? 'bg-[#FFFFFF] border-2 border-[#C9A050] shadow-md shadow-[#C9A050]/15'
                      : 'bg-[#C9A050]/15 border-2 border-[#C9A050] shadow-sm shadow-[#C9A050]/10'
                    : theme === 'light'
                    ? 'bg-[#FAF7F0] border border-[#DDD5C7] hover:border-[#C9A050]/60'
                    : 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#9E9A90]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#C9A050]/20 flex items-center justify-center text-[#C9A050]">
                      <Star className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center space-x-1 ${theme === 'light' ? 'text-[#1A1816]' : 'text-[#F0ECE1]'}`}>
                        <span>Vedic Horoscope</span>
                        <span className="text-[10px] font-normal text-[#C9A050]">(Sidereal)</span>
                      </div>
                      <div className={`text-[10px] ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>Nirayana • 27 Nakshatras</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    horoscopeSystem === 'vedic' ? 'border-[#C9A050] bg-[#C9A050]' : theme === 'light' ? 'border-[#DDD5C7]' : 'border-[#9E9A90]'
                  }`}>
                    {horoscopeSystem === 'vedic' && <Check className="w-2.5 h-2.5 text-[#0D0D0F]" />}
                  </div>
                </div>
                <p className={`text-[11px] mt-2 leading-relaxed ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>
                  Constellation-grounded coordinates using Lahiri Ayanamsha (~24°). Includes Vimshottari Dashas, Nakshatra padas, and Divisional (Varga) charts.
                </p>
              </div>

              {/* Western Option */}
              <div
                onClick={() => setHoroscopeSystem('western')}
                className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                  horoscopeSystem === 'western'
                    ? theme === 'light'
                      ? 'bg-[#FFFFFF] border-2 border-[#C9A050] shadow-md shadow-[#C9A050]/15'
                      : 'bg-[#C9A050]/15 border-2 border-[#C9A050] shadow-sm shadow-[#C9A050]/10'
                    : theme === 'light'
                    ? 'bg-[#FAF7F0] border border-[#DDD5C7] hover:border-[#C9A050]/60'
                    : 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#9E9A90]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-[#C9A050]/20 flex items-center justify-center text-[#C9A050]">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold flex items-center space-x-1 ${theme === 'light' ? 'text-[#1A1816]' : 'text-[#F0ECE1]'}`}>
                        <span>Western Horoscope</span>
                        <span className="text-[10px] font-normal text-[#C9A050]">(Tropical)</span>
                      </div>
                      <div className={`text-[10px] ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>Sayana &middot; Equinox Based</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    horoscopeSystem === 'western' ? 'border-[#C9A050] bg-[#C9A050]' : theme === 'light' ? 'border-[#DDD5C7]' : 'border-[#9E9A90]'
                  }`}>
                    {horoscopeSystem === 'western' && <Check className="w-2.5 h-2.5 text-[#0D0D0F]" />}
                  </div>
                </div>
                <p className={`text-[11px] mt-2 leading-relaxed ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>
                  Seasonal equinox-aligned zodiac coordinates (0° Aries at Vernal Equinox). Focuses on geometric planetary aspects (trines, squares) & psychological houses.
                </p>
              </div>
            </div>
          </div>

          {/* Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
                Full Name (for Chaldean & Vedic Name Vibrations)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#9E9A90]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#C9A050] ${
                    theme === 'light'
                      ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816] placeholder-[#9E9A90]'
                      : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1] placeholder-[#9E9A90]/60'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>Gender</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#C9A050] cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816]'
                    : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1]'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Birth Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 flex items-center space-x-1 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
                <Calendar className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>Date of Birth</span>
              </label>
              <VedicDatePicker
                value={birthDate}
                onChange={(newDate) => setBirthDate(newDate)}
                theme={theme}
                placeholder="Select Date of Birth"
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 flex items-center justify-between ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
                  <span>Exact Time of Birth</span>
                </span>
                <span className={`text-[10px] font-normal ${theme === 'light' ? 'text-[#6E685E]' : 'text-gray-400'}`}>(Optional)</span>
              </label>
              <VedicTimePicker
                value={birthTime}
                onChange={(newTime) => setBirthTime(newTime)}
                theme={theme}
                placeholder="HH:MM (e.g. 10:30)"
              />
            </div>
          </div>

          {/* Birth Place */}
          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center space-x-1 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
              <MapPin className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>Place of Birth (City, Country)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g. New Delhi, India"
                className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#C9A050] ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816] placeholder-[#9E9A90]'
                    : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1] placeholder-[#9E9A90]/60'
                }`}
              />
              <button
                type="button"
                onClick={() => handleLocationSearch(birthPlace)}
                disabled={isSearchingLocation || !birthPlace.trim()}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#EAE3D2] hover:bg-[#C9A050] text-[#5C574F] hover:text-[#0D0D0F] border border-[#DDD5C7]'
                    : 'bg-[#2A2A2E] hover:bg-[#C9A050] text-[#9E9A90] hover:text-[#0D0D0F] border border-[#3A3A3E]'
                }`}
              >
                {isSearchingLocation ? 'Detecting...' : 'Auto Detect'}
              </button>
            </div>

            {/* Quick preset city chips */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className={`text-[11px] self-center mr-1 ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>Quick Select:</span>
              {PRESET_CITIES.slice(0, 8).map((city) => (
                <button
                  type="button"
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                    birthPlace === city.name
                      ? theme === 'light'
                        ? 'bg-[#F4EBD9] text-[#7A5210] border-[#C9A050] font-bold'
                        : 'bg-[#C9A050]/20 text-[#C9A050] border-[#C9A050]/40 font-bold'
                      : theme === 'light'
                      ? 'bg-[#FFFFFF] text-[#5C574F] border-[#DDD5C7] hover:border-[#C9A050]'
                      : 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E] hover:border-[#9E9A90]'
                  }`}
                >
                  {city.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates (Auto-calculated / Advanced) */}
          <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border ${theme === 'light' ? 'bg-[#F2ECE0] border-[#E2DBD0]' : 'bg-[#08080A] border-[#2A2A2E]'}`}>
            <div>
              <label className={`block text-[11px] mb-1 ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>Latitude (°N/S)</label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                placeholder="e.g., 23.8103"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded text-xs focus:outline-none focus:border-[#C9A050] ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816]'
                    : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1]'
                }`}
              />
            </div>
            <div>
              <label className={`block text-[11px] mb-1 ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>Longitude (°E/W)</label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                placeholder="e.g., 90.4125"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded text-xs focus:outline-none focus:border-[#C9A050] ${
                  theme === 'light'
                    ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816]'
                    : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1]'
                }`}
              />
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className={`block text-xs font-semibold mb-2 flex items-center space-x-1 ${theme === 'light' ? 'text-[#8C6218]' : 'text-[#C9A050]'}`}>
              <Target className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>Primary Consultation Focus Areas</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FOCUS_AREA_OPTIONS.map((area) => {
                const isSelected = focusAreas.includes(area);
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => toggleFocusArea(area)}
                    className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-[#FFFFFF] border-2 border-[#C9A050] text-[#7A5210] font-bold shadow-sm'
                          : 'bg-[#C9A050]/20 border border-[#C9A050]/60 text-[#C9A050]'
                        : theme === 'light'
                        ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#5C574F] hover:border-[#C9A050]'
                        : 'bg-[#1A1A1E] border-[#2A2A2E] text-[#9E9A90] hover:border-[#9E9A90]'
                    }`}
                  >
                    <span>{area}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A050] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme === 'light' ? 'text-[#6E685E]' : 'text-[#9E9A90]'}`}>
              Specific Questions or Life Context (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Planning a business launch in 2027, looking for auspicious timing and partner compatibility..."
              className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#C9A050] ${
                theme === 'light'
                  ? 'bg-[#FFFFFF] border border-[#DDD5C7] text-[#1A1816] placeholder-[#9E9A90]'
                  : 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#F0ECE1] placeholder-[#9E9A90]/60'
              }`}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                theme === 'light'
                  ? 'border-[#DDD5C7] text-[#5C574F] hover:bg-[#EFE9DC] hover:text-[#1A1816]'
                  : 'border-[#2A2A2E] text-[#9E9A90] hover:bg-[#1A1A1E] hover:text-[#F0ECE1]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 cursor-pointer transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Profile & Update Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
