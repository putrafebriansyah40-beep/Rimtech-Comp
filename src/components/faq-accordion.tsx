"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  // Default first item opened
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {items.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`faq-item ${isOpen ? "active" : ""}`}>
            <button
              type="button"
              className="faq-trigger"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <ChevronDown className="faq-chevron" style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
            {isOpen && (
              <div className="faq-body">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
