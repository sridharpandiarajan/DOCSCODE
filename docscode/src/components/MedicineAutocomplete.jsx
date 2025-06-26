import { useState } from "react";
import medicineData from "../data/medicineData.json";

const MedicineAutocomplete = ({ value, onChange }) => {
  const [filtered, setFiltered] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(input);

    if (input.length === 0) {
      setFiltered([]);
      setShowSuggestions(false);
    } else {
      const matches = medicineData.filter((item) =>
        item.brand.toLowerCase().includes(input.toLowerCase())
      );
      setFiltered(matches);
      setShowSuggestions(true);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex].brand);
      }
    }
  };

  const handleSelect = (brandName) => {
    onChange(brandName);
    setFiltered([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Tablet name"
        autoComplete="off"
      />
      {showSuggestions && filtered.length > 0 && (
        <ul
          style={{
            position: "absolute",
            background: "white",
            border: "1px solid grey",
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {filtered.map((item, index) => (
            <li
                key={index}
                ref={(el) => {
                if (index === activeIndex && el) {
                    el.scrollIntoView({ block: "nearest" });
                }
                }}
                onClick={() => handleSelect(item.brand)}
                style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                backgroundColor: index === activeIndex ? "#e6f7ff" : "white",
                }}
                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
                 onMouseLeave={(e) =>
                 (e.currentTarget.style.backgroundColor =
                    index === activeIndex ? "#e6f7ff" : "white")   
    }
            >
                {item.brand} <small>({item.generic})</small>
            </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default MedicineAutocomplete;
