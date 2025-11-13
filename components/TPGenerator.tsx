// components/TPGenerator.tsx
import React, { useState, useEffect } from 'react';
import { MadrasahInfo, CapaianPembelajaran, TPItem } from '../types';
import { generateTP } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { exportHtmlToWord } from '../utils/exportUtils';

interface TPGeneratorProps {
  madrasahInfo: MadrasahInfo | null;
  capaianPembelajaran: CapaianPembelajaran[] | null;
  onTPGenerated: (tps: TPItem[]) => void;
}

const TPGenerator: React.FC<TPGeneratorProps> = ({ madrasahInfo, capaianPembelajaran, onTPGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTPs, setGeneratedTPs] = useState<TPItem[]>([]);

  useEffect(() => {
    if (madrasahInfo && capaianPembelajaran && capaianPembelajaran.length > 0) {
      const fetchTPs = async () => {
        setLoading(true);
        setError(null);
        try {
          const allGeneratedTPs = await generateTP(madrasahInfo, capaianPembelajaran);
          const flattenedTPs = allGeneratedTPs.flat();
          setGeneratedTPs(flattenedTPs);
          onTPGenerated(flattenedTPs); // Notify parent component
        } catch (err: any) {
          console.error('Error generating TPs:', err);
          setError(err.message || 'Gagal menghasilkan Tujuan Pembelajaran.');
        } finally {
          setLoading(false);
        }
      };
      fetchTPs();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } else {
      setGeneratedTPs([]);
      onTPGenerated([]);
    }
  }, [madrasahInfo, capaianPembelajaran]);

  const handleExportToWord = () => {
    if (!generatedTPs.length || !madrasahInfo) return;

    let htmlContent = `
      <h1 class="text-primary">Tujuan Pembelajaran (TP) Mendalam</h1>
      <p class="text-center italic mb-4">Dibuat oleh HARMAJI</p>
      <p class="text-center text-gray-600 mb-8">Berikut adalah Tujuan Pembelajaran yang dihasilkan, terintegrasi dengan kurikulum deep learning dan nilai-nilai cinta, berdasarkan input Anda.</p>
    `;

    htmlContent += `
      <div style="margin-bottom: 1em; padding: 1em; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.25rem;">
        <h3 style="font-weight: bold; color: #1e40af; margin-bottom: 0.5em;">Informasi Pembelajaran:</h3>
        <p><span style="font-weight: bold;">Madrasah:</span> ${madrasahInfo.namaMadrasah}</p>
        <p><span style="font-weight: bold;">Guru:</span> ${madrasahInfo.namaGuru}</p>
        <p><span style="font-weight: bold;">Mata Pelajaran:</span> ${madrasahInfo.mataPelajaran}</p>
        <p><span style="font-weight: bold;">Fase/Kelas:</span> ${madrasahInfo.fase} / ${madrasahInfo.kelas}</p>
        <p><span style="font-weight: bold;">Tahun Pelajaran:</span> ${madrasahInfo.tahunPelajaran}</p>
      </div>
    `;

    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Capaian Pembelajaran</th>
            <th>Konten Pembelajaran</th>
            <th>Kompetensi</th>
            <th>Materi Pokok</th>
            <th>Tujuan Pembelajaran</th>
          </tr>
        </thead>
        <tbody>
          ${generatedTPs
            .map(
              (item) => `
                <tr>
                  <td>${item.no}</td>
                  <td>${item.capaianPembelajaran}</td>
                  <td>${item.kontenPembelajaran}</td>
                  <td>${item.kompetensi}</td>
                  <td>${item.materiPokok}</td>
                  <td>${item.tujuanPembelajaran}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    `;

    htmlContent += `
      <p class="text-center italic mt-8 text-gray-500 text-sm">
        *Uraian ini dapat digunakan untuk perencanaan per semester (ganjil/genap) sesuai kebutuhan.
      </p>
    `;

    const filename = `Tujuan_Pembelajaran_${madrasahInfo.mataPelajaran.replace(/\s/g, '_')}.doc`;
    exportHtmlToWord(htmlContent, filename);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-4xl mx-auto my-8" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
        <p className="mt-2 text-sm">Pastikan Anda telah mengatur `API_KEY` di lingkungan Anda.</p>
      </div>
    );
  }

  if (!generatedTPs.length) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8 text-center text-gray-600">
        <p>Silakan isi formulir informasi pembelajaran untuk menghasilkan Tujuan Pembelajaran.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Tujuan Pembelajaran (TP) Mendalam
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Berikut adalah Tujuan Pembelajaran yang dihasilkan, terintegrasi dengan kurikulum deep learning dan nilai-nilai cinta, berdasarkan input Anda.
      </p>

      {madrasahInfo && (
        <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Informasi Pembelajaran:</h3>
          <p>
            <span className="font-medium">Madrasah:</span> {madrasahInfo.namaMadrasah}
          </p>
          <p>
            <span className="font-medium">Guru:</span> {madrasahInfo.namaGuru}
          </p>
          <p>
            <span className="font-medium">Mata Pelajaran:</span> {madrasahInfo.mataPelajaran}
          </p>
          <p>
            <span className="font-medium">Fase/Kelas:</span> {madrasahInfo.fase} / {madrasahInfo.kelas}
          </p>
          <p>
            <span className="font-medium">Tahun Pelajaran:</span> {madrasahInfo.tahunPelajaran}
          </p>
        </div>
      )}

      <div className="mb-6 text-right">
        <button
          onClick={handleExportToWord}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          disabled={!generatedTPs.length || loading}
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
              >
                No
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Capaian Pembelajaran
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Konten Pembelajaran
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Kompetensi
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Materi Pokok
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                Tujuan Pembelajaran
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {generatedTPs.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                  {item.no}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.capaianPembelajaran}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.kontenPembelajaran}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.kompetensi}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.materiPokok}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.tujuanPembelajaran}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center text-gray-500 text-sm italic">
        *Uraian ini dapat digunakan untuk perencanaan per semester (ganjil/genap) sesuai kebutuhan.
      </p>
    </div>
  );
};

export default TPGenerator;