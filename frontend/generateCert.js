// generateCert.js
import { writeFileSync } from 'fs';
import { generateKeyPairSync, createSign, createPrivateKey, createPublicKey } from 'crypto';
import selfsigned from 'selfsigned';

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

writeFileSync('localhost-key.pem', pems.private);
writeFileSync('localhost-cert.pem', pems.cert);

console.log('✅ HTTPS certificates created: localhost-key.pem & localhost-cert.pem');
