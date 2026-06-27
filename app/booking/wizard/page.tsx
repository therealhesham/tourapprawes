"use client";

import Navbar from "@/components/Navbar";
import BookingWizard from "../components/BookingWizard";

export default function WizardPage() {
  return (
    <>
      <Navbar
        activeLinkId="packages"
        primaryCtaText="تصفح الباقات"
        onPrimaryCtaClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/packages";
          }
        }}
      />
      <main className="relative min-h-screen overflow-x-hidden bg-background pb-20 pt-32 md:pt-40 font-body-md" dir="rtl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] opacity-15 pointer-events-none -z-10"
          style={{ background: "radial-gradient(circle, #d4a017, transparent 70%)" }}
        />
        
        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <BookingWizard />
        </div>
      </main>
    </>
  );
}
