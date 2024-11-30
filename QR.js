// Función para simular el clic en el input de tipo file
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

// Función para leer y analizar el QR desde la imagen seleccionada
async function readQRCode(event) {
    const file = event.target.files[0];
    if (file) {
        // Crear un objeto URL para leer la imagen
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageUrl;

        // Analizar el código QR una vez cargada la imagen
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Obtener la información del QR usando jsQR
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCodeData = jsQR(imageData.data, canvas.width, canvas.height);

            const qrContentText = document.getElementById('qrContentText');
            if (qrCodeData) {
                qrContentText.textContent = ` ${qrCodeData.data}`;
                qrContentText.style.color = "green";
            } else {
                qrContentText.textContent = 'No se detectó un código QR en la imagen.';
                qrContentText.style.color = "red";
            }
        };
    }
}
document.getElementById('fileInput').addEventListener('change', readQRCode);
