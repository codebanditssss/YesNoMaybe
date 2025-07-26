"use client"
import { cn } from "../../lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { Card } from "./container-scroll-animation";
 
const reviews = [
    {
        icon: "📊",
        title: "Real-time Analytics",
        description: "Advanced market analytics with real-time data feeds and institutional-grade insights."
      },
      {
        icon: "⚡",
        title: "Instant Execution", 
        description: "Lightning-fast order execution with minimal slippage and maximum efficiency."
      },
      {
        icon: "🔒",
        title: "Secure Trading",
        description: "Bank-level security with multi-factor authentication and encrypted transactions."
      },
      {
        icon: "🔒",
        title: "Secure Trading",
        description: "Bank-level security with multi-factor authentication and encrypted transactions."
      },
      {
        icon: "🔒",
        title: "Secure Trading",
        description: "Bank-level security with multi-factor authentication and encrypted transactions."
      },
      {
        icon: "🔒",
        title: "Secure Trading",
        description: "Bank-level security with multi-factor authentication and encrypted transactions."
      },
      {
        icon: "🔒",
        title: "Secure Trading",
        description: "Bank-level security with multi-factor authentication and encrypted transactions."
      }

];
 
const firstRow = reviews.slice(0, reviews.length / 2);
// const secondRow = reviews.slice(reviews.length / 2);
 
const ReviewCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <figure
      className={cn(
        "",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="p-8 rounded-xl w-45 h-50 border border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white text-xl">{icon}</span>
          </div>
          <h3 className="text-xl font-medium text-black">{title}</h3>
          <p className="text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review, idx) => (
          <ReviewCard key={idx} {...review} />
        ))}
      </Marquee>
      {/* <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee> */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      {/* <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div> */}
    </div>
  );
}