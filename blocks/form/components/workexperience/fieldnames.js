export const FIELD_NAMES = {
  FIELDS_CONTAINER: 'fields-container',
  START_OF_WORK_MONTH: 'startofwork-month',
  START_OF_WORK_YEAR: 'startofwork-year',
  END_OF_WORK: 'endofwork',
  END_OF_WORK_MONTH: 'endofwork-month',
  END_OF_WORK_YEAR: 'endofwork-year',
  STILL_WORKING: 'still-working',
  TYPE_OF_WORK_EXPERIENCE: 'type-of-work-experience',
  JOB_TITLE: 'job-title',
  EMPLOYER_NAME: 'employer',
  DESCRIPTION: 'description',
};

export const STILL_WORKING_STATUS = {
  YES: '1',
  NO: '0',
};

export function sorter(a, b) {
  const aData = JSON.parse(a.dataset.savedData);
  const bData = JSON.parse(b.dataset.savedData);

  const startYearA = parseInt(aData[FIELD_NAMES.START_OF_WORK_YEAR]?.value, 10) || 0;
  const startMonthA = parseInt(aData[FIELD_NAMES.START_OF_WORK_MONTH]?.value, 10) || 0;

  const startYearB = parseInt(bData[FIELD_NAMES.START_OF_WORK_YEAR]?.value, 10) || 0;
  const startMonthB = parseInt(bData[FIELD_NAMES.START_OF_WORK_MONTH]?.value, 10) || 0;

  const endYearA = parseInt(aData[FIELD_NAMES.END_OF_WORK_YEAR]?.value, 10) || 0;
  const endMonthA = parseInt(aData[FIELD_NAMES.END_OF_WORK_MONTH]?.value, 10) || 0;

  const endYearB = parseInt(bData[FIELD_NAMES.END_OF_WORK_YEAR]?.value, 10) || 0;
  const endMonthB = parseInt(bData[FIELD_NAMES.END_OF_WORK_MONTH]?.value, 10) || 0;

  const aStillWorking = aData[FIELD_NAMES.STILL_WORKING]?.value;
  const bStillWorking = bData[FIELD_NAMES.STILL_WORKING]?.value;

  // Compare still working
  if (bStillWorking === STILL_WORKING_STATUS.YES) {
    if (bStillWorking !== aStillWorking) {
      // no longer working
      return 1;
    }

    // both still working, compare start then name
    // Compare year first, then month
    if (startYearA !== startYearB) {
      return startYearB - startYearA; // recent year first
    }

    if (startMonthA !== startMonthB) {
      return startMonthB - startMonthA; // recent month first
    }

    // Alphabetically by job title
    const jobtitleA = aData[FIELD_NAMES.JOB_TITLE]?.value || '';
    const jobtitleB = bData[FIELD_NAMES.JOB_TITLE]?.value || '';

    return jobtitleA.localeCompare(jobtitleB);
  }

  if (aStillWorking === STILL_WORKING_STATUS.YES) {
    return -1;
  }

  // both no longer working
  // Compare end year first, then month
  if (endYearA !== endYearB) {
    return endYearB - endYearA; // recent year first
  }

  if (endMonthA !== endMonthB) {
    return endMonthB - endMonthA; // recent month first
  }

  // Compare start year first, then month
  if (startYearA !== startYearB) {
    return startYearB - startYearA; // recent year first
  }

  if (startMonthA !== startMonthB) {
    return startMonthB - startMonthA; // recent month first
  }

  // Alphabetically by job title
  const jobtitleA = aData[FIELD_NAMES.JOB_TITLE]?.value || '';
  const jobtitleB = bData[FIELD_NAMES.JOB_TITLE]?.value || '';

  return jobtitleA.localeCompare(jobtitleB);

  // TODO: Nono check as this code is unreachable.
  /*
  // Compare year first, then month
  if (startYearA !== startYearB) {
    return yearB - yearA; // recent year first
  }

  if (monthA !== monthB) {
    return monthB - monthA; // recent month first
  }

  // Alphabetically by job title
  const jobtitleA = aData[FIELD_NAMES.JOB_TITLE]?.value || '';
  const jobtitleB = bData[FIELD_NAMES.JOB_TITLE]?.value || '';

  return jobtitleA.localeCompare(jobtitleB);
   */
}
