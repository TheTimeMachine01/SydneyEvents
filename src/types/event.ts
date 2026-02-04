export type EventStatus = 'new' | 'updated' | 'inactive' | 'imported';

export interface Event {
  id: string;
  title: string;
  date_time: string;
  venue: string;
  city: string;
  description: string | null;
  image_url: string | null;
  source_name: string | null;
  original_url: string | null;
  status: EventStatus;
  last_scraped_at: string | null;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  event_id: string | null;
  email_opt_in: boolean;
  created_at: string;
}
