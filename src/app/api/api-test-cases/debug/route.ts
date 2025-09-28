import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      sheetName,
      totalRows: data.length,
      rows: data.slice(0, 5), // First 5 rows for debugging
      firstRowColumns: Array.isArray(data[0]) ? data[0].length : 0,
      rawData: data.slice(0, 3).map((row, index) => ({
        rowIndex: index,
        columns: Array.isArray(row) ? row.length : 0,
        data: Array.isArray(row) ? row.map((cell, cellIndex) => ({
          columnIndex: cellIndex,
          type: typeof cell,
          value: String(cell).substring(0, 100),
          length: String(cell).length
        })) : []
      }))
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}