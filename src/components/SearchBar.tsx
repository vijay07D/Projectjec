import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff, MapPin, Users, X, Clock } from 'lucide-react';
import { useWaterStore } from '../store/useWaterStore';
import { translations } from '../translations';
import { Zone } from '../types';

export const SearchBar: React.FC = () => {
  const {
    language,
    zones,
    metrics,
    focusZoneById,
    recentSearches,
    addRecentSearch,
  } = useWaterStore();
  const t = translations[language];

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter zones matching query
  const filteredZones = query.trim()
    ? zones.filter((zone) => {
        const q = query.toLowerCase().trim();
        const nameEn = zone.name.toLowerCase();
        const nameHi = zone.name_hi.toLowerCase();
        const cityEn = zone.city.toLowerCase();
        const cityHi = zone.city_hi.toLowerCase();
        const wardStr = `ward ${zone.ward_number}`;
        const wardStrHi = `वार्ड ${zone.ward_number}`;
        return (
          nameEn.includes(q) ||
          nameHi.includes(q) ||
          cityEn.includes(q) ||
          cityHi.includes(q) ||
          wardStr.includes(q) ||
          wardStrHi.includes(q)
        );
      })
    : [];

  const handleSelectZone = (zone: Zone) => {
    focusZoneById(zone.id);
    addRecentSearch(language === 'hi' ? zone.name_hi : zone.name);
    setQuery('');
    setIsOpen(false);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    // Find matching zone if exact
    const matched = zones.find(
      (z) =>
        z.name.toLowerCase().includes(term.toLowerCase()) ||
        z.name_hi.toLowerCase().includes(term.toLowerCase()) ||
        `ward ${z.ward_number}`.toLowerCase() === term.toLowerCase()
    );
    if (matched) {
      focusZoneById(matched.id);
    } else {
      setIsOpen(true);
    }
  };

  // Voice recognition support with Web Speech API
  const handleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation for devices without Web Speech API
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const voiceSuggestion = language === 'hi' ? 'वार्ड 5' : 'Ward 5';
        setQuery(voiceSuggestion);
        setIsOpen(true);
        const match = zones.find((z) => z.ward_number === 5);
        if (match) {
          focusZoneById(match.id);
        }
      }, 1500);
      return;
    }

    try {
      // Use speech recognition
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsOpen(true);
        setIsListening(false);

        // Auto match
        const found = zones.find(
          (z) =>
            z.name.toLowerCase().includes(transcript.toLowerCase()) ||
            z.name_hi.toLowerCase().includes(transcript.toLowerCase()) ||
            transcript.includes(`${z.ward_number}`)
        );
        if (found) {
          focusZoneById(found.id);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechError('Speech recognition timed out');
        setTimeout(() => setSpeechError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const getStatusBadge = (zoneId: string) => {
    const metric = metrics[zoneId];
    if (!metric) return null;

    if (metric.status === 'deficit') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>{language === 'hi' ? 'कमी' : 'Deficit'}</span>
        </span>
      );
    }
    if (metric.status === 'tight') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{language === 'hi' ? 'नाजुक' : 'Tight'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>{language === 'hi' ? 'अधिशेष' : 'Surplus'}</span>
      </span>
    );
  };

  return (
    <section id="search-section" className="w-full py-2" aria-label="Search Zones">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={containerRef} className="relative w-full">
          {/* Main Search Input Box */}
          <div className="relative flex items-center bg-white rounded-lg border-2 border-slate-300 focus-within:border-[#0A4D8C] focus-within:ring-2 focus-within:ring-[#00B4D8]/30 shadow-xs transition-all">
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-slate-500" />
            </div>

            <input
              id="search-ward-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={t.searchPlaceholder}
              className="w-full py-3 pr-20 text-base text-[#1E293B] placeholder-slate-400 bg-transparent focus:outline-none min-h-[48px]"
              aria-label={t.searchPlaceholder}
              autoComplete="off"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Input Mic Button */}
            <button
              id="voice-search-mic-btn"
              type="button"
              onClick={handleVoiceInput}
              title={t.voiceSearchTooltip}
              aria-label={t.voiceSearchTooltip}
              className={`p-2.5 mr-1.5 rounded-md transition-all flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0A4D8C]'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Listening Indicator */}
          {isListening && (
            <div className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1 px-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {t.listening}
            </div>
          )}

          {speechError && (
            <div className="mt-1 text-xs text-amber-600 font-medium px-2">
              {speechError}
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {isOpen && query.trim().length > 0 && (
            <div
              id="search-autocomplete-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto divide-y divide-slate-100"
            >
              {filteredZones.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">
                  {t.noResults} "{query}"
                </div>
              ) : (
                filteredZones.map((zone) => {
                  const metric = metrics[zone.id];
                  const zoneName = language === 'hi' ? zone.name_hi : zone.name;
                  const cityName = language === 'hi' ? zone.city_hi : zone.city;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleSelectZone(zone)}
                      className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors cursor-pointer focus:bg-slate-100 focus:outline-none min-h-[48px]"
                    >
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#0A4D8C] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B]">
                            {zoneName}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>{cityName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {zone.population.toLocaleString()} {t.people}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{zone.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(zone.id)}
                        {metric && (
                          <div className="text-right hidden xs:block">
                            <span className="text-xs font-bold text-slate-700 block">
                              {metric.supply_met_percent}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {metric.supply_m3_day} / {metric.demand_m3_day} m³
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Recent Searches Row */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {t.recentSearches}:
            </span>
            {recentSearches.map((item, idx) => (
              <button
                key={`${item}-${idx}`}
                onClick={() => handleRecentClick(item)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors font-medium cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
