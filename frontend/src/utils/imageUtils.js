const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                const MAX_SIZE = 400; // Reduced from 800 to 400
                let targetWidth = width;
                let targetHeight = height;

                if (width > height && width > MAX_SIZE) {
                    targetHeight = Math.round((height * MAX_SIZE) / width);
                    targetWidth = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    targetWidth = Math.round((width * MAX_SIZE) / height);
                    targetHeight = MAX_SIZE;
                }

                // First compress step
                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = targetWidth;
                tempCanvas.height = targetHeight;
                let tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Second compress step with even smaller dimensions
                canvas.width = Math.min(targetWidth, 300);
                canvas.height = Math.min(targetHeight, 300);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.5);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export { compressImage };
