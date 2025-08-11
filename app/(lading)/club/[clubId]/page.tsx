"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, CalendarDays, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";

const mockClub = {
  name: "Victory Sports Club",
  email: "info@victoryclub.com",
  phone: "+855 12 345 678",
  city: "Phnom Penh",
  coverImage: "/club-cover.jpg",
  rating: 4.6,
  events: [
    { id: 1, title: "Football Tournament", date: "2025-06-10" },
    { id: 2, title: "Tennis Clinic", date: "2025-06-15" },
  ],
};

export default function ClubDetailsPage() {
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setClub(mockClub);
    }, 500);
  }, []);

  if (!club) {
    return <p className="text-center mt-20">Loading club details...</p>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">🏟️ {club.name}</h1>
        <Button className="bg-green-600 hover:bg-green-700 text-white">Book Now</Button>
      </header>

      {/* Club Cover */}
      <Card className="overflow-hidden shadow-md">
        <Image src={club.coverImage} alt="Club Cover" className="w-full h-64 object-cover" />
      </Card>
      {/* Club Info */}
      <Card className="shadow-sm">
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={club.email} />
          <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={club.phone} />
          <InfoItem icon={<MapPin className="w-4 h-4" />} label="City" value={club.city} />
          <div>
            <p className="text-muted-foreground font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Rating
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(club.rating) ? "text-yellow-500" : "text-gray-300"}`}
                  fill={i < Math.floor(club.rating) ? "currentColor" : "none"}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{club.rating.toFixed(1)} / 5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Map */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>📍 Location</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.6153116895343!2d104.908086725927!3d11.579411238622354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31095166883049d7%3A0x327b3ba17665f061!2sCentral%20Park%20Sports%20Complex%2C%20Phnom%20Penh!5e0!3m2!1sen!2skh!4v1747667299970!5m2!1sen!2skh"
            className="w-full h-64 rounded-lg border"
            loading="lazy"
          ></iframe>
        </CardContent>
      </Card>

      {/* Gallery as Carousel */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>📸 Photo Gallery</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Carousel className="w-full max-w-full">
            <CarouselContent>
              {["/gallery1.jpg", "/gallery2.jpg", "/gallery3.jpg"].map((src, i) => (
                <CarouselItem key={i} className="basis-full">
                  <Image
                    src={src}
                    className="rounded-lg object-cover w-full h-64"
                    alt={`Gallery image ${i + 1}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>🎉 Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {club.events.map((event: any) => (
            <div key={event.id} className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground font-semibold flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="text-gray-900">{value || "-"}</p>
    </div>
  );
}