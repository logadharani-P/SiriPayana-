/*
# Create travel_plans table for saved trip data

1. New Tables
- `travel_plans`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users with cascade delete)
  - `trip_name` (text, name the user gave the trip)
  - `trip_data` (jsonb, the full TripState JSON: preferences, selected destinations, package, transport, itinerary, budget)
  - `status` (text, defaults to 'draft' — can be 'draft' or 'complete')
  - `total_budget` (numeric, defaults to 0 — denormalized for quick dashboard display)
  - `destinations_count` (integer, defaults to 0 — denormalized for quick dashboard display)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `travel_plans`.
- Owner-scoped CRUD: each authenticated user can only read, insert, update, and delete their own rows.
- The `user_id` column has `DEFAULT auth.uid()` so inserts that omit it still pass the WITH CHECK.
- Policies:
  - select_own_travel_plans: SELECT where auth.uid() = user_id
  - insert_own_travel_plans: INSERT with CHECK auth.uid() = user_id
  - update_own_travel_plans: UPDATE where auth.uid() = user_id, with CHECK auth.uid() = user_id
  - delete_own_travel_plans: DELETE where auth.uid() = user_id

3. Indexes
- `travel_plans_user_id_idx` on user_id for fast per-user queries
- `travel_plans_updated_at_idx` on updated_at DESC for recent-trips ordering

4. Important Notes
- This is a multi-user app with a sign-in screen, so policies are scoped TO authenticated.
- The anon role (unauthenticated) has NO access to this table — correct, because trips are private.
- The full trip state is stored as JSONB in `trip_data` to match the existing TripContext shape without a complex multi-table schema.
*/

CREATE TABLE IF NOT EXISTS travel_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_name text NOT NULL DEFAULT 'My Trip',
  trip_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  total_budget numeric NOT NULL DEFAULT 0,
  destinations_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_travel_plans" ON travel_plans;
CREATE POLICY "select_own_travel_plans"
  ON travel_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_travel_plans" ON travel_plans;
CREATE POLICY "insert_own_travel_plans"
  ON travel_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_travel_plans" ON travel_plans;
CREATE POLICY "update_own_travel_plans"
  ON travel_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_travel_plans" ON travel_plans;
CREATE POLICY "delete_own_travel_plans"
  ON travel_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS travel_plans_user_id_idx ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS travel_plans_updated_at_idx ON travel_plans(updated_at DESC);
