'use client';

import { useState, FormEvent, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { config } from '../../lib/config';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formRef.current) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      // Initialize EmailJS with your public key
      emailjs.init({
        publicKey: config.emailjs.publicKey,
      });

      // Send the form using EmailJS
      await emailjs.sendForm(
        config.emailjs.serviceId,
        config.emailjs.templateId,
        formRef.current
      );

      setSubmitSuccess(true);
      formRef.current.reset();
    } catch (error) {
      console.error('Failed to send email:', error);
      setSubmitError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      ref={formRef} 
      className="bg-mwg-card border border-mwg-border rounded-lg p-6 flex flex-col gap-4" 
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4 w-full">
        <input 
          type="text" 
          name="name"
          placeholder="Name" 
          className="w-full px-4 py-2 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text placeholder-mwg-muted focus:outline-none focus:ring-2 focus:ring-mwg-accent"
          required 
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          className="w-full px-4 py-2 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text placeholder-mwg-muted focus:outline-none focus:ring-2 focus:ring-mwg-accent"
          required 
        />
      </div>
      <select 
        name="subject"
        className="px-4 py-2 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text focus:outline-none focus:ring-2 focus:ring-mwg-accent"
        required
      >
        <option value="">Select a subject</option>
        <option value="General Inquiry">General Inquiry</option>
        <option value="Collaboration">Collaboration</option>
        <option value="Trading Question">Trading Question</option>
        <option value="Other">Other</option>
      </select>
      <textarea 
        name="message"
        placeholder="Message" 
        rows={4} 
        className="px-4 py-2 rounded-md bg-mwg-dark border border-mwg-border text-mwg-text placeholder-mwg-muted focus:outline-none focus:ring-2 focus:ring-mwg-accent"
        required
      />
      
      {submitSuccess && (
        <div className="bg-green-900/30 border border-green-600 text-green-400 p-3 rounded-md">
          Your message has been sent successfully. We'll get back to you soon.
        </div>
      )}
      
      {submitError && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 p-3 rounded-md">
          {submitError}
        </div>
      )}
      
      <button 
        type="submit" 
        className="bg-mwg-accent text-mwg-dark font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition mt-2 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
} 