// components/InputForm.tsx
import React, { useState } from 'react';
import { MadrasahInfo, CapaianPembelajaran } from '../types';

interface InputFormProps {
  onSubmit: (madrasahInfo: MadrasahInfo, cps: CapaianPembelajaran[]) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [madrasahInfo, setMadrasahInfo] = useState<MadrasahInfo>({
    namaMadrasah: '',
    namaGuru: '',
    mataPelajaran: '',
    fase: '',
    kelas: '',
    tahunPelajaran: '',
  });
  const [capaianPembelajaran, setCapaianPembelajaran] = useState<CapaianPembelajaran[]>([
    { id: 'cp-1', text: '' },
  ]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMadrasahInfo({ ...madrasahInfo, [e.target.name]: e.target.value });
  };

  const handleCapaianChange = (id: string, value: string) => {
    setCapaianPembelajaran((prevCps) =>
      prevCps.map((cp) => (cp.id === id ? { ...cp, text: value } : cp)),
    );
  };

  const addCapaian = () => {
    if (capaianPembelajaran.length < 6) {
      setCapaianPembelajaran((prevCps) => [
        ...prevCps,
        { id: `cp-${prevCps.length + 1}`, text: '' },
      ]);
    }
  };

  const removeCapaian = (id: string) => {
    setCapaianPembelajaran((prevCps) => prevCps.filter((cp) => cp.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCps = capaianPembelajaran.filter((cp) => cp.text.trim() !== '');
    if (validCps.length === 0) {
      alert('Mohon masukkan setidaknya satu Capaian Pembelajaran.');
      return;
    }
    onSubmit(madrasahInfo, validCps);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Form Informasi Pembelajaran</h2>
      <p className="text-center text-gray-600 mb-8">
        Isi detail madrasah dan capaian pembelajaran untuk memulai proses generasi.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="namaMadrasah" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Madrasah
            </label>
            <input
              type="text"
              id="namaMadrasah"
              name="namaMadrasah"
              value={madrasahInfo.namaMadrasah}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="namaGuru" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Guru
            </label>
            <input
              type="text"
              id="namaGuru"
              name="namaGuru"
              value={madrasahInfo.namaGuru}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="mataPelajaran" className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran
            </label>
            <input
              type="text"
              id="mataPelajaran"
              name="mataPelajaran"
              value={madrasahInfo.mataPelajaran}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fase" className="block text-sm font-medium text-gray-700 mb-1">
              Fase
            </label>
            <select
              id="fase"
              name="fase"
              value={madrasahInfo.fase}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              required
              disabled={isLoading}
            >
              <option value="">Pilih Fase</option>
              <option value="A">A (Kelas 1-2 SD/MI)</option>
              <option value="B">B (Kelas 3-4 SD/MI)</option>
              <option value="C">C (Kelas 5-6 SD/MI)</option>
              <option value="D">D (Kelas 7-9 SMP/MTs)</option>
              <option value="E">E (Kelas 10 SMA/MA)</option>
              <option value="F">F (Kelas 11-12 SMA/MA)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="kelas" className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <input
              type="text"
              id="kelas"
              name="kelas"
              value={madrasahInfo.kelas}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tahunPelajaran" className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Pelajaran
            </label>
            <input
              type="text"
              id="tahunPelajaran"
              name="tahunPelajaran"
              value={madrasahInfo.tahunPelajaran}
              onChange={handleInfoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
              placeholder="Contoh: 2024/2025"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-semibold text-gray-800">Capaian Pembelajaran (Maks. 6)</h3>
          {capaianPembelajaran.map((cp, index) => (
            <div key={cp.id} className="flex items-center space-x-3">
              <label htmlFor={`cp-${index}`} className="block text-sm font-medium text-gray-700 sr-only">
                Capaian Pembelajaran {index + 1}
              </label>
              <input
                type="text"
                id={`cp-${index}`}
                value={cp.text}
                onChange={(e) => handleCapaianChange(cp.id, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-secondary focus:border-secondary"
                placeholder={`Masukkan Capaian Pembelajaran ${index + 1}`}
                required
                disabled={isLoading}
              />
              {capaianPembelajaran.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCapaian(cp.id)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {capaianPembelajaran.length < 6 && (
            <button
              type="button"
              onClick={addCapaian}
              className="flex items-center px-4 py-2 bg-secondary text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Tambah Capaian Pembelajaran
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 mt-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Membuat TP...
            </>
          ) : (
            'Hasilkan Tujuan Pembelajaran'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;