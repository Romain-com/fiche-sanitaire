-- Table fiches sanitaires
CREATE TABLE fiches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'envoye',
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE fiches ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations (prototype mode)
CREATE POLICY "Allow all operations" ON fiches
  FOR ALL
  USING (true)
  WITH CHECK (true);
