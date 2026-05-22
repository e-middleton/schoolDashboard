

/*
------------
Contains functions for calculating student average and class average grades
------------
*/


import { gradeCategoryToWeight, fetchGradeDocument } from "./grades.js"
import { fetchClassDocument } from "./classes.js"

// Helper function: extract grade values (removes assignment name, id, ...)
const extractGrades = (gradeRecordList) => (gradeRecordList.map(gradeRecord => gradeRecord.assignmentGrade));

// Returns average grade for a specified student and class
const calculateStudentAverage = async (classID, studentID) => {

  const gradeDoc = await fetchGradeDocument(classID, studentID);

  let weightedAverage = 0;
  let weightApplied = 0;
  const categories = Object.keys(gradeCategoryToWeight);

  // calculate weighted average for each category
  for (const category of categories) {
    const allGrades = extractGrades(gradeDoc[category]).map(parseFloat);
    const sum = allGrades.reduce((total, aGrade) => total + aGrade, 0);

    // console.log(category);
    // console.log(sum);
    if (allGrades.length === 0) continue; // prevent zero division
    const average = (sum / allGrades.length);

    weightedAverage += (average * gradeCategoryToWeight[category]);
    // console.log("weighted average");
    // console.log(weightedAverage);
    weightApplied += gradeCategoryToWeight[category]; 
  }

  // console.log((weightedAverage/totalWeightApplied).toFixed(1));
  if (weightApplied === 0) return null; // prevent zero division
  return (parseFloat(weightedAverage/weightApplied)).toFixed(1); // adjust for empty categories
}

// calculate class average:
// get all students from class

// if student list empty - prevent zero division

// sum student averages
// divide by number of students
// (grades.reduce((sum, studentID) => {return sum + calculateStudentAverage(classID, studentID)}, 0) / grades.length).toFixed(1);

export { calculateStudentAverage };