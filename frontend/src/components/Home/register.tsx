// components/register.tsx
"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequestOtpSchema, VerifyOtpSchema, RegisterSchemaWithoutOtp } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import CardModal from "./cardwrapper";

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  openLoginModal: () => void;
  openLoginModalAfterRegistration: () => void;  // Add this line
}

const RegisterForm = ({ isOpen, onClose, openLoginModal, openLoginModalAfterRegistration }: RegisterFormProps) => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("requestOtp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const role = searchParams.get("role");

  const requestOtpForm = useForm({
    resolver: zodResolver(RequestOtpSchema),
    defaultValues: {
      email: "",
    },
  });
  const verifyOtpForm = useForm({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });
  const registerForm = useForm({
    resolver: zodResolver(RegisterSchemaWithoutOtp),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRequestOtp = async (data: z.infer<typeof RequestOtpSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:4500/users/request-registration-otp`, {
        email: data.email,
        purpose: 'registration'  // Add this line
      });
      if (response.data.message) {
        setEmail(data.email);
        setStep("verifyOtp");
      } else {
        alert(response.data.error);
      }
    } catch (error: any) {
      alert(error.response?.data.error || "Server is down. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof VerifyOtpSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:4500/users/verify-otp`, {
        email: email,
        otp: data.otp,
        purpose: 'registration'  // Add this line
      });
      if (response.data.message) {
        setOtp(data.otp);
        setStep("completeRegistration");
      } else {
        alert(response.data.error || "Verification failed");
      }
    } catch (error: any) {
      alert(error.response?.data.error || "Server is down. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const onCompleteRegistration = async (data: z.infer<typeof RegisterSchemaWithoutOtp>) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:4500/users/signup`, {
        email: email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      console.log("Response:", response.data);
      if (response.data.message) {
        alert(response.data.message);
        onClose();  // Close the registration modal
        openLoginModalAfterRegistration();  // Open the login modal
      } else {
        alert(response.data.error);
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.response?.data.error || "Server is down. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardModal
      isOpen={isOpen}
      onClose={onClose}
      label="Create an account"
      title="Register"
      openLoginModal={openLoginModal}
    >
      {step === "requestOtp" && (
        <Form {...requestOtpForm}>
          <form onSubmit={requestOtpForm.handleSubmit(onRequestOtp)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={requestOtpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="johndoe@gmail.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Request OTP"}
            </Button>
          </form>
        </Form>
      )}
      {step === "verifyOtp" && (
        <Form {...verifyOtpForm}>
          <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" value={email} readOnly />
                </FormControl>
              </FormItem>
              <FormField
                control={verifyOtpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Enter OTP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
      )}
      {step === "completeRegistration" && (
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onCompleteRegistration)} className="space-y-6">
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" value={email} readOnly />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input type="text" value={otp} readOnly />
                </FormControl>
              </FormItem>
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Enter your username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter your password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Confirm your password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </Button>
          </form>
        </Form>
      )}
    </CardModal>
  );
};

export default RegisterForm;
