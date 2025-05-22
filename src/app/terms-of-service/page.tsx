import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Motion Wealth Group - The rules, guidelines, and agreements for using our website and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-6 text-mwg-muted">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
          <p>
            Welcome to Motion Wealth Group. These terms and conditions outline the rules and regulations for the use of our website.
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use our website
            if you do not accept all of the terms and conditions stated on this page.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">2. License to Use</h2>
          <p>
            Unless otherwise stated, Motion Wealth Group and/or its licensors own the intellectual property rights for all material on this website.
            All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use
            subject to restrictions set in these terms and conditions.
          </p>
          <p className="mt-2">You must not:</p>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>Republish material from this website</li>
            <li>Sell, rent, or sub-license material from this website</li>
            <li>Reproduce, duplicate, or copy material from this website</li>
            <li>Redistribute content from this website, unless content is specifically made for redistribution</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">3. Disclaimer</h2>
          <p>
            To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website.
            Nothing in this disclaimer will:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Limit or exclude our or your liability for death or personal injury resulting from negligence</li>
            <li>Limit or exclude our or your liability for fraud or fraudulent misrepresentation</li>
            <li>Limit any of our or your liabilities in any way that is not permitted under applicable law</li>
            <li>Exclude any of our or your liabilities that may not be excluded under applicable law</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Financial Information Disclaimer</h2>
          <p>
            The information provided on our website is for general informational purposes only. It is not intended as financial advice
            and should not be taken as such. You should consult with a qualified financial advisor before making any investment decisions.
          </p>
          <p className="mt-2">
            Past performance is not indicative of future results. All investments involve risk, including the possible loss of principal.
            Motion Wealth Group does not guarantee any specific outcome or profit.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">5. User Content</h2>
          <p>
            In these terms and conditions, "User Content" means material (including without limitation text, images, audio material, video material, and audio-visual material)
            that you submit to our website, for whatever purpose.
          </p>
          <p className="mt-2">
            You grant to Motion Wealth Group a worldwide, irrevocable, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your User Content
            in any existing or future media. You also grant to Motion Wealth Group the right to sub-license these rights, and the right to bring an action for infringement of these rights.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">6. Limitation of Liability</h2>
          <p>
            In no event shall Motion Wealth Group, nor any of its officers, directors, and employees, be liable to you for anything arising out of or in any way connected with
            your use of this website, whether such liability is under contract, tort, or otherwise, and Motion Wealth Group shall not be liable for any indirect, consequential,
            or special liability arising out of or in any way related to your use of this website.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">7. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">8. Changes to Terms</h2>
          <p>
            Motion Wealth Group reserves the right to revise these terms and conditions at any time as it sees fit, and by using this website, you are expected to review these terms regularly to ensure you understand all terms and conditions governing the use of this website.
          </p>
        </section>
        
        <p className="text-sm mt-8">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
} 