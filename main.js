let currentDate = new Date();
let events = loadEvents();

function loadEvents() {
    const savedEvents = localStorage.getItem('veterinaryEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
}

function saveEvents() {
    localStorage.setItem('veterinaryEvents', JSON.stringify(events));
}

function initializeSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    const months = Array.from({length: 12}, (_, i) => 
        new Date(2000, i).toLocaleDateString('es', { month: 'long' }));
    months.forEach((month, index) => {
        const option = new Option(month.charAt(0).toUpperCase() + month.slice(1), index);
        monthSelect.add(option);
    });
    
    const currentYear = new Date().getFullYear();
    for(let year = currentYear - 2; year <= currentYear + 5; year++) {
        yearSelect.add(new Option(year, year));
    }
    
    monthSelect.value = currentDate.getMonth();
    yearSelect.value = currentDate.getFullYear();
    
    monthSelect.addEventListener('change', () => {
        currentDate.setMonth(monthSelect.value);
        updateCalendar();
    });
    
    yearSelect.addEventListener('change', () => {
        currentDate.setFullYear(yearSelect.value);
        updateCalendar();
    });
}

function updateStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear;
    });
    
    document.getElementById('totalVacunas').textContent = 
        monthEvents.filter(e => e.type === 'vacunacion').length;
    document.getElementById('totalDesparasitaciones').textContent = 
        monthEvents.filter(e => e.type === 'desparasitacion').length;
    document.getElementById('totalVitaminas').textContent = 
        monthEvents.filter(e => e.type === 'vitaminas').length;
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleDateString('es', { month: 'long', year: 'numeric' });
    
    document.getElementById('monthSelect').value = month;
    document.getElementById('yearSelect').value = year;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < startingDay; i++) {
        calendarDays.appendChild(createDayElement(''));
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = createDayElement(day);
        const dateString = formatDate(year, month + 1, day);
        const eventsForDay = events.filter(event => event.date === dateString);
        
        if (eventsForDay.length > 0) {
            dayElement.classList.add('has-event');
            const eventIndicators = document.createElement('div');
            eventIndicators.className = 'event-indicators';
            
            eventsForDay.forEach(event => {
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                switch(event.type) {
                    case 'vacunacion':
                        dot.style.backgroundColor = 'var(--primary)';
                        break;
                    case 'desparasitacion':
                        dot.style.backgroundColor = 'var(--secondary)';
                        break;
                    case 'vitaminas':
                        dot.style.backgroundColor = 'var(--accent)';
                        break;
                }
                eventIndicators.appendChild(dot);
            });
            
            dayElement.appendChild(eventIndicators);
        }
        
        dayElement.addEventListener('click', () => openModal(day));
        calendarDays.appendChild(dayElement);
    }
    
    updateEventList();
    updateStats();
}

function formatDate(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function createDayElement(content) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    
    const dayNumber = document.createElement('span');
    dayNumber.textContent = content;
    div.appendChild(dayNumber);
    
    return div;
}

function openModal(day) {
    const modal = document.getElementById('eventModal');
    const overlay = document.getElementById('modalOverlay');
    const dateString = formatDate(
        currentDate.getFullYear(), 
        currentDate.getMonth() + 1, 
        day
    );
    
    document.getElementById('selectedDate').textContent = 
        `${day} de ${currentDate.toLocaleDateString('es', { month: 'long' })} de ${currentDate.getFullYear()}`;
    
    const existingEvent = events.find(event => event.date === dateString);
    if (existingEvent) {
        document.getElementById('eventType').value = existingEvent.type;
        document.getElementById('animalType').value = existingEvent.animalType;
        document.getElementById('animalId').value = existingEvent.animalId || '';
        document.getElementById('eventDescription').value = existingEvent.description;
        document.getElementById('reminder').value = existingEvent.reminder || 'none';
    }
    
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('eventModal');
    const overlay = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.getElementById('eventForm').reset();
}

function updateEventList() {
    const eventList = document.getElementById('eventList');
    const today = new Date();
    const futureEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    let html = `
        <div class="event-list-header">
            <h3><i class="fas fa-list"></i> Próximos Tratamientos</h3>
            <button class="btn btn-secondary" onclick="exportEvents()">
                <i class="fas fa-download"></i> Exportar
            </button>
        </div>
    `;
    
    if (futureEvents.length === 0) {
        html += '<p class="text-center">No hay tratamientos programados</p>';
    } else {
        html += '<div class="event-list-content">';
        futureEvents.forEach(event => {
            const date = new Date(event.date).toLocaleDateString('es');
            const icon = event.animalType === 'bovino' ? '🐄' : '🐑';
            const color = getEventColor(event.type);
            
            html += `
                <div class="event-item" style="border-left: 4px solid ${color}">
                    <div>
                        <strong>${date}</strong> ${icon}
                        <span class="event-type">${capitalizeFirstLetter(event.type)}</span>
                        ${event.animalId ? `<span class="animal-id">#${event.animalId}</span>` : ''}
                        <p class="event-description">${event.description}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-secondary" onclick="editEvent('${event.date}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteEvent('${event.date}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    eventList.innerHTML = html;
}

function editEvent(date) {
    const event = events.find(e => e.date === date);
    if (event) {
        const day = new Date(event.date).getDate();
        openModal(day);
    }
}

function deleteEvent(date) {
    if (confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
        events = events.filter(event => event.date !== date);
        saveEvents();
        updateCalendar();
    }
}

function exportEvents() {
    const exportData = events.map(event => ({
        ...event,
        fecha: new Date(event.date).toLocaleDateString('es'),
        tipo: event.type,
        animal: event.animalType,
        identificacion: event.animalId,
        descripcion: event.description
    }));
    
    const csv = convertToCSV(exportData);
    downloadCSV(csv, 'calendario_veterinario.csv');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getEventColor(type) {
    switch(type) {
        case 'vacunacion': return 'var(--primary)';
        case 'desparasitacion': return 'var(--secondary)';
        case 'vitaminas': return 'var(--accent)';
        default: return 'var(--gray)';
    }
}

function convertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = `${Object.keys(array[0]).join(';')}\r\n`;
    
    return array.reduce((str, next) => {
        str += `${Object.values(next).join(';')}\r\n`;
        return str;
    }, str);
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('selectedDate').textContent.split(' ')[0];
    const event = {
        date: formatDate(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
        type: document.getElementById('eventType').value,
        animalType: document.getElementById('animalType').value,
        animalId: document.getElementById('animalId').value,
        description: document.getElementById('eventDescription').value,
        reminder: document.getElementById('reminder').value
    };
    
    events = events.filter(e => e.date !== event.date);
    events.push(event);
    saveEvents();
    closeModal();
    updateCalendar();
});

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

document.addEventListener('DOMContentLoaded', () => {
    initializeSelectors();
    updateCalendar();
});