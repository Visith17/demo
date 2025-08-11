"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { APP_ROUTE } from "@/constants/route";
import { Payment } from "@/types";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CreditCard, Wallet, Banknote, CircleCheckBig, Loader2, XCircle, MoreHorizontal } from "lucide-react";
import { MotionDiv } from "@/components/shared/MotionDiv";

interface PaymentCardProps {
  payment: Payment;
  index: number;
  className?: string;
}

const ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HOVER_VARIANTS = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const TRANSITION_DELAY = 0.2;
const LOADING_DELAY = 1000;

function getBadge(status: Payment["status"]) {
  const base = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm border";
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className: cn(base, "bg-green-100 text-green-700 border-green-200"),
        icon: <CircleCheckBig size={14} />,
      };
    case "pending":
      return {
        label: "Pending",
        className: cn(base, "bg-orange-100 text-orange-700 border-orange-200"),
        icon: <Loader2 size={14} className="animate-spin" />,
      };
    case "failed":
    case "refunded":
      return {
        label: "Failed",
        className: cn(base, "bg-red-100 text-red-700 border-red-200"),
        icon: <XCircle size={14} />,
      };
    default:
      return {
        label: status,
        className: cn(base, "bg-gray-100 text-gray-700 border-gray-200"),
        icon: <CircleCheckBig size={14} />,
      };
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case "credit_card":
      return <CreditCard size={16} className="text-blue-500" />;
    case "wallet":
      return <Wallet size={16} className="text-purple-500" />;
    case "bank_transfer":
      return <Banknote size={16} className="text-green-500" />;
    default:
      return <CreditCard size={16} className="text-gray-400" />;
  }
}

function formatMethod(method: string) {
  return method.replace(/_/g, " ");
}

export default function PaymentCard({ payment, index, className }: PaymentCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    router.push(`/payments/${payment.referenceNumber}`);
    await new Promise((res) => setTimeout(res, LOADING_DELAY));
    setIsLoading(false);
  }, [router, payment]);

  const createdAtFormatted = format(new Date(payment.createdAt), "MMM do yyyy, HH:mm a");
  const badge = getBadge(payment.status);

  return (
    <MotionDiv
      variants={ANIMATION_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={{
        delay: index * TRANSITION_DELAY,
        duration: TRANSITION_DELAY,
        ease: "easeInOut",
      }}
    >
      <motion.div
        variants={HOVER_VARIANTS}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        <Card
          role="button"
          tabIndex={0}
          aria-label={`View payment ${payment.referenceNumber}`}
          onClick={handleClick}
          className={cn(
            "group grid grid-cols-[1fr_auto] items-center gap-4 p-4 rounded-2xl cursor-pointer transition hover:shadow-md",
            "border border-muted bg-white",
            className
          )}
        >
          {/* Left section */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-gray-900">
              Ref: {payment.referenceNumber}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getMethodIcon(payment.method)}
              <span className="capitalize">{formatMethod(payment.method)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Created:</span>{" "}
              <time dateTime={payment.createdAt}>{createdAtFormatted}</time>
            </div>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            <span className="text-base font-semibold text-gray-900">
              ${payment.amount.toFixed(2)}
            </span>
            <div className={badge.className}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 transition" aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClick}>View Details</DropdownMenuItem>
                <DropdownMenuItem disabled>Cancel (soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>
    </MotionDiv>
  );
}
