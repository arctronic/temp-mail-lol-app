import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import * as XLSX from 'xlsx';
import { LookupEmailWithMessages } from '../contexts/LookupContext';

interface ExportData {
  emailAddress: string;
  sender: string;
  subject: string;
  date: string;
  message: string;
  attachmentCount: number;
}

export const exportEmailsToExcel = async (lookupEmails: LookupEmailWithMessages[]): Promise<boolean> => {
  try {
    console.log('Starting Excel export...');
    
    // Prepare data for export
    const exportData: ExportData[] = [];
    
    lookupEmails.forEach(lookupEmail => {
      lookupEmail.messages.forEach(email => {
        exportData.push({
          emailAddress: lookupEmail.address,
          sender: email.sender,
          subject: email.subject || '(No Subject)',
          date: formatDateForExcel(email.date),
          message: stripHtmlTags(email.message).substring(0, 500) + '...', // Limit message length
          attachmentCount: email.attachments ? email.attachments.length : 0
        });
      });
    });

    if (exportData.length === 0) {
      Alert.alert('No Data', 'No emails found to export.');
      return false;
    }

    console.log(`Exporting ${exportData.length} emails...`);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: ['emailAddress', 'sender', 'subject', 'date', 'message', 'attachmentCount']
    });

    // Set column headers
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Email Address', 'Sender', 'Subject', 'Date', 'Message Preview', 'Attachments']
    ], { origin: 'A1' });

    // Set column widths
    worksheet['!cols'] = [
      { width: 25 }, // Email Address
      { width: 30 }, // Sender
      { width: 40 }, // Subject
      { width: 20 }, // Date
      { width: 60 }, // Message
      { width: 12 }  // Attachments
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Emails');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'array', 
      bookType: 'xlsx' 
    });

    // Create file name with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `temp_mail_export_${timestamp}.xlsx`;
    
    // Convert buffer to base64
    const base64 = arrayBufferToBase64(excelBuffer);
    
    // Save file to device
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Excel file created:', fileUri);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Emails',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } else {
      Alert.alert(
        'Export Complete',
        `File saved to: ${fileName}\n\nYou can find it in your device's Documents folder.`,
        [{ text: 'OK' }]
      );
    }

    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    Alert.alert(
      'Export Failed',
      'Unable to export emails. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

// Helper function to format date for Excel
const formatDateForExcel = (date: { $date: string } | string): string => {
  try {
    const dateStr = typeof date === 'string' ? date : date.$date;
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Function to get export statistics
export const getExportStatistics = (lookupEmails: LookupEmailWithMessages[]) => {
  const totalEmails = lookupEmails.reduce((sum, lookup) => sum + lookup.messages.length, 0);
  const totalAddresses = lookupEmails.length;
  const totalWithAttachments = lookupEmails.reduce((sum, lookup) => 
    sum + lookup.messages.filter(email => email.attachments && email.attachments.length > 0).length, 0
  );

  return {
    totalEmails,
    totalAddresses,
    totalWithAttachments
  };
}; 