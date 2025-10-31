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

// Table: profiles
export interface Profile {
  id: string; // UUID - references auth.users(id)
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: MembershipTier;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  membership_tier?: MembershipTier;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  membership_tier?: MembershipTier;
}

// Table: subscriptions
export interface Subscription {
  id: string; // UUID
  user_id: string; // UUID - references profiles(id)

  // Stripe identifiers
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;

  // Subscription details
  status: SubscriptionStatus;
  membership_tier: MembershipTier;

  // Billing period
  current_period_start: string | null; // ISO timestamp
  current_period_end: string | null; // ISO timestamp
  cancel_at_period_end: boolean;
  canceled_at: string | null; // ISO timestamp

  // Trial information
  trial_start: string | null; // ISO timestamp
  trial_end: string | null; // ISO timestamp

  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface SubscriptionInsert {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  status: SubscriptionStatus;
  membership_tier: MembershipTier;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
}

export interface SubscriptionUpdate {
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  status?: SubscriptionStatus;
  membership_tier?: MembershipTier;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
    };
    Enums: {
      membership_tier: MembershipTier;
      subscription_status: SubscriptionStatus;
    };
  };
}
