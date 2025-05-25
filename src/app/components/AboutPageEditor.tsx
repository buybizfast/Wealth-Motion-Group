"use client";

import { useState, useEffect } from "react";
import { getDocuments, addDocument, updateDocument } from "@/lib/firebase/firebaseUtils";
import RichTextEditor from "./RichTextEditor";

interface AboutContent {
  title: string;
  subtitle: string;
  content: string;
}

const defaultContent: AboutContent = {
  title: "Our Story",
  subtitle: "Get to know the people behind Motion Wealth Group",
  content: `
    <h2>Welcome to Motion Wealth Group</h2>
    <p>This is where you can share your personal story, background, and what drives your passion for helping others succeed in trading and investing.</p>
    
    <h3>Our Mission</h3>
    <p>Add your personal mission statement and what makes your approach unique.</p>
    
    <h3>Our Journey</h3>
    <p>Share your journey, experiences, and what led you to create Motion Wealth Group.</p>
    
    <h3>Why We're Different</h3>
    <p>Explain what sets you apart from other trading educators and financial advisors.</p>
  `
};

export default function AboutPageEditor() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      setLoading(true);
      const pageContent = await getDocuments("pageContent");
      const aboutPage = pageContent.find((item: any) => item.pageName === "about");
      
      if (aboutPage && aboutPage.content) {
        // If content is a string (JSON), parse it
        if (typeof aboutPage.content === 'string') {
          try {
            setContent(JSON.parse(aboutPage.content));
          } catch (e) {
            console.error("Error parsing about content:", e);
            setContent(defaultContent);
          }
        } else {
          // If content is already an object
          setContent(aboutPage.content);
        }
      } else {
        setContent(defaultContent);
      }
    } catch (error) {
      console.error("Error fetching about content:", error);
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Check if about page already exists
      const pageContent = await getDocuments("pageContent");
      const existingAboutPage = pageContent.find((item: any) => item.pageName === "about");

      const contentData = {
        pageName: "about",
        content: JSON.stringify(content)
      };

      if (existingAboutPage) {
        // Update existing
        await updateDocument("pageContent", existingAboutPage.id, contentData);
      } else {
        // Create new
        await addDocument("pageContent", contentData);
      }

      setMessage({ type: 'success', text: 'About page content saved successfully!' });
    } catch (error) {
      console.error("Error saving about content:", error);
      setMessage({ type: 'error', text: 'Failed to save about page content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-gray-700 font-medium mb-2">Page Title</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
          value={content.title}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
          placeholder="Our Story"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Page Subtitle</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
          value={content.subtitle}
          onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
          placeholder="Get to know the people behind Motion Wealth Group"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Page Content</label>
        <div className="border border-gray-300 rounded-md">
          <RichTextEditor
            value={content.content}
            onChange={(newContent) => setContent({ ...content, content: newContent })}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Use the rich text editor to format your content. You can add headings, paragraphs, lists, and more.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-mwg-accent text-white rounded hover:bg-mwg-accent/80 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save About Page"}
        </button>
      </div>
    </div>
  );
} 