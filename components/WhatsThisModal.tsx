"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { Shield, Users, Clock, Lock } from "lucide-react";

interface WhatsThisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsThisModal({ isOpen, onClose }: WhatsThisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden" style={{ width: '90vw', maxWidth: '1280px' }}>
        <div className="p-8 overflow-y-auto flex-1">
          <DialogHeader className="space-y-4">
            <Logo className="text-2xl" />
            <DialogDescription className="text-xl font-semibold">
              A living archive of LGBTQ+ resilience in real time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-lg leading-relaxed">
                Survival Pending is an anonymous platform documenting the experiences of LGBTQ+ 
                people as we navigate unprecedented political and social attacks on our existence. 
                This isn't just another website. It's an act of collective resistance. 
                Every story shared makes us harder to ignore, impossible to erase.
              </p>
              <p className="text-xl font-bold">
                Document your truth. Add your voice.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Why this matters */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-lg">Why this matters</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span>Legislative attacks are escalating daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span>Our stories are being silenced and erased</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span>History needs our testimony</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span>You need to know you're not alone</span>
                  </li>
                </ul>
              </div>

              {/* How it works */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold text-lg">How it works</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span>Share your story completely anonymously</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span>No emails, no tracking, no real names</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span>Optional demographics help identify trends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span>Stories become audio testimonies through voice synthesis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span>Everything is preserved as historical record</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your privacy */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-lg">Your privacy is absolute</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span>No account recovery (protects your anonymity)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span>Quick exit button on every page (ESC 3x)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span>Crisis resources always available</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span>We can't see who you are, ever</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="border-t p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3 w-full">
            <Link href="/signup" className="flex-1">
              <Button className="w-full" size="lg" onClick={onClose}>
                Start Writing
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}