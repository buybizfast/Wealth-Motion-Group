'use client';

import { useState, useEffect } from 'react';
import ContactForm from '../components/ContactForm';
import { getDocuments } from '@/lib/firebase/firebaseUtils';

interface SocialLink {
  name: string;
  value: string;
  url: string;
}

interface ContactInfo {
  id?: string;
  email: string;
  socialLinks: SocialLink[];
}

const CONTACT_COLLECTION = 'contactInfo';

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const docs = await getDocuments(CONTACT_COLLECTION);
        if (docs.length > 0) {
          setContactInfo(docs[0] as ContactInfo);
        } else {
          // Fallback to default data if no document exists
          setContactInfo({
            email: "contact@motionwealthgroup.com",
            socialLinks: [
              {
                name: "LinkedIn",
                value: "Connect on LinkedIn",
                url: "#",
              },
              {
                name: "Twitter",
                value: "@motionwealthgrp",
                url: "https://twitter.com/motionwealthgrp",
              },
              {
                name: "Instagram",
                value: "@motionwealthgroup",
                url: "https://instagram.com/motionwealthgroup",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <section className="w-full flex flex-col items-center pt-12 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          Get in <span className="text-mwg-accent">Touch</span>
        </h1>
        <p className="text-mwg-muted text-center mb-8 max-w-2xl">
          Have questions or want to connect? Reach out through any of these channels.
        </p>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <ContactForm />
          
          {/* Contact Info */}
          <div className="bg-mwg-card border border-mwg-border rounded-lg p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-mwg-text mb-2">Connect With Me</h2>
              <p className="text-mwg-muted mb-4 text-sm">Whether you have questions about investing, want to discuss potential collaborations, or just want to say hello, I&apos;d love to hear from you. Here are the best ways to reach me:</p>
              
              {loading ? (
                <div className="text-mwg-muted">Loading contact information...</div>
              ) : contactInfo ? (
                <ul className="text-mwg-muted text-sm space-y-2">
                  <li><span className="font-semibold text-mwg-accent">Email</span>: {contactInfo.email}</li>
                  {contactInfo.socialLinks.map((link, index) => (
                    <li key={index}>
                      <span className="font-semibold text-mwg-accent">{link.name}</span>: 
                      {link.url !== "#" ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-mwg-accent ml-1">
                          {link.value}
                        </a>
                      ) : (
                        <span className="ml-1">{link.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-mwg-muted">Could not load contact information.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 