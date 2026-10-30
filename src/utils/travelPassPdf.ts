import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { TripState } from '../context/TripContext';

export async function generateTravelPassPDF(trip: TripState, userName: string = 'Valued Traveller'): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const bookingRef = trip.bookingReference || `SP-KA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Generate verified QR code
  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/plan/confirmation?ref=${bookingRef}`
    : `https://siripayana.karnataka.gov.in/verify?ref=${bookingRef}`;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#1b4332',
        light: '#ffffff',
      },
    });
  } catch (e) {
    console.warn('QR code generation error:', e);
  }

  // ==================== 1. PREMIUM HEADER BANNER ====================
  // Royal Forest Green Header
  doc.setFillColor(27, 67, 50); // #1b4332
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  // Subtle Gold Accent Pinstripe
  doc.setFillColor(212, 148, 10); // #d4940a
  doc.rect(margin, y + 32, contentWidth, 2, 'F');

  // Brand Name & Compass Symbol
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('SiriPayana', margin + 8, y + 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(240, 235, 220);
  doc.text('Official Karnataka Tourism Digital Travel Pass & Itinerary', margin + 8, y + 19);

  doc.setFontSize(8);
  doc.setTextColor(200, 215, 205);
  doc.text('Government of Karnataka Tourism Companion • Verified Planning Document', margin + 8, y + 25);

  // Header Right: QR Code & Reference Box
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 28, y + 4, 24, 24, 1.5, 1.5, 'F');
    doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 27, y + 5, 22, 22);
  }

  y += 40;

  // ==================== 2. TRAVELER & PASS MATRIX (CREAM CARD) ====================
  doc.setFillColor(250, 247, 242); // #faf7f2
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');
  doc.setDrawColor(228, 224, 215);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'D');

  const col1 = margin + 6;
  const col2 = margin + 55;
  const col3 = margin + 105;
  const col4 = margin + 145;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(108, 117, 125);
  doc.text('PRIMARY TRAVELLER', col1, y + 7);
  doc.text('TRAVEL DATES', col2, y + 7);
  doc.text('STARTING HUB', col3, y + 7);
  doc.text('PASS STATUS', col4, y + 7);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(27, 67, 50);
  doc.text(userName, col1, y + 13);
  doc.text(`${trip.preferences.duration} Days`, col2, y + 13);
  doc.text(trip.preferences.startingCity || 'Bengaluru', col3, y + 13);

  doc.setTextColor(212, 148, 10);
  doc.text('ACTIVE TRAVEL PASS', col4, y + 13);

  // Row 3 (Details)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const adults = trip.preferences.adults || 1;
  const children = trip.preferences.children || 0;
  doc.text(`${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}`, col1, y + 19);
  doc.text(`${trip.preferences.startDate} to ${trip.preferences.endDate}`, col2, y + 19);
  doc.text('Karnataka, India', col3, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 67, 50);
  doc.text(`REF: ${bookingRef}`, col4, y + 19);

  y += 34;

  // Helper for Section Headings
  const drawSectionHeader = (title: string, countLabel?: string) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(27, 67, 50);
    doc.rect(margin, y, 3, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(27, 67, 50);
    doc.text(title, margin + 6, y + 7);

    if (countLabel) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(108, 117, 125);
      doc.text(countLabel, pageWidth - margin, y + 7, { align: 'right' });
    }

    doc.setDrawColor(228, 224, 215);
    doc.line(margin, y + 11, pageWidth - margin, y + 11);
    y += 15;
  };

  // ==================== 3. DAY-BY-DAY ITINERARY ====================
  drawSectionHeader(
    '1. Day-by-Day Journey Itinerary',
    `${trip.itinerary.length} Days Planned • ${trip.selectedDestinations.length} Places`
  );

  if (trip.itinerary && trip.itinerary.length > 0) {
    trip.itinerary.forEach(day => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 15;
      }

      // Day Badge
      doc.setFillColor(245, 241, 233);
      doc.roundedRect(margin, y, 20, 8, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(27, 67, 50);
      doc.text(`DAY ${day.day}`, margin + 10, y + 5.5, { align: 'center' });

      // Destination & Timing
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(33, 37, 41);
      doc.text(day.destinationName, margin + 25, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(108, 117, 125);
      const destFee = trip.budget?.destinationFeesBreakdown?.find(m => m.destinationId === day.destinationId);
      const feeNote = destFee && destFee.totalFee > 0 ? `Entry: ₹${destFee.totalFee}` : 'Entry: Included/Free';
      doc.text(`${day.date || `Day ${day.day}`} • ${feeNote}`, pageWidth - margin, y + 5.5, { align: 'right' });

      y += 10;

      // Day Schedule details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(70, 70, 70);

      const activityItems = day.activities && day.activities.length > 0
        ? day.activities.map(a => `${a.time ? a.time + ' ' : ''}${a.title}`).join('  |  ')
        : (day.notes || 'Exploration, local culture, sightseeing & relaxation');

      const splitSchedule = doc.splitTextToSize(activityItems, contentWidth - 8);
      doc.text(splitSchedule, margin + 4, y);
      y += splitSchedule.length * 4.5 + 3;

      // Divider line
      doc.setDrawColor(240, 238, 233);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    });
  } else {
    // Fallback: Selected Destinations list
    trip.selectedDestinations.forEach((dest, idx) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 15;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(27, 67, 50);
      doc.text(`Day ${idx + 1}: ${dest.name}`, margin + 4, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Recommended duration: ${dest.duration} • Category: ${dest.reason}`, margin + 70, y);
      y += 6;
    });
  }

  y += 4;

  // ==================== 4. TRANSPORTATION & ACCOMMODATION ====================
  drawSectionHeader('2. Travel Logistics & Confirmed Services');

  // Transportation Box
  doc.setFillColor(250, 247, 242);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 28, 2, 2, 'F');
  doc.setDrawColor(228, 224, 215);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 67, 50);
  doc.text('TRANSPORTATION SUMMARY', margin + 5, y + 6);

  const selectedTransport = trip.transportOptions.filter(t => t.selected);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  if (selectedTransport.length > 0) {
    let tY = y + 11;
    selectedTransport.slice(0, 2).forEach(t => {
      doc.text(`• ${t.mode.toUpperCase()}: ${t.operator} (${t.from} → ${t.to})`, margin + 5, tY);
      tY += 5;
      doc.text(`  Est. Fare: ₹${t.groupFare.toLocaleString()} (Verified Provider Link)`, margin + 5, tY);
      tY += 5;
    });
  } else {
    doc.text('• Mode: Scenic Road & Rail Transit Route', margin + 5, y + 12);
    doc.text('• Standard state inter-city highway connectivity', margin + 5, y + 17);
    doc.text('• Verified booking links provided in trip portal', margin + 5, y + 22);
  }

  // Accommodation Box
  const accX = margin + contentWidth / 2 + 2;
  const accWidth = contentWidth / 2 - 2;

  doc.setFillColor(250, 247, 242);
  doc.roundedRect(accX, y, accWidth, 28, 2, 2, 'F');
  doc.setDrawColor(228, 224, 215);
  doc.roundedRect(accX, y, accWidth, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(27, 67, 50);
  doc.text('ACCOMMODATION SUMMARY', accX + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  if (trip.selectedHotels && trip.selectedHotels.length > 0) {
    let hY = y + 11;
    trip.selectedHotels.slice(0, 2).forEach(h => {
      doc.text(`• ${h.hotelName} (${h.destinationName})`, accX + 5, hY);
      hY += 5;
      doc.text(`  ${h.rooms} Room(s), ${h.nights} Night(s) — ₹${h.totalCost.toLocaleString()}`, accX + 5, hY);
      hY += 5;
    });
  } else {
    doc.text('• Handpicked KSTDC / Heritage homestays', accX + 5, y + 12);
    doc.text('• Central district locations near top attractions', accX + 5, y + 17);
    doc.text('• Direct front-desk booking details itemized', accX + 5, y + 22);
  }

  y += 34;

  // ==================== 5. FINANCIAL BUDGET BREAKDOWN ====================
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 15;
  }

  drawSectionHeader('3. Itemized Travel Expense Summary', 'Transparent Pricing Estimates (INR)');

  const b = trip.budget;
  const transitTotal = b.outboundTransport + b.returnTransport + b.localTransport;

  // Table Container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(228, 224, 215);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'D');

  const bColWidth = contentWidth / 5;
  const categories = [
    { label: 'TRANSIT & FUEL', val: transitTotal },
    { label: 'ACCOMMODATION', val: b.accommodation },
    { label: 'MONUMENT ENTRY', val: b.entryFees },
    { label: 'FOOD & DINING', val: b.food },
    { label: 'ACTIVITIES & TAX', val: b.activities + b.taxes },
  ];

  categories.forEach((cat, idx) => {
    const cX = margin + idx * bColWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(108, 117, 125);
    doc.text(cat.label, cX + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 37, 41);
    doc.text(`₹${cat.val.toLocaleString()}`, cX + 4, y + 13);

    if (idx < categories.length - 1) {
      doc.setDrawColor(235, 230, 220);
      doc.line(cX + bColWidth, y + 3, cX + bColWidth, y + 16);
    }
  });

  // Grand Total Banner
  doc.setFillColor(27, 67, 50);
  doc.roundedRect(margin, y + 17, contentWidth, 9, 0, 0, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL ESTIMATED TRIP EXPENSE (GROUP TOTAL)', margin + 6, y + 23);

  doc.setFontSize(10.5);
  doc.setTextColor(255, 215, 0); // Gold
  doc.text(`₹${b.total.toLocaleString()} INR`, pageWidth - margin - 6, y + 23, { align: 'right' });

  y += 34;

  // ==================== 6. OFFICIAL DISCLAIMER & NOTICE ====================
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 15;
  }

  doc.setFillColor(254, 249, 235); // Soft Warm Amber
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');
  doc.setDrawColor(245, 190, 70);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('⚠️ ESTIMATED COSTS & UNCONFIRMED RESERVATIONS NOTICE', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 53, 15);
  const disclaimerText =
    'This digital document is a personalized trip planning pass and itinerary reference generated by SiriPayana. ' +
    'Individual transport tickets (IRCTC, KSRTC) and monument admissions (ASI) must be confirmed and booked through official providers. ' +
    'All budget figures are realistic estimates intended to assist your journey planning across Karnataka.';
  doc.text(doc.splitTextToSize(disclaimerText, contentWidth - 8), margin + 4, y + 10);

  y += 24;

  // ==================== 7. FOOTER & SUPPORT CONTACT ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(27, 67, 50);
  doc.text(
    'Thank you for traveling with SiriPayana — Have an unforgettable journey across Karnataka!',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `24x7 Karnataka Tourism Helpline: 1800-425-4644  •  support@siripayana.karnataka.gov.in  •  Verification Ref: ${bookingRef}`,
    pageWidth / 2,
    pageHeight - 7,
    { align: 'center' }
  );

  // Save the PDF
  const fileName = `SiriPayana_Travel_Pass_${bookingRef}.pdf`;
  doc.save(fileName);
  return doc;
}
