import { parse } from 'csv-parse';
import fetch from 'node-fetch';
import fs from 'node:fs';

async function processLine(line, url) {
  const [title, description, priority, responsible, status, tags, notes, contact, attachments, due_date] = line;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
      priority,
      responsible,
      status,
      tags,
      notes,
      contact,
      attachments,
      due_date
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao fazer a requisição: ${response.statusText}`);
  }

  console.log(`Requisição para ${url} bem-sucedida.`);
}

async function processCSVFile(filePath, url) {
  const csvPath = new URL(filePath, import.meta.url);
  const stream = fs.createReadStream(csvPath);

  const csvParse = parse({
    delimiter: ',',
    skipEmptyLines: true,
    fromLine: 2 // Pule a linha do cabeçalho
  });

  const linesParse = stream.pipe(csvParse);

  let processedCount = 0;

  for await (const line of linesParse) {
    await processLine(line, url);
    processedCount++;
  }

  console.log(`Processamento concluído. Total de registros processados: ${processedCount}.`);
}

const filePath = './tasks.csv'; // Atualize o caminho do arquivo conforme necessário
const apiUrl = 'http://localhost:3333/tasks'; // Atualize com a URL correta

processCSVFile(filePath, apiUrl).catch((error) => {
  console.error(error);
});
