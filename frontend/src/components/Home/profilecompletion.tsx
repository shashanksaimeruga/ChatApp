"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ProfileCompletionSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().max(500, "Bio must be 500 characters or less"),
  profilePicture: z.instanceof(File).optional(),
});

const ProfileCompletion = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof ProfileCompletionSchema>>({
    resolver: zodResolver(ProfileCompletionSchema),
    defaultValues: {
      fullName: "",
      bio: "",
    },
  });

// components/ProfileCompletion.tsx
const onSubmit = async (data: z.infer<typeof ProfileCompletionSchema>) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("bio", data.bio);
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }
  
      const response = await axios.post("http://localhost:4500/users/complete-profile", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.message) {
        // Mark profile prompt as seen
        await axios.post('http://localhost:4500/users/skip-profile-prompt', {}, { withCredentials: true });
        window.location.href = "/chat";
      }
    } catch (error: any) {
      alert(error.response?.data.error || "An error occurred");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your full name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Tell us about yourself" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileCompletion;