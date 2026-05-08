// Shared types for the RPP Generator Application

export interface Identitas {
  sekolah: string;
  lokasi: string;
  kelas: string;
  semester: string;
  mapel: string;
  alokasiWaktu: string;
  guru: string;
  nipGuru?: string;
  kepsek: string;
  nipKepsek?: string;
}

export interface GuruInfo {
  nip: string;
  nama: string;
}

export interface Pengaturan {
  karakteristik: string;
  minat: string;
  motivasi: string;
  prestasi: string;
  kearifanLokal: string;
  lingkungan: string;
  saranaPrasarana: string;
  profilPelajar: string[];
  profilLulusan: string[];
  tujuhKAIH: string[];
  guruList: GuruInfo[];
  kemitraan: string;

  pemanfaatanDigitalPerencanaan: string;
  pemanfaatanDigitalPelaksanaan: string;
  pemanfaatanDigitalAsesmen: string;
  kktp: string;
  modelPembelajaran: string;
  sumberBelajar: string[];
  diferensiasi: string[];
}

export interface CapaianMateri {
  fase: string;
  cp: string;
  materi: string;
}

export interface TujuanPembelajaran {
  tp: string[];
  metode: string[];
  sintaks: {
    tahap: string;
    deskripsi: string;
  }[];
}

export interface AppState {
  identitas: Identitas;
  pengaturan: Pengaturan;
  capaianMateri: CapaianMateri;
  tujuanPembelajaran: TujuanPembelajaran | null;
  modulAjar: string | null;
  lkpd: string | null;
  asesmen: string | null;
}
