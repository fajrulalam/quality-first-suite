import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const testResults = await request.json();
    
    if (!Array.isArray(testResults) || testResults.length === 0) {
      return NextResponse.json({ error: 'No test results provided' }, { status: 400 });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = [
      ['API Name', 'Test Case', 'Parameters', 'HTTP Status', 'Response', 'cURL Command'],
      ...testResults.map(result => [
        result.apiName || '',
        result.testCase || '',
        result.parameters || '',
        result.httpStatus || '',
        result.response || '',
        result.curlCommand || ''
      ])
    ];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // API Name
      { wch: 25 }, // Test Case
      { wch: 50 }, // Parameters  
      { wch: 12 }, // HTTP Status
      { wch: 40 }, // Response
      { wch: 100 } // cURL Command
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'API Test Results');
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });
    
    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="api-test-results-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
    
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}