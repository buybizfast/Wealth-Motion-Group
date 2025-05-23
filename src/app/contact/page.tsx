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

// Default contact information to use as fallback
const defaultContactInfo: ContactInfo = {
  email: "contact@motionwealthgroup.com",
  socialLinks: [
    {
      name: "LinkedIn",
      value: "Motion Wealth Group",
      url: "https://linkedin.com/in/motionwealthgroup",
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
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const docs = await getDocuments(CONTACT_COLLECTION);
        if (docs && docs.length > 0) {
          // Use the first contact info document from Firebase
          setContactInfo(docs[0] as ContactInfo);
        } else {
          // If no contact info in Firebase, use default
          console.log("No contact info found in Firebase, using default");
          setContactInfo(defaultContactInfo);
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
        // Use default contact info in case of error
        setContactInfo(defaultContactInfo);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <section className="w-full flex flex-col items-center pt-8 sm:pt-12 pb-4 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-2">
          Get in <span className="text-mwg-accent">Touch</span>
        </h1>
        <p className="text-mwg-muted text-center mb-6 sm:mb-8 max-w-2xl text-sm sm:text-base">
          Have questions or want to connect? Reach out through any of these channels.
        </p>
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <ContactForm />
          </div>
          
          {/* Contact Info */}
          <div className="bg-mwg-card border border-mwg-border rounded-lg p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 order-1 lg:order-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-mwg-text mb-2">Connect With Me</h2>
              <p className="text-mwg-muted mb-4 text-sm leading-relaxed">Whether you have questions about investing, want to discuss potential collaborations, or just want to say hello, I&apos;d love to hear from you. Here are the best ways to reach me:</p>
              
              {loading ? (
                <div className="text-mwg-muted text-sm">Loading contact information...</div>
              ) : (
                <ul className="text-mwg-muted text-sm space-y-3">
                  <li className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="font-semibold text-mwg-accent min-w-[70px]">Email:</span> 
                    <a 
                      href={`mailto:${contactInfo.email}`} 
                      className="text-mwg-text hover:text-mwg-accent transition-colors break-all min-h-[44px] flex items-center"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                  {contactInfo.socialLinks.map((link, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="font-semibold text-mwg-accent min-w-[70px]">{link.name}:</span>
                      {link.url !== "#" ? (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-mwg-text hover:text-mwg-accent transition-colors min-h-[44px] flex items-center break-all"
                        >
                          {link.value}
                        </a>
                      ) : (
                        <span className="text-mwg-text">{link.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 