// App.tsx
import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import TPGenerator from './components/TPGenerator';
import ATPGenerator from './components/ATPGenerator';
import PPMGenerator from './components/PPMGenerator';
import Tabs from './components/Tabs';
import { MadrasahInfo, CapaianPembelajaran, TPItem, ATPItem } from './types';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [madrasahInfo, setMadrasahInfo] = useState<MadrasahInfo | null>(null);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState<CapaianPembelajaran[] | null>(null);
  const [generatedTPs, setGeneratedTPs] = useState<TPItem[] | null>(null);
  const [generatedATPs, setGeneratedATPs] = useState<ATPItem[] | null>(null);
  const [currentTab, setCurrentTab] = useState('Informasi Awal');
  const [formLoading, setFormLoading] = useState(false); // Only for initial form submission
  const [globalError, setGlobalError] = useState<string | null>(null);


  const tabs = ['Informasi Awal', 'Tujuan Pembelajaran (TP)', 'Alur Tujuan Pembelajaran (ATP)', 'Perencanaan Pembelajaran Mendalam (PPM)'];

  const handleFormSubmit = (info: MadrasahInfo, cps: CapaianPembelajaran[]) => {
    setFormLoading(true);
    setGlobalError(null);
    setMadrasahInfo(info);
    setCapaianPembelajaran(cps);
    // Reset generated content when new info is submitted
    setGeneratedTPs(null);
    setGeneratedATPs(null);
    setCurrentTab('Tujuan Pembelajaran (TP)'); // Automatically switch to TP tab
    setFormLoading(false); // Form loading is done, subsequent generations have their own loaders
  };

  const handleTPGenerated = (tps: TPItem[]) => {
    setGeneratedTPs(tps);
  };

  const handleATPGenerated = (atps: ATPItem[]) => {
    setGeneratedATPs(atps);
  };

  useEffect(() => {
    // Check for API_KEY on initial load, but don't prevent rendering the form
    if (!process.env.API_KEY) {
      setGlobalError('Lingkungan API_KEY tidak diatur. Harap setel variabel lingkungan API_KEY untuk menggunakan fitur AI.');
    } else {
      setGlobalError(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-primary text-white py-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-4xl font-extrabold mb-2 sm:mb-0">
            Aplikasi Tujuan Pembelajaran
          </h1>
          <div className="text-xl font-medium">HARMAJI</div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        {globalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-4xl mx-auto my-8" role="alert">
            <strong className="font-bold">Peringatan:</strong>
            <span className="block sm:inline ml-2">{globalError}</span>
          </div>
        )}

        <div className="sticky top-[70px] bg-white pt-4 pb-2 z-10 shadow-sm border-b border-gray-200">
          <Tabs
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            disabled={formLoading || !madrasahInfo || !capaianPembelajaran || globalError !== null}
          />
        </div>

        <div className="mt-8">
          {currentTab === 'Informasi Awal' && (
            <InputForm onSubmit={handleFormSubmit} isLoading={formLoading} />
          )}

          {currentTab === 'Tujuan Pembelajaran (TP)' && (
            <TPGenerator
              madrasahInfo={madrasahInfo}
              capaianPembelajaran={capaianPembelajaran}
              onTPGenerated={handleTPGenerated}
            />
          )}

          {currentTab === 'Alur Tujuan Pembelajaran (ATP)' && (
            <ATPGenerator
              madrasahInfo={madrasahInfo}
              tpItems={generatedTPs}
              onATPGenerated={handleATPGenerated}
            />
          )}

          {currentTab === 'Perencanaan Pembelajaran Mendalam (PPM)' && (
            <PPMGenerator
              madrasahInfo={madrasahInfo}
              tpItems={generatedTPs}
              atpItems={generatedATPs}
            />
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center py-4 mt-8">
        <p>&copy; {new Date().getFullYear()} Aplikasi Tujuan Pembelajaran. Dibuat oleh HARMAJI.</p>
      </footer>
    </div>
  );
};

export default App;