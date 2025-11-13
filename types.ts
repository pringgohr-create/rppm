// types.ts

export interface MadrasahInfo {
  namaMadrasah: string;
  namaGuru: string;
  mataPelajaran: string;
  fase: string;
  kelas: string;
  tahunPelajaran: string;
}

export interface CapaianPembelajaran {
  id: string;
  text: string;
}

export interface TPItem {
  no: number;
  capaianPembelajaran: string;
  kontenPembelajaran: string;
  kompetensi: string;
  materiPokok: string;
  tujuanPembelajaran: string;
}

export enum NilaiKBC {
  CINTA_ALLAH_RASUL = 'Cinta Allah dan RasulNYa',
  CINTA_ILMU = 'Cinta Ilmu',
  CINTA_DIRI_SESAMA = 'Cinta Diri dan Sesama',
  CINTA_ALAM = 'Cinta Alam',
  CINTA_BANGSA_NEGERI = 'Cinta Bangsa dan Negeri',
}

export enum DimensiProfilLulusan {
  KEIMANAN_KETAQWAAN = 'Keimanan dan Ketakwaan terhadap Tuhan YME',
  KEWARGAAN = 'Kewargaan',
  PENALARAN_KRITIS = 'Penalaran Kritis',
  KREATIVITAS = 'Kreativitas',
  KOLABORASI = 'Kolaborasi',
  KEMANDIRIAN = 'Kemandirian',
  KESEHATAN = 'Kesehatan',
  KOMUNIKASI = 'Komunikasi',
}

export interface ATPItem {
  no: number;
  tujuanPembelajaran: string;
  indikator: string;
  materiPokok: string;
  nilaiKBC: NilaiKBC[]; // Can have multiple KBC values
  alokasiWaktu: string;
  dimensiProfilLulusan: DimensiProfilLulusan[]; // Can have multiple dimensions
  asesmen: string;
  sumberBelajar: string;
}

export enum ModelPembelajaran {
  PBL = 'Problem Based Learning',
  PJBL = 'Project Based Learning',
  DL = 'Discovery Learning',
  INQUIRY = 'Inquiry Learning',
  COOPERATIVE = 'Cooperative Learning',
  BLENDED = 'Blended Learning',
  HYBRID = 'Hybrid Learning',
  GROUP = 'Group Investigation',
}

export enum StrategiPembelajaran {
  DISCOVERY = 'Pembelajaran Penemuan (Discovery Learning)',
  INQUIRY = 'Pembelajaran Inkuiri (Inquiry Learning)',
  KOLABORATIF = 'Pembelajaran Kolaboratif',
  PROBLEM_SOLVING = 'Pemecahan Masalah (Problem Solving)',
  STUDI_KASUS = 'Studi Kasus',
  DISKUSI = 'Diskusi',
}

export enum MetodePembelajaran {
  DISKUSI = 'Diskusi',
  PRESENTASI = 'Presentasi',
  PROJEK = 'Projek',
  SIMULASI = 'Simulasi',
  ROLE_PLAY = 'Role Play',
  KUNJUNGAN_LAPANGAN = 'Kunjungan Lapangan',
  EKSPERIMEN = 'Eksperimen',
  CERAMAH_INTERAKTIF = 'Ceramah Interaktif',
}

export interface PraktikPedagogis {
  model: ModelPembelajaran[];
  strategi: StrategiPembelajaran[];
  metode: MetodePembelajaran[];
}

export interface KemitraanPembelajaran {
  pustakawan?: string;
  laboranSekolah?: string;
  guruLain?: string;
  pihakLuarSekolah?: string;
}

export interface LingkunganPembelajaran {
  fisik: string;
  virtual: string;
  budayaBelajar: string;
}

export interface PengalamanBelajarKegiatan {
  berkesadaran: string;
  bermakna: string;
  menggembirakan: string;
}

export interface LangkahPembelajaran {
  kegiatanAwal: { description: string; alokasiWaktuMenit: number };
  kegiatanInti: { description: string; alokasiWaktuMenit: number };
  kegiatanPenutup: { description: string; alokasiWaktuMenit: number };
}

export interface AsesmenPembelajaran {
  asesmenAwal: string;
  asesmenProses: string;
  asesmenAkhir: string;
}

export interface LKPDItem {
  judul: string;
  instruksi: string;
  tabel: Array<{ header: string; type: 'text' | 'number' | 'textarea' | 'checkbox' }>; // Simplified for example
}

export interface RubrikPenilaian {
  kognitif: string;
  sikap: string;
  presentasi: string;
}

export interface PPMData {
  identitas: {
    namaMadrasah: string;
    namaGuru: string;
    mataPelajaran: string;
    fase: string;
    semester: string;
    alokasiWaktu: string; // Added alokasiWaktu here
    materiPelajaran: string; // integrated with KBC
    dimensiProfilLulusan: DimensiProfilLulusan[];
    pokokMateri: string;
  };
  desainPembelajaran: {
    capaianPembelajaran: string[]; // integrated with KBC
    lintasDisiplinIlmu: string[];
    tujuanPembelajaran: string[]; // integrated with KBC
    praktikPedagogis: PraktikPedagogis;
    kemitraanPembelajaran: KemitraanPembelajaran;
    lingkunganPembelajaran: LingkunganPembelajaran;
    pemanfaatanDigital: string;
    deepLearningApproach: string; // Explanation of mindful, meaningful, joyful, olah pikir/hati/rasa/raga
  };
  pengalamanBelajar: {
    mindfulMeaningfulJoyful: PengalamanBelajarKegiatan;
    langkahPembelajaran: LangkahPembelajaran;
  };
  asesmenPembelajaran: AsesmenPembelajaran;
  lampiran: {
    lkpd: LKPDItem;
    instrumenPenilaian: RubrikPenilaian;
  };
}