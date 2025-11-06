// Database configuration
const DB_NAME = 'USTI';
const DB_VERSION = 1;
let db;

// Current active section
let currentSection = 'employee';

// DOM Elements
const employeeMenu = document.getElementById('employeeMenu');
const studentMenu = document.getElementById('studentMenu');
const roomMenu = document.getElementById('roomMenu');

const employeeSection = document.getElementById('employeeSection');
const studentSection = document.getElementById('studentSection');
const roomSection = document.getElementById('roomSection');

const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const addRoomBtn = document.getElementById('addRoomBtn');

const reloadBtn = document.getElementById('reloadBtn');

const formModal = document.getElementById('formModal');
const deleteModal = document.getElementById('deleteModal');
const dataForm = document.getElementById('dataForm');
const formTitle = document.getElementById('formTitle');

const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Current item being edited/deleted
let currentItem = null;
let currentStore = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            
            // Create Employee store
            if (!db.objectStoreNames.contains('Employee')) {
                const employeeStore = db.createObjectStore('Employee', { keyPath: 'nik' });
                employeeStore.createIndex('nama', 'nama', { unique: false });
                employeeStore.createIndex('tempatLahir', 'tempatLahir', { unique: false });
                employeeStore.createIndex('tglLahir', 'tglLahir', { unique: false });
                employeeStore.createIndex('statusKeluarga', 'statusKeluarga', { unique: false });
                employeeStore.createIndex('jlhAnak', 'jlhAnak', { unique: false });
                employeeStore.createIndex('alamat', 'alamat', { unique: false });
            }
            
            // Create Student store
            if (!db.objectStoreNames.contains('Student')) {
                const studentStore = db.createObjectStore('Student', { keyPath: 'nim' });
                studentStore.createIndex('nama', 'nama', { unique: false });
                studentStore.createIndex('alamat', 'alamat', { unique: false });
                studentStore.createIndex('asalSLTA', 'asalSLTA', { unique: false });
                studentStore.createIndex('programStudi', 'programStudi', { unique: false });
            }
            
            // Create Room store
            if (!db.objectStoreNames.contains('Room')) {
                const roomStore = db.createObjectStore('Room', { keyPath: 'kodeRoom' });
                roomStore.createIndex('fasilitas', 'fasilitas', { unique: false });
                roomStore.createIndex('dayaTampung', 'dayaTampung', { unique: false });
                roomStore.createIndex('gedung', 'gedung', { unique: false });
            }
            
            console.log('Database upgraded successfully');
        };
    });
}

// Add data to store
function addData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Get all data from store
function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Update data in store
function updateData(storeName, key, updatedData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(updatedData);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Delete data from store
function deleteData(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = function() {
            resolve();
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Display data in table
async function displayData(storeName) {
    try {
        const data = await getAllData(storeName);
        const tableBody = document.querySelector(`#${storeName.toLowerCase()}Table tbody`);
        tableBody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            if (storeName === 'Employee') {
                row.innerHTML = `
                    <td>${item.nik}</td>
                    <td>${item.nama}</td>
                    <td>${item.tempatLahir}</td>
                    <td>${formatDate(item.tglLahir)}</td>
                    <td>${item.statusKeluarga}</td>
                    <td>${item.jlhAnak}</td>
                    <td>${item.alamat}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-key="${item.nik}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="white"/>
                            </svg>
                        </button>
                        <button class="btn-delete" data-key="${item.nik}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="white"/>
                            </svg>
                        </button>
                    </td>
                `;
            } else if (storeName === 'Student') {
                row.innerHTML = `
                    <td>${item.nim}</td>
                    <td>${item.nama}</td>
                    <td>${item.alamat}</td>
                    <td>${item.asalSLTA}</td>
                    <td>${item.programStudi}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-key="${item.nim}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="white"/>
                            </svg>
                        </button>
                        <button class="btn-delete" data-key="${item.nim}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="white"/>
                            </svg>
                        </button>
                    </td>
                `;
            } else if (storeName === 'Room') {
                row.innerHTML = `
                    <td>${item.kodeRoom}</td>
                    <td>${item.fasilitas}</td>
                    <td>${item.dayaTampung}</td>
                    <td>${item.gedung}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-key="${item.kodeRoom}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="white"/>
                            </svg>
                        </button>
                        <button class="btn-delete" data-key="${item.kodeRoom}" data-store="${storeName}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="white"/>
                            </svg>
                        </button>
                    </td>
                `;
            }
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    } catch (error) {
        console.error('Error displaying data:', error);
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
}

// Switch sections
function switchSection(section) {
    // Hide all sections
    employeeSection.classList.remove('active');
    studentSection.classList.remove('active');
    roomSection.classList.remove('active');
    
    // Remove active class from all menu items
    employeeMenu.classList.remove('active');
    studentMenu.classList.remove('active');
    roomMenu.classList.remove('active');
    
    // Show selected section
    if (section === 'employee') {
        employeeSection.classList.add('active');
        employeeMenu.classList.add('active');
        currentSection = 'employee';
        displayData('Employee');
    } else if (section === 'student') {
        studentSection.classList.add('active');
        studentMenu.classList.add('active');
        currentSection = 'student';
        displayData('Student');
    } else if (section === 'room') {
        roomSection.classList.add('active');
        roomMenu.classList.add('active');
        currentSection = 'room';
        displayData('Room');
    }
}

// Show form modal
function showFormModal(title, storeName, item = null) {
    formTitle.textContent = title;
    currentStore = storeName;
    currentItem = item;
    
    // Clear form
    dataForm.innerHTML = '';
    
    // Create form fields based on store
    if (storeName === 'Employee') {
        dataForm.innerHTML = `
            <div class="form-group">
                <label for="nik">NIK:</label>
                <input type="${item ? 'text' : 'text'}" id="nik" value="${item ? item.nik : ''}" ${item ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="nama">Nama:</label>
                <input type="text" id="nama" value="${item ? item.nama : ''}" required>
            </div>
            <div class="form-group">
                <label for="tempatLahir">Tempat Lahir:</label>
                <input type="text" id="tempatLahir" value="${item ? item.tempatLahir : ''}" required>
            </div>
            <div class="form-group">
                <label for="tglLahir">Tanggal Lahir:</label>
                <input type="date" id="tglLahir" value="${item ? item.tglLahir : ''}" required>
            </div>
            <div class="form-group">
                <label for="statusKeluarga">Status Keluarga:</label>
                <select id="statusKeluarga" required>
                    <option value="">Pilih Status</option>
                    <option value="Lajang" ${item && item.statusKeluarga === 'Lajang' ? 'selected' : ''}>Lajang</option>
                    <option value="Menikah" ${item && item.statusKeluarga === 'Menikah' ? 'selected' : ''}>Menikah</option>
                    <option value="Duda" ${item && item.statusKeluarga === 'Duda' ? 'selected' : ''}>Duda</option>
                    <option value="Janda" ${item && item.statusKeluarga === 'Janda' ? 'selected' : ''}>Janda</option>
                </select>
            </div>
            <div class="form-group">
                <label for="jlhAnak">Jumlah Anak:</label>
                <input type="number" id="jlhAnak" value="${item ? item.jlhAnak : ''}" min="0">
            </div>
            <div class="form-group">
                <label for="alamat">Alamat:</label>
                <textarea id="alamat" rows="3" required>${item ? item.alamat : ''}</textarea>
            </div>
            <button type="submit" class="btn-primary">${item ? 'Update' : 'Simpan'} Data</button>
        `;
    } else if (storeName === 'Student') {
        dataForm.innerHTML = `
            <div class="form-group">
                <label for="nim">NIM:</label>
                <input type="${item ? 'text' : 'text'}" id="nim" value="${item ? item.nim : ''}" ${item ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="nama">Nama:</label>
                <input type="text" id="nama" value="${item ? item.nama : ''}" required>
            </div>
            <div class="form-group">
                <label for="alamat">Alamat:</label>
                <textarea id="alamat" rows="3" required>${item ? item.alamat : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="asalSLTA">Asal SLTA:</label>
                <input type="text" id="asalSLTA" value="${item ? item.asalSLTA : ''}" required>
            </div>
            <div class="form-group">
                <label for="programStudi">Program Studi:</label>
                <input type="text" id="programStudi" value="${item ? item.programStudi : ''}" required>
            </div>
            <button type="submit" class="btn-primary">${item ? 'Update' : 'Simpan'} Data</button>
        `;
    } else if (storeName === 'Room') {
        dataForm.innerHTML = `
            <div class="form-group">
                <label for="kodeRoom">Kode Room:</label>
                <input type="${item ? 'text' : 'text'}" id="kodeRoom" value="${item ? item.kodeRoom : ''}" ${item ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="fasilitas">Fasilitas:</label>
                <input type="text" id="fasilitas" value="${item ? item.fasilitas : ''}" required>
            </div>
            <div class="form-group">
                <label for="dayaTampung">Daya Tampung:</label>
                <input type="number" id="dayaTampung" value="${item ? item.dayaTampung : ''}" min="1" required>
            </div>
            <div class="form-group">
                <label for="gedung">Gedung:</label>
                <input type="text" id="gedung" value="${item ? item.gedung : ''}" required>
            </div>
            <button type="submit" class="btn-primary">${item ? 'Update' : 'Simpan'} Data</button>
        `;
    }
    
    formModal.classList.add('active');
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Create data object by manually getting values from form fields
        const data = {};
        
        // Get values for all possible fields
        if (document.getElementById('nik')) {
            data.nik = document.getElementById('nik').value;
        }
        if (document.getElementById('nama')) {
            data.nama = document.getElementById('nama').value;
        }
        if (document.getElementById('tempatLahir')) {
            data.tempatLahir = document.getElementById('tempatLahir').value;
        }
        if (document.getElementById('tglLahir')) {
            data.tglLahir = document.getElementById('tglLahir').value;
        }
        if (document.getElementById('statusKeluarga')) {
            data.statusKeluarga = document.getElementById('statusKeluarga').value;
        }
        if (document.getElementById('jlhAnak')) {
            data.jlhAnak = document.getElementById('jlhAnak').value;
        }
        if (document.getElementById('alamat')) {
            data.alamat = document.getElementById('alamat').value;
        }
        if (document.getElementById('nim')) {
            data.nim = document.getElementById('nim').value;
        }
        if (document.getElementById('asalSLTA')) {
            data.asalSLTA = document.getElementById('asalSLTA').value;
        }
        if (document.getElementById('programStudi')) {
            data.programStudi = document.getElementById('programStudi').value;
        }
        if (document.getElementById('kodeRoom')) {
            data.kodeRoom = document.getElementById('kodeRoom').value;
        }
        if (document.getElementById('fasilitas')) {
            data.fasilitas = document.getElementById('fasilitas').value;
        }
        if (document.getElementById('dayaTampung')) {
            data.dayaTampung = document.getElementById('dayaTampung').value;
        }
        if (document.getElementById('gedung')) {
            data.gedung = document.getElementById('gedung').value;
        }
        
        if (currentStore === 'Employee') {
            // Validate NIK for Employee
            if (!currentItem && !data.nik) {
                alert('NIK harus diisi!');
                return;
            }
            
            await (currentItem ? 
                updateData(currentStore, data.nik, data) : 
                addData(currentStore, data));
        } else if (currentStore === 'Student') {
            // Validate NIM for Student
            if (!currentItem && !data.nim) {
                alert('NIM harus diisi!');
                return;
            }
            
            await (currentItem ? 
                updateData(currentStore, data.nim, data) : 
                addData(currentStore, data));
        } else if (currentStore === 'Room') {
            // Validate kodeRoom for Room
            if (!currentItem && !data.kodeRoom) {
                alert('Kode Room harus diisi!');
                return;
            }
            
            await (currentItem ? 
                updateData(currentStore, data.kodeRoom, data) : 
                addData(currentStore, data));
        }
        
        // Close modal and refresh data
        formModal.classList.remove('active');
        displayData(currentStore);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Terjadi kesalahan saat menyimpan data: ' + error.message);
    }
}

// Handle edit button click
function handleEditClick(event) {
    const key = event.currentTarget.getAttribute('data-key');
    const storeName = event.currentTarget.getAttribute('data-store');
    
    // Get the data to edit
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = function() {
        const item = request.result;
        if (item) {
            if (storeName === 'Employee') {
                showFormModal('Ubah Data Employee', storeName, item);
            } else if (storeName === 'Student') {
                showFormModal('Ubah Data Student', storeName, item);
            } else if (storeName === 'Room') {
                showFormModal('Ubah Data Room', storeName, item);
            }
        }
    };
    
    request.onerror = function(event) {
        console.error('Error getting data:', event.target.error);
        alert('Terjadi kesalahan saat mengambil data');
    };
}

// Handle delete button click
function handleDeleteClick(event) {
    const key = event.currentTarget.getAttribute('data-key');
    const storeName = event.currentTarget.getAttribute('data-store');
    
    currentItem = { key, storeName };
    deleteModal.classList.add('active');
}

// Confirm delete
async function confirmDelete() {
    try {
        await deleteData(currentItem.storeName, currentItem.key);
        deleteModal.classList.remove('active');
        displayData(currentItem.storeName);
    } catch (error) {
        console.error('Error deleting data:', error);
        alert('Terjadi kesalahan saat menghapus data: ' + error.message);
    }
}

// Reload database
function reloadDatabase() {
    if (db) {
        db.close();
    }
    
    const deleteReq = indexedDB.deleteDatabase(DB_NAME);
    
    deleteReq.onsuccess = function() {
        console.log('Database deleted successfully');
        initDB().then(() => {
            displayData(currentSection.charAt(0).toUpperCase() + currentSection.slice(1));
            alert('Database berhasil direload!');
        }).catch(error => {
            console.error('Error initializing database:', error);
            alert('Terjadi kesalahan saat menginisialisasi database: ' + error.message);
        });
    };
    
    deleteReq.onerror = function(event) {
        console.error('Error deleting database:', event.target.error);
        alert('Terjadi kesalahan saat menghapus database: ' + event.target.error.message);
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize database
        await initDB();
        
        // Load initial data
        displayData('Employee');
        
        // Menu navigation
        employeeMenu.addEventListener('click', () => switchSection('employee'));
        studentMenu.addEventListener('click', () => switchSection('student'));
        roomMenu.addEventListener('click', () => switchSection('room'));
        
        // Add buttons
        addEmployeeBtn.addEventListener('click', () => showFormModal('Tambah Data Employee', 'Employee'));
        addStudentBtn.addEventListener('click', () => showFormModal('Tambah Data Student', 'Student'));
        addRoomBtn.addEventListener('click', () => showFormModal('Tambah Data Room', 'Room'));
        
        // Form submission
        dataForm.addEventListener('submit', handleFormSubmit);
        
        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(button => {
            button.addEventListener('click', () => {
                formModal.classList.remove('active');
                deleteModal.classList.remove('active');
            });
        });
        
        // Delete confirmation
        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('active');
        });
        
        confirmDeleteBtn.addEventListener('click', confirmDelete);
        
        // Reload database
        reloadBtn.addEventListener('click', reloadDatabase);
        
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === formModal) {
                formModal.classList.remove('active');
            }
            if (event.target === deleteModal) {
                deleteModal.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Terjadi kesalahan saat menginisialisasi aplikasi: ' + error.message);
    }
});