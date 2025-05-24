"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

// Keep in sync with middleware.ts and check-admin API
const ADMIN_EMAILS = [
  "Kenneth.j1698@gmail.com",
  "jpotts2@mail.bradley.edu"
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (user && user.email) {
      const isAdminUser = ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase());
      console.log(`Navbar - Checking admin status for ${user.email}: ${isAdminUser ? 'Admin' : 'Not Admin'}`);
      setIsAdmin(isAdminUser);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to sign in with Google...");
      await signInWithGoogle();
      console.log("Sign in successful");
      setShowAdminModal(false);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowAdminMenu(false);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    }
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    console.log("Admin dashboard link clicked - navigating directly to /admin");
    setShowAdminMenu(false);
    setShowMobileMenu(false);
    // Router navigation instead of Link to ensure we're not doing any unnecessary checks
    router.push("/admin");
    // Prevent default behavior to avoid any Link component handling
    e.preventDefault();
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="w-full bg-mwg-dark border-b border-mwg-border sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo on the left */}
          <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <Logo height={80} width={240} />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors duration-200 hover:text-mwg-accent ${pathname === link.href ? "text-mwg-accent" : "text-mwg-text"}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Desktop Admin Icon */}
            <div className="relative">
              <button
                aria-label="Admin"
                className="ml-2 p-2 rounded-full hover:bg-mwg-accent/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => {
                  if (user) {
                    setShowAdminMenu((prev) => !prev);
                  } else {
                    setShowAdminModal(true);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-mwg-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.5 0h-9m9 0A2.5 2.5 0 0121 13v4.5A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5V13a2.5 2.5 0 012.5-2.5m9 0V7.5A4.5 4.5 0 008 7.5v3" />
                </svg>
              </button>
              {/* Desktop Admin Dropdown Menu */}
              {user && showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
                  <div className="py-1 border-b border-gray-200 px-4 text-xs text-gray-500">
                    Signed in as {user.email}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={handleAdminClick}
                      className="block w-full text-left px-4 py-2 text-mwg-dark hover:bg-mwg-accent/10 font-medium"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-mwg-dark hover:bg-mwg-accent/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Admin Icon */}
            <button
              aria-label="Admin"
              className="p-2 rounded-full hover:bg-mwg-accent/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => {
                if (user) {
                  setShowAdminMenu((prev) => !prev);
                } else {
                  setShowAdminModal(true);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-mwg-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.5 0h-9m9 0A2.5 2.5 0 0121 13v4.5A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5V13a2.5 2.5 0 012.5-2.5m9 0V7.5A4.5 4.5 0 008 7.5v3" />
              </svg>
            </button>

            {/* Hamburger menu button */}
            <button
              aria-label="Toggle menu"
              className="p-2 rounded-md hover:bg-mwg-accent/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg 
                className="w-6 h-6 text-mwg-text" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-mwg-border bg-mwg-dark">
            <nav className="py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-medium transition-colors duration-200 hover:bg-mwg-accent/10 hover:text-mwg-accent ${pathname === link.href ? "text-mwg-accent bg-mwg-accent/5" : "text-mwg-text"}`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Mobile Admin Dropdown Menu */}
        {user && showAdminMenu && (
          <div className="md:hidden absolute right-4 top-20 w-48 bg-white rounded shadow-lg z-50">
            <div className="py-1 border-b border-gray-200 px-4 text-xs text-gray-500">
              Signed in as {user.email}
            </div>
            {isAdmin && (
              <button
                onClick={handleAdminClick}
                className="block w-full text-left px-4 py-3 text-mwg-dark hover:bg-mwg-accent/10 font-medium"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 text-mwg-dark hover:bg-mwg-accent/10"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Admin Modal - Mobile Optimized */}
      {!user && showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-mwg-dark">Admin Sign In</h2>
              <button 
                onClick={() => setShowAdminModal(false)} 
                className="text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-mwg-accent text-white font-semibold py-3 px-4 rounded hover:bg-mwg-accent/90 transition-colors disabled:opacity-60 min-h-[44px]"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.9 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.9 41.1 27.1 42 24 42c-5.8 0-10.7-3.9-12.5-9.3l-7 5.4C7.6 39.3 15.1 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.6 0-8.3-3.7-8.3-8.3s3.7-8.3 8.3-8.3c2.1 0 4 .8 5.5 2.1l6.6-6.6C36.7 7.6 30.7 5 24 5c-9.9 0-18 8.1-18 18s8.1 18 18 18c8.7 0 16-6.3 17.7-14.5.2-.7.3-1.5.3-2.5 0-1.3-.1-2.7-.5-4z"/></g></svg>
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
          </div>
        </div>
      )}
    </header>
  );
} 