import { TextInputProps, ViewStyle, TextStyle } from 'react-native'
import { ComponentType, ReactNode } from 'react'

export interface InputFieldProps extends TextInputProps {
  inputComponent?: ComponentType<any>
  label?: string
  placeholder?: string
  value?: string
  onChangeText: (text: string) => void
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onLeftIconPress?: () => void
  onRightIconPress?: () => void
  secureTextEntry?: boolean
  error?: string
  editable?: boolean
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

export interface AppButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  bgColor?: string
  textColor?: string
  containerStyle?: ViewStyle
  textStyle?: TextStyle
}

export interface IconButtonProps {
  icon: ReactNode
  onPress: () => void
  size?: number
  bgColor?: string
  disabled?: boolean
  containerStyle?: ViewStyle
}

// auth
export interface SignUpPayload {
    firstName: string,
    lastName:string,
    email:string,
    phone: string,
    password: string,
    confirmPassword:string,
    machineDetail: any,
};


export interface ErrorModel {
    [key:string]: string
}

export type OtpFlowType = 'signup' | 'forgotPassword' | 'login'

export interface OtpParams {
  email: string
  flowType: OtpFlowType
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  password: string
  confirmPassword: string
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

/* ---------- auth ---------- */

export interface MachineDetail {
  uniqueId?: string;
  manufacturer?: string;
  totalMemory?: number;
  batteryLevel?: number;
  isEmulator?: boolean;
  ipAddress?: string;
  deviceId?: string;
  brand?: string;
  model?: string;
  systemName?: string;
  systemVersion?: string;
  appVersion?: string;
  buildNumber?: string;
  bundleId?: string;
  isTablet?: boolean;
  readableVersion?: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  machineDetail: MachineDetail;
}

export interface LoginPayload {
  email: string;
  password: string;
  machineDetail: MachineDetail;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: { email: string; otp: string };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser; accessToken: string; refreshToken: string };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: { accessToken: string; refreshToken: string };
}

export interface ProfileResponse {
  success: boolean;
  data: AuthUser & { isVerified: boolean; createdAt: string };
}

/* ---------- category ---------- */

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

/* ---------- destination ---------- */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EstimatedBudget {
  min: number;
  max: number;
  currency: string;
}

export interface HowToReach {
  byAir?: string;
  byRoad?: string;
  byTrain?: string;
}

export type PriceLevel = "budget" | "mid-range" | "luxury" | "ultra-luxury";

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  description: string;
  longDescription: string;
  images: string[];
  coverImage: string;
  category: CategoryRef;
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  priceLevel: PriceLevel;
  estimatedBudget: EstimatedBudget;
  bestTimeToVisit: string[];
  climate?: string;
  language?: string;
  currency?: string;
  timeZone?: string;
  highlights: string[];
  activities: string[];
  tips: string[];
  howToReach: HowToReach;
  nearbyAttractions: string[];
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isPopular: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationRef {
  _id: string;
  name: string;
  country: string;
  city: string;
  coverImage?: string;
  coordinates?: Coordinates;
}

/* ---------- tour package ---------- */

export type Difficulty = "easy" | "moderate" | "challenging" | "extreme";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: string;
  accommodation?: string;
}

export interface TourPackage {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  destination: DestinationRef;
  category: CategoryRef;
  images: string[];
  coverImage: string;
  duration: { days: number; nights: number };
  price: number;
  discountPrice?: number;
  currency: string;
  maxGroupSize: number;
  difficulty: Difficulty;
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  startDates: string[];
  meetingPoint?: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---------- hotel ---------- */

export interface RoomType {
  name: string;
  description?: string;
  pricePerNight: number;
  maxOccupancy: number;
  bedType?: string;
  images: string[];
  amenities: string[];
}

export interface Hotel {
  _id: string;
  name: string;
  slug: string;
  description: string;
  destination: DestinationRef;
  images: string[];
  coverImage: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  coordinates: Coordinates;
  address: string;
  amenities: string[];
  roomTypes: RoomType[];
  contactInfo: { phone?: string; email?: string; website?: string };
  checkIn: string;
  checkOut: string;
  policies: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---------- review ---------- */

export type ReviewType = "destination" | "hotel" | "tour";
export type TravelType = "solo" | "couple" | "family" | "friends" | "business";

export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Review {
  _id: string;
  user: ReviewUser;
  reviewType: ReviewType;
  destination?: string;
  hotel?: string;
  tourPackage?: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  travelDate?: string;
  travelType?: TravelType;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ---------- responses ---------- */

export interface DashboardData {
  categories: Category[];
  featured: Destination[];
  trending: Destination[];
  popular: Destination[];
  topTours: TourPackage[];
  topHotels: Hotel[];
}
export type DashboardResponse = ApiResponse<DashboardData>;

export type CategoriesResponse = ApiResponse<Category[]>;
export type DestinationsResponse = PaginatedResponse<Destination>;
export type ToursResponse = PaginatedResponse<TourPackage>;
export type HotelsResponse = PaginatedResponse<Hotel>;
export type ReviewsResponse = PaginatedResponse<Review>;

export interface DestinationDetail {
  destination: Destination;
  tours: TourPackage[];
  hotels: Hotel[];
  reviews: Review[];
}
export type DestinationDetailResponse = ApiResponse<DestinationDetail>;

export interface TourDetail {
  tour: TourPackage;
  reviews: Review[];
}
export type TourDetailResponse = ApiResponse<TourDetail>;

export interface HotelDetail {
  hotel: Hotel;
  reviews: Review[];
}
export type HotelDetailResponse = ApiResponse<HotelDetail>;

export interface SearchData {
  destinations: Destination[];
  tours: TourPackage[];
  hotels: Hotel[];
}
export type SearchResponse = ApiResponse<SearchData>;

/* ---------- query params ---------- */

export interface DestinationQuery {
  category?: string;
  search?: string;
  priceLevel?: PriceLevel;
  sortBy?: "rating" | "price-low" | "price-high" | "popular";
  page?: number;
  limit?: number;
}

export interface TourQuery {
  destination?: string;
  category?: string;
  difficulty?: Difficulty;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price-low" | "price-high" | "rating" | "duration";
  page?: number;
  limit?: number;
}

export interface HotelQuery {
  destination?: string;
  starRating?: 1 | 2 | 3 | 4 | 5;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price-low" | "price-high" | "rating" | "stars";
  page?: number;
  limit?: number;
}

export interface ReviewQuery {
  type?: ReviewType;
  id?: string;
  page?: number;
  limit?: number;
}

/* ---------- enums ---------- */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "partially-paid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "bank-transfer" | "jazzcash" | "easypaisa" | "card";
export type BookingType = "tour" | "hotel";
export type Gender = "male" | "female" | "other";

/* ---------- request payloads ---------- */

export interface LeadTraveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;              // 35202-1234567-1
  passportNumber?: string;
  dateOfBirth: string;       // ISO
  gender: Gender;
  nationality?: string;      // default "Pakistani"
  address: string;
  city: string;
}

export interface Companion {
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  relation: string;
  cnic?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Guests {
  adults: number;            // min 1
  children?: number;
  infants?: number;
}

interface BookingPayloadBase {
  startDate: string;
  guests: Guests;
  leadTraveler: LeadTraveler;
  companions?: Companion[];
  emergencyContact: EmergencyContact;
  pickupLocation?: string;
  specialRequests?: string;
  dietaryRequirements?: string;
  medicalConditions?: string;
  needsVisaAssistance?: boolean;
  paymentMethod: PaymentMethod;
}

export interface CreateTourBookingPayload extends BookingPayloadBase {
  bookingType: "tour";
  tourPackage: string;
}

export interface CreateHotelBookingPayload extends BookingPayloadBase {
  bookingType: "hotel";
  hotel: string;
  roomTypeName: string;
  roomsCount: number;
  endDate: string;
}

export type CreateBookingPayload = CreateTourBookingPayload | CreateHotelBookingPayload;

export interface CancelBookingPayload {
  reason: string;            // min 5 chars
}

/* ---------- booking model ---------- */

export interface BookingPricing {
  unitPrice: number;
  billableGuests: number;    // tour: adults+children | hotel: rooms
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  total: number;
  currency: string;
}

export interface BookingPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountPaid: number;
  transactionRef?: string;
  paidAt?: string;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  note?: string;
  changedBy?: string;
  changedAt: string;
}

export interface RoomSelection {
  roomTypeName?: string;
  roomsCount?: number;
  pricePerNight?: number;
}

export interface Cancellation {
  reason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  refundAmount?: number;
}

/** Populated refs — sirf list/detail responses mein aate hain. */
export interface BookedTourRef {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  duration: { days: number; nights: number };
  difficulty: string;
  itinerary?: ItineraryDay[];   // detail call pe
  includes?: string[];
  excludes?: string[];
  meetingPoint?: string;
}

export interface BookedHotelRef {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  starRating: number;
  address: string;
  amenities?: string[];          // detail call pe
  checkIn?: string;
  checkOut?: string;
  policies?: string[];
  contactInfo?: { phone?: string; email?: string; website?: string };
}

export interface BookedDestinationRef {
  _id: string;
  name: string;
  city: string;
  country: string;
  coverImage: string;
  coordinates?: Coordinates;
}

export interface Booking {
  _id: string;
  bookingNumber: string;         // SFR-2026-A1B2C3D4
  user: string;
  bookingType: BookingType;
  tourPackage?: BookedTourRef;
  hotel?: BookedHotelRef;
  destination: BookedDestinationRef;
  startDate: string;
  endDate: string;
  nights: number;
  guests: { adults: number; children: number; infants: number };
  totalGuests: number;           // virtual
  roomSelection?: RoomSelection;
  leadTraveler: LeadTraveler;
  companions: Companion[];
  emergencyContact: EmergencyContact;
  pickupLocation?: string;
  specialRequests?: string;
  dietaryRequirements?: string;
  medicalConditions?: string;
  needsVisaAssistance: boolean;
  pricing: BookingPricing;
  payment: BookingPayment;
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  adminNote?: string;
  cancellation?: Cancellation;
  createdAt: string;
  updatedAt: string;
}

/* ---------- responses ---------- */

export type CreateBookingResponse = ApiResponse<Booking>;
export type BookingDetailResponse = ApiResponse<Booking>;
export type CancelBookingResponse = ApiResponse<Booking>;

export interface MyBookingsResponse {
  success: boolean;
  data: Booking[];
  summary: Partial<Record<BookingStatus, number>>;
  pagination: Pagination;
}

export interface BookingQuery {
  status?: BookingStatus;
  bookingType?: BookingType;
  page?: number;
  limit?: number;
}