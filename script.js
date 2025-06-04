 // DOM Elements
 const taskInput = document.getElementById('task-input');
 const addTaskBtn = document.getElementById('add-task-btn');
 const taskList = document.getElementById('task-list');
 const textInputToggle = document.getElementById('text-input-toggle');
 const stylusInputToggle = document.getElementById('stylus-input-toggle');
 const textInputSection = document.getElementById('text-input-section');
 const stylusInputSection = document.getElementById('stylus-input-section');
 const canvas = document.getElementById('drawing-canvas');
 const canvasWrapper = document.querySelector('.canvas-wrapper');
 const clearCanvasBtn = document.getElementById('clear-canvas');
 const addDrawingTaskBtn = document.getElementById('add-drawing-task');
 const offlineIndicator = document.getElementById('offline-indicator');
 const installButton = document.getElementById('install-button');

 // PWA Install prompt
 let deferredPrompt;

 // Drawing variables
 const ctx = canvas.getContext('2d');
 let isDrawing = false;
 let lastX = 0;
 let lastY = 0;
 let hasDrawing = false;

 // Tasks array
 let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

 // Set canvas size on load and resize
 function resizeCanvas() {
     const rect = canvasWrapper.getBoundingClientRect();
     canvas.width = rect.width;
     canvas.height = rect.height;
     // Set display size
     canvas.style.width = rect.width + 'px';
     canvas.style.height = rect.height + 'px';
 }

 // Load tasks on page load
 window.addEventListener('load', () => {
     // Register service worker for offline capability
     registerServiceWorker();
     
     // Set canvas size
     resizeCanvas();
     
     // Load tasks
     loadTasks();
     
     // Setup offline detection
     setupOfflineDetection();
 });

 // Resize canvas when window size changes
 window.addEventListener('resize', resizeCanvas);

 // Register service worker
 function registerServiceWorker() {
     if ('serviceWorker' in navigator) {
         navigator.serviceWorker.register('service-worker.js')
             .then(registration => {
                 console.log('Service Worker registered with scope:', registration.scope);
             })
             .catch(error => {
                 console.error('Service Worker registration failed:', error);
             });
     }
 }

 // Setup offline detection
 function setupOfflineDetection() {
     // Check if currently offline
     if (!navigator.onLine) {
         offlineIndicator.style.display = 'block';
     }

     // Listen for online/offline events
     window.addEventListener('online', () => {
         offlineIndicator.style.display = 'none';
     });

     window.addEventListener('offline', () => {
         offlineIndicator.style.display = 'block';
     });
 }

 // Handle PWA install
 window.addEventListener('beforeinstallprompt', (e) => {
     // Prevent Chrome 67 and earlier from automatically showing the prompt
     e.preventDefault();
     // Stash the event so it can be triggered later
     deferredPrompt = e;
     // Show the install button
     installButton.style.display = 'block';
 });

 installButton.addEventListener('click', async () => {
     if (deferredPrompt) {
         // Show the install prompt
         deferredPrompt.prompt();
         // Wait for the user to respond to the prompt
         const { outcome } = await deferredPrompt.userChoice;
         console.log(`User response to the install prompt: ${outcome}`);
         // We've used the prompt, and can't use it again, throw it away
         deferredPrompt = null;
         // Hide the install button
         installButton.style.display = 'none';
     }
 });

 // Hide the install button when the app is installed
 window.addEventListener('appinstalled', () => {
     console.log('App was installed');
     installButton.style.display = 'none';
 });

 // Event listeners
 addTaskBtn.addEventListener('click', addTask);
 taskInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') addTask();
 });
 clearCanvasBtn.addEventListener('click', clearCanvas);
 addDrawingTaskBtn.addEventListener('click', addDrawingTask);

 // Input toggle
 textInputToggle.addEventListener('click', () => {
     textInputToggle.classList.add('active');
     stylusInputToggle.classList.remove('active');
     textInputSection.style.display = 'block';
     stylusInputSection.style.display = 'none';
 });

 stylusInputToggle.addEventListener('click', () => {
     stylusInputToggle.classList.add('active');
     textInputToggle.classList.remove('active');
     stylusInputSection.style.display = 'block';
     textInputSection.style.display = 'none';
     // Ensure canvas is properly sized when showing
     setTimeout(resizeCanvas, 0);
 });

 // Get precise pointer position relative to canvas
 function getPointerPosition(e) {
     const rect = canvas.getBoundingClientRect();
     const scaleX = canvas.width / rect.width;
     const scaleY = canvas.height / rect.height;
     
     // For touch events, use the first touch point
     if (e.touches && e.touches.length > 0) {
         return {
             x: (e.touches[0].clientX - rect.left) * scaleX,
             y: (e.touches[0].clientY - rect.top) * scaleY
         };
     }
     
     // For pointer/mouse events
     return {
         x: (e.clientX - rect.left) * scaleX,
         y: (e.clientY - rect.top) * scaleY
     };
 }

 // Canvas drawing events - optimized for stylus
 canvas.addEventListener('pointerdown', startDrawing);
 canvas.addEventListener('pointermove', draw);
 canvas.addEventListener('pointerup', stopDrawing);
 canvas.addEventListener('pointerout', stopDrawing);
 canvas.addEventListener('pointercancel', stopDrawing);

 // Touch fallbacks for devices that don't fully support pointer events
 canvas.addEventListener('touchstart', e => {
     e.preventDefault(); // Prevent scrolling when touching the canvas
     startDrawing(e);
 }, { passive: false });
 
 canvas.addEventListener('touchmove', e => {
     e.preventDefault();
     draw(e);
 }, { passive: false });
 
 canvas.addEventListener('touchend', stopDrawing);
 canvas.addEventListener('touchcancel', stopDrawing);

 function startDrawing(e) {
     isDrawing = true;
     hasDrawing = true;
     
     const pos = getPointerPosition(e);
     lastX = pos.x;
     lastY = pos.y;
     
     // Start path for better line quality
     ctx.beginPath();
     ctx.moveTo(lastX, lastY);
     ctx.lineTo(lastX, lastY);
     ctx.stroke();
 }

 function draw(e) {
     if (!isDrawing) return;
     
     const pos = getPointerPosition(e);
     
     ctx.lineWidth = 2;
     ctx.lineCap = 'round';
     ctx.lineJoin = 'round';
     ctx.strokeStyle = '#000';

     ctx.beginPath();
     ctx.moveTo(lastX, lastY);
     ctx.lineTo(pos.x, pos.y);
     ctx.stroke();
     
     lastX = pos.x;
     lastY = pos.y;
 }

 function stopDrawing() {
     isDrawing = false;
 }

 function clearCanvas() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     hasDrawing = false;
 }

 function addDrawingTask() {
     if (!hasDrawing) return;
     
     // Convert canvas to image
     const imageData = canvas.toDataURL('image/png');
     
     // Create task object with image
     addTaskToList(null, imageData);
     
     // Clear canvas for next drawing
     clearCanvas();
 }

 function addTask() {
     const taskText = taskInput.value.trim();
     if (taskText) {
         addTaskToList(taskText, null);
         taskInput.value = '';
     }
 }

 function addTaskToList(text, imageData) {
     // Create task object
     const task = {
         id: Date.now(),
         text: text,
         imageData: imageData,
         completed: false
     };

     // Add to tasks array
     tasks.push(task);
     
     // Save to localStorage
     saveTasks();
     
     // Render task
     renderTask(task);
 }

 function renderTask(task) {
     const li = document.createElement('li');
     li.classList.add('task-item');
     if (task.completed) {
         li.classList.add('completed');
     }
     li.setAttribute('data-id', task.id);
     
     const checkbox = document.createElement('input');
     checkbox.type = 'checkbox';
     checkbox.classList.add('task-checkbox');
     checkbox.checked = task.completed;
     checkbox.addEventListener('change', toggleTaskStatus);
     
     const contentDiv = document.createElement('div');
     contentDiv.classList.add('task-content');
     
     if (task.text) {
         // Text task
         const span = document.createElement('span');
         span.classList.add('task-text');
         span.textContent = task.text;
         contentDiv.appendChild(span);
     } else if (task.imageData) {
         // Handwritten task
         const handwrittenDiv = document.createElement('div');
         handwrittenDiv.classList.add('handwritten-task');
         
         const label = document.createElement('div');
         label.classList.add('handwritten-label');
         label.textContent = 'Handwritten Note';
         
         const img = document.createElement('img');
         img.src = task.imageData;
         img.classList.add('task-image');
         img.alt = 'Handwritten task';
         
         handwrittenDiv.appendChild(label);
         handwrittenDiv.appendChild(img);
         contentDiv.appendChild(handwrittenDiv);
     }
     
     const deleteBtn = document.createElement('button');
     deleteBtn.classList.add('delete-btn');
     deleteBtn.textContent = 'Delete';
     deleteBtn.addEventListener('click', deleteTask);
     
     li.appendChild(checkbox);
     li.appendChild(contentDiv);
     li.appendChild(deleteBtn);
     
     // Add new tasks at the top of the list
     taskList.prepend(li);
 }

 function toggleTaskStatus(e) {
     const taskId = parseInt(e.target.parentElement.getAttribute('data-id'));
     tasks = tasks.map(task => {
         if (task.id === taskId) {
             task.completed = !task.completed;
             e.target.parentElement.classList.toggle('completed');
         }
         return task;
     });
     saveTasks();
 }

 function deleteTask(e) {
     const taskId = parseInt(e.target.parentElement.getAttribute('data-id'));
     tasks = tasks.filter(task => task.id !== taskId);
     e.target.parentElement.remove();
     saveTasks();
 }

 function saveTasks() {
     localStorage.setItem('tasks', JSON.stringify(tasks));
 }

 function loadTasks() {
     taskList.innerHTML = '';
     // Show newest tasks at the top
     tasks.slice().reverse().forEach(task => renderTask(task));
 }