import { chromium } from 'playwright';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // URL de ta page print (local)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const printUrl = `${baseUrl}/settings/fiches/${id}/print`;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Important: attendre le rendu (API calls, fonts, etc.)
  await page.goto(printUrl, { waitUntil: 'networkidle' });

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="fiche-poste-${id}.pdf"`,
    },
  });
}
