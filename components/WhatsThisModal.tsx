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
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
          <DialogHeader className="space-y-3 sm:space-y-4">
            <DialogTitle className="sr-only">About Survival Pending</DialogTitle>
            <Logo className="text-xl sm:text-2xl" />
            <DialogDescription className="text-base sm:text-lg md:text-xl font-semibold text-left">
              A living archive of LGBTQ+ resilience in real time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 sm:mt-6 space-y-6 sm:space-y-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                Survival Pending is an anonymous platform documenting the experiences of LGBTQ+ 
                people as we navigate unprecedented political and social attacks on our existence. 
                This isn't just another website. It's an act of collective resistance. 
                Every story shared makes us harder to ignore, impossible to erase.
              </p>
              <p className="text-base sm:text-lg md:text-xl font-bold">
                Document your truth. Add your voice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Why this matters */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-base sm:text-lg">Why this matters</h3>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Legislative attacks are escalating daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Our stories are being silenced and erased</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">History needs our testimony</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">You need to know you're not alone</span>
                  </li>
                </ul>
              </div>

              {/* How it works */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold text-base sm:text-lg">How it works</h3>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Share your story completely anonymously</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">No emails, no tracking, no real names</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Optional demographics help identify trends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Stories become audio testimonies through voice synthesis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                    <span className="text-sm sm:text-base">Everything is preserved as historical record</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your privacy */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-base sm:text-lg">Your privacy is absolute</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-sm sm:text-base">No account recovery (protects your anonymity)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-sm sm:text-base">Quick exit button on every page (ESC 3x)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-sm sm:text-base">Crisis resources always available</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                  <span className="text-sm sm:text-base">We can't see who you are, ever</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="border-t p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            <Link href="/signup" className="w-full sm:flex-1">
              <Button className="w-full" size="default" onClick={onClose}>
                Start Writing
              </Button>
            </Link>
            <Button variant="outline" size="default" onClick={onClose} className="w-full sm:flex-1">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}