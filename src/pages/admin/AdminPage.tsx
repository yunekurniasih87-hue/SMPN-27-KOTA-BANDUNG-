import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminArticles } from './AdminArticles';
import { AdminTeachers } from './AdminTeachers';
import { AdminFacilities } from './AdminFacilities';
import { AdminExtracurriculars } from './AdminExtracurriculars';
import { AdminAchievements } from './AdminAchievements';
import { AdminGallery } from './AdminGallery';
import { AdminStatistics } from './AdminStatistics';
import { AdminAbout } from './AdminAbout';
import { AdminSettings } from './AdminSettings';
import { AdminAccountSettings } from './AdminAccountSettings';
import { AdminMessages } from './AdminMessages';
import { AdminSupabase } from './AdminSupabase';
import { AdminLms } from './AdminLms';

export const AdminPage: React.FC = () => {
  const { adminUser, activeAdminTab } = useSchoolData();

  if (!adminUser) {
    return <AdminLogin />;
  }

  // Akun guru hanya diperbolehkan mengakses halaman Kelola LMS
  if (adminUser.role === 'teacher') {
    return (
      <AdminLayout>
        <AdminLms />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {activeAdminTab === 'dashboard' && <AdminDashboard />}
      {activeAdminTab === 'kelola-lms' && <AdminLms />}
      {activeAdminTab === 'berita' && <AdminArticles />}
      {activeAdminTab === 'guru' && <AdminTeachers />}
      {activeAdminTab === 'fasilitas' && <AdminFacilities />}
      {activeAdminTab === 'ekskul' && <AdminExtracurriculars />}
      {activeAdminTab === 'prestasi' && <AdminAchievements />}
      {activeAdminTab === 'galeri' && <AdminGallery />}
      {activeAdminTab === 'statistik' && <AdminStatistics />}
      {activeAdminTab === 'tentang' && <AdminAbout />}
      {activeAdminTab === 'pengaturan' && <AdminSettings />}
      {activeAdminTab === 'pengaturan-akun' && <AdminAccountSettings />}
      {activeAdminTab === 'pesan' && <AdminMessages />}
      {activeAdminTab === 'supabase' && <AdminSupabase />}
    </AdminLayout>
  );
};
