const bcrypt = require('bcryptjs');
const { User, Pramubakti, Attendance, Task, Performance, Announcement, Notification, Setting } = require('../models');
const { Op } = require('sequelize');

const namaPramubakti = [
  'Ahmad Wijaya', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari', 'Eko Prasetyo',
  'Fitri Handayani', 'Gunawan Hidayat', 'Hesti Rahayu', 'Irfan Hakim', 'Jasmine Putri',
  'Kurnia Adi', 'Lina Marlina', 'Muhammad Rizki', 'Nurul Huda', 'Oscar Wijaya',
  'Putri Ramadhani', 'Qori Amelia', 'Rudi Hermawan', 'Sari Wulandari', 'Taufik Hidayat',
  'Umar Abdullah', 'Vina Puspita', 'Wahyu Setiawan', 'Yuni Susilowati', 'Zainal Abidin',
  'Andi Saputra', 'Bella Octavia', 'Chandra Dharma', 'Dian Pratama', 'Erlina Sari'
];

const unitKerja = ['Bagian Umum', 'Bidang Statistik Produksi', 'Bidang Statistik Distribusi', 'Bidang Neraca Wilayah', 'Bidang Sosial'];

const jabatan = ['Pramubakti Honorer', 'Pramubakti Kontrak', 'Staff Pendukung'];

const tugasContoh = [
  { judul: 'Meng.Input Data Survei Ekonomi', prioritas: 'Tinggi' },
  { judul: 'Membantu Pencacahan Lapangan', prioritas: 'Sedang' },
  { judul: 'Mengolah Data Responden', prioritas: 'Tinggi' },
  { judul: 'Merapikan Arsip Dokumen', prioritas: 'Rendah' },
  { judul: 'Membantu Pelaksanaan Sensus', prioritas: 'Urgen' },
  { judul: 'Mengurus Korespondensi', prioritas: 'Sedang' },
  { judul: 'Membersihkan Ruangan Kerja', prioritas: 'Rendah' },
  { judul: 'Menginput Data Kependudukan', prioritas: 'Tinggi' },
  { judul: 'Membantu Analisis Data', prioritas: 'Sedang' },
  { judul: 'Mengorganisir File Digital', prioritas: 'Rendah' },
  { judul: 'Mempersiapkan Bahan Rapat', prioritas: 'Sedang' },
  { judul: 'Verifikasi Data Statistik', prioritas: 'Tinggi' },
  { judul: 'Scanning Dokumen BPS', prioritas: 'Sedang' },
  { judul: 'Membantu Publikasi Data', prioritas: 'Tinggi' },
  { judul: 'Inventarisasi Barang', prioritas: 'Rendah' }
];

const pengumumanJudul = [
  'Jadwal Apel Pagi Bulan Ini',
  'Pengumpulan Data Survei Triwulanan',
  'Undangan Rapat Evaluasi Kinerja',
  'Pemberitahuan Cuti Bersama',
  'Sosialisasi Sistem Informasi Baru',
  'Pendaftaran Pelatihan SDM',
  'Jadwal Inspeksi Lapangan',
  'Apresiasi Kinerja Terbaik',
  'Perubahan Jam Kerja Ramadan',
  'Undangan Seminar Statistik'
];

exports.seedDatabase = async () => {
  try {
    // Check if already seeded
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database sudah memiliki data, skip seeding...');
      return;
    }

    console.log('Memulai seeding database...');

    // Create Admin
    const admin = await User.create({
      name: 'Administrator BPS',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
      is_active: true
    });

    // Create Pimpinan
    const pimpinan = await User.create({
      name: 'Kepala BPS',
      email: 'pimpinan@demo.com',
      password: 'password123',
      role: 'pimpinan',
      is_active: true
    });

    // Create Pelapor
    const pelapor = await User.create({
      name: 'Petugas Pelapor',
      email: 'pelapor@demo.com',
      password: 'password123',
      role: 'pelapor',
      is_active: true
    });

    // Create 30 Pramubakti with users
    const pramubaktis = [];
    for (let i = 0; i < 30; i++) {
      const user = await User.create({
        name: namaPramubakti[i],
        email: `pramubakti${i + 1}@demo.com`,
        password: 'password123',
        role: 'pramubakti',
        is_active: true
      });

      const pramubakti = await Pramubakti.create({
        user_id: user.id,
        nik: `3201${String(i + 1).padStart(12, '0')}`,
        nama: namaPramubakti[i],
        jenis_kelamin: i % 2 === 0 ? 'Laki-laki' : 'Perempuan',
        tempat_lahir: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang'][i % 5],
        tanggal_lahir: `199${i % 9}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        alamat: `Jl. Merdeka No. ${i + 1}, Jakarta Pusat`,
        nomor_hp: `0812${String(10000000 + i)}`,
        email: `pramubakti${i + 1}@bps.go.id`,
        jabatan: jabatan[i % 3],
        unit_kerja: unitKerja[i % 5],
        tanggal_masuk: `202${i % 3}-${String((i % 12) + 1).padStart(2, '0')}-01`,
        status: 'Aktif'
      });
      pramubaktis.push(pramubakti);
    }

    // Create Attendance records
    const today = new Date();
    for (let d = 30; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];

      for (const pramubakti of pramubaktis) {
        if (Math.random() > 0.1) {
          const jamMasuk = `${String(7 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
          const jamPulang = `${String(16 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
          
          await Attendance.create({
            pramubakti_id: pramubakti.id,
            user_id: pramubakti.user_id,
            tanggal: dateStr,
            jam_masuk: jamMasuk,
            jam_pulang: jamPulang,
            status_masuk: jamMasuk > '08:00:00' ? 'Terlambat' : 'Tepat Waktu',
            status_pulang: jamPulang < '16:00:00' ? 'Pulang Awal' : 'Pulang Tepat Waktu',
            keterangan: null
          });
        }
      }
    }

    // Create Tasks - DIFFERENT tasks for each pramubakti
    for (const pramubakti of pramubaktis) {
      const numTasks = 2 + Math.floor(Math.random() * 3); // 2-4 tasks per pramubakti
      for (let i = 0; i < numTasks; i++) {
        const taskTemplate = tugasContoh[(pramubakti.id - 1 + i) % tugasContoh.length];
        const taskDate = new Date(today);
        taskDate.setDate(taskDate.getDate() + Math.floor(Math.random() * 7) - 3);
        
        const statuses = ['Belum Dikerjakan', 'Sedang Dikerjakan', 'Selesai'];
        const status = taskDate < today ? 'Selesai' : statuses[Math.floor(Math.random() * 2)];

        await Task.create({
          pramubakti_id: pramubakti.id,
          user_id: admin.id,
          judul: `${taskTemplate.judul} - ${pramubakti.nama.split(' ')[0]}`,
          deskripsi: `Tugas harian untuk ${pramubakti.nama} di ${pramubakti.unit_kerja}. ${taskTemplate.judul}`,
          tanggal: taskDate.toISOString().split('T')[0],
          jam_mulai: '08:00:00',
          jam_selesai: '16:00:00',
          tenggat_waktu: taskDate,
          prioritas: taskTemplate.prioritas,
          status: status,
          progress: status === 'Selesai' ? 100 : status === 'Sedang Dikerjakan' ? Math.floor(Math.random() * 80) + 10 : 0,
          created_by: admin.id
        });
      }
    }

    // Create Performance evaluations
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    for (const pramubakti of pramubaktis) {
      const kedisiplinan = (70 + Math.random() * 30).toFixed(2);
      const produktivitas = (65 + Math.random() * 35).toFixed(2);
      const kualitas = (70 + Math.random() * 30).toFixed(2);
      const teamwork = (75 + Math.random() * 25).toFixed(2);
      const inisiatif = (65 + Math.random() * 35).toFixed(2);
      const rataRata = ((parseFloat(kedisiplinan) + parseFloat(produktivitas) + parseFloat(kualitas) + parseFloat(teamwork) + parseFloat(inisiatif)) / 5).toFixed(2);

      await Performance.create({
        pramubakti_id: pramubakti.id,
        user_id: admin.id,
        periode: `${new Date().toLocaleString('id-ID', { month: 'long' })} ${currentYear}`,
        bulan: currentMonth,
        tahun: currentYear,
        kedisiplinan,
        produktivitas,
        kualitas_kerja: kualitas,
        teamwork,
        inisiatif,
        rata_rata: rataRata,
        komentar: 'Kinerja baik, tetap semangat!'
      });
    }

    // Calculate rankings
    const performances = await Performance.findAll({
      where: { bulan: currentMonth, tahun: currentYear },
      order: [['rata_rata', 'DESC']]
    });
    
    for (let i = 0; i < performances.length; i++) {
      await performances[i].update({ ranking: i + 1 });
    }

    // Create Announcements
    for (let i = 0; i < 10; i++) {
      await Announcement.create({
        judul: pengumumanJudul[i],
        konten: `Pengumuman penting untuk seluruh staff BPS. ${pengumumanJudul[i]}. Mohon perhatian dan ikuti petunjuk yang diberikan. Terima kasih.`,
        kategori: ['Umum', 'Penting', 'Info'][i % 3],
        tgl_mulai: new Date(today.getTime() - i * 86400000).toISOString().split('T')[0],
        tgl_selesai: new Date(today.getTime() + (30 - i) * 86400000).toISOString().split('T')[0],
        is_active: true,
        is_pinned: i < 2,
        created_by: admin.id
      });
    }

    // Create Notifications
    const allUsers = await User.findAll({ where: { is_active: true } });
    for (const user of allUsers) {
      for (let i = 0; i < 2; i++) {
        await Notification.create({
          user_id: user.id,
          judul: ['Selamat Datang', 'Tugas Baru'][i % 2],
          pesan: i === 0 
            ? `Selamat datang di Sistem Informasi Manajemen Pramubakti BPS`
            : `Anda memiliki tugas baru yang perlu diselesaikan`,
          jenis: i === 0 ? 'system' : 'tugas_baru',
          is_read: Math.random() > 0.5
        });
      }
    }

    // Create Settings
    const settings = [
      { key: 'nama_instansi', value: 'Badan Pusat Statistik', grup: 'umum', type: 'string', description: 'Nama Instansi' },
      { key: 'alamat', value: 'Jl. Dr. Sutomo No. 6-8, Jakarta', grup: 'umum', type: 'string', description: 'Alamat Instansi' },
      { key: 'telepon', value: '(021) 3810291', grup: 'umum', type: 'string', description: 'Nomor Telepon' },
      { key: 'email', value: 'bpshq@bps.go.id', grup: 'umum', type: 'string', description: 'Email Instansi' },
      { key: 'jam_masuk', value: '08:00', grup: 'absensi', type: 'string', description: 'Jam Masuk Kantor' },
      { key: 'jam_pulang', value: '16:00', grup: 'absensi', type: 'string', description: 'Jam Pulang Kantor' }
    ];

    for (const setting of settings) {
      await Setting.create(setting);
    }

    console.log('Seeding database selesai!');
    console.log('=========================');
    console.log('Akun Demo:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Pimpinan: pimpinan@demo.com / password123');
    console.log('Pelapor: pelapor@demo.com / password123');
    console.log('Pramubakti 1-30: pramubakti1@demo.com - pramubakti30@demo.com / password123');
    console.log('=========================');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
