-- Run this once in Supabase SQL Editor after the first migration.
-- Drizzle cannot represent triggers in schema.ts, so they live here.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_updated
  before update on app_user
  for each row execute function set_updated_at();

create trigger trg_service_updated
  before update on service
  for each row execute function set_updated_at();

create trigger trg_subscription_updated
  before update on subscription
  for each row execute function set_updated_at();

create trigger trg_membership_updated
  before update on membership
  for each row execute function set_updated_at();
