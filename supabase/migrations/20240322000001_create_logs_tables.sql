CREATE TABLE IF NOT EXISTS repair_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  repair_date DATE NOT NULL,
  repair_location TEXT NOT NULL,
  repair_cost DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  file_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_location TEXT NOT NULL,
  purchase_cost DECIMAL(10, 2) NOT NULL,
  warranty_info TEXT,
  notes TEXT,
  file_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS repair_logs_user_id_idx ON repair_logs(user_id);
CREATE INDEX IF NOT EXISTS repair_logs_repair_date_idx ON repair_logs(repair_date);
CREATE INDEX IF NOT EXISTS purchase_logs_user_id_idx ON purchase_logs(user_id);
CREATE INDEX IF NOT EXISTS purchase_logs_purchase_date_idx ON purchase_logs(purchase_date);

alter publication supabase_realtime add table repair_logs;
alter publication supabase_realtime add table purchase_logs;