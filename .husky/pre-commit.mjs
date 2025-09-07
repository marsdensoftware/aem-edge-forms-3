import { exec } from 'node:child_process';
import { createSpinner } from '../tools/utils.js';

/* eslint-disable-next-line no-promise-executor-return */
const run = (cmd) => new Promise((resolve, reject) => exec(
  cmd,
  (error, stdout, stderr) => {
    if (error) {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      reject(error);
    } else resolve(stdout);
  },
));

const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
const modifiedFiles = changeset.split('\n').filter(Boolean);

const processIfModified = async (pattern, runCmd, postCmd) => {
  const modifiedMatches = modifiedFiles.filter((file) => file.match(pattern));
  if (modifiedMatches.length > 0) {
    const output = await run(runCmd);
    console.log(output);

    switch (typeof postCmd) {
    case 'string':
      await run(postCmd);
      break;
    case 'function':
      await postCmd(modifiedMatches);
      break;
    default:
      throw new Error('Can\'t process postCmd argument in pre-commit script');
    }
  }
}

// TODO FIXME this will fail if files do not exist e.g. because .ts/.scss inputs are batched
const commitGenerated = async (matches, newSuffix) => {
  const newNames = matches.map((name) => {
    const parts = name.split('.');
    parts.splice(-1, 1, newSuffix);
    return parts.join('.');
  })
  await run(`git add ${newNames.join(' ')}`);
}

// check if there are any model files staged
await processIfModified(
  /(^|\/)_.*\.json/,
  'npm run build:json --silent',
  'git add component-models.json component-definition.json component-filters.json',
)

// TODO FIXME if there are other .css output files in styles, or any .scss in blocks/
// their output will not get committed
// check if there are any SCSS style files staged
await processIfModified(/(^|\/).*\.scss/, 'npm run build:css --silent', 'git add styles/main.css')

// check if there are any TypeScript files staged
await processIfModified(/(^|\/).*\.ts/, 'npm run build:ts --silent', async (matches) => commitGenerated(matches, 'js'))

// TODO FIXME ideally we should run on the repo in the staged state
const lintSpinner = createSpinner('Running linting...');
try {
  await run('npm run lint');
  lintSpinner.stop('✅ Linting passed - no issues found');
} catch (error) {
  lintSpinner.stop('❌ Linting failed:');
  console.error(error.stdout || error.message);
  console.error('\n🔧 Please fix the linting errors before committing or use git commit -n.');
  process.exit(1);
}
