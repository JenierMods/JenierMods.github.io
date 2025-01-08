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
            const qrContentBox = document.getElementById('qrContentBox');
            
            qrContentText.textContent = 'Aquí aparecerá el contenido del código QR';
            qrContentBox.querySelector('button')?.remove();
            
            if (qrCodeData) {
                qrContentText.textContent = ` ${qrCodeData.data}`;
                qrContentText.style.color = "green";
                if (isValidURL(qrCodeData.data)) {
                    const visitButton = document.createElement('button');
                    visitButton.textContent = 'Ver información';
                    visitButton.style.marginTop = '20px';
                    visitButton.style.padding = '10px 15px';
                    visitButton.style.fontSize = '16px';
                    visitButton.style.cursor = 'pointer';
                    visitButton.style.backgroundColor = '#4CAF50';
                    visitButton.style.color = 'white';
                    visitButton.style.border = 'none';
                    visitButton.style.borderRadius = '8px';

                    visitButton.addEventListener('click', () => {
                        window.open(qrCodeData.data, '_blank');
                    });

                    qrContentBox.appendChild(visitButton);
                }
            } else {
                qrContentText.textContent = 'No se detectó un código QR en la imagen.';
                qrContentText.style.color = "red";
            }
        };
    }
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

document.getElementById('fileInput').addEventListener('change', readQRCode);
