"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signInWithGoogle, signOut } = useAuth();

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

  return (
    <header className="w-full bg-mwg-dark border-b border-mwg-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo on the left */}
          <Link href="/" className="flex-shrink-0">
            <Logo height={120} width={360} />
          </Link>
          
          {/* Navigation and admin on the right */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors duration-200 hover:text-mwg-accent ${pathname === link.href ? "text-mwg-accent" : "text-mwg-text"}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Admin Icon */}
            <div className="relative">
              <button
                aria-label="Admin"
                className="ml-2 p-2 rounded-full hover:bg-mwg-accent/10 transition-colors"
                onClick={() => {
                  if (user) {
                    setShowAdminMenu((prev) => !prev);
                  } else {
                    setShowAdminModal(true);
                  }
                }}
              >
                {/* Simple lock icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-mwg-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.5 0h-9m9 0A2.5 2.5 0 0121 13v4.5A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5V13a2.5 2.5 0 012.5-2.5m9 0V7.5A4.5 4.5 0 008 7.5v3" />
                </svg>
              </button>
              {/* Admin Dropdown Menu */}
              {user && showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-mwg-dark hover:bg-mwg-accent/10"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    Admin Dashboard
                  </Link>
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
        </div>
      </div>

      {/* Admin Modal */}
      {!user && showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg min-w-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Admin Sign In</h2>
              <button onClick={() => setShowAdminModal(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-mwg-accent text-white font-semibold py-2 px-4 rounded hover:bg-mwg-accent/90 transition-colors disabled:opacity-60"
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