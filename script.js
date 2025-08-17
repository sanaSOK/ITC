let currentStep = 0;
let currentFloorStep = 0;
let buildingFImages = [
    './image/building F.png',
    './image/building F left.png',
    './image/building F right.png'
];

// New array for ITC main building images
let itcImages = [
    './image/itc.png',
    './image/itc-left.png',
    './image/itc-right.png'
];
let currentItcIndex = 0;
let itcInterval;

let currentBuildingFIndex = 0;
let buildingFInterval;

// Add new variables to store the state before entering detailed view
let lastFloorName = '';
let lastRoomDetails = null;

// New variable to track the index of the currently displayed detail image
let currentDetailImageIndex = 0;

// Data structure to hold multiple images for detailed views
const roomDetailsImages = {
    'Floor1': [
        './image/floor1_f101.png',
        './image/floor1_f102.png',
        './image/floor1_f103.png',
        './image/floor1_f104.png',
        './image/floor1_f105.png',
        './image/floor1_f106.png'
    ],
    
    'Floor2': [
        './image/floor2_f201.png',
        './image/floor2_f202.png',
        './image/floor2_f203.png',
        './image/floor2_f204.png',
        './image/floor2_f205.png',
        './image/floor2_f206.png'
    ],
    
    'Floor3': [
        './image/floor3_f301.png',
        './image/floor3_f302.png',
        './image/floor3_f303.png',
        './image/floor3_f304.png',
        './image/floor3_f305.png',
        './image/floor3_f306.png'
    ],
    
    'Floor4': [
        './image/floor4_f401.png',
        './image/floor4_f402.png',
        './image/floor4_f403.png',
        './image/floor4_f404.png',
        './image/floor4_f405.png',
        './image/floor4_f406.png'
    ],
    
};

// --- Inactivity Timer Logic ---
let inactivityTimer;
const inactivityTimeLimit = 5000; // 5 seconds (5000 milliseconds)

// Swipe / Drag support
let isPointerDown = false;
let pointerId = null;
let startX = 0;
let startY = 0;
let moved = false;
const swipeThreshold = 60; // pixels to consider a swipe


function resetToHome() {
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const floorButtonsContainer = document.getElementById('floorButtonsContainer');
    const contentPart = document.getElementById('contentPart');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const chooseFloorButton = document.getElementById('chooseFloorButton');
    if (chooseFloorButton) chooseFloorButton.style.visibility = 'hidden';

    // Stop all ongoing carousels
    stopBuildingFCarousel();
    stopItcCarousel(); // New: Stop ITC carousel
    
    // Reset all elements to their initial state
    mainImage.src = itcImages[0]; // New: Use first image from ITC array
    mainImage.alt = 'Institute of Technology of Cambodia building';
    mainImage.onclick = handleImageClick;
    buildingTitle.textContent = 'Initial Building';
    floorButtonsContainer.style.visibility = 'hidden';
    contentPart.style.display = 'none';
    nextButton.style.visibility = 'hidden';
    backButton.style.visibility = 'hidden';
    currentStep = 0; // Reset the step counter
    resetTimer(); // Start the timer again
    startItcCarousel(); // New: Start the ITC carousel
}

function loadFloorSelection() {
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const floorButtonsContainer = document.getElementById('floorButtonsContainer');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const chooseFloorButton = document.getElementById('chooseFloorButton');

    stopBuildingFCarousel();
    stopItcCarousel(); // New: Stop ITC carousel
    if (nextButton) nextButton.style.visibility = 'hidden';
    if (backButton) backButton.style.visibility = 'hidden';
    if (chooseFloorButton) chooseFloorButton.style.visibility = 'hidden';

    mainImage.src = './image/floor.png';
    mainImage.alt = 'Building F - Floor Selection';
    buildingTitle.textContent = 'Building F - Select a Floor';
    floorButtonsContainer.style.visibility = 'visible';
    mainImage.onclick = null;
    currentStep = 2;
    currentFloorStep = 0;
}

function resetTimer() {
    // Clears the existing timer and sets a new one
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(resetToHome, inactivityTimeLimit);
}

function initSwipe() {
    const container = document.getElementById('imageContainer');
    const mainImage = document.getElementById('mainImage');
    if (!container || !mainImage) return;

    // Prevent native image dragging
    mainImage.draggable = false;
    // Allow smoother transform animations
    mainImage.style.transition = 'transform 200ms ease';
    // Allow vertical page scroll while handling horizontal swipes
    container.style.touchAction = 'pan-y';

    container.addEventListener('pointerdown', (e) => {
        if (e.isPrimary === false) return;
        // Only enable pointer interactions when in an interactive view
        const buildingTitle = document.getElementById('buildingTitle');
        if (!buildingTitle || (!buildingTitle.textContent.startsWith('Floor') && !buildingTitle.textContent.endsWith('Detailed View') && !buildingTitle.textContent.includes('Initial Building'))) return;
        // Only start swipe when user presses on the image itself
        if (e.target !== mainImage) return;

        isPointerDown = true;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        moved = false; // Reset the 'moved' flag
        try { container.setPointerCapture(pointerId); } catch (err) {}
        resetTimer();
    });

    container.addEventListener('pointermove', (e) => {
        if (!isPointerDown || e.pointerId !== pointerId) return;
        const buildingTitle = document.getElementById('buildingTitle');
        if (!buildingTitle || (!buildingTitle.textContent.startsWith('Floor') && !buildingTitle.textContent.endsWith('Detailed View') && !buildingTitle.textContent.includes('Initial Building'))) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // If horizontal move is larger than vertical move, and exceeds a small threshold, treat as a drag
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            moved = true; 
            mainImage.style.transition = 'none';
            mainImage.style.transform = `translateX(${dx}px)`;
        }
    });

    function endPointer(e) {
        if (!isPointerDown || e.pointerId !== pointerId) return;
        const buildingTitle = document.getElementById('buildingTitle');
        // If not in a view with swiping, just reset state
        if (!buildingTitle || (!buildingTitle.textContent.startsWith('Floor') && !buildingTitle.textContent.endsWith('Detailed View') && !buildingTitle.textContent.includes('Initial Building'))) {
            isPointerDown = false;
            moved = false;
            try { container.releasePointerCapture(pointerId); } catch (err) {}
            mainImage.style.transition = 'transform 200ms ease';
            mainImage.style.transform = '';
            return;
        }

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        isPointerDown = false;
        try { container.releasePointerCapture(pointerId); } catch (err) {}

        // reset transform with animation
        mainImage.style.transition = 'transform 200ms ease';
        mainImage.style.transform = '';

        if (moved) {
            // Check if it's a significant swipe
            if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) {
                    showNextImage();
                } else {
                    showPreviousImage();
                }
            }
        } else {
            // If the pointer didn't move much, treat it as a click
            handleImageClick();
        }
        moved = false;
        resetTimer();
    }

    container.addEventListener('pointerup', endPointer);
    container.addEventListener('pointercancel', endPointer);
    container.addEventListener('pointerleave', endPointer);
}

// Attach event listeners to reset the timer on user activity
window.onload = resetToHome; // New: call resetToHome on load
window.onmousemove = resetTimer;
window.onmousedown = resetTimer;
window.onclick = resetTimer;
window.onkeypress = resetTimer;
window.addEventListener('scroll', resetTimer, true);
window.addEventListener('load', () => { resetTimer(); initSwipe(); });

// --- Existing Functions (with resetTimer added to relevant user actions) ---

// New function to start ITC carousel
function startItcCarousel() {
    stopItcCarousel();
    itcInterval = setInterval(() => {
        const mainImage = document.getElementById('mainImage');
        currentItcIndex = (currentItcIndex + 1) % itcImages.length;
        mainImage.src = itcImages[currentItcIndex];
        mainImage.alt = 'ITC Building - Image ' + (currentItcIndex + 1);
    }, 3000);
}

// New function to stop ITC carousel
function stopItcCarousel() {
    clearInterval(itcInterval);
}

function handleImageClick() {
    resetTimer();
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const floorButtonsContainer = document.getElementById('floorButtonsContainer');

    if (currentStep === 0) {
        stopItcCarousel(); // New: Stop the ITC carousel on click
        mainImage.src = buildingFImages[currentBuildingFIndex];
        mainImage.alt = 'ITC Building F';
        buildingTitle.textContent = 'Building F';
        currentStep = 1;
        startBuildingFCarousel();
    } else if (currentStep === 1) {
        stopBuildingFCarousel();
        mainImage.src = './image/floor.png';
        mainImage.alt = 'Building F - Floor Selection';
        buildingTitle.textContent = 'Building F - Select a Floor';
        floorButtonsContainer.style.visibility = 'visible';
        mainImage.onclick = null;
        currentStep = 2;
    } else {
        console.log('Buttons are now available for selection.');
    }
}

function startBuildingFCarousel() {
    stopBuildingFCarousel();
    buildingFInterval = setInterval(() => {
        const mainImage = document.getElementById('mainImage');
        currentBuildingFIndex = (currentBuildingFIndex + 1) % buildingFImages.length;
        mainImage.src = buildingFImages[currentBuildingFIndex];
        mainImage.alt = 'ITC Building F - Image ' + (currentBuildingFIndex + 1);
    }, 3000);
}

function stopBuildingFCarousel() {
    clearInterval(buildingFInterval);
}


function loadFloor(floorName) {
    resetTimer();
    const chooseFloorButton = document.getElementById('chooseFloorButton');
    if (chooseFloorButton) chooseFloorButton.style.visibility = 'visible';
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const floorButtonsContainer = document.getElementById('floorButtonsContainer');
    const nextButton = document.getElementById('nextButton');
    const contentPart = document.getElementById('contentPart');
    const backButton = document.getElementById('backButton');
    
    floorButtonsContainer.style.visibility = 'hidden';
    contentPart.style.display = 'none';
    lastFloorName = floorName;
    lastRoomDetails = null;

    if (floorName === 'Floor 1') {
        const initialImage = './image/floor_1_image_1.png';
        const initialTitle = 'Floor 1 - F101';
        mainImage.src = initialImage;
        mainImage.alt = initialTitle;
        buildingTitle.textContent = initialTitle;
        nextButton.style.visibility = 'visible';
        backButton.style.visibility = 'visible';
        currentFloorStep = 0;
        mainImage.onclick = () => showRoomDetails('F101');
    } else if (floorName === 'Floor 2') {
        const initialImage = './image/floor_2_image_1.png';
        const initialTitle = 'Floor 2 - F201';
        mainImage.src = initialImage;
        mainImage.alt = initialTitle;
        buildingTitle.textContent = initialTitle;
        nextButton.style.visibility = 'visible';
        backButton.style.visibility = 'visible';
        currentFloorStep = 0;
        mainImage.onclick = () => showRoomDetails('F201');
    } else if (floorName === 'Floor 3') {
        const initialImage = './image/floor_3_image_1.png';
        const initialTitle = 'Floor 3 - F301';
        mainImage.src = initialImage;
        mainImage.alt = initialTitle;
        buildingTitle.textContent = initialTitle;
        nextButton.style.visibility = 'visible';
        backButton.style.visibility = 'visible';
        currentFloorStep = 0;
        mainImage.onclick = () => showRoomDetails('F301');
    } else if (floorName === 'Floor 4') {
        const initialImage = './image/floor_4_image_1.png';
        const initialTitle = 'Floor 4 - F401';
        mainImage.src = initialImage;
        mainImage.alt = initialTitle;
        buildingTitle.textContent = initialTitle;
        nextButton.style.visibility = 'visible';
        backButton.style.visibility = 'visible';
        currentFloorStep = 0;
        mainImage.onclick = () => showRoomDetails('F401');
    } else {
        alert(`You have selected ${floorName}. Content for this floor is not yet available.`);
        loadFloorSelection(); // Call the new function to go back
    }
}

function showRoomDetails(roomName) {
    resetTimer();
    const chooseFloorButton = document.getElementById('chooseFloorButton');
    if (chooseFloorButton) chooseFloorButton.style.visibility = 'visible';
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const contentPart = document.getElementById('contentPart');
    const roomContent = document.getElementById('roomContent');

    lastRoomDetails = {
        image: mainImage.src,
        alt: mainImage.alt,
        title: buildingTitle.textContent,
        room: roomName
    };
    
    currentDetailImageIndex = 0;
    
    // Corrected logic: Extract the floor number from the room name
    const floorNumber = roomName.charAt(1);
    const floorKey = 'Floor' + floorNumber;
    const images = roomDetailsImages[floorKey];

    if (images && images.length > 0) {
        const roomImageIndex = images.findIndex(imagePath => imagePath.includes(roomName.toLowerCase()));
        if (roomImageIndex !== -1) {
            currentDetailImageIndex = roomImageIndex;
        } else {
            currentDetailImageIndex = 0;
        }
        mainImage.src = images[currentDetailImageIndex];
        mainImage.alt = `ITC Building F - ${roomName} - Detailed View ${currentDetailImageIndex + 1}`;
    } else {
        mainImage.src = `./image/floor${floorNumber}_${roomName.toLowerCase()}.png`;
        mainImage.alt = `ITC Building F - Floor ${floorNumber} - ${roomName} - Detailed View`;
    }

    buildingTitle.textContent = `${roomName} - Detailed View`;
    contentPart.style.display = 'flex';
    roomContent.innerHTML = `
        <h2>Room ${roomName}</h2>
        <p>This is a detailed view of room ${roomName}. This is a general-purpose classroom, equipped for a variety of lectures and practical sessions.</p>
        <p><strong>Capacity:</strong> 50 students</p>
        <p><strong>Equipment:</strong></p>
        <ul>
            <li>Projector and screen</li>
            <li>Whiteboard</li>
            <li>Air conditioning</li>
        </ul>
    `;
    mainImage.onclick = null;
}
function showNextImage() {
    resetTimer();
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const contentPart = document.getElementById('contentPart');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    
    // Handle navigation in detailed view first
    if (contentPart.style.display === 'flex') {
        const roomNameMatch = buildingTitle.textContent.match(/^([A-Z0-9]+)/);
        if (roomNameMatch) {
            const roomName = roomNameMatch[1];
            const images = roomDetailsImages[roomName];
            if (images && images.length > 1) {
                currentDetailImageIndex = (currentDetailImageIndex + 1) % images.length;
                mainImage.src = images[currentDetailImageIndex];
                buildingTitle.textContent = `${roomName} - Detailed View ${currentDetailImageIndex + 1}`;
                return; // Stop here, no more logic needed
            }
        }
    }
    
    // Handle navigation in initial ITC view
    if (buildingTitle.textContent.includes('Initial Building')) {
        currentItcIndex = (currentItcIndex + 1) % itcImages.length;
        mainImage.src = itcImages[currentItcIndex];
        buildingTitle.textContent = 'Initial Building';
        return;
    }

    // This block handles the back-from-detail-view functionality
    if (contentPart.style.display === 'flex' && lastRoomDetails) {
        mainImage.src = lastRoomDetails.image;
        mainImage.alt = lastRoomDetails.alt;
        buildingTitle.textContent = lastRoomDetails.title;
        contentPart.style.display = 'none';
        mainImage.onclick = () => showRoomDetails(lastRoomDetails.room);
        lastRoomDetails = null;
        return;
    }

    contentPart.style.display = 'none';
    mainImage.onclick = null;

    const floor1Images = [
        { path: './image/floor_1_image_1.png', title: 'Floor 1 - F101', room: 'F101' },
        { path: './image/floor_1_image_2.png', title: 'Floor 1 - F102', room: 'F102' },
        { path: './image/floor_1_image_3.png', title: 'Floor 1 - F103', room: 'F103' },
        { path: './image/floor_1_image_4.png', title: 'Floor 1 - F104', room: 'F104' },
        { path: './image/floor_1_image_5.png', title: 'Floor 1 - F105', room: 'F105' },
        { path: './image/floor_1_image_6.png', title: 'Floor 1 - F106', room: 'F106' }
    ];
    const floor2Images = [
        { path: './image/floor_2_image_1.png', title: 'Floor 2 - F201', room: 'F201' },
        { path: './image/floor_2_image_2.png', title: 'Floor 2 - F202', room: 'F202' },
        { path: './image/floor_2_image_3.png', title: 'Floor 2 - F203', room: 'F203' },
        { path: './image/floor_2_image_4.png', title: 'Floor 2 - F204', room: 'F204' },
        { path: './image/floor_2_image_5.png', title: 'Floor 2 - F205', room: 'F205' },
        { path: './image/floor_2_image_6.png', title: 'Floor 2 - F206', room: 'F206' }
    ];
    const floor3Images = [
        { path: './image/floor_3_image_1.png', title: 'Floor 3 - F301', room: 'F301' },
        { path: './image/floor_3_image_2.png', title: 'Floor 3 - F302', room: 'F302' },
        { path: './image/floor_3_image_3.png', title: 'Floor 3 - F303', room: 'F303' },
        { path: './image/floor_3_image_4.png', title: 'Floor 3 - F304', room: 'F304' },
        { path: './image/floor_3_image_5.png', title: 'Floor 3 - F305', room: 'F305' },
        { path: './image/floor_3_image_6.png', title: 'Floor 3 - F306', room: 'F306' }
    ];
    const floor4Images = [
        { path: './image/floor_4_image_1.png', title: 'Floor 4 - F401', room: 'F401' },
        { path: './image/floor_4_image_2.png', title: 'Floor 4 - F402', room: 'F402' },
        { path: './image/floor_4_image_3.png', title: 'Floor 4 - F403', room: 'F403' },
        { path: './image/floor_4_image_4.png', title: 'Floor 4 - F404', room: 'F404' },
        { path: './image/floor_4_image_5.png', title: 'Floor 4 - F405', room: 'F405' },
        { path: './image/floor_4_image_6.png', title: 'Floor 4 - F406', room: 'F406' }
    ];

    let currentImages = [];
    if (buildingTitle.textContent.startsWith('Floor 1')) {
        currentImages = floor1Images;
    } else if (buildingTitle.textContent.startsWith('Floor 2')) {
        currentImages = floor2Images;
    } else if (buildingTitle.textContent.startsWith('Floor 3')) {
        currentImages = floor3Images;
    } else if (buildingTitle.textContent.startsWith('Floor 4')) {
        currentImages = floor4Images;
    } else if (buildingTitle.textContent.includes('Building F')) { // Add this condition for Building F
        currentImages = buildingFImages.map(path => ({ path: path, title: 'Building F' }));
        currentBuildingFIndex = (currentBuildingFIndex + 1) % currentImages.length;
        const currentBuildingF = currentImages[currentBuildingFIndex];
        mainImage.src = currentBuildingF.path;
        mainImage.alt = currentBuildingF.title;
        buildingTitle.textContent = currentBuildingF.title;
        return;
    }


    if (currentImages.length > 0) {
    // advance and wrap so rooms repeat
    currentFloorStep = (currentFloorStep + 1) % currentImages.length;

        const currentRoom = currentImages[currentFloorStep];
        mainImage.src = currentRoom.path;
        mainImage.alt = currentRoom.title;
        buildingTitle.textContent = currentRoom.title;
        
        mainImage.onclick = () => showRoomDetails(currentRoom.room);
    }
}

function showPreviousImage() {
    resetTimer();
    const mainImage = document.getElementById('mainImage');
    const buildingTitle = document.getElementById('buildingTitle');
    const contentPart = document.getElementById('contentPart');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    
    // Handle navigation in detailed view first
    if (contentPart.style.display === 'flex') {
        const roomNameMatch = buildingTitle.textContent.match(/^([A-Z0-9]+)/);
        if (roomNameMatch) {
            const roomName = roomNameMatch[1];
            const images = roomDetailsImages[roomName];
            if (images && images.length > 1) {
                currentDetailImageIndex = (currentDetailImageIndex - 1 + images.length) % images.length;
                mainImage.src = images[currentDetailImageIndex];
                buildingTitle.textContent = `${roomName} - Detailed View ${currentDetailImageIndex + 1}`;
                return; // Stop here, no more logic needed
            }
        }
    }
    
    // Handle navigation in initial ITC view
    if (buildingTitle.textContent.includes('Initial Building')) {
        currentItcIndex = (currentItcIndex - 1 + itcImages.length) % itcImages.length;
        mainImage.src = itcImages[currentItcIndex];
        buildingTitle.textContent = 'Initial Building';
        return;
    }

    // This block handles the back-from-detail-view functionality
    if (contentPart.style.display === 'flex' && lastRoomDetails) {
        mainImage.src = lastRoomDetails.image;
        mainImage.alt = lastRoomDetails.alt;
        buildingTitle.textContent = lastRoomDetails.title;
        contentPart.style.display = 'none';
        mainImage.onclick = () => showRoomDetails(lastRoomDetails.room);
        lastRoomDetails = null;
        return;
    }

    contentPart.style.display = 'none';
    mainImage.onclick = null;

    const floor1Images = [
        { path: './image/floor_1_image_1.png', title: 'Floor 1 - F101', room: 'F101' },
        { path: './image/floor_1_image_2.png', title: 'Floor 1 - F102', room: 'F102' },
        { path: './image/floor_1_image_3.png', title: 'Floor 1 - F103', room: 'F103' },
        { path: './image/floor_1_image_4.png', title: 'Floor 1 - F104', room: 'F104' },
        { path: './image/floor_1_image_5.png', title: 'Floor 1 - F105', room: 'F105' },
        { path: './image/floor_1_image_6.png', title: 'Floor 1 - F106', room: 'F106' }
    ];
    const floor2Images = [
        { path: './image/floor_2_image_1.png', title: 'Floor 2 - F201', room: 'F201' },
        { path: './image/floor_2_image_2.png', title: 'Floor 2 - F202', room: 'F202' },
        { path: './image/floor_2_image_3.png', title: 'Floor 2 - F203', room: 'F203' },
        { path: './image/floor_2_image_4.png', title: 'Floor 2 - F204', room: 'F204' },
        { path: './image/floor_2_image_5.png', title: 'Floor 2 - F205', room: 'F205' },
        { path: './image/floor_2_image_6.png', title: 'Floor 2 - F206', room: 'F206' }
    ];
    const floor3Images = [
        { path: './image/floor_3_image_1.png', title: 'Floor 3 - F301', room: 'F301' },
        { path: './image/floor_3_image_2.png', title: 'Floor 3 - F302', room: 'F302' },
        { path: './image/floor_3_image_3.png', title: 'Floor 3 - F303', room: 'F303' },
        { path: './image/floor_3_image_4.png', title: 'Floor 3 - F304', room: 'F304' },
        { path: './image/floor_3_image_5.png', title: 'Floor 3 - F305', room: 'F305' },
        { path: './image/floor_3_image_6.png', title: 'Floor 3 - F306', room: 'F306' }
    ];
    const floor4Images = [
        { path: './image/floor_4_image_1.png', title: 'Floor 4 - F401', room: 'F401' },
        { path: './image/floor_4_image_2.png', title: 'Floor 4 - F402', room: 'F402' },
        { path: './image/floor_4_image_3.png', title: 'Floor 4 - F403', room: 'F403' },
        { path: './image/floor_4_image_4.png', title: 'Floor 4 - F404', room: 'F404' },
        { path: './image/floor_4_image_5.png', title: 'Floor 4 - F405', room: 'F405' },
        { path: './image/floor_4_image_6.png', title: 'Floor 4 - F406', room: 'F406' }
    ];

    let currentImages = [];
    if (buildingTitle.textContent.startsWith('Floor 1')) {
        currentImages = floor1Images;
    } else if (buildingTitle.textContent.startsWith('Floor 2')) {
        currentImages = floor2Images;
    } else if (buildingTitle.textContent.startsWith('Floor 3')) {
        currentImages = floor3Images;
    } else if (buildingTitle.textContent.startsWith('Floor 4')) {
        currentImages = floor4Images;
    } else if (buildingTitle.textContent.includes('Building F')) { // Add this condition for Building F
        currentImages = buildingFImages.map(path => ({ path: path, title: 'Building F' }));
        currentBuildingFIndex = (currentBuildingFIndex - 1 + currentImages.length) % currentImages.length;
        const currentBuildingF = currentImages[currentBuildingFIndex];
        mainImage.src = currentBuildingF.path;
        mainImage.alt = currentBuildingF.title;
        buildingTitle.textContent = currentBuildingF.title;
        return;
    }

    if (currentImages.length > 0) {
        currentFloorStep = (currentFloorStep - 1 + currentImages.length) % currentImages.length;
        const currentRoom = currentImages[currentFloorStep];

        mainImage.src = currentRoom.path;
        mainImage.alt = currentRoom.title;
        buildingTitle.textContent = currentRoom.title;
        
        mainImage.onclick = () => showRoomDetails(currentRoom.room);
    }
}