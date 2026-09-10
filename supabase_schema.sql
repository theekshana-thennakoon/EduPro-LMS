-- ============================================================
-- EduPro LMS - Complete Supabase PostgreSQL Schema & Seed Script
-- Run this in your Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT 'EduPro Academy',
  institute_title TEXT NOT NULL DEFAULT 'Global Online Institute of Excellence',
  tagline TEXT DEFAULT 'Empowering future leaders through world-class online education',
  logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
  support_email TEXT DEFAULT 'director@eduproacademy.org',
  support_phone TEXT DEFAULT '+1 (800) 420-5678',
  address TEXT DEFAULT '450 Innovation Parkway, Suite 300, Silicon Valley, CA',
  currency TEXT DEFAULT 'LKR / INR (Rs.)',
  currency_symbol TEXT DEFAULT 'Rs.',
  accent_color TEXT DEFAULT '#6366f1',
  allow_self_registration BOOLEAN DEFAULT true,
  theme_mode TEXT DEFAULT 'light',
  payment_gateway JSONB DEFAULT '{"provider": "Stripe Secure Pay", "testMode": true, "publishableKey": "pk_test_demo", "bankTransferInstructions": "Bank: Silicon Horizon Bank | Account: 8840-2910-4491"}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. ACADEMIC SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#4f46e5',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. GRADE LEVELS TABLE
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ACADEMIC CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  grade TEXT,
  description TEXT,
  instructor TEXT,
  schedule TEXT,
  fee NUMERIC DEFAULT 0,
  capacity INTEGER DEFAULT 100,
  thumbnail TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. LESSONS TABLE (WITH VIDEOS, NOTES & QUIZZES JSONB)
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 1,
  description TEXT,
  videos JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  quizzes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'student', -- 'student' | 'teacher'
  avatar TEXT,
  title TEXT,
  phone TEXT,
  grade TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  enrolled_class_ids JSONB DEFAULT '[]'::jsonb,
  completed_lesson_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. PAYMENTS & TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  student_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  student_name TEXT,
  student_email TEXT,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  class_name TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'Rs.',
  date DATE DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'Direct Bank Transfer',
  status TEXT DEFAULT 'Completed', -- 'Completed' | 'Pending' | 'Refunded'
  txn_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  class_id TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  attempt_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create Open Public Access Policies (for rapid deployment with anon key)
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL USING (true);

CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public write subjects" ON subjects FOR ALL USING (true);

CREATE POLICY "Public read grades" ON grades FOR SELECT USING (true);
CREATE POLICY "Public write grades" ON grades FOR ALL USING (true);

CREATE POLICY "Public read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public write classes" ON classes FOR ALL USING (true);

CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public write lessons" ON lessons FOR ALL USING (true);

CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public write users" ON users FOR ALL USING (true);

CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Public write payments" ON payments FOR ALL USING (true);

CREATE POLICY "Public read quiz_attempts" ON quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Public write quiz_attempts" ON quiz_attempts FOR ALL USING (true);

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================
INSERT INTO site_settings (id, site_name, institute_title, currency_symbol, tagline)
VALUES ('default', 'EduPro Academy', 'Global Online Institute of Excellence', 'Rs.', 'Empowering future leaders through world-class online education')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, name, code, description, icon, color)
VALUES 
  ('subj-math', 'Pure Mathematics & Calculus', 'MATH101', 'Differential and integral calculus, vector algebra, differential equations, and complex analysis.', '📐', '#4f46e5'),
  ('subj-phys', 'Advanced Theoretical Physics', 'PHYS201', 'Classical mechanics, thermodynamics, wave optics, electromagnetism, and atomic quantum models.', '⚡', '#06b6d4'),
  ('subj-chem', 'Organic & Physical Chemistry', 'CHEM301', 'Hydrocarbon mechanisms, chemical equilibrium, thermodynamics, molecular orbital theory, and kinetics.', '🧪', '#10b981'),
  ('subj-bio', 'Cell Biology & Molecular Genetics', 'BIO401', 'Cellular physiology, Mendelian genetics, recombinant DNA biotechnology, and ecosystem dynamics.', '🧬', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (id, name, code, level, description, color)
VALUES
  ('grade-10', 'Grade 10', 'G10', 10, 'Foundational secondary school curriculum.', '#06b6d4'),
  ('grade-11', 'Grade 11', 'G11', 11, 'Intermediate pre-university studies.', '#3b82f6'),
  ('grade-12', 'Grade 12 / AP', 'G12-AP', 12, 'Advanced Placement and university preparation.', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, password, role, title, avatar)
VALUES
  ('teacher-1', 'Dr. Alistair Vance, Ph.D.', 'teacher@edupro.org', 'admin123', 'teacher', 'Head of Pure Sciences & Lead LMS Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
  ('std-demo', 'Samantha Perera', 'student@edupro.org', 'student123', 'student', 'Student Scholar', 'https://api.dicebear.com/7.x/adventurer/svg?seed=student1')
ON CONFLICT (id) DO NOTHING;
