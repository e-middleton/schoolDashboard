import { gradeCategoryToWeight, fetchGradeDocument } from "./grades.js"
import { fetchClassDocument } from "./classes.js"

// Helper function: extract grade values (removes assignment name, id, ...)
const extractGrades = (gradeRecordList) => (gradeRecordList.map(gradeRecord => gradeRecord.assignmentGrade));

// Returns average grade for a specified student and class
const calculateStudentAverage = async (classID, studentID) => {

  const gradeDoc = await fetchGradeDocument(classID, studentID);
  if (!gradeDoc) return 0;

  let weightedAverage = 0;
  let weightApplied = 0;
  const categories = Object.keys(gradeCategoryToWeight);

  // calculate weighted average for each category
  for (const category of categories) {
    const allGrades = extractGrades(gradeDoc[category]).map(Number);
    const sum = allGrades.reduce((total, aGrade) => total + aGrade, 0);

    if (allGrades.length === 0) continue; // prevent zero division
    const average = (sum / allGrades.length);

    weightedAverage += (average * gradeCategoryToWeight[category]);
    weightApplied += gradeCategoryToWeight[category]; 
  }

  // console.log((weightedAverage/totalWeightApplied).toFixed(1));
  return (weightedAverage/weightApplied).toFixed(1); // adjust for empty categories
}

// Returns average grade of all students in a class
const calculateClassAverage = async (classID) => {
  const classDocument = await fetchClassDocument(classID);
  const studentList = classDocument.studentIDs;

  if (studentList.length === 0) return; // prevent zero division

  // Returns average grade of all students in a list
  const sumStudentAverages = async (studentList) => {
    return await studentList.reduce(async (sum, studentID) => {
      const studentAverage = await calculateStudentAverage(classID, studentID);
      console.log(studentAverage);
      return sum + studentAverage
    }, 0);

    console.log(studentList.length);
    console.log(gradeSum/studentList.length);
    return gradeSum/studentList.length;
  }

  // sumStudentAverages(studentList);
  return Number(sumStudentAverages(studentList)).toFixed(1);
}

// calculate class average:
// get all students from class

// if student list empty - prevent zero division

// sum student averages
// divide by number of students
// (grades.reduce((sum, studentID) => {return sum + calculateStudentAverage(classID, studentID)}, 0) / grades.length).toFixed(1);

export { calculateStudentAverage, calculateClassAverage };