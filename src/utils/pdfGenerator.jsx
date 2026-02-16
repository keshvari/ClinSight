import jsPDF from 'jspdf';
import moment from 'moment-jalaali';

export const generateEndoscopyReport = async (data) => {
  const {
    patient,
    procedure,
    findings,
    selectedImages = [],
    reportTitle = 'Endoscopy Report'
  } = data;

  // Create new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text, x, y, maxWidth = contentWidth, fontSize = 12, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    
    return y + (lines.length * fontSize * 0.4); // Return new Y position
  };

  // Helper function to add Persian text
  const addPersianText = (text, x, y, maxWidth = contentWidth, fontSize = 12) => {
    doc.setFontSize(fontSize);
    // Note: For proper Persian support, you'd need a Persian font
    // This is a simplified version
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date and time
  const currentDate = moment().format('jYYYY/jMM/jDD');
  const currentTime = moment().format('HH:mm');
  yPosition = addText(`Date: ${currentDate}`, margin, yPosition, contentWidth / 2);
  addText(`Time: ${currentTime}`, pageWidth / 2, yPosition - 6);

  yPosition += 20;

  // Patient Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
  
  yPosition = addText('PATIENT INFORMATION', margin + 5, yPosition + 5, contentWidth, 14, 'bold');
  yPosition += 10;

  const patientInfo = [
    `Patient ID: ${patient.nationalCode || 'N/A'}`,
    `Name: ${patient.firstName || ''} ${patient.lastName || ''}`,
    `Age: ${patient.age || 'N/A'}`,
    `Gender: ${patient.gender || 'N/A'}`,
  ];

  patientInfo.forEach(info => {
    yPosition = addText(info, margin, yPosition, contentWidth);
    yPosition += 5;
  });

  yPosition += 10;

  // Procedure Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
  
  yPosition = addText('PROCEDURE INFORMATION', margin + 5, yPosition + 5, contentWidth, 14, 'bold');
  yPosition += 10;

  const procedureInfo = [
    `Practitioner: ${procedure.practitioner || 'N/A'}`,
    `Procedure Date: ${procedure.date || 'N/A'}`,
    `Report Type: ${reportTitle}`,
  ];

  procedureInfo.forEach(info => {
    yPosition = addText(info, margin, yPosition, contentWidth);
    yPosition += 5;
  });

  yPosition += 10;

  // Findings Section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
  
  yPosition = addText('FINDINGS', margin + 5, yPosition + 5, contentWidth, 14, 'bold');
  yPosition += 10;

  const findingsList = [
    { key: 'retroFlex', label: 'RetroFlex View' },
    { key: 'rectum', label: 'Rectum' },
    { key: 'rectosigmoidJunction', label: 'Rectosigmoid Junction' },
    { key: 'sigmoid', label: 'Sigmoid' },
    { key: 'descendingColon', label: 'Descending Colon' },
    { key: 'transverseColon', label: 'Transverse Colon' },
    { key: 'hepaticFlexure', label: 'Hepatic Flexure' },
    { key: 'ascendingColon', label: 'Ascending Colon' },
    { key: 'cecum', label: 'Cecum' },
    { key: 'diagnosis', label: 'Diagnosis' },
  ];

  findingsList.forEach(finding => {
    const value = findings[finding.key] || 'Was normal';
    yPosition = addText(`${finding.label}: ${value}`, margin, yPosition, contentWidth);
    yPosition += 5;
  });

  // Comments
  if (findings.comment) {
    yPosition += 5;
    yPosition = addText('Comments:', margin, yPosition, contentWidth, 12, 'bold');
    yPosition += 5;
    yPosition = addText(findings.comment, margin, yPosition, contentWidth);
    yPosition += 10;
  }

  yPosition += 10;

  // Images Section
  if (selectedImages.length > 0) {
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
    
    yPosition = addText('CAPTURED IMAGES', margin + 5, yPosition + 5, contentWidth, 14, 'bold');
    yPosition += 10;

    const imagesPerRow = 2;
    const imageWidth = (contentWidth - 10) / imagesPerRow;
    const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

    for (let i = 0; i < selectedImages.length; i += imagesPerRow) {
      // Check if we need a new page
      if (yPosition + imageHeight + 30 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      for (let j = 0; j < imagesPerRow && i + j < selectedImages.length; j++) {
        const image = selectedImages[i + j];
        const xPosition = margin + (j * (imageWidth + 10));

        try {
          // Add image to PDF
          if (image.src.startsWith('data:')) {
            // Base64 image
            doc.addImage(image.src, 'JPEG', xPosition, yPosition, imageWidth, imageHeight);
          } else if (image.src.startsWith('file://')) {
            // File path - this would need special handling in Electron
            // For now, we'll add a placeholder
            doc.setFillColor(200, 200, 200);
            doc.rect(xPosition, yPosition, imageWidth, imageHeight, 'F');
            doc.setFontSize(10);
            doc.text('Image Placeholder', xPosition + 5, yPosition + imageHeight / 2);
          }

          // Add image caption
          doc.setFontSize(8);
          doc.text(`Image ${i + j + 1}: ${image.name || `Snapshot ${image.id}`}`, 
                   xPosition, yPosition + imageHeight + 5);
          
          if (image.currentTime) {
            doc.text(`Time: ${image.currentTime.toFixed(1)}s`, 
                     xPosition, yPosition + imageHeight + 10);
          }
        } catch (error) {
          console.error(`Failed to add image ${i + j}:`, error);
          // Add error placeholder
          doc.setFillColor(255, 200, 200);
          doc.rect(xPosition, yPosition, imageWidth, imageHeight, 'F');
          doc.setFontSize(10);
          doc.text('Image Error', xPosition + 5, yPosition + imageHeight / 2);
        }
      }

      yPosition += imageHeight + 20;
    }
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Endoscopy Report System', margin, footerY);
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 20, footerY);

  return doc;
};

export const savePDF = async (doc, filePath) => {
  try {
    // In Electron, we need to use the main process to save files
    const { ipcRenderer } = window.require('electron');
    
    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Save via main process
    const result = await ipcRenderer.invoke('save-pdf', { filePath, buffer: pdfBuffer });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to save PDF:', error);
    throw error;
  }
};




