import { NextResponse } from "next/server";
import * as XLSX from "xlsx";


export async function GET() {
  try {
    // Create template data with headers and example
    const templateData = [
      ["API Name", "cURL", "Variables"],
      [
        "Hotel Search API",
        `curl 'https://api.example.com/hotel/search' -H 'Content-Type: application/json' --data '{"searchType":"CITY","adult":2,"taxDisplay":"abt"}'`,
        'searchType("CITY","REGION","AREA"),adult(1,2,5),taxDisplay("abt","aat")',
      ],
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 }, // API Name
      { wch: 80 }, // cURL Command
      { wch: 70 }, // Variables
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Return the Excel template
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="api-test-template.xlsx"',
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template file" },
      { status: 500 }
    );
  }
}
