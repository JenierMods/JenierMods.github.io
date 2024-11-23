function showModal(message) {
    closeModalBolita();
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

function closeModalBolita() {
    document.getElementById('modalOverlayBolita').style.display = 'none';
}

function confirmContact() {
    window.location.href = "https://wa.me//+50577530939";
}

document.getElementById('university').addEventListener('click', function () {
    showModal('Universidad Nacional Agraria');
});

document.getElementById('creator').addEventListener('click', function () {
    showModal('Creado por JenierMods OFC');
});

document.getElementById('members').addEventListener('click', function () {
    showModal('\nSolo yo alvrg👁️🫦👁️\n\n\n');
});

function contactCreator() {
    closeModal();
    document.getElementById('modalOverlayBolita').style.display = 'flex';
}
