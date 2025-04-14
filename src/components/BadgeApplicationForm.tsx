
import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

const badgeTypes = [
  { id: "cosplay", name: "Cosplay Badge" },
  { id: "media", name: "Media Badge" },
  { id: "team", name: "Team Badge" }
];

const BadgeApplicationForm = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [badgeType, setBadgeType] = useState("cosplay");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate required fields
    const fullName = formData.get('fullName') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const reasonForApplying = formData.get('reasonForApplying') as string;
    const role = formData.get('role') as string;
    
    if (!fullName || !contactNumber || !reasonForApplying || !role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    
    // Create email body HTML
    const emailBody = `
      <h2>Badge Application - ${badgeTypes.find(b => b.id === badgeType)?.name}</h2>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Company:</strong> ${formData.get('company') || 'N/A'}</p>
      <p><strong>Contact Number:</strong> ${contactNumber}</p>
      <p><strong>Role / Work:</strong> ${role}</p>
      <p><strong>Reason for applying:</strong> ${reasonForApplying}</p>
      <p><strong>Social Media Links:</strong> ${formData.get('socialMedia') || 'N/A'}</p>
    `;
    
    try {
      // Using the window object to access Email from SMTP.js
      // Note: The actual implementation will happen in the script loaded in head
      if (window.Email) {
        await window.Email.send({
          SecureToken: "YOUR_SECURE_TOKEN_HERE", // Replace with actual token in production
          To: ['DIRECTEUR.MAROCEVENTS@GMAIL.COM', 'infos@shotaku.ma'],
          From: "your_email@gmail.com", // Replace with actual sender in production
          Subject: `${badgeTypes.find(b => b.id === badgeType)?.name} Application`,
          Body: emailBody
        });
        
        toast.success("Application sent successfully!");
        formRef.current?.reset();
      } else {
        throw new Error("Email service not available");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send application. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {badgeTypes.find(b => b.id === badgeType)?.name} Application
          </h2>
          
          <div className="mb-6">
            <RadioGroup
              defaultValue={badgeType}
              onValueChange={setBadgeType}
              className="flex flex-wrap gap-4"
            >
              {badgeTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id}>{type.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName" className="font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="company" className="font-medium">
                Company Name <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="Your company or organization"
              />
            </div>
            
            <div>
              <Label htmlFor="contactNumber" className="font-medium">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                placeholder="Your contact number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role" className="font-medium">
                Your Role / Work <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role"
                name="role"
                placeholder="Your position or work"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="reasonForApplying" className="font-medium">
                Reason for Applying <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reasonForApplying"
                name="reasonForApplying"
                placeholder="Please explain why you're applying for this badge"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="socialMedia" className="font-medium">
                Social Media Links <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="socialMedia"
                name="socialMedia"
                placeholder="Instagram, YouTube, TikTok, etc."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => formRef.current?.reset()}
                disabled={loading}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BadgeApplicationForm;

// Add TypeScript declaration for SMTP.js
declare global {
  interface Window {
    Email: {
      send: (options: {
        SecureToken: string;
        To: string[];
        From: string;
        Subject: string;
        Body: string;
      }) => Promise<string>;
    };
  }
}
