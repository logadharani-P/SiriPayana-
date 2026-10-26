import { jsPDF } from 'jspdf';
import { TripState } from '../context/TripContext';

export function generateTravelPassPDF(trip: TripState, userName: string = 'Valued Traveller') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner: Royal Forest Green
  doc.setFillColor(27, 67, 50); // #1b4332
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');

  // Gold accent line
  doc.setFillColor(196, 152, 42); // #c4982a
  doc.rect(margin, y + 26, pageWidth - margin * 2, 2, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('SiriPayana — Karnataka Travel Pass', margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 230);
  doc.text('AI-Powered Karnataka Tourism Companion • Itinerary Reference', margin + 6, y + 18);

  // DEMO Badge on top right
  doc.setFillColor(196, 152, 42);
  doc.roundedRect(pageWidth - margin - 38, y + 6, 32, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(27, 67, 50);
  doc.text('DEMO PASS', pageWidth - margin - 22, y + 12, { align: 'center' });

  y += 34;

  // Itinerary Details Card
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, 'F');
  doc.setDrawColor(220, 215, 200);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 67, 50);

  doc.text('REFERENCE NUMBER:', margin + 6, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(trip.bookingReference || 'SP-KA-2026-DEMO-001', margin + 50, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('PRIMARY TRAVELLER:', margin + 6, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`${userName} (${trip.preferences.adults} Adults${trip.preferences.children > 0 ? `, ${trip.preferences.children} Children` : ''})`, margin + 50, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('JOURNEY DATES:', margin + 6, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(`${trip.preferences.startDate} to ${trip.preferences.endDate} (${trip.preferences.duration} Days)`, margin + 50, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('ORIGIN CITY:', margin + 115, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(trip.preferences.startingCity || 'Bengaluru', margin + 145, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING STATUS:', margin + 115, y + 15);
  doc.setTextColor(196, 152, 42);
  doc.text('DEMO CONFIRMED', margin + 152, y + 15);

  y += 32;

  // Section 1: Selected Destinations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 67, 50);
  doc.text(`1. Selected Destinations (${trip.selectedDestinations.length} Places)`, margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  trip.selectedDestinations.forEach((dest, idx) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${dest.name}`, margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Duration: ${dest.duration} • Category: ${dest.reason}`, margin + 80, y + 5);
    y += 8;
  });

  y += 4;

  // Section 2: Transportation Selections
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 67, 50);
  doc.text('2. Transportation Summary', margin, y);
  y += 6;

  const selectedTransport = trip.transportOptions.filter(t => t.selected);
  if (selectedTransport.length > 0) {
    selectedTransport.forEach(t => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`• ${t.mode.toUpperCase()}: ${t.operator} (${t.from} -> ${t.to})`, margin + 4, y + 4);
      doc.text(`Fare: Rs. ${t.groupFare.toLocaleString()}`, margin + 140, y + 4);
      y += 7;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('• Standard road/rail transit estimate based on group route.', margin + 4, y + 4);
    y += 7;
  }

  y += 4;

  // Section 3: Accommodation Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 67, 50);
  doc.text('3. Accommodation Summary', margin, y);
  y += 6;

  if (trip.selectedHotels.length > 0) {
    trip.selectedHotels.forEach(h => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`• ${h.hotelName} (${h.destinationName})`, margin + 4, y + 4);
      doc.text(`${h.rooms} Room(s), ${h.nights} Night(s) — Rs. ${h.totalCost.toLocaleString()}`, margin + 110, y + 4);
      y += 7;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('• Standard comfortable hotel accommodation estimate included.', margin + 4, y + 4);
    y += 7;
  }

  y += 4;

  // Section 4: Budget Breakdown Summary Box
  doc.setFillColor(245, 245, 242);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'F');
  doc.setDrawColor(210, 210, 205);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 67, 50);
  doc.text('FINANCIAL BUDGET SUMMARY', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  const b = trip.budget;
  doc.text(`Transport Total: Rs. ${(b.outboundTransport + b.returnTransport + b.localTransport).toLocaleString()}`, margin + 6, y + 14);
  doc.text(`Stays Total: Rs. ${b.accommodation.toLocaleString()}`, margin + 65, y + 14);
  doc.text(`Monuments Entry: Rs. ${b.entryFees.toLocaleString()}`, margin + 125, y + 14);

  doc.text(`Food & Dining: Rs. ${b.food.toLocaleString()}`, margin + 6, y + 21);
  doc.text(`Activities & Taxes: Rs. ${(b.activities + b.taxes).toLocaleString()}`, margin + 65, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(196, 152, 42);
  doc.text(`GRAND TOTAL: Rs. ${b.total.toLocaleString()}`, margin + 125, y + 22);

  y += 34;

  // Official Notice / Disclaimer (Mandatory Requirement)
  doc.setFillColor(254, 243, 199); // Soft yellow/gold tint
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('IMPORTANT NOTICE & ITINERARY DISCLAIMER (DEMO)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const disclaimerText =
    'This SiriPayana Travel Pass is an AI-generated itinerary reference and planning document for demonstration purposes. ' +
    'This pass does NOT serve as an official ticket for trains, buses, flights, or monument entry. Please obtain verified ' +
    'tickets directly from official authorities (IRCTC, KSRTC, ASI) using the links provided in your SiriPayana trip summary.';
  doc.text(doc.splitTextToSize(disclaimerText, pageWidth - margin * 2 - 8), margin + 4, y + 12);

  // Footer Branding
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} • SiriPayana Karnataka Tourism Companion • Reference: ${trip.bookingReference || 'SP-KA-2026-DEMO'}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Save PDF file
  const fileName = `SiriPayana_Travel_Pass_${trip.bookingReference || 'KA-DEMO'}.pdf`;
  doc.save(fileName);
}
