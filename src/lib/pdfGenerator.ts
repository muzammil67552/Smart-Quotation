import jsPDF from 'jspdf';
import { CompanyProfile, Quotation } from './storage';

export const generatePDF = (
  quotation: Quotation,
  companyProfile: CompanyProfile
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Add watermark logo (faded in background)
  if (companyProfile.logo) {
    try {
      const gState = doc.GState ? doc.GState({ opacity: 0.1 }) : undefined;
      if (gState) {
        doc.setGState(gState);
      }
      doc.addImage(
        companyProfile.logo,
        'PNG',
        pageWidth / 2 - 40,
        pageHeight / 2 - 40,
        80,
        80
      );
      const gStateNormal = doc.GState ? doc.GState({ opacity: 1 }) : undefined;
      if (gStateNormal) {
        doc.setGState(gStateNormal);
      }
    } catch (error) {
      console.error('Error adding watermark:', error);
    }
  }

  // Company Logo (top center, smaller)
  if (companyProfile.logo) {
    try {
      doc.addImage(companyProfile.logo, 'PNG', pageWidth / 2 - 15, yPos, 30, 30);
      yPos += 35;
    } catch (error) {
      console.error('Error adding logo:', error);
      yPos += 5;
    }
  }

  // Company Details
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyProfile.companyName, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyProfile.email, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(companyProfile.contactNumber, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Quotation Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Quotation Details (Left) and Client Details (Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Quotation Number:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quotationNumber, 65, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Client Name:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientName, pageWidth - 40, yPos, { align: 'right' });
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quotation.date).toLocaleDateString(), 65, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Contact:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientContact, pageWidth - 40, yPos, { align: 'right' });
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientEmail, pageWidth - 40, yPos, { align: 'right' });
  yPos += 12;

  // Items Table
  const tableStartY = yPos;
  const colWidths = [15, 80, 25, 30, 30];
  const headers = ['S.No', 'Description', 'Qty', 'Unit Price', 'Total'];

  // Table Header
  doc.setFillColor(186 * 255 / 360, 70 * 255 / 100, 45 * 255 / 100);
  doc.rect(20, yPos, pageWidth - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  
  let xPos = 20;
  headers.forEach((header, i) => {
    doc.text(header, xPos + 2, yPos + 6);
    xPos += colWidths[i];
  });
  yPos += 8;

  // Table Rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  quotation.items.forEach((item, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    xPos = 20;
    doc.text((index + 1).toString(), xPos + 2, yPos + 6);
    xPos += colWidths[0];
    
    const description = doc.splitTextToSize(item.description, colWidths[1] - 4);
    doc.text(description, xPos + 2, yPos + 6);
    xPos += colWidths[1];
    
    doc.text(item.quantity.toString(), xPos + 2, yPos + 6);
    xPos += colWidths[2];
    
    doc.text(`$${item.unitPrice.toFixed(2)}`, xPos + 2, yPos + 6);
    xPos += colWidths[3];
    
    doc.text(`$${item.total.toFixed(2)}`, xPos + 2, yPos + 6);
    
    yPos += Math.max(8, description.length * 5);
    doc.line(20, yPos, pageWidth - 20, yPos);
  });

  yPos += 8;

  // Summary
  const summaryX = pageWidth - 80;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, yPos);
  doc.text(`$${quotation.subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;

  if (quotation.taxPercent > 0) {
    doc.text(`Tax (${quotation.taxPercent}%):`, summaryX, yPos);
    const taxAmount = (quotation.subtotal * quotation.taxPercent) / 100;
    doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
  }

  if (quotation.discountPercent > 0) {
    doc.text(`Discount (${quotation.discountPercent}%):`, summaryX, yPos);
    const discountAmount = (quotation.subtotal * quotation.discountPercent) / 100;
    doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', summaryX, yPos);
  doc.text(`$${quotation.grandTotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 15;

  // Terms and Conditions
  if (quotation.termsAndConditions) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const terms = doc.splitTextToSize(quotation.termsAndConditions, pageWidth - 40);
    doc.text(terms, 20, yPos);
    yPos += terms.length * 5 + 5;
  }

  // Thank you message
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    20,
    footerY
  );
  doc.text(
    'This page is generated by software developed by Muzammil',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    `Page 1 of ${doc.getNumberOfPages()}`,
    pageWidth - 20,
    footerY,
    { align: 'right' }
  );

  return doc;
};
