// src/utils/gradeService.js

import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

/**
 * Create grade documents for all students in a class during initialization
 */
export async function initializeGradesForClass(classID, students) {
  if (!classID || !students?.length) return;

  const promises = students.map((student) =>
    addDoc(collection(db, "grades"), {
      classID,
      studentID: student.id || student.studentID,

      participationGrades: [],
      quizGrades: [],
      testGrades: [],
      projectGrades: [],
    })
  );

  return Promise.all(promises);
}

/**
 * Create grade document when new student is added to class
 */
export async function createGradeForStudent(classID, studentID) {
  if (!classID || !studentID) return;

  return addDoc(collection(db, "grades"), {
    classID,
    studentID,

    participationGrades: [],
    quizGrades: [],
    testGrades: [],
    projectGrades: [],
  });
}