import { DEFAULT_THANK_YOU_MESSAGE, getRouting, getSubmitBaseUrl } from './constant.js';
import { reportGenericError } from './components/validationsummary/validationsummary.js';
import { gotoNextStep } from './components/wizard/wizard.js';
import { i18n } from '../../i18n/index.js';

export function submitSuccess(e, form) {
  // ###SEP-NJ START check where to go after submit
  if (form.dataset.submitSource === 'wizard:btnNext') {
    const wizard = form.querySelector('.wizard');
    gotoNextStep(wizard);
    form.dataset.submitSource = undefined;
    return;
  }
  // ###SEP-NJ END
  const { payload } = e;
  const redirectUrl = form.dataset.redirectUrl || payload?.body?.redirectUrl;
  const thankYouMsg = form.dataset.thankYouMsg || payload?.body?.thankYouMessage;
  if (redirectUrl) {
    window.location.assign(encodeURI(redirectUrl));
  } else {
    let thankYouMessage = form.parentNode.querySelector('.form-message.success-message');
    if (!thankYouMessage) {
      thankYouMessage = document.createElement('div');
      thankYouMessage.className = 'form-message success-message';
    }
    thankYouMessage.innerHTML = thankYouMsg || DEFAULT_THANK_YOU_MESSAGE;
    form.parentNode.insertBefore(thankYouMessage, form);
    if (thankYouMessage.scrollIntoView) {
      thankYouMessage.scrollIntoView({ behavior: 'smooth' });
    }
    form.reset();
  }
  form.setAttribute('data-submitting', 'false');
  form.querySelector('button[type="submit"]').disabled = false;
}

export function submitFailure(e, form) {
  // ###SEP-NJ Start custom generic error
  const title = form.dataset.genericErrorTitle || i18n('Something went wrong.');
  const defaultErrorContent = 'Please try again. If it doesn’t work, come back later or call us on 0800 XXX.';
  const content = form.dataset.genericErrorDescription || i18n(defaultErrorContent);

  // Reset label of next button
  const wizard = form.querySelector('.wizard');
  if (wizard) {
    wizard.querySelector('button[name="next"]').textContent = i18n('Next');
  }

  reportGenericError(title, content);
  // ###SEP-NJ End
  /*
  let errorMessage = form.querySelector('.form-message.error-message');
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.className = 'form-message error-message';
  }
  errorMessage.innerHTML = 'Some error occured while submitting the form'; // TODO: translation
  form.prepend(errorMessage);
  errorMessage.scrollIntoView({ behavior: 'smooth' });
  */
  form.setAttribute('data-submitting', 'false');
  form.querySelector('button[type="submit"]').disabled = false;
}

function generateUnique() {
  return new Date().valueOf() + Math.random();
}

function getFieldValue(fe, payload) {
  if (fe.type === 'radio') {
    return fe.form.elements[fe.name].value;
  } if (fe.type === 'checkbox') {
    if (payload[fe.name]) {
      if (fe.checked) {
        return `${payload[fe.name]},${fe.value}`;
      }
      return payload[fe.name];
    } if (fe.checked) {
      return fe.value;
    }
  } else if (fe.type !== 'file') {
    return fe.value;
  }
  return null;
}

function constructPayload(form) {
  const payload = { __id__: generateUnique() };
  [...form.elements].forEach((fe) => {
    if (fe.name && !fe.matches('button') && !fe.disabled && fe.tagName !== 'FIELDSET') {
      const value = getFieldValue(fe, payload);
      if (fe.closest('.repeat-wrapper')) {
        payload[fe.name] = payload[fe.name] ? `${payload[fe.name]},${fe.value}` : value;
      } else {
        payload[fe.name] = value;
      }
    }
  });
  return { payload };
}

async function prepareRequest(form) {
  const { payload } = constructPayload(form);
  const {
    branch, site, org, tier,
  } = getRouting();
  const headers = {
    'Content-Type': 'application/json',
    'x-adobe-routing': `tier=${tier},bucket=${branch}--${site}--${org}`,
    // eslint-disable-next-line comma-dangle
    'x-adobe-form-hostname': window?.location?.hostname
  };
  const body = { data: payload };
  let url;
  let baseUrl = getSubmitBaseUrl();
  if (!baseUrl && org && site) {
    // eslint-disable-next-line prefer-template
    baseUrl = 'https://forms.adobe.com/adobe/forms/af/submit/';
    headers['x-adobe-routing'] = `tier=${tier},bucket=${branch}--${site}--${org}`;
    url = baseUrl + btoa(`${form.dataset.action}.json`);
  } else {
    url = form.dataset.action;
  }
  return { headers, body, url };
}

async function submitDocBasedForm(form, captcha) {
  try {
    const { headers, body, url } = await prepareRequest(form, captcha);
    let token = null;
    if (captcha) {
      token = await captcha.getToken();
      body.data['g-recaptcha-response'] = token;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (response.ok) {
      submitSuccess(response, form);
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (error) {
    submitFailure(error, form);
  }
}

// ###SEP-NJ START function to validate fields inside the current step
function validateCurrentWizardStep(form) {
  const stepEl = form.querySelector('.wizard>.current-wizard-step');
  const fields = stepEl.querySelectorAll('input, select, textarea');
  for (const field of fields) {
    if (!field.checkValidity()) {
      return false;
    }
  }
  return true;
}
// ###SEP-NJ END

export async function handleSubmit(e, form, captcha) {
  e.preventDefault();
  // ###SEP-NJ Validate only fields inside the current step
  const valid = validateCurrentWizardStep(form); // form.checkValidity();
  if (valid) {
    e.submitter?.setAttribute('disabled', '');
    if (form.getAttribute('data-submitting') !== 'true') {
      form.setAttribute('data-submitting', 'true');

      // hide error message in case it was shown before
      form.querySelectorAll('.form-message.show').forEach((el) => el.classList.remove('show'));

      if (form.dataset.source === 'sheet') {
        await submitDocBasedForm(form, captcha);
      }
    }
  } else {
    const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
    if (firstInvalidEl) {
      firstInvalidEl.focus();
      firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
