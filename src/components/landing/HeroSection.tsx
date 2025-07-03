import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onOpenAuth?: (tab: "signin" | "signup") => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { user, loading } = useAuth();

  return (
    <section className="pt-14 pb-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center space-y-14">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="inline-flex items-center px-6 py-2 rounded-full border border-neutral-200 bg-neutral-50 shadow-sm"
        >
          <span className="text-sm font-semibold text-neutral-700 tracking-wider uppercase">
            {user
              ? "Welcome to your trading dashboard"
              : "Enterprise-Grade Opinion Trading"}
          </span>
        </motion.div>

        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h1 className="text-[48px] md:text-[72px] font-semibold leading-[1.05] tracking-tight text-black">
            YesNoMaybe
          </h1>
          <h2 className="text-xl md:text-2xl font-normal text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            {user
              ? `Welcome back, ${user.email?.split("@")[0] || "Trader"}`
              : "Professional prediction markets for bold, institutional-grade opinion trading."}
          </h2>
        </motion.div>

        {/* Animated Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-base md:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed"
        >
          {user
            ? "Your portfolio is ready. Dive in to analyze performance or uncover new market signals."
            : "Predict future outcomes with transparency, speed, and strategic control — starting from just ₹1000."}
        </motion.p>

        {/* Animated CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
        >
          {loading ? (
            <div className="text-neutral-500 text-base">Loading...</div>
          ) : user ? (
            <>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-neutral-900 px-10 py-5 text-base font-medium rounded-md shadow-md transition-all"
              >
                Browse Markets
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-neutral-300 text-neutral-800 hover:bg-neutral-100 px-10 py-5 text-base font-medium rounded-md transition-all"
              >
                View Portfolio
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => onOpenAuth?.("signup")}
                className="bg-black text-white hover:bg-neutral-900 px-10 py-5 text-base font-medium rounded-md shadow-md transition-all"
              >
                Access Platform
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenAuth?.("signin")}
                className="border-neutral-300 text-neutral-800 hover:bg-neutral-100 px-10 py-5 text-base font-medium rounded-md transition-all"
              >
                Sign In
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
