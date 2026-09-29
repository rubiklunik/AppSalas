-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  username TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Safely and avoiding recursion)

-- Function to check if the current user is an admin
-- SECURITY DEFINER allows it to check the profiles table bypassing RLS for this specific check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 4. Set up an automatic profile creation (Optional)
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
*/

-- 5. Create the projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
  "Cod" TEXT PRIMARY KEY,
  "Promoción" TEXT,
  "Municipio" TEXT,
  "Estado2" TEXT,
  "Nº Plantas SR" TEXT,
  "Nº VIV./Nº HAB." TEXT,
  "Sup Const. SR" TEXT,
  "Rango" TEXT,
  "CCAA" TEXT,
  "Província" TEXT,
  "TIPO de Negocio" TEXT,
  "Régimen" TEXT,
  "Link IMG" TEXT,
  "LINK MIN" TEXT,
  "LINK PDF" TEXT,
  "Dirección" TEXT,
  "Referencia Catastral" TEXT,
  "Promotora" TEXT,
  "Arquitecto" TEXT,
  "Constructora" TEXT,
  "Presupuesto" TEXT,
  "Coste m2" TEXT,
  "Ventas" TEXT,
  "Descripción" TEXT,
  "Tipología" TEXT,
  "Subtipología" TEXT,
  "Tipo CUB." TEXT,
  "Estado" TEXT,
  "NOMBRE IMG" TEXT,
  "IMAGEN" TEXT,
  "NOMBRE PDF" TEXT,
  "PDF" TEXT,
  "Calificación" TEXT,
  "Producto" TEXT,
  "Tipo" TEXT,
  "Subtipo" TEXT,
  "Tipo Cub" TEXT,
  "Nº Pl. BR" TEXT,
  "Sup Const. BR" TEXT,
  "Nº TOT Pl" TEXT,
  "Notas" TEXT,
  "Latitud" DOUBLE PRECISION,
  "Longitud" DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 7. Policies for the existing 'projects' table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read access' AND tablename = 'projects') THEN
        CREATE POLICY "Allow authenticated read access" ON public.projects FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update notes' AND tablename = 'projects') THEN
        CREATE POLICY "Allow authenticated update notes" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
