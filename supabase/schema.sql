-- Create works table
CREATE TABLE IF NOT EXISTS works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  file_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(work_id, user_ip)
);

-- Enable Row Level Security
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies for works (public read, authenticated write)
CREATE POLICY "Anyone can read works" ON works FOR SELECT USING (true);
CREATE POLICY "Anyone can insert works" ON works FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update works" ON works FOR UPDATE USING (true);

-- Create policies for comments (public read and write)
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Create policies for likes (public read and write)
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert likes" ON likes FOR INSERT WITH CHECK (true);

-- Create storage bucket for works
INSERT INTO storage.buckets (id, name, public)
VALUES ('works', 'works', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
  USING (bucket_id = 'works');

CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'works');

CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'works');

CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE 
  USING (bucket_id = 'works');
