'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Code2 } from 'lucide-react';
import ContactModal from '@/components/developer/ContactModal';

export default function FooterSection() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <footer className="hidden lg:block fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-40">
        <div className="px-4 md:px-8 py-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>MMXXV</span>
            <span 
              className="inline-flex items-center text-sm font-black tracking-tight"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              Survival Pending
              <span className="inline-block w-[2px] h-[0.8em] bg-current ml-[2px] animate-blink" />
            </span>
            <span>All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://app.termly.io/policy-viewer/policy.html?policyUUID=61228498-eb21-4048-bf3a-00a9518e88c3" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="https://app.termly.io/policy-viewer/policy.html?policyUUID=69f226cd-4d1f-4513-b13e-7b7060379aac"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Terms of Service
            </a>
            <Link href="/developer">
              <Button variant="outline" size="sm" className="h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600">
                <Code2 className="h-4 w-4 mr-2" />
                Developers
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
              onClick={() => setShowContactModal(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </footer>

      <ContactModal 
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Us"
      />
    </>
  );
}