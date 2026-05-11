import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppState, Identitas, Pengaturan, CapaianMateri } from './types';
import { generateContentObj, generateContentText, Type } from './lib/gemini';
import { 
  BookOpen, Users, ClipboardList, PenTool, 
  FileText, CheckSquare, Settings, Printer, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Key, X,
  UserCheck, LayoutTemplate, MonitorPlay, Heart
} from 'lucide-react';

const INITIAL_STATE: AppState = {
  identitas: {
    sekolah: 'SDN Baujeng I',
    lokasi: 'Beji',
    kelas: 'IV / Ganjil',
    semester: 'Ganjil',
    mapel: 'IPAS',
    alokasiWaktu: '2 JP x 35 Menit',
    guru: 'Nama Guru, S.Pd',
    nipGuru: '19xxxxxxxxxxxxxx',
    kepsek: 'Akhmad Nasor, S.Pd',
    nipKepsek: '198704082019031001'
  },
  pengaturan: {
    karakteristik: 'Peserta didik cukup aktif dan menyukai kegiatan praktik langsung.',
    minat: 'Sebagian besar memiliki minat tinggi pada visual dan eksperimen.',
    motivasi: 'Peserta didik memiliki motivasi belajar yang tinggi terutama pada kegiatan proyek.',
    prestasi: 'Rata-rata siswa memiliki prestasi akademik yang cukup baik.',
    kearifanLokal: 'Potensi wilayah sekitar.',
    lingkungan: 'Ruang kelas dengan proyektor dan halaman sekolah untuk observasi.',
    saranaPrasarana: 'Buku Siswa, proyektor, laptop, dan lingkungan sekitar sekolah.',
    profilPelajar: [],
    profilLulusan: ['Keimanan & Ketakwaan', 'Kewargaan'],
    tujuhKAIH: ['bangun pagi', 'beribadah'],
    guruList: [
      { nip: "197010092002122004", nama: "Sulfia Irana, S.Pd" },
      { nip: "198504252020121002", nama: "Moh. Arifuddin Habib, S.Pd" },
      { nip: "198603232025211020", nama: "Johan Adi Susanto, S.Pd" },
      { nip: "199111142024212040", nama: "Muflichatus Sofiana, S.Pd" },
      { nip: "199203232020122022", nama: "Arina Nuri Azmi, S.Pd" },
      { nip: "199704182024211013", nama: "Mochammad Feris Aprilianto, S.Pd" },
      { nip: "199910282024212031", nama: "Sitta Risdiana, S.Pd" },
      { nip: "2025001", nama: "Naily Syarifah, S.Pd" },
      { nip: "2025002", nama: "Iyus Yusnita Sholikha, S.Pd" }
    ],
    kemitraan: 'Guru Mapel lain dan orang tua siswa.',
    pemanfaatanDigitalPerencanaan: 'Mencari referensi dari internet (YouTube, artikel pembelajaran).',
    pemanfaatanDigitalPelaksanaan: 'Menggunakan proyektor untuk presentasi interaktif dan video pembelajaran.',
    pemanfaatanDigitalAsesmen: 'Menggunakan platform kuis interaktif (Quizizz/Wordwall).',
    kktp: 'Minimal 75% peserta didik memahami materi dengan predikat B.',
    modelPembelajaran: 'Problem Based Learning (PBL)',
    sumberBelajar: ['Gambar', 'Video YouTube'],
    diferensiasi: ['Diferensiasi Konten']
  },
  capaianMateri: {
    fase: 'B',
    cp: 'Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada manusia.',
    materi: 'Fungsi Bagian Tubuh Manusia (Panca Indera)'
  },
  tujuanPembelajaran: null,
  modulAjar: null,
  lkpd: null,
  asesmen: null
};

export default function App() {
  const [activeStep, setActiveStep] = useState(1);
  const [activeSettingsTab, setActiveSettingsTab] = useState(1);
  const [data, setData] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKeys, setCustomApiKeys] = useState('');
  const [apiKeys, setApiKeys] = useState<string[]>([]);

  
  const [stepModes, setStepModes] = useState<Record<number, 'edit' | 'preview'>>({
    1: 'edit', 2: 'edit', 3: 'edit', 4: 'preview', 5: 'preview', 6: 'preview', 7: 'preview'
  });

  const updateStepMode = (stepId: number, mode: 'edit' | 'preview') => {
    setStepModes(prev => ({ ...prev, [stepId]: mode }));
  };

  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        setIsSettingsOpen(true);
        return 0;
      }
      return newCount;
    });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };
  
  const getApiKey = () => {
     if (apiKeys.length === 0) return undefined;
     const randomIndex = Math.floor(Math.random() * apiKeys.length);
     return apiKeys[randomIndex];
  };

  const steps = [
    { id: 1, title: 'Identitas', icon: BookOpen },
    { id: 2, title: 'Pengaturan Konten', icon: Settings },
    { id: 3, title: 'Capaian Pembelajaran', icon: FileText },
    { id: 4, title: 'Tujuan & Model', icon: PenTool },
    { id: 5, title: 'Modul Ajar', icon: ClipboardList },
    { id: 6, title: 'LKPD', icon: Users },
    { id: 7, title: 'Asesmen', icon: CheckSquare },
  ];

  const stepColors: Record<number, any> = {
    1: { name: 'blue', active: 'bg-blue-600 text-white shadow-md', pastBtn: 'bg-blue-50 text-blue-700 hover:bg-blue-100', pastIcon: 'text-blue-600', nextBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white', prevBtn: 'bg-slate-200 hover:bg-slate-300 text-slate-800' },
    2: { name: 'emerald', active: 'bg-emerald-600 text-white shadow-md', pastBtn: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', pastIcon: 'text-emerald-600', nextBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white', prevBtn: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    3: { name: 'cyan', active: 'bg-cyan-600 text-white shadow-md', pastBtn: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100', pastIcon: 'text-cyan-600', nextBtn: 'bg-amber-500 hover:bg-amber-600 text-white', prevBtn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' },
    4: { name: 'amber', active: 'bg-amber-500 text-white shadow-md', pastBtn: 'bg-amber-50 text-amber-700 hover:bg-amber-100', pastIcon: 'text-amber-600', nextBtn: 'bg-teal-600 hover:bg-teal-700 text-white', prevBtn: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800' },
    5: { name: 'teal', active: 'bg-teal-600 text-white shadow-md', pastBtn: 'bg-teal-50 text-teal-700 hover:bg-teal-100', pastIcon: 'text-teal-600', nextBtn: 'bg-pink-600 hover:bg-pink-700 text-white', prevBtn: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
    6: { name: 'pink', active: 'bg-pink-600 text-white shadow-md', pastBtn: 'bg-pink-50 text-pink-700 hover:bg-pink-100', pastIcon: 'text-pink-600', nextBtn: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white', prevBtn: 'bg-teal-100 hover:bg-teal-200 text-teal-800' },
    7: { name: 'fuchsia', active: 'bg-fuchsia-600 text-white shadow-md', pastBtn: 'bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100', pastIcon: 'text-fuchsia-600', nextBtn: 'bg-slate-800 hover:bg-slate-700 text-white', prevBtn: 'bg-pink-100 hover:bg-pink-200 text-pink-800' },
  };


  const updateIdentitas = (field: keyof Identitas, value: string) => {
    setData(prev => ({ ...prev, identitas: { ...prev.identitas, [field]: value } }));
  };

  const updatePengaturan = (field: keyof Pengaturan, value: any) => {
    setData(prev => ({ ...prev, pengaturan: { ...prev.pengaturan, [field]: value } }));
  };

  const updateCapaian = (field: keyof CapaianMateri, value: string) => {
    setData(prev => ({ ...prev, capaianMateri: { ...prev.capaianMateri, [field]: value } }));
  };

  const currentStepInfo = steps.find(s => s.id === activeStep);

  // --- Handlers for AI Generation ---

  const handleGenerateTP = async () => {
    setLoading(true);
    try {
      const prompt = `Anda adalah ahli kurikulum Sekolah Dasar (SD) spesialis Pembelajaran Mendalam (Deep Learning).
Buatkan Tujuan Pembelajaran, Metode, dan Sintaks untuk:
- Mata Pelajaran: ${data.identitas.mapel}
- Kelas: ${data.identitas.kelas}
- Fase: ${data.capaianMateri.fase}
- Capaian Pembelajaran: ${data.capaianMateri.cp}
- Materi Pokok: ${data.capaianMateri.materi}
- Karakteristik Siswa: ${data.pengaturan.karakteristik}
- Model Pembelajaran: ${data.pengaturan.modelPembelajaran}

Buatlah Tujuan Pembelajaran yang meliputi ranah Memahami, Mengaplikasi, dan Merefleksi yang sesuai untuk anak SD.
Susun sintaks pembelajaran sesuai dengan model ${data.pengaturan.modelPembelajaran} secara logis.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          tp: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 Tujuan pembelajaran (Memahami, Mengaplikasi, Merefleksi)" },
          metode: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar metode (misal ceramah, diskusi, tanya jawab)" },
          sintaks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tahap: { type: Type.STRING, description: "Nama tahap/fase" },
                deskripsi: { type: Type.STRING, description: "Aktivitas guru dan siswa secara ringkas" }
              }
            }
          }
        },
        required: ["tp", "metode", "sintaks"]
      };

      const result = await generateContentObj(prompt, schema, getApiKey());
      if (result) {
        setData(prev => ({ ...prev, tujuanPembelajaran: result }));
        setActiveStep(5);
      }
    } catch (e: any) {
      alert('Gagal menghasilkan Tujuan Pembelajaran: ' + (e.message || 'Error tidak diketahui'));
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateModul = async () => {
    setLoading(true);
    try {
      if (!data.tujuanPembelajaran) throw new Error("Generate TP terlebih dahulu");
      
      const prompt = `Anda adalah guru ahli jenjang Sekolah Dasar (SD). Buatkan Modul Ajar (Rencana Pembelajaran Mendalam / RPM) untuk:
Mapel: ${data.identitas.mapel}, Kelas: ${data.identitas.kelas}, Materi: ${data.capaianMateri.materi}.
Alokasi Waktu: ${data.identitas.alokasiWaktu}.
Profil Lulusan: ${(data.pengaturan.profilLulusan || []).join(', ')}.

Kondisi Awal:
- Karakteristik: ${data.pengaturan.karakteristik}
- Minat: ${data.pengaturan.minat}
- Motivasi: ${data.pengaturan.motivasi}
- Prestasi: ${data.pengaturan.prestasi}
- Kearifan Lokal: ${data.pengaturan.kearifanLokal}

Lingkungan & Media:
- Lingkungan: ${data.pengaturan.lingkungan}
- Sarana & Prasarana: ${data.pengaturan.saranaPrasarana}
- Digital (Perencanaan): ${data.pengaturan.pemanfaatanDigitalPerencanaan}
- Digital (Pelaksanaan): ${data.pengaturan.pemanfaatanDigitalPelaksanaan}
- Digital (Asesmen): ${data.pengaturan.pemanfaatanDigitalAsesmen}

Kriteria Ketercapaian (KKTP): ${data.pengaturan.kktp}
Model: ${data.pengaturan.modelPembelajaran}
Metode: ${data.tujuanPembelajaran.metode.join(', ')}
Diferensiasi (Opsional): ${data.pengaturan.diferensiasi?.join(', ') || 'Tidak ada'}
Integrasi 7KAIH: ${(data.pengaturan.tujuhKAIH || []).join(', ') || 'Tidak ada'}

[PENTING]
Sajikan Identitas Modul, Pengaturan Konten, Capaian Pembelajaran, dan Sintaks Model (Tahapan) dalam bentuk TABEL yang relevan.
Gunakan bahasa yang lugas dan to the point untuk menghemat penggunaan token/API.
Hindari titik-titik panjang (...). JANGAN berikan tempat kosong berupa titik-titik pada lampiran, ganti dengan format yang rapi dan ringkas.

STRUKTUR MODUL:
1. Identitas, Pengaturan Konten & Capaian Pembelajaran (Gunakan Tabel)
2. Identifikasi Materi (Konseptual, Prosedural, Metakognitif) disesuaikan dengan level SD.
3. Relevansi dengan Kehidupan Nyata Siswa SD.
4. Desain Pembelajaran (Topik, Praktik Pedagogis, Lingkungan, Kemitraan: ${data.pengaturan.kemitraan}).
5. Langkah-Langkah Pembelajaran (Sintaks Model disajikan dalam Tabel):
   - PENDAHULUAN (Apersepsi, Motivasi)
   - INTI (Gunakan sintaks: ${data.tujuanPembelajaran.sintaks.map(s => s.tahap).join(' -> ')})
     *Sertakan catatan/instruksi diferensiasi dan Integrasi 7KAIH di tahap Inti jika ada.
   - PENUTUP (Refleksi, Tindak Lanjut)

Format dalam Markdown yang rapi dan profesional.`;

      const result = await generateContentText(prompt, getApiKey());
      setData(prev => ({ ...prev, modulAjar: result }));
      setActiveStep(6);
    } catch (e: any) {
      alert('Gagal menghasilkan Modul Ajar: ' + (e.message || 'Error tidak diketahui'));
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateLKPD = async () => {
    setLoading(true);
    try {
      const prompt = `Anda adalah pendidik tingkat Sekolah Dasar (SD). Buatkan Lembar Kerja Peserta Didik (LKPD) yang menarik dan disesuaikan dengan prinsip Pembelajaran Mendalam untuk anak kelas ${data.identitas.kelas}.
Mata Pelajaran: ${data.identitas.mapel}
Materi: ${data.capaianMateri.materi}
Model Pembelajaran: ${data.pengaturan.modelPembelajaran}
Sumber Belajar LKPD: ${data.pengaturan.sumberBelajar?.join(', ') || 'Buku Teks'}

LKPD harus berisi:
- Identitas Kelompok/Siswa
- Tujuan Kegiatan
- Alat dan Bahan
- Petunjuk/Langkah Kegiatan yang jelas dengan bahasa SD. Jika menggunakan sumber seperti YouTube/Quizizz/Wordwall sebutkan instruksinya.
- Ruang Diskusi/Lembar Kerja (Berisi 3-5 pertanyaan analisis masalah/proyek yang sesuai level SD).

[PENTING]
Sajikan isi dalam bentuk tabel jika memungkinkan (seperti alat, bahan, atau langkah kegiatan).
Gunakan bahasa yang lugas dan to the point.
Hindari penggunaan titik-titik (.............) yang panjang untuk ruang isian, ganti dengan ruang kosong menggunakan baris baru atau tabel.
Format dengan Markdown yang rapi.`;

      const result = await generateContentText(prompt, getApiKey());
      setData(prev => ({ ...prev, lkpd: result }));
      setActiveStep(7);
    } catch (e: any) {
      alert('Gagal menghasilkan LKPD: ' + (e.message || 'Error tidak diketahui'));
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateAsesmen = async () => {
    setLoading(true);
    try {
      const prompt = `Sebagai ahli evaluasi SD, buatkan Instrumen Asesmen untuk Pembelajaran Mendalam materi ${data.capaianMateri.materi} kelas ${data.identitas.kelas}.
Tujuan Pembelajaran: 
${data.tujuanPembelajaran?.tp.map(t => '- '+t).join('\n')}
KKTP: ${data.pengaturan.kktp}
Diferensiasi: ${data.pengaturan.diferensiasi?.join(', ') || 'Tidak ada'}

[PENTING]
Sajikan rubrik, indikator, atau skala penilaian DALAM BENTUK TABEL.
Gunakan bahasa yang lugas dan to the point.
Hindari titik-titik panjang (.........), khususnya di bagian soal atau lampiran instrumen, gunakan format ruang kosong yang efisien.

Susun dalam format Markdown:
1. Asesmen Diagnostik (Awal Pembelajaran)
   - 3 pertanyaan terbuka.
2. Asesmen pada Proses Pembelajaran
   a. Observasi (Assessment as Learning & For Learning)
      - Fokus Penilaian
      - Indikator yang Diobservasi
      - Skala Penilaian (format tabel)
   b. Penilaian Kinerja (Assessment as Learning & For Learning)
      - Fokus Penilaian
      - Rubrik Indikator yang Diobservasi
      - Skala Penilaian (format tabel)
   c. Peer Assessment (Assessment as Learning)
      - Contoh Pertanyaan/Kriteria untuk Peer Assessment
3. Asesmen Sumatif (Akhir Pembelajaran)
   - Tes tulis mencakup:
     - 3 soal Pilihan Ganda (HOTS level SD) beserta kunci jawaban.
     - 2 soal Uraian berbasis analisis kasus lengkap dengan rubrik penilaian (Skala 1-4).`;

      const result = await generateContentText(prompt, getApiKey());
      setData(prev => ({ ...prev, asesmen: result }));
    } catch (e: any) {
      alert('Gagal menghasilkan Asesmen: ' + (e.message || 'Error tidak diketahui'));
      console.error(e);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-sm z-10 print:hidden">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3">
            <img src="https://lh3.googleusercontent.com/d/1FV7EmCnGHRbpQvbbdrRv-t0KZCUXbIqk" alt="Logo" className="w-10 h-10 bg-white rounded p-1 object-contain" />
            <div>
              <h1 
                className="text-2xl font-black tracking-tight cursor-pointer select-none"
                onClick={handleTitleClick}
              >
                SIGMA
              </h1>
              <p className="text-indigo-200 text-sm font-medium">Sistem Generator Modul Ajar Berbasis AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg font-semibold text-sm border border-indigo-500"
            >
              <Printer size={18} />
              <span className="hidden md:inline">Cetak Dokumen</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Steps */}
        <aside className="w-full md:w-64 shrink-0 print:hidden">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4 px-2 hidden md:block">Tahapan</h3>
            <div className="flex overflow-x-auto md:flex-col gap-1 scrollbar-hide pb-2 md:pb-0">
              {steps.map((step) => {
                const colors = stepColors[step.id];
                return (
                <button 
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap md:whitespace-normal text-left ${activeStep === step.id ? colors.active : activeStep > step.id ? colors.pastBtn : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <step.icon size={18} className={activeStep === step.id ? 'text-white' : activeStep > step.id ? colors.pastIcon : 'text-slate-400'} />
                  <span>{step.title}</span>
                </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pb-20">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 print:shadow-none print:border-none print:p-0">

            <div className="print:hidden mb-6 border-b border-slate-100 pb-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                {currentStepInfo?.icon && React.createElement(currentStepInfo.icon, { className: "text-indigo-600" })}
                Tahap {activeStep}: {currentStepInfo?.title}
              </h2>
              <div className="flex bg-slate-100 p-1 rounded-lg self-start lg:self-auto">
                <button 
                  onClick={() => updateStepMode(activeStep, 'edit')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${stepModes[activeStep] === 'edit' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Edit Data
                </button>
                <button 
                  onClick={() => updateStepMode(activeStep, 'preview')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${stepModes[activeStep] === 'preview' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Preview Hasil
                </button>
              </div>
            </div>

            {/* Tahap 1: Identitas */}
            <div className={activeStep === 1 ? 'block' : 'hidden print:block'}>
              <h3 className="font-bold text-xl mb-4 text-blue-900 border-b-2 border-blue-100 pb-2 print:text-black print:border-none">A. IDENTITAS MODUL</h3>
              
              {stepModes[1] === 'preview' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Nama Sekolah</p>
                    <p className="font-medium text-slate-800">{data.identitas.sekolah}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Lokasi Sekolah</p>
                    <p className="font-medium text-slate-800">{data.identitas.lokasi}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Kelas / Semester</p>
                    <p className="font-medium text-slate-800">{data.identitas.kelas} / {data.identitas.semester}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Mata Pelajaran</p>
                    <p className="font-medium text-slate-800">{data.identitas.mapel}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Alokasi Waktu</p>
                    <p className="font-medium text-slate-800">{data.identitas.alokasiWaktu}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Guru</p>
                    <p className="font-medium text-slate-800">{data.identitas.guru} <span className="text-slate-400 font-normal">({data.identitas.nipGuru || '-'})</span></p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-1">Kepala Sekolah</p>
                    <p className="font-medium text-slate-800">{data.identitas.kepsek} <span className="text-slate-400 font-normal">({data.identitas.nipKepsek || '-'})</span></p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-2 print:text-sm">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Sekolah</label>
                    <input type="text" value={data.identitas.sekolah} onChange={e => updateIdentitas('sekolah', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0" />
                  </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Lokasi Sekolah</label>
                  <input type="text" value={data.identitas.lokasi} onChange={e => updateIdentitas('lokasi', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Kelas</label>
                    <select value={data.identitas.kelas} onChange={e => updateIdentitas('kelas', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0">
                       {['Kelas I', 'Kelas II', 'Kelas III', 'Kelas IV', 'Kelas V', 'Kelas VI'].map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Semester</label>
                    <select value={data.identitas.semester} onChange={e => updateIdentitas('semester', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0">
                       {['Ganjil', 'Genap'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                  <select value={data.identitas.mapel} onChange={e => updateIdentitas('mapel', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0">
                    {['Pendidikan Agama dan Budi Pekerti', 'Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', 'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)', 'Seni Musik', 'Seni Rupa', 'Seni Teater', 'Seni Tari', 'Bahasa Inggris', 'Muatan Lokal'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Alokasi Waktu</label>
                  <select value={data.identitas.alokasiWaktu} onChange={e => updateIdentitas('alokasiWaktu', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0">
                    {['1 JP x 35 Menit', '2 JP x 35 Menit', '3 JP x 35 Menit', '4 JP x 35 Menit', '5 JP x 35 Menit', '6 JP x 35 Menit', '7 JP x 35 Menit'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Guru</label>
                    <select 
                      value={data.identitas.guru} 
                      onChange={e => {
                        const selectedName = e.target.value;
                        const selectedGuru = data.pengaturan.guruList?.find(g => g.nama === selectedName);
                        updateIdentitas('guru', selectedName);
                        if (selectedGuru) {
                          updateIdentitas('nipGuru', selectedGuru.nip);
                        }
                      }} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0"
                    >
                      <option value="" disabled>Pilih Guru...</option>
                      {(data.pengaturan.guruList || []).map(g => <option key={g.nip} value={g.nama}>{g.nama}</option>)}
                      <option value={data.identitas.guru} className="hidden">{data.identitas.guru}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">NIP Guru</label>
                    <input type="text" value={data.identitas.nipGuru || ''} onChange={e => updateIdentitas('nipGuru', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0" placeholder="Opsional" />
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Kepala Sekolah</label>
                    <input type="text" value={data.identitas.kepsek} onChange={e => updateIdentitas('kepsek', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">NIP Kepala Sekolah</label>
                    <input type="text" value={data.identitas.nipKepsek || ''} onChange={e => updateIdentitas('nipKepsek', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0" placeholder="Opsional" />
                  </div>
                </div>
              </div>
              )}
              <div className="mt-8 flex justify-end print:hidden">
                <button onClick={() => setActiveStep(2)} className={`${stepColors[1].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
              </div>
            </div>

            {/* Tahap 2: Konten */}
            <div className={activeStep === 2 ? 'block' : 'hidden print:block'}>
              <h3 className="font-bold text-xl mt-8 mb-4 text-emerald-900 border-b-2 border-emerald-100 pb-2 print:text-black print:border-none">B. PENGATURAN KONTEN & IDENTIFIKASI</h3>
              
              {stepModes[2] === 'preview' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-bold text-indigo-700 mb-2">1. Identifikasi Awal</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                      <div><span className="font-semibold text-slate-500 block text-xs">Karakteristik Siswa</span>{data.pengaturan.karakteristik}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Minat Belajar</span>{data.pengaturan.minat}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Motivasi</span>{data.pengaturan.motivasi}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Prestasi</span>{data.pengaturan.prestasi}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Kearifan Lokal</span>{data.pengaturan.kearifanLokal}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">KKTP</span>{data.pengaturan.kktp}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-pink-700 mb-2">2. Kerangka Pembelajaran</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                      <div><span className="font-semibold text-slate-500 block text-xs">Kemitraan</span>{data.pengaturan.kemitraan}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Lingkungan</span>{data.pengaturan.lingkungan}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Digital (Perencanaan)</span>{data.pengaturan.pemanfaatanDigitalPerencanaan}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Digital (Pelaksanaan)</span>{data.pengaturan.pemanfaatanDigitalPelaksanaan}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Digital (Asesmen)</span>{data.pengaturan.pemanfaatanDigitalAsesmen}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Sarana Prasarana</span>{data.pengaturan.saranaPrasarana}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-700 mb-2">3. Model, Media & Desain</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                      <div><span className="font-semibold text-slate-500 block text-xs">Model Pembelajaran</span>{data.pengaturan.modelPembelajaran}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Sumber Belajar LKPD</span>{data.pengaturan.sumberBelajar?.join(', ') || '-'}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Diferensiasi</span>{data.pengaturan.diferensiasi?.join(', ') || '-'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-700 mb-2">4. Character Building</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                      <div><span className="font-semibold text-slate-500 block text-xs">Profil Lulusan</span>{data.pengaturan.profilLulusan?.join(', ') || '-'}</div>
                      <div><span className="font-semibold text-slate-500 block text-xs">Integrasi 7KAIH</span><span className="capitalize">{data.pengaturan.tujuhKAIH?.join(', ') || '-'}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-nowrap overflow-x-auto gap-2 mb-6 print:hidden w-full pb-2 scrollbar-hide">
                    <button 
                      onClick={() => setActiveSettingsTab(1)} 
                      className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg border transition ${activeSettingsTab === 1 ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    ><UserCheck size={16}/> 1. Identifikasi Awal Siswa</button>
                <button 
                  onClick={() => setActiveSettingsTab(2)} 
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg border transition ${activeSettingsTab === 2 ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                ><LayoutTemplate size={16}/> 2. Kerangka Pembelajaran</button>
                <button 
                  onClick={() => setActiveSettingsTab(3)} 
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg border transition ${activeSettingsTab === 3 ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                ><MonitorPlay size={16}/> 3. Model, Media & Desain</button>
                <button 
                  onClick={() => setActiveSettingsTab(4)} 
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg border transition ${activeSettingsTab === 4 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                ><Heart size={16}/> 4. Character Building</button>
              </div>

              <div className="space-y-5 print:text-sm">
                
                {/* TAB 1 */}
                <div className={activeSettingsTab === 1 ? 'block' : 'hidden print:block'}>
                  <h4 className="font-bold text-indigo-800 border-b pb-2 hidden print:block mb-4">1. Identifikasi Awal Siswa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Karakteristik Siswa</label>
                      <textarea value={data.pengaturan.karakteristik} onChange={e => updatePengaturan('karakteristik', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Minat Belajar</label>
                      <textarea value={data.pengaturan.minat} onChange={e => updatePengaturan('minat', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Motivasi Belajar</label>
                      <textarea value={data.pengaturan.motivasi} onChange={e => updatePengaturan('motivasi', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Prestasi Belajar</label>
                      <textarea value={data.pengaturan.prestasi} onChange={e => updatePengaturan('prestasi', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Kearifan Lokal</label>
                      <textarea value={data.pengaturan.kearifanLokal} onChange={e => updatePengaturan('kearifanLokal', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Pengaturan KKTP</label>
                      <textarea value={data.pengaturan.kktp} onChange={e => updatePengaturan('kktp', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* TAB 2 */}
                <div className={activeSettingsTab === 2 ? 'block' : 'hidden print:block'}>
                  <h4 className="font-bold text-pink-800 border-b pb-2 hidden print:block mb-4 mt-6 print:mt-0">2. Kerangka Pembelajaran</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Kemitraan Pembelajaran</label>
                      <textarea value={data.pengaturan.kemitraan} onChange={e => updatePengaturan('kemitraan', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Lingkungan Pembelajaran</label>
                      <textarea value={data.pengaturan.lingkungan} onChange={e => updatePengaturan('lingkungan', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Pemanfaatan Digital (Perencanaan)</label>
                      <textarea value={data.pengaturan.pemanfaatanDigitalPerencanaan} onChange={e => updatePengaturan('pemanfaatanDigitalPerencanaan', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Pemanfaatan Digital (Pelaksanaan)</label>
                      <textarea value={data.pengaturan.pemanfaatanDigitalPelaksanaan} onChange={e => updatePengaturan('pemanfaatanDigitalPelaksanaan', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Pemanfaatan Digital (Asesmen)</label>
                      <textarea value={data.pengaturan.pemanfaatanDigitalAsesmen} onChange={e => updatePengaturan('pemanfaatanDigitalAsesmen', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Sarana & Prasarana</label>
                      <textarea value={data.pengaturan.saranaPrasarana} onChange={e => updatePengaturan('saranaPrasarana', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* TAB 3 */}
                <div className={activeSettingsTab === 3 ? 'block' : 'hidden print:block'}>
                  <h4 className="font-bold text-amber-800 border-b pb-2 hidden print:block mb-4 mt-6 print:mt-0">3. Model, Media & Desain</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Model Pembelajaran</label>
                      <div className="flex flex-col gap-2 print:gap-1">
                        {['Project Based Learning (PjBL)', 'Problem Based Learning (PBL)', 'Discovery Learning', 'Inquiry Learning'].map(p => (
                          <label key={p} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer print:border-none print:p-0 print:bg-transparent">
                            <input type="radio" name="modelPembelajaran" checked={data.pengaturan.modelPembelajaran === p} 
                              onChange={() => updatePengaturan('modelPembelajaran', p)} 
                              className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Sumber Belajar (untuk LKPD)</label>
                      <div className="flex flex-col gap-2 print:gap-1">
                        {['Gambar', 'Video YouTube', 'Quizizz', 'Wordwall'].map(p => (
                          <label key={p} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer print:border-none print:p-0 print:bg-transparent">
                            <input type="checkbox" checked={data.pengaturan.sumberBelajar?.includes(p)} 
                              onChange={(e) => {
                                const arr = data.pengaturan.sumberBelajar || [];
                                const newArr = e.target.checked ? [...arr, p] : arr.filter(x => x !== p);
                                updatePengaturan('sumberBelajar', newArr);
                              }} 
                              className="w-4 h-4 text-indigo-600 rounded" />
                            <span className="text-sm">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Desain Pembelajaran Berdiferensiasi (Opsional)</label>
                      <div className="flex flex-col gap-2 print:gap-1">
                        {['Diferensiasi Konten', 'Diferensiasi Proses', 'Diferensiasi Produk'].map(p => (
                          <label key={p} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer print:border-none print:p-0 print:bg-transparent">
                            <input type="checkbox" checked={data.pengaturan.diferensiasi?.includes(p)} 
                              onChange={(e) => {
                                const arr = data.pengaturan.diferensiasi || [];
                                const newArr = e.target.checked ? [...arr, p] : arr.filter(x => x !== p);
                                updatePengaturan('diferensiasi', newArr);
                              }} 
                              className="w-4 h-4 text-indigo-600 rounded" />
                            <span className="text-sm">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TAB 4 */}
                <div className={activeSettingsTab === 4 ? 'block' : 'hidden print:block'}>
                  <h4 className="font-bold text-emerald-800 border-b pb-2 hidden print:block mb-4 mt-6 print:mt-0">4. Character Building</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Profil Lulusan</label>
                      <div className="flex gap-2 flex-wrap print:gap-1">
                        {['Keimanan & Ketakwaan', 'Kewargaan', 'Kemandirian', 'Kesehatan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Komunikasi'].map(p => (
                          <label key={p} className="flex flex-1 min-w-[45%] items-start gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer print:border-none print:p-0 print:bg-transparent">
                            <input type="checkbox" checked={(data.pengaturan.profilLulusan || []).includes(p)} 
                              onChange={(e) => {
                                const arr = data.pengaturan.profilLulusan || [];
                                const newArr = e.target.checked ? [...arr, p] : arr.filter(x => x !== p);
                                updatePengaturan('profilLulusan', newArr);
                              }} 
                              className="w-4 h-4 mt-0.5 text-indigo-600 rounded shrink-0" />
                            <span className="text-xs leading-snug">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Pilih 7KAIH yang akan diintegrasikan</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 print:flex print:flex-wrap print:gap-1">
                        {['bangun pagi', 'beribadah', 'berolahraga', 'makan sehat', 'gemar belajar', 'bermasyarakat', 'tidur cepat'].map(p => (
                          <label key={p} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer print:border-none print:p-0 print:bg-transparent">
                            <input type="checkbox" checked={(data.pengaturan.tujuhKAIH || []).includes(p)} 
                              onChange={(e) => {
                                const arr = data.pengaturan.tujuhKAIH || [];
                                const newArr = e.target.checked ? [...arr, p] : arr.filter(x => x !== p);
                                updatePengaturan('tujuhKAIH', newArr);
                              }} 
                              className="w-4 h-4 mt-0.5 text-indigo-600 rounded shrink-0" />
                            <span className="text-xs leading-snug capitalize">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </>)}
              <div className="mt-8 flex justify-end gap-3 flex-wrap print:hidden pb-4 border-t border-slate-100 pt-6">
                <button onClick={() => setActiveStep(1)} className={`${stepColors[2].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                <button onClick={() => setActiveStep(3)} className={`${stepColors[2].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
              </div>
            </div>

            {/* Tahap 3: CP & Materi */}
            <div className={activeStep === 3 ? 'block' : 'hidden print:block'}>
              <h3 className="font-bold text-xl mt-8 mb-4 text-cyan-900 border-b-2 border-cyan-100 pb-2 print:text-black print:border-none">C. CAPAIAN PEMBELAJARAN (CP) & MATERI</h3>
              
              {stepModes[3] === 'preview' ? (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-500 font-semibold mb-1 text-xs">Fase Pembelajaran</p>
                      <p className="font-medium text-slate-800">Fase {data.capaianMateri.fase}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-1 text-xs">Materi Pokok</p>
                      <p className="font-medium text-slate-800">{data.capaianMateri.materi}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-slate-500 font-semibold mb-2 text-xs">Capaian Pembelajaran (CP)</p>
                    <p className="font-medium text-slate-800">{data.capaianMateri.cp}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 print:text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Fase Pembelajaran</label>
                      <select value={data.capaianMateri.fase} onChange={e => updateCapaian('fase', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:appearance-none print:border-none print:bg-transparent print:p-0">
                          {['A', 'B', 'C'].map(f => <option key={f} value={f}>Fase {f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1">Materi Pokok</label>
                      <textarea value={data.capaianMateri.materi} onChange={e => updateCapaian('materi', e.target.value)} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none print:border-none print:bg-transparent print:p-0 resize-none"></textarea>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Capaian Pembelajaran (CP)</label>
                    <textarea value={data.capaianMateri.cp} onChange={e => updateCapaian('cp', e.target.value)} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none print:border-none print:bg-transparent print:p-0"></textarea>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 flex-wrap print:hidden">
                <button onClick={() => setActiveStep(2)} className={`${stepColors[3].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                <button onClick={() => setActiveStep(4)} className={`${stepColors[3].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
              </div>
            </div>

            {/* Tahap 4: Tujuan Pembelajaran (AI Generated) */}
            <div className={activeStep === 4 ? 'block' : 'hidden print:block'}>
              <div className="flex justify-between items-center mb-4 mt-8 print:mt-4">
                 <h3 className="font-bold text-xl text-amber-900 border-b-2 border-amber-100 pb-2 print:text-black print:border-none">D. TUJUAN, MODEL & SINTAKS</h3>
                 {!data.tujuanPembelajaran && <button onClick={handleGenerateTP} disabled={loading} className="print:hidden bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <PenTool size={18}/>} Generate AI
                 </button>}
              </div>

              {data.tujuanPembelajaran ? (
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 print:bg-transparent print:border-none print:p-0 print:text-sm">
                  {stepModes[4] === 'preview' ? (
                    <>
                      <div className="mb-6">
                        <h4 className="font-bold text-slate-800 mb-2">Tujuan Pembelajaran:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                          {data.tujuanPembelajaran.tp.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-bold text-slate-800 mb-1">Model Pembelajaran:</h4>
                          <p className="text-slate-700 font-medium bg-white p-2 rounded-md border border-amber-200 print:border-none print:p-0 print:bg-transparent">{data.pengaturan.modelPembelajaran}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 mb-1">Metode:</h4>
                          <p className="text-slate-700 font-medium bg-white p-2 rounded-md border border-amber-200 print:border-none print:p-0 print:bg-transparent">{data.tujuanPembelajaran.metode.join(', ')}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 mb-2">Sintaks Pembelajaran:</h4>
                        <div className="bg-white rounded-lg border border-amber-200 divide-y divide-amber-100 print:border-none print:bg-transparent">
                          {data.tujuanPembelajaran.sintaks.map((s, i) => (
                            <div key={i} className="p-3 print:p-1 flex gap-4">
                              <div className="font-bold text-amber-700 w-1/4 shrink-0">{s.tahap}</div>
                              <div className="text-slate-600 text-sm">{s.deskripsi}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-800 mb-2">Tujuan Pembelajaran (1 baris per tujuan):</label>
                        <textarea 
                          value={data.tujuanPembelajaran.tp.join('\n')} 
                          onChange={(e) => setData({...data, tujuanPembelajaran: {...data.tujuanPembelajaran!, tp: e.target.value.split('\n')}})} 
                          rows={4}
                          className="w-full p-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-2">Metode (pisahkan dengan koma):</label>
                        <input 
                          type="text" 
                          value={data.tujuanPembelajaran.metode.join(', ')} 
                          onChange={(e) => setData({...data, tujuanPembelajaran: {...data.tujuanPembelajaran!, metode: e.target.value.split(',').map(m => m.trim())}})} 
                          className="w-full p-2.5 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-2">Sintaks Pembelajaran:</label>
                        <div className="space-y-3">
                          {data.tujuanPembelajaran.sintaks.map((s, i) => (
                            <div key={i} className="flex gap-2">
                              <input 
                                type="text"
                                value={s.tahap}
                                onChange={(e) => {
                                  const newSintaks = [...data.tujuanPembelajaran!.sintaks];
                                  newSintaks[i].tahap = e.target.value;
                                  setData({...data, tujuanPembelajaran: {...data.tujuanPembelajaran!, sintaks: newSintaks}});
                                }}
                                className="w-1/3 p-2 bg-white border border-amber-200 rounded-lg text-sm"
                                placeholder="Tahap"
                              />
                              <textarea
                                value={s.deskripsi}
                                onChange={(e) => {
                                  const newSintaks = [...data.tujuanPembelajaran!.sintaks];
                                  newSintaks[i].deskripsi = e.target.value;
                                  setData({...data, tujuanPembelajaran: {...data.tujuanPembelajaran!, sintaks: newSintaks}});
                                }}
                                className="w-2/3 p-2 bg-white border border-amber-200 rounded-lg text-sm resize-none"
                                placeholder="Deskripsi"
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3 justify-end print:hidden">
                      <button onClick={() => setActiveStep(3)} className={`${stepColors[4].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                      <button onClick={handleGenerateTP} disabled={loading} className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg transition">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : 'Regenerate'}
                      </button>
                      <button onClick={() => setActiveStep(5)} className={`${stepColors[4].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-amber-200 rounded-xl print:hidden">
                   <p className="text-amber-600 font-medium mb-4">Belum ada data. Klik tombol Generate AI untuk menghasilkan Tujuan Pembelajaran, Model dan Sintaks secara otomatis.</p>
                   <button onClick={() => setActiveStep(3)} className={`${stepColors[4].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto mt-4 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                </div>
              )}
            </div>

            {/* Tahap 5: Modul Ajar (Markdown generated by AI) */}
            <div className={activeStep === 5 ? 'block' : 'hidden print:block print:break-before-page'}>
              <div className="flex justify-between items-center mb-4 mt-8 print:mt-0">
                 <h3 className="font-bold text-xl text-teal-900 border-b-2 border-teal-100 pb-2 print:text-black print:border-none">E. MODUL AJAR (LANGKAH-LANGKAH)</h3>
                 {!data.modulAjar && <button onClick={handleGenerateModul} disabled={loading || !data.tujuanPembelajaran} className="print:hidden bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <ClipboardList size={18}/>} Generate Modul Ajar
                 </button>}
              </div>
              
               {data.modulAjar ? (
                 <div className="prose prose-slate max-w-none break-words whitespace-pre-wrap prose-h2:text-xl prose-h2:text-teal-900 prose-h3:text-lg prose-h3:text-teal-800 print:prose-p:text-sm print:prose-li:text-sm">
                    {stepModes[5] === 'edit' ? (
                      <textarea
                        className="w-full h-[500px] p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                        value={data.modulAjar}
                        onChange={(e) => setData({ ...data, modulAjar: e.target.value })}
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.modulAjar}</ReactMarkdown>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3 justify-end not-prose print:hidden border-t border-slate-100 pt-6">
                        <button onClick={() => setActiveStep(4)} className={`${stepColors[5].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                        <button onClick={handleGenerateModul} disabled={loading} className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg transition">
                          {loading ? <Loader2 className="animate-spin" size={18}/> : 'Regenerate'}
                        </button>
                        <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                          <Printer size={18}/> Cetak Dokumen
                        </button>
                        <button onClick={() => setActiveStep(6)} className={`${stepColors[5].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl print:hidden">
                   <p className="text-slate-500 mb-2">Pastikan Tujuan Pembelajaran telah di-generate sebelumnya.</p>
                   <button onClick={() => setActiveStep(4)} className={`${stepColors[5].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto mt-4 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                </div>
              )}
            </div>

            {/* Tahap 6: LKPD */}
            <div className={activeStep === 6 ? 'block' : 'hidden print:block print:break-before-page'}>
              <div className="flex justify-between items-center mb-4 mt-8 print:mt-0">
                 <h3 className="font-bold text-xl text-pink-900 border-b-2 border-pink-100 pb-2 print:text-black print:border-none">F. LEMBAR KERJA PESERTA DIDIK (LKPD)</h3>
                 {!data.lkpd && <button onClick={handleGenerateLKPD} disabled={loading || !data.tujuanPembelajaran} className="print:hidden bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Users size={18}/>} Generate LKPD
                 </button>}
              </div>

               {data.lkpd ? (
                 <div className="prose prose-slate max-w-none break-words whitespace-pre-wrap bg-white border border-slate-200 rounded-xl p-6 print:border-none print:p-0 print:prose-p:text-sm print:prose-li:text-sm prose-h2:text-xl prose-h2:text-pink-900 prose-h3:text-lg prose-h3:text-pink-800">
                    {stepModes[6] === 'edit' ? (
                      <textarea
                        className="w-full h-[500px] p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                        value={data.lkpd}
                        onChange={(e) => setData({ ...data, lkpd: e.target.value })}
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.lkpd}</ReactMarkdown>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3 justify-end not-prose print:hidden border-t border-slate-100 pt-6">
                        <button onClick={() => setActiveStep(5)} className={`${stepColors[6].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                        <button onClick={handleGenerateLKPD} disabled={loading} className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-lg transition">
                          {loading ? <Loader2 className="animate-spin" size={18}/> : 'Regenerate'}
                        </button>
                        <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                          <Printer size={18}/> Cetak Dokumen
                        </button>
                        <button onClick={() => setActiveStep(7)} className={`${stepColors[6].nextBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><span className="hidden sm:inline">Selanjutnya</span> <ChevronRight size={18}/></button>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-pink-200 rounded-xl print:hidden">
                   <p className="text-pink-600 font-medium">Klik Generate LKPD untuk menyusun aktivitas kelompok/individu yang menarik.</p>
                   <button onClick={() => setActiveStep(5)} className={`${stepColors[6].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto mt-4 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                </div>
              )}
            </div>

            {/* Tahap 7: Asesmen */}
            <div className={activeStep === 7 ? 'block' : 'hidden print:block print:break-before-page'}>
               <div className="flex justify-between items-center mb-4 mt-8 print:mt-0">
                 <h3 className="font-bold text-xl text-fuchsia-900 border-b-2 border-fuchsia-100 pb-2 print:text-black print:border-none">G. ASESMEN PEMBELAJARAN</h3>
                 {!data.asesmen && <button onClick={handleGenerateAsesmen} disabled={loading || !data.tujuanPembelajaran} className="print:hidden bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <CheckSquare size={18}/>} Generate Asesmen
                 </button>}
              </div>

               {data.asesmen ? (
                 <div className="prose prose-slate max-w-none break-words whitespace-pre-wrap prose-table:w-full prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-td:border prose-th:border print:prose-p:text-sm print:prose-li:text-sm print:prose-td:text-xs prose-h2:text-xl prose-h2:text-fuchsia-900 prose-h3:text-lg prose-h3:text-fuchsia-800">
                    {stepModes[7] === 'edit' ? (
                      <textarea
                        className="w-full h-[500px] p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                        value={data.asesmen}
                        onChange={(e) => setData({ ...data, asesmen: e.target.value })}
                      />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.asesmen}</ReactMarkdown>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3 justify-end not-prose print:hidden border-t border-slate-100 pt-6">
                        <button onClick={() => setActiveStep(6)} className={`${stepColors[7].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                        <button onClick={handleGenerateAsesmen} disabled={loading} className="text-fuchsia-600 hover:text-fuchsia-700 font-semibold flex items-center gap-2 px-4 py-2 bg-fuchsia-50 rounded-lg transition">
                          {loading ? <Loader2 className="animate-spin" size={18}/> : 'Regenerate'}
                        </button>
                        <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                          <Printer size={18}/> Cetak Dokumen RPP
                        </button>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-fuchsia-200 rounded-xl print:hidden">
                   <p className="text-fuchsia-600 font-medium">Hasilkan instrumen asesmen lengkap (Diagnostik, Formatif, Sumatif).</p>
                   <button onClick={() => setActiveStep(6)} className={`${stepColors[7].prevBtn} px-4 sm:px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto mt-4 transition`}><ChevronLeft size={18}/><span className="hidden sm:inline">Sebelumnya</span></button>
                </div>
              )}
            </div>

            {/* Signature Area for Printing */}
            <div className="hidden print:flex mt-16 text-sm w-full justify-between px-10">
                <div className="text-center">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{data.identitas.kepsek}</p>
                    <p>NIP. {data.identitas.nipKepsek || '-'}</p>
                </div>
                <div className="text-center">
                    <p>{data.identitas.lokasi}, ............................ {new Date().getFullYear()}</p>
                    <p>Guru Kelas / Mata Pelajaran</p>
                    <div className="h-24"></div>
                    <p className="font-bold underline">{data.identitas.guru}</p>
                    <p>NIP. {data.identitas.nipGuru || '-'}</p>
                </div>
            </div>

          </div>
        </div>
      </main>

      {/* Admin Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 print:hidden p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-indigo-600"/> Konfigurasi Admin</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Identitas Sekolah Default</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sekolah</label>
                          <input type="text" value={data.identitas.sekolah} onChange={e => updateIdentitas('sekolah', e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kepala Sekolah</label>
                          <input type="text" value={data.identitas.kepsek} onChange={e => updateIdentitas('kepsek', e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">NIP Kepala Sekolah</label>
                          <input type="text" value={data.identitas.nipKepsek || ''} onChange={e => updateIdentitas('nipKepsek', e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Daftar Guru (CSV)</h3>
                    <p className="text-xs text-slate-500 mb-3">Format: NIP,Nama Lengkap</p>
                    <textarea 
                      rows={5}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      value={(data.pengaturan.guruList || []).map(g => `${g.nip},${g.nama}`).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        const newGuruList = lines.map(line => {
                          const [nip, ...namaParts] = line.split(',');
                          return { nip: nip?.trim() || '', nama: namaParts.join(',').replace(/"/g, '').trim() || '' };
                        }).filter(g => g.nama !== '');
                        updatePengaturan('guruList', newGuruList);
                      }}
                    ></textarea>
                 </div>

                 <div>
                    <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Rotasi API Gemini (Lokal Pool)</h3>
                    <p className="text-xs text-slate-500 mb-3">Masing-masing kunci API harus dipisahkan dengan baris baru.</p>
                    
                    <div className="space-y-3">
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Daftar Pool API (Satu baris per API Key)</label>
                        <textarea 
                          rows={8}
                          value={customApiKeys}
                          onChange={(e) => setCustomApiKeys(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  const keys = customApiKeys.split('\n').map(k => k.trim()).filter(k => k);
                  if (keys.length > 0) {
                    setApiKeys(keys);
                  }
                  setIsSettingsOpen(false);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Printing via styles */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          body { background: white !important; font-size: 11pt; color: #000; }
          /* Ensure breaks don't happen awkwardly inside syntax blocks or cards */
          h3, h4 { page-break-after: avoid; }
          p, li { page-break-inside: avoid; }
          table { page-break-inside: avoid; border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 6px; }
          .prose { max-width: none !important; }
        }
      `}</style>
    </div>
  );
}

