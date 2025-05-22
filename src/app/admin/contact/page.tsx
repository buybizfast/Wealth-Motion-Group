'use client';

import ContactInfoManager from '@/app/components/ContactInfoManager';

export default function AdminContactPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Information Management</h1>
      <div className="w-full max-w-3xl">
        <ContactInfoManager />
      </div>
    </div>
  );
} 