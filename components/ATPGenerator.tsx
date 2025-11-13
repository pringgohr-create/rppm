// components/ATPGenerator.tsx
import React, { useState, useEffect } from 'react';
import { TPItem, ATPItem, MadrasahInfo } from '../types';
import { generateATP } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { exportHtmlToWord } from '../utils/exportUtils';

interface ATPGeneratorProps {
  madrasahInfo: MadrasahInfo | null;
  tpItems: TPItem[] | null;
  onATPGenerated: (atps: ATPItem[]) => void;
}

const ATPGenerator: React.FC<ATPGeneratorProps> = ({ madrasahInfo, tpItems, onATPGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedATPs, setGeneratedATPs] = useState<ATPItem[]>([]);

  useEffect(() => {
    if (tpItems && tpItems.length > 0) {
      const fetchATPs = async () => {
        setLoading(true);
        setError(null);
        try {
          const atps = await generateATP(tpItems);
          setGeneratedATPs(atps);
          onATPGenerated(atps); // Notify parent component
        } catch (err: any) {
          console.error('Error generating ATPs:', err);
          setError(err.message || 'Gagal menghasilkan Alur Tujuan Pembelajaran.');
        } finally {
          setLoading(false);
        }
      };
      fetchATPs();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } else {
      setGeneratedATPs([]);
      onATPGenerated([]);
    }
  }, [tpItems]);

  const handleExportToWord = () => {
    if (!generatedATPs.length || !madrasahInfo) return;

    let htmlContent = `
      <h1 class="text-primary">Alur Tujuan Pembelajaran (ATP)</h1>
      <p class="text-center italic mb-4">Dibuat oleh HARMAJI</p>
      <p class="text-center text-gray-600 mb-8">Berikut adalah Alur Tujuan Pembelajaran yang dihasilkan berdasarkan Tujuan Pembelajaran yang telah dibuat.</p>
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
            <th>Tujuan Pembelajaran</th>
            <th>Indikator</th>
            <th>Materi Pokok</th>
            <th>Nilai KBC</th>
            <th>Alokasi Waktu</th>
            <th>Dimensi Profil Lulusan</th>
            <th>Asesmen</th>
            <th>Sumber Belajar</th>
          </tr>
        </thead>
        <tbody>
          ${generatedATPs
            .map(
              (item) => `
                <tr>
                  <td>${item.no}</td>
                  <td>${item.tujuanPembelajaran}</td>
                  <td>${item.indikator}</td>
                  <td>${item.materiPokok}</td>
                  <td>
                    <ul>
                      ${item.nilaiKBC.map((val) => `<li>${val}</li>`).join('')}
                    </ul>
                  </td>
                  <td>${item.alokasiWaktu}</td>
                  <td>
                    <ul>
                      ${item.dimensiProfilLulusan.map((dim) => `<li>${dim}</li>`).join('')}
                    </ul>
                  </td>
                  <td>${item.asesmen}</td>
                  <td>${item.sumberBelajar}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    `;

    const filename = `Alur_Tujuan_Pembelajaran_${madrasahInfo.mataPelajaran.replace(/\s/g, '_')}.doc`;
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

  if (!generatedATPs.length) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8 text-center text-gray-600">
        <p>Hasilkan Tujuan Pembelajaran terlebih dahulu untuk membuat Alur Tujuan Pembelajaran.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-7xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Alur Tujuan Pembelajaran (ATP)
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Berikut adalah Alur Tujuan Pembelajaran yang dihasilkan berdasarkan Tujuan Pembelajaran yang telah dibuat.
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
          disabled={!generatedATPs.length || loading}
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
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
              >
                Tujuan Pembelajaran
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
              >
                Indikator
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Materi Pokok
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Nilai KBC
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
              >
                Alokasi Waktu
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Dimensi Profil Lulusan
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Asesmen
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Sumber Belajar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {generatedATPs.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                  {item.no}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.tujuanPembelajaran}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.indikator}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.materiPokok}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.nilaiKBC.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
                    >
                      {val}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.alokasiWaktu}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.dimensiProfilLulusan.map((dim) => (
                    <span
                      key={dim}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
                    >
                      {dim}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.asesmen}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 align-top">
                  {item.sumberBelajar}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ATPGenerator;