import { exec } from "node:child_process";

const run = (cmd) => new Promise((resolve, reject) => exec(
  cmd,
  (error, stdout) => {
    if (error) reject(error);
    else resolve(stdout);
  }
));

const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
const modifiedFiles = changeset.split('\n').filter(Boolean);

// check if there are any model files staged
const modifledPartials = modifiedFiles.filter((file) => file.match(/(^|\/)_.*.json/));
if (modifledPartials.length > 0) {
  const output = await run('npm run build:json --silent');
  console.log(output);
  await run('git add component-models.json component-definition.json component-filters.json');
}

// check if there are any SCSS style files staged
const modifledPartialStyles = modifiedFiles.filter((file) => file.match(/(^|\/)_.*.scss/));
if (modifledPartialStyles.length > 0) {
  const output = await run('npm run build:css --silent');
  console.log(output);
  await run('git add styles/main.css');
}
