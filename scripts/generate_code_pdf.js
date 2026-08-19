import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'Menakkhi_Saree_Ecommerce_All_Code.pdf');

// List of target files and directories to include
const filePathsToInclude = [
  'supabase_schema.sql',
  'package.json',
  'vite.config.ts',
  'index.html',
  'src/App.tsx',
  'src/main.tsx',
  'src/supabaseClient.ts',
  'src/types/database.ts',
  'src/utils/errorHandling.ts',
  'src/utils/networkRetry.ts',
  'src/hooks/useCartActions.ts',
  'src/hooks/useNetworkStatus.ts',
  'src/components/Navbar.tsx',
  'src/components/Hero.tsx',
  'src/components/ProductCard.tsx',
  'src/components/ProductGrid.tsx',
  'src/components/FeaturedLanes.tsx',
  'src/components/CheckoutForm.tsx',
  'src/components/SearchBar.tsx',
  'src/components/Footer.tsx',
  'src/components/Subscribe.tsx',
  'src/components/ProtectedRoute.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/OrderSkeleton.tsx',
  'src/components/ScrollToTop.tsx',
  'src/pages/Home.tsx',
  'src/pages/Products.tsx',
  'src/pages/ProductDetails.tsx',
  'src/pages/Cart.tsx',
  'src/pages/CategoryPage.tsx',
  'src/pages/Orders.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Admin.tsx',
  'src/index.css',
  'src/App.css',
];

async function generatePDF() {
  console.log('Generating complete codebase PDF...');

  const doc = new PDFDocument({
    margin: 36,
    size: 'A4',
    bufferPages: true,
  });

  const stream = fs.createWriteStream(outputFile);
  doc.pipe(stream);

  // Title Page
  doc
    .rect(0, 0, doc.page.width, doc.page.height)
    .fill('#4c0519'); // Dark Rose/Maroon background

  doc
    .fillColor('#fef3c7') // Amber light
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('Menakkhi Sarees E-Commerce', 36, 220, { align: 'center' });

  doc
    .fillColor('#ffffff')
    .fontSize(16)
    .font('Helvetica')
    .text('Complete Source Code & Supabase Database Migration Manual', 36, 260, { align: 'center' });

  doc
    .fillColor('#fecdd3')
    .fontSize(11)
    .text(`Generated on: ${new Date().toLocaleString()}`, 36, 310, { align: 'center' });

  doc
    .fontSize(10)
    .fillColor('#ffffff')
    .text('Stack: React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL RLS', 36, 340, { align: 'center' });

  let pageCount = 0;

  for (let i = 0; i < filePathsToInclude.length; i++) {
    const relPath = filePathsToInclude[i];
    const fullPath = path.join(rootDir, relPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${relPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    doc.addPage();
    pageCount++;

    // File Banner Header
    doc
      .rect(36, 30, doc.page.width - 72, 32)
      .fill('#881337'); // Rose banner

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`File: ${relPath}`, 46, 40);

    doc.moveDown(2);

    // Render Source Code text
    doc
      .font('Courier')
      .fontSize(7.5)
      .fillColor('#111827');

    const lines = content.split('\n');
    let y = 75;

    for (let l = 0; l < lines.length; l++) {
      const lineText = `${(l + 1).toString().padStart(4, ' ')} | ${lines[l]}`;

      if (y > doc.page.height - 45) {
        doc.addPage();
        pageCount++;

        // Header repeat
        doc
          .rect(36, 30, doc.page.width - 72, 24)
          .fill('#9f1239');

        doc
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(`File: ${relPath} (continued)`, 46, 37);

        doc
          .font('Courier')
          .fontSize(7.5)
          .fillColor('#111827');

        y = 65;
      }

      doc.text(lineText, 36, y, { width: doc.page.width - 72, wrap: true });
      y += 9.5;
    }
  }

  // Footer / Page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#6b7280')
        .text(`Menakkhi Sarees Codebase PDF - Page ${i + 1} of ${pages.count}`, 36, doc.page.height - 25, {
          align: 'center',
        });
    }
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`Successfully generated PDF: ${outputFile}`);
  });
}

generatePDF().catch(console.error);
