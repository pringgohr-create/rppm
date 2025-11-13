// components/PPMGenerator.tsx
import React, { useState, useEffect } from 'react';
import { MadrasahInfo, TPItem, ATPItem, PPMData } from '../types';
import { generatePPM } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { DEEP_LEARNING_APPROACH_EXPLANATION } from '../constants';
import { exportHtmlToWord } from '../utils/exportUtils';

interface PPMGeneratorProps {
  madrasahInfo: MadrasahInfo | null;
  tpItems: TPItem[] | null;
  atpItems: ATPItem[] | null;
}

const PPMGenerator: React.FC<PPMGeneratorProps> = ({ madrasahInfo, tpItems, atpItems }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ppmData, setPPMData] = useState<PPMData | null>(null);
  const [selectedTpId, setSelectedTpId] = useState<string | null>(null); // Use TP's tujuanPembelajaran as ID

  // Set default selected TP when tpItems are available
  useEffect(() => {
    if (tpItems && tpItems.length > 0 && !selectedTpId) {
      setSelectedTpId(tpItems[0].tujuanPembelajaran);
    } else if (!tpItems || tpItems.length === 0) {
      setSelectedTpId(null);
      setPPMData(null);
    }
  }, [tpItems, selectedTpId]);

  // Generate PPM when selectedTpId or other dependencies change
  useEffect(() => {
    if (madrasahInfo && tpItems && tpItems.length > 0 && atpItems && atpItems.length > 0 && selectedTpId) {
      const fetchPPM = async () => {
        setLoading(true);
        setError(null);
        try {
          const selectedTP = tpItems.find(tp => tp.tujuanPembelajaran === selectedTpId);
          if (!selectedTP) {
            setError("Tujuan Pembelajaran yang dipilih tidak ditemukan.");
            setLoading(false);
            return;
          }

          const relevantATPs = atpItems.filter(atp => atp.tujuanPembelajaran === selectedTP.tujuanPembelajaran);

          if (relevantATPs.length === 0) {
            setError(`Tidak ditemukan Alur Tujuan Pembelajaran untuk TP: "${selectedTP.tujuanPembelajaran}".`);
            setLoading(false);
            return;
          }
          
          const generatedData = await generatePPM(madrasahInfo, selectedTP, relevantATPs);
          setPPMData(generatedData);
        } catch (err: any) {
          console.error('Error generating PPM:', err);
          setError(err.message || 'Gagal menghasilkan Perencanaan Pembelajaran Mendalam.');
        } finally {
          setLoading(false);
        }
      };
      fetchPPM();
    } else {
      setPPMData(null);
    }
  }, [madrasahInfo, tpItems, atpItems, selectedTpId]);

  const handleTpSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTpId(event.target.value);
  };

  const renderList = (items: string[] | undefined) => (
    items && items.length > 0 ? (
      <ul className="list-disc list-inside ml-4 text-gray-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="ml-4 text-gray-500 italic">Tidak ada data.</p>
    )
  );

  const renderListHtml = (items: string[] | undefined) => (
    items && items.length > 0 ? (
      `<ul style="list-style-type: disc; margin-left: 1.5em;">
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>`
    ) : (
      `<p style="margin-left: 1.5em; font-style: italic; color: #6b7280;">Tidak ada data.</p>`
    )
  );

  const handleExportToWord = () => {
    if (!ppmData || !madrasahInfo) return;

    let htmlContent = `
      <h1 class="text-primary">Perencanaan Pembelajaran Mendalam (PPM)</h1>
      <p class="text-center italic mb-4">Dibuat oleh HARMAJI</p>
      <p class="text-center text-gray-600 mb-8">Dokumen PPM komprehensif ini dirancang untuk memandu pengajaran yang bermakna dan efektif.</p>
    `;

    // Section I: IDENTITAS
    htmlContent += `
      <section class="mb-10">
        <h2 class="text-secondary mb-4 border-b-2 border-secondary pb-2">I. IDENTITAS</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1em;">
            <tr><td style="width: 30%; font-weight: bold;">Nama Madrasah</td><td>: ${ppmData.identitas.namaMadrasah}</td></tr>
            <tr><td style="width: 30%; font-weight: bold;">Nama Guru</td><td>: ${ppmData.identitas.namaGuru}</td></tr>
            <tr><td style="width: 30%; font-weight: bold;">Mata Pelajaran</td><td>: ${ppmData.identitas.mataPelajaran}</td></tr>
            <tr><td style="width: 30%; font-weight: bold;">Fase / Semester</td><td>: ${ppmData.identitas.fase} / ${ppmData.identitas.semester}</td></tr>
            <tr><td style="width: 30%; font-weight: bold;">Alokasi Waktu</td><td>: ${ppmData.identitas.alokasiWaktu}</td></tr>
        </table>
        <p class="font-bold">1. Materi Pelajaran:</p>
        <p class="ml-4 text-justify">${ppmData.identitas.materiPelajaran}</p>
        <p class="font-bold">2. Dimensi Profil Lulusan:</p>
        ${renderListHtml(ppmData.identitas.dimensiProfilLulusan)}
        <p class="font-bold">3. Pokok Materi:</p>
        <p class="ml-4">${ppmData.identitas.pokokMateri}</p>
      </section>
      <div class="section-break"></div>
    `;

    // Section II: DESAIN PEMBELAJARAN
    htmlContent += `
      <section class="mb-10">
        <h2 class="text-secondary mb-4 border-b-2 border-secondary pb-2">II. DESAIN PEMBELAJARAN</h2>
        <p class="text-justify mb-6 italic text-gray-600">${DEEP_LEARNING_APPROACH_EXPLANATION}</p>
        <p class="font-bold">1. Capaian Pembelajaran:</p>
        ${renderListHtml(ppmData.desainPembelajaran.capaianPembelajaran)}
        <p class="font-bold">2. Lintas Disiplin Ilmu:</p>
        ${renderListHtml(ppmData.desainPembelajaran.lintasDisiplinIlmu)}
        <p class="font-bold">3. Tujuan Pembelajaran:</p>
        ${renderListHtml(ppmData.desainPembelajaran.tujuanPembelajaran)}
        <p class="font-bold">4. Praktik Pedagogis:</p>
        <div class="ml-4">
          <p><span class="font-bold">a. Model:</span> ${renderListHtml(ppmData.desainPembelajaran.praktikPedagogis.model)}</p>
          <p><span class="font-bold">b. Strategi:</span> ${renderListHtml(ppmData.desainPembelajaran.praktikPedagogis.strategi)}</p>
          <p><span class="font-bold">c. Metode:</span> ${renderListHtml(ppmData.desainPembelajaran.praktikPedagogis.metode)}</p>
        </div>
        <p class="font-bold">5. Kemitraan Pembelajaran:</p>
        <div class="ml-4">
          ${ppmData.desainPembelajaran.kemitraanPembelajaran.pustakawan ? `<p><span class="font-bold">a. Pustakawan:</span> ${ppmData.desainPembelajaran.kemitraanPembelajaran.pustakawan}</p>` : ''}
          ${ppmData.desainPembelajaran.kemitraanPembelajaran.laboranSekolah ? `<p><span class="font-bold">b. Laboran sekolah:</span> ${ppmData.desainPembelajaran.kemitraanPembelajaran.laboranSekolah}</p>` : ''}
          ${ppmData.desainPembelajaran.kemitraanPembelajaran.guruLain ? `<p><span class="font-bold">c. Guru:</span> ${ppmData.desainPembelajaran.kemitraanPembelajaran.guruLain}</p>` : ''}
          ${ppmData.desainPembelajaran.kemitraanPembelajaran.pihakLuarSekolah ? `<p><span class="font-bold">d. Pihak dari luar Sekolah:</span> ${ppmData.desainPembelajaran.kemitraanPembelajaran.pihakLuarSekolah}</p>` : ''}
        </div>
        <p class="font-bold">6. Lingkungan Pembelajaran:</p>
        <div class="ml-4">
          <p><span class="font-bold">a. Fisik:</span> ${ppmData.desainPembelajaran.lingkunganPembelajaran.fisik}</p>
          <p><span class="font-bold">b. Virtual:</span> ${ppmData.desainPembelajaran.lingkunganPembelajaran.virtual}</p>
          <p><span class="font-bold">c. Budaya Belajar:</span> ${ppmData.desainPembelajaran.lingkunganPembelajaran.budayaBelajar}</p>
        </div>
        <p class="font-bold">7. Pemanfaatan Digital:</p>
        <p class="ml-4">${ppmData.desainPembelajaran.pemanfaatanDigital}</p>
      </section>
      <div class="section-break"></div>
    `;

    // Section III: PENGALAMAN BELAJAR
    htmlContent += `
      <section class="mb-10">
        <h2 class="text-secondary mb-4 border-b-2 border-secondary pb-2">III. PENGALAMAN BELAJAR</h2>
        <p class="font-bold">Berkesadaran (mindful):</p>
        <p class="ml-4">${ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.berkesadaran}</p>
        <p class="font-bold">Bermakna (meaningful):</p>
        <p class="ml-4">${ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.bermakna}</p>
        <p class="font-bold">Menggembirakan (joyful):</p>
        <p class="ml-4">${ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.menggembirakan}</p>

        <h3 class="font-bold text-gray-800 mb-2 mt-8">Langkah Pembelajaran Mendalam:</h3>
        <div class="ml-4">
          <p class="font-bold">1. Kegiatan Awal (${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanAwal.alokasiWaktuMenit} Menit):</p>
          <p class="ml-4">${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanAwal.description}</p>
          <p class="font-bold">2. Kegiatan Inti (${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanInti.alokasiWaktuMenit} Menit):</p>
          <p class="ml-4">${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanInti.description}</p>
          <p class="font-bold">3. Kegiatan Penutup (${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanPenutup.alokasiWaktuMenit} Menit):</p>
          <p class="ml-4">${ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanPenutup.description}</p>
        </div>
      </section>
      <div class="section-break"></div>
    `;

    // Section IV: ASESMEN PEMBELAJARAN
    htmlContent += `
      <section class="mb-10">
        <h2 class="text-secondary mb-4 border-b-2 border-secondary pb-2">IV. ASESMEN PEMBELAJARAN</h2>
        <p class="font-bold">1. Asesmen Awal Pembelajaran:</p>
        <p class="ml-4">${ppmData.asesmenPembelajaran.asesmenAwal}</p>
        <p class="font-bold">2. Asesmen Proses Pembelajaran (Formatif dan Sikap):</p>
        <p class="ml-4">${ppmData.asesmenPembelajaran.asesmenProses}</p>
        <p class="font-bold">3. Asesmen Akhir Pembelajaran (Sumatif):</p>
        <p class="ml-4">${ppmData.asesmenPembelajaran.asesmenAkhir}</p>
      </section>
      <div class="section-break"></div>
    `;

    // Lampiran
    htmlContent += `
      <section class="mb-10">
        <h2 class="text-secondary mb-4 border-b-2 border-secondary pb-2">Lampiran</h2>
        <h3 class="font-bold text-gray-800 mb-3">1. Lembar Kerja Peserta Didik (LKPD)</h3>
        <p class="ml-4 mb-2"><span class="font-bold">Judul:</span> ${ppmData.lampiran.lkpd.judul}</p>
        <p class="ml-4 mb-2"><span class="font-bold">Instruksi:</span> ${ppmData.lampiran.lkpd.instruksi}</p>
        <div class="ml-4 overflow-x-auto">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1em;">
            <thead>
              <tr>
                ${ppmData.lampiran.lkpd.tabel.map((col) => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                ${ppmData.lampiran.lkpd.tabel.map((col) => `<td>[Isi oleh siswa]</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="font-bold text-gray-800 mb-3 mt-8">2. Instrumen/Rubrik Penilaian</h3>
        <div class="ml-4">
          <p class="font-bold">A. Rubrik Penilaian Kognitif:</p>
          <p class="ml-4">${ppmData.lampiran.instrumenPenilaian.kognitif}</p>
          <p class="font-bold">B. Rubrik Penilaian Sikap:</p>
          <p class="ml-4">${ppmData.lampiran.instrumenPenilaian.sikap}</p>
          <p class="font-bold">C. Rubrik Penilaian Presentasi:</p>
          <p class="ml-4">${ppmData.lampiran.instrumenPenilaian.presentasi}</p>
        </div>
      </section>
    `;

    const filename = `PPM_${selectedTpId?.substring(0, 30).replace(/\s/g, '_') || 'Tanpa_Judul'}.doc`;
    exportHtmlToWord(htmlContent, filename);
  };


  if (!madrasahInfo || !tpItems || tpItems.length === 0 || !atpItems || atpItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8 text-center text-gray-600">
        <p>Hasilkan Tujuan Pembelajaran dan Alur Tujuan Pembelajaran terlebih dahulu untuk membuat Perencanaan Pembelajaran Mendalam.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-4xl mx-auto my-8" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
        <p className="mt-2 text-sm">Pastikan Anda telah mengisi semua informasi yang diperlukan dan API_KEY telah diatur.</p>
      </div>
    );
  }

  if (!ppmData) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8 text-center text-gray-600">
        <p>Pilih Tujuan Pembelajaran di atas untuk menghasilkan Perencanaan Pembelajaran Mendalam.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Perencanaan Pembelajaran Mendalam (PPM)
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Dokumen PPM komprehensif ini dirancang untuk memandu pengajaran yang bermakna dan efektif.
      </p>

      {/* TP Selector Dropdown */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <label htmlFor="tpSelector" className="block text-lg font-medium text-gray-800 mb-2">
            Pilih Tujuan Pembelajaran untuk PPM:
          </label>
          <select
            id="tpSelector"
            className="mt-1 block w-full md:w-auto border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-secondary focus:border-secondary transition-colors duration-200 disabled:opacity-50"
            value={selectedTpId || ''}
            onChange={handleTpSelectChange}
            disabled={loading || !tpItems || tpItems.length === 0}
          >
            {tpItems.map((tp, index) => (
              <option key={tp.tujuanPembelajaran} value={tp.tujuanPembelajaran}>
                Tujuan Pembelajaran {index + 1}
                {/* Optional: Add a snippet of the TP for better context */}
                {`: ${tp.tujuanPembelajaran.substring(0, 70)}${tp.tujuanPembelajaran.length > 70 ? '...' : ''}`}
              </option>
            ))}
          </select>
          {selectedTpId && (
            <p className="mt-2 text-sm text-gray-600 italic">
              PPM saat ini ditampilkan untuk: "{tpItems.find(tp => tp.tujuanPembelajaran === selectedTpId)?.tujuanPembelajaran}"
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleExportToWord}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={!ppmData || loading}
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M.03 8.21A.75.75 0 01.373 7.05L5.275 1.636a.75.75 0 011.082.022L10 6.636l3.643-4.978a.75.75 0 011.082-.022l4.902 5.414a.75.75 0 01-.343 1.16L15 9.75l2.274 6.786A.75.75 0 0116.7 17H3.3a.75.75 0 01-.573-1.014L5 9.75 0.373 8.21zM13.75 9.75l-3 8.25h-1.5L6.25 9.75h7.5zM7 7.76V2.5h6v5.26l-3.076 4.195a.75.75 0 01-1.088 0L7 7.76z"
                clipRule="evenodd"
              />
            </svg>
            Ekspor ke Word
          </button>
        </div>
      </div>

      {/* Section I: IDENTITAS */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2">
          I. IDENTITAS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
          <p>
            <span className="font-medium">Nama Madrasah:</span> {ppmData.identitas.namaMadrasah}
          </p>
          <p>
            <span className="font-medium">Nama Guru:</span> {ppmData.identitas.namaGuru}
          </p>
          <p>
            <span className="font-medium">Mata Pelajaran:</span> {ppmData.identitas.mataPelajaran}
          </p>
          <p>
            <span className="font-medium">Fase / Semester:</span> {ppmData.identitas.fase} /{' '}
            {ppmData.identitas.semester}
          </p>
          <p>
            <span className="font-medium">Alokasi Waktu:</span> {ppmData.identitas.alokasiWaktu}
          </p>
          <div className="md:col-span-2">
            <p className="font-medium">1. Materi Pelajaran:</p>
            <p className="ml-4 text-justify">{ppmData.identitas.materiPelajaran}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-medium">2. Dimensi Profil Lulusan:</p>
            {renderList(ppmData.identitas.dimensiProfilLulusan)}
          </div>
          <div className="md:col-span-2">
            <p className="font-medium">3. Pokok Materi:</p>
            <p className="ml-4">{ppmData.identitas.pokokMateri}</p>
          </div>
        </div>
      </section>

      {/* Section II: DESAIN PEMBELAJARAN */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2">
          II. DESAIN PEMBELAJARAN
        </h3>
        <p className="text-justify mb-6 italic text-gray-600">
          {DEEP_LEARNING_APPROACH_EXPLANATION}
        </p>

        <div className="space-y-6 text-gray-700">
          <div>
            <p className="font-medium">1. Capaian Pembelajaran:</p>
            {renderList(ppmData.desainPembelajaran.capaianPembelajaran)}
          </div>
          <div>
            <p className="font-medium">2. Lintas Disiplin Ilmu:</p>
            {renderList(ppmData.desainPembelajaran.lintasDisiplinIlmu)}
          </div>
          <div>
            <p className="font-medium">3. Tujuan Pembelajaran:</p>
            {renderList(ppmData.desainPembelajaran.tujuanPembelajaran)}
          </div>
          <div>
            <p className="font-medium">4. Praktik Pedagogis:</p>
            <div className="ml-4 space-y-2">
              <p>
                <span className="font-medium">a. Model:</span>{' '}
                {renderList(ppmData.desainPembelajaran.praktikPedagogis.model)}
              </p>
              <p>
                <span className="font-medium">b. Strategi:</span>{' '}
                {renderList(ppmData.desainPembelajaran.praktikPedagogis.strategi)}
              </p>
              <p>
                <span className="font-medium">c. Metode:</span>{' '}
                {renderList(ppmData.desainPembelajaran.praktikPedagogis.metode)}
              </p>
            </div>
          </div>
          <div>
            <p className="font-medium">5. Kemitraan Pembelajaran:</p>
            <div className="ml-4 space-y-2">
              {ppmData.desainPembelajaran.kemitraanPembelajaran.pustakawan && (
                <p>
                  <span className="font-medium">a. Pustakawan:</span>{' '}
                  {ppmData.desainPembelajaran.kemitraanPembelajaran.pustakawan}
                </p>
              )}
              {ppmData.desainPembelajaran.kemitraanPembelajaran.laboranSekolah && (
                <p>
                  <span className="font-medium">b. Laboran sekolah:</span>{' '}
                  {ppmData.desainPembelajaran.kemitraanPembelajaran.laboranSekolah}
                </p>
              )}
              {ppmData.desainPembelajaran.kemitraanPembelajaran.guruLain && (
                <p>
                  <span className="font-medium">c. Guru:</span>{' '}
                  {ppmData.desainPembelajaran.kemitraanPembelajaran.guruLain}
                </p>
              )}
              {ppmData.desainPembelajaran.kemitraanPembelajaran.pihakLuarSekolah && (
                <p>
                  <span className="font-medium">d. Pihak dari luar Sekolah:</span>{' '}
                  {ppmData.desainPembelajaran.kemitraanPembelajaran.pihakLuarSekolah}
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="font-medium">6. Lingkungan Pembelajaran:</p>
            <div className="ml-4 space-y-2">
              <p>
                <span className="font-medium">a. Fisik:</span>{' '}
                {ppmData.desainPembelajaran.lingkunganPembelajaran.fisik}
              </p>
              <p>
                <span className="font-medium">b. Virtual:</span>{' '}
                {ppmData.desainPembelajaran.lingkunganPembelajaran.virtual}
              </p>
              <p>
                <span className="font-medium">c. Budaya Belajar:</span>{' '}
                {ppmData.desainPembelajaran.lingkunganPembelajaran.budayaBelajar}
              </p>
            </div>
          </div>
          <div>
            <p className="font-medium">7. Pemanfaatan Digital:</p>
            <p className="ml-4">{ppmData.desainPembelajaran.pemanfaatanDigital}</p>
          </div>
        </div>
      </section>

      {/* Section III: PENGALAMAN BELAJAR */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2">
          III. PENGALAMAN BELAJAR
        </h3>
        <div className="space-y-6 text-gray-700">
          <div>
            <p className="font-medium">Berkesadaran (mindful):</p>
            <p className="ml-4">{ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.berkesadaran}</p>
          </div>
          <div>
            <p className="font-medium">Bermakna (meaningful):</p>
            <p className="ml-4">{ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.bermakna}</p>
          </div>
          <div>
            <p className="font-medium">Menggembirakan (joyful):</p>
            <p className="ml-4">{ppmData.pengalamanBelajar.mindfulMeaningfulJoyful.menggembirakan}</p>
          </div>

          <div className="mt-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Langkah Pembelajaran Mendalam:</h4>
            <div className="ml-4 space-y-4">
              <div>
                <p className="font-medium">
                  1. Kegiatan Awal ({ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanAwal.alokasiWaktuMenit}{' '}
                  Menit):
                </p>
                <p className="ml-4">{ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanAwal.description}</p>
              </div>
              <div>
                <p className="font-medium">
                  2. Kegiatan Inti ({ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanInti.alokasiWaktuMenit}{' '}
                  Menit):
                </p>
                <p className="ml-4">{ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanInti.description}</p>
              </div>
              <div>
                <p className="font-medium">
                  3. Kegiatan Penutup ({ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanPenutup.alokasiWaktuMenit}{' '}
                  Menit):
                </p>
                <p className="ml-4">{ppmData.pengalamanBelajar.langkahPembelajaran.kegiatanPenutup.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section IV: ASESMEN PEMBELAJARAN */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2">
          IV. ASESMEN PEMBELAJARAN
        </h3>
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-medium">1. Asesmen Awal Pembelajaran:</p>
            <p className="ml-4">{ppmData.asesmenPembelajaran.asesmenAwal}</p>
          </div>
          <div>
            <p className="font-medium">2. Asesmen Proses Pembelajaran (Formatif dan Sikap):</p>
            <p className="ml-4">{ppmData.asesmenPembelajaran.asesmenProses}</p>
          </div>
          <div>
            <p className="font-medium">3. Asesmen Akhir Pembelajaran (Sumatif):</p>
            <p className="ml-4">{ppmData.asesmenPembelajaran.asesmenAkhir}</p>
          </div>
        </div>
      </section>

      {/* Lampiran */}
      <section className="mb-10 break-before-page">
        <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2">
          Lampiran
        </h3>
        <div className="space-y-8 text-gray-700">
          {/* LKPD */}
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">1. Lembar Kerja Peserta Didik (LKPD)</h4>
            <p className="ml-4 mb-2">
              <span className="font-medium">Judul:</span> {ppmData.lampiran.lkpd.judul}
            </p>
            <p className="ml-4 mb-2">
              <span className="font-medium">Instruksi:</span> {ppmData.lampiran.lkpd.instruksi}
            </p>
            <div className="ml-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {ppmData.lampiran.lkpd.tabel.map((col, idx) => (
                      <th
                        key={idx}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Contoh baris kosong untuk diisi siswa */}
                  <tr>
                    {ppmData.lampiran.lkpd.tabel.map((col, idx) => (
                      <td key={idx} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {col.type === 'textarea' ? (
                          <textarea className="w-full border rounded-md p-1 min-h-[60px]"></textarea>
                        ) : col.type === 'checkbox' ? (
                          <input type="checkbox" className="h-4 w-4 text-primary rounded" />
                        ) : (
                          <input type={col.type} className="w-full border rounded-md p-1" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Instrumen/Rubrik Penilaian */}
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">2. Instrumen/Rubrik Penilaian</h4>
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium">A. Rubrik Penilaian Kognitif:</p>
                <p className="ml-4">{ppmData.lampiran.instrumenPenilaian.kognitif}</p>
              </div>
              <div>
                <p className="font-medium">B. Rubrik Penilaian Sikap:</p>
                <p className="ml-4">{ppmData.lampiran.instrumenPenilaian.sikap}</p>
              </div>
              <div>
                <p className="font-medium">C. Rubrik Penilaian Presentasi:</p>
                <p className="ml-4">{ppmData.lampiran.instrumenPenilaian.presentasi}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PPMGenerator;