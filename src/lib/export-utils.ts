export const exportToJson = (data: any, filename: string = 'data.json') => {
  const dataToExport = typeof data === 'string' ? { extractedText: data } : data;
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(dataToExport, null, 2)
  )}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToCsv = (data: string, filename: string = 'data.csv') => {
  let csvContent = '';

  // For smartExtract, data is a single string. We'll put it in one cell.
  // A more complex CSV might involve trying to parse the string if it represents tabular data.
  // For now, keep it simple: header "extracted_text" and the data string.
  const header = "extracted_text";
  const sanitizedData = `"${data.replace(/"/g, '""')}"`; // Escape double quotes
  csvContent = `${header}\n${sanitizedData}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
