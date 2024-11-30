function triggerFileInput() {
    document.getElementById('fileInput').click();
}

async function readQRCode(event) {
    const file = event.target.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

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
