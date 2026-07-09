import React, { useState, useMemo } from 'react';
import { FileText, Search, Trash2, Users, CheckCircle, Clock, Award, ExternalLink, Filter, Download } from 'lucide-react';
import { useCertificateStore, type Certificate } from '../../stores/certificateStore';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { useGroupStore } from '../../stores/groupStore';
import { Badge } from '../../components/Badge';

export const Certificates: React.FC = () => {
  const { certificates, addCertificate, deleteCertificate } = useCertificateStore();
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  const { groups } = useGroupStore();

  const [activeTab, setActiveTab] = useState<'groups' | 'certificates'>('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'finishing'>('finishing');

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Calculate group statuses
  const groupStatuses = useMemo(() => {
    const statuses: Record<string, { isFinishing: boolean, endDate: Date }> = {};
    const today = new Date();
    
    groups.forEach(g => {
      const course = courses.find(c => c.id === g.courseId);
      const durationMonths = course?.durationMonths || 3; // fallback 3
      const startDate = new Date(g.startDate || '2026-01-01');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      statuses[g.id] = {
        isFinishing: diffDays <= 30, // finishing within 30 days or already finished
        endDate
      };
    });
    return statuses;
  }, [groups, courses]);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || groupStatuses[g.id]?.isFinishing;
    return matchesSearch && matchesFilter;
  });

  const filteredCertificates = certificates.filter(cert => {
    const student = students.find((s) => s.id === cert.studentId);
    return student?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleBulkGenerate = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const courseId = group.courseId;
    const studentsInGroup = students.filter(s => group.studentIds.includes(s.id));

    let generatedCount = 0;
    
    studentsInGroup.forEach(student => {
      // Check if student already has certificate for this course
      const hasCert = certificates.some(c => c.studentId === student.id && c.courseId === courseId);
      if (!hasCert) {
        const newCert: Certificate = {
          id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          studentId: student.id,
          courseId: courseId,
          issueDate: new Date().toISOString(),
          certificateNumber: `BRN-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        };
        addCertificate(newCert);
        generatedCount++;
      }
    });

    if (generatedCount > 0) {
      alert(`${generatedCount} ta o'quvchiga muvaffaqiyatli sertifikat yaratildi!`);
    } else {
      alert(`Bu guruhdagi barcha o'quvchilarda allaqachon sertifikat mavjud.`);
    }
  };

  const renderGroupModal = () => {
    if (!selectedGroupId) return null;
    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) return null;

    const course = courses.find(c => c.id === group.courseId);
    const studentsInGroup = students.filter(s => group.studentIds.includes(s.id));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                {group.name} - O'quvchilari
              </h2>
              <p className="text-sm text-zinc-500">
                Kurs: {course?.name} | Jami: {studentsInGroup.length} ta o'quvchi
              </p>
            </div>
            <button
              onClick={() => setSelectedGroupId(null)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Yopish
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {studentsInGroup.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">O'quvchilar mavjud emas</div>
              ) : (
                studentsInGroup.map(student => {
                  const hasCert = certificates.some(c => c.studentId === student.id && c.courseId === group.courseId);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <img src={student.photo} alt={student.fullName} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{student.fullName}</p>
                          <p className="text-xs text-zinc-500">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2">
                        {hasCert ? (
                          <>
                            <Badge label="Sertifikat berilgan" color="emerald" icon={<CheckCircle className="w-3 h-3" />} />
                            <div className="flex items-center gap-1 mt-2 sm:mt-0">
                              <button
                                onClick={() => {
                                  const cert = certificates.find(c => c.studentId === student.id && c.courseId === group.courseId);
                                  if (cert) window.open(`/verify-certificate/${cert.id}`, '_blank');
                                }}
                                className="px-2 py-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Ko'rish"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Ko'rish
                              </button>
                              <button
                                onClick={() => {
                                  const cert = certificates.find(c => c.studentId === student.id && c.courseId === group.courseId);
                                  if (cert) window.open(`/verify-certificate/${cert.id}?download=true`, '_blank');
                                }}
                                className="px-2 py-1 flex items-center gap-1.5 text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 rounded-lg transition-colors"
                                title="Yuklab olish"
                              >
                                <Download className="w-3.5 h-3.5" /> Yuklab olish
                              </button>
                            </div>
                          </>
                        ) : (
                          <Badge label="Berilmagan" color="zinc" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
            <button
              onClick={() => setSelectedGroupId(null)}
              className="px-5 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                handleBulkGenerate(group.id);
                setSelectedGroupId(null);
              }}
              className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Award className="w-5 h-5" /> Barchasiga sertifikat berish
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-500" /> Sertifikatlar Boshqaruvi
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">O'quvchilarga avtomatik sertifikat berish tizimi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'groups' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" /> Guruhlar bo'yicha
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'certificates' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4" /> Berilgan sertifikatlar ({certificates.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? "Guruhni qidirish..." : "O'quvchini qidirish..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          
          {activeTab === 'groups' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-5 h-5 text-zinc-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              >
                <option value="finishing">⏳ Tugayotgan guruhlar</option>
                <option value="all">Barcha guruhlar</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'groups' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
                  <th className="p-4 font-bold">Guruh nomi</th>
                  <th className="p-4 font-bold">Kurs nomi</th>
                  <th className="p-4 font-bold">O'quvchilar</th>
                  <th className="p-4 font-bold">Tugash sanasi</th>
                  <th className="p-4 font-bold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(group => {
                  const course = courses.find(c => c.id === group.courseId);
                  const isFinishing = groupStatuses[group.id]?.isFinishing;
                  const endDate = groupStatuses[group.id]?.endDate;
                  
                  return (
                    <tr key={group.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-zinc-900 dark:text-white">{group.name}</p>
                          {isFinishing && (
                            <Badge label="Tugamoqda" color="amber" icon={<Clock className="w-3 h-3" />} />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">{course?.name || 'Noma\'lum'}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">
                        {group.studentIds.length} ta
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">
                        {endDate?.toLocaleDateString('uz-UZ') || 'Noma\'lum'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedGroupId(group.id)}
                          className="px-4 py-2 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors inline-flex items-center gap-2"
                        >
                          O'quvchilarni ko'rish
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredGroups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
                        <CheckCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                        <p className="font-medium">{filterType === 'finishing' ? 'Yaqin orada tugaydigan guruhlar topilmadi' : 'Guruhlar topilmadi'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
                  <th className="p-4 font-bold">Sertifikat №</th>
                  <th className="p-4 font-bold">O'quvchi</th>
                  <th className="p-4 font-bold">Kurs</th>
                  <th className="p-4 font-bold">Sana</th>
                  <th className="p-4 font-bold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map(cert => {
                  const student = students.find((s) => s.id === cert.studentId);
                  const course = courses.find((c) => c.id === cert.courseId);

                  return (
                    <tr key={cert.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">{cert.certificateNumber}</td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        {student?.photo && <img src={student.photo} className="w-8 h-8 rounded-full object-cover" alt="" />}
                        {student?.fullName || 'Noma\'lum'}
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">{course?.name || 'Noma\'lum'}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300">
                        {new Date(cert.issueDate).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`/verify-certificate/${cert.id}`, '_blank')}
                            className="p-2 text-zinc-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                            title="Ko'rish"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteCertificate(cert.id)}
                            className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCertificates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                      Sertifikatlar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderGroupModal()}
    </div>
  );
};
