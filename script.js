let students = JSON.parse(localStorage.getItem('students')) || [];
let today = new Date().toISOString().split('T')[0];
let isPriceConfirmed = false;
let isDaysConfirmed = false;
let editStudentIndex = null;
let deleteStudentIndex = null;
document.getElementById('currentDate').value = today;

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function setCourseDays() {
    if (!isDaysConfirmed) {
        const currentDate = new Date(document.getElementById('currentDate').value || today);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = getDaysInMonth(year, month);
        document.getElementById('courseDays').value = days;
        calculateDailyRate();
    }
}

function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

function addStudent() {
    const nameInput = document.getElementById('studentName');
    const name = nameInput.value.trim();
    const registerDate = document.getElementById('currentDate').value || today;
    if (name) {
        students.push({
            name: name,
            registerDate: registerDate,
            attendance: {},
            attendedDays: 0,
            missedDays: 0,
            payment: 0
        });
        nameInput.value = '';
        saveStudents();
        renderTable();
        showToast("O'quvchi qo'shildi!", 'success');
    } else {
        showToast("Iltimos, o'quvchi ismini kiriting!", 'error');
    }
}

function showDeleteConfirmModal(index) {
    deleteStudentIndex = index;
    const student = students[index];
    const modal = document.getElementById('deleteConfirmModal');
    const messageDiv = document.getElementById('deleteConfirmMessage');
    messageDiv.textContent = `${student.name} o'quvchisini o'chirishni tasdiqlaysizmi?`;
    modal.style.display = 'flex';
}

function confirmDelete() {
    if (deleteStudentIndex !== null) {
        students.splice(deleteStudentIndex, 1);
        saveStudents();
        renderTable();
        showToast("O'quvchi o'chirildi!", 'success');
        closeDeleteModal();
    }
}

function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    deleteStudentIndex = null;
}

function restrictCourseDays() {
    const courseDaysInput = document.getElementById('courseDays');
    const courseDays = parseInt(courseDaysInput.value) || 0;
    if (courseDays > 31) {
        courseDaysInput.value = 31;
        showToast("Oyning dars kunlari 31 dan oshmasligi kerak!", 'error');
    }
    if (!isDaysConfirmed) {
        calculateDailyRate();
    }
}

function calculateDailyRate() {
    if (!isPriceConfirmed || !isDaysConfirmed) {
        const coursePrice = parseInt(document.getElementById('coursePrice').value) || 0;
        const courseDays = parseInt(document.getElementById('courseDays').value) || 0;
        const dailyRate = courseDays > 0 ? Math.round(coursePrice / courseDays) : 0;
        document.getElementById('dailyRate').value = dailyRate;
    }
}

function confirmCoursePrice() {
    const coursePrice = parseInt(document.getElementById('coursePrice').value);
    if (!coursePrice || coursePrice <= 0) {
        showToast("Iltimos, kurs narxini to'g'ri kiriting!", 'error');
        return;
    }
    isPriceConfirmed = true;
    document.getElementById('coursePrice').setAttribute('readonly', true);
    document.getElementById('confirmPriceBtn').classList.add('hidden');
    document.getElementById('cancelPriceBtn').classList.remove('hidden');
    calculateDailyRate();
    showToast("Kurs narxi tasdiqlandi!", 'success');
}

function cancelCoursePrice() {
    isPriceConfirmed = false;
    document.getElementById('coursePrice').removeAttribute('readonly');
    document.getElementById('confirmPriceBtn').classList.remove('hidden');
    document.getElementById('cancelPriceBtn').classList.add('hidden');
    calculateDailyRate();
}

function confirmCourseDays() {
    const courseDays = parseInt(document.getElementById('courseDays').value);
    if (!courseDays || courseDays <= 0) {
        showToast("Iltimos, dars kunlarini to'g'ri kiriting!", 'error');
        return;
    }
    if (courseDays > 31) {
        showToast("Oyning dars kunlari 31 dan oshmasligi kerak!", 'error');
        return;
    }
    isDaysConfirmed = true;
    document.getElementById('courseDays').setAttribute('readonly', true);
    document.getElementById('confirmDaysBtn').classList.add('hidden');
    document.getElementById('cancelDaysBtn').classList.remove('hidden');
    calculateDailyRate();
    showToast("Dars kunlari tasdiqlandi!", 'success');
}

function cancelCourseDays() {
    isDaysConfirmed = false;
    document.getElementById('courseDays').removeAttribute('readonly');
    document.getElementById('confirmDaysBtn').classList.remove('hidden');
    document.getElementById('cancelDaysBtn').classList.add('hidden');
    setCourseDays();
}

function markAttendance(index, date, status) {
    const dateStr = date.toISOString().split('T')[0];
    students[index].attendance[dateStr] = status;
    updateAttendanceCounts(index);
    saveStudents();
    renderTable();
}

function enableAttendance(index, dateStr) {
    delete students[index].attendance[dateStr];
    updateAttendanceCounts(index);
    saveStudents();
    renderTable();
}

function updateAttendanceCounts(index) {
    let attended = 0;
    let missed = 0;
    for (const date in students[index].attendance) {
        if (students[index].attendance[date] === 'attended') {
            attended++;
        } else if (students[index].attendance[date] === 'missed') {
            missed++;
        }
    }
    students[index].attendedDays = attended;
    students[index].missedDays = missed;
}

function calculatePayments() {
    if (!isPriceConfirmed || !isDaysConfirmed) {
        showToast("Iltimos, kurs narxi va dars kunlarini tasdiqlang!", 'error');
        return;
    }
    const dailyRate = parseInt(document.getElementById('dailyRate').value) || 0;
    students.forEach(student => {
        if (student.attendedDays > 0) {
            student.payment = student.attendedDays * dailyRate;
        } else {
            student.payment = 0;
        }
    });
    saveStudents();
    renderTable();
    showToast("To'lovlar hisoblandi!", 'success');
}

function showHistory(index) {
    const student = students[index];
    const modal = document.getElementById('historyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalHistory = document.getElementById('modalHistory');

    modalTitle.textContent = `${student.name} uchun yo'qlama tarixi`;
    modalHistory.innerHTML = '';

    const historyEntries = Object.entries(student.attendance)
        .filter(([date]) => date >= student.registerDate)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));

    if (historyEntries.length === 0) {
        modalHistory.textContent = "Hozircha yo'qlama tarixi yo'q.";
    } else {
        const historyList = document.createElement('ul');
        historyList.className = 'list-disc pl-5';
        historyEntries.forEach(([date, status]) => {
            const statusText = status === 'attended' ? 'Kelgan (✓)' : 'Kelmagan (✗)';
            const li = document.createElement('li');
            li.textContent = `${date}: ${statusText}`;
            historyList.appendChild(li);
        });
        modalHistory.appendChild(historyList);
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('historyModal').style.display = 'none';
}

function showEditNameModal(index) {
    editStudentIndex = index;
    const student = students[index];
    const modal = document.getElementById('editNameModal');
    const nameInput = document.getElementById('editNameInput');
    nameInput.value = student.name;
    modal.style.display = 'flex';
}

function saveNewName() {
    const nameInput = document.getElementById('editNameInput');
    const newName = nameInput.value.trim();
    if (newName && editStudentIndex !== null) {
        students[editStudentIndex].name = newName;
        saveStudents();
        renderTable();
        showToast("Ism o'zgartirildi!", 'success');
        closeEditModal();
    } else {
        showToast("Iltimos, yangi ism kiriting!", 'error');
    }
}

function closeEditModal() {
    document.getElementById('editNameModal').style.display = 'none';
    editStudentIndex = null;
    document.getElementById('editNameInput').value = '';
}

function toggleDropdown(index) {
    const dropdownMenu = document.getElementById(`dropdown-menu-${index}`);
    const isVisible = dropdownMenu.classList.contains('show');
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    if (!isVisible) {
        dropdownMenu.classList.add('show');
    }
}

function renderTable() {
    const tbody = document.getElementById('studentList');
    tbody.innerHTML = '';
    const currentDate = new Date(document.getElementById('currentDate').value || today);
    const dateStr = currentDate.toISOString().split('T')[0];

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.className = 'card';
        const status = student.attendance[dateStr] || 'none';
        let attendanceHtml = '';

        if (status === 'none' && dateStr >= student.registerDate) {
            const attendedChecked = status === 'attended' ? 'checked' : '';
            const missedChecked = status === 'missed' ? 'checked' : '';
            attendanceHtml = `
                <div class="attendance flex-row gap-2">
                    <input type="radio" id="attended-${index}" name="attendance-${index}" ${attendedChecked}
                        onchange="markAttendance(${index}, new Date('${dateStr}'), 'attended')">
                    <label for="attended-${index}" class="attended border border-gray-300">✓</label>
                    <input type="radio" id="missed-${index}" name="attendance-${index}" ${missedChecked}
                        onchange="markAttendance(${index}, new Date('${dateStr}'), 'missed')">
                    <label for="missed-${index}" class="missed border border-gray-300">✗</label>
                </div>
            `;
        } else {
            const statusClass = status === 'attended' ? 'attended' : 'missed';
            const statusSymbol = status === 'attended' ? '✓' : '✗';
            attendanceHtml = dateStr >= student.registerDate ? `
                <div class="attendance flex-row gap-2">
                    <label class="${statusClass}">${statusSymbol}</label>
                    <button class="bg-yellow-500 text-white p-2 rounded-lg"
                        onclick="enableAttendance(${index}, '${dateStr}')"><i class="fa-solid fa-pen-to-square"></i></button>
                </div>
            ` : '-';
        }

        row.innerHTML = `
            <td class="border_th_left">${student.name}</td>
            <td>${student.registerDate}</td>
            <td>${student.attendedDays}</td>
            <td>${student.missedDays}</td>
            <td>${student.payment} so'm</td>
            <td>${attendanceHtml}</td>
            <td>
                <button class="history-btn text-white p-2 rounded-lg"
                    onclick="showHistory(${index})">Tarix</button>
            </td>
            <td class="border_th_right">
                <div class="dropdown">
                    <button class="dropdown-btn text-white p-2 rounded-lg" onclick="toggleDropdown(${index})">
                        <i class="fa-solid fa-ellipsis-v"></i>
                    </button>
                    <div id="dropdown-menu-${index}" class="dropdown-menu">
                        <div class="dropdown-item" onclick="showEditNameModal(${index})">
                            <i class="fa-solid fa-pen"></i> Ismni o'zgartirish
                        </div>
                        <div class="dropdown-item" onclick="showDeleteConfirmModal(${index})">
                            <i class="fa-solid fa-trash"></i> O'chirish
                        </div>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    }
});

setCourseDays();
renderTable();