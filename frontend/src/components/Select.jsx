import React, { useEffect, useRef, useState } from 'react';

/**
 * Professional dropdown that replaces the native <select>.
 * Drop-in compatible: emits { target: { name, value } } so existing
 * handleChange handlers work unchanged.
 */
const Select = ({
  value,
  onChange,
  options = [],
  name,
  id,
  disabled,
  placeholder = 'Select…',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const choose = (opt) => {
    onChange?.({ target: { name, value: opt.value } });
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlight >= 0) {
        choose(options[highlight]);
      } else {
        setOpen((o) => !o);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? 'border-brand-blue ring-2 ring-brand-blue/20'
            : 'border-gray-200 hover:border-gray-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none'
        }`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected?.label || placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-fadeInDown origin-top"
        >
          <div className="max-h-60 overflow-auto py-1">
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHighlighted = i === highlight;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(opt)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-3 transition-colors ${
                    isHighlighted ? 'bg-gray-50' : ''
                  } ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg className="h-4 w-4 text-gray-900" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
