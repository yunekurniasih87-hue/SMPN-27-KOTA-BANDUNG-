import React, { useState, useEffect } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ClassGradeStat } from '../../types';
import { Save, Users, BarChart3, RotateCcw } from 'lucide-react';

export const AdminStatistics: React.FC = () => {
  const { studentStats, saveStudentStats, isDataLoaded } = useSchoolData();

  const [formData, setFormData] = useState<ClassGradeStat[]>(() =>
    JSON.parse(JSON.stringify(studentStats))
  );

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(studentStats)));
  }, [studentStats, isDataLoaded]);

  const handleStatChange = (
    index: number,
    field: 'classesCount' | 'male' | 'female',
    value: number
  ) => {
    setFormData((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item[field] = Math.max(0, value);
      item.total = item.male + item.female;
      updated[index] = item;
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStudentStats(formData);
  };

  const totalClasses = formData.reduce((acc, curr) => acc + curr.classesCount, 0);
  const totalMale = formData.reduce((acc, curr) => acc + curr.male, 0);
  const totalFemale = formData.reduce((acc, curr) => acc + curr.female, 0);
  const grandTotal = totalMale + totalFemale;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Kelola Data Statistik Siswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbarui jumlah rombongan belajar (rombel) dan sebaran siswa per jenjang kelas.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Statistik</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Input Data Per Kelas */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Form Input Rombel & Jumlah Siswa</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-6">
            {formData.map((stat, idx) => (
              <div
                key={stat.grade}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      {stat.grade}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Jenjang Kelas {stat.grade}
                    </h4>
                  </div>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                    Total: {stat.total} Siswa
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Jumlah Rombel (Kelas)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={stat.classesCount}
                      onChange={(e) =>
                        handleStatChange(idx, 'classesCount', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Siswa Laki-laki (L)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stat.male}
                      onChange={(e) =>
                        handleStatChange(idx, 'male', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Siswa Perempuan (P)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stat.female}
                      onChange={(e) =>
                        handleStatChange(idx, 'female', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-pink-600 dark:text-pink-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Ringkasan & Grafik */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Pratinjau Ringkasan Statistik</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Seluruh Peserta Didik:
                </span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {grandTotal} Siswa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[11px]">Total Laki-laki:</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                    {totalMale} Siswa
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[11px]">Total Perempuan:</span>
                  <span className="text-base font-bold text-pink-600 dark:text-pink-400 block mt-0.5">
                    {totalFemale} Siswa
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 block text-[11px]">Total Rombongan Belajar:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {totalClasses} Rombel
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
