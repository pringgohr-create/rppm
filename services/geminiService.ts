// services/geminiService.ts
import { GoogleGenAI, Type } from '@google/genai';
import {
  MadrasahInfo,
  CapaianPembelajaran,
  TPItem,
  ATPItem,
  PPMData,
  NilaiKBC,
  DimensiProfilLulusan,
  ModelPembelajaran,
  StrategiPembelajaran,
  MetodePembelajaran,
} from '../types';
import {
  GEMINI_MODEL,
  KBC_VALUES,
  DIMENSI_PROFIL_LULUSAN_VALUES,
  DEEP_LEARNING_APPROACH_EXPLANATION,
} from '../constants';

const getGeminiClient = () => {
  // Ensure API key is present
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates an array of TPItem objects for each given Capaian Pembelajaran.
 * Each CP will be expanded into 6 sets of (Konten, Kompetensi, Materi, TP).
 */
export async function generateTP(
  madrasahInfo: MadrasahInfo,
  cps: CapaianPembelajaran[],
): Promise<TPItem[][]> {
  const ai = getGeminiClient();
  const results: TPItem[][] = [];

  for (const cp of cps) {
    const prompt = `
      Sebagai seorang ahli kurikulum dengan fokus pada pembelajaran mendalam dan integrasi nilai-nilai cinta, buatkan 6 (enam) set Tujuan Pembelajaran (TP) yang mendalam berdasarkan Capaian Pembelajaran berikut.
      Setiap set TP harus mencakup: Konten Pembelajaran, Kompetensi, Materi Pokok, dan Tujuan Pembelajaran.
      Pastikan setiap TP mengintegrasikan nilai-nilai Kurikulum Berbasis Cinta (KBC) secara implisit dan relevan dengan fase, kelas, dan mata pelajaran yang diberikan.

      Detail Pembelajaran:
      Nama Madrasah: ${madrasahInfo.namaMadrasah}
      Nama Guru: ${madrasahInfo.namaGuru}
      Mata Pelajaran: ${madrasahInfo.mataPelajaran}
      Fase: ${madrasahInfo.fase}
      Kelas: ${madrasahInfo.kelas}
      Tahun Pelajaran: ${madrasahInfo.tahunPelajaran}

      Capaian Pembelajaran (CP): ${cp.text}

      Output harus dalam format JSON array of objects, di mana setiap objek memiliki kunci 'kontenPembelajaran', 'kompetensi', 'materiPokok', dan 'tujuanPembelajaran'.
      Sertakan 6 objek untuk CP ini.
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                kontenPembelajaran: { type: Type.STRING },
                kompetensi: { type: Type.STRING },
                materiPokok: { type: Type.STRING },
                tujuanPembelajaran: { type: Type.STRING },
              },
              required: ['kontenPembelajaran', 'kompetensi', 'materiPokok', 'tujuanPembelajaran'],
            },
          },
        },
      });

      const jsonStr = response.text.trim();
      const parsedTPs: Omit<TPItem, 'no' | 'capaianPembelajaran'>[] = JSON.parse(jsonStr);

      const tpsForCp: TPItem[] = parsedTPs.map((item, index) => ({
        no: index + 1,
        capaianPembelajaran: cp.text,
        ...item,
      }));
      results.push(tpsForCp);
    } catch (error) {
      console.error(`Error generating TP for CP "${cp.text}":`, error);
      throw new Error(`Failed to generate TP for CP "${cp.text}". Please try again.`);
    }
  }
  return results;
}

/**
 * Generates an array of ATPItem objects based on the provided TPItem objects.
 */
export async function generateATP(tpItems: TPItem[]): Promise<ATPItem[]> {
  const ai = getGeminiClient();
  const prompt = `
    Sebagai seorang ahli kurikulum, buatkan Alur Tujuan Pembelajaran (ATP) berdasarkan daftar Tujuan Pembelajaran (TP) berikut.
    Untuk setiap Tujuan Pembelajaran, tentukan:
    - Indikator: Indikator pencapaian yang spesifik dan terukur.
    - Materi Pokok: Materi utama yang akan diajarkan.
    - Nilai KBC (Kurikulum Berbasis Cinta): Pilih dan jelaskan satu atau lebih nilai cinta yang sesuai dari daftar ini: ${KBC_VALUES.join(
      ', ',
    )}.
    - Alokasi Waktu: Estimasi waktu dalam format "X Jam Pelajaran" atau "X Menit".
    - Dimensi Profil Lulusan: Pilih satu atau lebih dimensi yang paling sesuai dari daftar ini: ${DIMENSI_PROFIL_LULUSAN_VALUES.join(
      ', ',
    )}.
    - Asesmen: Deskripsi singkat metode asesmen yang sesuai.
    - Sumber Belajar: Contoh sumber belajar yang relevan.

    Daftar Tujuan Pembelajaran:
    ${tpItems.map((tp) => `- ${tp.tujuanPembelajaran}`).join('\n')}

    Output harus dalam format JSON array of objects, di mana setiap objek memiliki kunci 'tujuanPembelajaran', 'indikator', 'materiPokok', 'nilaiKBC' (array of strings), 'alokasiWaktu', 'dimensiProfilLulusan' (array of strings), 'asesmen', dan 'sumberBelajar'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tujuanPembelajaran: { type: Type.STRING },
              indikator: { type: Type.STRING },
              materiPokok: { type: Type.STRING },
              nilaiKBC: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  enum: Object.values(NilaiKBC),
                },
              },
              alokasiWaktu: { type: Type.STRING },
              dimensiProfilLulusan: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  enum: Object.values(DimensiProfilLulusan),
                },
              },
              asesmen: { type: Type.STRING },
              sumberBelajar: { type: Type.STRING },
            },
            required: [
              'tujuanPembelajaran',
              'indikator',
              'materiPokok',
              'nilaiKBC',
              'alokasiWaktu',
              'dimensiProfilLulusan',
              'asesmen',
              'sumberBelajar',
            ],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedATPs: Omit<ATPItem, 'no'>[] = JSON.parse(jsonStr);

    return parsedATPs.map((item, index) => ({
      no: index + 1,
      ...item,
    }));
  } catch (error) {
    console.error('Error generating ATP:', error);
    throw new Error('Failed to generate Alur Tujuan Pembelajaran. Please try again.');
  }
}

/**
 * Generates a comprehensive PPMData object for a single selected TP.
 */
export async function generatePPM(
  madrasahInfo: MadrasahInfo,
  selectedTP: TPItem,
  relevantATPs: ATPItem[],
): Promise<PPMData> {
  const ai = getGeminiClient();

  const primaryATP = relevantATPs[0]; // Assuming one ATP per selected TP for simplicity
  const selectedCP = selectedTP.capaianPembelajaran;
  const selectedTPText = selectedTP.tujuanPembelajaran;
  const selectedMateriPokok = selectedTP.materiPokok;
  const kbcValuesForTP = primaryATP ? primaryATP.nilaiKBC : [];
  const dimensiProfilLulusanForTP = primaryATP ? primaryATP.dimensiProfilLulusan : [];
  const alokasiWaktuForTP = primaryATP ? primaryATP.alokasiWaktu : 'Belum ditentukan';


  // Construct a concise materi pelajaran description integrating KBC values
  const materiPelajaranKBC = `Materi "${selectedMateriPokok}" ini diintegrasikan dengan nilai-nilai cinta seperti ${kbcValuesForTP.join(', ')} untuk menciptakan pembelajaran yang holistik dan bermakna.`;

  const prompt = `
    Sebagai seorang ahli pedagogi dan kurikulum, buatkan Perencanaan Pembelajaran Mendalam (PPM) yang detail dan komprehensif berdasarkan informasi berikut untuk SATU Tujuan Pembelajaran spesifik.
    Integrasikan prinsip pembelajaran mendalam (mindful, meaningful, joyful) dan nilai-nilai Kurikulum Berbasis Cinta (KBC) di seluruh dokumen.

    Informasi Dasar:
    Nama Madrasah: ${madrasahInfo.namaMadrasah}
    Nama Guru: ${madrasahInfo.namaGuru}
    Mata Pelajaran: ${madrasahInfo.mataPelajaran}
    Fase: ${madrasahInfo.fase}
    Kelas: ${madrasahInfo.kelas}
    Tahun Pelajaran: ${madrasahInfo.tahunPelajaran}
    Semester: Ganjil (Asumsi untuk contoh ini)
    Alokasi Waktu: ${alokasiWaktuForTP}

    Capaian Pembelajaran (CP) yang terkait dengan TP ini:
    - ${selectedCP}

    Tujuan Pembelajaran (TP) yang akan dibuat PPM-nya:
    - ${selectedTPText}

    Materi Pokok Utama untuk TP ini: ${selectedMateriPokok}

    Dimensi Profil Lulusan yang relevan untuk TP ini:
    ${dimensiProfilLulusanForTP.map(dim => `- ${dim}`).join('\n')}

    Nilai Kurikulum Berbasis Cinta (KBC) yang relevan untuk TP ini:
    ${kbcValuesForTP.map(kbc => `- ${kbc}`).join('\n')}

    Instruksi untuk setiap bagian PPM:

    I. IDENTITAS
    - Isi nama madrasah, guru, mata pelajaran, fase, semester (Ganjil), alokasi waktu (dari informasi yang diberikan), dan pokok materi secara otomatis.
    - Materi Pelajaran: Jelaskan secara singkat materi pelajaran ini dengan mengintegrasikan nilai-nilai KBC (Cinta Allah dan Rasulnya, Cinta Ilmu, Cinta Diri dan Sesama, Cinta Lingkungan, Cinta Bangsa dan Negara) yang relevan dengan TP yang dipilih. Gunakan informasi KBC dari TP dan ATP yang relevan.
    - Dimensi Profil Lulusan: Pilih dimensi yang paling relevan dari: ${DIMENSI_PROFIL_LULUSAN_VALUES.join(
      ', ',
    )} berdasarkan TP yang diberikan. Gunakan informasi dari Dimensi Profil Lulusan yang relevan dengan TP ini.

    II. DESAIN PEMBELAJARAN
    - Capaian Pembelajaran: Sertakan CP yang relevan dengan TP ini dan bagaimana ia terintegrasi dengan nilai cinta.
    - Lintas Disiplin Ilmu: Identifikasi dan jelaskan mata pelajaran lain yang relevan dan dapat diintegrasikan dengan TP ini.
    - Tujuan Pembelajaran: Sertakan TP yang relevan dan bagaimana ia terintegrasi dengan nilai cinta.
    - Praktik Pedagogis:
        - Model: Pilih dan jelaskan model pembelajaran yang sesuai dengan Pembelajaran Mendalam (misal: Problem Based Learning, Project Based Learning) dan TP ini.
        - Strategi: Pilih dan jelaskan strategi pembelajaran yang sesuai dengan TP ini (misal: Pembelajaran Penemuan, Pembelajaran Inkuiri, Kolaboratif).
        - Metode: Pilih dan jelaskan metode pembelajaran yang sesuai dengan TP ini (misal: Diskusi, Presentasi, Projek, Simulasi).
    - Kemitraan Pembelajaran: Jelaskan potensi kolaborasi dengan:
        - Pustakawan: Jelaskan bagaimana mereka dapat mendukung pembelajaran untuk TP ini.
        - Laboran sekolah: Jelaskan bagaimana mereka dapat mendukung pembelajaran untuk TP ini.
        - Guru lain: Jelaskan peran kolaborasi dengan guru mata pelajaran lain untuk TP ini.
        - Pihak dari luar Sekolah: Identifikasi dan jelaskan pihak eksternal (misal: komunitas lokal, praktisi) yang relevan untuk TP ini.
    - Lingkungan Pembelajaran:
        - Fisik: Jelaskan pengaturan fisik kelas/ruang belajar yang mendukung pembelajaran TP ini.
        - Virtual: Jelaskan platform atau sumber daya digital yang digunakan untuk TP ini.
        - Budaya Belajar: Jelaskan atmosfer dan norma yang mendukung pembelajaran TP ini.
    - Pemanfaatan Digital: Sebutkan dan jelaskan media digital spesifik yang akan digunakan dan relevansinya dengan materi/TP ini.
    - Deep Learning Approach: Masukkan deskripsi standar tentang pendekatan pembelajaran mendalam yang diberikan sebelumnya.

    III. PENGALAMAN BELAJAR
    - Berkesadaran (mindful): Jelaskan kegiatan untuk TP ini yang mendorong kesadaran dan refleksi.
    - Bermakna (meaningful): Jelaskan kegiatan untuk TP ini yang mengaitkan konsep dengan pengalaman hidup.
    - Menggembirakan (joyful): Jelaskan kegiatan untuk TP ini yang menciptakan suasana belajar positif.
    - Langkah Pembelajaran Mendalam:
        - Kegiatan Awal (Alokasi waktu: 10-15 menit): Deskripsikan aktivitas pembuka untuk TP ini.
        - Kegiatan Inti (Alokasi waktu: 60-75 menit): Deskripsikan aktivitas utama untuk TP ini, termasuk implementasi mindful, meaningful, joyful.
        - Kegiatan Penutup (Alokasi waktu: 10-15 menit): Deskripsikan aktivitas penutup dan refleksi untuk TP ini.

    IV. ASESMEN PEMBELAJARAN
    - Asesmen Awal Pembelajaran: Jelaskan metode asesmen awal yang sesuai untuk TP ini.
    - Asesmen Proses Pembelajaran (Formatif dan Sikap): Jelaskan metode asesmen formatif dan penilaian sikap untuk TP ini.
    - Asesmen Akhir Pembelajaran (Sumatif): Jelaskan metode asesmen sumatif untuk TP ini.

    Lampiran
    - Lembar Kerja Peserta Didik (LKPD):
        - Judul: Buat judul LKPD yang relevan dengan materi TP ini.
        - Instruksi: Berikan instruksi singkat untuk LKPD ini.
        - Tabel: Desain struktur tabel sederhana yang relevan untuk LKPD ini.
    - Instrumen/Rubrik Penilaian:
        - Rubrik Penilaian Kognitif: Jelaskan kriteria singkat untuk TP ini.
        - Rubrik Penilaian Sikap: Jelaskan kriteria singkat untuk TP ini.
        - Rubrik Penilaian Presentasi: Jelaskan kriteria singkat untuk TP ini.

    Output harus dalam format JSON yang sesuai dengan struktur PPMData interface.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identitas: {
              type: Type.OBJECT,
              properties: {
                namaMadrasah: { type: Type.STRING },
                namaGuru: { type: Type.STRING },
                mataPelajaran: { type: Type.STRING },
                fase: { type: Type.STRING },
                semester: { type: Type.STRING },
                alokasiWaktu: { type: Type.STRING }, // Added to schema
                materiPelajaran: { type: Type.STRING },
                dimensiProfilLulusan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                    enum: Object.values(DimensiProfilLulusan),
                  },
                },
                pokokMateri: { type: Type.STRING },
              },
              required: [
                'namaMadrasah',
                'namaGuru',
                'mataPelajaran',
                'fase',
                'semester',
                'alokasiWaktu', // Added to required
                'materiPelajaran',
                'dimensiProfilLulusan',
                'pokokMateri',
              ],
            },
            desainPembelajaran: {
              type: Type.OBJECT,
              properties: {
                capaianPembelajaran: { type: Type.ARRAY, items: { type: Type.STRING } },
                lintasDisiplinIlmu: { type: Type.ARRAY, items: { type: Type.STRING } },
                tujuanPembelajaran: { type: Type.ARRAY, items: { type: Type.STRING } },
                praktikPedagogis: {
                  type: Type.OBJECT,
                  properties: {
                    model: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                        enum: Object.values(ModelPembelajaran),
                      },
                    },
                    strategi: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                        enum: Object.values(StrategiPembelajaran),
                      },
                    },
                    metode: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                        enum: Object.values(MetodePembelajaran),
                      },
                    },
                  },
                  required: ['model', 'strategi', 'metode'],
                },
                kemitraanPembelajaran: {
                  type: Type.OBJECT,
                  properties: {
                    pustakawan: { type: Type.STRING, description: 'Explanation for librarian collaboration' },
                    laboranSekolah: { type: Type.STRING, description: 'Explanation for lab assistant collaboration' },
                    guruLain: { type: Type.STRING, description: 'Explanation for other teacher collaboration' },
                    pihakLuarSekolah: { type: Type.STRING, description: 'Explanation for external parties collaboration' },
                  },
                  required: [], // Optional fields based on AI's determination
                },
                lingkunganPembelajaran: {
                  type: Type.OBJECT,
                  properties: {
                    fisik: { type: Type.STRING },
                    virtual: { type: Type.STRING },
                    budayaBelajar: { type: Type.STRING },
                  },
                  required: ['fisik', 'virtual', 'budayaBelajar'],
                },
                pemanfaatanDigital: { type: Type.STRING },
                deepLearningApproach: { type: Type.STRING },
              },
              required: [
                'capaianPembelajaran',
                'lintasDisiplinIlmu',
                'tujuanPembelajaran',
                'praktikPedagogis',
                'kemitraanPembelajaran',
                'lingkunganPembelajaran',
                'pemanfaatanDigital',
                'deepLearningApproach',
              ],
            },
            pengalamanBelajar: {
              type: Type.OBJECT,
              properties: {
                mindfulMeaningfulJoyful: {
                  type: Type.OBJECT,
                  properties: {
                    berkesadaran: { type: Type.STRING },
                    bermakna: { type: Type.STRING },
                    menggembirakan: { type: Type.STRING },
                  },
                  required: ['berkesadaran', 'bermakna', 'menggembirakan'],
                },
                langkahPembelajaran: {
                  type: Type.OBJECT,
                  properties: {
                    kegiatanAwal: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        alokasiWaktuMenit: { type: Type.NUMBER },
                      },
                      required: ['description', 'alokasiWaktuMenit'],
                    },
                    kegiatanInti: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        alokasiWaktuMenit: { type: Type.NUMBER },
                      },
                      required: ['description', 'alokasiWaktuMenit'],
                    },
                    kegiatanPenutup: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        alokasiWaktuMenit: { type: Type.NUMBER },
                      },
                      required: ['description', 'alokasiWaktuMenit'],
                    },
                  },
                  required: ['kegiatanAwal', 'kegiatanInti', 'kegiatanPenutup'],
                },
              },
              required: ['mindfulMeaningfulJoyful', 'langkahPembelajaran'],
            },
            asesmenPembelajaran: {
              type: Type.OBJECT,
              properties: {
                asesmenAwal: { type: Type.STRING },
                asesmenProses: { type: Type.STRING },
                asesmenAkhir: { type: Type.STRING },
              },
              required: ['asesmenAwal', 'asesmenProses', 'asesmenAkhir'],
            },
            lampiran: {
              type: Type.OBJECT,
              properties: {
                lkpd: {
                  type: Type.OBJECT,
                  properties: {
                    judul: { type: Type.STRING },
                    instruksi: { type: Type.STRING },
                    tabel: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          header: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ['text', 'number', 'textarea', 'checkbox'] },
                        },
                        required: ['header', 'type'],
                      },
                    },
                  },
                  required: ['judul', 'instruksi', 'tabel'],
                },
                instrumenPenilaian: {
                  type: Type.OBJECT,
                  properties: {
                    kognitif: { type: Type.STRING },
                    sikap: { type: Type.STRING },
                    presentasi: { type: Type.STRING },
                  },
                  required: ['kognitif', 'sikap', 'presentasi'],
                },
              },
              required: ['lkpd', 'instrumenPenilaian'],
            },
          },
          required: [
            'identitas',
            'desainPembelajaran',
            'pengalamanBelajar',
            'asesmenPembelajaran',
            'lampiran',
          ],
        },
      },
    });

    const jsonStr = response.text.trim();
    // Replace markdown code block delimiters if present (Gemini might sometimes add them)
    const cleanJsonStr = jsonStr.startsWith('```json') && jsonStr.endsWith('```')
      ? jsonStr.substring(7, jsonStr.length - 3).trim()
      : jsonStr;
    
    // Fill in the static deep learning approach explanation
    const ppmData: PPMData = JSON.parse(cleanJsonStr);
    ppmData.desainPembelajaran.deepLearningApproach = DEEP_LEARNING_APPROACH_EXPLANATION;
    // Explicitly set alokasiWaktu from ATP to ensure accuracy
    ppmData.identitas.alokasiWaktu = alokasiWaktuForTP; 
    return ppmData;

  } catch (error) {
    console.error('Error generating PPM:', error);
    throw new Error('Failed to generate Perencanaan Pembelajaran Mendalam. Please try again.');
  }
}