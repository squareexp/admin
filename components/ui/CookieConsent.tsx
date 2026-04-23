"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight2 } from "iconsax-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("analytics");

  useEffect(() => {
    // ! Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 max-w-[400px] w-[calc(100%-3rem)]"
        >
          <div className="bg-[#111113] border border-[#222] rounded-3xl p-6 shadow-2xl overflow-hidden">
            
            <p className="text-[#888] text-sm mb-6 leading-relaxed">
              This site uses cookies to store information on your device. Some are essential, while others help us enhance your experience by providing insights into how our website is used.
            </p>

            <div className="space-y-4 mb-8">
              
              {/* Necessary Cookies */}
              <div>
                <button 
                  onClick={() => toggleSection("necessary")}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight2 
                      size={14} 
                      className={`text-[#666] transition-transform duration-300 ${expandedSection === "necessary" ? "rotate-90" : ""}`} 
                    />
                    <span className="text-white font-medium text-sm">Necessary Cookies</span>
                  </div>
                  <span className="text-[#444] text-xs font-medium">Always Active</span>
                </button>
                
                <AnimatePresence>
                  {expandedSection === "necessary" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#666] text-xs mt-3 leading-relaxed">
                        Enable core functionality like navigation and access to secure areas. The website may not function properly without these and can only be disabled through browser settings.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-[#222] w-full" />

              {/* Analytics Cookies */}
              <div>
                <button 
                  onClick={() => toggleSection("analytics")}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight2 
                      size={14} 
                      className={`text-[#666] transition-transform duration-300 ${expandedSection === "analytics" ? "rotate-90" : ""}`} 
                    />
                    <span className="text-white font-medium text-sm">Analytics Cookies</span>
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedSection === "analytics" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#666] text-xs mt-3 leading-relaxed">
                        Help us improve our website by collecting and reporting usage information.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-[#222] w-full" />

            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleReject}
                className="flex-1 py-3 px-4 rounded-full  border border-[#333] text-white text-sm font-medium hover:bg-[#222] transition-colors"
              >
                Reject Analytics
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 py-3 px-4 rounded-full  bg-white text-black text-sm font-medium hover:bg-[#DFFF00] transition-colors"
              >
                Accept All
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}