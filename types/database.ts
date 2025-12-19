/**
 * Database Types
 * Auto-generated types for Supabase database schema
 */

// Enums
export type MembershipTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export type ServiceType = 'hotel' | 'tour' | 'transfer' | 'yacht';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Table: profiles
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: MembershipTier;
  created_at: string;
  updated_at: string;
}

// Table: services
export interface Service {
  id: string;
  name: string;
  description: string | null;
  type: ServiceType;
  location: string;
  base_price: number;
  discount_price: number;
  metadata: Record<string, any>;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Table: last_minute_deals
export interface LastMinuteDeal {
  id: string;
  service_id: string;
  deal_price: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

// Table: plans
export interface Plan {
  id: string;
  user_id: string;
  name: string | null;
  is_booked: boolean;
  created_at: string;
  updated_at: string;
}

// Table: bookings
export interface Booking {
  id: string;
  user_id: string;
  plan_id: string | null;
  total_amount: number;
  status: BookingStatus;
  stripe_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

// Table: subscriptions
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  status: SubscriptionStatus;
  membership_tier: MembershipTier;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

// Table: plan_items
export interface PlanItem {
  id: string;
  plan_id: string;
  service_id: string;
  quantity: number;
  metadata: Record<string, any>;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: any;
        Update: any;
      };
      services: {
        Row: Service;
        Insert: any;
        Update: any;
      };
      last_minute_deals: {
        Row: LastMinuteDeal;
        Insert: any;
        Update: any;
      };
      plans: {
        Row: Plan;
        Insert: any;
        Update: any;
      };
      plan_items: {
        Row: PlanItem;
        Insert: any;
        Update: any;
      };
      bookings: {
        Row: Booking;
        Insert: any;
        Update: any;
      };
    };
    Enums: {
      membership_tier: MembershipTier;
      subscription_status: SubscriptionStatus;
      service_type: ServiceType;
      booking_status: BookingStatus;
    };
  };
}
