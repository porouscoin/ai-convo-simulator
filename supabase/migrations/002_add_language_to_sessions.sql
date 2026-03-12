-- Add language column to sessions
-- Supports: 'english' (default) | 'roman_urdu'

alter table public.sessions
add column if not exists language text not null default 'english';
