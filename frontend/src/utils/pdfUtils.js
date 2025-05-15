import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoicePDF = async (invoice, invoiceTemplateRef) => {
  try {
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 500);
      });
    });

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    const canvas = await html2canvas(invoiceTemplateRef, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      width: invoiceTemplateRef.offsetWidth,
      height: invoiceTemplateRef.offsetHeight,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    return pdf;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

export const generateEmployeePDF = async (users, employeeTemplateRef) => {
  try {
    // Wait for render and layout to complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 500);
      });
    });

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    const canvas = await html2canvas(employeeTemplateRef, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      onclone: (document) => {
        // Ensure the template is visible for html2canvas
        const element = document.querySelector('.employee-template');
        if (element) {
          element.style.display = 'block';
          element.style.width = '100%';
          element.style.height = 'auto';
        }
      }
    });

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, imgWidth, imgHeight);
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
