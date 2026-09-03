"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IoClose, IoMenu } from "react-icons/io5";
import {
  FiLogOut,
  FiDollarSign,
  FiPlus,
  FiUser,
  FiSettings,
  FiShield,
  FiKey,
} from "react-icons/fi";
import config from "@/lib/config";
import Tooltip from "@/components/Tooltip";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [appName, setAppName] = useState(config?.appName || "Seedance V2 Workspace");

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.appName) setAppName(data.appName);
      })
      .catch((err) => console.error(err));
  }, []);

  const logoLetter = appName.trim().charAt(0).toUpperCase();

  const navLinks = [
    { name: "Overview", path: "/" },
    { name: "Studio", path: "/workspace" },
    { name: "Sequencer", path: "/sequencer" },
    { name: "MCP", path: "/mcp" },
    { name: "Showcase", path: "/gallery" },
    { name: "Pricing", path: "/pricing" },
  ];

  const isAdmin = session?.user?.role === "admin";
  const isByok = session?.user?.byokEnabled;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-divider/50 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo and Brand Title */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg shadow-md shadow-primary/30">
            {logoLetter}
          </div>
          <span className="text-lg font-black tracking-tight text-primary-text text-nowrap">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] font-semibold transition-all relative py-1 ${
                  isActive ? "text-primary" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Tooltip content="Access administration console, Stripe/PayPal billing, and API keys">
              <Link
                href="/admin"
                className={`text-[13px] font-bold transition-all relative py-1 flex items-center gap-1 ${
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <FiShield size={13} />
                <span>Admin</span>
                {pathname.startsWith("/admin") && (
                  <div className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            </Tooltip>
          )}
        </nav>

        {/* Desktop Actions Section */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/workspace"
            className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-black text-xs font-black shadow-md shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
          >
            <span>Launch Studio</span>
          </Link>

          {status === "authenticated" ? (
            <div className="flex items-center">
              {/* BYOK or Credit Balance indicator */}
              {isByok ? (
                <Tooltip content="Bring-Your-Own-Key is active. All video generations consume 0 platform credits.">
                  <Link
                    href="/settings"
                    className="flex items-center h-9 border border-emerald-500/40 rounded-l bg-emerald-500/10 px-3 text-emerald-400 text-xs font-bold gap-1.5 hover:bg-emerald-500/20 transition-colors"
                  >
                    <FiKey size={12} />
                    <span>BYOK Mode</span>
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip content="Current available studio credits. Click + to buy credit packs.">
                  <div className="flex items-center h-9 border border-divider rounded-l bg-bg-page/30 overflow-hidden pr-2">
                    <span className="font-bold text-[13px] px-3 flex items-center text-primary-text gap-1">
                      <FiDollarSign className="text-emerald-500 text-xs" />
                      {session.user.credits !== undefined ? session.user.credits : 0}
                    </span>
                    <Link
                      href="/pricing"
                      className="flex items-center justify-center w-5 h-5 rounded hover:bg-bg-card text-secondary-text transition-colors"
                      title="Buy Credits"
                    >
                      <FiPlus size={14} />
                    </Link>
                  </div>
                </Tooltip>
              )}

              {/* Profile Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 250)}
                  className="h-9 w-9 flex items-center justify-center border-y border-r border-divider rounded-r bg-bg-page/30 hover:bg-bg-page transition-colors cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-secondary-text" size={16} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-11 w-52 rounded-xl border border-glass-border bg-bg-card p-1.5 shadow-2xl z-[100] animate-scale-up space-y-1">
                    <div className="px-3 py-2 text-xs border-b border-divider/50">
                      <p className="font-bold text-foreground truncate">
                        {session.user.name || "Creator"}
                      </p>
                      <p className="text-[10px] text-muted truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/settings"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-secondary-text hover:text-foreground hover:bg-glass-hover transition-colors"
                    >
                      <FiSettings size={13} />
                      <span>Settings & BYOK</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <FiShield size={13} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors border-t border-divider/30 pt-2"
                    >
                      <FiLogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Navbar Hamburger Menu Controls */}
        <div className="flex md:hidden items-center gap-2">
          {status === "authenticated" && (
            <div className="flex items-center h-8 border border-divider rounded bg-bg-page/30 px-2.5 text-xs font-bold text-primary-text gap-0.5">
              {isByok ? (
                <span className="text-emerald-400 text-[10px]">BYOK</span>
              ) : (
                <>
                  <FiDollarSign className="text-emerald-500 text-[10px]" />
                  {session.user.credits !== undefined ? session.user.credits : 0}
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-bg-card p-2 rounded cursor-pointer transition-colors text-primary-text border border-divider/50"
            aria-label="Toggle Menu"
          >
            {isOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[200] glass-dropdown border-b border-divider shadow-2xl py-4 px-6 md:hidden animate-fade-in space-y-3">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="py-2 text-sm font-semibold text-secondary-text hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}

            {status === "authenticated" && (
              <>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-sm font-semibold text-secondary-text hover:text-foreground flex items-center gap-2"
                >
                  <FiSettings size={14} /> Settings & BYOK
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2"
                  >
                    <FiShield size={14} /> Admin Console
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="py-2 text-left text-sm font-semibold text-red-500 flex items-center gap-2 border-t border-divider/30 pt-3"
                >
                  <FiLogOut size={14} /> Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
