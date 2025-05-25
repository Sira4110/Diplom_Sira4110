/*
 * Crypto Monocle
 * Автор: Sira4110
 * GitHub: https://github.com/Sira4110/Diplom_Sira4110
 * Ліцензія: MIT
 */

class OTPEncryptor {
    constructor() {
        this.encryptedTextResult = null;
        this.textEncryptionKey = null;
        
        this.messages = {
            en: {
                enterText: "Please enter text to encrypt!",
                encryptFirst: "First encrypt the text!",
                selectFile: "Select the file to encrypt!",
                selectFiles: "Select files to decrypt!",
                keyMismatch: "Key and encrypted file have different lengths!",
                encryptedCopied: "The encrypted text is copied in Base64 format!",
                keyCopied: "The encryption key is copied in Base64 format!",
                decryptedCopied: "Decrypted text copied!",
                copyFailed: "Text could not be copied: ",
                fileExtensionError: "Error: File must be in .txt format"
            },
            ua: {
                enterText: "Будь ласка, введіть текст для шифрування!",
                encryptFirst: "Спочатку зашифруйте текст!",
                selectFile: "Виберіть файл для шифрування!",
                selectFiles: "Виберіть файли для дешифрування!",
                keyMismatch: "Ключ і зашифрований файл мають різну довжину!",
                encryptedCopied: "Зашифрований текст скопійовано у форматі Base64!",
                keyCopied: "Ключ шифрування скопійовано у форматі Base64!",
                decryptedCopied: "Дешифрований текст скопійовано!",
                copyFailed: "Не вдалося скопіювати текст: ",
                fileExtensionError: "Помилка: Файл має бути у форматі .txt"
            }
        };
    }
    
    getCurrentLanguage() {
        return localStorage.getItem('lang') || 'en';
    }
    
    getMessage(key) {
        const lang = this.getCurrentLanguage();
        return this.messages[lang][key] || this.messages['en'][key];
    }

    checkFileExtension(file) {
        const allowedExtensions = ['txt', 'text'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert(this.getMessage('fileExtensionError'));
            return false;
        }
        return true;
    }

    xorEncryptDecrypt(text, key) {
        let result = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            result[i] = text[i] ^ key[i];
        }
        return result;
    }

    encryptText() {
        const textInput = document.getElementById('inputText').value;
        if (!textInput) {
            return alert(this.getMessage('enterText'));
        }
        
        const textEncoder = new TextEncoder();
        const textArray = textEncoder.encode(textInput);
        
        let key = new Uint8Array(textArray.length);
        window.crypto.getRandomValues(key);
        
        let encryptedData = this.xorEncryptDecrypt(textArray, key);
        
        this.encryptedTextResult = encryptedData;
        this.textEncryptionKey = key;
        
        document.getElementById('encryptionResults').style.display = 'block';
    }
    
    downloadEncryptedText() {
        if (!this.encryptedTextResult || !this.textEncryptionKey) {
            return alert(this.getMessage('encryptFirst'));
        }
        
        this.downloadFile(this.encryptedTextResult, 'ciphertext.txt');
        this.downloadFile(this.textEncryptionKey, 'key.txt');
    }
    
    base64ToUint8Array(base64) {
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return array;
    }
    
    copyEncryptedText() {
        if (!this.encryptedTextResult) {
            return alert(this.getMessage('encryptFirst'));
        }
        
        const base64Encoded = btoa(String.fromCharCode.apply(null, this.encryptedTextResult));
        this.copyToClipboard(base64Encoded);
        alert(this.getMessage('encryptedCopied'));
    }
    
    copyEncryptionKey() {
        if (!this.textEncryptionKey) {
            return alert(this.getMessage('encryptFirst'));
        }
        
        const base64Key = btoa(String.fromCharCode.apply(null, this.textEncryptionKey));
        this.copyToClipboard(base64Key);
        alert(this.getMessage('keyCopied'));
    }
    
    copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error(this.getMessage('copyFailed'), err);
        }
        
        document.body.removeChild(textArea);
    }

    encryptFile() {
        let fileInput = document.getElementById('inputFile').files[0];
        if (!fileInput) return alert(this.getMessage('selectFile'));
        
        if (!this.checkFileExtension(fileInput)) return;
        
        let reader = new FileReader();
        reader.onload = (event) => {
            let textArray = new Uint8Array(event.target.result);
            let key = new Uint8Array(textArray.length);
            window.crypto.getRandomValues(key);
            let encryptedData = this.xorEncryptDecrypt(textArray, key);
            
            this.downloadFile(encryptedData, 'ciphertext.txt');
            this.downloadFile(key, 'key.txt');
        };
        reader.readAsArrayBuffer(fileInput);
    }

    decryptFile() {
        let encFile = document.getElementById('encryptedFile').files[0];
        let keyFile = document.getElementById('keyFile').files[0];
        if (!encFile || !keyFile) return alert(this.getMessage('selectFiles'));
        
        if (!this.checkFileExtension(encFile) || !this.checkFileExtension(keyFile)) return;
        
        let reader1 = new FileReader();
        let reader2 = new FileReader();
        
        reader1.onload = (event1) => {
            let encryptedData;
            let content = new Uint8Array(event1.target.result);
            let isTextFile = this.isTextFile(content);
            
            if (isTextFile) {
                let textContent = new TextDecoder().decode(content);
                try {
                    encryptedData = this.base64ToUint8Array(textContent.trim());
                } catch (e) {
                    encryptedData = content;
                }
            } else {
                encryptedData = content;
            }
            
            reader2.onload = (event2) => {
                let keyContent = new Uint8Array(event2.target.result);
                let isKeyTextFile = this.isTextFile(keyContent);
                let key;
                
                if (isKeyTextFile) {
                    let keyText = new TextDecoder().decode(keyContent);
                    try {
                        key = this.base64ToUint8Array(keyText.trim());
                    } catch (e) {
                        key = keyContent;
                    }
                } else {
                    key = keyContent;
                }
                
                if (encryptedData.length !== key.length) {
                    return alert(this.getMessage('keyMismatch'));
                }
                
                let decryptedData = this.xorEncryptDecrypt(encryptedData, key);
                
                try {
                    let decryptedText = new TextDecoder().decode(decryptedData);
                    this.showDecryptedResult(decryptedText);
                } catch (e) {
                    this.downloadFile(decryptedData, 'decrypted.txt');
                }
            };
            reader2.readAsArrayBuffer(keyFile);
        };
        reader1.readAsArrayBuffer(encFile);
    }
    
    showDecryptedResult(text) {
        let resultArea = document.getElementById('decryptionResult');
        if (!resultArea) {
            resultArea = document.createElement('div');
            resultArea.id = 'decryptionResult';
            resultArea.className = 'decryption-result';
            
            const resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            
            const resultTitle = document.createElement('h3');
            resultTitle.textContent = translations[this.getCurrentLanguage()]['otp_decryption_title'] || 'Decryption Result:';
            resultContainer.appendChild(resultTitle);
            
            const textArea = document.createElement('textarea');
            textArea.className = 'result-textarea';
            textArea.id = 'decryptedTextArea';
            textArea.readOnly = true;
            resultContainer.appendChild(textArea);
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'result-actions';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'secondary-btn';
            copyButton.textContent = translations[this.getCurrentLanguage()]['otp_copy_text_btn'] || 'Copy Result';
            copyButton.onclick = () => this.copyDecryptedText();
            buttonContainer.appendChild(copyButton);
            
            const downloadButton = document.createElement('button');
            downloadButton.className = 'secondary-btn';
            downloadButton.textContent = translations[this.getCurrentLanguage()]['otp_download_btn'] || 'Download Result';
            downloadButton.onclick = () => this.downloadDecryptedText();
            buttonContainer.appendChild(downloadButton);
            
            resultContainer.appendChild(buttonContainer);
            resultArea.appendChild(resultContainer);
            
            const decryptSection = document.querySelector('.otp_container');
            decryptSection.appendChild(resultArea);
        }
        
        document.getElementById('decryptedTextArea').value = text;
        resultArea.style.display = 'block';
    }
    
    copyDecryptedText() {
        const textArea = document.getElementById('decryptedTextArea');
        if (textArea && textArea.value) {
            this.copyToClipboard(textArea.value);
            alert(this.getMessage('decryptedCopied'));
        }
    }
    
    downloadDecryptedText() {
        const textArea = document.getElementById('decryptedTextArea');
        if (textArea && textArea.value) {
            const textEncoder = new TextEncoder();
            const textArray = textEncoder.encode(textArea.value);
            this.downloadFile(textArray, 'decrypted.txt');
        }
    }
    
    isTextFile(data) {
        const maxCheck = Math.min(data.length, 100);
        for (let i = 0; i < maxCheck; i++) {
            if ((data[i] < 32 && ![9, 10, 13].includes(data[i])) || data[i] > 126) {
                return false;
            }
        }
        return true;
    }

    downloadFile(data, filename) {
        let blob = new Blob([data], { type: 'application/octet-stream' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const otp = new OTPEncryptor();