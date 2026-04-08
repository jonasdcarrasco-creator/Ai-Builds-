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
 *
 * -- special_occasions
 * create table special_occasions (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references users(id) on delete cascade,
 *   type text not null,          -- 'anniversary' | 'birthday' | 'first_date_anniversary' | 'custom'
 *   label text not null,
 *   date date not null,          -- YYYY-MM-DD (annual recurring)
 *   reminder_sent boolean default false,
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Enable Row Level Security on special_occasions
 * alter table special_occasions enable row level security;
 * create policy "Users can manage own occasions"
 *   on special_occasions for all
 *   using (auth.uid() = user_id);
 *
 * -- vendor_listings extended (add missing columns if upgrading)
 * -- alter table vendor_listings add column dietary_tags text[] default '{}';
 * -- alter table vendor_listings add column badges text[] default '{}';
 * -- alter table vendor_listings add column distance text;
 * -- alter table vendor_listings add column parking_info text;
 * -- alter table vendor_listings add column review_count integer default 0;
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

// ─── Special Occasions ────────────────────────────────────────────────────────

export const saveSpecialOccasion = async (
  userId: string,
  occasion: { type: string; label: string; date: string },
) => {
  return supabase.from('special_occasions').insert({
    user_id: userId,
    type: occasion.type,
    label: occasion.label,
    date: occasion.date,
    reminder_sent: false,
  });
};

export const fetchSpecialOccasions = async (userId: string) => {
  return supabase
    .from('special_occasions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
};

export const deleteSpecialOccasion = async (occasionId: string) => {
  return supabase.from('special_occasions').delete().eq('id', occasionId);
};

export const markReminderSent = async (occasionId: string) => {
  return supabase
    .from('special_occasions')
    .update({ reminder_sent: true })
    .eq('id', occasionId);
};

// ─── Fetch occasions due for reminder (7 days ahead) ─────────────────────────
// Call this from a Supabase Edge Function or cron job, not client-side
export const getOccasionsDueForReminder = async () => {
  const today = new Date();
  const target = new Date(today);
  target.setDate(today.getDate() + 7);
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  // Match any year — compare month-day only
  return supabase
    .from('special_occasions')
    .select('*, users(email, name)')
    .eq('reminder_sent', false)
    .like('date', `%-${mm}-${dd}`);
};
