import React from "react";

export const metadata = {
  title: "Privacy Policy for Test Case Documentation Helper",
};

const PrivacyPolicyPage = () => {
  return (
    <>
      <style>{`
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2 {
            color: #202124;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        h1 {
            font-size: 2em;
        }
        h2 {
            font-size: 1.5em;
            margin-top: 30px;
        }
        p {
            margin-bottom: 15px;
        }
        strong {
            color: #1a73e8;
        }
        code {
            background-color: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 0.9em;
            color: #5f6368;
        }
    `}</style>
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Add-on Name:</strong> Test Case Documentation Helper
        </p>
        <p>
          <strong>Effective Date:</strong> September 29, 2025
        </p>

        <h2>Introduction</h2>
        <p>
          This Privacy Policy outlines how the &quot;Test Case Documentation
          Helper&quot; Google Sheets Add-on handles your data. Your privacy is
          critically important to us. Our guiding principle is to be transparent
          and to ensure that your data remains your own.
        </p>
        <p>
          This Add-on is designed to operate entirely within your Google
          Account.{" "}
          <strong>
            We do not have a server, we do not collect, and we do not store any
            of your personal information or data.
          </strong>
        </p>

        <h2>How the Add-on Works &amp; Handles Data</h2>
        <p>
          The sole purpose of this Add-on is to streamline your workflow by
          connecting your Google Sheet to your Google Drive. Here is exactly
          what happens when you use it:
        </p>
        <ul>
          <li>
            <strong>Reading Spreadsheet Data:</strong> The Add-on reads the text
            value from Column A of your currently selected row. This text is
            used exclusively to generate a filename for the image you are
            uploading.
          </li>
          <li>
            <strong>Accessing Clipboard Data:</strong> When you paste an image
            into the Add-on&apos;s sidebar, the image data is processed
            temporarily by your browser to prepare it for upload.
          </li>
          <li>
            <strong>Uploading to Your Google Drive:</strong> The Add-on uploads
            the image from your clipboard directly to a Google Drive folder that{" "}
            <strong>you specify and control</strong>. The file and its contents
            are never transmitted to any third-party server.
          </li>
          <li>
            <strong>Writing to Your Spreadsheet:</strong> After a successful
            upload, the Add-on creates a hyperlink to the new file in your
            Google Drive and inserts this link into the cell you have selected.
          </li>
        </ul>
        <p>
          All data processed by this Add-on—your spreadsheet content and your
          image files—remains within your Google Account and is subject to{" "}
          <a href="https://policies.google.com/privacy" target="_blank">
            Google&apos;s Privacy Policy
          </a>
          .
        </p>

        <h2>Permissions Required (OAuth Scopes)</h2>
        <p>
          To function, the Add-on requires your authorization for the following
          permissions. We only request the minimum permissions necessary:
        </p>
        <ul>
          <li>
            <code>https://www.googleapis.com/auth/script.container.ui</code>
            <br />
            This permission is required to display the sidebar interface within
            Google Sheets.
          </li>
          <li>
            <code>https://www.googleapis.com/auth/spreadsheets</code>
            <br />
            This allows the Add-on to read cell values for file naming and to
            write the resulting hyperlink back into your selected cell.
          </li>
          <li>
            <code>https://www.googleapis.com/auth/drive</code>
            <br />
            This permission is essential for the core functionality: validating
            the destination folder you provide and uploading the image file into
            that folder within your own Google Drive.
          </li>
        </ul>

        <h2>Data Storage and Sharing</h2>
        <p>
          The &quot;Test Case Documentation Helper&quot; Add-on is a client-side
          tool. It does not have its own database or server-side storage. It
          does not collect, store, or share any of your Personally Identifiable
          Information (PII), spreadsheet data, or files with any third parties.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy in the future if the Add-on&apos;s
          functionality changes. We will notify you of any significant changes
          by updating the policy within our Google Workspace Marketplace
          listing. We encourage you to review this policy periodically.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact the developer:
        </p>
        <p>
          <strong>M Fajrul Alam</strong>
        </p>
        <p>
          Email: <strong>fajrulalam01@gmail.com</strong>
        </p>

        <div className="footer">
          <p>Thank you for using Test Case Documentation Helper.</p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
