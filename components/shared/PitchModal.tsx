import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";

interface ProductModalProps {
  id?: string;
}

const PitchModal = async ({ id }: ProductModalProps) => {
  if (!id || isNaN(parseInt(id, 10))) {
    redirect("/");
  }

  return (
    <Card className="fixed inset-0 flex items-center justify-center z-10">
      <Link
        className="fixed inset-0 bg-black opacity-75 cursor-default"
        href="/"
        scroll={false}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-md shadow-md">
        <div className="flex justify-between items-start">
          <Link
            className="absolute top-2.5 right-2.5 h-6 w-6 bg-black text-white rounded justify-center items-center flex pb-0.5"
            href="/"
            scroll={false}
          >
            &times;
            <span className="sr-only">Close Modal</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg max-w-4xl mx-auto p-3 space-y-4 overflow-auto z-20">
          <div className="max-w-4xl mx-auto my-8 p-4">
            <h1 className="text-3xl font-bold mb-6">My Bookings Details</h1>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Selected Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Image
                    src="/placeholder.svg"
                    alt="Map placeholder"
                    className="w-full rounded-md"
                    width="300"
                    height="200"
                    style={{ aspectRatio: "300/200", objectFit: "cover" }}
                  />
                </div>
                <div className="md:col-span-2 p-4 border rounded-md">
                  <p className="text-lg font-medium">
                    1223 Pink Street, Brooklyn, NY 00000
                  </p>
                  <p className="text-sm my-1">
                    2:15 PM, Wednesday January 17 2024 with Angelina Johnson
                  </p>
                  <p className="text-sm my-1">Service: Standard Cleaning</p>
                  <p className="text-lg font-semibold my-1">$80.00</p>
                  <Button className="w-full mt-2">View Receipt</Button>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Rate service</h2>
              <div className="flex space-x-2">
                <StarIcon className="w-6 h-6 text-gray-400" />
                <StarIcon className="w-6 h-6 text-gray-400" />
                <StarIcon className="w-6 h-6 text-gray-400" />
                <StarIcon className="w-6 h-6 text-gray-400" />
                <StarIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Leave a review</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your review here."
                  className="w-full p-2 border rounded-md"
                />
                <Button className="w-full md:w-auto">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PitchModal;

function CircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function StarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
