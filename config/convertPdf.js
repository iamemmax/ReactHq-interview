const PDFDocument = require("pdfkit");

const buildPDF = (text) => {
  const doc = new PDFDocument();
  doc
    // .font("fonts/PalatinoBold.ttf")
    .fontSize(25)
    .text(text, 100, 100);
  doc.end();
};

module.exports = { buildPDF };
