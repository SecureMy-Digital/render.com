// Imports
import { resetKeyTimes, addKeyTime, fakeSamples, getIntervals, pwnedPrefix, silent_prefix, collectTiming, collectFeatures, displayFeatures } from './features.js';
import { mojiString } from './mojistring.js';
import { updateGauge } from './gauge.js';
import { visualizeTree } from './visualize-tree.js';
import DecisionTree from './decision-tree.js';

// Constants
const requiredSamples = 3;

// Global variables
let sampleCount = 0;
let previousUser = null;
//onst userProfile = {};
const decisionTree = new DecisionTree(3, 8, 'illegitimate');
let trainingData = [];
let trainingLabels = [];

// UI Elements
const registrationForm = document.getElementById('registrationForm');
const confirmationForm = document.getElementById('confirmationForm');
const loginForm = document.getElementById('loginForm');
const sampleCounter = document.getElementById('sampleCounter');
const strongPasswordInput = document.getElementById('strongPasswordInput');
const lostDataLink = document.getElementById('lostDataLink');
const saveDataLink = document.getElementById('saveDataLink');
const viewDataLink = document.getElementById('viewDataLink');
const downloadDataLink = document.getElementById('downloadDataLink');
const uploadJsonFile = document.getElementById('uploadJsonFile');
const strongGaugeDiv = document.getElementById('strongGauge');

// Button and input elements
const avatarUrlInput = document.getElementById('avatarUrlInput');
const startRegistrationButton = document.getElementById('startRegistrationButton');
const cancelRegistrationButton = document.getElementById('cancelRegistrationButton');
const deleteUserDataButton = document.getElementById('deleteUserData');
const confirmButton = document.getElementById('confirmButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const loginUsernameInput = document.getElementById('loginUsernameInput');

// Output elements
const registerMessage = document.getElementById('registerMessage');
const confirmMessage = document.getElementById('confirmMessage');
const loginMessage = document.getElementById('loginMessage');
const intervalGraph = document.getElementById('intervalGraph');
const treeVisualizationDiv = document.getElementById('treeVisualization');
const resultDiv = document.getElementById('result');

// Modal elements
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const viewTimingIcon = document.getElementById('viewTiming');
const loginPasswordEntropy = document.getElementById('loginPasswordEntropy');
const strongPasswordEntropy = document.getElementById('strongPasswordEntropy');

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    setupEventListeners();
    setupModalEvents();
});

function initialize() {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    
    if (Object.keys(userData).length === 0) {
        console.log("No user data detected:", userData);
         userData['anony'] = { 
            username : 'anony',
            seed: generateRandomSeed(),
            profile: {
                name: 'Anonymous',
                avatar: "photo.svg",
                address: 'no where',
                website: 'https://example.com'
            },
            trainingData: [ { prefix: 0, avgInterval: 100 } ]
        };
        localStorage.setItem('user', JSON.stringify(userData));
    }
    showLoginForm(userData);
    console.log("Loaded user data from localStorage:", userData);
}

function cancelRegistration() {
    loginForm.style.display = 'block';
    registrationForm.style.display = 'none'; 
}
function showRegistrationForm() {
    registrationForm.style.display = 'block';
    loginForm.style.display = 'none';

    lostDataLink.style.display = 'inline';
    saveDataLink.style.display = 'none';
}

function showLoginForm(userData) {
    loginForm.style.display = 'block';
    registrationForm.style.display = 'none';
    lostDataLink.style.display = 'none';
    saveDataLink.style.display = 'none';
    if(userData && previousUser && !loginUsernameInput.value) {
        loginUsernameInput.value = userData[previousUser]?.username;
        loginUsernameInput.title = userData[previousUser]?.seed;
    }
    hideParentDivElement(strongPasswordInput);
}



function setupEventListeners() {
    avatarUrlInput.addEventListener('change', updateAvatar);
    nameInput.addEventListener('change', updateUrl);
    startRegistrationButton.addEventListener('click', handleRegistration);
    cancelRegistrationButton.addEventListener('click', cancelRegistration);
    confirmButton.addEventListener('click', handleConfirmation);
    doneButton.addEventListener('click', handleDone);
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', showRegistrationForm);
    deleteUserDataButton.addEventListener('click', handleDeleteUserData);
    lostDataLink.addEventListener('click', () => uploadJsonFile.click());
    uploadJsonFile.addEventListener('change', handleFileUpload);
    saveDataLink.addEventListener('click', handleSaveData);

    passwordInput.addEventListener('focus',resetKeyTimes);
    passwordInput.addEventListener('keydown', addKeyTime);
    passwordInput.addEventListener('keypress', addKeyTime);
    passwordInput.addEventListener('keyup', addKeyTime);
    passwordInput.addEventListener('input', handlePasswordInput);

    confirmPasswordInput.addEventListener('focus', resetKeyTimes);
    confirmPasswordInput.addEventListener('keydown', addKeyTime);
    confirmPasswordInput.addEventListener('keyup', addKeyTime);
    confirmPasswordInput.addEventListener('input', handlePasswordInput);

    loginUsernameInput.addEventListener('change', checkUserProfile);
    loginPasswordInput.addEventListener('focus', handleLoginPasswordFocus);
    loginPasswordInput.addEventListener('keydown', addKeyTime);
    loginPasswordInput.addEventListener('keyup', addKeyTime);
    loginPasswordInput.addEventListener('input', handleLoginPasswordInput);
    loginPasswordInput.addEventListener('change', handleLoginPasswordChange);


    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.addEventListener('mouseenter', () => input.type = 'text');
        input.addEventListener('mouseleave', () => input.type = 'password');
    });

    console.log("Event listeners initialized for registration and login.");
}

function setupModalEvents() {
    viewTimingIcon.addEventListener('click', handleViewTiming);
    loginPasswordEntropy.addEventListener('click', () => handleEntropyClick(loginPasswordInput.value));
    strongPasswordEntropy.addEventListener('click', () => handleEntropyClick(strongPasswordInput.value));
    closeModal.onclick = closeModalPopup;
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModalPopup();
        }
    };
}

// Function to close modal
function closeModalPopup() {
    modal.style.display = 'none';
    modalContent.innerHTML = '';  // Clear modal content
}

async function handlePasswordInput(e) {
    const intervals = getIntervals();
    if (intervals) {
        intervalGraph.style.display = 'block';
        drawIntervalGraph(intervals, intervalGraph);
    }
    if (e.target.id === 'passwordInput') {
      document.getElementById('passwordLength').textContent = `${e.target.value.length}ch`;
    } else if (e.target.id === 'confirmPasswordInput') {
        confirmButton.disabled = false;
    }

}

async function handleLoginPasswordInput() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
        const username = loginUsernameInput.value;
        const easyPassword = loginPasswordInput.value;
        const entropyResult = zxcvbn(easyPassword);
        document.getElementById('loginPasswordEntropy').textContent = `${Math.log2(2 * entropyResult.guesses - 1).toFixed(2)}bits`;
        const passwordCrackTime10Seconds = entropyResult.guesses / 10;
        const passwordCrackTime10KSeconds = entropyResult.guesses / (10 * 1000);
        const passwordCrackTime10BSeconds = entropyResult.guesses / (10 * 1000 * 1000 * 1000);

        const passwordCrackTime10Hours = passwordCrackTime10Seconds / (60 * 60);
        const passwordCrackTime10Days  = passwordCrackTime10Seconds / (24 * 60 * 60);

        const passwordCrackTime10KHours = passwordCrackTime10KSeconds / (60 * 60);
        const passwordCrackTime10KYears = passwordCrackTime10KSeconds / (365 * 24 * 60 * 60);
        loginPasswordInput.title = `crackTime: ${passwordCrackTime10Days.toFixed(2)} days (${entropyResult.guesses} @ 10 Hashes/sec)`;

        if (userData[username].seed) {
            const strongPassword = await hashPasswordWithSeed(easyPassword, userData[username].seed, 3 * easyPassword.length);
            strongPasswordInput.value = strongPassword;

            const zxcvbnResult = zxcvbn(strongPassword);
            const strongCrackTime10BSeconds = zxcvbnResult.guesses / (10 * 1000 * 1000 * 1000);
            const strongCrackTimeYears = strongCrackTime10BSeconds / (365 * 24 * 60 * 60);

            updateGauge(strongGaugeDiv, zxcvbnResult.guesses);
            document.getElementById('strongPasswordEntropy').textContent = `${Math.log2(2 * zxcvbnResult.guesses - 1).toFixed(2)}bits`;
            strongGaugeDiv.title = `crackTime: ${strongCrackTimeYears.toFixed(2)} years`;
            strongPasswordInput.title = `crackTime: ${strongCrackTimeYears.toFixed(2)} years`;
        } else {
            console.log({warning: "no seed", username: username, data: userData[username]});
        }
    }
}

function handleLoginPasswordChange(e) {
  console.log(e.target.id, 'Changed')
}

async function handleViewTiming() {
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;
    const { success, features, intervals } = await collectTiming(username, password);
    if (success) {
        await openModalWithTimingGraph(features, intervals);
    } else {
        console.error('Error collecting timing data for modal.');
    }
}

function handleEntropyClick(password) {
    const result = zxcvbn(password);
    displayZxcvbnResult(result, password);
}


function checkUserProfile() {
   const username= loginUsernameInput.value
   const existingUserData= JSON.parse(localStorage.getItem("user")) || {};
    console.log('checking userProfile for %s:',username, existingUserData);
    hideParentDivElement(strongPasswordInput);

   if (existingUserData[username]) {
       // login Button Active
       loginPasswordInput.disabled= false; 
       loginButton.disabled= false; 
       registerButton.style.display= "none"; 
       loadDecisionTree(existingUserData[username].trainingData);

   } else { 
       // disable Login Button
       loginPasswordInput.disabled= true; 
       loginButton.disabled= true; 
       registerButton.style.display= "inline-block"; 
       if (username) {
          document.getElementById('usernameInput').value = username;
       }
   }
}

function hideParentDivElement(element) {
    const parentDiv = element.parentElement;
    if (parentDiv) {
        parentDiv.style.display = 'none';
    }
}
function showParentDivElement(element) {
    const parentDiv = element.parentElement;
    if (parentDiv) {
        parentDiv.style.display = 'block';
    }
}


function handleLoginPasswordFocus(e) {
    resetKeyTimes(e);
    resultDiv.innerHTML = `${e.target.id}`;
    showParentDivElement(strongPasswordInput);

    /*
    // Show the parent div again when focus is lost
    e.target.addEventListener('blur', () => {
        const parentDiv = strongPasswordInput.parentElement;
        if (parentDiv) {
            parentDiv.style.display = 'block';
        }
    }, { once: true });
    */
}


function loadDecisionTree(userTrainingData) {

    if (userTrainingData) {
        const userTrainingLabels= userTrainingData.map(() => 'legitimate');
        console.debug({userTrainingData,userTrainingLabels});

        trainDecisionTreeWithFakeData(userTrainingData, userTrainingLabels);
        visualizeTree(treeVisualizationDiv, decisionTree); // Visualize the decision tree
    }

}



function setupPasswordInputEvents(inputElement) {
    inputElement.addEventListener('keydown', addKeyTime);
    inputElement.addEventListener('keyup', addKeyTime);
    inputElement.addEventListener('focus', resetKeyTimes);
    inputElement.addEventListener('input', handlePasswordInput);
}

function updateUrl(event) {
    const name = event.target.value;
    console.log({name});
        const avatarImg = document.querySelector('#registrationForm img');
        const avatarUrlInput = document.getElementById('avatarUrlInput');
    if (avatarImg && avatarUrlInput) { // Ensure elements exist
        if (/shane/i.test(name)) { // Corrected regex test
            avatarUrlInput.value = 'shanepic.png';
            avatarImg.src = 'shanepic.png';
        } else if (/michel/i.test(name)) {
            avatarUrlInput.value = 'michelpic.png';
            avatarImg.src = 'michelpic.png';
        } else if (/anon/i.test(name)) {
            avatarUrlInput.value = 'photo.svg';
            avatarImg.src = 'photo.svg';
        }
    }
}

function updateAvatar(event) {
    const url = event.target.value;
    //const avatarImg = document.querySelectorAll('#registrationForm img');
    const avatarImg = document.querySelector('#registrationForm img');
    if (url) {
        avatarImg.src = url;
    }
    //avatarImg.src = url || 'user_1f464.svg'
    console.log(avatarImg);
    return url
}

function handleRegistration() {
    registrationForm.style.display = 'none';
    confirmationForm.style.display = 'block';
    confirmButton.disabled = true;
    doneButton.disabled = true;
    displayMessage(confirmMessage, 'Please enter and confirm your password for timing collection.', 'info', 4000);
}

async function handleDone(e) {
    const username = document.getElementById('usernameInput').value || 'anon';
    const password = passwordInput.value;
    if (sampleCount >= requiredSamples) {
        const existingUserData = JSON.parse(localStorage.getItem('user')) || {};
        const seed = generateRandomSeed();
        const prefix = await pwnedPrefix(password);
        const currentUserProfile = {
            username: username,
            prefix: prefix,
            //url: document.querySelector('#registrationForm img').src || 'photo.svg',
            avatar: document.getElementById('avatarUrlInput').value || 'photo.svg',
            name: document.getElementById('nameInput').value || 'Anonymous',
            dob: document.getElementById('dobInput').value || '...',
            phone: document.getElementById('phoneInput').value || '',
            address: document.getElementById('addrInput').value || '',
            email: document.getElementById('emailInput').value || username + '+' + prefix + '@SecureMy.digital',
            functions: document.getElementById('funcInput').value || username
        };

        existingUserData[username] = {
            seed: seed,
            profile: currentUserProfile,
            trainingData: trainingData
        };
        localStorage.setItem('user', JSON.stringify(existingUserData));
        console.debug({existingUserData});

        trainDecisionTreeWithFakeData(trainingData, trainingLabels);

        confirmationForm.style.display = 'none';
        loginPasswordInput.disabled= false; 
        loginButton.disabled= false; 
        loginForm.style.display = 'block';
        registerButton.style.display= "none"; // do we allow changes in registration, or continue training ... ?
        displayMessage(loginMessage, 'Registration complete. You can now log in.', 'success', 3000);
    }

}
async function handleConfirmation(e) {
    const username = document.getElementById('usernameInput').value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        displayMessage(confirmMessage, 'Passwords do not match!', 'error', 3000);
        confirmPasswordInput.value = '';
        confirmPasswordInput.focus();
        return;
    }

    const { success, features, intervals } = await collectTiming(username, password);
    
    if (success) {
        trainingData.push(features);
        trainingLabels.push('legitimate');
        sampleCount++;
        displayMessage(confirmMessage, `Sample ${sampleCount} recorded.`, 'success', 2000);
        sampleCounter.textContent = `Samples: ${sampleCount} / ${requiredSamples}`;

        if (sampleCount >= requiredSamples) {
            doneButton.disabled = false;
        } else {
            doneButton.disabled = true;
        }
        // passwordInput.value = '';
        confirmPasswordInput.value = '';
        resetKeyTimes(e);
        confirmPasswordInput.focus();
    } else {
        displayMessage(confirmMessage, 'Error collecting timing data.', 'error', 3000);
    }
}

function trainDecisionTreeWithFakeData(userTrainingData, userTrainingLabels) {
    const fakeSamplesArray= fakeSamples(userTrainingData); // Assuming fakeSamples generates an array of fake samples
    const fakeSampleData = fakeSamplesArray.map(({ label, ...rest }) => rest);
    const fakeSampleLabels = fakeSamplesArray.map(item => item.label);
    //const fakeSampleLabels = [...Array(fakeSamplesArray.length).fill("illegitimate")];

   // Combine legitimate and fake data for training
   const trainingData= [ ...userTrainingData, ...fakeSampleData ];
   const trainingLabels= [ ...userTrainingLabels, ...fakeSampleLabels ];
   //const trainingData= [...fakeSampleData, ...userTrainingData];
   //const trainingLabels= [...fakeSampleLabels, ...userTrainingLabels];

   decisionTree.train(trainingData, trainingLabels); // Train the decision tree with combined data

   visualizeTree(treeVisualizationDiv, decisionTree); // Visualize the decision tree

   console.log("Decision tree trained with legitimate and fake data.");
}

async function handleLogin(e) {
   const username= loginUsernameInput.value; 
   const password= loginPasswordInput.value;

   if (!username || !password) { 
       displayMessage(loginMessage, "Please enter both username and password.", "error", 3000); 
       return; 
   }
   previousUser = username;

   const userData= JSON.parse(localStorage.getItem("user")); 
   console.debug('%s userData for %s:',e.target.id,username,userData)
   if (!userData || !userData[username]) { 
       displayMessage(loginMessage, "User not found. Please register first.", "error", 3000); 
       /* TBD: enable register button ? */
       return; 
   }

   const strongPassword= await hashPasswordWithSeed(password, userData[username].seed); 
   const { success, features, }= await collectTiming(username, password);

   if (success) { 
       if (!decisionTree.tree) {
         loadDecisionTree(userData[username].trainingData);
       } else {
           console.debug(decisionTree);
       }
       const prediction= decisionTree.predict(features); 
       const loginStatus= prediction === "legitimate"
           ? `Successfully logged in on ${new Date().toLocaleDateString()}`
           : `Failed to log in on ${new Date().toLocaleDateString()} (${prediction})`;

       await displayUserProfileSVG(userData[username].profile, prediction, loginStatus); // Always display SVG regardless of success

       if (prediction === "legitimate") { 
           console.log('Login successful:', username);
           displayMessage(loginMessage, "Login successful!", "success", 3000); 
           lostDataLink.style.display = 'none';
           saveDataLink.style.display = 'inline';
       } else { 
           displayMessage(loginMessage, "Login failed. Unusual typing pattern detected.", "error", 3000); 
       }
   } else { 
       displayMessage(loginMessage, "Error collecting timing data.", "error", 3000); 
   }
}


function handleDeleteUserData() {
   const username = loginUsernameInput.value;
   let userData = JSON.parse(localStorage.getItem("user")) || {};

   if (username && userData[username]) { 
       delete userData[username]; 

       if (Object.keys(userData).length === 0) { // If no users left
           localStorage.removeItem("user"); // Remove entire user storage
       } else { // Update localStorage with remaining users
           localStorage.setItem("user", JSON.stringify(userData)); 
       }

       displayMessage(loginMessage, `User data for ${username} deleted.`, "info", 3000); 

   } else if (Object.keys(userData).length > 0) { // If there are users but no matching username
       localStorage.removeItem("user"); // Remove all user data
       displayMessage(loginMessage, "All user data deleted.", "error", 6000); 

   } else { // If no user data exists at all
       displayMessage(loginMessage, "No user data to delete.", "info", 3000); 
   }

   // Reset input fields and UI state
   loginUsernameInput.value= ""; 
   loginPasswordInput.value= ""; 

   loginPasswordInput.disabled= true; 
   loginButton.disabled= true; 

   sampleCount= 0; 
   trainingData= []; 
   trainingLabels= []; 

   updateDataManagementLinks(); // Update visibility of data management links
}

function updateDataManagementLinks() {
   const userData= JSON.parse(localStorage.getItem("user")); 

   if (userData && Object.keys(userData).length > 0) { // If there are users stored
       lostDataLink.style.display= "none"; 
       saveDataLink.style.display= "inline"; 

   } else { // If no users are stored
       lostDataLink.style.display= "inline"; 
       saveDataLink.style.display= "none"; 
   }
}

// Utility functions
function displayMessage(element, message, type, duration) {
   element.textContent= message; 
   element.className= `message ${type}`; 

   setTimeout(() => { // Clear message after timeout
       element.textContent= ""; 
       element.className= "message"; 
   }, duration); 
}


function generateRandomSeed() {
    if (crypto) {
        const randomBytes = crypto.getRandomValues(new Uint8Array(48)); // 384bits
        const value = randomBytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
        return value.toString(36).padStart(56, '0');
    } else { // fallback
        console.error("no crypto: fallback random");
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Generate a random seed for hashing passwords
    }
}

async function displayUserProfileSVG(userProfile, prediction, loginStatus) {
    try {
        console.debug({userProfile});
        const response= await fetch('./smd-green-user-bcard.svg'); // Fetch SVG file for user profile card
        let svgText= await response.text();

        const date= new Date().toLocaleDateString(); // Get current date for SVG

        // Determine visibility of elements based on conditions
        const easypass= loginPasswordInput.value; // Get entered password for checks
        const prefix= await pwnedPrefix(easypass); // Check if password has been compromised
        console.log('prefix:',prefix);

        svgText= svgText.replace(/id="falsepos"/g,
            (prefix !== userProfile.prefix && prediction === 'legitimate') ? 'id="falsepos" visibility="visible"' : 'id="falsepos" visibility="hidden"'
        );
        svgText= svgText.replace(/id="silent"/g,
            prefix === silent_prefix ? 'id="silent" visibility="visible"' : 'id="silent" visibility="hidden"'
        );

        svgText= svgText.replace(/id="denied"/g,
            prediction !== 'legitimate' ? 'id="denied" visibility="visible"' : 'id="denied" visibility="hidden"'
        );
        svgText= svgText.replace(/id="redaction"/g,
            prediction !== 'legitimate' ? 'id="redaction" visibility="visible"' : 'id="redaction" visibility="hidden"'
        );

        svgText= svgText.replace(/{prefix}/g, prefix); // Replace placeholders with actual values
        svgText= svgText.replace(/{prediction}/g, prediction); // Replace placeholders with actual values
        svgText= svgText.replace(/{login-status}/g, loginStatus);
        svgText= svgText.replace(/{status-color}/g, prediction === 'legitimate' ? '#008000' : '#800000');
        svgText= svgText.replace(/{easypass}/g, easypass || 'password⎵123'); // Default value if no password entered
        svgText= svgText.replace(/{DATE}/g, date || 'Today');

        svgText= svgText.replace(/{username}/g,
            userProfile.username || 'Guest'
        );

        svgText= svgText.replace(/{name}/g,
            userProfile.name || 'Anonymous'
        );

        svgText= svgText.replace(/{functions}/g,
            userProfile.functions || 'Co-Founder'
        );
        svgText= svgText.replace(/data:image\/png;base64,avatar\+ImgUrl&#10;/g,
            userProfile.avatar || userProfile.url || 'user_1f464.svg'
        );

        svgText= svgText.replace(/{dob}/g,
            userProfile.dob || '[DateOfBirth]'
        );

        svgText= svgText.replace(/{phone}/g,
            userProfile.phone || '[PhoneNumber]'
        );
        const email = (userProfile.email || 'shane@securemy.digital').replace(/(?:\+.*)?@/,`+${prefix}@`);
        svgText= svgText.replace(/{email}/g, email
        );

        svgText= svgText.replace(/{address}/g,
            userProfile.address || '[Street Address]'
        );

        svgText= svgText.replace(/{website}/g,
            userProfile.website || 'https://SecureMy.digital'
        );

        resultDiv.innerHTML = svgText; // Append modified SVG content to result div

    } catch (error) {
         console.error("Error fetching or displaying SVG:", error);
         displayMessage(loginMessage,"Error displaying profile information.","error",3000); // Display error message on failure to fetch SVG
     }
}


function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const userData = JSON.parse(e.target.result);
        localStorage.setItem('user', JSON.stringify(userData));
        initialize(); // make sure there is no eventListener set
        displayMessage(loginMessage, 'User data restored successfully.', 'success', 3000);
    };

    reader.readAsText(file);
}

function handleSaveData() {
    const userDataString = localStorage.getItem('user');
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(userDataString)}`;
    viewDataLink.setAttribute('href', dataUrl);
    downloadDataLink.setAttribute('href', dataUrl);
    downloadDataLink.setAttribute('download', 'user_data.json');
}



async function openModalWithTimingGraph(features, intervals) {

    // Set up modal content with timing graph and features
    modalContent.innerHTML = `
        <h3>Login Password Timing Graph</h3>
        <canvas id="timingGraphCanvas" width="400" height="100"></canvas>
        <div id="featureList"></div>
    `;
    
    // Draw the timing intervals in the graph
    const canvas = document.getElementById('timingGraphCanvas');
    drawIntervalGraph(intervals, canvas);

    // Display extracted features
    const featureDiv = document.getElementById('featureList');
    displayFeatures(featureDiv, features);

    // Show the modal
    modal.style.display = 'block';

}

// Draw timing intervals on the provided canvas
function drawIntervalGraph(intervals, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / intervals.length;
    const maxInterval = Math.max(...intervals);
    ctx.fillStyle = '#4a90e2';

    intervals.forEach((interval, index) => {
        const barHeight = (interval / maxInterval) * canvas.height;
        ctx.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    });
}

function displayZxcvbnResult(result, strongPassword) {

    const log10Guesses = Math.log10(result.guesses);
    const qm = 'QmRHZotFEHvgSwe69awUDs4igYgQFsnjiiBjFm9t1dWG2H';
    const adoptString = `Secure your password with <a href="https://ipfs.safewatch.care/ipfs/${qm}/popup/popup.html">SMD password manager</a>.`;

    if (result.feedback.suggestions.length !== 0) {
        result.feedback.suggestions.push(`we suggest you use a stronger password like "${strongPassword}" for its strength`);
        result.feedback.suggestions.push('or better: ' + adoptString);
    }

    const crackTime10B = result.guesses / (10 * 1000 * 1000 * 1000);
    modalContent.innerHTML = `
        <h3>zxcvbn Results:</h3>
        <p>Score: ${result.score}/4<br>
           Estimated crack time: ${result.crack_times_display.offline_slow_hashing_1e4_per_second}<br>
           Log10 Guesses: ${log10Guesses.toFixed(2)}<br>
           Time to crack at 10B/s: ${crackTime10B.toFixed(2)} seconds</p>
        <table>
            <tr>
                <th>Attack Scenario</th>
                <th>Guesses</th>
                <th>Crack Time</th>
            </tr>
            <tr>
                <td>100 / hour <small>(throttled online attack)</small></td>
                <td>10<sup>${log10Guesses.toFixed(2)}</sup></td>
                <td>${result.crack_times_display.online_throttling_100_per_hour}</td>
            </tr>
            <tr>
                <td>10 / second <small>(unthrottled online attack)</small></td>
                <td>10<sup>${log10Guesses.toFixed(2)}</sup></td>
                <td>${result.crack_times_display.online_no_throttling_10_per_second}</td>
            </tr>
            <tr>
                <td>10k / second <small>(offline attack, slow hash, many cores)</small></td>
                <td>10<sup>${log10Guesses.toFixed(2)}</sup></td>
                <td>${result.crack_times_display.offline_slow_hashing_1e4_per_second}</td>
            </tr>
            <tr>
                <td>10B / second <small>(offline attack, fast hash, many cores)</small></td>
                <td>10<sup>${log10Guesses.toFixed(2)}</sup></td>
                <td>${result.crack_times_display.offline_fast_hashing_1e10_per_second}</td>
            </tr>
        </table>
        <p>Feedback: ${result.feedback.warning || 'No specific warnings'}</p>
        <p>Suggestions: ${result.feedback.suggestions.join(', ') || adoptString}</p>
    `;
    modal.style.display = 'block';

}


// Hashes the password combined with the seed and encodes it with emojis
async function hashPasswordWithSeed(password, seed, length = 18) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + seed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return mojiString(hashBuffer,length);
}

