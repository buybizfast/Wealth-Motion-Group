'use client';

import React, { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

export default function RichTextEditor({ value, onChange, height = 500 }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  
  return (
    <div className="simple-rich-editor border rounded-md overflow-hidden">
      <div className="flex border-b border-mwg-border">
        <button 
          className={`py-2 px-4 text-sm font-medium ${!isPreview ? 'bg-white text-gray-800' : 'bg-mwg-card text-mwg-muted'}`}
          onClick={() => setIsPreview(false)}
        >
          Edit
        </button>
        <button 
          className={`py-2 px-4 text-sm font-medium ${isPreview ? 'bg-white text-gray-800' : 'bg-mwg-card text-mwg-muted'}`}
          onClick={() => setIsPreview(true)}
        >
          Preview
        </button>
      </div>
      
      {!isPreview ? (
        <div>
          <div className="p-2 bg-mwg-card border-b border-mwg-border text-xs text-mwg-muted">
            <p>HTML formatting is supported. Use tags like:</p>
            <code>&lt;h1&gt;</code>, <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>, <code>&lt;a href=""&gt;</code>, <code>&lt;img src=""&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>, etc.
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ height: `${height}px`, color: 'black' }}
            className="w-full p-4 bg-white text-black font-mono text-sm border-0 focus:outline-none focus:ring-0"
            placeholder="Enter HTML content here. You can use tags like <h1>, <p>, <strong>, etc."
          />
        </div>
      ) : (
        <div 
          className="p-4 bg-white text-gray-800 rich-content overflow-auto"
          style={{ height: `${height + 40}px` }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
} 