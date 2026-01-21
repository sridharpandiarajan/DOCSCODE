import { useState, useRef, useEffect } from "react";
import medicineData from "../data/medicineData.json";
import "./MedicineAutocomplete.css"; // We will create this file below

const MedicineAutocomplete = ({ value, onChange }) => {
  const [filtered, setFiltered] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const listRef = useRef(null);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(input);

    if (input.length === 0) {
      setFiltered([]);
      setShowSuggestions(false);
    } else {
      // Limit results to 10 for performance and UI cleanliness
      const matches = medicineData
        .filter((item) =>
          item.brand.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 10); 
      setFiltered(matches);
      setShowSuggestions(true);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevent cursor moving
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault(); // Prevent form submission
        handleSelect(filtered[activeIndex].brand);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (brandName) => {
    onChange(brandName);
    setFiltered([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  // Auto-scroll to active item when using keyboard
  useEffect(() => {
    if (activeIndex !== -1 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  return (
    <div className="med-autocomplete-wrapper">
      <div className="med-input-container">
        {/* Search Icon SVG */}
        <svg 
          className="med-search-icon" 
          width="16" height="16" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2.5" 
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        
        <input
          type="text"
          className="med-input"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value && filtered.length > 0 && setShowSuggestions(true)}
          placeholder="Search tablet..."
          autoComplete="off"
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <ul className="med-suggestions-list" ref={listRef}>
          {filtered.map((item, index) => (
            <li
              key={index}
              className={`med-suggestion-item ${index === activeIndex ? "active" : ""}`}
              onClick={() => handleSelect(item.brand)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="med-brand">{item.brand}</span>
              <span className="med-generic">{item.generic}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicineAutocomplete;