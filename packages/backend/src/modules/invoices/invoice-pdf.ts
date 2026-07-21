import PDFDocument from 'pdfkit';

// ─── Types ──────────────────────────────────

interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  from: {
    name: string;
    address?: string;
    gstin?: string;
    pan?: string;
    email?: string;
    phone?: string;
  };
  to: {
    name: string;
    address?: string;
    gstin?: string;
  };
  items: Array<{
    description: string;
    hsnCode?: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    amount: number;
  }>;
  subtotal: number;
  discountPercent?: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
}

// ─── PDF Generator ──────────────────────────

export function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#059669').text('INVOICE', 40, 40);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
    doc.text(`#${data.invoiceNumber}`, 40, 68);

    // Status badge
    const statusColors: Record<string, string> = {
      PENDING: '#f59e0b',
      PAID: '#10b981',
      PARTIAL: '#3b82f6',
      CANCELLED: '#ef4444',
    };
    const statusColor = statusColors[data.status] || '#6b7280';
    doc.roundedRect(420, 40, 70, 22, 4).fill(statusColor);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text(data.status, 425, 46, { width: 60, align: 'center' });

    // ── From / To ──
    let y = 90;
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#9ca3af').text('FROM', 40, y);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.from.name, 40, y + 14);
    y += 28;
    doc.fontSize(9).font('Helvetica').fillColor('#4b5563');
    if (data.from.address) {
      doc.text(data.from.address, 40, y, { width: 200 });
      y += 14;
    }
    if (data.from.gstin) {
      doc.text(`GSTIN: ${data.from.gstin}`, 40, y);
      y += 14;
    }
    if (data.from.email) {
      doc.text(data.from.email, 40, y);
      y += 14;
    }

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#9ca3af').text('BILL TO', 320, 90);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text(data.to.name, 320, 104);
    let y2 = 118;
    doc.fontSize(9).font('Helvetica').fillColor('#4b5563');
    if (data.to.address) {
      doc.text(data.to.address, 320, y2, { width: 200 });
      y2 += 14;
    }
    if (data.to.gstin) {
      doc.text(`GSTIN: ${data.to.gstin}`, 320, y2);
    }

    // ── Dates ──
    y = Math.max(y, y2) + 20;
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
    doc.text(`Issue Date: ${data.issueDate}`, 40, y);
    doc.text(`Due Date: ${data.dueDate}`, 320, y);

    // ── Table ──
    y += 25;
    const tableTop = y;
    const colX = [40, 260, 320, 370, 430, 490];
    const colWidths = [220, 60, 50, 50, 60, 55];

    // Header
    doc.rect(40, y, 515, 24).fill('#f3f4f6');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#374151');
    const headers = ['DESCRIPTION', 'HSN', 'QTY', 'RATE', 'GST %', 'AMOUNT'];
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 4, y + 7, { width: colWidths[i], align: i >= 1 ? 'right' : 'left' });
    });

    y += 28;

    // Rows
    doc.font('Helvetica').fontSize(9).fillColor('#111827');
    for (const item of data.items) {
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
      doc.text(item.description, colX[0] + 4, y, { width: colWidths[0], ellipsis: true });
      doc.text(item.hsnCode || '—', colX[1] + 4, y, { width: colWidths[1], align: 'right' });
      doc.text(item.quantity.toString(), colX[2] + 4, y, { width: colWidths[2], align: 'right' });
      doc.text(`₹${item.unitPrice.toLocaleString('en-IN')}`, colX[3] + 4, y, {
        width: colWidths[3],
        align: 'right',
      });
      doc.text(`${item.gstRate}%`, colX[4] + 4, y, { width: colWidths[4], align: 'right' });
      doc.text(`₹${item.amount.toLocaleString('en-IN')}`, colX[5] + 4, y, {
        width: colWidths[5],
        align: 'right',
      });
      y += 22;
    }

    // ── Totals ──
    y += 10;
    doc.moveTo(370, y).lineTo(555, y).stroke('#e5e7eb');
    y += 10;

    const drawTotal = (label: string, value: string, bold = false) => {
      doc
        .fontSize(9)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor('#374151');
      doc.text(label, 370, y, { width: 120, align: 'right' });
      doc.text(value, 495, y, { width: 55, align: 'right' });
      y += 18;
    };

    drawTotal('Subtotal', `₹${data.subtotal.toLocaleString('en-IN')}`);
    if (data.discountAmount > 0) {
      drawTotal(
        `Discount (${data.discountPercent}%)`,
        `-₹${data.discountAmount.toLocaleString('en-IN')}`,
      );
    }
    if (data.cgst > 0) drawTotal('CGST', `₹${data.cgst.toLocaleString('en-IN')}`);
    if (data.sgst > 0) drawTotal('SGST', `₹${data.sgst.toLocaleString('en-IN')}`);
    if (data.igst > 0) drawTotal('IGST', `₹${data.igst.toLocaleString('en-IN')}`);

    y += 5;
    doc.rect(370, y, 185, 28).fill('#ecfdf5');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#059669');
    doc.text('TOTAL', 370, y + 7, { width: 120, align: 'right' });
    doc.text(`₹${data.total.toLocaleString('en-IN')}`, 495, y + 7, { width: 55, align: 'right' });
    y += 38;

    if (data.amountPaid > 0) {
      drawTotal('Amount Paid', `-₹${data.amountPaid.toLocaleString('en-IN')}`);
      drawTotal('Balance Due', `₹${data.balanceDue.toLocaleString('en-IN')}`, true);
    }

    // ── Notes / Terms ──
    y += 20;
    if (data.notes && y < 700) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#9ca3af').text('NOTES', 40, y);
      y += 14;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(data.notes, 40, y, { width: 515 });
      y += doc.heightOfString(data.notes, { width: 515 }) + 10;
    }

    if (data.terms && y < 700) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#9ca3af').text('TERMS & CONDITIONS', 40, y);
      y += 14;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(data.terms, 40, y, { width: 515 });
    }

    // ── Footer ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor('#9ca3af');
      doc.text('Thank you for your business!', 40, 780, { align: 'center', width: 515 });
    }

    doc.end();
  });
}
