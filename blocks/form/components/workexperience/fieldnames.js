export const FIELD_NAMES = {
  FIELDS_CONTAINER: 'fields-container',
  START_OF_WORK_MONTH: 'startofwork-month',
  START_OF_WORK_YEAR: 'startofwork-year',
  END_OF_WORK_MONTH: 'endofwork-month',
  END_OF_WORK_YEAR: 'endofwork-year',
  STILL_WORKING: 'still-working',
  TYPE_OF_WORK_EXPERIENCE: 'type-of-work-experience',
  JOB_TITLE: 'job-title',
  EMPLOYER_NAME: 'employer',
  DESCRIPTION: 'description'
};

export const STILL_WORKING_STATUS = {
  YES: '1',
  NO: '0'
};

export function sorter(a, b) {
  const aData = JSON.parse(a.dataset.savedData);
  const bData = JSON.parse(b.dataset.savedData);

  const yearA = parseInt(aData[FIELD_NAMES.END_OF_WORK_YEAR]?.value, 10) || 0;
  const monthA = parseInt(aData[FIELD_NAMES.END_OF_WORK_MONTH]?.value, 10) || 0;

  const yearB = parseInt(bData[FIELD_NAMES.END_OF_WORK_YEAR]?.value, 10) || 0;
  const monthB = parseInt(bData[FIELD_NAMES.END_OF_WORK_MONTH]?.value, 10) || 0;

  const aStillWorking = aData[FIELD_NAMES.STILL_WORKING]?.value;
  const bStillWorking = bData[FIELD_NAMES.STILL_WORKING]?.value;

  // Compare still working
  if (bStillWorking == STILL_WORKING_STATUS.YES && (bStillWorking != aStillWorking)) {
    return 1;
  }

  // Compare year first, then month
  if (yearA != yearB) {
    return yearB - yearA; // recent year first
  }

  if (monthA != monthB) {
    return monthB - monthA; // recent month first
  }

  // Alphabetically by job title
  const jobtitleA = aData[FIELD_NAMES.JOB_TITLE]?.value || '';
  const jobtitleB = bData[FIELD_NAMES.JOB_TITLE]?.value || '';

  return jobtitleA.localeCompare(jobtitleB);;
}
