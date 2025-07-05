'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function ContactModal({ open, onClose, title = "Contact the Development Team" }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  
  // Use different email based on the title
  const recipientEmail = title.includes('Development') ? 'dev@survivalpending.com' : 'contact@survivalpending.com';

  const subjectOptions = {
    general: 'General Inquiry',
    bug: 'Bug Report',
    feature: 'Feature Request',
    security: 'Security Issue',
    partnership: 'Partnership/Collaboration',
    other: 'Other'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the email content
    const subject = `[Developer Contact] ${subjectOptions[formData.subject as keyof typeof subjectOptions]}: ${formData.name}`;
    const body = `Name: ${formData.name}
Email: ${formData.email}
Subject: ${subjectOptions[formData.subject as keyof typeof subjectOptions]}

Message:
${formData.message}

---
This message was sent from the Survival Pending developer contact form.`;

    // Create mailto link
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      subject: 'general',
      message: ''
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Have a question, suggestion, or want to contribute? We'd love to hear from you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name (or alias)"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => handleChange('subject', value)}
            >
              <SelectTrigger id="subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="security">Security Issue</SelectItem>
                <SelectItem value="partnership">Partnership/Collaboration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what's on your mind..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Open Email Client
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          This will open your default email client with the information pre-filled.
        </p>
      </DialogContent>
    </Dialog>
  );
}