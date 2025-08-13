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
  NOT_COMPLETED: '2'
};

export function sorter(a, b) {
  const aData = JSON.parse(a.dataset.savedData);
  const bData = JSON.parse(b.dataset.savedData);

  let finishYearA = parseInt(aData[FIELD_NAMES.FINISH_YEAR]?.value, 10) || 0;
  let finishMonthA = parseInt(aData[FIELD_NAMES.FINISH_MONTH]?.value, 10) || 0;

  let finishYearB = parseInt(bData[FIELD_NAMES.FINISH_YEAR]?.value, 10) || 0;
  let finishMonthB = parseInt(bData[FIELD_NAMES.FINISH_MONTH]?.value, 10) || 0;

  let startYearA = parseInt(aData[FIELD_NAMES.START_YEAR]?.value, 10) || 0;
  let startMonthA = parseInt(aData[FIELD_NAMES.START_MONTH]?.value, 10) || 0;

  let startYearB = parseInt(bData[FIELD_NAMES.START_YEAR]?.value, 10) || 0;
  let startMonthB = parseInt(bData[FIELD_NAMES.START_MONTH]?.value, 10) || 0;

  let courseA = aData[FIELD_NAMES.COURSE]?.value;
  let courseB = bData[FIELD_NAMES.COURSE]?.value;

  // Compare completion status
  const aCompletionStatus = aData[FIELD_NAMES.COMPLETION_STATUS]?.value;
  const bCompletionStatus = bData[FIELD_NAMES.COMPLETION_STATUS]?.value;

  if (bCompletionStatus == COMPLETION_STATUS.IN_PROGRESS) {
    if (bCompletionStatus != aCompletionStatus) {
      return 1;
    }
    else {
      // both in progress, use start date
      // Compare year first, then month
      if (startYearA != startYearB) {
        return startYearB - startYearA; // recent year first
      }

      if (startMonthB != startMonthA) {
        return startMonthB - startMonthA;
      }

      // Sort alphabetically
      return courseA.localeCompare(courseB);
    }
  }
  else {
    // Not completed, compare start date
    // Compare year first, then month
    if (startYearA != startYearB) {
      return startYearB - startYearA; // recent year first
    }

    if (startMonthB != startMonthA) {
      return startMonthB - startMonthA;
    }

    // Sort alphabetically
    return courseA.localeCompare(courseB);
  }
}