import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { TeacherHomework } from './TeacherHomework';
import { StudentHomework } from './StudentHomework';

export const Homework: React.FC = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const isTeacherOrAdmin = ['Super Admin', 'Academy Director', 'Teacher'].includes(currentUser.role);

  return isTeacherOrAdmin ? <TeacherHomework /> : <StudentHomework />;
};
