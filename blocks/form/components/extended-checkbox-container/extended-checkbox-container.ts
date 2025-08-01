interface Field {
 [key: string]: any
 properties: {
  [key: string]: any
 }
}

export default function decorate(fieldDiv: Element, fieldJson: Field) {
 console.log('hi from extended-checkbox-container')
 fieldDiv.classList.add('extended-checkbox-container')

 // Maximum number of checkboxes that can be enabled at once
 const MAX_ENABLED_CHECKBOXES = 4;

 // Toast element for displaying selection count - will be created on first checkbox click
 let toastElement: HTMLElement | null = null;

 // Function to create the toast element (called only when needed)
 const createToastElement = () => {
   if (document.querySelector('.checkbox-toast')) {
     // If toast already exists in the DOM, use it
     toastElement = document.querySelector('.checkbox-toast');
     return;
   }

   // Create new toast element
   toastElement = document.createElement('div');
   toastElement.classList.add('checkbox-toast');

   // Create icon container
   const iconContainer = document.createElement('div');
   iconContainer.classList.add('checkbox-toast__icon');

   // Create message container
   const messageContainer = document.createElement('div');
   messageContainer.classList.add('checkbox-toast__message-container');

   // Create close button
   const closeButton = document.createElement('button');
   closeButton.classList.add('checkbox-toast__close-button');
   closeButton.innerHTML = '&times;';
   closeButton.setAttribute('aria-label', 'Close');

   // Add click event to close button
   closeButton.addEventListener('click', () => {
     if (toastElement) {
       toastElement.classList.add('checkbox-toast--hidden');
     }
   });

   // Append elements to toast
   toastElement.appendChild(iconContainer);
   toastElement.appendChild(messageContainer);
   toastElement.appendChild(closeButton);

   document.body.appendChild(toastElement);
 };

 // Toast will be created only when needed (on first checkbox click)

 // Function to show toast with message
 const showToast = (message: string, secondLine?: string, isError: boolean = false) => {
   if (!toastElement) {
     // Create the toast element on first use (first checkbox click)
     createToastElement();
   }

   // Get the icon container
   const iconContainer = toastElement!.querySelector('.checkbox-toast__icon');
   if (iconContainer) {
     // Remove any existing classes
     iconContainer.classList.remove('checkbox-toast__icon--success', 'checkbox-toast__icon--error');

     // Add the appropriate class based on isError
     if (isError) {
       iconContainer.classList.add('checkbox-toast__icon--error');
     } else {
       iconContainer.classList.add('checkbox-toast__icon--success');
     }
   }

   // Get the message container
   const messageContainer = toastElement!.querySelector('.checkbox-toast__message-container');
   if (messageContainer) {
     // Clear existing content
     messageContainer.innerHTML = '';

     // Add main message
     const mainMessage = document.createElement('div');
     mainMessage.textContent = message;
     messageContainer.appendChild(mainMessage);

     // Add second line if provided
     if (secondLine) {
       const secondLineElement = document.createElement('div');
       secondLineElement.classList.add('checkbox-toast__second-line');
       secondLineElement.textContent = secondLine;
       messageContainer.appendChild(secondLineElement);
     }
   }

   // Apply the appropriate styling based on isError
   if (isError) {
     toastElement!.classList.add('checkbox-toast--error');
   } else {
     toastElement!.classList.remove('checkbox-toast--error');
   }

   // Make sure toast is visible
   toastElement!.classList.remove('checkbox-toast--hidden');
 };

 // Function to count the number of enabled checkboxes across all sibling containers
 const countEnabledCheckboxes = (): number => {
   // Find the parent element that contains all the extended-checkbox-containers
   const parent = fieldDiv.parentElement;
   if (!parent) return 0;

   // Find all sibling extended-checkbox-containers
   const containers = parent.querySelectorAll('.extended-checkbox-container');
   let count = 0;

   // Count enabled checkboxes across all containers
   containers.forEach((container) => {
     const checkbox = container.querySelector('input[type="checkbox"]');
     if (checkbox && (checkbox as HTMLInputElement).checked) {
       count++;
     }
   });

   return count;
 };

 // Add event listener to the checkbox in this container
 const setupCheckboxListeners = () => {
   // Get the single checkbox in this container
   const checkbox = fieldDiv.querySelector('input[type="checkbox"]');

   if (checkbox) {
     checkbox.addEventListener('click', (event) => {
       const target = event.target as HTMLInputElement;

       // If the checkbox is being checked
       if (target.checked) {
         // Count enabled checkboxes across all containers
         const enabledCount = countEnabledCheckboxes();

         // If enabling this checkbox would exceed the maximum
         if (enabledCount > MAX_ENABLED_CHECKBOXES) {
           // Prevent the checkbox from being checked
           event.preventDefault();
           target.checked = false;

           // Show toast with max selection message (error state)
           showToast(`${MAX_ENABLED_CHECKBOXES} of ${MAX_ENABLED_CHECKBOXES} selected`, `Deselect a skill to select a new one`, true);

           return false;
         }

         // Show toast with current selection count (success state)
         showToast(`${enabledCount} of ${MAX_ENABLED_CHECKBOXES} selected`, undefined, false);
       } else {
         // Checkbox is being unchecked, update the count
         // We need to call countEnabledCheckboxes() after the current event completes
         // because the checkbox state hasn't been updated yet
         setTimeout(() => {
           const enabledCount = countEnabledCheckboxes();
           if (enabledCount > 0) {
             showToast(`${enabledCount} of ${MAX_ENABLED_CHECKBOXES} selected`, undefined, false);
           }
         }, 0);
       }
     }, true); // Use capturing to intercept the event before it reaches the checkbox
   }
 };

 // Set up a MutationObserver to detect when a checkbox is added to this container
 const observer = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
     if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
       // Check if any of the added nodes is a checkbox or contains a checkbox
       mutation.addedNodes.forEach((node) => {
         if (node.nodeType === Node.ELEMENT_NODE) {
           const element = node as Element;
           if (element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox') {
             // If a checkbox was added directly, set up listeners again
             setupCheckboxListeners();
           } else if (element.querySelector) {
             // If a container was added, check if it contains a checkbox
             const checkbox = element.querySelector('input[type="checkbox"]');
             if (checkbox) {
               setupCheckboxListeners();
             }
           }
         }
       });
     }
   });
 });

 // Start observing the container for changes
 observer.observe(fieldDiv, { childList: true, subtree: true });

 // Initial setup of checkbox listeners
 // Use setTimeout to ensure all checkboxes are rendered
 setTimeout(() => {
   setupCheckboxListeners();
 }, 500);

 return fieldDiv;
}
