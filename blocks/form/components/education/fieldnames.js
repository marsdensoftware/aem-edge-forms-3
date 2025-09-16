export const FIELD_NAMES = {
  COMPLETION_STATUS: 'completion-status',
  START_MONTH: 'start-month',
  START_YEAR: 'start-year',
  FINISH_MONTH: 'finish-month',
  FINISH_YEAR: 'finish-year',
  FINISH_DATEPICKER: 'when-finish',
  EDUCATION_SELECTION: 'education-selection',
  PLACE_OF_LEARNING: 'place-of-learning',
  COURSE: 'course',
}

export const COMPLETION_STATUS = {
  COMPLETED: '0',
  IN_PROGRESS: '1',
  NOT_COMPLETED: '2',
};

export function sorter(a, b) {
  const aData = JSON.parse(a.dataset.savedData);
  const bData = JSON.parse(b.dataset.savedData);

  const startYearA = parseInt(aData[FIELD_NAMES.START_YEAR]?.value, 10) || 0;
  const startMonthA = parseInt(aData[FIELD_NAMES.START_MONTH]?.value, 10) || 0;

  const startYearB = parseInt(bData[FIELD_NAMES.START_YEAR]?.value, 10) || 0;
  const startMonthB = parseInt(bData[FIELD_NAMES.START_MONTH]?.value, 10) || 0;

  const finishYearA = parseInt(aData[FIELD_NAMES.FINISH_YEAR]?.value, 10) || 0;
  const finishMonthA = parseInt(aData[FIELD_NAMES.FINISH_MONTH]?.value, 10) || 0;

  const finishYearB = parseInt(bData[FIELD_NAMES.FINISH_YEAR]?.value, 10) || 0;
  const finishMonthB = parseInt(bData[FIELD_NAMES.FINISH_MONTH]?.value, 10) || 0;

  const courseA = aData[FIELD_NAMES.COURSE]?.value;
  const courseB = bData[FIELD_NAMES.COURSE]?.value;

  // Compare completion status
  const aCompletionStatus = aData[FIELD_NAMES.COMPLETION_STATUS]?.value;
  const bCompletionStatus = bData[FIELD_NAMES.COMPLETION_STATUS]?.value;

  function compareStartDateThenCourse() {
    if (startYearA !== startYearB) {
      return startYearB - startYearA; // recent year first
    }

    if (startMonthB !== startMonthA) {
      return startMonthB - startMonthA;
    }

    // Sort alphabetically
    return courseA.localeCompare(courseB);
  }

  if (bCompletionStatus === COMPLETION_STATUS.IN_PROGRESS) {
    if (aCompletionStatus === COMPLETION_STATUS.IN_PROGRESS) {
      // both in progress, compare start date then course
      return compareStartDateThenCourse();
    }

    // In progress, always comes first
    return 1;
  }

  if (bCompletionStatus === COMPLETION_STATUS.COMPLETED) {
    if (aCompletionStatus === COMPLETION_STATUS.COMPLETED) {
      // Both completed, compare finish year/month
      // Compare year first, then month
      if (finishYearA !== finishYearB) {
        return finishYearB - finishYearA; // recent year first
      }

      if (finishMonthB !== finishMonthA) {
        return finishMonthB - finishMonthA;
      }

      return compareStartDateThenCourse();
    }
    if (aCompletionStatus === COMPLETION_STATUS.IN_PROGRESS) {
      return -1;
    }

    // Not completed
    return 1;
  }

  if (aCompletionStatus === COMPLETION_STATUS.NOT_COMPLETED) {
    // Both not completed, compare start year/month
    return compareStartDateThenCourse();
  }

  return -1;
}
