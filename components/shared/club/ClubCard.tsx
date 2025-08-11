'use client';

import { useCallback } from 'react';
import { Phone, MapPin, Star, Clock, BoxIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Category } from '@/types';

const URL_PARAM_KEY = 'sportClubIds';

export function ClubCard({ club, index }: { club: any; index: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback((clubId: number) => {
    const getCookieValue = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const raw = getCookieValue('favoriteClubs');
    const parsed: number[] = raw?.startsWith('j:')
      ? JSON.parse(raw.slice(2))
      : JSON.parse(raw || '[]');

    const updated = Array.isArray(parsed)
      ? Array.from(new Set([...parsed, clubId]))
      : [clubId];

    const params = new URLSearchParams(searchParams.toString());
    params.set(URL_PARAM_KEY, updated.join(','));

    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <Card className="flex flex-col md:flex-row items-stretch gap-4 p-4 shadow-sm hover:shadow-md transition rounded-lg">
      {/* Club Image */}
      <div className="w-full md:w-48 h-40 md:h-auto overflow-hidden rounded-md">
        <Image
          src={`/club${index}.jpg`}
          alt={club.name}
          width={160}
          height={160}
          priority
          quality={95}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Club Info */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          <span className="flex items-center gap-1 truncate w-full">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Link
              href={club.locationUrl}
              target="_blank"
              className="truncate text-blue-600 hover:underline"
            >
              {club.name}
            </Link>
            <span className="text-sm text-muted-foreground">({club.id}km away)</span>
          </span>
        </h2>

        {/* Club Meta Info */}
        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4 text-muted-foreground" />
            {club.owner.phone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Business Hours: 7am - 9pm
          </span>
          <span className="flex items-center gap-1">
            <BoxIcon className="w-4 h-4 text-muted-foreground" />
            Pitches: {club.pitch_details.length}
          </span>

          {/* Categories */}
          <span className="flex items-center gap-2 flex-wrap max-w-full">
            <span className="text-sm text-gray-500 whitespace-nowrap">Category:</span>
            {club.sport_types.slice(0, 3).map((category: Category) => (
              <span
                key={category.id}
                className="text-xs px-2 py-0.5 rounded-full border border-gray-300 text-primary bg-primary/10"
              >
                {category.name}
              </span>
            ))}
            {club.sport_types.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-gray-300 text-primary bg-primary/10">
                more...
              </span>
            )}
          </span>
        </div>

        {/* Rating and CTA */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
            <Star className="w-4 h-4" />
            {club.rating?.overall_rating?.toFixed(1) ?? '0'} / 5 ({club.rating.count})
          </div>
          <button
            onClick={() => setParam(club.id)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Check Availability →
          </button>
        </div>
      </div>
    </Card>
  );
}
