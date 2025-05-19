// Tabs
function openTab(evt, tabName) {
    var i, tabcontent, headerLinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Update to handle header links
    headerLinks = document.querySelectorAll(".app-links a");
    for (i = 0; i < headerLinks.length; i++) {
        headerLinks[i].classList.remove("active-link");
    }

    document.getElementById(tabName).style.display = "block";
    // evt.currentTarget will be the clicked <a> tag from the header
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active-link");
    }
    
    // If switching to Key Concepts tab, initialize glossary immediately
    if (tabName === 'KeyConcepts') {
        console.log("Switched to Key Concepts tab - initializing glossary");
        
        // First ensure terms exist
        ensureTermsExist();
        
        // Force immediate initialization with a delay to ensure DOM is ready
        setTimeout(() => {
            forceGlossaryInitialization();
            
            // Find the glossary collapsible and open it if needed
            const collapsibles = document.querySelectorAll('button.collapsible');
            collapsibles.forEach(collapsible => {
                const content = collapsible.nextElementSibling;
                if (content && content.querySelector('.glossary-container')) {
                    console.log("Found glossary collapsible");
                    
                    // If not already open, click it
                    if (!collapsible.classList.contains('active-collapsible')) {
                        console.log("Opening glossary collapsible");
                        collapsible.click();
                    }
                }
            });
            
            // Make sure search and filter buttons are initialized
            const searchInput = document.getElementById('glossary-search');
            if (searchInput) {
                // Clone to remove any old event listeners
                const newSearch = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearch, searchInput);
                newSearch.addEventListener('input', filterGlossary);
            }
            
            const filterButtons = document.querySelectorAll('.glossary-filter-button');
            filterButtons.forEach(button => {
                // Clone to remove old listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', function() {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    filterGlossary();
                });
            });
            
            // Add the reload button
            addGlossaryReloadButton();
        }, 100);
    }
}

// Collapsibles
document.addEventListener('DOMContentLoaded', function() {
    var coll = document.getElementsByClassName("collapsible");
    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active-collapsible");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
    
    // Initialize header navigation
    const appNavLinks = document.querySelectorAll('.app-links a');
    appNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor jump
            const tabName = this.getAttribute('href').substring(1);
            openTab(event, tabName); // Pass the event so currentTarget is the link
        });
    });

    // Initialize first tab using the header navigation
    const firstHeaderLink = document.querySelector('.app-links a');
    if (firstHeaderLink) {
        // Simulate a click event or directly call openTab
        // To ensure evt.currentTarget is set, we can call openTab directly
        // and manually set the active class for the first link if openTab doesn't get a proper event.
        const firstTabName = firstHeaderLink.getAttribute('href').substring(1);
        
        // Create a mock event for the first tab activation
        const mockEvent = { currentTarget: firstHeaderLink };
        openTab(mockEvent, firstTabName);
    } else {
        // Fallback if no header links are found (should not happen in current setup)
        const firstTabContent = document.querySelector('.tab-content');
        if (firstTabContent) {
            firstTabContent.style.display = 'block';
        }
    }
});

// Modals
function showModal(modalId, title, codeContent) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with id "${modalId}" not found`);
        return;
    }
    
    if (modalId === 'apiModal') {
        document.getElementById('modalTitle').innerText = title || "API Details";
        document.getElementById('modalCode').innerText = codeContent || "{\n  \"example\": \"No specific content loaded.\"\n}";
    }
    
    // Different display method based on modal type
    if (modal.classList.contains('term-modal')) {
        modal.classList.add('active');
    } else {
        modal.style.display = "block";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with id "${modalId}" not found`);
        return;
    }
    
    // Handle both style methods for maximum compatibility
    modal.style.display = "none";
    modal.classList.remove('active');
}

window.onclick = function(event) {
    // Close regular modals when clicking outside
    const modals = document.getElementsByClassName('modal');
    for (let i=0; i<modals.length; i++) {
        if (event.target == modals[i]) {
            modals[i].style.display = "none";
        }
    }
    
    // Close term modals when clicking outside
    const termModals = document.getElementsByClassName('term-modal');
    for (let i=0; i<termModals.length; i++) {
        if (event.target == termModals[i]) {
            termModals[i].style.display = "none";
            termModals[i].classList.remove('active');
        }
    }
}

// Dummy modal content functions
function showViewBinApiModal() {
     showModal('apiModal', 'View BINs - API Details', 
`// Service Endpoint: GetAllBins
// Example URL (Dev):
// https://bin-table-management.../api/v1/bintables/bins/getallbins
// Input: Optional query parameters for search
// Output (Example Structure):
[
  {
    "binId": "guid-string-1",
    "binNumber": "12345678",
    "binType": "Domestic, On-Us",
    "actionDate": "YYYY-MM-DD",
    "capturedDate": "YYYY-MM-DDTHH:mm:ss",
    "capturedBy": "AB12345",
    "reviewStatus": "Approved",
    "outcome": "Added",
    // ... other fields
  },
  // ... more bin objects
]`);
}

function showAtmApiModal() {
    showModal('apiModal', 'ATM Download API Flow',
`// 1. ATM to BinTable Service: Request Download
// Endpoint: .../downloadbintable?devicename=<string>&deviceVersionNumber=<integer>
// Response:
{
  "data": {
    "binTableDomestic": "base64String...",
    "binTableOnUs": "base64String...",
    // ... other BINtypes
    "binTableToken": "base64String..."
  },
  "serverVersion": 123,
  "checkSum": "hmacChecksumString"
}

// 2. ATM to BinTable Service: Confirm Download
// Endpoint: .../confirmdownload
// Request Body (Example):
{
  "deviceName": "ATM001",
  "isSuccessfulHandshake": true,
  "isSuccessfulDownload": true,
  "handshakeError": null, // Or error object if failed
  "downloadError": null   // Or error string if failed
}`);
}

// Role Explorer
const roleDetails = {
    capturer: "<strong>Capturer:</strong> Responsible for inputting and managing BIN data before approval. Can Add, Edit, Delete (soft), Reactivate BINs. Views dashboard and BINtypes. Actions rejected BINs.",
    approver: "<strong>Approver:</strong> Reviews BINs submitted by Capturers. Can Approve or Reject BINs. Views dashboard and BINtypes.",
    administrator: "<strong>Administrator (Superuser):</strong> Has all Capturer and Approver rights. Additionally, can manage BINtypes (Add, Edit, Delete BINtypes).",
};

function showRoleInfo(role) {
    const displayDiv = document.getElementById('role-info-display');
    displayDiv.innerHTML = roleDetails[role] || "Select a role to see details.";
    displayDiv.style.display = 'block';
}

// Quiz Logic
const correctAnswers = { q1: "b", q2: "c", q3: "c", q4: "b", q5: "c" };

function submitQuiz() {
    let score = 0;
    const questions = Object.keys(correctAnswers);
    questions.forEach(qId => {
        const feedbackEl = document.getElementById(qId + '-feedback');
        const selectedOption = document.querySelector(`input[name="${qId}"]:checked`);
        if (selectedOption) {
            if (selectedOption.value === correctAnswers[qId]) {
                score++;
                feedbackEl.textContent = "Correct!";
                feedbackEl.className = "quiz-feedback correct";
            } else {
                feedbackEl.textContent = "Incorrect. The correct answer was option " + correctAnswers[qId].toUpperCase() + ".";
                feedbackEl.className = "quiz-feedback incorrect";
            }
        } else {
            feedbackEl.textContent = "Please select an answer.";
            feedbackEl.className = "quiz-feedback incorrect";
        }
    });
    document.getElementById('quiz-score').textContent = score + "/" + questions.length;
}

// Glossary Term Definitions with categories
const terms = {
    "BIN": {
        definition: "Bank Identification Number. The initial (typically 8) digits of a payment card number that identifies the institution that issued the card.",
        category: "bin"
    },
    "BIN Table": {
        definition: "A database that associates each BIN with its respective issuer and related card information (e.g., card type, country).",
        category: "bin"
    },
    "PASA": {
        definition: "Payments Association of South Africa. An industry body that, in this context, provides updates to BIN lists.",
        category: "process"
    },
    "UAT": {
        definition: "User Acceptance Testing. A phase of software testing in which actual users test the software to see if it meets their requirements.",
        category: "process"
    },
    "APC Portal": {
        definition: "Alternative Physical Channels Portal. The central web interface for managing BIN tables in the new system.",
        category: "tech"
    },
    "MVP": {
        definition: "Minimum Viable Product. A version of a new product with just enough features to be usable by early customers who can then provide feedback for future product development.",
        category: "process"
    },
    "ADFS": {
        definition: "Active Directory Federation Services. A Microsoft software component for providing users with single sign-on access to systems and applications located across organizational boundaries.",
        category: "tech"
    },
    "API": {
        definition: "Application Programming Interface. A set of rules and protocols for building and interacting with software applications.",
        category: "tech"
    },
    "XML": {
        definition: "Extensible Markup Language. A markup language designed to carry data, not to display data.",
        category: "tech"
    },
    "JSON": {
        definition: "JavaScript Object Notation. A lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate.",
        category: "tech"
    },
    "SSO": {
        definition: "Single Sign-On. An authentication scheme that allows a user to log in with a single ID and password to any of several related, yet independent, software systems.",
        category: "tech"
    },
    "BINtype": {
        definition: "A classification or category for BINs, such as 'Domestic', 'On-Us', 'Invalid', 'Contactless', 'Token'. Each BINtype may correspond to a separate file or section in the BinTable.",
        category: "bin"
    },
    "ATM": {
        definition: "Automated Teller Machine. A banking device that allows customers to perform financial transactions without a human teller.",
        category: "process"
    },
    "HMAC": {
        definition: "Hash-based Message Authentication Code. A specific type of message authentication code involving a cryptographic hash function and a secret key, used in the BIN Table system for data integrity verification.",
        category: "tech"
    },
    "APC": {
        definition: "Alternative Physical Channels. Refers to non-traditional banking channels like ATMs, self-service kiosks, etc.",
        category: "process"
    },
    "Checksum": {
        definition: "A small-sized block of data derived from another block of digital data for the purpose of detecting errors that may have been introduced during its transmission or storage.",
        category: "tech"
    },
    "DB": {
        definition: "Database. An organized collection of structured information or data, electronically stored in a computer system.",
        category: "tech"
    },
    "Redis": {
        definition: "An open-source, in-memory data structure store used as a database, cache, and message broker. Used in the BIN table system for caching data.",
        category: "tech"
    },
    "Token": {
        definition: "In the context of this project, it refers to a type of BIN used for tokenized payment methods, where a token replaces sensitive card data.",
        category: "bin"
    },
    "Capturer": {
        definition: "A user role in the APC Portal responsible for inputting and managing BIN data before approval. Can Add, Edit, Delete, and Reactivate BINs.",
        category: "process"
    },
    "Approver": {
        definition: "A user role in the APC Portal responsible for reviewing BINs submitted by Capturers. Can Approve or Reject BINs.",
        category: "process"
    },
    "Administrator": {
        definition: "A user role (Superuser) in the APC Portal with all Capturer and Approver rights, plus the ability to manage BINtypes.",
        category: "process"
    }
};

function showTerm(termKey) {
    console.log(`Showing term: ${termKey}`);
    
    // Make sure terms object exists
    if (typeof terms === 'undefined' || !terms) {
        console.error("Terms object not defined");
        ensureTermsExist();
    }
    
    const modal = document.getElementById('termModal');
    if (!modal) {
        console.error("Term modal not found");
        return;
    }
    
    const termInfo = terms[termKey];
    if (!termInfo) {
        console.error(`Term "${termKey}" not found in glossary`);
        return;
    }
    
    // Get category labels
    const categoryLabels = {
        'bin': 'BIN Related',
        'tech': 'Technical',
        'process': 'Process'
    };
    
    // Set the modal title
    const titleElement = document.getElementById('termModalTitle');
    if (titleElement) {
        titleElement.textContent = termKey;
    }
    
    // Create category badge for the modal
    const categoryBadgeHTML = `<span class="glossary-category-badge" style="position: static; display: inline-block; margin-bottom: 15px; background-color: rgba(${
        termInfo.category === 'bin' ? '198, 0, 0' : 
        termInfo.category === 'tech' ? '52, 152, 219' : 
        '46, 204, 113'
    }, 0.1); color: ${
        termInfo.category === 'bin' ? '#C60000' : 
        termInfo.category === 'tech' ? '#3498db' : 
        '#2ecc71'
    }; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">${categoryLabels[termInfo.category] || termInfo.category}</span>`;
    
    // Format the definition with the category badge
    const definitionEl = document.getElementById('termModalDefinition');
    if (definitionEl) {
        definitionEl.innerHTML = `
            ${categoryBadgeHTML}
            <p style="font-size: 1.1em; line-height: 1.6; margin-top: 10px;">${termInfo.definition}</p>
            <div style="margin-top: 20px; text-align: right;">
                <button id="copyModalTerm" style="padding: 8px 15px; background: #f5f5f5; border: none; border-radius: 20px; cursor: pointer; color: #555;">
                    Copy Definition
                </button>
            </div>
        `;
    }
    
    // Add copy functionality to the button
    setTimeout(() => {
        const copyBtn = document.getElementById('copyModalTerm');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const textToCopy = `${termKey}: ${termInfo.definition}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy Definition';
                    }, 1500);
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        }
    }, 100);
    
    // Display the modal with both methods for browser compatibility
    modal.style.display = "block";
    modal.classList.add('active');
}

// Initialize event listeners after document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Call init on DOMContentLoaded
    console.log("DOM content loaded");
    
    // First make sure terms are defined
    ensureTermsExist();
    
    // Then initialize the glossary
    initGlossary();
    
    // Add CSS animation for highlight
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes highlightGlossaryItem {
            0% { background-color: rgba(255, 245, 157, 0.5); }
            70% { background-color: rgba(255, 245, 157, 0.5); }
            100% { background-color: white; }
        }
        
        .highlight-item {
            animation: highlightGlossaryItem 1.5s ease-out;
        }
    `;
    document.head.appendChild(styleEl);
});

// Initialize the glossary collapsible special handler
function initGlossaryCollapsible() {
    const collapsibles = document.querySelectorAll('button.collapsible');
    collapsibles.forEach(collapsible => {
        const content = collapsible.nextElementSibling;
        if (content && content.querySelector('.glossary-container')) {
            console.log("Found glossary collapsible");
            
            // Special handler for glossary collapsible
            collapsible.addEventListener('click', function() {
                setTimeout(() => {
                    const openState = this.classList.contains('active-collapsible');
                    if (openState) {
                        // If opening the glossary, force initialization
                        forceGlossaryInitialization();
                    }
                }, 100);
            });
        }
    });
}

// Create alphabet index for glossary
function createAlphabetIndex() {
    console.log("Creating alphabet index");
    
    // Get the alphabet container
    const alphabetContainer = document.getElementById('glossary-alphabet');
    if (!alphabetContainer) {
        console.error("Alphabet container not found");
        return;
    }
    
    // Clear existing alphabet
    alphabetContainer.innerHTML = '';
    
    // Ensure terms exist
    ensureTermsExist();
    
    // Extract first letters of all terms
    const firstLetters = Object.keys(terms).map(term => term.charAt(0).toUpperCase());
    
    // Create a Set of unique letters
    const uniqueLetters = [...new Set(firstLetters)].sort();
    
    // Create the full alphabet (A-Z)
    const fullAlphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    
    // Add each letter to the alphabet index
    fullAlphabet.forEach(letter => {
        const letterDiv = document.createElement('a');
        letterDiv.className = 'alphabet-letter';
        letterDiv.textContent = letter;
        letterDiv.dataset.letter = letter;
        letterDiv.href = '#';  // Changed from #glossary-section-${letter}
        letterDiv.classList.add('alphabet-link');
        
        // Add disabled class if there are no terms for this letter
        if (!uniqueLetters.includes(letter)) {
            letterDiv.classList.add('disabled');
        }
        
        alphabetContainer.appendChild(letterDiv);
    });
    
    // Initialize click events
    initAlphabetIndex();
}

// Function to initialize the alphabet index click events
function initAlphabetIndex() {
    const alphabetLetters = document.querySelectorAll('.alphabet-letter');
    alphabetLetters.forEach(letter => {
        letter.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('disabled')) {
                return;  // Don't do anything for letters with no terms
            }
            
            const letterValue = this.dataset.letter;
            const glossaryGrid = document.getElementById('glossary-grid');
            if (!glossaryGrid) return;
            
            // Find all glossary items
            const glossaryItems = glossaryGrid.querySelectorAll('.glossary-item');
            
            // Find the first item that starts with this letter
            let targetItem = null;
            glossaryItems.forEach(item => {
                const term = item.dataset.term;
                if (term && term.charAt(0).toUpperCase() === letterValue) {
                    if (!targetItem && getComputedStyle(item).display !== 'none') {
                        targetItem = item;
                    }
                }
            });
            
            // Scroll to that item if found
            if (targetItem) {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Highlight briefly
                targetItem.classList.add('highlight-item');
                setTimeout(() => {
                    targetItem.classList.remove('highlight-item');
                }, 1500);
            }
        });
    });
}

// Function to filter glossary based on search input and category filter
function filterGlossary() {
    const searchInput = document.getElementById('glossary-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const activeFilter = document.querySelector('.glossary-filter-button.active')?.dataset.filter || 'all';
    
    const glossaryItems = document.querySelectorAll('.glossary-item');
    let visibleCount = 0;
    
    glossaryItems.forEach(item => {
        const term = item.dataset.term;
        const category = item.dataset.category;
        
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        const matchesSearch = !searchTerm || 
                             term.toLowerCase().includes(searchTerm) || 
                             item.textContent.toLowerCase().includes(searchTerm);
        
        if (matchesFilter && matchesSearch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show no results message if necessary
    const noResultsEl = document.querySelector('.no-terms-found');
    if (visibleCount === 0) {
        if (!noResultsEl) {
            const glossaryGrid = document.getElementById('glossary-grid');
            if (glossaryGrid) {
                glossaryGrid.innerHTML += `
                    <div class="no-terms-found">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>No terms found matching your criteria.</p>
                        <button id="resetGlossaryFilters" class="glossary-button">Reset Filters</button>
                    </div>
                `;
                
                document.getElementById('resetGlossaryFilters')?.addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    
                    document.querySelectorAll('.glossary-filter-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    const allFilter = document.querySelector('.glossary-filter-button[data-filter="all"]');
                    if (allFilter) allFilter.classList.add('active');
                    
                    populateGlossary();
                });
            }
        }
    } else if (noResultsEl) {
        noResultsEl.remove();
    }
    
    // Update alphabet index
    updateAlphabetIndexAvailability();
}

// Function to update which letters in the alphabet index are enabled
function updateAlphabetIndexAvailability() {
    const alphabetLetters = document.querySelectorAll('.alphabet-letter');
    const visibleItems = document.querySelectorAll('.glossary-item[style*="display: block"]');
    
    // Get first letters of visible items
    const visibleFirstLetters = [...visibleItems].map(item => {
        const term = item.dataset.term;
        return term.charAt(0).toUpperCase();
    });
    
    // Create a Set of unique letters
    const uniqueVisibleLetters = [...new Set(visibleFirstLetters)];
    
    // Update each alphabet letter
    alphabetLetters.forEach(letterDiv => {
        const letter = letterDiv.textContent;
        
        if (uniqueVisibleLetters.includes(letter)) {
            letterDiv.classList.remove('disabled');
        } else {
            letterDiv.classList.add('disabled');
        }
    });
}

// Glossary functionality
function initGlossary() {
    console.log("Initializing glossary...");
    
    // Check if glossary exists in the page
    const glossaryContainer = document.querySelector('.glossary-container');
    if (!glossaryContainer) {
        console.error("Glossary container not found");
        return;
    }
    
    console.log("Glossary container found");
    
    // Ensure terms exist
    ensureTermsExist();
    
    console.log(`Found ${Object.keys(terms).length} terms`);
    
    // Create/update the glossary components
    populateGlossary();
    createAlphabetIndex();
    
    // Set up search functionality
    const searchInput = document.getElementById('glossary-search');
    if (searchInput) {
        // Remove any existing event listeners by cloning the element
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        // Add event listener
        newSearchInput.addEventListener('input', filterGlossary);
    }
    
    // Set up filter buttons functionality
    const filterButtons = document.querySelectorAll('.glossary-filter-button');
    filterButtons.forEach(button => {
        // Remove any existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        // Add event listener
        newButton.addEventListener('click', function() {
            document.querySelectorAll('.glossary-filter-button').forEach(btn => 
                btn.classList.remove('active'));
            this.classList.add('active');
            filterGlossary();
        });
    });
    
    // Initialize glossary collapsible
    initGlossaryCollapsible();
    
    // Add reload button if it doesn't exist
    addGlossaryReloadButton();
    
    console.log("Glossary initialization complete");
}

// Populate glossary function
function populateGlossary() {
    console.log("Populating glossary...");
    
    // Get the proper container for the glossary cards
    const glossaryCardsContainer = document.getElementById('glossary-grid');
    if (!glossaryCardsContainer) {
        console.error('Glossary grid container not found');
        return;
    }
    
    // Clear the container
    glossaryCardsContainer.innerHTML = '';
    
    // Ensure terms exist
    ensureTermsExist();
    
    // Use the current filter settings
    const activeFilter = document.querySelector('.glossary-filter-button.active')?.dataset.filter || 'all';
    const searchInput = document.getElementById('glossary-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Filter and sort terms based on current filter and search
    const filteredTerms = Object.entries(terms).filter(([key, term]) => {
        const matchesFilter = activeFilter === 'all' || term.category === activeFilter;
        const matchesSearch = !searchTerm || 
                             key.toLowerCase().includes(searchTerm) || 
                             term.definition.toLowerCase().includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    }).sort((a, b) => a[0].localeCompare(b[0]));
    
    // Display message if no terms found
    if (filteredTerms.length === 0) {
        glossaryCardsContainer.innerHTML = `
            <div class="no-terms-found" style="text-align: center; padding: 30px; grid-column: 1/-1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px; color: #aaa;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style="font-size: 1.1em; color: #666;">No terms found matching your criteria.</p>
                <button id="resetGlossaryFilters" style="padding: 8px 16px; background: #eee; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Reset Filters</button>
            </div>
        `;
        
        document.getElementById('resetGlossaryFilters')?.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            
            document.querySelectorAll('.glossary-filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            const allFilter = document.querySelector('.glossary-filter-button[data-filter="all"]');
            if (allFilter) allFilter.classList.add('active');
            
            populateGlossary();
        });
        
        return;
    }
    
    console.log(`Creating ${filteredTerms.length} glossary items`);
    
    // Category labels mapping
    const categoryLabels = {
        'bin': 'BIN Related',
        'tech': 'Technical',
        'process': 'Process'
    };
    
    // Create the glossary items
    filteredTerms.forEach(([key, term]) => {
        // Create card element
        const card = document.createElement('div');
        card.className = `glossary-item ${term.category}`;
        card.dataset.term = key.toLowerCase();
        card.dataset.category = term.category;
        
        // Style for category badge based on category
        const badgeColor = term.category === 'bin' ? '#C60000' : 
                           term.category === 'tech' ? '#0070E0' : 
                           '#00A67E';
        
        const badgeBgColor = term.category === 'bin' ? 'rgba(198, 0, 0, 0.1)' : 
                             term.category === 'tech' ? 'rgba(0, 112, 224, 0.1)' : 
                             'rgba(0, 166, 126, 0.1)';
        
        // Build card HTML with inline styles for maximum reliability
        card.innerHTML = `
            <span class="glossary-category-badge" style="position: absolute; top: 12px; right: 12px; font-size: 0.7rem; padding: 4px 8px; border-radius: 12px; background-color: ${badgeBgColor}; color: ${badgeColor}; font-weight: 500;">
                ${categoryLabels[term.category] || term.category}
            </span>
            <span class="glossary-term" style="font-weight: 700; font-size: 1.1rem; margin: 15px 0 8px; display: block; padding: 10px 15px 0;">
                ${key}
            </span>
            <p style="margin: 0; color: #555; line-height: 1.5; padding: 0 15px 15px; font-size: 0.95rem;">
                ${term.definition.length > 120 ? term.definition.substring(0, 120) + '...' : term.definition}
            </p>
            <button class="glossary-copy" style="background: none; border: none; color: #666; padding: 4px 8px; margin: 0 15px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; align-self: flex-end;">
                Copy
            </button>
        `;
        
        // Add click handler to show modal for the whole card except copy button
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('glossary-copy')) {
                showTerm(key);
            }
        });
        
        // Add copy functionality
        const copyBtn = card.querySelector('.glossary-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent opening the modal
                
                // Copy to clipboard
                const textToCopy = `${key}: ${term.definition}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 1500);
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        }
        
        glossaryCardsContainer.appendChild(card);
    });
    
    // Add staggered animation effect
    const items = glossaryCardsContainer.querySelectorAll('.glossary-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
}

// Removed redundant createGlossaryItems function since it was incorporated into populateGlossary

// Add a reload button to the glossary search section
function addGlossaryReloadButton() {
    const searchWrapper = document.querySelector('.glossary-search-wrapper');
    if (!searchWrapper) return;
    
    // Check if the button already exists
    if (searchWrapper.querySelector('.glossary-reload-button')) return;
    
    // Create the button
    const reloadButton = document.createElement('button');
    reloadButton.className = 'glossary-reload-button';
    reloadButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.44-4.5M22 12.5a10 10 0 0 1-18.44 4.5"/>
        </svg>
    `;
    reloadButton.title = "Reload glossary terms";
    reloadButton.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        color: #777;
        padding: 5px;
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
    `;
    
    // Add click event
    reloadButton.addEventListener('click', function() {
        this.classList.add('rotating');
        ensureTermsExist();
        forceGlossaryInitialization();
        setTimeout(() => {
            this.classList.remove('rotating');
        }, 1000);
    });
    
    // Add the button to the search wrapper
    searchWrapper.appendChild(reloadButton);
    
    // Add rotation animation style
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .glossary-reload-button.rotating svg {
            animation: rotate-reload 1s ease;
        }
        @keyframes rotate-reload {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleEl);
}

// Force glossary initialization directly
function forceGlossaryInitialization() {
    console.log("Forcing glossary initialization");
    
    // Ensure terms exist
    ensureTermsExist();
    
    // Get the glossary container
    const glossaryContainer = document.querySelector('.glossary-container');
    if (!glossaryContainer) {
        console.error("Glossary container not found");
        return;
    }
    
    // Get the glossary grid
    const glossaryGrid = document.getElementById('glossary-grid');
    if (!glossaryGrid) {
        console.error("Glossary grid not found");
        return;
    }
    
    // Clear existing content
    glossaryGrid.innerHTML = '';
    
    console.log(`Creating ${Object.keys(terms).length} glossary items directly`);
    
    // Category labels mapping
    const categoryLabels = {
        'bin': 'BIN Related',
        'tech': 'Technical',
        'process': 'Process'
    };
    
    // Create all glossary items directly with maximum inline styling for reliability
    Object.entries(terms).forEach(([key, termInfo]) => {
        // Create the card element
        const card = document.createElement('div');
        
        // Apply classes and styling
        card.className = `glossary-item ${termInfo.category}`;
        card.dataset.term = key.toLowerCase();
        card.dataset.category = termInfo.category;
        card.style.cssText = `
            position: relative;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.05);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
            animation: cardFadeIn 0.4s forwards;
            opacity: 0;
        `;
        
        // Style for category badge based on category
        const badgeColor = termInfo.category === 'bin' ? '#C60000' : 
                          termInfo.category === 'tech' ? '#0070E0' : 
                          '#00A67E';
        
        const badgeBgColor = termInfo.category === 'bin' ? 'rgba(198, 0, 0, 0.1)' : 
                            termInfo.category === 'tech' ? 'rgba(0, 112, 224, 0.1)' : 
                            'rgba(0, 166, 126, 0.1)';
        
        // Build card HTML with inline styles for maximum reliability
        card.innerHTML = `
            <span style="position: absolute; top: 12px; right: 12px; font-size: 0.7rem; padding: 4px 8px; border-radius: 12px; background-color: ${badgeBgColor}; color: ${badgeColor}; font-weight: 500;">
                ${categoryLabels[termInfo.category] || termInfo.category}
            </span>
            <span style="font-weight: 700; font-size: 1.1rem; margin: 15px 0 8px; display: block; padding: 10px 15px 0;">
                ${key}
            </span>
            <p style="margin: 0; color: #555; line-height: 1.5; padding: 0 15px 15px; font-size: 0.95rem;">
                ${termInfo.definition.length > 120 ? termInfo.definition.substring(0, 120) + '...' : termInfo.definition}
            </p>
            <button class="glossary-copy" style="background: none; border: none; color: #666; padding: 4px 8px; margin: 0 15px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; align-self: flex-end;">
                Copy
            </button>
        `;
        
        // Add click handler for showing the term in modal (on whole card except copy button)
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('glossary-copy')) {
                showTerm(key);
            }
        });
        
        // Add click handler for the copy button
        const copyButton = card.querySelector('.glossary-copy');
        if (copyButton) {
            copyButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent opening the modal
                
                // Copy to clipboard
                const textToCopy = `${key}: ${termInfo.definition}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 1500);
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        }
        
        // Add to the grid
        glossaryGrid.appendChild(card);
    });
    
    // Add staggered animation
    const items = glossaryGrid.querySelectorAll('.glossary-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
    
    console.log(`Created ${Object.keys(terms).length} glossary items`);
    
    // Add alphabet index with a small delay to ensure terms are rendered
    setTimeout(() => {
        createAlphabetIndex();
        
        // Add the reload button
        addGlossaryReloadButton();
        
        // Initialize search and filter functionality
        const searchInput = document.getElementById('glossary-search');
        if (searchInput) {
            searchInput.addEventListener('input', filterGlossary);
        }
        
        const filterButtons = document.querySelectorAll('.glossary-filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterGlossary();
            });
        });
    }, 200);
}

// Ensure terms are defined
function ensureTermsExist() {
    // Check if terms is already defined
    if (typeof terms !== 'undefined' && terms && Object.keys(terms).length > 0) {
        console.log("Terms already defined with " + Object.keys(terms).length + " items");
        return;
    }
    
    console.warn("Terms not defined properly - creating new terms object");
    
    // Define terms if not already defined
    window.terms = {
        "BIN": {
            definition: "Bank Identification Number. The initial (typically 8) digits of a payment card number that identifies the institution that issued the card.",
            category: "bin"
        },
        "BIN Table": {
            definition: "A database that associates each BIN with its respective issuer and related card information (e.g., card type, country).",
            category: "bin"
        },
        "PASA": {
            definition: "Payments Association of South Africa. An industry body that, in this context, provides updates to BIN lists.",
            category: "process"
        },
        "UAT": {
            definition: "User Acceptance Testing. A phase of software testing in which actual users test the software to see if it meets their requirements.",
            category: "process"
        },
        "APC Portal": {
            definition: "Alternative Physical Channels Portal. The central web interface for managing BIN tables in the new system.",
            category: "tech"
        },
        "MVP": {
            definition: "Minimum Viable Product. A version of a new product with just enough features to be usable by early customers who can then provide feedback for future product development.",
            category: "process"
        },
        "ADFS": {
            definition: "Active Directory Federation Services. A Microsoft software component for providing users with single sign-on access to systems and applications located across organizational boundaries.",
            category: "tech"
        },
        "API": {
            definition: "Application Programming Interface. A set of rules and protocols for building and interacting with software applications.",
            category: "tech"
        },
        "XML": {
            definition: "Extensible Markup Language. A markup language designed to carry data, not to display data.",
            category: "tech"
        },
        "JSON": {
            definition: "JavaScript Object Notation. A lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate.",
            category: "tech"
        },
        "SSO": {
            definition: "Single Sign-On. An authentication scheme that allows a user to log in with a single ID and password to any of several related, yet independent, software systems.",
            category: "tech"
        },
        "BINtype": {
            definition: "A classification or category for BINs, such as 'Domestic', 'On-Us', 'Invalid', 'Contactless', 'Token'. Each BINtype may correspond to a separate file or section in the BinTable.",
            category: "bin"
        },
        "ATM": {
            definition: "Automated Teller Machine. A banking device that allows customers to perform financial transactions without a human teller.",
            category: "process"
        },
        "HMAC": {
            definition: "Hash-based Message Authentication Code. A specific type of message authentication code involving a cryptographic hash function and a secret key, used in the BIN Table system for data integrity verification.",
            category: "tech"
        },
        "APC": {
            definition: "Alternative Physical Channels. Refers to non-traditional banking channels like ATMs, self-service kiosks, etc.",
            category: "process"
        },
        "Checksum": {
            definition: "A small-sized block of data derived from another block of digital data for the purpose of detecting errors that may have been introduced during its transmission or storage.",
            category: "tech"
        },
        "DB": {
            definition: "Database. An organized collection of structured information or data, electronically stored in a computer system.",
            category: "tech"
        },
        "Redis": {
            definition: "An open-source, in-memory data structure store used as a database, cache, and message broker. Used in the BIN table system for caching data.",
            category: "tech"
        },
        "Token": {
            definition: "In the context of this project, it refers to a type of BIN used for tokenized payment methods, where a token replaces sensitive card data.",
            category: "bin"
        },
        "Capturer": {
            definition: "A user role in the APC Portal responsible for inputting and managing BIN data before approval. Can Add, Edit, Delete, and Reactivate BINs.",
            category: "process"
        },
        "Approver": {
            definition: "A user role in the APC Portal responsible for reviewing BINs submitted by Capturers. Can Approve or Reject BINs.",
            category: "process"
        },
        "Administrator": {
            definition: "A user role (Superuser) in the APC Portal with all Capturer and Approver rights, plus the ability to manage BINtypes.",
            category: "process"
        }
    };
}

// Helper function: Debounce
function debounce(func, delay) {
    let timer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Ensure terms are defined
ensureTermsExist();

// Add a reload button to the glossary search section
addGlossaryReloadButton();

// Handle collapsible content resizing on window resize
window.addEventListener('resize', function() {
    const activeCollapsibles = document.querySelectorAll('.collapsible.active-collapsible');
    activeCollapsibles.forEach(function(coll) {
        var content = coll.nextElementSibling;
        if (content && content.style.maxHeight) {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});
