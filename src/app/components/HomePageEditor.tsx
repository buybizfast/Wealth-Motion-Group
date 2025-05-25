"use client";

import { useState, useEffect } from "react";
import { getDocuments, addDocument, updateDocument } from "@/lib/firebase/firebaseUtils";

interface HomeContent {
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  about: {
    title: string;
    content: string;
    values: string[];
  };
  cta: {
    title: string;
    content: string;
  };
}

const defaultContent: HomeContent = {
  hero: {
    title: "Welcome to Motion Wealth Group",
    subtitle: "We help everyday people take control of their financial future through smart trading and clear investment insights. Whether you're just getting started or leveling up your skills, we're here to make the markets simple, practical, and real.",
    buttonText: "Learn More"
  },
  about: {
    title: "We stand for:",
    content: "",
    values: [
      "Transparent education",
      "Steady growth over hype", 
      "Risk with intention",
      "Wealth that lasts"
    ]
  },
  cta: {
    title: "Ready to Accelerate Your Trading Journey?",
    content: "Connect with Motion Wealth Group for personalized insights and resources to help you achieve your financial goals."
  }
};

export default function HomePageEditor() {
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      const pageContent = await getDocuments("pageContent");
      const homePage = pageContent.find((item: any) => item.pageName === "home");
      
      if (homePage && homePage.content) {
        // If content is a string (JSON), parse it
        if (typeof homePage.content === 'string') {
          try {
            const parsed = JSON.parse(homePage.content);
            setContent(parsed.sections || parsed);
          } catch (e) {
            console.error("Error parsing home content:", e);
            setContent(defaultContent);
          }
        } else {
          // If content is already an object
          setContent(homePage.content.sections || homePage.content);
        }
      } else {
        setContent(defaultContent);
      }
    } catch (error) {
      console.error("Error fetching home content:", error);
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Check if home page already exists
      const pageContent = await getDocuments("pageContent");
      const existingHomePage = pageContent.find((item: any) => item.pageName === "home");

      const contentData = {
        pageName: "home",
        content: JSON.stringify({ sections: content })
      };

      if (existingHomePage) {
        // Update existing
        await updateDocument("pageContent", existingHomePage.id, contentData);
      } else {
        // Create new
        await addDocument("pageContent", contentData);
      }

      setMessage({ type: 'success', text: 'Home page content saved successfully!' });
    } catch (error) {
      console.error("Error saving home content:", error);
      setMessage({ type: 'error', text: 'Failed to save home page content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (value: string, index: number) => {
    const newValues = [...content.about.values];
    newValues[index] = value;
    setContent({
      ...content,
      about: {
        ...content.about,
        values: newValues
      }
    });
  };

  const addValue = () => {
    setContent({
      ...content,
      about: {
        ...content.about,
        values: [...content.about.values, ""]
      }
    });
  };

  const removeValue = (index: number) => {
    const newValues = content.about.values.filter((_, i) => i !== index);
    setContent({
      ...content,
      about: {
        ...content.about,
        values: newValues
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mwg-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Hero Section</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Hero Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              value={content.hero.title}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, title: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Hero Subtitle</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              rows={3}
              value={content.hero.subtitle}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, subtitle: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Button Text</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              value={content.hero.buttonText}
              onChange={(e) => setContent({
                ...content,
                hero: { ...content.hero, buttonText: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">About Section</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Section Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              value={content.about.title}
              onChange={(e) => setContent({
                ...content,
                about: { ...content.about, title: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Core Values</label>
            <div className="space-y-2">
              {content.about.values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
                    value={value}
                    onChange={(e) => updateValue(e.target.value, index)}
                    placeholder={`Value ${index + 1}`}
                  />
                  <button
                    onClick={() => removeValue(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={content.about.values.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addValue}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Value
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Call-to-Action Section</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">CTA Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              value={content.cta.title}
              onChange={(e) => setContent({
                ...content,
                cta: { ...content.cta, title: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">CTA Content</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mwg-accent"
              rows={3}
              value={content.cta.content}
              onChange={(e) => setContent({
                ...content,
                cta: { ...content.cta, content: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-mwg-accent text-white rounded hover:bg-mwg-accent/80 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Home Page"}
        </button>
      </div>
    </div>
  );
} 