# AEM EDGE DELIVERY SERVICES

## Front End development checklist

[Front end checklist milestone](/docs/checklist.md)

## Environments

- Live: https://main--aem-edge-forms-3--marsdensoftware.aem.page/
- Testing: https://dev--aem-edge-forms-3--marsdensoftware.aem.page/

## Prerequisites

- Nodejs 18.3.x or newer
- AEM Cloud Service release 2024.8 or newer (>= `17465`)

## Installation

```sh
npm i
```

## Run development server

```sh
npm run dev
```

## Linting

```sh
npm run lint
```

## Local development

[Gulp](https://gulpjs.com/) is use to compile `.scss` to `.css`, through various postcss plugins to support older browser and automate conversion of px value to rem. Tsx is use to compile `.ts` to `.js`.
Only make changes in `.ts` and `.scss` files for development.

### Configure AEM Edge Delivery Services repo

In AEM Dashboard go to settings by clicking hammer icon on left sidebar. Go to Cloud Services > Edge Delivery Services.
Click your AEM's site, select the checkbox for the Github repo and click Properties at the top left (this option only showed when the checkbox is selected).

### Block development

When developing Block keep this thing in mind:

- Block's name needs to be all lowercase
- In Block's `.json` file, definitions id, models id and filters id needs to be the same name and lowercase. The exception of definitions title and definition plugins name
- Block needs to be added to one or more `models` inside the models folder that will use the newly created Block

### Form component development

- Form component needs to be in it's own folder and live under `blocks/form/components` folder
- New component needs to be registered in two places, in `blocks/form/_form.json` and `blocks/form/mappings.js`

### Updating content source

1. Add a mountpoint in the `fstab.yaml`
2. Update `paths.json` to AEM site name
3. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
4. Open the `{repo}` directory in your favorite IDE and start coding

## Useful resources

Before using the aem-boilerplate, we recommand you to go through the documentation on [www.aem.live](https://www.aem.live/docs/) and [experienceleague.adobe.com](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring), more specifically:

- [Getting Started Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)
- [Developing Blocks](https://www.youtube.com/watch?v=23L0LpygZ48)
- [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
- [Content Modelling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
- [Working with Tabular Data / Spreadsheets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/tabular-data)

Furthremore, we encourage you to watch the recordings of any of our previous presentations or sessions:

- [Getting started with AEM Forms Authoring and Edge Delivery Services](https://experienceleague.adobe.com/en/docs/events/experience-manager-gems-recordings/gems2024/edge-delivery-for-aem-forms)
