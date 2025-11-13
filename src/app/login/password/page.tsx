import Footer from "@/components/shared/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import { PasswordForm } from "./PasswordForm";

export default function PasswordPage() {
  return (
    <div className="min-h-[120vh] flex flex-col bg-gradient-to-b from-[#3c0000] via-[#550202] to-[#8b0000] text-white">
      <div className="relative z-20">
        <LandingHeader />
      </div>

      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-full max-w-md mx-6 md:mx-0">
          <PasswordForm />
        </div>
      </div>

      <div className="bg-black/80">
        <Footer />
      </div>
    </div>
  );
}
