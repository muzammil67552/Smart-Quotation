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

  // Friendly Header with Logo and Company Info
  if (companyProfile.logo) {
    try {
      doc.addImage(companyProfile.logo, 'PNG', pageWidth / 2 - 25, yPos, 50, 50);
      yPos += 55;
    } catch (error) {
      console.error('Error adding logo:', error);
      yPos += 5;
    }
  }

  // Company Name - Larger and more prominent
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243); // Blue color for company name
  doc.text(companyProfile.companyName, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Company Email - Clear and prominent
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Email: ${companyProfile.email}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // Company Contact
  doc.setFontSize(11);
  doc.text(`Contact: ${companyProfile.contactNumber}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Decorative line
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(0.5);
  doc.line(40, yPos, pageWidth - 40, yPos);
  yPos += 10;

  doc.setTextColor(0, 0, 0); // Reset to black for rest of document

  // Quotation Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Quotation Details (Right) and Client Details (Left)
  doc.setFontSize(10);
  
  // Client details on the left
  doc.setFont('helvetica', 'bold');
  doc.text('Client Name:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientName, 50, yPos);

  // Quotation number on the right
  doc.setFont('helvetica', 'bold');
  doc.text('Quotation Number:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quotationNumber, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;

  // Client contact on the left
  doc.setFont('helvetica', 'bold');
  doc.text('Contact:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientContact, 50, yPos);

  // Date on the right
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quotation.date).toLocaleDateString(), pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;

  // Client email on the left
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const clientEmailText = doc.splitTextToSize(quotation.clientEmail, 80);
  doc.text(clientEmailText, 50, yPos);
  yPos += 12;

  // Items Table
  const tableStartY = yPos;
  const colWidths = [15, 80, 25, 30, 30];
  const headers = ['S.No', 'Description', 'Qty', 'Unit Price (PKR)', 'Total (PKR)'];

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
    
    doc.text(`PKR ${item.unitPrice.toFixed(2)}`, xPos + 2, yPos + 6);
    xPos += colWidths[3];
    
    doc.text(`PKR ${item.total.toFixed(2)}`, xPos + 2, yPos + 6);
    
    yPos += Math.max(8, description.length * 5);
    doc.line(20, yPos, pageWidth - 20, yPos);
  });

  yPos += 8;

  // Summary
  const summaryX = pageWidth - 80;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, yPos);
  doc.text(`PKR ${quotation.subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;

  if (quotation.taxPercent > 0) {
    doc.text(`Tax (${quotation.taxPercent}%):`, summaryX, yPos);
    const taxAmount = (quotation.subtotal * quotation.taxPercent) / 100;
    doc.text(`PKR ${taxAmount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
  }

  if (quotation.discountPercent > 0) {
    doc.text(`Discount (${quotation.discountPercent}%):`, summaryX, yPos);
    const discountAmount = (quotation.subtotal * quotation.discountPercent) / 100;
    doc.text(`-PKR ${discountAmount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', summaryX, yPos);
  doc.text(`PKR ${quotation.grandTotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
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
