import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactDOM from 'react-dom/client';
import CustomerTemplate from '../components/customerTemplate/customerTemplate';

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

export const generateProductPDF = async (product, productTemplateRef) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(productTemplateRef, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      width: productTemplateRef.offsetWidth,
      height: productTemplateRef.offsetHeight,
      onclone: (document) => {
        const template = document.querySelector('.product-template');
        if (template) {
          template.style.position = 'absolute';
          template.style.top = '0';
          template.style.left = '0';
          template.style.width = `${pageWidth}px`;
          template.style.minHeight = `${pageHeight}px`;
          template.style.backgroundColor = '#ffffff';
          template.style.transform = 'none';
          template.style.border = 'none';
          template.style.boxShadow = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateEmployeePDF = async (users, employeeTemplateRef) => {
  try {
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

export const generateCustomerPDF = async (customers, customerTemplateRef) => {
  try {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Handle single customer case
    if (!Array.isArray(customers)) {
      customers = [customers];
    }

    for (let i = 0; i < customers.length; i++) {
      // Add a new page for each customer except the first one
      if (i > 0) {
        pdf.addPage();
      }

      // Wait for DOM updates
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 500);
        });
      });

      // Create a new root for each customer
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const customerRoot = ReactDOM.createRoot(tempDiv);
      await new Promise(resolve => {
        customerRoot.render(
          <CustomerTemplate
            customer={customers[i]}
            isPdfMode={true}
            onAfterRender={resolve}
          />
        );
      });

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
      });

      customerRoot.unmount();
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    }

    return pdf;
  } catch (error) {
    console.error('Error generating customer PDF:', error);
    throw error;
  }
};
