// Pagination and Filter Parameters
export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

export interface AvailablePitchParams extends PaginationParams {
  sportClubIds?: number[] | null;
  sportTypeIds?: number[] | null;
  playDate?: string | null;
  timeIn?: string | null;
  timeOut?: string | null;
  intervalHours?: number | null;
  dayOption: string | null;
}

// Base Types
export interface Rating {
  overall_rating: number;
  count: number;
}

export interface TimeSlot {
  timeIn: string;
  timeOut: string;
  totalHours: number;
}

// Club Related Types
export interface SportClub {
  id: number;
  name: string;
  profile?: string;
  location?: string;
  rating?: Rating;
}

// Pitch Related Types
export interface Pitch extends TimeSlot {
  id: number;
  pitchDetailId: number;
  pitchName: string;
  name: string;
  condition: string;
  pitchSize: string;
  sportType: string;
  weekPartId: number;
  totalPrice: number;
  totalHour: number;
  pitchRating: Rating;
  
  // Club information
  clubId: number;
  clubName: string;
  clubProfile: string;
  clubLocation: string;
  clubRating: any;
  sport_club: {
    id: number;
    name: string;
  };
  
  // Booking specific
  playDate: string;
  rating: number;
}

// Booking Related Types
export interface Booking extends TimeSlot {
  id: number;
  playDate: string;
  price: number;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;

  // Club information
  clubId: number;
  clubName: string;
  clubProfile: string;
  clubLocation: string;
  clubRating: Rating;
  
  // Pitch information
  pitchName: string;
  condition: string;
  pitchSize: string;
  sportType: string;
  pitch_detail: Pitch;
  
  // User information
  user: User;
}

// User Related Types
export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userProfile?: string;
  city?: string;
  email?: string;
  membership?: {
    name: string;
  };
  createdAt?: string;
}

// UI Component Types
export interface SelectItem {
  id: number;
  value: string;
  label: string;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
}

// Receipt Type (snake_case version of Booking for API responses)
export interface Payment {
  referenceNumber: string;
  transactionType: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  updatedAt: string;
  createdAt: string;
  
  // booking information
  booking_detail: {
    id: number;
    status: string;
  };
}

export interface ClubList {
  items: Club[];
  total: number;
  error?: string;
  filter: Function;
}

export interface Club {
    id: number;
    name: string;
    city: string;
    locationUrl: string;
    owner: {
      phone: string;
      email: string;
    };
    rating: {
      overall_rating: number;
      count: number;
    };
    coverImage: string;
    pitch_details: Pitch[];
    sport_types: Category[];
    scheduleOption: scheduleOption
}

export interface scheduleOption {
  operationHours: {
    openHour: number;
    closeHour: number;
  }
}

export interface Category {
  id: number;
  name: string;
}