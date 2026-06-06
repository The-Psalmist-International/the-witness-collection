"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { searchPlaces } from "@/app/actions/places";

type LocationAutocompleteProps = {
  id: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function LocationAutocomplete({
  id,
  name,
  required = false,
  placeholder = "Start typing your delivery address",
  className,
}: LocationAutocompleteProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(
    null
  );
  const canUsePortal = typeof document !== "undefined";
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const updateDropdownPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(224, openUpward ? spaceAbove : spaceBelow));

    setDropdownPosition({
      top: openUpward ? rect.top - maxHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, suggestions.length, updateDropdownPosition]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !(target instanceof Element && target.closest("[data-location-dropdown]"))
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectSuggestion = (address: string) => {
    setValue(address);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setIsLoading(false);
  };

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    setActiveIndex(-1);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (nextValue.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(false);

    debounceRef.current = window.setTimeout(async () => {
      const requestId = ++requestIdRef.current;

      try {
        const results = await searchPlaces(nextValue);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(results);
        setHasSearched(true);
        setIsOpen(true);
        updateDropdownPosition();
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const dropdown =
    canUsePortal &&
    isOpen &&
    hasSearched &&
    dropdownPosition &&
    createPortal(
      <div
        data-location-dropdown
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: dropdownPosition.maxHeight,
        }}
        className="fixed z-[200] overflow-hidden rounded-md border border-neutral-300 bg-white shadow-2xl"
      >
        {suggestions.length > 0 ? (
          <ul id={listboxId} role="listbox" className="max-h-full overflow-y-auto py-1">
            {suggestions.map((address, index) => (
              <li
                key={`${address}-${index}`}
                role="option"
                aria-selected={activeIndex === index}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(address)}
                  className={`pressable w-full px-3 py-2.5 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100 active:bg-neutral-200 ${
                    activeIndex === index ? "bg-neutral-100" : ""
                  }`}
                >
                  {address}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-2.5 text-sm text-neutral-500">
            No addresses found. Keep typing or enter your address manually.
          </p>
        )}
      </div>,
      document.body
    );

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          updateDropdownPosition();
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />

      {isLoading && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          ...
        </span>
      )}

      {dropdown}
    </div>
  );
}
