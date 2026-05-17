"use client";

import { useEffect, useCallback, useRef } from "react";
import styles from "./OnboardingModal.module.css";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    icon: "🔗",
    step: "01",
    title: "Connect Your Google Account",
    items: [
      "Click \"Continue with Google\" on the login screen",
      "Choose your Gmail account from the picker",
      "Grant the required permissions when prompted",
    ],
  },
  {
    icon: "🧠",
    step: "02",
    title: "Why We Request Gmail Access",
    items: [
      "DailyFix reads your important emails automatically",
      "Converts urgent mails into actionable tasks",
      "Generates AI-powered summaries for quick context",
      "Sends smart reminders and task update notifications",
      "No passwords are ever stored — OAuth2 only",
    ],
  },
  {
    icon: "⚙️",
    step: "03",
    title: "Important Browser Settings",
    items: [
      "Ensure cookies are enabled in your browser",
      "Allow third-party cookies if you experience login loops",
      "Use Chrome or Edge for the best compatibility",
    ],
  },
  {
    icon: "🛠️",
    step: "04",
    title: "Troubleshooting",
    items: [
      "403 Forbidden error → disconnect and reconnect your account",
      "Stuck in login loop → clear cookies and retry",
      "Sync not working → logout, then log back in",
    ],
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus the close button for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerBadge}>SETUP GUIDE</span>
            <h2 id="onboarding-title" className={styles.headerTitle}>
              Get Started with DailyFix
            </h2>
            <p className={styles.headerSubtitle}>
              Follow these steps to activate your AI-powered task engine
            </p>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close setup guide"
          >
            ✕
          </button>
        </div>

        {/* Sections */}
        <div className={styles.body}>
          {SECTIONS.map((section) => (
            <div key={section.step} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <div>
                  <span className={styles.sectionStep}>STEP {section.step}</span>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                </div>
              </div>
              <ul className={styles.list}>
                {section.items.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerNote}>
            🔒 DailyFix never stores your password. All auth is handled via Google OAuth2.
          </p>
          <button className={styles.gotItBtn} onClick={onClose}>
            Got it, let&apos;s go →
          </button>
        </div>
      </div>
    </div>
  );
}
