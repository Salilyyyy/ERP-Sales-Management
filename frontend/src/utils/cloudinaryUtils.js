const generateSignature = async (timestamp, folder = 'employee_avatars') => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
    const apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET;
    
    // Create the string to sign
    const str = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    // Generate SHA-1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signature;
};

export const uploadToCloudinary = async (file) => {
    try {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const signature = await generateSignature(timestamp);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'employee_avatars');
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};
