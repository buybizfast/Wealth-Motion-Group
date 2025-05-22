'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firebaseUtils';

const CONTACT_COLLECTION = 'contactInfo';

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

interface ContactInfoManagerProps {
  initialData?: any;
  onChange?: (data: any) => void;
}

export default function ContactInfoManager({ initialData, onChange }: ContactInfoManagerProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (initialData) {
      // If props were provided, use them
      setContactInfo({
        email: initialData.email || "",
        socialLinks: initialData.socialLinks || []
      });
      setSocialLinks(initialData.socialLinks || []);
      setLoading(false);
    } else {
      // Otherwise fetch from Firestore
      fetchContactInfo();
    }
  }, [initialData]);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments(CONTACT_COLLECTION);
      if (docs.length > 0) {
        const info = docs[0] as ContactInfo;
        setContactInfo(info);
        setSocialLinks(info.socialLinks || []);
      } else {
        // Initialize with default data from the static file
        const defaultInfo: ContactInfo = {
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
        };
        const newInfo = await addDocument(CONTACT_COLLECTION, defaultInfo);
        setContactInfo(newInfo as ContactInfo);
        setSocialLinks(defaultInfo.socialLinks);
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      setError("Failed to load contact information");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (contactInfo) {
      const updatedInfo = {
        ...contactInfo,
        email: e.target.value,
      };
      setContactInfo(updatedInfo);
      
      // If onChange handler was provided, call it
      if (onChange) {
        onChange({
          ...updatedInfo,
          socialLinks
        });
      }
    }
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setSocialLinks(updatedLinks);
    
    // If onChange handler was provided, call it
    if (onChange && contactInfo) {
      onChange({
        ...contactInfo, 
        socialLinks: updatedLinks
      });
    }
  };

  const addSocialLink = () => {
    const updatedLinks = [
      ...socialLinks,
      { name: "", value: "", url: "" },
    ];
    setSocialLinks(updatedLinks);
    
    // If onChange handler was provided, call it
    if (onChange && contactInfo) {
      onChange({
        ...contactInfo,
        socialLinks: updatedLinks
      });
    }
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
    
    // If onChange handler was provided, call it
    if (onChange && contactInfo) {
      onChange({
        ...contactInfo,
        socialLinks: updatedLinks
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // If we're using the component in edit mode with props, don't save to Firebase
    if (onChange) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!contactInfo) return;

      const updatedInfo = {
        ...contactInfo,
        socialLinks,
      };

      if (contactInfo.id) {
        await updateDocument(CONTACT_COLLECTION, contactInfo.id, updatedInfo);
      } else {
        await addDocument(CONTACT_COLLECTION, updatedInfo);
      }

      setSuccess("Contact information updated successfully!");
      await fetchContactInfo(); // Refresh data
    } catch (error) {
      console.error("Error saving contact info:", error);
      setError("Failed to save contact information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading contact information...</div>;
  }

  // Only show save button when not in onChange mode
  const showSaveButton = !onChange;

  return (
    <div className="bg-mwg-dark border border-mwg-border rounded-lg p-6">
      {!onChange && <h2 className="text-xl font-bold text-mwg-text mb-4">Contact Information</h2>}
      
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-600 text-green-400 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-mwg-muted mb-1">Email Address</label>
          <input
            type="email"
            value={contactInfo?.email || ""}
            onChange={handleEmailChange}
            className="w-full px-4 py-2 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text"
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-mwg-muted">Social Links</label>
            <button
              type="button"
              onClick={addSocialLink}
              className="px-2 py-1 bg-mwg-accent text-mwg-dark rounded text-sm"
            >
              + Add Link
            </button>
          </div>
          
          {socialLinks.map((link, index) => (
            <div key={index} className="border border-mwg-border rounded-md p-3 mb-3 bg-mwg-card/50">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-mwg-muted text-sm mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleSocialLinkChange(index, "name", e.target.value)}
                    className="w-full px-3 py-1 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text text-sm"
                    placeholder="e.g. LinkedIn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-mwg-muted text-sm mb-1">Display Text</label>
                  <input
                    type="text"
                    value={link.value}
                    onChange={(e) => handleSocialLinkChange(index, "value", e.target.value)}
                    className="w-full px-3 py-1 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text text-sm"
                    placeholder="e.g. Connect on LinkedIn"
                    required
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-mwg-muted text-sm mb-1">URL</label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                  className="w-full px-3 py-1 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="text-red-400 text-sm hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {showSaveButton && (
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-mwg-accent text-mwg-dark font-semibold px-4 py-2 rounded-md shadow hover:brightness-110 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Contact Information"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 