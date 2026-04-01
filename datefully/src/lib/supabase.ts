import { createClient } from '@supabase/supabase-js';

/*
 * Supabase SQL Schema — run these in your Supabase SQL editor:
 *
 * -- users: id, email, name, city, created_at
 * create table users (
 *   id uuid references auth.users primary key,
 *   email text not null,
 *   name text,
 *   city text default 'Philadelphia, PA',
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- partner_profiles
 * create table partner_profiles (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references users(id) on delete cascade,
 *   food_drinks text[],
 *   activities text[],
 *   outdoors text[],
 *   stay_home text[],
 *   personality text[],
 *   not_fan_of text[],
 *   accessibility text[],
 *   updated_at timestamp with time zone default now()
 * );
 *
 * -- date_history
 * create table date_history (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references users(id) on delete cascade,
 *   date_plan jsonb,
 *   budget numeric,
 *   occasion text,
 *   booked_at timestamp with time zone,
 *   completed boolean default false,
 *   rating integer,
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- bookings
 * create table bookings (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references users(id) on delete cascade,
 *   date_history_id uuid references date_history(id),
 *   venue_names text[],
 *   booking_time timestamp with time zone,
 *   transport_mode text,
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- vendor_listings
 * create table vendor_listings (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   category text,
 *   rating numeric,
 *   price_range text,
 *   description text,
 *   booking_url text,
 *   city text default 'Philadelphia, PA',
 *   sponsored boolean default true
 * );
 *
 * -- ratings
 * create table ratings (
 *   id uuid default gen_random_uuid() primary key,
 *   booking_id uuid references bookings(id),
 *   stars integer check (stars between 1 and 5),
 *   review text,
 *   submitted_at timestamp with time zone default now()
 * );
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (!error && data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      city: 'Philadelphia, PA',
    });
  }
  return { data, error };
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const savePartnerProfile = async (userId: string, profile: Record<string, string[]>) => {
  return supabase
    .from('partner_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() });
};

export const saveDateHistory = async (
  userId: string,
  datePlan: object,
  budget: number,
  occasion: string
) => {
  return supabase.from('date_history').insert({
    user_id: userId,
    date_plan: datePlan,
    budget,
    occasion,
    booked_at: new Date().toISOString(),
  });
};

export const submitRating = async (bookingId: string, stars: number, review?: string) => {
  return supabase.from('ratings').insert({
    booking_id: bookingId,
    stars,
    review,
    submitted_at: new Date().toISOString(),
  });
};
