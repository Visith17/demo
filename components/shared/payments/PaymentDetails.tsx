"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CreditCard,
  Calendar,
  BadgeDollarSign,
  FileText,
  Timer,
  Info,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionType: string;
  createdAt: string;
  note?: string;
};

interface TransactionDetailProps {
  transaction?: Transaction;
  loading?: boolean;
  onRetry?: () => Promise<void>;
}

const STATUS_MESSAGES: Record<string, React.ReactNode> = {
  pending: (
    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <Info className="flex-shrink-0 text-blue-500 mt-0.5" size={18} />
      <div>
        <p className="font-medium text-blue-800 dark:text-blue-100">
          Payment Pending
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          Please complete your payment to confirm this transaction.
        </p>
      </div>
    </div>
  ),
  completed: (
    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
      <Info className="flex-shrink-0 text-green-500 mt-0.5" size={18} />
      <div>
        <p className="font-medium text-green-800 dark:text-green-100">
          Payment Successful
        </p>
        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
          Your transaction was completed successfully.
        </p>
      </div>
    </div>
  ),
  failed: (
    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
      <Info className="flex-shrink-0 text-red-500 mt-0.5" size={18} />
      <div>
        <p className="font-medium text-red-800 dark:text-red-100">
          Payment Failed
        </p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
          The transaction failed. Please try again.
        </p>
      </div>
    </div>
  ),
  default: (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Info className="flex-shrink-0 text-gray-500 mt-0.5" size={18} />
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200">
          Transaction Status
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Transaction status unknown.
        </p>
      </div>
    </div>
  ),
};

const ANIMATION_CONFIG = {
  initial: { scale: 1 },
  animate: { scale: 1.03 },
  transition: { duration: 0.3 },
} as const;

export function TransactionDetail({
  transaction,
  loading,
  onRetry,
}: TransactionDetailProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const status = transaction?.status || "default";
  const statusMessage = STATUS_MESSAGES[status] || STATUS_MESSAGES.default;
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isPending = status === "pending";

  const createdAtFormatted = transaction
    ? format(new Date(transaction.createdAt), "PPPpp")
    : "";

  const handleRetryClick = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
      toast.success("Retry successful!");
    } catch {
      toast.error("Retry failed, please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-1 py-2">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header with status indicator */}
        <div className={cn(
          "px-6 py-4 border-b",
          isCompleted && "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50",
          isFailed && "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50",
          isPending && "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50",
          status === "default" && "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                Transaction Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {transaction?.referenceNumber || "Loading transaction..."}
              </p>
            </div>
            {transaction && (
              <div className="flex-shrink-0">
                <StatusBadge status={status} />
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="p-3">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : transaction ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 mb-6">
                <TransactionItem icon={<BadgeDollarSign size={18} />} label="Amount">
                  <span className="text-1xl font-bold text-gray-900 dark:text-white">
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </span>
                </TransactionItem>
                <TransactionItem icon={<Calendar size={18} />} label="Date">
                  <span className="text-gray-900 dark:text-white">
                    {createdAtFormatted}
                  </span>
                </TransactionItem>
                <TransactionItem icon={<CreditCard size={18} />} label="Payment Method">
                  <span className="text-gray-900 dark:text-white">
                    {formatMethod(transaction.method)}
                  </span>
                </TransactionItem>
                <TransactionItem icon={<Timer size={18} />} label="Transaction Type">
                  <span className="text-gray-900 dark:text-white">
                    {capitalize(transaction.transactionType)}
                  </span>
                </TransactionItem>
                {transaction.note && (
                  <div className="md:col-span-2">
                    <TransactionItem icon={<FileText size={18} />} label="Note">
                      <span className="text-gray-900 dark:text-white">
                        {transaction.note}
                      </span>
                    </TransactionItem>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Status message */}
              <div className="mb-6">
                {statusMessage}
              </div>

              {/* Action buttons */}
              {(isFailed || isPending) && onRetry && (
                <motion.div {...ANIMATION_CONFIG} className="w-full sm:w-auto">
                  <Button
                    onClick={handleRetryClick}
                    disabled={isRetrying}
                    className={cn(
                      "w-full sm:w-auto",
                      "bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg",
                      "flex items-center justify-center gap-2",
                      isRetrying && "opacity-70"
                    )}
                    aria-label={isRetrying ? "Retrying payment..." : "Retry payment"}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Retry Payment
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No transaction data available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 items-start p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="mt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize";
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  };

  const iconMap = {
    pending: <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />,
    completed: <span className="w-3 h-3 mr-1.5 bg-green-500 rounded-full" />,
    failed: <span className="w-3 h-3 mr-1.5 bg-red-500 rounded-full" />,
  };

  return (
    <span className={cn(base, styles[status] || "bg-gray-100 text-gray-800")}>
      {status in iconMap && iconMap[status as keyof typeof iconMap]}
      {capitalize(status)}
    </span>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatMethod(method: string) {
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}