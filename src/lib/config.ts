// Environment configuration
export const config = {
  emailjs: {
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'ZBYD3EMqLeYkXKrsd',
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ce58f5o',
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_86098m5',
  }
}; 