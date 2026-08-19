import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getErrorMessage } from '../utils/errorHandling';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = inputValue.trim();
      if (trimmed.length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('title')
          .ilike('title', `%${trimmed}%`)
          .limit(10);

        if (!error && data) {
          const uniqueTitles = Array.from(new Set(data.map((p) => p.title)));
          const sortedTitles = uniqueTitles.sort((a, b) => {
            const indexA = a.toLowerCase().indexOf(trimmed.toLowerCase());
            const indexB = b.toLowerCase().indexOf(trimmed.toLowerCase());
            return indexA - indexB;
          });

          setSuggestions(sortedTitles.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching saree search suggestions:', getErrorMessage(err));
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 150);

    return () => clearTimeout(debounce);
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchTrigger = (queryToSend: string) => {
    onSearch(queryToSend);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchTrigger(inputValue);
    }
  };

  const handleClearSearch = () => {
    setInputValue('');
    onSearch('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <b key={i} className="text-rose-950 font-black">
              {part}
            </b>
          ) : (
            <span key={i} className="text-gray-600 font-medium">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4 px-2 box-border relative z-40" ref={dropdownRef}>
      <div className="flex items-center bg-white border-2 border-rose-200 rounded-2xl overflow-hidden shadow-xs hover:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/20 focus-within:border-rose-700 transition-all duration-150">
        <div className="flex-1 flex items-center relative min-w-0">
          <input
            type="text"
            value={inputValue}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search Menakkhi Sarees (Katan, Jamdani, Silk)..."
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-4 pr-10 py-3 bg-transparent font-sans text-rose-950 placeholder-gray-400 text-xs sm:text-sm font-bold outline-none border-none"
          />

          {inputValue.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 bg-gray-100 hover:bg-rose-100 text-rose-950 font-black text-xs transition rounded-full flex items-center justify-center w-6 h-6 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSearchTrigger(inputValue)}
          className="bg-rose-900 hover:bg-rose-800 text-amber-200 self-stretch px-6 flex items-center justify-center cursor-pointer transition shrink-0 font-bold text-xs uppercase tracking-wider"
          title="Submit Search"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-1 right-1 mt-2 bg-white border border-rose-100 shadow-2xl rounded-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                setInputValue(suggestion);
                handleSearchTrigger(suggestion);
              }}
              className="px-4 py-3 text-xs sm:text-sm hover:bg-rose-50 cursor-pointer transition flex items-center gap-3 border-b border-rose-50 last:border-none"
            >
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="truncate">{renderHighlightedText(suggestion, inputValue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}