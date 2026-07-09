import React, { useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Download, ExternalLink, ShieldCheck, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useCertificateStore } from '../../stores/certificateStore';
import { useStudentStore } from '../../stores/studentStore';
import { useCourseStore } from '../../stores/courseStore';
import { CertificateTemplate } from './CertificateTemplate';

export const VerifyCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCertificateById } = useCertificateStore();
  const { students } = useStudentStore();
  const { courses } = useCourseStore();
  
  const certificateRef = useRef<HTMLDivElement>(null);

  const cert = id ? getCertificateById(id) : null;
  const student = cert ? students.find(s => s.id === cert.studentId) : null;
  const course = cert ? courses.find(c => c.id === cert.courseId) : null;

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      // Create a small delay to ensure all fonts/images are fully rendered before capturing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1000, 707]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 707);
      pdf.save(`${student?.fullName.replace(/\s+/g, '_')}_Sertifikat.pdf`);
    } catch (error) {
      console.error('PDF yaratisda xatolik yuz berdi:', error);
      alert('Sertifikatni yuklab olishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    }
  };

  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('download') === 'true' && cert && student && course) {
      setTimeout(() => {
        handleDownload();
      }, 500); // give time for fonts/images to load
    }
  }, [location.search, cert, student, course]);

  if (!cert || !student || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center p-8 max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Sertifikat topilmadi</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Bunday ID raqamli sertifikat tizimda mavjud emas yoki o'chirilgan.
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // HARDCODED PRODUCTION DOMAIN FOR QR CODE SO IT ALWAYS WORKS WHEN SCANNED
  const verifyUrl = `https://brain-itacademy.uz/verify-certificate/${cert.id}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-brand-600 rounded-b-[50px] -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Bosh sahifa
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 md:p-10 mb-8 border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-10">
            
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-zinc-400">{student.fullName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                <ShieldCheck className="w-4 h-4" />
                Haqiqiy sertifikat
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{student.fullName}</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                Brain o'quv markazining o'quvchisi
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Tugatgan kursi</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{course.name}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Berilgan sana</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{new Date(cert.issueDate).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Kurslarni ko'rish
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium shadow-lg shadow-brand-500/30"
            >
              <Download className="w-5 h-5" />
              PDF Yuklab Olish
            </button>
          </div>
        </div>

        {/* Hidden certificate for PDF generation */}
        <div className="overflow-hidden">
          <div className="w-[1000px] mx-auto transform scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top">
             <CertificateTemplate
                ref={certificateRef}
                studentName={student.fullName}
                courseName={course.name}
                issueDate={cert.issueDate}
                certificateNumber={cert.certificateNumber}
                verifyUrl={verifyUrl}
             />
          </div>
        </div>
        
      </div>
    </div>
  );
};
