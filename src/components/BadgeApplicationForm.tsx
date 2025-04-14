
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  companyName: z.string().optional(),
  contactNumber: z.string().min(1, "Contact number is required"),
  reason: z.string().min(10, "Please provide a detailed reason"),
  role: z.string().min(1, "Role is required"),
  socialMedia: z.string().optional(),
  badgeType: z.string()
});

type FormData = z.infer<typeof formSchema>;

interface BadgeApplicationFormProps {
  open: boolean;
  onClose: () => void;
  badgeType: string;
}

export function BadgeApplicationForm({ open, onClose, badgeType }: BadgeApplicationFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      contactNumber: "",
      reason: "",
      role: "",
      socialMedia: "",
      badgeType
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // In a real application, you would use a secure token from environment variables
      const emailBody = `
        <h2>${data.badgeType} Badge Application</h2>
        <p><strong>Full Name:</strong> ${data.fullName}</p>
        <p><strong>Company:</strong> ${data.companyName || 'N/A'}</p>
        <p><strong>Contact:</strong> ${data.contactNumber}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p><strong>Social Media:</strong> ${data.socialMedia || 'N/A'}</p>
      `;

      // Email configuration
      const emailConfig = {
        SecureToken: "YOUR_SECURE_TOKEN_HERE",
        To: ["DIRECTEUR.MAROCEVENTS@GMAIL.COM", "infos@shotaku.ma"],
        From: "your_email@gmail.com",
        Subject: `${data.badgeType} Badge Application`,
        Body: emailBody
      };

      // For now, we'll just show a success message
      // In production, you would integrate with an email service
      toast({
        title: "Application submitted successfully!",
        description: "We will review your application and get back to you soon.",
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error submitting application",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{badgeType} Badge Application</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your company name (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your contact number" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Role / Work*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your role or work" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Applying*</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Please explain why you're applying for this badge" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="socialMedia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Links</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Instagram, YouTube, etc. (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                onClose();
              }}>
                Cancel
              </Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
