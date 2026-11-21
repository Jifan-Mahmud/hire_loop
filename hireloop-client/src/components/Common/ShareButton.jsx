"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link as LinkIcon, Copy, CopyCheck } from "@gravity-ui/icons";

export default function ShareButton({
  url = "",
  title = "Check this out on HireLoop",
  text = "Exciting career opportunity on HireLoop!",
  variant = "button", // 'button' | 'icon' | 'compact'
  label = "Share",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Construct absolute shareable URL
  const getAbsoluteUrl = () => {
    if (typeof window === "undefined") return url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const origin = window.location.origin;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  };

  const handleCopyLink = async (e) => {
    e?.stopPropagation();
    const shareUrl = getAbsoluteUrl();

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async (e) => {
    e?.stopPropagation();
    const shareUrl = getAbsoluteUrl();
    if (navigator?.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    }
    // If native share not supported or cancelled, toggle dropdown
    setOpenDropdown((prev) => !prev);
  };

  // Social Share URLs
  const shareUrl = typeof window !== "undefined" ? getAbsoluteUrl() : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title} - ${text}`);

  const shareLinks = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-[#0A66C2]",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: "hover:text-[#25D366]",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.62.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.18-.06-.1-.23-.16-.48-.28Z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      {variant === "icon" ? (
        <button
          onClick={handleNativeShare}
          title={copied ? "Link Copied!" : "Share Link"}
          className={`p-2 rounded-xl transition-all border cursor-pointer ${
            copied
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-400 hover:text-white"
          }`}
        >
          {copied ? (
            <CopyCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <LinkIcon className="w-4 h-4" />
          )}
        </button>
      ) : variant === "compact" ? (
        <button
          onClick={handleCopyLink}
          title={copied ? "Link Copied!" : "Copy Shareable Link"}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
            copied
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <CopyCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpenDropdown((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
            copied
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <CopyCheck className="w-4 h-4 text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 text-purple-400" />
              <span>{label}</span>
            </>
          )}
        </button>
      )}

      {/* DROPDOWN MENU */}
      {openDropdown && (
        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-56 rounded-2xl bg-[#14141c] border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold border-b border-white/[0.08]">
            Share via
          </div>

          <div className="py-1 space-y-0.5">
            {/* Quick Copy Link Option */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-purple-400" />
                <span>{copied ? "Copied to clipboard!" : "Copy link"}</span>
              </div>
              {copied && <span className="text-[10px] font-mono text-emerald-400">✓</span>}
            </button>

            {/* Social Share Options */}
            {shareLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenDropdown(false)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/10 transition-colors ${item.color}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Shareable Link Display preview */}
          <div className="mt-1 pt-1.5 border-t border-white/[0.08] px-2.5 pb-1">
            <p className="text-[10px] text-neutral-500 truncate font-mono">
              {shareUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
