/**
 * Gerador de QR Code PIX para pagamentos
 */

import QRCode from 'qrcode';
import { AttachmentBuilder } from 'discord.js';

export interface PixPaymentData {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  transactionId: string;
  description?: string;
}

/**
 * Gera código PIX EMV (Copia e Cola)
 */
export function generatePixEMV(data: PixPaymentData): string {
  const { pixKey, merchantName, merchantCity, amount, transactionId, description } = data;

  // Formato simplificado de PIX EMV QR Code (BR Code)
  // Este é um formato básico - em produção, use uma biblioteca específica como 'pix-utils'
  
  const formatCurrency = (value: number) => value.toFixed(2);
  
  // Payload Format Indicator
  let payload = '000201'; // Versão do payload
  
  // Merchant Account Information
  payload += '26'; // ID do campo
  const pixKeyField = `0014br.gov.bcb.pix01${pixKey.length.toString().padStart(2, '0')}${pixKey}`;
  payload += pixKeyField.length.toString().padStart(2, '0') + pixKeyField;
  
  // Merchant Category Code
  payload += '52040000'; // Categoria
  
  // Transaction Currency
  payload += '5303986'; // BRL
  
  // Transaction Amount
  const amountStr = formatCurrency(amount);
  payload += '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
  
  // Country Code
  payload += '5802BR'; // Brasil
  
  // Merchant Name
  const merchantNameTrunc = merchantName.substring(0, 25);
  payload += '59' + merchantNameTrunc.length.toString().padStart(2, '0') + merchantNameTrunc;
  
  // Merchant City
  const merchantCityTrunc = merchantCity.substring(0, 15);
  payload += '60' + merchantCityTrunc.length.toString().padStart(2, '0') + merchantCityTrunc;
  
  // Additional Data
  if (description || transactionId) {
    let additionalData = '';
    
    if (transactionId) {
      const txId = transactionId.substring(0, 25);
      additionalData += '05' + txId.length.toString().padStart(2, '0') + txId;
    }
    
    if (additionalData) {
      payload += '62' + additionalData.length.toString().padStart(2, '0') + additionalData;
    }
  }
  
  // CRC16
  payload += '6304';
  const crc = calculateCRC16(payload);
  payload += crc;
  
  return payload;
}

/**
 * Calcula CRC16 CCITT para PIX
 */
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera QR Code PIX como attachment do Discord
 */
export async function generatePixQRCode(pixEMV: string): Promise<AttachmentBuilder> {
  try {
    // Gerar QR Code como buffer
    const qrBuffer = await QRCode.toBuffer(pixEMV, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Criar attachment para Discord
    const attachment = new AttachmentBuilder(qrBuffer, { name: 'pix-qrcode.png' });
    
    return attachment;
  } catch (error) {
    console.error('Erro ao gerar QR Code PIX:', error);
    throw new Error('Falha ao gerar QR Code PIX');
  }
}

/**
 * Gera dados de PIX a partir de preferência do Mercado Pago
 * (Usando Mercado Pago para gerar PIX real com QR Code)
 */
export async function generateMercadoPagoPixQRCode(initPoint: string): Promise<{
  qrCode: string;
  qrCodeBase64: string;
  copyPasteCode: string;
}> {
  // Esta função seria chamada após criar a preferência no Mercado Pago
  // O Mercado Pago retorna o QR Code já pronto
  // Por enquanto, retorno um placeholder
  
  throw new Error('Implementar com SDK do Mercado Pago - usar Payment com método PIX');
}

/**
 * Valida chave PIX
 */
export function validatePixKey(pixKey: string): { valid: boolean; type?: string } {
  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(pixKey)) {
    return { valid: true, type: 'email' };
  }
  
  // CPF
  const cpfRegex = /^\d{11}$/;
  if (cpfRegex.test(pixKey.replace(/\D/g, ''))) {
    return { valid: true, type: 'cpf' };
  }
  
  // CNPJ
  const cnpjRegex = /^\d{14}$/;
  if (cnpjRegex.test(pixKey.replace(/\D/g, ''))) {
    return { valid: true, type: 'cnpj' };
  }
  
  // Telefone
  const phoneRegex = /^\+?\d{10,15}$/;
  if (phoneRegex.test(pixKey.replace(/\D/g, ''))) {
    return { valid: true, type: 'phone' };
  }
  
  // Chave aleatória (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(pixKey)) {
    return { valid: true, type: 'random' };
  }
  
  return { valid: false };
}
