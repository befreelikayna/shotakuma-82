
import { supabase } from './client';

// Create a custom typed version of supabase client that supports our custom tables
export const customSupabase = {
  from: (table: string) => {
    return supabase.from(table as any);
  },
  // Add channel method to our custom client
  channel: (name: string) => {
    return supabase.channel(name);
  },
  // Add removeChannel method to our custom client
  removeChannel: (channel: any) => {
    return supabase.removeChannel(channel);
  }
};
