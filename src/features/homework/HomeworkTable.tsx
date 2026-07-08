import React from 'react';
import type { Assignment, Group } from '../../stores/homeworkStore';
import { useStudentStore } from '../../stores/studentStore';
import { BookOpen, Edit, Trash2, CheckCircle } from 'lucide-react';

interface HomeworkTableProps {
  assignments: Assignment[];
  groups: Group[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (assignmentId: string, studentId: string) => void;
}

export const HomeworkTable: React.FC<HomeworkTableProps> = ({ assignments, groups, onEdit, onDelete, onToggleComplete }) => {
  const students = useStudentStore(state => state.students);

  const getGroupName = (groupId: string) => {
    const g = groups.find((gr) => gr.id === groupId);
    return g ? g.name : 'N/A';
  };

  const getCompletedCount = (assignment: Assignment) => assignment.completedBy.length;

  const getTotalStudents = (groupId: string) => students.filter((s) => s.groupIds.includes(groupId)).length;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <BookOpen className="inline-block w-4 h-4 mr-1" /> Vazifa
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruh</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tugash muddat</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bajarilgan</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {assignments.map((a) => (
            <tr key={a.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{a.title}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{getGroupName(a.groupId)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(a.dueDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {getCompletedCount(a)} / {getTotalStudents(a.groupId)}
                <CheckCircle className="inline-block w-4 h-4 ml-2 text-emerald-500" />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(a)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 mr-2">
                  <Edit className="inline-block w-4 h-4" />
                </button>
                <button onClick={() => onDelete(a.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                  <Trash2 className="inline-block w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
