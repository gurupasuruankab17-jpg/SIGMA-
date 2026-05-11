
CREATE TABLE modul_ajar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sekolah TEXT,
    guru TEXT,
    kelas TEXT,
    mapel TEXT,
    materi TEXT,
    identitas JSONB,
    pengaturan JSONB,
    capaian_materi JSONB,
    tujuan_pembelajaran JSONB,
    modul_ajar TEXT,
    lkpd TEXT,
    asesmen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE modul_ajar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON modul_ajar FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON modul_ajar FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON modul_ajar FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON modul_ajar FOR DELETE USING (true);
